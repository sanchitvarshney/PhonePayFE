import React, { useCallback, useMemo, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import dayjs, { Dayjs } from "dayjs";
import { ColDef } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import {
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import RangeSelect from "@/components/reusable/antSelecters/RangeSelect";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getBulkDeviceInwardList } from "@/features/bulkDeviceInward/bulkDeviceInwardSlice";
import {
  getChallanNo,
  getChallanQty,
  getRemainingQty,
  getUploadedQty,
} from "@/features/bulkDeviceInward/bulkDeviceInwardHelpers";
import { showToast } from "@/utils/toasterContext";
import UploadSerialNoDrawer from "@/components/Drawers/bulkDeviceInward/UploadSerialNoDrawer";
import BatchListDrawer from "@/components/Drawers/bulkDeviceInward/BatchListDrawer";

type SearchParams =
  | { wise: "datewise"; from: string; to: string }
  | { wise: "challanwise"; data: string };

const ManageBulkDeviceInward: React.FC = () => {
  const dispatch = useAppDispatch();
  const { manageList, manageListLoading } = useAppSelector(
    (state) => state.bulkDeviceInward,
  );
  const [colapse, setcolapse] = useState<boolean>(false);
  const [wise, setWise] = useState<"datewise" | "challanwise">("datewise");
  const [challanRef, setChallanRef] = useState("");
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs());
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<SearchParams | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [batchDrawerOpen, setBatchDrawerOpen] = useState(false);

  const handleMenuClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, rowData: any) => {
      setAnchorEl(event.currentTarget);
      setSelectedRow(rowData);
    },
    [],
  );

  const closeMenu = () => setAnchorEl(null);

  const rowData = useMemo(
    () => (Array.isArray(manageList) ? manageList : []),
    [manageList],
  );

  const runSearch = (params: SearchParams) => {
    setLastParams(params);
    setLastQuery(
      params.wise === "datewise"
        ? `${params.from} to ${params.to}`
        : params.data,
    );
    dispatch(getBulkDeviceInwardList(params));
  };

  const handleSearch = () => {
    if (wise === "datewise") {
      if (!fromDate || !toDate) {
        showToast("Please select from and to dates", "error");
        return;
      }
      if (dayjs(fromDate).isAfter(dayjs(toDate), "day")) {
        showToast("From date cannot be after to date", "error");
        return;
      }
      runSearch({
        wise: "datewise",
        from: dayjs(fromDate).format("DD-MM-YYYY"),
        to: dayjs(toDate).format("DD-MM-YYYY"),
      });
      return;
    }

    if (!challanRef.trim()) {
      showToast("Please enter challan number", "error");
      return;
    }
    runSearch({ wise: "challanwise", data: challanRef.trim() });
  };

  const refetchLastSearch = () => {
    if (lastParams) dispatch(getBulkDeviceInwardList(lastParams));
  };

  const handleUploadSerial = () => {
    if (getRemainingQty(selectedRow) <= 0) {
      showToast("This challan is already fully serialized", "error");
      closeMenu();
      return;
    }
    setUploadDrawerOpen(true);
    closeMenu();
  };

  const handleView = () => {
    setBatchDrawerOpen(true);
    closeMenu();
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "",
        sortable: false,
        filter: false,
        width: 60,
        cellRenderer: (params: { data: any }) => (
          <IconButton
            size="small"
            onClick={(event) => handleMenuClick(event, params.data)}
            className="hover:bg-gray-100"
          >
            <MoreVertIcon className="h-4 w-4" />
          </IconButton>
        ),
      },
      { headerName: "#", width: 70, valueGetter: "node.rowIndex + 1" },
      {
        headerName: "Transation ID",
        flex: 1,
        minWidth: 160,
        valueGetter: (params) => params.data?.minNo ?? "",
      },
      {
        headerName: "Challan No",
        flex: 1,
        minWidth: 160,
        valueGetter: (params) => getChallanNo(params.data),
      },

      {
        headerName: "Challan Date",
        minWidth: 130,
        valueGetter: (params) =>
          params.data?.challanDate ?? params.data?.challan_date ?? "",
      },
      {
        headerName: "SKU",
        flex: 1,
        minWidth: 140,
        valueGetter: (params) => params.data?.deviceSku ?? "",
      },
      {
        headerName: "Qty",
        width: 100,
        valueGetter: (params) => getChallanQty(params.data),
      },
      {
        headerName: "Rate",
        width: 100,
        valueGetter: (params) => params.data?.rate ?? "",
      },
      {
        headerName: "Inward Qty",
        width: 120,
        valueGetter: (params) => getUploadedQty(params.data),
      },
      {
        headerName: "Pending Qty",
        width: 120,
        valueGetter: (params) => getRemainingQty(params.data),
      },
      {
        headerName: "Inserted By",
        minWidth: 130,
        valueGetter: (params) => params.data?.insertBy ?? "",
      },
    ],
    [handleMenuClick],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      filter: true,
      resizable: true,
      sortable: true,
      floatingFilter: true,
    }),
    [],
  );

  return (
    <div className="flex bg-white h-[calc(100vh-100px)] relative">
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
            onClick={() => setcolapse(!colapse)}
            className="transition-all w-[16px] p-0 py-[35px] bg-neutral-200 rounded-none hover:bg-neutral-300/50 text-slate-600 hover:h-full shadow-sm shadow-neutral-400 duration-300"
          >
            {colapse ? (
              <Icons.right fontSize="small" />
            ) : (
              <Icons.left fontSize="small" />
            )}
          </Button>
        </div>
        <div className="overflow-x-hidden overflow-y-auto">
          <div className="flex items-center gap-[10px] p-[10px] mt-[20px]">
            <FormControl fullWidth>
              <Select
                value={wise}
                onChange={(e) => {
                  setWise(e.target.value as "datewise" | "challanwise");
                  setChallanRef("");
                }}
              >
                <MenuItem value="datewise">Date Range</MenuItem>
                <MenuItem value="challanwise">Challan No</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="p-[10px] flex flex-col gap-[20px]">
            {wise === "datewise" ? (
              <RangeSelect
                value={{ from: fromDate, to: toDate }}
                onChange={(dates) => {
                  setFromDate(dates.from);
                  setToDate(dates.to);
                }}
                format="DD-MM-YYYY"
                placeholder={["From Date", "To Date"]}
                disabledDate={(current) =>
                  Boolean(current && current.isAfter(dayjs(), "day"))
                }
              />
            ) : (
              <TextField
                label="Challan Number"
                value={challanRef}
                onChange={(e) => setChallanRef(e.target.value)}
                placeholder="e.g. CH/26-27/0001"
                fullWidth
              />
            )}
            <LoadingButton
              className="max-w-max"
              variant="contained"
              loading={manageListLoading}
              onClick={handleSearch}
              startIcon={<SearchIcon fontSize="small" />}
            >
              Search
            </LoadingButton>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col">
        <div className="relative ag-theme-quartz flex-1 min-h-0 h-[calc(100vh-150px)]">
          <AgGridReact
            loadingOverlayComponent={CustomLoadingOverlay}
            loading={manageListLoading}
            overlayNoRowsTemplate={OverlayNoRowsTemplate}
            suppressCellFocus
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            enableCellTextSelection
          />
        </div>
        {lastQuery ? (
          <div className="px-4 py-2 text-sm text-slate-500 border-t">
            Last search: {lastQuery}
          </div>
        ) : null}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={handleUploadSerial}
            disabled={getRemainingQty(selectedRow) <= 0}
          >
            Upload Serial No
          </MenuItem>
          <MenuItem onClick={handleView}>View</MenuItem>
        </Menu>
      </div>
      <UploadSerialNoDrawer
        open={uploadDrawerOpen}
        row={selectedRow}
        onClose={() => setUploadDrawerOpen(false)}
        onSuccess={() => {
          setUploadDrawerOpen(false);
          refetchLastSearch();
        }}
      />
      <BatchListDrawer
        open={batchDrawerOpen}
        row={selectedRow}
        onClose={() => setBatchDrawerOpen(false)}
      />
    </div>
  );
};

export default ManageBulkDeviceInward;
