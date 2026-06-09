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
      { headerName: "#", field: "id", sortable: true, filter: true, flex: 1, valueGetter: "node.rowIndex + 1", maxWidth: 80 },
      { headerName: "Item Name", field: "item_name", sortable: true, filter: true, flex: 1 },
      { headerName: "Item Code", field: "item_code", sortable: true, filter: true, flex: 1 },
      { headerName: "Unit", field: "item_uom", sortable: true, filter: true, flex: 1 },
      { headerName: "Approved Qty", field: "execute_qty", sortable: true, filter: true, flex: 1 },
      { headerName: "Status", field: "status", sortable: true, filter: true, flex: 1 },
      { headerName: "type", field: "type", sortable: true, filter: true, flex: 1 },
      { headerName: "", field: "appTxnId", sortable: true, filter: true, flex: 1, hide: true },
      {
        headerName: "",
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
