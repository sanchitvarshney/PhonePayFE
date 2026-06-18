import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Card,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import * as XLSX from "xlsx";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GetRowIdParams } from "ag-grid-community";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getLocationAsync } from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import { showToast } from "@/utils/toasterContext";
import { Icons } from "@/components/icons";
import axiosInstance from "@/api/axiosInstance";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { Save } from "@mui/icons-material";
import AntSkuSelect from "@/components/reusable/antSelecters/AntSkuSelect";
import SelectBom from "@/components/reusable/SelectBom";

interface ExcelRow {
  lineNo: number;
  rowKey: string;
  partcode: string;
  qty: number;
  availableQty: number;
  reflocation: string;
  category: string;
  subcategory: string;
  remark: string;
}

type LocationOption = { label: string; value: string };
type StockCheckRow = {
  partcode: string;
  requiredQty: number;
  availableQty: number;
  status: string;
  message: string;
};

const getDuplicateValues = (values: string[]): string[] => {
  const seen = new Map<string, string>();
  const duplicates = new Set<string>();
  values.forEach((raw) => {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return;
    if (seen.has(normalized)) {
      duplicates.add(seen.get(normalized)!);
      return;
    }
    seen.set(normalized, raw.trim());
  });
  return Array.from(duplicates);
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

interface FormValues {
  location: LocationOption | null;
  skuValue: LocationOption | null;
  bom: any | null;
  qty: string;
}

const Consumption: React.FC = () => {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [parseSuccess, setParseSuccess] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [stockCheckRows, setStockCheckRows] = useState<StockCheckRow[]>([]);
  const [stockCheckOpen, setStockCheckOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridReact<ExcelRow>>(null);

  const dispatch = useAppDispatch();
  const { locationData } = useAppSelector((state) => state.divicemin);
  // const { costCenterData } = useAppSelector((state) => state.common);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { location: null, skuValue: null, bom: null, qty: "" },
  });

  useEffect(() => {
    dispatch(getLocationAsync(null));
  }, [dispatch]);

  const locationOptions = useMemo<LocationOption[]>(() => {
    if (!locationData?.length) return [];
    return locationData.map((item) => {
      const raw = item as {
        text?: string;
        name?: string;
        label?: string;
        id?: string | number;
        code?: string | number;
        value?: string | number;
        key?: string | number;
      };
      const label = String(raw.text ?? raw.name ?? raw.label ?? "");
      const value = String(
        raw.id ??
          raw.code ??
          raw.value ??
          raw.key ??
          raw.text ??
          raw.name ??
          raw.label ??
          "",
      );
      return { label, value };
    });
  }, [locationData]);

  const downloadSampleFile = () => {
    const sampleRows = [
      {
        Part_Code: "PARTCODE001",
        Consmption_Qty: 10,
        Ref_Location: "LOCATION001",
        Remarks: "testing",
        Category: "CATEGORY001",
        Sub_Category: "SUBCATEGORY001",
      },
      {
        Part_Code: "PARTCODE002",
        Consmption_Qty: 10,
        Ref_Location: "LOCATION002",
        Remarks: "testing",
        Category: "CATEGORY002",
        Sub_Category: "SUBCATEGORY002",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consumption");
    XLSX.writeFile(wb, "consumption_sample.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const locationId = getOptionValue(getValues("location"));
    const totalQty = getValues("qty");
    const bomId = getValues("bom");

    // const costCenterId = getOptionValue(getValues("costCenter"));

    if (!locationId) {
      const msg = "Please select pick location before uploading Excel";
      showToast(msg, "error");
      setFileError(msg);
      setExcelData([]);
      setFileName("");
      setParseSuccess(false);
      e.target.value = "";
      return;
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const isValidMime = validTypes.includes(file.type);
    const isValidExt = /\.(xlsx|xls)$/i.test(file.name);
    if (!isValidMime && !isValidExt) {
      setFileError("Only .xlsx or .xls files are allowed");
      setExcelData([]);
      setFileName("");
      setParseSuccess(false);
      return;
    }

    setFileName(file.name);
    setFileError("");
    setParseSuccess(false);

    const reader = new FileReader();
    reader.onerror = () => {
      setFileError("Failed to read file");
      setExcelData([]);
      setParseSuccess(false);
    };
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (json.length === 0) {
        setFileError("Excel file is empty");
        setExcelData([]);
        setParseSuccess(false);
        return;
      }

      const headers = Object.keys(json[0]).map((h) => h);
      if (
        !headers.includes("Part_Code") ||
        !headers.includes("Consmption_Qty")
      ) {
        showToast(
          "Excel must contain 'Part_Code' and 'Consmption_Qty' columns",
          "error",
        );
        setFileError(
          "Excel must contain 'Part_Code' and 'Consmption_Qty' columns",
        );
        setExcelData([]);
        setParseSuccess(false);
        return;
      }

      const rows = json
        .map((row: any) => {
          const keys = Object.keys(row);
          const partcodeKey = keys.find((k) => k === "Part_Code");
          const qtyKey = keys.find((k) => k === "Consmption_Qty");
          const reflocationKey = keys.find((k) => k === "Ref_Location");
          const categoryKey = keys.find((k) => k === "Category");
          const subcategoryKey = keys.find((k) => k === "Sub_Category");
          const remark = keys.find((k) => k === "Remarks");
          const rawSubcategory = String(row[subcategoryKey!] || "")
            .trim()
            .toLowerCase();
          const subcategory =
            rawSubcategory === "variable"
              ? "var"
              : rawSubcategory === "fixed"
                ? "fix"
                : rawSubcategory;
          return {
            partcode: String(row[partcodeKey!] || "").trim(),
            qty: Number(row[qtyKey!]) || 0,
            reflocation: String(row[reflocationKey!] || "").trim(),
            category: String(row[categoryKey!] || "").trim(),
            subcategory,
            remark: String(row[remark!] || "").trim(),
          };
        })
        .filter((row) => row.partcode !== "");

      if (rows.length === 0) {
        setFileError("No valid data found in Excel file");
        setExcelData([]);
        setParseSuccess(false);
        return;
      }

      const duplicatePartcodes = getDuplicateValues(
        rows.map((row) => row.partcode),
      );
      if (duplicatePartcodes.length > 0) {
        const duplicateMsg = `Duplicate partcode entries found: ${duplicatePartcodes.join(", ")}`;
        showToast(duplicateMsg, "error");
        setFileError(duplicateMsg);
        setExcelData([]);
        setParseSuccess(false);
        return;
      }

      const parsed: ExcelRow[] = rows.map((row, idx) => ({
        ...row,
        lineNo: idx + 1,
        rowKey: `r-${idx}-${row.partcode}`,
        availableQty: 0,
        reflocation: row.reflocation,
        category: row.category,
        subcategory: row.subcategory,
        remark: row.remark,
      }));

      try {
        const checkResponse = await axiosInstance.post("/consumption/check", {
          partcode: parsed.map((row) => row.partcode),
          qty: parsed.map((row) => row.qty),
          reflocation: parsed.map((row) => row.reflocation),
          category: parsed.map((row) => row.category),
          subcategory: parsed.map((row) => row.subcategory),
          remark: parsed.map((row) => row.remark ?? "--"), 
          // costCenter: costCenterId,
          bomId: bomId?.code,
          totalQty,
          location: locationId,
        });
        const checkBody = checkResponse?.data ?? {};

        const isSuccess =
          checkBody?.success === true ||
          String(checkBody?.status ?? "").toLowerCase() === "success";
        const checkRows: any[] = Array.isArray(checkBody?.data)
          ? checkBody.data.map((item: any) => ({
              partcode: String(item?.partcode ?? "").trim(),
              partName: String(item?.partName ?? "").trim(),
              bomQty: Number(item?.bomQty ?? 0),
              requiredQty: Number(item?.requiredQty ?? 0),
              availableQty: Number(item?.availableQty ?? 0),
              status: String(item?.status ?? "").trim(),
              message: String(item?.message ?? "").trim(),
              remark: String(item?.remark ?? "").trim(),
            }))
          : [];
      
        setExcelData(checkRows);
        setStockCheckRows(checkRows);
        setStockCheckOpen(true);

        if (!isSuccess) {
          throw new Error(checkBody?.message || "Consumption check failed");
        }

        const hasInsufficient = checkRows.some(
          (row) => row.status.toLowerCase() === "insufficient",
        );
        if (hasInsufficient) {
          const msg =
            "Insufficient stock found for one or more partcodes. Excel upload blocked.";
          showToast(msg, "error");
          setFileError(msg);
          setExcelData([]);
          setFileName("");
          setParseSuccess(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        setParseSuccess(true);
        showToast(
          checkBody?.message || "Excel validated successfully",
          "success",
        );
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Consumption check failed";
        showToast(message, "error");
        setFileError(message);
        setExcelData([]);
        setFileName("");
        setParseSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const locationId =
      getOptionValue(data.location) || getOptionValue(getValues("location"));
    // const cc =
    //   getOptionValue(data.costCenter) || getOptionValue(getValues("costCenter"));
    const bomId = data.bom;
    const totalQty = Number(data.qty);

    if (!locationId) {
      showToast("Please select a pick location", "error");
      return;
    }

    if (excelData.length === 0) {
      showToast("Please upload a valid Excel file", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/consumption/create", {
        pickLocation: locationId,
        // costCenter: cc,
        // cc,
        bomId: bomId?.code,
        partcode: excelData.map((row) => row.partcode),
        qty: excelData.map((row) => row.requiredQty),
        remark: excelData.map((row) => row.remark ?? "--"),
        // subcategory: excelData.map((row) => row.subcategory),
        // category: excelData.map((row) => row.category),
        totalQty,
      });
      showToast(
        response.data?.message || "Consumption saved successfully",
        "success",
      );
      reset({ location: null, skuValue: null, bom: null, qty: "" });
      setExcelData([]);
      setFileName("");
      setFileError("");
      setParseSuccess(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getRowId = useCallback((params: GetRowIdParams<ExcelRow>) => {
    return params.data.rowKey;
  }, []);

  const columnDefs = useMemo<ColDef<any>[]>(
    () => [
      {
        headerName: "S.No",
        field: "lineNo",
        width: 100,
        maxWidth: 120,
        filter: "agNumberColumnFilter",
        sortable: true,
        cellRenderer: (params: any) => params.node.rowIndex + 1,
      },
      {
        headerName: "Part Code",
        field: "partcode",
        flex: 1,
        minWidth: 100,
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Part Name",
        field: "partName",
        flex: 1,
        minWidth: 100,
        filter: "agTextColumnFilter",
        sortable: true,
      },

      {
        headerName: "BOM Qty",
        field: "bomQty",
        width: 120,
        maxWidth: 140,
        filter: "agNumberColumnFilter",
        sortable: true,
        cellStyle: { textAlign: "left" },
        headerStyle: { textAlign: "left" },
      },
      {
        headerName: "Qty",
        field: "requiredQty",
        width: 120,
        maxWidth: 140,
        filter: "agNumberColumnFilter",
        sortable: true,
        cellStyle: { textAlign: "left" },
        headerStyle: { textAlign: "left" },
      },
      {
        headerName: "Available Qty",
        field: "availableQty",
        width: 160,
        maxWidth: 180,
        filter: "agNumberColumnFilter",
        sortable: true,
        cellStyle: { textAlign: "left" },
        headerStyle: { textAlign: "left" },
      },
        {
        headerName: "Remark",
        field: "remark",
        width: 160,
        maxWidth: 180,
        filter: "agNumberColumnFilter", 
        sortable: true,
        cellStyle: { textAlign: "left" },
        headerStyle: { textAlign: "left" },
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: true,
    }),
    [],
  );

  const UploadIcon = Icons.uploadfile;
  const DownloadIcon = Icons.download;

  return (
    <div className="h-full w-full  flex p-[0px] ">
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          p: 1,
          bgcolor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <form
          className="flex flex-col min-h-0 flex-1 grid grid-cols-1 md:grid-cols-[0.6fr,2fr] gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Card sx={{ p: 1.5, borderRadius: 0 }} elevation={2}>
            <div className="flex flex-col gap-3">
              <div>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Select Device
                </Typography>
                <Controller
                  name="skuValue"
                  control={control}
                  rules={{ required: "Device is required" }}
                  render={({ field }) => (
                    <AntSkuSelect
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                />
              </div>
              <div>
                <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 600 }}>
                  Search BOM
                </Typography>
                <Controller
                  name="bom"
                  rules={{ required: "BOM is required" }}
                  control={control}
                  disabled={!watch("bom")?.code}
                  render={({ field }) => (
                    <SelectBom
                      {...field}
                      disabled={!watch("skuValue")}
                      label="Search BOM"
                      error={!!errors.bom}
                      varient="standard"
                      //@ts-ignore
                      id={watch("skuValue")?.value}
                    />
                  )}
                />
              </div>

              <div>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Pick Location
                </Typography>

                <Controller
                  name="location"
                  control={control}
                  rules={{ required: "Location is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      options={locationOptions}
                      getOptionLabel={(option) => option.label || ""}
                      isOptionEqualToValue={(option, value) =>
                        !!value && option.value === value.value
                      }
                      value={field.value}
                      onChange={(_, v) => field.onChange(v)}
                      fullWidth
                      disablePortal
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          error={!!errors.location}
                          helperText={errors.location?.message}
                        />
                      )}
                    />
                  )}
                />
              </div>

              <div>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Total Quantity
                </Typography>
                <Controller
                  name="qty"
                  control={control}
                  rules={{
                    required: "Total Quantity is required",
                    validate: (v) =>
                      (Number(v) > 0 && Number.isInteger(Number(v))) ||
                      "Enter a valid positive integer",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="standard"
                      fullWidth
                      placeholder="Enter quantity"
                      error={!!errors.qty}
                      helperText={errors.qty?.message}
                      slotProps={{ htmlInput: { inputMode: "numeric" } }}
                      onKeyDown={(e) => {
                        const allowed = [
                          "Backspace",
                          "Delete",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Home",
                          "End",
                        ];
                        if (allowed.includes(e.key)) return;
                        if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                      }}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "");
                        field.onChange(cleaned);
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Material Details
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="text"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mb: 1 }}
                >
                  Upload Excel
                </Button>

                {fileName ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Selected: {fileName}
                  </Typography>
                ) : null}
                {fileError ? (
                  <Typography variant="body2" color="error" sx={{ mb: 0.5 }}>
                    {fileError}
                  </Typography>
                ) : null}
                {parseSuccess && excelData.length > 0 ? (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mb: 0.5 }}
                  >
                    File parsed successfully — Total Items: {excelData.length}
                  </Typography>
                ) : null}
              </div>
            </div>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",

                pt: 2,
                mt: 2,
                flexShrink: 0,
                borderTop: 1,
                borderColor: "divider",
                gap: 2,
              }}
            >
              <Button
                type="button"
                variant="text"
                startIcon={<DownloadIcon />}
                onClick={downloadSampleFile}
              >
                Sample File
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={submitting}
                loadingPosition="start"
                startIcon={<Save />}
              >
                Submit
              </LoadingButton>
            </Box>
          </Card>
          <Card sx={{ p: 0, borderRadius: 0, height: "100%" }} elevation={2}>
            <Box className="ag-theme-quartz h-full w-full">
              <AgGridReact<ExcelRow>
                ref={gridRef}
                rowData={excelData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                getRowId={getRowId}
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
          </Card>
        </form>
      </Paper>
      <Dialog
        open={stockCheckOpen}
        onClose={() => setStockCheckOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Consumption Stock Check</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Partcode</TableCell>
                <TableCell>Required Qty</TableCell>
                <TableCell>Available Qty</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockCheckRows.map((row, idx) => (
                <TableRow key={`${row.partcode}-${idx}`}>
                  <TableCell>{row.partcode}</TableCell>
                  <TableCell>{row.requiredQty}</TableCell>
                  <TableCell>{row.availableQty}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={
                        row.status.toLowerCase() === "insufficient"
                          ? "error.main"
                          : "success.main"
                      }
                    >
                      {row.status}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockCheckOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Consumption;
