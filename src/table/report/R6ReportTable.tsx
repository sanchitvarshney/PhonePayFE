import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";
import CustomPagination from "@/components/reusable/CustomPagination";

type Props = {
  gridRef: RefObject<AgGridReact<any>>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  pageSize: number;
};

const R6ReportTable: React.FC<Props> = ({
  gridRef,
  handlePageChange,
  handlePageSizeChange,
  pageSize,
}) => {
  const { r6report, r6reportLoading } = useAppSelector((state) => state.report);

  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      width: 70,
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
    },
    { headerName: "Part Code", field: "partCode", sortable: true, filter: true },
    { headerName: "Part Name", field: "partName", sortable: true, filter: true, flex: 1 },
    { headerName: "Opening Qty", field: "openingQty", sortable: true, filter: true, width: 130 },
    { headerName: "Inward Qty", field: "inwardQty", sortable: true, filter: true, width: 120 },
    { headerName: "Outward Qty", field: "outwardQty", sortable: true, filter: true, width: 130 },
    { headerName: "Closing Qty", field: "closingQty", sortable: true, filter: true, width: 120 },
    { headerName: "Date", field: "date", sortable: true, filter: true, width: 130 },
  ];

  const defaultColDef = useMemo<ColDef>(() => ({ filter: true, sortable: true }), []);

  const pagination = r6report?.pagination;
  const currentPage = Number(pagination?.page) || 1;
  const totalPages = Number(pagination?.totalPages) || 1;
  const totalRecords = Number(pagination?.total) || 0;
  const tablePageSize = Number(pagination?.limit) || pageSize;

  return (
    <div>
      <div className="relative ag-theme-quartz h-[calc(100vh-160px)]">
        <AgGridReact
          ref={gridRef}
          loadingOverlayComponent={CustomLoadingOverlay}
          loading={r6reportLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={r6report?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          enableCellTextSelection
        />
      </div>
      {r6report && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={tablePageSize}
        />
      )}
    </div>
  );
};

export default R6ReportTable;
