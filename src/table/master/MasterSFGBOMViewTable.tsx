import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";

const MasterSFGBOMViewTable: React.FC = () => {
  const { bomItemList, fgBomListLoading } = useAppSelector((state) => state.bom);

  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "rowIndex",
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
      width: 70,
      maxWidth: 70,
    },
    { headerName: "Component", field: "cName", sortable: true, filter: true, flex: 2 },
    { headerName: "Part Code", field: "cPartNo", sortable: true, filter: true, flex: 1 },
    { headerName: "BOM Qty", field: "qty", sortable: true, filter: true, flex: 1 },
    { headerName: "UOM", field: "cUom", sortable: true, filter: true, width: 100 },
    { headerName: "Reference", field: "refrence", sortable: true, filter: true, flex: 1 },
  ];

  const defaultColDef = useMemo<ColDef>(() => {
    return { filter: true };
  }, []);

  return (
    <div className="ag-theme-quartz h-[calc(100vh-50px)]">
      <AgGridReact
        loadingOverlayComponent={CustomLoadingOverlay}
        loading={fgBomListLoading}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        suppressCellFocus={true}
        rowData={bomItemList || []}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowHeight={40}
        headerHeight={40}
        pagination={true}
        paginationPageSize={20}
      />
    </div>
  );
};

export default MasterSFGBOMViewTable;
