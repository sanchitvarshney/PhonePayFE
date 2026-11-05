import { useMemo } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import type { ColDef } from "@ag-grid-community/core";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import {
  ReportColumn,
  storeDefaultColDef,
  storeExcelStyles,
  toColDefs,
  totalRowClass,
} from "./storeReportUtils";

type Props<T> = {
  rows: T[];
  columns: ReportColumn<T>[];
  loading: boolean;
  offset?: number;
  quickFilterText?: string;
  pinnedBottomRowData?: Partial<Record<string, unknown>>[];
  getRowId?: (row: T) => string;
};

// Paging is done by the server, so the grid shows one page at a time.
const StoreReportGrid = <T,>({
  rows,
  columns,
  loading,
  offset = 0,
  quickFilterText,
  pinnedBottomRowData,
  getRowId,
}: Props<T>) => {
  const columnDefs = useMemo<ColDef<T>[]>(() => toColDefs(columns), [columns]);
  const context = useMemo(() => ({ offset }), [offset]);

  return (
    <div className="ag-theme-quartz store-grid h-full w-full">
      <AgGridReact<T>
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={storeDefaultColDef as ColDef<T>}
        context={context}
        loading={loading}
        loadingOverlayComponent={CustomLoadingOverlay}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        quickFilterText={quickFilterText}
        pinnedBottomRowData={pinnedBottomRowData as T[] | undefined}
        getRowClass={totalRowClass}
        getRowId={getRowId ? (params) => getRowId(params.data) : undefined}
        excelStyles={storeExcelStyles}
        suppressCellFocus
        enableCellTextSelection
        tooltipShowDelay={300}
      />
    </div>
  );
};

export default StoreReportGrid;
