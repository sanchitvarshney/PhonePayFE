import React, { useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";

const R8ReportDetailTable: React.FC = () => {
  const columnDefs: ColDef[] = [
    { headerName: "#", field: "id", sortable: true, filter: true, width: 100, valueGetter: "node.rowIndex+1" },
    { headerName: "Serial No.", field: "serialNo", sortable: true, filter: true, flex: 1 },
  ];
  const { r8ReportDetail, r8ReportDetailLoading } = useAppSelector((state) => state.report);

  const rowData = useMemo(
    () => (r8ReportDetail?.serials || []).map((serialNo: string) => ({ serialNo })),
    [r8ReportDetail],
  );

  const paginationPageSize = 20;

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
          loading={r8ReportDetailLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={paginationPageSize}
        />
      </div>
    </div>
  );
};

export default R8ReportDetailTable;
