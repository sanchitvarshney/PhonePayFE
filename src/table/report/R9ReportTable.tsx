import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";
import { formatNumber } from "@/utils/numberFormatUtils";

type Props = {
  gridRef: RefObject<AgGridReact<any>>;
};

// TODO: columns are a best guess pending the real device_stock API response shape
const R9ReportTable: React.FC<Props> = ({ gridRef }) => {
  const columnDefs: ColDef[] = [
    { headerName: "#", field: "id", sortable: true, filter: true, width: 100, valueGetter: "node.rowIndex+1" },
    { headerName: "SKU", field: "deviceSku", sortable: true, filter: true, minWidth: 120 },
    { headerName: "SKU Name", field: "deviceName", sortable: true, filter: true, minWidth: 180 },
    { headerName: "Location", field: "location", sortable: true, filter: true, minWidth: 150 },
    {
      headerName: "Stock Qty",
      field: "stockQty",
      sortable: true,
      filter: true,
      minWidth: 120,
      valueFormatter: (params: any) => formatNumber(params.value),
    },
    { headerName: "Serial No.", field: "serialNo", sortable: true, filter: true, minWidth: 150 },
    { headerName: "IMEI", field: "imei", sortable: true, filter: true, minWidth: 150 },
    { headerName: "Status", field: "status", sortable: true, filter: true, minWidth: 120 },
    { headerName: "Date", field: "date", sortable: true, filter: true, minWidth: 130 },
  ];
  const { r9Report, r9ReportLoading } = useAppSelector((state) => state.report);

  const paginationPageSize = 20;

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      sortable: true,
    };
  }, []);

  return (
    <div>
      <div className="relative ag-theme-quartz h-[calc(100vh-160px)]">
        <AgGridReact
          ref={gridRef}
          loadingOverlayComponent={CustomLoadingOverlay}
          loading={r9ReportLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={r9Report?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          paginationPageSize={paginationPageSize}
          enableCellTextSelection
        />
      </div>
    </div>
  );
};

export default R9ReportTable;
