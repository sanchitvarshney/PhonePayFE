import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Icons } from "@/components/icons";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";

interface AlternativeComponent {
  compKey: string;
  componentName: string;
  partCode: string;
  unit: string;
  requiredQty: string;
  category: string;
  reference: string;
  status: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  alternativeComponents: AlternativeComponent[];
  loading?: boolean;
}

const AlternativeComponentsView: React.FC<Props> = ({
  open,
  onClose,
  alternativeComponents,
  loading = false,
}) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Component Name",
        field: "componentName",
        sortable: true,
        filter: true,
        minWidth: 300,
        flex: 1,
      },
      {
        headerName: "Part Code",
        field: "partCode",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Category",
        field: "category",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Quantity",
        field: "requiredQty",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Unit",
        field: "unit",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Reference",
        field: "reference",
        sortable: true,
        filter: true,
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      resizable: true,
    }),
    []
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          height: "80vh",
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between">
        <span className="text-lg font-semibold">Alternative Components</span>
        <IconButton onClick={onClose} size="small">
          <Icons.close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent className="p-4">
        <div className="ag-theme-quartz h-full">
          <AgGridReact
            rowData={alternativeComponents}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loadingOverlayComponent={CustomLoadingOverlay}
            loading={loading}
            overlayNoRowsTemplate={OverlayNoRowsTemplate}
            suppressCellFocus={true}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlternativeComponentsView;
