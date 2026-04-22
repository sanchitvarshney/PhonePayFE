import React, { useMemo, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import dayjs, { Dayjs } from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import { ColDef } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import LoadingButton from "@mui/lab/LoadingButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  cancelSalesOrder,
  createChallan,
  fetchSalesOrder,
  fetchSalesOrderDetails,
  setSalesOrderDateRange,
} from "@/features/salesOrder/salesOrderSlice";
import { showToast } from "@/utils/toasterContext";
import { useNavigate } from "react-router-dom";

const ManageSalesOrder: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, cancelLoading, manageSalesOrderData, dateRange } = useAppSelector(
    (state) => state.salesOrder,
  );
  const [colapse, setcolapse] = useState<boolean>(false);
  const [type, setType] = useState<string>("datewise");
  const [salesOrderNo, setSalesOrderNo] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false);
  const [cancelRemark, setCancelRemark] = useState<string>("");
  const [openChallanModal, setOpenChallanModal] = useState<boolean>(false);
  const [challanSourceDetails, setChallanSourceDetails] = useState<any>(null);
  const [challanQty, setChallanQty] = useState<string>("");
  const [placeOfSupply, setPlaceOfSupply] = useState<string>("");
  const [stateCode, setStateCode] = useState<string>("");
  const [challanDate, setChallanDate] = useState<Dayjs | null>(null);
  const [boxId, setBoxId] = useState<string>("");

  const getSalesOrderNumber = (rowData: any): string => {
    return (
      rowData?.salesOrderNo ??
      rowData?.sales_order_no ??
      rowData?.so_transaction ??
      rowData?.transaction_id ??
      rowData?.salesOrder ??
      ""
    );
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    rowData: any,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowData);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const buildSearchData = () => {
    if (type === "datewise") {
      if (date) return dayjs(date).format("DD-MM-YYYY");
      return dateRange;
    }
    return salesOrderNo.trim() || dateRange;
  };

  const refetchList = () => {
    const data = buildSearchData();
    if (!data) return;
    dispatch(fetchSalesOrder({ wise: type, data }));
  };

  const rowData = useMemo(() => {
    if (Array.isArray(manageSalesOrderData?.data)) return manageSalesOrderData.data;
    if (Array.isArray(manageSalesOrderData?.response)) return manageSalesOrderData.response;
    if (Array.isArray(manageSalesOrderData)) return manageSalesOrderData;
    return [];
  }, [manageSalesOrderData]);

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
        width: 90,
        valueGetter: "node.rowIndex + 1",
      },
      {
        headerName: "Sales Order No",
        field: "salesOrderNo",
        sortable: true,
        filter: true,
        valueGetter: (params) =>
          getSalesOrderNumber(params.data),
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

  const handleCreateChallan = async () => {
    const salesOrder = getSalesOrderNumber(selectedRow);
    if (!salesOrder) {
      showToast("Sales order number not found", "error");
      return;
    }

    const detailsResponse: any = await dispatch(fetchSalesOrderDetails({ salesOrder }));
    const responseData =
      detailsResponse?.payload?.data?.data ??
      detailsResponse?.payload?.data?.response ??
      detailsResponse?.payload?.data;
    const details = Array.isArray(responseData)
      ? responseData[0]
      : Array.isArray(responseData?.data)
        ? responseData.data[0]
        : responseData;

    setChallanSourceDetails(details ?? null);
    setChallanQty(String(details?.qty ?? selectedRow?.qty ?? ""));
    setPlaceOfSupply("");
    setStateCode("");
    setChallanDate(null);
    setBoxId("");
    setOpenChallanModal(true);
    closeMenu();
  };

  const handleEdit = async () => {
    const salesOrder = getSalesOrderNumber(selectedRow);
    if (!salesOrder) {
      showToast("Sales order number not found", "error");
      return;
    }
    await dispatch(fetchSalesOrderDetails({ salesOrder }));
    closeMenu();
    navigate(`/sales-order/edit/${encodeURIComponent(salesOrder)}`);
  };

  const handleCancelClick = () => {
    setOpenCancelModal(true);
    closeMenu();
  };

  const handleCloseCancelModal = () => {
    setOpenCancelModal(false);
    setCancelRemark("");
  };

  const handleSubmitCancel = async () => {
    const salesOrder = getSalesOrderNumber(selectedRow);
    if (!salesOrder) {
      showToast("Sales order number not found", "error");
      return;
    }

    if (!cancelRemark.trim()) {
      showToast("Please enter remarks", "error");
      return;
    }

    const response: any = await dispatch(
      cancelSalesOrder({
        salesOrder,
        remark: cancelRemark.trim(),
      }),
    );

    if (response?.payload?.data?.success) {
      showToast(response.payload.data.message || "Sales order cancelled successfully", "success");
      handleCloseCancelModal();
      refetchList();
      return;
    }

    showToast(response?.payload?.data?.message || "Failed to cancel sales order", "error");
  };

  const handleCloseChallanModal = () => {
    setOpenChallanModal(false);
    setChallanSourceDetails(null);
    setChallanQty("");
    setPlaceOfSupply("");
    setStateCode("");
    setChallanDate(null);
    setBoxId("");
  };

  const handleSubmitCreateChallan = async () => {
    const salesOrder = getSalesOrderNumber(selectedRow);
    if (!salesOrder) {
      showToast("Sales order number not found", "error");
      return;
    }

    if (!placeOfSupply.trim()) {
      showToast("Please enter place of supply", "error");
      return;
    }
    if (!stateCode.trim()) {
      showToast("Please enter state code", "error");
      return;
    }
    if (!challanDate) {
      showToast("Please select challan date", "error");
      return;
    }
    if (!boxId.trim()) {
      showToast("Please enter box ID", "error");
      return;
    }
    if (!challanQty.trim() || Number(challanQty) <= 0) {
      showToast("Please enter valid qty", "error");
      return;
    }

    const payload = {
      salesOrder,
      qty: String(challanQty).trim(),
      placeOfSupply: placeOfSupply.trim(),
      stateCode: stateCode.trim(),
      challan_date: dayjs(challanDate).format("DD-MM-YYYY"),
      boxId: boxId.trim(),
    };

    const response: any = await dispatch(createChallan(payload));
    if (response?.payload?.data?.success) {
      showToast(response.payload.data.message ?? "Challan created successfully", "success");
      handleCloseChallanModal();
      return;
    }
    showToast(response?.payload?.data?.message || "Failed to create challan", "error");
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
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleCreateChallan}>Create Challan</MenuItem>
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleCancelClick}>Cancel</MenuItem>
        </Menu>

        <Dialog
          open={openCancelModal}
          onClose={handleCloseCancelModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cancel Sales Order</DialogTitle>
          <DialogContent>
            <div className="mt-4">
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={4}
                value={cancelRemark}
                onChange={(event) => setCancelRemark(event.target.value)}
                required
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCancelModal}>Close</Button>
            <LoadingButton
              onClick={handleSubmitCancel}
              loading={cancelLoading}
              variant="contained"
              color="error"
            >
              Submit
            </LoadingButton>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openChallanModal}
          onClose={handleCloseChallanModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create Challan</DialogTitle>
          <DialogContent>
            <div className="mt-2 mb-5 rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <Typography className="text-slate-500 text-xs uppercase tracking-wide">
                  Source Sales Order
                </Typography>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  {getSalesOrderNumber(selectedRow)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase">SKU</p>
                  <p className="text-sm font-medium text-slate-700">
                    {challanSourceDetails?.sku ?? "-"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase">SO Qty</p>
                  <p className="text-sm font-medium text-slate-700">
                    {challanSourceDetails?.qty ?? selectedRow?.qty ?? "-"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase">SO Rate</p>
                  <p className="text-sm font-medium text-slate-700">
                    {challanSourceDetails?.rate ?? selectedRow?.rate ?? "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase mb-1">Bill To</p>
                  <p className="text-sm font-medium text-slate-700">
                    {challanSourceDetails?.billToLabel ?? "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {challanSourceDetails?.billToAddressLine1 ?? "-"}{" "}
                    {challanSourceDetails?.billToAddressLine2 ?? ""}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase mb-1">Ship To</p>
                  <p className="text-sm font-medium text-slate-700">
                    {challanSourceDetails?.shipToLabel ?? "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {challanSourceDetails?.shipToAddressLine1 ?? "-"}{" "}
                    {challanSourceDetails?.shipToAddressLine2 ?? ""}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase mb-1">Bill From</p>
                  <p className="text-sm font-medium text-slate-700">
                    {challanSourceDetails?.billFromCompanyName ?? "-"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase mb-1">Ship From</p>
                  <p className="text-sm font-medium text-slate-700">
                    {challanSourceDetails?.shipFromCompanyName ?? "-"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <TextField
                label="Place of Supply"
                value={placeOfSupply}
                onChange={(event) => setPlaceOfSupply(event.target.value)}
                fullWidth
                required
              />
              <TextField
                label="State Code"
                value={stateCode}
                onChange={(event) => setStateCode(event.target.value)}
                fullWidth
                required
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  enableAccessibleFieldDOMStructure={false}
                  format="DD-MM-YYYY"
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true, label: "Challan Date", required: true } }}
                  value={challanDate}
                  onChange={(value) => setChallanDate(value)}
                />
              </LocalizationProvider>
              <TextField
                label="Box ID"
                value={boxId}
                onChange={(event) => setBoxId(event.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Qty"
                type="number"
                value={challanQty}
                onChange={(event) => setChallanQty(event.target.value)}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseChallanModal}>Close</Button>
            <LoadingButton
              onClick={handleSubmitCreateChallan}
              loading={loading}
              variant="contained"
            >
              Submit Challan
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageSalesOrder;
