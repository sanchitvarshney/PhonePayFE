import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { Button } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { getr8ReportDetail } from "@/features/report/report/reportSlice";
import { formatNumber } from "@/utils/numberFormatUtils";

type Props = {
  gridRef: RefObject<AgGridReact<any>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBatch: React.Dispatch<React.SetStateAction<any>>;
};

const R8ReportTable: React.FC<Props> = ({ gridRef, setOpen, setSelectedBatch }) => {
  const dispatch = useAppDispatch();
  const columnDefs: ColDef[] = [
    { headerName: "#", field: "id", sortable: true, filter: true, width: 100, valueGetter: "node.rowIndex+1" },
    { headerName: "Transfer Txn ID", field: "transferTxnId", sortable: true, filter: true, minWidth: 150 },
    { headerName: "Batch ID", field: "batchId", sortable: true, filter: true, minWidth: 150 },
    { headerName: "SKU", field: "deviceSku", sortable: true, filter: true, minWidth: 100 },
    { headerName: "SKU Name", field: "deviceName", sortable: true, filter: true, minWidth: 150 },
    {
      headerName: "Transfer Qty",
      field: "transferQty",
      sortable: true,
      filter: true,
      minWidth: 100,
      valueFormatter: (params: any) => {
        return formatNumber(params.value);
      },
    },
    {
      headerName: "Rate",
      minWidth: 100,
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data?.rate ?? params.data?.transferRate ?? "",
    },
    { headerName: "From Location", field: "fromLocation", sortable: true, filter: true, minWidth: 150 },
    { headerName: "To Location", field: "toLocation", sortable: true, filter: true, minWidth: 150 },
    { headerName: "Requested By", field: "requestedBy", sortable: true, filter: true, minWidth: 150 },
    { headerName: "Requested Date", field: "requestedDate", sortable: true, filter: true, minWidth: 130 },
    { headerName: "Transferred By", field: "transferredBy", sortable: true, filter: true, minWidth: 150 },
    {
      headerName: "Transfer Date",
      field: "transferDate",
      sortable: true,
      filter: true,
      minWidth: 130,
      valueFormatter: (params: any) => params.value ?? "",
    },
    {
      headerName: "",
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <Button
          onClick={() => {
            setOpen(true);
            setSelectedBatch(params?.data ?? null);
            dispatch(
              getr8ReportDetail({
                batchId: params?.data?.batchId,
              })
            );
          }}
          variant="contained"
          size="small"
          startIcon={<FullscreenIcon fontSize="small" />}
        >
          View
        </Button>
      ),
      width: 150,
    },
  ];
  const { r8Report, r8ReportLoading } = useAppSelector((state) => state.report);

  const paginationPageSize = 20;

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      sortable: true,
    };
  }, []);

  return (
    <div>
      <div className="relative ag-theme-quartz h-[calc(100vh-160px)]">
        <AgGridReact
          ref={gridRef}
          loadingOverlayComponent={CustomLoadingOverlay}
          loading={r8ReportLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={r8Report?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          paginationPageSize={paginationPageSize}
          enableCellTextSelection
        />
      </div>
    </div>
  );
};

export default R8ReportTable;
