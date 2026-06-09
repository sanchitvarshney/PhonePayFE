import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";

interface RowData {
  id: number;
  component: string;
  partcode: string;
  bomQty: number;
  uom: string;
}

const columnDefs: ColDef[] = [
  { headerName: "ID", field: "id", sortable: true, filter: true, width: 70 },
  { headerName: "Component", field: "component", sortable: true, filter: true, flex: 1 },
  { headerName: "Part Code", field: "partcode", sortable: true, filter: true, flex: 1 },
  { headerName: "BOM Qty", field: "bomQty", sortable: true, filter: true, editable: true, cellEditor: "agNumberCellEditor", flex: 1 },
  { headerName: "UOM", field: "uom", sortable: true, filter: true, flex: 1 },
];

const MasterSFGBOMViewTable: React.FC = () => {
  const rowData: RowData[] = [
    { id: 1, component: "Component A", partcode: "PC001", bomQty: 100, uom: "kg" },
    { id: 2, component: "Component B", partcode: "PC002", bomQty: 50, uom: "pcs" },
  ];

  const defaultColDef = useMemo<ColDef>(() => {
    return { filter: true };
  }, []);

  return (
    <div>
      <div className="ag-theme-quartz h-[calc(100vh-50px)]">
        <AgGridReact loadingOverlayComponent={CustomLoadingOverlay} overlayNoRowsTemplate={OverlayNoRowsTemplate} suppressCellFocus={true} rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} pagination={true} paginationPageSize={20} />
      </div>
    </div>
  );
};

export default MasterSFGBOMViewTable;
