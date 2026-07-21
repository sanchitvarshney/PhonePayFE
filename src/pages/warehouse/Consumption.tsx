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
  Paper,
  TextField,
  Typography,
  Card,
  IconButton,
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
import { Close, Save } from "@mui/icons-material";
import AntSkuSelect from "@/components/reusable/antSelecters/AntSkuSelect";
import SelectBom from "@/components/reusable/SelectBom";

const FIXED_COLUMNS = ["Engg Id", "Serial NO", "Repair Date"];

const formatDateForDisplay = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

type LocationOption = { label: string; value: string };
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
  const [dynamicColDefs, setDynamicColDefs] = useState<ColDef[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [parseSuccess, setParseSuccess] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);
  const gridRef = useRef<AgGridReact>(null);

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
    const aoa = [
      ["Engg Id", "Serial NO", "Repair Date", "P0019", "PP0713", "PP0725", "PP0726"],
      ["ENG001", "PPSS20000000001", "2026-06-08", 1, 1, 0, 2],
      ["ENG002", "PPSS20000000002", "2026-06-08", 0, 1, 1, 0],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consumption");
    XLSX.writeFile(wb, "consumption_sample.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    selectedFileRef.current = file;

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
    setExcelData([]);
    setDynamicColDefs([]);
    setGridLoading(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setFileError("Failed to read file");
      setExcelData([]);
      setParseSuccess(false);
      setGridLoading(false);
    };
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (json.length === 0) {
          setFileError("Excel file is empty");
          setExcelData([]);
          setParseSuccess(false);
          return;
        }


        const colNames = Object.keys(json[0]).filter((k) => k !== "__rowNum__");
        const dataRows = json.map((row, idx) => {
          const normalized: any = { rowKey: `r-${idx}` };
          for (const key of colNames) {
            const val = row[key];
            normalized[key] = val instanceof Date ? formatDateForDisplay(val) : val;
          }
          return normalized;
        });

        if (dataRows.length === 0) {
          setFileError("No valid data found in Excel file");
          setExcelData([]);
          setParseSuccess(false);
          return;
        }

        // Columns other than the fixed ones are part codes — resolve their names via API
        const partCodes = colNames.filter((name) => !FIXED_COLUMNS.includes(name));
        const partNameMap = new Map<string, { name: string; variable: string }>();
        if (partCodes.length > 0) {
          try {
            const res = await axiosInstance.post("/consumption/getPartNames", {
              partCode: partCodes,
            });
            const list = res.data?.data ?? res.data?.body ?? res.data ?? [];
            (Array.isArray(list) ? list : []).forEach((item: any) => {
              const code = String(item?.partCode  ?? "").trim();
              const name = String(item?.partName  ?? "").trim();
              const variable = String(item?.bomSubCategory ?? "").trim();
              if (code) partNameMap.set(code, { name, variable });
            });
          } catch { 
           showToast("Failed to resolve part names", "error");
            return;
            }
        }

        // Build dynamic column defs from extracted headers
        const cols: ColDef[] = [
          {
            headerName: "S.No",
            valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
            width: 80,
            maxWidth: 100,
            sortable: false,
            filter: false,
            floatingFilter: false,
            pinned: "left" as const,
          },
          ...colNames.map((name) => {
            const info = partNameMap.get(name);
            const partName = info?.name;
            const variable = info?.variable;
            const fullHeaderName = partName
              ? `${name} - ${partName}${variable ? ` (${variable})` : ""}`
              : name;
            return {
              headerName: fullHeaderName,
              headerTooltip: fullHeaderName,
              field: name,
              minWidth: 250,
              filter: "agTextColumnFilter",
              sortable: true,
            };
          }),
        ];

        setDynamicColDefs(cols);
        setExcelData(dataRows);
        setParseSuccess(true);
        showToast(`File parsed successfully — ${dataRows.length} items loaded`, "success");
      } finally {
        setGridLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const locationId =
      getOptionValue(data.location) || getOptionValue(getValues("location"));
    const bomId = data.bom;
    const totalQty = Number(data.qty);

    if (!locationId) {
      showToast("Please select a pick location", "error");
      return;
    }

    if (!selectedFileRef.current) {
      showToast("Please upload a valid Excel file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFileRef.current);
    formData.append("pickLocation", locationId);
    formData.append("bomId", bomId?.code ?? "");
    formData.append("totalQty", String(totalQty));

    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/consumption/deviceConsumption", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    
      showToast(
        response.data?.message || "Consumption saved successfully",
        "success",
      );
      reset({ location: null, skuValue: null, bom: null, qty: "" });
      setExcelData([]);
      setDynamicColDefs([]);
      setFileName("");
      setFileError("");
      setParseSuccess(false);
      selectedFileRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getRowId = useCallback((params: GetRowIdParams<any>) => {
    return params.data.rowKey;
  }, []);


  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: true,
      cellStyle: { textAlign: "center" },
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                      Selected: {fileName}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      sx={{ minWidth: 0, p: 0.25, fontSize: 11 }}
                      onClick={() => {
                        setFileName("");
                        setExcelData([]);
                        setDynamicColDefs([]);
                        setFileError("");
                        setParseSuccess(false);
                        selectedFileRef.current = null;
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
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
              <AgGridReact
                ref={gridRef}
                rowData={excelData}
                columnDefs={dynamicColDefs}
                defaultColDef={defaultColDef}
                getRowId={getRowId}
                loading={gridLoading}
                enableBrowserTooltips
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
    </div>
  );
};

export default Consumption;
