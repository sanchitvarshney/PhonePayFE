import React, { useCallback, useRef, useState } from "react";
import { DatePicker } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";

import dayjs, { Dayjs } from "dayjs";
import { AgGridReact } from "@ag-grid-community/react";
import * as XLSX from "xlsx";

import {
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { showToast } from "@/utils/toasterContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getr8Report } from "@/features/report/report/reportSlice";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { rangePresets } from "@/utils/rangePresets";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import MuiTooltip from "@/components/reusable/MuiTooltip";

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
import R8ReportTable from "@/table/report/R8ReportTable";
import R8ReportDetailTable from "@/table/report/R8ReportDetailTable";

const R8Report: React.FC = () => {
  const [colapse, setcolapse] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { r8ReportLoading, r8Report, r8ReportDetail } = useAppSelector((state) => state.report);
  const [wise, setWise] = useState<string>("datewise");
  const [batch, setBatch] = useState<string | null>(null);
  const [date, setDate] = useState<{ from: Dayjs | null; to: Dayjs | null }>({
    from: null,
    to: null,
  });
  const [open, setOpen] = React.useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  const handleClose = () => {
    setOpen(false);
  };
  const gridRef = useRef<AgGridReact<any>>(null);

  const onBtExportDetail = useCallback(() => {
    const sheetData = [
      ["Batch ID", "SKU", "SKU Name", "Transfer Qty", "Rate", "From Location", "To Location", "Transfer Date"],
      [
        selectedBatch?.batchId,
        selectedBatch?.deviceSku,
        selectedBatch?.deviceName,
        selectedBatch?.transferQty,
        selectedBatch?.rate ?? selectedBatch?.transferRate,
        selectedBatch?.fromLocation,
        selectedBatch?.toLocation,
        selectedBatch?.transferDate,
      ],
      [],
      ["Serial No."],
      ...(r8ReportDetail?.serials || []).map((serialNo: string) => [serialNo]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "R8 Report Detail");
    XLSX.writeFile(
      workbook,
      `R8-Report-Detail-${selectedBatch?.batchId ?? ""}-${dayjs().format("DD-MM-YYYY")}.xlsx`,
    );
  }, [selectedBatch, r8ReportDetail]);

  const handleDateChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (range) {
      setDate({ from: range[0], to: range[1] });
    } else {
      setDate({ from: null, to: null });
    }
  };
  const onBtExport = useCallback(() => {
    gridRef.current!.api.exportDataAsExcel({
      sheetName: "R8 Report",
      fileName: `R8-Report-${dayjs().format("DD-MM-YYYY")}.xlsx`,
    });
  }, []);

  const handleSearch = () => {
    if (wise === "batchwise") {
      if (!batch) {
        showToast("Please select a batch", "error");
      } else {
        dispatch(
          getr8Report({
            wise: wise,
            batchId: batch,
          })
        );
      }
    }
    if (wise === "datewise") {
      if (!date.from || !date.to) {
        showToast("Please select a date", "error");
      } else {
        dispatch(
          getr8Report({
            wise: wise,
            from: dayjs(date.from).format("DD-MM-YYYY"),
            to: dayjs(date.to).format("DD-MM-YYYY"),
          })
        );
      }
    }
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <div className="h-[50px] min-w-[80vw]  flex items-center justify-between px-[10px] gap-[5px]">
          <div>
            {r8ReportDetail?.batchId && (
              <span>
                Batch ID: {r8ReportDetail.batchId} ({r8ReportDetail.totalSerials} Serials)
              </span>
            )}
          </div>
          <div className="flex items-center gap-[5px]">
            <MuiTooltip title="Download" placement="left">
              <LoadingButton
                variant="contained"
                disabled={!r8ReportDetail}
                onClick={onBtExportDetail}
                color="primary"
                style={{
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  minWidth: 0,
                  padding: 0,
                }}
                size="small"
              >
                <Icons.download fontSize="small" />
              </LoadingButton>
            </MuiTooltip>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
        <Divider />
        <R8ReportDetailTable />
      </Drawer>
      <div className="bg-white h-[calc(100vh-100px)] overflow-x-hidden relative flex">
        <div
          className={`transition-all flex flex-col gap-[10px] h-[calc(100vh-100px)]  border-r border-neutral-300   ${
            colapse ? "min-w-0 max-w-0" : "min-w-[400px] max-w-[400px] "
          }`}
        >
          <div
            className={`transition-all ${
              colapse ? "left-0" : "left-[400px]"
            } w-[16px] p-0  h-full top-0 bottom-0 absolute rounded-none  text-slate-600 z-[10] flex items-center justify-center`}
          >
            <Button
              onClick={() => setcolapse(!colapse)}
              className={`transition-all w-[16px] p-0 py-[35px] bg-neutral-200  rounded-none hover:bg-neutral-300/50 text-slate-600 hover:h-full shadow-sm shadow-neutral-400 duration-300   `}
            >
              {colapse ? (
                <Icons.right fontSize="small" />
              ) : (
                <Icons.left fontSize="small" />
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-[20px]  mt-[20px] p-[20px] overflow-hidden">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Filter By</InputLabel>
              <Select
                value={wise}
                onChange={(e) => setWise(e.target.value)}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Filter By"
              >
                <MenuItem value={"batchwise"}>Batch ID</MenuItem>
                <MenuItem value={"datewise"}>Date</MenuItem>
              </Select>
            </FormControl>
            {wise === "batchwise" && (
              <TextField
                label="Batch ID"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            )}
            {wise === "datewise" && (
              <RangePicker
                className="w-full  h-[50px] border-2 rounded-lg border-neutral-300 rounded-0 "
                presets={rangePresets}
                onChange={handleDateChange}
                disabledDate={(current) => current && current > dayjs()}
                placeholder={["Start date", "End Date"]}
                value={date.from && date.to ? [date.from, date.to] : null}
                format="DD-MM-YYYY"
              />
            )}
            <div className="flex items-center justify-between">
              <LoadingButton
                loading={r8ReportLoading}
                variant="contained"
                startIcon={<Icons.search fontSize="small" />}
                loadingPosition="start"
                onClick={handleSearch}
              >
                Search
              </LoadingButton>

              <MuiTooltip title="Download" placement="right">
                <LoadingButton
                  variant="contained"
                  disabled={!r8Report}
                  onClick={onBtExport}
                  color="primary"
                  style={{
                    borderRadius: "50%",
                    width: 30,
                    height: 30,
                    minWidth: 0,
                    padding: 0,
                  }}
                  size="small"
                  sx={{ zIndex: 1 }}
                >
                  <Icons.download fontSize="small" />
                </LoadingButton>
              </MuiTooltip>
            </div>
          </div>
        </div>
        <div className="w-full">
          <R8ReportTable setOpen={setOpen} gridRef={gridRef} setSelectedBatch={setSelectedBatch} />
        </div>
      </div>
    </>
  );
};

export default R8Report;
