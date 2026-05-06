import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { Button } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { r3ReportDetail } from "@/features/report/report/reportSlice";
import CustomPagination from "@/components/reusable/CustomPagination";
type Props = {
  gridRef: RefObject<AgGridReact<any>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  pageSize: number;
};

// Define new column definitions

// Generate dummy data according to pagination needs
const R3ReportTable: React.FC<Props> = ({
  gridRef,
  setOpen,
  handlePageChange,
  handlePageSizeChange,
  pageSize,
}) => {
  const dispatch = useAppDispatch();
  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
      valueGetter: "node.rowIndex+1",
    },
    {
      headerName: "Production ID",
      field: "prodductionId",
      sortable: true,
      filter: true,
    },
    {
      headerName: "SR No.",
      field: "productSrlNo",
      sortable: true,
      filter: true,
    },
    {
      headerName: "IMEI 1",
      field: "productImei1",
      sortable: true,
      filter: true,
    },
    {
      headerName: "IMEI 2",
      field: "productImei2",
      sortable: true,
      filter: true,
    },
    { headerName: "SKU", field: "sku", sortable: true, filter: true },
    { headerName: "SKU Name", field: "skuName", sortable: true, filter: true },
    {
      headerName: "Device Move ID",
      field: "device_mov_id",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Requested Date",
      field: "insertDate",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Requested By",
      field: "insertBy",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Pick Location",
      field: "productionLocation",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Drop Location",
      field: "dropLocation",
      sortable: true,
      filter: true,
    },
    {
      headerName: "",
      field: "prodductionId",
      sortable: true,
      filter: true,
      hide: true,
    },
    {
      headerName: "",
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <Button
          onClick={() => {
            setOpen(true);
            dispatch(
              r3ReportDetail({
                query: params.data.prodductionId,
              })
            );
          }}
          variant="contained"
          size="small"
          startIcon={<FullscreenIcon fontSize="small" />}
        >
          Detail
        </Button>
      ),
      width: 150,
    },
  ];
  const { r3report, r3reportLoading } = useAppSelector((state) => state.report);

  const paginationPageSize = 20; // Define page size

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
          loading={r3reportLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={r3report?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          paginationPageSize={paginationPageSize}
          enableCellTextSelection
        />
      </div>
      {r3report && (
        <CustomPagination
          currentPage={r3report?.pagination?.currentPage}
          totalPages={r3report?.pagination?.totalPages}
          totalRecords={r3report?.pagination?.totalRecords}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default R3ReportTable;
