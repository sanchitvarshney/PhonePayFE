import React, { useCallback, useEffect, useRef, useState } from "react";
import { DatePicker } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";

import dayjs, { Dayjs } from "dayjs";
import { AgGridReact } from "@ag-grid-community/react";

import LoadingButton from "@mui/lab/LoadingButton";
import { useParams, useSearchParams } from "react-router-dom";
import { Divider, Drawer } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { showToast } from "@/utils/toasterContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { useSocketContext } from "@/components/context/SocketContext";
import { getr9Report, getr9SerialAgeing } from "@/features/report/report/reportSlice";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import SelectSku, { DeviceType } from "@/components/reusable/SelectSku";

dayjs.extend(customParseFormat);

import R9ReportTable from "@/table/report/R9ReportTable";
import R9SerialAgeingTable from "@/table/report/R9SerialAgeingTable";

const R9Report: React.FC = () => {
  const { device_key } = useParams<{ device_key: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { r9ReportLoading, r9Report, r9SerialAgeing } = useAppSelector(
    (state) => state.report,
  );
  const { emitDownloadR9Report, isConnected } = useSocketContext();
  const [colapse, setcolapse] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<{
    stage: string;
    transaction_type: string;
  } | null>(null);

  const [device, setDevice] = useState<DeviceType | null>(
    device_key ? { id: device_key, text: device_key, deviceKey: device_key } : null,
  );
  const [date, setDate] = useState<Dayjs | null>(
    searchParams.get("date") ? dayjs(searchParams.get("date"), "DD-MM-YYYY") : null,
  );
  const detailGridRef = useRef<AgGridReact<any>>(null);

  const handleClose = () => setOpen(false);

  const onBtExportDetail = useCallback(() => {
    const sku = r9Report?.data?.device?.sku ?? "";
    detailGridRef.current!.api.exportDataAsExcel({
      sheetName: "Serial Ageing",
      fileName: `Serial-Ageing-${sku}-${selectedStage?.transaction_type ?? ""}-${dayjs().format("DD-MM-YYYY")}.xlsx`,
    });
  }, [selectedStage, r9Report]);

  const getDeviceKey = () =>
    device?.deviceKey ?? device?.device_key ?? device?.key ?? device?.id;

  const handleSearch = useCallback(() => {
    const deviceKey = getDeviceKey();
    if (!deviceKey) {
      showToast("Please select a device", "error");
      return;
    }

    const nextParams: Record<string, string> = {};
    if (date) nextParams.date = dayjs(date).format("DD-MM-YYYY");
    setSearchParams(nextParams);

    dispatch(
      getr9Report({
        deviceKey,
        date: date ? dayjs(date).format("DD-MM-YYYY") : undefined,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, date, dispatch, setSearchParams]);

  const downloadStockReport = () => {
    const deviceKey = getDeviceKey();
    if (!deviceKey) {
      showToast("Please select a device", "error");
      return;
    }
    if (!date) {
      showToast("Please select date", "error");
      return;
    }
    emitDownloadR9Report({
      date: dayjs(date).format("DD-MM-YYYY"),
      device_key: deviceKey,
    });
    showToast("Start downloading ", "success");
  };

  const handleView = (stage: { stage: string; transaction_type: string }) => {
    const deviceKey = getDeviceKey();
    if (!deviceKey) return;
    setSelectedStage(stage);
    setOpen(true);
    dispatch(
      getr9SerialAgeing({
        deviceKey,
        date: date ? dayjs(date).format("DD-MM-YYYY") : undefined,
        transactionType: stage.transaction_type,
      }),
    );
  };

  useEffect(() => {
    if (device_key) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device_key]);

  return (
    <>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <div className="h-[50px] min-w-[80vw]  flex items-center justify-between px-[10px] gap-[5px]">
          <div>
            {selectedStage && (
              <span>
                Stage: {selectedStage.stage} (
                {r9SerialAgeing?.data?.total_count ?? 0} Serials) as on{" "}
                {r9SerialAgeing?.data?.target_date}
              </span>
            )}
          </div>
          <div className="flex items-center gap-[5px]">
            <MuiTooltip title="Download" placement="left">
              <LoadingButton
                variant="contained"
                disabled={!r9SerialAgeing}
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
        <R9SerialAgeingTable gridRef={detailGridRef} />
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
                  disabled={!isConnected}
                  onClick={downloadStockReport}
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
        <div className="w-full flex flex-col">
          {r9Report?.data?.device && (
            <div className="h-[41px] flex items-center gap-[20px] px-[20px] border-b border-neutral-300 bg-slate-50">
              <span className="text-[14px]">
                SKU: <b>{r9Report.data.device.sku}</b>
              </span>
              <span className="text-[14px]">
                SKU Name: <b>{r9Report.data.device.sku_name}</b>
              </span>
            </div>
          )}
          <R9ReportTable onView={handleView} />
        </div>
      </div>
    </>
  );
};

export default R9Report;
