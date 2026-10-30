import React, { useCallback, useRef, useState } from "react";
import { DatePicker } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs, { Dayjs } from "dayjs";
import { AgGridReact } from "@ag-grid-community/react";
import type { ColDef } from "@ag-grid-community/core";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import LoadingButton from "@mui/lab/LoadingButton";
import { VisibilityOutlined } from "@mui/icons-material";
import { showToast } from "@/utils/toasterContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { rangePresets } from "@/utils/rangePresets";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { getWrongDeviceVideoReport } from "@/features/delivery/deliverySlice";
import type { WrongDeviceRow } from "@/features/delivery/deliveryType";
import { centerAlignedColumn, leftAlignedColumn } from "@/utils/agGridAlignUtils";
import { DELIVERY_PARTNERS } from "./delivery.constants";

ModuleRegistry.registerModules([ExcelExportModule]);

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

const defaultColDef: ColDef<WrongDeviceRow> = {
  sortable: true,
  filter: true,
  flex: 1,
  wrapText: true,
  autoHeight: true,
  wrapHeaderText: true,
  autoHeaderHeight: true,
  ...leftAlignedColumn,
};

const columnDefs: ColDef<WrongDeviceRow>[] = [
  {
    headerName: "#",
    flex: 0,
    width: 80,
    valueGetter: "node.rowIndex+1",
    ...centerAlignedColumn,
  },
  { headerName: "AWB", field: "awb" },
  {
    headerName: "Partner",
    field: "deliveryPartner",
    valueFormatter: (params) =>
      DELIVERY_PARTNERS.find((p) => p.value === params.value)?.text ?? params.value ?? "",
  },
  {
    headerName: "Duration",
    field: "videoDuration",
    valueFormatter: (params) => (params.value != null ? `${params.value}s` : ""),
  },
  {
    headerName: "Insert Date",
    field: "insertDate",
    valueFormatter: (params) =>
      params.value ? dayjs(params.value).format("DD-MM-YYYY hh:mm A") : "",
  },
  { headerName: "URL", field: "videoUrl", hide: true },
  { headerName: "Insert By", field: "insertedBy" },
  { headerName: "Remark", field: "remark", flex: 2 },
  {
    headerName: "Action",
    sortable: false,
    filter: false,
    minWidth: 150,
    cellRenderer: (params: { data?: WrongDeviceRow }) => (
      <div className="flex gap-[10px] items-center">
        <Button
          variant="secondary"
          disabled={!params.data?.videoUrl}
          onClick={() => {
            if (params.data?.videoUrl) {
              window.open(params.data.videoUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          <VisibilityOutlined fontSize="small" />
          <span className="ml-1">View Video</span>
        </Button>
      </div>
    ),
  },
];

const WrongDeviceReport: React.FC = () => {
  const [colapse, setcolapse] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { wrongDeviceList, wrongDeviceLoading } = useAppSelector((state) => state.delivery);

  const [date, setDate] = useState<{ from: Dayjs | null; to: Dayjs | null }>({
    from: null,
    to: null,
  });

  const gridRef = useRef<AgGridReact<WrongDeviceRow>>(null);

  const handleDateChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (range) {
      setDate({ from: range[0], to: range[1] });
    } else {
      setDate({ from: null, to: null });
    }
  };

  const onBtExport = useCallback(() => {
    gridRef.current?.api.exportDataAsExcel({
      sheetName: "Wrong Device Report",
      fileName: "Wrong Device Report.xlsx",
      allColumns: true,
    });
  }, []);

  const handleSearch = () => {
    if (!date.from || !date.to) {
      showToast("Please select a date", "error");
      return;
    }
    dispatch(
      getWrongDeviceVideoReport({
        fromDate: date.from.format("YYYY-MM-DD"),
        toDate: date.to.format("YYYY-MM-DD"),
      })
    );
  };

  return (
    <div className="bg-white h-full flex relative">
      <div
        className={`transition-all flex flex-col gap-[10px] h-full  border-r border-neutral-300   ${
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
            {colapse ? <Icons.right fontSize="small" /> : <Icons.left fontSize="small" />}
          </Button>
        </div>
        <div className="flex  gap-[20px] flex-col   p-[20px] overflow-hidden mt-[20px]">
          <RangePicker
            className="w-full h-[55px] border-2 border-neutral-300 rounded-0 "
            presets={rangePresets}
            onChange={handleDateChange}
            disabledDate={(current) => current && current > dayjs()}
            placeholder={["Start date", "End Date"]}
            value={date.from && date.to ? [date.from, date.to] : null}
            format="DD/MM/YYYY"
          />

          <div className="flex justify-between items-center">
            <div className="flex gap-[10px]">
              <LoadingButton
                loading={wrongDeviceLoading}
                variant="contained"
                startIcon={<Icons.search fontSize="small" />}
                loadingPosition="start"
                onClick={handleSearch}
              >
                Search
              </LoadingButton>
            </div>
            <MuiTooltip title="Download" placement="right">
              <LoadingButton
                variant="contained"
                disabled={!wrongDeviceList?.length}
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
      <div className="w-full relative ag-theme-quartz h-full">
        <AgGridReact
          ref={gridRef}
          loadingOverlayComponent={CustomLoadingOverlay}
          loading={wrongDeviceLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={wrongDeviceList || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={100}
          enableCellTextSelection
        />
      </div>
    </div>
  );
};

export default WrongDeviceReport;
