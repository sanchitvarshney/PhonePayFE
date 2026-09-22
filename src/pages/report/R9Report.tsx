import React, { useCallback, useEffect, useRef, useState } from "react";
import { DatePicker } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";

import dayjs, { Dayjs } from "dayjs";
import { AgGridReact } from "@ag-grid-community/react";

import LoadingButton from "@mui/lab/LoadingButton";
import { useParams, useSearchParams } from "react-router-dom";
import { showToast } from "@/utils/toasterContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getr9Report } from "@/features/report/report/reportSlice";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import SelectSku, { DeviceType } from "@/components/reusable/SelectSku";
import SelectLocation, { LocationType } from "@/components/reusable/SelectLocation";

dayjs.extend(customParseFormat);

import R9ReportTable from "@/table/report/R9ReportTable";

const R9Report: React.FC = () => {
  const { device_key } = useParams<{ device_key: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { r9ReportLoading, r9Report } = useAppSelector((state) => state.report);
  const [colapse, setcolapse] = useState<boolean>(false);

  const [device, setDevice] = useState<DeviceType | null>(
    device_key ? { id: device_key, text: device_key, deviceKey: device_key } : null,
  );
  const [date, setDate] = useState<Dayjs | null>(
    searchParams.get("date") ? dayjs(searchParams.get("date"), "DD-MM-YYYY") : null,
  );
  const [location, setLocation] = useState<LocationType | null>(
    searchParams.get("location_key")
      ? { id: searchParams.get("location_key") as string, text: searchParams.get("location_key") as string }
      : null,
  );

  const gridRef = useRef<AgGridReact<any>>(null);

  const onBtExport = useCallback(() => {
    gridRef.current!.api.exportDataAsExcel({
      sheetName: "R9 Report",
    });
  }, []);

  const handleSearch = useCallback(() => {
    const deviceKey = device?.deviceKey ?? device?.device_key ?? device?.key ?? device?.id;
    if (!deviceKey) {
      showToast("Please select a device", "error");
      return;
    }

    const nextParams: Record<string, string> = {};
    if (date) nextParams.date = dayjs(date).format("DD-MM-YYYY");
    if (location?.id) nextParams.location_key = location.id;
    setSearchParams(nextParams);

    dispatch(
      getr9Report({
        deviceKey,
        date: date ? dayjs(date).format("DD-MM-YYYY") : undefined,
        locationKey: location?.id || undefined,
      }),
    );
  }, [device, date, location, dispatch, setSearchParams]);

  useEffect(() => {
    if (device_key) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device_key]);

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
          <SelectSku
            varient="outlined"
            skuType="soundBox"
            label="Search SKU"
            value={device}
            onChange={setDevice}
          />
          <DatePicker
            className="w-full  h-[50px] border-2 rounded-lg border-neutral-300 rounded-0 "
            value={date}
            onChange={(value) => setDate(value)}
            disabledDate={(current) => current && current > dayjs()}
            placeholder="Select date"
            format="DD-MM-YYYY"
          />
          <SelectLocation
            value={location}
            onChange={setLocation}
            label="Location"
          />
          <div className="flex items-center justify-between">
            <LoadingButton
              loading={r9ReportLoading}
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
                disabled={!r9Report}
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
        <R9ReportTable gridRef={gridRef} />
      </div>
    </div>
  );
};

export default R9Report;
