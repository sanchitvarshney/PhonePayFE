import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import MaterialInvardUploadDocumentDrawer from "@/components/Drawers/wearhouse/MaterialInvardUploadDocumentDrawer";

import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  clearaddressdetail,
  getLocationAsync,
  getVendorAddress,
  getVendorAsync,
  getVendorBranchAsync,
  uploadInvoiceFile,
} from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import { createRawMin, deletefile, resetDocumentFile, resetFormData, storeDocumentFile, storeFormdata } from "@/features/wearhouse/Rawmin/RawMinSlice";
import { getPertCodesync } from "@/features/production/MaterialRequestWithoutBom/MRRequestWithoutBomSlice";
import { CreateRawMinPayloadType } from "@/features/wearhouse/Rawmin/RawMinType";
import { getCostCenter, getCurrency } from "@/features/common/commonSlice";
import {
  Autocomplete,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GetRowIdParams } from "ag-grid-community";
import SelectVendor, { VendorData } from "@/components/reusable/SelectVendor";
import { replaceBrWithNewLine } from "@/utils/replacebrtag";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import FileUploader from "@/components/reusable/FileUploader";
import { LoadingButton } from "@mui/lab";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Icons } from "@/components/icons";
import { showToast } from "@/utils/toasterContext";
import ConfirmationModel from "@/components/reusable/ConfirmationModel";
import Success from "@/components/reusable/Success";
import * as XLSX from "xlsx";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";

type FormData = {
  pickLocation: { label: string; value: string } | null;
  costCenter: { label: string; value: string } | null;
  vendorType: string;
  vendor: VendorData | null;
  vendorBranch: string;
  vendorAddress: string;
  gstin: string;
  doucmentDate: Dayjs | null;
  documentId: string;
};

type ExcelGridRow = {
  rowKey: string;
  lineNo: number;
  partcode: string;
  qty: number;
  boxId: string;
  challanRefNo: string;
  challanDate: string;
  courierName: string;
  docketNo: string;
  receiveDate: string;
  inwardPriceInr: number;
  remarks: string;
};

// Normalizes header names so we can match flexibly against the template
const normalizeHeader = (header: string) =>
  header
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/\./g, "")
    .replace(/\//g, "");

const formatDateFromParts = (day: number, month: number, year: number): string => {
  const d = String(day).padStart(2, "0");
  const m = String(month).padStart(2, "0");
  return `${d}-${m}-${year}`;
};

const parseExcelDateValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed?.d && parsed?.m && parsed?.y) {
      return formatDateFromParts(parsed.d, parsed.m, parsed.y);
    }
    return String(value);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dayjs(value).format("DD-MM-YYYY");
  }

  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw) return "";

  if (/^\d+(\.\d+)?$/.test(raw)) {
    const serial = Number(raw);
    if (Number.isFinite(serial)) {
      const parsed = XLSX.SSF.parse_date_code(serial);
      if (parsed?.d && parsed?.m && parsed?.y) {
        return formatDateFromParts(parsed.d, parsed.m, parsed.y);
      }
    }
  }

  const sepMatch = /^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})$/.exec(raw);
  if (sepMatch) {
    let a = Number(sepMatch[1]);
    const b = Number(sepMatch[2]);
    let c = Number(sepMatch[3]);

    if (a > 999) {
      return formatDateFromParts(c, b, a);
    }
    if (c < 100) c += 2000;
    return formatDateFromParts(a, b, c);
  }

  const asDayjs = dayjs(raw);
  if (asDayjs.isValid()) {
    return asDayjs.format("DD-MM-YYYY");
  }

  return typeof value === "string" ? raw : "";
};

const getOptionValue = (option: unknown): string => {
  if (typeof option === "string") return option.trim();
  if (typeof option === "number") return String(option);
  const obj = option as
    | {
        value?: string | number;
        id?: string | number;
        code?: string | number;
        key?: string | number;
        costCenterId?: string | number;
        locationId?: string | number;
        label?: string | number;
        text?: string | number;
        name?: string | number;
      }
    | null
    | undefined;
  const candidates = [
    obj?.value,
    obj?.id,
    obj?.code,
    obj?.key,
    obj?.costCenterId,
    obj?.locationId,
    obj?.label,
    obj?.text,
    obj?.name,
  ];
  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null) {
      const normalized = String(candidate).trim();
      if (normalized) return normalized;
    }
  }
  return "";
};

const getDuplicatePartcodeMessages = (rows: ExcelGridRow[]): string[] => {
  const partcodeMap = new Map<string, { display: string; lines: number[] }>();
  rows.forEach((row) => {
    const display = String(row.partcode ?? "").trim();
    const normalized = display.toLowerCase();
    if (!normalized) return;
    const existing = partcodeMap.get(normalized);
    if (existing) {
      existing.lines.push(row.lineNo + 1);
      return;
    }
    partcodeMap.set(normalized, { display, lines: [row.lineNo + 1] });
  });

  return Array.from(partcodeMap.values())
    .filter((entry) => entry.lines.length > 1)
    .map(
      (entry) =>
        `Duplicate Partcode '${entry.display}' found at rows ${entry.lines.join(", ")}.`
    );
};

// Keys we expect in normalized form, and the human‑readable label for error messages.
// Note: "Courier Name" is treated as OPTIONAL for validation – if present it will show in preview,
// but we don't block upload when it's missing.
const EXPECTED_HEADERS: { normKey: string; label: string }[] = [
  { normKey: "partcode", label: "Partcode" },
  { normKey: "qty", label: "Qty" },
  { normKey: "boxid", label: "BoxID" },
  { normKey: "challanrefno", label: "Challan/ Ref. No" },
  { normKey: "challandate", label: "Challan Date" },
  { normKey: "docketno", label: "Docket No" },
  { normKey: "receivedate", label: "Receive Date" },
  { normKey: "inwardpriceinr", label: "Inward Price (INR)" },
  { normKey: "remarks", label: "Remarks" },
];

const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1 MB

const GoodSpareInwardv2: React.FC = () => {
  const DownloadIcon = Icons.download;
  const [filename, setFilename] = useState<string>("");
  const [alert, setAlert] = useState<boolean>(false);
  const [file, setfile] = useState<File[] | null>(null);
  const [minNo, setMinno] = useState<string>("");
  const [upload, setUpload] = useState<boolean>(false);

  const [excelFileName, setExcelFileName] = useState<string>("");
  const [excelRows, setExcelRows] = useState<ExcelGridRow[]>([]);
  const [excelHeaderErrors, setExcelHeaderErrors] = useState<string[]>([]);
  const [excelRowErrors, setExcelRowErrors] = useState<string[]>([]);
  const [excelFileError, setExcelFileError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { VendorBranchData, venderaddressdata, uploadInvoiceFileLoading, locationData } = useAppSelector(
    (state) => state.divicemin
  );
  const { documnetFileData, createminLoading, formdata } = useAppSelector((state) => state.rawmin);
  // const { costCenterData, costCenterLoading } = useAppSelector((state) => state.common);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      pickLocation: null,
      costCenter: null,
      vendorType: "V01",
      vendor: null,
      vendorBranch: "",
      vendorAddress: "",
      gstin: "",
      doucmentDate: null,
      documentId: "",
    },
  });

  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Form Details", "Add Component Details", "Review & Submit"];

  const downloadSampleFile = () => {
    const sampleRows = [
      {
        Partcode: "PARTCODE001",
        Qty: 10,
        BoxID: "BOX-1001",
        "Challan/ Ref. No": "CHL-12345",
        "Challan Date": "15-04-2026",
        "Curier Name": "BlueDart",
        "Docket No": "DCKT-7890",
        "Receive Date": "16-04-2026",
        "Inward Price (INR)": 1250,
        Remarks: "Sample row 1",
      },
      {
        Partcode: "PARTCODE002",
        Qty: 5,
        BoxID: "BOX-1002",
        "Challan/ Ref. No": "CHL-12346",
        "Challan Date": "15-04-2026",
        "Curier Name": "Delhivery",
        "Docket No": "DCKT-7891",
        "Receive Date": "16-04-2026",
        "Inward Price (INR)": 980,
        Remarks: "Sample row 2",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GoodSpareInward");
    XLSX.writeFile(wb, "good_spare_inward_sample.xlsx");
  };

  const pickLocationOptions = useMemo(() => {
    if (!locationData?.length) return [];
    return locationData.map((item) => ({
      label: String((item as any).text ?? (item as any).name ?? (item as any).label ?? ""),
      value: String(
        (item as any).id ??
          (item as any).code ??
          (item as any).value ??
          (item as any).key ??
          ""
      ),
    }));
  }, [locationData]);

  // const costCenterOptions = useMemo(() => {
  //   if (!costCenterData?.length) return [];
  //   return costCenterData.map((item) => ({
  //     label: String((item as any).text ?? (item as any).name ?? (item as any).label ?? ""),
  //     value: String(
  //       (item as any).id ??
  //         (item as any).code ??
  //         (item as any).value ??
  //         (item as any).key ??
  //         (item as any).text ??
  //         ""
  //     ),
  //   }));
  // }, [costCenterData]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const resetExcelState = () => {
    setExcelRows([]);
    setExcelHeaderErrors([]);
    setExcelRowErrors([]);
    setExcelFileError(null);
    setExcelFileName("");
  };

  const resetall = () => {
    resetExcelState();
    reset();
    dispatch(resetDocumentFile());
    setFilename("");
    setfile(null);
    dispatch(clearaddressdetail());
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!documnetFileData || documnetFileData.length === 0) {
      showToast("Please Upload Invoice Documents", "error");
      return;
    }
    const selectedCostCenter =
      getOptionValue(data.costCenter) || getOptionValue(getValues("costCenter"));
    if (!selectedCostCenter) {
      showToast("Cost center is required", "error");
      return;
    }

    const selectedPickLocation =
      getOptionValue(data.pickLocation) || getOptionValue(getValues("pickLocation"));
    if (!selectedPickLocation) {
      showToast("Drop location is required", "error");
      return;
    }
    dispatch(storeFormdata(data));
    handleNext();
  };

  const validateAndSetExcelRows = (rows: any[]) => {
    const headerErrors: string[] = [];
    const rowErrors: string[] = [];

    if (!rows || rows.length === 0) {
      headerErrors.push("No data found in the Excel file.");
      setExcelHeaderErrors(headerErrors);
      setExcelRowErrors(rowErrors);
      setExcelRows([]);
      return;
    }

    const firstRow = rows[0] as Record<string, any>;
    const headerKeys = Object.keys(firstRow);

    // Build a map from normalized header -> actual header text
    const headerMap: Record<string, string> = {};
    headerKeys.forEach((key) => {
      headerMap[normalizeHeader(key)] = key;
    });

    const hasReceiveDateHeader = Boolean(
      headerMap.receivedate || headerMap.recieveddate || headerMap.recievedate
    );
    const missingHeaders = EXPECTED_HEADERS.filter((h) => {
      if (h.normKey === "receivedate") {
        return !hasReceiveDateHeader;
      }
      return !headerMap[h.normKey];
    }).map((h) => h.label);

    if (missingHeaders.length > 0) {
      headerErrors.push(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const key = (norm: string) => headerMap[norm];
    const partcodeKey = key("partcode");
    const qtyKey = key("qty");

    const courierKey = key("couriername") || key("curiername") || "";
    const boxIdKey = key("boxid") || "";
    const challanRefKey = key("challanrefno") || "";
    const challanDateKey = key("challandate") || "";
    const docketNoKey = key("docketno") || "";
    const receiveDateKey = key("receivedate") || key("recieveddate") || key("recievedate") || "";
    const rateKey = key("inwardpriceinr") || "";
    const remarksKey = key("remarks") || "";

    // Filter out completely empty rows (no Partcode and no Qty)
    const filteredRows = rows.filter((row) => {
      const partcode = partcodeKey ? row[partcodeKey] : undefined;
      const qty = qtyKey ? row[qtyKey] : undefined;
      const isPartcodeEmpty = partcode === undefined || partcode === null || String(partcode).trim() === "";
      const isQtyEmpty = qty === undefined || qty === null || String(qty).trim() === "";
      return !(isPartcodeEmpty && isQtyEmpty);
    });

    const gridRows: ExcelGridRow[] = filteredRows.map((row, idx) => {
      const pc = partcodeKey ? String(row[partcodeKey] ?? "").trim() : "";
      const q = qtyKey ? Number(row[qtyKey] ?? 0) || 0 : 0;
      const rate = rateKey ? Number(row[rateKey] ?? 0) || 0 : 0;

      return {
        rowKey: `r-${idx}-${pc || "na"}`,
        lineNo: idx + 1,
        partcode: pc,
        qty: q,
        boxId: boxIdKey ? String(row[boxIdKey] ?? "").trim() : "",
        challanRefNo: challanRefKey ? String(row[challanRefKey] ?? "").trim() : "",
        challanDate: challanDateKey ? parseExcelDateValue(row[challanDateKey]) : "",
        courierName: courierKey ? String(row[courierKey] ?? "").trim() : "",
        docketNo: docketNoKey ? String(row[docketNoKey] ?? "").trim() : "",
        receiveDate: receiveDateKey ? parseExcelDateValue(row[receiveDateKey]) : "",
        inwardPriceInr: rate,
        remarks: remarksKey ? String(row[remarksKey] ?? "").trim() : "",
      };
    });

    gridRows.forEach((row, index) => {
      const rowIndex = index + 2;
      const partcode = row.partcode;
      const qty = row.qty;

      const missing: string[] = [];

      if (partcode === undefined || partcode === null || String(partcode).trim() === "") {
        missing.push("Partcode");
      }
      if (qty === undefined || qty === null || String(qty).trim() === "" || Number(qty) === 0) {
        missing.push("Qty");
      }

      if (missing.length > 0) {
        rowErrors.push(`Row ${rowIndex}: ${missing.join(", ")} required.`);
      }
    });

    rowErrors.push(...getDuplicatePartcodeMessages(gridRows));

    setExcelHeaderErrors(headerErrors);
    setExcelRowErrors(rowErrors);

    if (headerErrors.length === 0 && rowErrors.length === 0) {
      setExcelRows(gridRows);
      showToast("Excel file parsed successfully", "success");
    } else {
      setExcelRows([]);
      if (rowErrors.some((error) => error.toLowerCase().includes("duplicate"))) {
        showToast("Duplicate entries found in Excel file", "error");
      }
    }
  };

  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setExcelFileError(null);
    setExcelHeaderErrors([]);
    setExcelRowErrors([]);
    setExcelRows([]);
    setExcelFileName("");

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      setExcelFileError("Only .xlsx files are allowed.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setExcelFileError("File size must be less than or equal to 1 MB.");
      return;
    }

    setExcelFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        validateAndSetExcelRows(jsonData);
      } catch (err) {
        setExcelFileError("Failed to parse Excel file. Please check the template.");
        setExcelRows([]);
      }
    };
    reader.onerror = () => {
      setExcelFileError("Error reading file. Please try again.");
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const finalSubmit = () => {
    if (!formdata) return;

    if (!excelRows || excelRows.length === 0) {
      showToast("Please upload a valid Excel file with component details", "error");
      return;
    }

    if (!documnetFileData || documnetFileData.length === 0) {
      showToast("Please Upload Invoice Documents", "error");
      return;
    }

    if (excelHeaderErrors.length > 0 || excelRowErrors.length > 0 || excelFileError) {
      showToast("Please resolve Excel errors before submitting", "error");
      return;
    }

    const component = excelRows.map((row) => row.partcode);
    const qty = excelRows.map((row) => Number(row.qty) || 0);
    const rate = excelRows.map((row) => Number(row.inwardPriceInr) || 0);
    const remarks = excelRows.map((row) => String(row.remarks ?? "").trim());
    const boxId = excelRows.map((row) => String(row.boxId ?? "").trim());
    const challanNo = excelRows.map((row) => String(row.challanRefNo ?? "").trim());
    const challanDate = excelRows.map((row) => String(row.challanDate ?? "").trim());
    const curierName = excelRows.map((row) => String(row.courierName ?? "").trim());
    const docketNo = excelRows.map((row) => String(row.docketNo ?? "").trim());
    const recievedDate = excelRows.map((row) => String(row.receiveDate ?? "").trim());

    // if (!selectedCostCenter) {
    //   showToast("Cost center is required", "error");
    //   return;
    // }

    const invoicePath = documnetFileData?.[0]?.fileID || "";
    if (!invoicePath) {
      showToast("Invoice path is missing. Please upload invoice again.", "error");
      return;
    }

    const payload: CreateRawMinPayloadType = {
      component,
      qty,
      rate,
      remarks,
      location:
        getOptionValue(formdata.pickLocation) ||
        getOptionValue(getValues("pickLocation")) ||
        pickLocationOptions.find(
          (item) =>
            item.label ===
            (getOptionValue(formdata.pickLocation) || getOptionValue(getValues("pickLocation")))
        )?.value ||
        "",
      boxId,
      challanNo,
      challanDate,
      curierName,
      courierName: curierName,
      docketNo,
      recievedDate,
      receivedDate: recievedDate,
      vendor: formdata.vendor?.id || "",
      vendorbranch: formdata.vendorBranch || "",
      address: formdata.vendorAddress || "",
      doc_id: formdata.documentId || "",
      doc_date: dayjs(formdata.doucmentDate).format("DD-MM-YYYY") || "",
      vendortype: formdata.vendorType || "",
      invoiceAttachment: invoicePath,
      // cc: selectedCostCenter,
      deliveryAddress: `MsCorpres Manufacturer and Refurbisher Pvt. Ltd.
                            2nd & 3rd Floor, B-88,Sec-83,
                            Noida Gautam Buddha Nagar, UP-201305`,
      deliveryGst: "09AATCM1744R1ZH",
      minType: "NORMAL-MIN",
    };

    dispatch(createRawMin(payload)).then((response: any) => {
      if (response.payload.data.success) {
        showToast(response.payload?.data?.message, "success");
        resetall();
        resetExcelState();
        handleNext();
        dispatch(resetFormData());
        setMinno(response.payload?.data?.data.transaction_id);
      }
    });
  };

  const InvoiceFileUpload = () => {
    if (file && filename) {
      const formdata = new FormData();
      formdata.append("file", file[0]);
      formdata.append("fileName", filename);
      dispatch(uploadInvoiceFile(formdata)).then((res: any) => {
        if (res.payload.data.success) {
          const uploadedPath = String(res.payload.data?.data || "").trim();
          if (!uploadedPath) {
            showToast("Upload succeeded but file path not found", "error");
            return;
          }
          dispatch(
            storeDocumentFile({
              originalFileName: filename || uploadedPath.split("/").pop() || "invoice",
              fileID: uploadedPath,
            })
          );
          showToast(res.payload.data.message, "success");
          setfile(null);
          setFilename("");
        }
      });
    } else {
      showToast("File and Document Name Required", "error");
    }
  };

  useEffect(() => {
    dispatch(getVendorAsync(null));
    dispatch(getLocationAsync(null));
    dispatch(getPertCodesync(null));
    dispatch(getCurrency());
    dispatch(getCostCenter());
  }, [dispatch]);

  useEffect(() => {
    if (formdata) {
      setValue("pickLocation", formdata.pickLocation ?? null);
      setValue("costCenter", formdata.costCenter ?? null);
      setValue("vendorType", formdata.vendorType);
      setValue("vendor", formdata.vendor);
      setValue("vendorBranch", formdata.vendorBranch);
      setValue("vendorAddress", formdata.vendorAddress);
      setValue("gstin", formdata.gstin);
      setValue("doucmentDate", dayjs(formdata.doucmentDate));
      setValue("documentId", formdata.documentId);
    }
  }, [formdata, setValue]);

  return (
    <>
      <ConfirmationModel
        open={alert}
        onClose={() => setAlert(false)}
        title="Are you sure?"
        content="Are you sure you want to reset all fields and table data?"
        cancelText="Cancel"
        confirmText="Continue"
        onConfirm={() => {
          resetall();
          dispatch(resetDocumentFile());
          dispatch(resetFormData());
          setActiveStep(0);
          setAlert(false);
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white h-full">
        <MaterialInvardUploadDocumentDrawer open={upload} setOpen={setUpload} />

        <div className="h-full flex flex-col min-h-0">
          <div className="h-[50px] flex items-center w-full px-[20px] bg-neutral-50 border-b border-neutral-300">
            <Stepper activeStep={activeStep} className="w-full">
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>

          {activeStep === 0 && (
            <div className="flex-1 min-h-0 pt-[20px] pb-[8px] sm:px-[10px] md:px-[30px] lg:px-[50px] flex flex-col gap-[20px] overflow-y-auto">
              <div id="primary-item-details" className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.user />
                  <h2 id="primary-item-details" className="text-lg font-semibold">
                    Vendor Details
                  </h2>
                </div>
                <Divider sx={{ borderBottomWidth: 2, borderColor: "#f59e0b", flexGrow: 1 }} />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                <Controller
                  name="vendorType"
                  control={control}
                  rules={{ required: "Vendor Type is required" }}
                  render={({ field }) => (
                    <FormControl variant="filled" error={!!errors.vendorType} fullWidth>
                      <InputLabel id="demo-simple-select-label">Vendor Type </InputLabel>
                      <Select labelId="demo-simple-select-label" id="demo-simple-select" label="Vendor Type" {...field}>
                        <MenuItem value={"V01"}>Vendor</MenuItem>
                      </Select>
                      {errors.vendorType && <FormHelperText>{errors.vendorType.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
                <Controller
                  name="vendor"
                  control={control}
                  rules={{ required: "Vendor  is required" }}
                  render={({ field }) => (
                    <SelectVendor
                      varient="filled"
                      error={!!errors.vendor}
                      helperText={errors.vendor?.message}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        dispatch(getVendorBranchAsync(e!.id));
                      }}
                      label="Vendor"
                    />
                  )}
                />
                <Controller
                  name="vendorBranch"
                  control={control}
                  rules={{ required: "Vendor Branch  is required" }}
                  render={({ field }) => (
                    <FormControl variant="filled" error={!!errors.vendorBranch} disabled={!VendorBranchData} fullWidth>
                      <InputLabel id="Vendor-simple-select-label">Vendor Branch</InputLabel>
                      <Select
                        labelId="Vendor-simple-select-label"
                        id="Vendor-simple-select"
                        label="Vendor Branch"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          dispatch(getVendorAddress(e.target.value)).then((response: any) => {
                            if (response.payload.data.success) {
                              setValue("vendorAddress", replaceBrWithNewLine(response.payload.data?.data?.address) || "");
                              setValue("gstin", response.payload.data?.data?.gstid);
                            }
                          });
                        }}
                      >
                        {VendorBranchData?.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.vendorBranch && <FormHelperText>{errors.vendorBranch.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
                <div className="flex items-center gap-[10px] text-slate-600 sm:col-span-1 md:col-span-2 ">
                  <p className="font-[500]">GSTIN :</p>
                  <p>{venderaddressdata ? venderaddressdata.gstid : "--"}</p>
                </div>
                <div className="col-span-2">
                  <TextField
                    variant="filled"
                    sx={{ mb: 1 }}
                    error={!!errors.vendorAddress}
                    helperText={errors?.vendorAddress?.message}
                    focused={!!watch("vendorAddress")}
                    multiline
                    rows={3}
                    fullWidth
                    label="Bill From Address"
                    className="h-[100px] resize-none"
                    {...register("vendorAddress", { required: "Bill From Address is required" })}
                  />
                </div>
              </div>
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.documentDetail />
                  <h2 className="text-lg font-semibold">Document Details</h2>
                </div>
                <Divider sx={{ borderBottomWidth: 2, borderColor: "#f59e0b", flexGrow: 1 }} />
              </div>
              <div className="grid grid-cols-3 gap-[30px] py-[20px]">
                <Controller
                  name="pickLocation"
                  control={control}
                  rules={{ required: "Drop location is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      options={pickLocationOptions}
                      value={field.value}
                      onChange={(_, value) => {
                        if (!value) {
                          field.onChange(null);
                          return;
                        }
                        field.onChange({
                          label: String((value as any).label ?? (value as any).text ?? (value as any).name ?? ""),
                          value: getOptionValue(value),
                        });
                      }}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      getOptionLabel={(option) => option.label || ""}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Drop Location"
                          variant="filled"
                          error={!!errors.pickLocation}
                          helperText={errors.pickLocation?.message}
                        />
                      )}
                    />
                  )}
                />
                {/* <Controller
                  name="costCenter"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={costCenterOptions}
                      loading={costCenterLoading}
                      value={field.value}
                      onChange={(_, value) => {
                        if (!value) {
                          field.onChange(null);
                          return;
                        }
                        field.onChange({
                          label: String((value as any).label ?? (value as any).text ?? (value as any).name ?? ""),
                          value: getOptionValue(value),
                        });
                      }}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      getOptionLabel={(option) => option.label || ""}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cost Center"
                          variant="filled"
                          error={!!errors.costCenter}
                          helperText={errors.costCenter?.message}
                        />
                      )}
                    />
                  )}
                /> */}
                <Controller
                  name="doucmentDate"
                  control={control}
                  rules={{ required: " Document Date is required" }}
                  render={({ field }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        enableAccessibleFieldDOMStructure={false}
                        format="DD-MM-YYYY"
                        slots={{
                          textField: TextField,
                        }}
                        maxDate={dayjs()}
                        slotProps={{
                          textField: {
                            variant: "filled",
                            error: !!errors.doucmentDate,
                            helperText: errors.doucmentDate?.message,
                          },
                        }}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        sx={{ width: "100%" }}
                        label="Document Date"
                        name="startDate"
                      />
                    </LocalizationProvider>
                  )}
                />
                <TextField
                  variant="filled"
                  label="Document ID"
                  error={!!errors.documentId}
                  helperText={errors.documentId?.message}
                  {...register("documentId", { required: "Invoice Id  is required" })}
                />
              </div>
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.attachment />
                  <h2 className="text-lg font-semibold">Attachments</h2>
                </div>
                <Divider sx={{ borderBottomWidth: 2, borderColor: "#f59e0b", flexGrow: 1 }} />
              </div>
              <div className="grid grid-cols-2">
                <div className=" flex flex-col gap-[20px] py-[20px] ">
                  <div>
                    <TextField
                      variant="filled"
                      fullWidth
                      label="Document Name"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                    />
                  </div>
                  <div>
                    <FileUploader
                      // acceptedFileTypes={{
                      //   "application/pdf": [],
                      //   "text/plain": [],
                      //   "text/csv": [],
                      //   "application/vnd.ms-excel": [],
                      //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
                      // }}
                      label="Upload Document"
                      value={file}
                      onFileChange={setfile}
                    />
                  </div>
                  <div className="flex items-center ">
                    <LoadingButton
                      variant="contained"
                      loadingPosition="start"
                      loading={uploadInvoiceFileLoading}
                      type="button"
                      startIcon={<FileUploadIcon fontSize="small" />}
                      onClick={InvoiceFileUpload}
                    >
                      Upload
                    </LoadingButton>
                  </div>
                </div>
                <div className="p-[20px]">
                  <Typography variant="inherit" fontWeight={500} gutterBottom>
                    Uploaded Documents
                  </Typography>
                  <Divider />
                  <List>
                    {documnetFileData &&
                      documnetFileData.map((item, i) => (
                        <ListItem
                          key={i}
                          secondaryAction={
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                dispatch(deletefile(item.fileID));
                              }}
                            >
                              <Icons.delete fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={item.originalFileName} />
                        </ListItem>
                      ))}
                  </List>
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="flex-1 min-h-0 pt-[20px] pb-[8px] sm:px-[10px] md:px-[30px] lg:px-[50px] flex flex-col gap-[20px] overflow-y-auto">
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.documentDetail />
                  <h2 className="text-lg font-semibold">Add Component Details (Excel Upload)</h2>
                </div>
                <Divider sx={{ borderBottomWidth: 2, borderColor: "#f59e0b", flexGrow: 1 }} />
              </div>

              <div className="flex flex-col gap-[16px]">
                <div className="flex flex-col gap-[16px]">
                  <Card>
                    <CardContent className="flex flex-col gap-[12px]">
                      <Typography variant="subtitle1" fontWeight={600}>
                        Upload Excel File
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Allowed file type: <b>.xlsx</b> | Max size: <b>1 MB</b>
                      </Typography>
                      <Box>
                        <LoadingButton
                          type="button"
                          variant="text"
                          startIcon={<DownloadIcon />}
                          onClick={downloadSampleFile}
                        >
                          Download Sample File
                        </LoadingButton>
                      </Box>
                      <Box>
                        <label className="border border-dashed border-slate-300 rounded-md px-3 py-2 w-full flex items-center gap-2 cursor-pointer hover:bg-slate-50">
                          <FileUploadIcon fontSize="small" className="mr-2" />
                          <span className="text-sm text-slate-700">
                            {excelFileName || "Click to select .xlsx file"}
                          </span>
                          <input
                            type="file"
                            hidden
                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleExcelFileChange}
                          />
                        </label>
                        {excelFileError && (
                          <Box mt={1}>
                            <Alert severity="error" variant="outlined">
                              {excelFileError}
                            </Alert>
                          </Box>
                        )}
                      </Box>

                      {(excelHeaderErrors.length > 0 || excelRowErrors.length > 0) && (
                        <Box mt={1} className="space-y-2">
                          {excelHeaderErrors.length > 0 && (
                            <Alert severity="error" variant="outlined">
                              {excelHeaderErrors.map((err, idx) => (
                                <div key={idx}>{err}</div>
                              ))}
                            </Alert>
                          )}
                          {excelRowErrors.length > 0 && (
                            <Alert severity="error" variant="outlined">
                              <div className="max-h-40 overflow-auto pr-2">
                                {excelRowErrors.map((err, idx) => (
                                  <div key={idx}>{err}</div>
                                ))}
                              </div>
                            </Alert>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {excelRows.length > 0 && (
                    <div className="border rounded-md overflow-hidden">
                      <Box p={2} className="bg-white">
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Preview ({excelRows.length} rows)
                        </Typography>
                      </Box>
                      <Box
                        className="ag-theme-quartz"
                        sx={{
                          minHeight: { xs: 360, md: 480 },
                          height: { md: "min(65vh, 720px)" },
                          "& .ag-root-wrapper": { borderRadius: 0 },
                        }}
                      >
                        <AgGridReact<ExcelGridRow>
                          rowData={excelRows}
                          columnDefs={[
                            { headerName: "S.No", field: "lineNo", width: 100, maxWidth: 120, filter: "agNumberColumnFilter" },
                            { headerName: "Partcode", field: "partcode", flex: 1, minWidth: 140, filter: "agTextColumnFilter" },
                            { headerName: "Qty", field: "qty", width: 120, maxWidth: 140, filter: "agNumberColumnFilter" },
                            { headerName: "BoxID", field: "boxId", flex: 1, minWidth: 120, filter: "agTextColumnFilter" },
                            { headerName: "Challan/ Ref. No", field: "challanRefNo", flex: 1, minWidth: 160, filter: "agTextColumnFilter" },
                            { headerName: "Challan Date", field: "challanDate", flex: 1, minWidth: 140, filter: "agTextColumnFilter" },
                            { headerName: "Curier Name", field: "courierName", flex: 1, minWidth: 140, filter: "agTextColumnFilter" },
                            { headerName: "Docket No", field: "docketNo", flex: 1, minWidth: 140, filter: "agTextColumnFilter" },
                            { headerName: "Receive Date", field: "receiveDate", flex: 1, minWidth: 140, filter: "agTextColumnFilter" },
                            { headerName: "Inward Price (INR)", field: "inwardPriceInr", width: 160, filter: "agNumberColumnFilter" },
                            { headerName: "Remarks", field: "remarks", flex: 1, minWidth: 160, filter: "agTextColumnFilter" },
                          ] as ColDef<ExcelGridRow>[]}
                          defaultColDef={{
                            sortable: true,
                            resizable: true,
                            filter: true,
                            floatingFilter: true,
                          }}
                          getRowId={(params: GetRowIdParams<ExcelGridRow>) => params.data.rowKey}
                          headerHeight={40}
                          floatingFiltersHeight={36}
                          rowHeight={42}
                          pagination
                          paginationPageSize={50}
                          paginationPageSizeSelector={[25, 50, 100, 200]}
                          suppressCellFocus
                          animateRows
                          overlayNoRowsTemplate={OverlayNoRowsTemplate}
                        />
                      </Box>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="flex flex-col justify-center gap-[10px]">
                <Success />
                <Typography variant="inherit" fontWeight={500}>
                  Min No. : {minNo}
                </Typography>
                <LoadingButton onClick={() => setActiveStep(0)} variant="contained">
                  Create New MIN
                </LoadingButton>
              </div>
            </div>
          )}

          <div className="h-[50px] sticky bottom-0 z-20 mt-auto shrink-0 border-t border-neutral-300 flex items-center justify-end px-[20px] bg-neutral-50 gap-[10px] relative">
            {activeStep === 0 && (
              <>
                <LoadingButton
                  sx={{ background: "white", color: "red" }}
                  variant="contained"
                  startIcon={<Icons.refreshv2 />}
                  onClick={() => {
                    setAlert(true);
                  }}
                >
                  Reset
                </LoadingButton>

                <LoadingButton type="submit" variant="contained" endIcon={<Icons.next />}>
                  Next
                </LoadingButton>
              </>
            )}
            {activeStep === 1 && (
              <>
                <LoadingButton
                  disabled={createminLoading}
                  sx={{ background: "white", color: "red" }}
                  variant="contained"
                  startIcon={<Icons.previous />}
                  onClick={() => {
                    handleBack();
                  }}
                >
                  Back
                </LoadingButton>
                <LoadingButton
                  disabled={createminLoading}
                  sx={{ background: "white", color: "red" }}
                  variant="contained"
                  startIcon={<Icons.refreshv2 />}
                  onClick={() => {
                    setAlert(true);
                  }}
                >
                  Reset
                </LoadingButton>
                <LoadingButton
                  loading={createminLoading}
                  loadingPosition="start"
                  variant="contained"
                  startIcon={<Icons.save />}
                  onClick={() => {
                    finalSubmit();
                  }}
                >
                  Submit
                </LoadingButton>
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default GoodSpareInwardv2;

