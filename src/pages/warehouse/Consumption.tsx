import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
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

interface ExcelRow {
  lineNo: number;
  rowKey: string;
  partcode: string;
  qty: number;
  availableQty: number;
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
  costCenter: LocationOption | null;
}

const Consumption: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
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
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { location: null, costCenter: null },
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
        raw.id ?? raw.code ?? raw.value ?? raw.key ?? raw.text ?? raw.name ?? raw.label ?? "",
      );
      return { label, value };
    });
  }, [locationData]);

  // const costCenterOptions = useMemo<LocationOption[]>(() => {
  //   if (!costCenterData?.length) return [];
  //   return costCenterData.map((item) => {
  //     const raw = item as {
  //       text?: string;
  //       name?: string;
  //       label?: string;
  //       id?: string | number;
  //       code?: string | number;
  //       value?: string | number;
  //       key?: string | number;
  //     };
  //     const label = String(raw.text ?? raw.name ?? raw.label ?? "");
  //     const value = String(
  //       raw.id ??
  //         raw.code ??
  //         raw.value ??
  //         raw.key ??
  //         raw.text ??
  //         raw.name ??
  //         raw.label ??
  //         "",
  //     );
  //     return { label, value };
  //   });
  // }, [costCenterData]);

  const downloadSampleFile = () => {
    const sampleRows = [
      { partcode: "PARTCODE001", qty: 10 },
      { partcode: "PARTCODE002", qty: 5 },
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

      const headers = Object.keys(json[0]).map((h) => h.toLowerCase().trim());
      if (!headers.includes("partcode") || !headers.includes("qty")) {
        showToast(
          "Excel must contain 'partcode' and 'qty' columns",
          "error",
        );
        setFileError("Excel must contain 'partcode' and 'qty' columns");
        setExcelData([]);
        setParseSuccess(false);
        return;
      }

      const rows = json
        .map((row: any) => {
          const keys = Object.keys(row);
          const partcodeKey = keys.find(
            (k) => k.toLowerCase().trim() === "partcode",
          );
          const qtyKey = keys.find(
            (k) => k.toLowerCase().trim() === "qty",
          );
          return {
            partcode: String(row[partcodeKey!] || "").trim(),
            qty: Number(row[qtyKey!]) || 0,
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
      }));

      try {
        const checkResponse = await axiosInstance.post("/consumption/check", {
          partcode: parsed.map((row) => row.partcode),
          qty: parsed.map((row) => row.qty),
          // costCenter: costCenterId,
          location: locationId,
        });
        const checkBody = checkResponse?.data ?? {};
        const isSuccess =
          checkBody?.success === true ||
          String(checkBody?.status ?? "").toLowerCase() === "success";
        const checkRows: StockCheckRow[] = Array.isArray(checkBody?.data)
          ? checkBody.data.map((item: any) => ({
              partcode: String(item?.partcode ?? "").trim(),
              requiredQty: Number(item?.requiredQty ?? 0),
              availableQty: Number(item?.availableQty ?? 0),
              status: String(item?.status ?? "").trim(),
              message: String(item?.message ?? "").trim(),
            }))
          : [];

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

        const availableQtyByPartcode = new Map(
          checkRows.map((row) => [row.partcode.toLowerCase(), row.availableQty]),
        );
        const enrichedRows: ExcelRow[] = parsed.map((row) => ({
          ...row,
          availableQty:
            Number(availableQtyByPartcode.get(row.partcode.toLowerCase())) || 0,
        }));

        setExcelData(enrichedRows);
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
        partcode: excelData.map((row) => row.partcode),
        qty: excelData.map((row) => row.qty),
      });
      showToast(
        response.data?.message || "Consumption saved successfully",
        "success",
      );
      reset({ location: null, costCenter: null });
      setExcelData([]);
      setFileName("");
      setFileError("");
      setParseSuccess(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Submission failed",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getRowId = useCallback((params: GetRowIdParams<ExcelRow>) => {
    return params.data.rowKey;
  }, []);

  const columnDefs = useMemo<ColDef<ExcelRow>[]>(
    () => [
      {
        headerName: "S.No",
        field: "lineNo",
        width: 100,
        maxWidth: 120,
        filter: "agNumberColumnFilter",
        sortable: true,
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
        headerName: "Qty",
        field: "qty",
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

  const DocumentIcon = Icons.documentDetail;
  const UploadIcon = Icons.uploadfile;
  const DownloadIcon = Icons.download;

  return (
    <div className="h-full w-full min-h-0 flex p-[20px]">
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <form
          className="flex flex-col min-h-0 flex-1"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <DocumentIcon color="primary" />
            <Typography variant="h6" component="h1">
              Consumption
            </Typography>
          </div>

          <Divider sx={{ mb: 3, flexShrink: 0 }} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 mb-4 shrink-0">
            <div>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Pick Location
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          label="Pick Location"
                          variant="filled"
                          error={!!errors.location}
                          helperText={errors.location?.message}
                        />
                      )}
                    />
                  )}
                />
                {/* <Controller
                  name="costCenter"
                  control={control}
                  rules={{ required: "Cost center is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      options={costCenterOptions}
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
                          label="Cost Center"
                          variant="filled"
                          error={!!errors.costCenter}
                          helperText={errors.costCenter?.message}
                        />
                      )}
                    />
                  )}
                /> */}
              </div>
            </div>

            <div>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Upload Material Details
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
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 1 }}
              >
                Choose Excel File (.xlsx)
              </Button>
              <Button
                type="button"
                variant="text"
                startIcon={<DownloadIcon />}
                onClick={downloadSampleFile}
                sx={{ mb: 1, ml: 1 }}
              >
                Download Sample File
              </Button>
              {fileName ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Selected: {fileName}
                </Typography>
              ) : null}
              {fileError ? (
                <Typography variant="body2" color="error" sx={{ mb: 0.5 }}>
                  {fileError}
                </Typography>
              ) : null}
              {parseSuccess && excelData.length > 0 ? (
                <Typography variant="body2" color="success.main" sx={{ mb: 0.5 }}>
                  File parsed successfully — Total Items: {excelData.length}
                </Typography>
              ) : null}
            </div>
          </div>

          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, flexShrink: 0 }}>
            Preview
          </Typography>
          <Box
            className="ag-theme-quartz flex-1 min-h-0 w-full"
            sx={{
              minHeight: { xs: 360, md: 480 },
              height: { md: "min(65vh, 720px)" },
              "& .ag-root-wrapper": { borderRadius: 1 },
            }}
          >
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
              pt: 2,
              flexShrink: 0,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              loading={submitting}
              loadingPosition="start"
            >
              Submit
            </LoadingButton>
          </Box>
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
