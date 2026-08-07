import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Switch } from "@/components/ui/switch";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";

interface RowData {
  id: number;
  status: string;
  product: string;
  sku: string;
  label: string;
  createdDate: string;
}

const MasterBOMDisabledTabled: React.FC = () => {
  const rowData: RowData[] = [
    { id: 1, status: "Active", product: "Product 1", sku: "SKU001", label: "Label 1", createdDate: "2024-08-01" },
    { id: 2, status: "Inactive", product: "Product 2", sku: "SKU002", label: "Label 2", createdDate: "2024-08-15" },
  ];

  const columnDefs: ColDef[] = [
    { headerName: "ID", field: "id", sortable: true, filter: true, width: 70 },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: () => (
        <div className="flex items-center h-full">
          <Switch id="airplane-mode" />
        </div>
      ),
    },
    { headerName: "Product", field: "product", sortable: true, filter: true, flex: 1 },
    { headerName: "SKU", field: "sku", sortable: true, filter: true, maxWidth: 250 },
  ];

  const defaultColDef = useMemo<ColDef>(() => {
    return { filter: true };
  }, []);

  return (
    <div className="ag-theme-quartz h-[calc(100vh-100px)]">
      <AgGridReact overlayNoRowsTemplate={OverlayNoRowsTemplate} suppressCellFocus={true} rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} pagination={true} paginationPageSize={20} />
    </div>
  );
};

export default MasterBOMDisabledTabled;
