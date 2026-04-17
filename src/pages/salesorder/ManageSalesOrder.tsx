import React, { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import { ColDef } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import LoadingButton from "@mui/lab/LoadingButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  fetchSalesOrder,
  setSalesOrderDateRange,
} from "@/features/salesOrder/salesOrderSlice";
import { showToast } from "@/utils/toasterContext";

const ManageSalesOrder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, manageSalesOrderData, dateRange } = useAppSelector(
    (state) => state.salesOrder,
  );
  const [colapse, setcolapse] = useState<boolean>(false);
  const [type, setType] = useState<string>("datewise");
  const [salesOrderNo, setSalesOrderNo] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null);

  const rowData = useMemo(() => {
    if (Array.isArray(manageSalesOrderData?.data)) return manageSalesOrderData.data;
    if (Array.isArray(manageSalesOrderData?.response)) return manageSalesOrderData.response;
    if (Array.isArray(manageSalesOrderData)) return manageSalesOrderData;
    return [];
  }, [manageSalesOrderData]);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "#",
        width: 90,
        valueGetter: "node.rowIndex + 1",
      },
      {
        headerName: "Sales Order No",
        field: "salesOrderNo",
        sortable: true,
        filter: true,
        valueGetter: (params) =>
          params.data?.salesOrderNo ??
          params.data?.sales_order_no ??
          params.data?.so_transaction ??
          params.data?.transaction_id ??
          params.data?.salesOrder ??
          "",
      },
      {
        headerName: "Date",
        field: "createdDate",
        sortable: true,
        filter: true,
        valueGetter: (params) =>
          params.data?.createdDate ??
          params.data?.created_at ??
          params.data?.so_date ??
          params.data?.date ??
          "",
      },
      {
        headerName: "Party / Customer",
        field: "customerName",
        sortable: true,
        filter: true,
        valueGetter: (params) =>
          params.data?.customerName ??
          params.data?.customer_name ??
          params.data?.vendor_name ??
          "",
      },
      {
        headerName: "SKU",
        field: "sku",
        sortable: true,
        filter: true,
        valueGetter: (params) => params.data?.sku ?? params.data?.partcode ?? "",
      },
      {
        headerName: "Qty",
        field: "qty",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Rate",
        field: "rate",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Amount",
        field: "amount",
        sortable: true,
        filter: true,
        valueGetter: (params) =>
          params.data?.amount ??
          Number(params.data?.qty ?? 0) * Number(params.data?.rate ?? 0),
      },
    ],
    [],
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

  const handleSearch = () => {
    if (type === "datewise") {
      if (!date) {
        showToast("Please select date", "error");
        return;
      }
      const data = dayjs(date).format("DD-MM-YYYY");
      dispatch(setSalesOrderDateRange(data));
      dispatch(fetchSalesOrder({ wise: "datewise", data }));
      return;
    }

    if (!salesOrderNo.trim()) {
      showToast("Please enter sales order number", "error");
      return;
    }

    dispatch(setSalesOrderDateRange(salesOrderNo.trim()));
    dispatch(fetchSalesOrder({ wise: "salesorderwise", data: salesOrderNo.trim() }));
  };

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
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <MenuItem value="datewise">Date</MenuItem>
                <MenuItem value="salesorderwise">Sales Order</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="p-[10px]">
            {type === "datewise" ? (
              <div className="flex flex-col gap-[20px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    enableAccessibleFieldDOMStructure={false}
                    format="DD-MM-YYYY"
                    maxDate={dayjs()}
                    slots={{ textField: TextField }}
                    slotProps={{ textField: { fullWidth: true, label: "Date" } }}
                    value={date}
                    onChange={(value) => setDate(value)}
                  />
                </LocalizationProvider>
                <LoadingButton
                  loadingPosition="start"
                  onClick={handleSearch}
                  variant="contained"
                  loading={loading}
                  startIcon={<SearchIcon fontSize="small" />}
                >
                  Search
                </LoadingButton>
              </div>
            ) : (
              <div className="flex flex-col gap-[20px]">
                <TextField
                  label="Sales Order Number"
                  value={salesOrderNo}
                  onChange={(e) => setSalesOrderNo(e.target.value)}
                />
                <LoadingButton
                  className="max-w-max"
                  variant="contained"
                  loading={loading}
                  onClick={handleSearch}
                  startIcon={<SearchIcon fontSize="small" />}
                >
                  Search
                </LoadingButton>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="relative ag-theme-quartz h-[calc(100vh-150px)]">
          <AgGridReact
            loadingOverlayComponent={CustomLoadingOverlay}
            loading={loading}
            overlayNoRowsTemplate={OverlayNoRowsTemplate}
            suppressCellFocus
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            enableCellTextSelection
          />
        </div>
        {dateRange ? (
          <div className="px-4 py-2 text-sm text-slate-500 border-t">
            Last search: {dateRange}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ManageSalesOrder;
