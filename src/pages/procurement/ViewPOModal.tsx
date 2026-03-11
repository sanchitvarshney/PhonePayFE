import React, { useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import {
  CustomDrawerHeader,
  CustomDrawerTitle,
  CustomDrawerContent,
} from "@/components/reusable/CustomDrawer";
import { CustomDrawer } from "@/components/reusable/CustomDrawer";
import { LoadingButton } from "@mui/lab";
import { Icons } from "@/components/icons";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import * as XLSX from "xlsx";

type Props = {
  open?: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  poId: string;
};

const ViewPOModal: React.FC<Props> = ({ open, setOpen, poId }) => {
  const { fetchPOData, fetchPODataLoading } = useAppSelector(
    (state) => state.po
  );
  const gridRef = useRef<AgGridReact<any>>(null);

  const rowDataArray = Array.isArray(fetchPOData)
    ? fetchPOData
    : (fetchPOData as any)?.data ?? [];

  const onBtExport = useCallback(() => {
    if (!rowDataArray.length) return;

    // Sanitize sheet name - remove invalid characters and limit length
    const sanitizedSheetName = poId
      .replace(/[\\/?*[\]:]/g, "")
      .substring(0, 31);

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(
      rowDataArray.map((item: any) => ({
        "Part Code": item.componentPartID,
        "Part Name": item.po_components,
        Quantity: item.ordered_qty,
        "Pending Quantity": item.pending_qty,
        "PO Order Rate": item.po_order_rate,
        "PO Part Status": item.po_part_status,
        "PO Remark": item.po_remark,
      }))
    );

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sanitizedSheetName || "PO_Details");

    // Generate Excel file
    XLSX.writeFile(wb, `${poId}_Details.xlsx`);
  }, [rowDataArray, poId]);

  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "srNo",
      sortable: true,
      filter: true,
      valueGetter: "node.rowIndex + 1",
      maxWidth: 80,
    },
    {
      headerName: "Part Code",
      field: "componentPartID",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Part Name",
      field: "po_components",
      sortable: true,
      filter: true,
    },
    { headerName: "Qty", field: "ordered_qty", sortable: true, filter: true },
    {
      headerName: "Pending Qty",
      field: "pending_qty",
      sortable: true,
      filter: true,
    },

    {
      headerName: "PO Order Rate",
      field: "po_order_rate",
      sortable: true,
      filter: true,
    },
    {
      headerName: "PO Part Status",
      field: "po_part_status",
      sortable: true,
      filter: true,
    },
    {
      headerName: "PO Remark",
      field: "po_remark",
      sortable: true,
      filter: true,
    },
  ];

  return (
    <CustomDrawer open={open} onOpenChange={setOpen}>
      <CustomDrawerContent
        side="right"
        className="min-w-[80%] p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <CustomDrawerHeader className="h-[50px] p-0 flex flex-col justify-center px-[20px] space-y-0 bg-zinc-200 gap-0">
          <div className="flex items-center justify-between w-full">
            <CustomDrawerTitle className="text-slate-600 font-[500] p-0">
              PO Details - {poId}
            </CustomDrawerTitle>
            <div className="pr-10">
              <MuiTooltip title="Download Excel" placement="bottom">
                <LoadingButton
                  disabled={!rowDataArray.length}
                variant="contained"
                color="primary"
                style={{
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  minWidth: 0,
                  padding: 0,
                }}
                onClick={onBtExport}
                size="small"
                sx={{ zIndex: 1 }}
              >
                <Icons.download />
              </LoadingButton>
            </MuiTooltip></div>
          </div>
        </CustomDrawerHeader>
        <div className="h-[calc(100vh-50px)] ">
          <div className="relative ag-theme-quartz h-[calc(100vh-100px)]">
            <AgGridReact
              ref={gridRef}
              loading={fetchPODataLoading}
              loadingOverlayComponent={CustomLoadingOverlay}
              overlayNoRowsTemplate={OverlayNoRowsTemplate}
              suppressCellFocus
              columnDefs={columnDefs}
              rowData={rowDataArray}
              pagination={true}
              enableCellTextSelection={true}
            />
          </div>
        </div>
      </CustomDrawerContent>
    </CustomDrawer>
  );
};

export default ViewPOModal;
