import React, { useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";

// Define new column definitions

// Generate dummy data according to pagination needs
const R5ReportDetailTable: React.FC = () => {
  const columnDefs: ColDef[] = [
    { headerName: "#", field: "id", sortable: true, filter: true, width: 100, valueGetter: "node.rowIndex+1" },
    { headerName: "Part Code", field: "partNo", sortable: true, filter: true, flex: 1 },
    { headerName: "Part Name", field: "name", sortable: true, filter: true, flex: 1 },
    { headerName: "Qty", field: "qty", sortable: true, filter: true, flex: 1 },
    { headerName: "Location", field: "location", sortable: true, filter: true, flex: 1 },
  ];
  const { r5ReportDetail, r5ReportDetailLoading } = useAppSelector((state) => state.report);

  const paginationPageSize = 20; // Define page size

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      sortable: true,
    };
  }, []);

  return (
    <div>
      <div className="relative ag-theme-quartz h-[calc(100vh-50px)]">
        <AgGridReact
          loadingOverlayComponent={CustomLoadingOverlay}
          loading={r5ReportDetailLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={r5ReportDetail ? r5ReportDetail.itemDetail : []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={paginationPageSize}
        />
      </div>
    </div>
  );
};

export default R5ReportDetailTable;
