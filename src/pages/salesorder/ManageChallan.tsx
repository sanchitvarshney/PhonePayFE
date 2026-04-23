import React, { useCallback, useMemo, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import dayjs, { Dayjs } from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import { ColDef } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormControl, IconButton, Menu, MenuItem, Select, TextField } from "@mui/material";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import RangeSelect from "@/components/reusable/antSelecters/RangeSelect";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { challanPrint, fetchChallan } from "@/features/salesOrder/salesOrderSlice";
import { showToast } from "@/utils/toasterContext";
import { useNavigate } from "react-router-dom";

const getChallanNumber = (rowData: any): string => {
  return (
    rowData?.challanNo ??
    rowData?.challan_no ??
    rowData?.challanNumber ??
    rowData?.challan_number ??
    rowData?.so_challan ??
    rowData?.transaction_id ??
    ""
  );
};

const ManageChallan: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { challanLoading, manageChallanData } = useAppSelector((state) => state.salesOrder);
  const [colapse, setcolapse] = useState<boolean>(false);
  const [wise, setWise] = useState<string>("datewise");
  const [challanRef, setChallanRef] = useState("");
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs());
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [printLoading, setPrintLoading] = useState(false);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, rowData: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowData);
  }, []);

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const rowData = useMemo(() => {
    if (Array.isArray(manageChallanData?.data)) return manageChallanData.data;
    if (Array.isArray(manageChallanData?.response)) return manageChallanData.response;
    if (Array.isArray(manageChallanData)) return manageChallanData;
    return [];
  }, [manageChallanData]);

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
      const from = dayjs(fromDate).format("DD-MM-YYYY");
      const to = dayjs(toDate).format("DD-MM-YYYY");
      setLastQuery(`${from} to ${to}`);
      dispatch(fetchChallan({ wise, from, to }));
      return;
    }

    if (!challanRef.trim()) {
      showToast("Please enter challan number or reference", "error");
      return;
    }
    setLastQuery(challanRef.trim());
    dispatch(fetchChallan({ wise, data: challanRef.trim() }));
  };

  const handlePrint = async () => {
    const challanNo = getChallanNumber(selectedRow);
    if (!challanNo) {
      showToast("Challan number not found on this row", "error");
      closeMenu();
      return;
    }
    setPrintLoading(true);
    const result: any = await dispatch(challanPrint({ challanNo }));
    setPrintLoading(false);
    if (challanPrint.fulfilled.match(result)) {
      showToast(result.payload.message, "success");
    } else {
      const msg =
        result?.payload?.message ||
        result?.error?.message ||
        "Failed to open challan PDF";
      showToast(String(msg), "error");
    }
    closeMenu();
  };

  const handleCreateDispatch = () => {
    const challanNo = getChallanNumber(selectedRow);
    if (!challanNo) {
      showToast("Challan number not found on this row", "error");
      closeMenu();
      return;
    }
    navigate(`/sales-order/create-dispatch/${encodeURIComponent(challanNo)}`);
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
      {
        headerName: "#",
        width: 70,
        valueGetter: "node.rowIndex + 1",
      },
      {
        headerName: "Challan No",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 160,
        valueGetter: (params) => getChallanNumber(params.data),
      },
      {
        headerName: "Sales Order",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 140,
        valueGetter: (params) =>
          params.data?.salesOrder ??
          params.data?.sales_order ??
          params.data?.salesOrderNo ??
          params.data?.sales_order_no ??
          "",
      },
      {
        headerName: "Challan Date",
        sortable: true,
        filter: true,
        minWidth: 120,
        valueGetter: (params) =>
          params.data?.challan_date ??
          params.data?.challanDate ??
          params.data?.createdDate ??
          params.data?.date ??
          "",
      },
      {
        headerName: "Qty",
        sortable: true,
        filter: true,
        width: 90,
        valueGetter: (params) => params.data?.qty ?? params.data?.quantity ?? "",
      },
      {
        headerName: "Box ID",
        sortable: true,
        filter: true,
        minWidth: 120,
        valueGetter: (params) =>
          params.data?.boxId ?? params.data?.box_id ?? params.data?.boxNo ?? "",
      },
      {
        headerName: "Is Dispatched",
        field: "isDispatched",
        sortable: true,
        filter: true,
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
            {colapse ? <Icons.right fontSize="small" /> : <Icons.left fontSize="small" />}
          </Button>
        </div>
        <div className="overflow-x-hidden overflow-y-auto">
          <div className="flex items-center gap-[10px] p-[10px] mt-[20px]">
            <FormControl fullWidth>
              <Select value={wise} onChange={(e) => setWise(e.target.value)} label="Search by">
                <MenuItem value="datewise">Date Range</MenuItem>
                <MenuItem value="challanwise">Challan</MenuItem>
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
                label="Challan / reference"
                value={challanRef}
                onChange={(e) => setChallanRef(e.target.value)}
                placeholder="e.g. SO_CH/26-27/0001"
                fullWidth
              />
            )}
            <LoadingButton
              className="max-w-max"
              variant="contained"
              loading={challanLoading}
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
            loading={challanLoading}
            overlayNoRowsTemplate={OverlayNoRowsTemplate}
            suppressCellFocus
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            enableCellTextSelection
          />
        </div>
        {lastQuery ? (
          <div className="px-4 py-2 text-sm text-slate-500 border-t">Last search: {lastQuery}</div>
        ) : null}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleCreateDispatch}>Create Dispatch</MenuItem>
          <MenuItem onClick={handlePrint} disabled={printLoading}>
            Print
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default ManageChallan;
