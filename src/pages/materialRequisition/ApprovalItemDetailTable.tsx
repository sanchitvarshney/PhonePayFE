import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { LoadingButton } from "@mui/lab";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { serailList } from "@/features/production/MaterialRequestWithoutBom/MRApprovalSlice";
import { View } from "lucide-react";

type Props = {
  setSerial: React.Dispatch<React.SetStateAction<boolean>>;
  setSerialid: React.Dispatch<React.SetStateAction<string>>;
};
const ApprovalItemDetailTable: React.FC<Props> = ({ setSerial,setSerialid }) => {
  const dispatch = useAppDispatch();
  const { approveItemDetail, approveItemDetailLoading } = useAppSelector((state) => state.pendingMr);
  const columnDefs: ColDef[] = useMemo(() => {
    const column: ColDef[] = [
      { headerName: "#", field: "id", sortable: true, filter: true, flex: 1, valueGetter: "node.rowIndex + 1", maxWidth: 80, },
      { headerName: "Item Name", field: "item_name", sortable: true, filter: true, flex: 1, minWidth: 400, cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.item_name}</span>
        </div>
      )},
      { headerName: "Item Code", field: "item_code", sortable: true, filter: true, flex: 1, cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.item_code}</span>
        </div>
      )},
      { headerName: "Unit", field: "item_uom", sortable: true, filter: true, flex: 1,cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.item_uom}</span>
        </div>
      )},
      { headerName: "Approved Qty", field: "execute_qty", sortable: true, filter: true, flex: 1, cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.execute_qty}</span>
        </div>
      )},
      { headerName: "Status", field: "status", sortable: true, filter: true, flex: 1,cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span className={`${params?.data?.status === "Approved" ? "text-green-600" : "text-red-600"} font-bold`}>{params?.data?.status}</span>
        </div>
      )},
      { headerName: "type", field: "type", sortable: true, filter: true, flex: 1,  cellRenderer: (params: any) => (
          <div className="flex items-center justify-center h-full">
            <span>{params?.data?.type}</span>
          </div>
        ), },
      { headerName: "", field: "appTxnId", sortable: true, filter: true, flex: 1, hide: true,  },
      {
        headerName: "Action",
        field: "action",
        sortable: false,
        filter: false,
        hide: !approveItemDetail?.some((item) => item.type === "DEVICE"), // Example logic
        cellRenderer: (params: any) => (
          <div className="flex items-center justify-center h-full">
            <LoadingButton
              onClick={() => {
                setSerial(true);
                dispatch(serailList(params.data.appTxnId));
                setSerialid(params.data.appTxnId);
              }}
              size="small"
              startIcon={<View fontSize="small" />}
              variant="contained"
            >
              View Serial No.
            </LoadingButton>
          </div>
        ),
      },
    ];
    return column;
  }, [approveItemDetail]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
    };
  }, [approveItemDetailLoading]);


  return (
    <>
      <div className="ag-theme-quartz h-[calc(100vh-50px)]">
        <AgGridReact
    headerHeight={40}
          rowHeight={40}
          loadingOverlayComponent={CustomLoadingOverlay}
          loading={approveItemDetailLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={approveItemDetail || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
        />
      </div>
    </>
  );
};

export default ApprovalItemDetailTable;
