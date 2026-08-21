import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { useAppSelector } from "@/hooks/useReduxHook";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";

const MasterBomCraeteFileTable: React.FC = () => {
  const { uploadFileLoading, uploadFileData } = useAppSelector((state) => state.bom);

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
    { headerName: "Part Code", field: "partCode", sortable: true, filter: true, flex: 1 },
    { headerName: "Component Name", field: "componentName", sortable: true, filter: true, flex: 2 },
    { headerName: "QTY", field: "quantity", sortable: true, filter: true, width: 100 },
    { headerName: "Ref", field: "ref", sortable: true, filter: true, flex: 1 },
    { headerName: "Category", field: "category", sortable: true, filter: true, flex: 1 },
    {
      headerName: "Sub Category",
      field: "subCategory",
      sortable: true,
      filter: true,
      flex: 1,
    },
    { headerName: "Remark", field: "remarks", sortable: true, filter: true, flex: 1 },
  ];

  const defaultColDef = useMemo<ColDef>(() => {
    return { filter: true };
  }, []);

  return (
    <div className="ag-theme-quartz h-[calc(100vh-100px)]">
      <AgGridReact
        loading={uploadFileLoading}
        loadingOverlayComponent={CustomLoadingOverlay}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        suppressCellFocus={true}
        rowData={uploadFileData || []}
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

export default MasterBomCraeteFileTable;
