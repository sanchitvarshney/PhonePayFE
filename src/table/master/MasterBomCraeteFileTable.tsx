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
      field: "id",
      sortable: true,
      filter: false,
      width: 70,
      valueGetter: (params: any) => params.node.rowIndex + 1,
    },
    {
      headerName: "Part Code",
      field: "partCode",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Component Name",
      field: "componentName",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Component key",
      field: "compKey",
      sortable: true,
      filter: true,
      editable: true,
      hide: true,
    },
    {
      headerName: "QTY",
      field: "quantity",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Ref",
      field: "ref",
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
      headerName: "Remark",
      field: "remark",
      sortable: true,
      filter: true,
    },
  ];
  const defaultColDef = useMemo<ColDef>(() => {
    return { filter: true, floatingFilter: true };
  }, []);
  return (
    <div>
      <div className="ag-theme-quartz h-[calc(100vh-100px)]">
        <AgGridReact
          loading={uploadFileLoading}
          loadingOverlayComponent={CustomLoadingOverlay}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={uploadFileData || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
        />
      </div>
    </div>
  );
};

export default MasterBomCraeteFileTable;
