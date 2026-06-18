import React, { useCallback, useRef, useState } from "react";
import { DatePicker } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs, { Dayjs } from "dayjs";
import { AgGridReact } from "@ag-grid-community/react";
import LoadingButton from "@mui/lab/LoadingButton";
import { showToast } from "@/utils/toasterContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getr6Report } from "@/features/report/report/reportSlice";
import { rangePresets } from "@/utils/rangePresets";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import SelectLocation, { LocationType } from "@/components/reusable/SelectLocation";
import R6ReportTable from "@/table/report/R6ReportTable";

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

const R6Report: React.FC = () => {
  const [colapse, setColapse] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { r6reportLoading, r6report } = useAppSelector((state) => state.report);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [date, setDate] = useState<{ from: Dayjs | null; to: Dayjs | null }>({
    from: null,
    to: null,
  });
  const [pageSize, setPageSize] = useState<number>(20);
  const gridRef = useRef<AgGridReact<any>>(null);

  const handleDateChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (range) {
      setDate({ from: range[0], to: range[1] });
    } else {
      setDate({ from: null, to: null });
    }
  };

  const fetchReport = (params: Parameters<typeof getr6Report>[0]) => {
    dispatch(getr6Report(params)).then((action) => {
      if (getr6Report.rejected.match(action)) {
        const err = action as { payload?: { message?: string }; error?: { message?: string } };
        showToast(err.payload?.message || err.error?.message || "Failed to fetch report", "error");
        return;
      }
      if (getr6Report.fulfilled.match(action)) {
        const body = action.payload?.data;
        const hasData = Array.isArray(body?.data) && body.data.length > 0;
        if (!hasData) {
          showToast(body?.message || "No data found", "error");
        }
      }
    });
  };

  const handleSearch = () => {
    if (!date.from || !date.to) {
      showToast("Please select a date range", "error");
      return;
    }
    fetchReport({
      fromDate: date.from.format("DD-MM-YYYY"),
      toDate: date.to.format("DD-MM-YYYY"),
      location: location?.id,
      page: 1,
      limit: pageSize,
    });
  };

  const handlePageChange = (page: number) => {
    if (!date.from || !date.to) return;
    fetchReport({
      fromDate: date.from.format("DD-MM-YYYY"),
      toDate: date.to.format("DD-MM-YYYY"),
      location: location?.id,
      page,
      limit: pageSize,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    if (!date.from || !date.to) return;
    fetchReport({
      fromDate: date.from.format("DD-MM-YYYY"),
      toDate: date.to.format("DD-MM-YYYY"),
      location: location?.id,
      page: 1,
      limit: newPageSize,
    });
  };

  const onBtExport = useCallback(() => {
    gridRef.current!.api.exportDataAsExcel({ sheetName: "R6 Report" });
  }, []);

  const hasData = (r6report?.data?.length ?? 0) > 0;

  return (
    <div className="bg-white h-[calc(100vh-100px)] flex relative">
      <div
        className={`transition-all flex flex-col gap-[10px] h-[calc(100vh-100px)] border-r border-neutral-300 ${
          colapse ? "min-w-0 max-w-0" : "min-w-[400px] max-w-[400px]"
        }`}
      >
        <div
          className={`transition-all ${
            colapse ? "left-0" : "left-[400px]"
          } w-[16px] p-0 h-full top-0 bottom-0 absolute rounded-none text-slate-600 z-[10] flex items-center justify-center`}
        >
          <Button
            onClick={() => setColapse(!colapse)}
            className="transition-all w-[16px] p-0 py-[35px] bg-neutral-200 rounded-none hover:bg-neutral-300/50 text-slate-600 hover:h-full shadow-sm shadow-neutral-400 duration-300"
          >
            {colapse ? <Icons.right fontSize="small" /> : <Icons.left fontSize="small" />}
          </Button>
        </div>

        <div className="flex gap-[20px] flex-col p-[20px] overflow-hidden mt-[20px]">
          <SelectLocation
            value={location}
            onChange={(e) => setLocation(e)}
            label="-- Location (Optional) --"
          />
          <RangePicker
            className="w-full h-[55px] border-2 rounded-lg border-neutral-300"
            presets={rangePresets}
            onChange={handleDateChange}
            disabledDate={(current) => current && current > dayjs()}
            placeholder={["Start date", "End Date"]}
            value={date.from && date.to ? [date.from, date.to] : null}
            format="DD/MM/YYYY"
          />
          <div className="flex justify-between items-center">
            <LoadingButton
              loading={r6reportLoading}
              variant="contained"
              startIcon={<Icons.search fontSize="small" />}
              loadingPosition="start"
              onClick={handleSearch}
            >
              Search
            </LoadingButton>
            <MuiTooltip title="Export Excel" placement="right">
              <LoadingButton
                variant="contained"
                disabled={!hasData}
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
        <R6ReportTable
          gridRef={gridRef}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
};

export default R6Report;
