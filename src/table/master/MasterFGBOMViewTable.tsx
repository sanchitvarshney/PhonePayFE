import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { useAppSelector } from "@/hooks/useReduxHook";

const columnDefs: ColDef[] = [
  { headerName: "ID", valueGetter: "node.rowIndex + 1", width: 70 },
  { headerName: "Component", field: "cName", sortable: true, filter: true, flex: 1 },
  { headerName: "Part Code", field: "cPartNo", sortable: true, filter: true, flex: 1 },
  { headerName: "BOM Qty", field: "qty", sortable: true, filter: true, editable: true, cellEditor: "agNumberCellEditor", flex: 1 },
  { headerName: "UOM", field: "cUom", sortable: true, filter: true, flex: 1 },
  { headerName: "Reference", field: "refrence", sortable: true, filter: true, flex: 1 },
];

const MasterFGBOMViewTable: React.FC = () => {
  const { bomItemList } = useAppSelector((state) => state.bom);
  const defaultColDef = useMemo<ColDef>(() => {
    return { filter: true };
  }, []);

  return (
    <div>
      <div className="ag-theme-quartz h-[calc(100vh-50px)]">
        <AgGridReact
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={bomItemList}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
        />
      </div>
    </div>
  );
};

export default MasterFGBOMViewTable;
