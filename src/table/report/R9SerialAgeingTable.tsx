import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";

type Props = {
  gridRef: RefObject<AgGridReact<any>>;
};

const R9SerialAgeingTable: React.FC<Props> = ({ gridRef }) => {
  const columnDefs: ColDef[] = [
    { headerName: "#", field: "id", sortable: true, filter: true, width: 100, valueGetter: "node.rowIndex+1" },
    { headerName: "Serial No.", field: "serial_no", sortable: true, filter: true, minWidth: 180 },
    { headerName: "Insert Date", field: "insert_date", sortable: true, filter: true, minWidth: 130 },
    { headerName: "Inward Date", field: "inward_date", sortable: true, filter: true, minWidth: 130 },
    { headerName: "Ageing (Days)", field: "ageing_days", sortable: true, filter: true, minWidth: 130 },
  ];
  const { r9SerialAgeing, r9SerialAgeingLoading } = useAppSelector((state) => state.report);

  const paginationPageSize = 20;

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      sortable: true,
    };
  }, []);

  return (
    <div>
      <div className="relative ag-theme-quartz h-[calc(100vh-100px)]">
        <AgGridReact
          ref={gridRef}
          loadingOverlayComponent={CustomLoadingOverlay}
          loading={r9SerialAgeingLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={r9SerialAgeing?.data?.serials || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={paginationPageSize}
          enableCellTextSelection
        />
      </div>
    </div>
  );
};

export default R9SerialAgeingTable;
