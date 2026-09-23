import { useSocketContext } from "@/components/context/SocketContext";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getr10Report } from "@/features/report/report/reportSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { rangePresets } from "@/utils/rangePresets";
import { showToast } from "@/utils/toasterContext";
import LoadingButton from "@mui/lab/LoadingButton";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import R10ReportTable, {
  R10LocationGroup,
  R10ProductRow,
} from "@/table/report/R10ReportTable";

const { RangePicker } = DatePicker;

const R10Report: React.FC = () => {
  const { emitDownloadR10Report } = useSocketContext();
  const dispatch = useAppDispatch();
  const { r10ReportLoading } = useAppSelector((state) => state.report);
  const [colapse, setcolapse] = useState<boolean>(false);
  const [date, setDate] = useState<{ from: Dayjs | null; to: Dayjs | null }>({
    from: null,
    to: null,
  });

  const handleDateChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (range) {
      setDate({ from: range[0], to: range[1] });
    } else {
      setDate({ from: null, to: null });
    }
  };

  const handleSearch = () => {
    if (!date.from || !date.to) {
      showToast("Please select a date range", "error");
      return;
    }
    dispatch(
      getr10Report({
        startDate: date.from.format("DD-MM-YYYY"),
        endDate: date.to.format("DD-MM-YYYY"),
      }),
    );
  };

  const getDateRange = () => ({
    startDate: date.from ? date.from.format("DD-MM-YYYY") : "",
    endDate: date.to ? date.to.format("DD-MM-YYYY") : "",
  });

  const downloadLocation = (group: R10LocationGroup) => {
    emitDownloadR10Report({
      ...getDateRange(),
      device_key: group.products.map((product) => product.SKUKEY),
      type: "both",
      location: group.locationCode,
    });
    showToast("Start downloading ", "success");
  };

  // TODO: dummy payload - confirm real socket payload contract once available
  const downloadRow = (group: R10LocationGroup, row: R10ProductRow) => {
    emitDownloadR10Report({
      ...getDateRange(),
      location: group.locationCode,
      device_key: row.SKUKEY,
    });
    showToast("Start downloading ", "success");
  };

  return (
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
          <RangePicker
            className="w-full  h-[50px] border-2 rounded-lg border-neutral-300 rounded-0 "
            presets={rangePresets}
            onChange={handleDateChange}
            disabledDate={(current) => current && current > dayjs()}
            placeholder={["Start date", "End Date"]}
            value={date.from && date.to ? [date.from, date.to] : null}
            format="DD-MM-YYYY"
          />
          <div className="flex items-center justify-between">
            <LoadingButton
              loading={r10ReportLoading}
              variant="contained"
              startIcon={<Icons.search fontSize="small" />}
              loadingPosition="start"
              onClick={handleSearch}
            >
              Search
            </LoadingButton>
          </div>
        </div>
      </div>
      <div className="w-full overflow-y-auto">
        <R10ReportTable
          onDownloadLocation={downloadLocation}
          onDownloadRow={downloadRow}
        />
      </div>
    </div>
  );
};

export default R10Report;
