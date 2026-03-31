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
  Paper,
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
}

type LocationOption = { label: string; value: string };

interface FormValues {
  location: LocationOption | null;
}

const Consumption: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [parseSuccess, setParseSuccess] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridReact<ExcelRow>>(null);

  const dispatch = useAppDispatch();
  const { locationData } = useAppSelector((state) => state.divicemin);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { location: null },
  });

  useEffect(() => {
    dispatch(getLocationAsync(null));
  }, [dispatch]);

  const locationOptions = useMemo<LocationOption[]>(() => {
    if (!locationData?.length) return [];
    return locationData.map((item) => ({
      label: item.text,
      value: item.id,
    }));
  }, [locationData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    reader.onload = (event) => {
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

      const parsed: ExcelRow[] = rows.map((row, idx) => ({
        ...row,
        lineNo: idx + 1,
        rowKey: `r-${idx}-${row.partcode}`,
      }));

      setExcelData(parsed);
      setParseSuccess(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!data.location) {
      showToast("Please select a drop location", "error");
      return;
    }
    if (excelData.length === 0) {
      showToast("Please upload a valid Excel file", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/consumption/create", {
        location: data.location?.value,
        partcode: excelData.map((row) => row.partcode),
        qty: excelData.map((row) => row.qty),
      });
      showToast(
        response.data?.message || "Consumption saved successfully",
        "success",
      );
      reset({ location: null });
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
                Drop Location
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
                        label="Drop Location"
                        variant="filled"
                        error={!!errors.location}
                        helperText={errors.location?.message}
                      />
                    )}
                  />
                )}
              />
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
    </div>
  );
};

export default Consumption;
