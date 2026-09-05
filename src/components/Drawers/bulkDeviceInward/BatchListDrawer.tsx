import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import { ColDef } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import {
  CustomDrawer,
  CustomDrawerContent,
  CustomDrawerDescription,
  CustomDrawerHeader,
  CustomDrawerTitle,
} from "@/components/reusable/CustomDrawer";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getBulkDeviceInwardSerials } from "@/features/bulkDeviceInward/bulkDeviceInwardSlice";
import {
  getChallanNo,
  getMinNo,
} from "@/features/bulkDeviceInward/bulkDeviceInwardHelpers";
import { BulkDeviceInwardSerialBatch } from "@/features/bulkDeviceInward/bulkDeviceInwardType";

type Props = {
  open: boolean;
  row: any;
  onClose: () => void;
};

const  BatchListDrawer: React.FC<Props> = ({ open, row, onClose }) => {
  const dispatch = useAppDispatch();
  const { serials, serialsLoading } = useAppSelector(
    (state) => state.bulkDeviceInward,
  );
  const challanNo = getChallanNo(row);
  const minNo = getMinNo(row);
  const deviceSku = row?.deviceSku ?? "";
  const [selectedBatch, setSelectedBatch] =
    useState<BulkDeviceInwardSerialBatch | null>(null);

  useEffect(() => {
    if (!open) return;
    if (minNo) {
      dispatch(getBulkDeviceInwardSerials({ minNo }));
    }
  }, [open, minNo, dispatch]);

  const serialBatchColumnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: "#", width: 70, valueGetter: "node.rowIndex + 1" },
      { headerName: "Batch Id", flex: 1, minWidth: 220, field: "batchId" },
      { headerName: "Qty", width: 100, field: "totalQty" },
      {
        headerName: "Serial Count",
        width: 130,
        valueGetter: (params) => params.data?.serials?.length ?? 0,
      },
      { headerName: "Inserted Date", width: 140, field: "insertDt" },
      {
        headerName: "",
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data: BulkDeviceInwardSerialBatch }) => (
          <LoadingButton
            size="small"
            variant="outlined"
            onClick={() => setSelectedBatch(params.data)}
          >
            View
          </LoadingButton>
        ),
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({ resizable: true, sortable: true }),
    [],
  );

  const serialColumnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: "#", width: 70, valueGetter: "node.rowIndex + 1" },
      { headerName: "Serial No", flex: 1, valueGetter: (params) => params.data },
    ],
    [],
  );

  return (
    <CustomDrawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <CustomDrawerContent side="right" className="min-w-[900px] p-0 flex flex-col">
        <CustomDrawerHeader className="h-[60px] flex-shrink-0 p-0 flex flex-col justify-center px-[20px] space-y-0 bg-zinc-200 gap-0">
          <CustomDrawerTitle className="text-slate-600 font-[500] p-0">
            Batch Details
          </CustomDrawerTitle>
          <CustomDrawerDescription className="text-slate-500">
          Transaction - {minNo} | Challan - {challanNo} | SKU - {deviceSku}
          </CustomDrawerDescription>
        </CustomDrawerHeader>
        <div className="p-[20px] flex-1 min-h-0 ag-theme-quartz">
          <AgGridReact
            loadingOverlayComponent={CustomLoadingOverlay}
            loading={serialsLoading}
            overlayNoRowsTemplate={OverlayNoRowsTemplate}
            suppressCellFocus
            rowData={serials}
            columnDefs={serialBatchColumnDefs}
            defaultColDef={defaultColDef}
          />
        </div>
        <Dialog
          open={Boolean(selectedBatch)}
          onClose={() => setSelectedBatch(null)}
          disablePortal
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle className="flex items-start justify-between gap-[10px]">
            <div>
              Serial Numbers
              <Typography variant="body2" className="text-slate-500">
                Batch {selectedBatch?.batchId}
              </Typography>
            </div>
            <IconButton size="small" onClick={() => setSelectedBatch(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent
            className="ag-theme-quartz"
            sx={{ height: 400, paddingBottom: "20px" }}
          >
            <AgGridReact
              overlayNoRowsTemplate={OverlayNoRowsTemplate}
              suppressCellFocus
              rowData={selectedBatch?.serials ?? []}
              columnDefs={serialColumnDefs}
              defaultColDef={defaultColDef}
            />
          </DialogContent>
        </Dialog>
      </CustomDrawerContent>
    </CustomDrawer>
  );
};

export default BatchListDrawer;
