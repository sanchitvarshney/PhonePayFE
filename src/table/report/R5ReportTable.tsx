import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { Button } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { getr5ReportDetail } from "@/features/report/report/reportSlice";
import CustomPagination from "@/components/reusable/CustomPagination";
type Props = {
  gridRef: RefObject<AgGridReact<any>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deviceType: string;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  pageSize: number;
};

// Define new column definitions

// Generate dummy data according to pagination needs
const R5ReportTable: React.FC<Props> = ({
  gridRef,
  setOpen,
  deviceType,
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
      field: "transaction_id",
      sortable: true,
      filter: true,
    },
    {
      headerName: "SR No.",
      field: "serial_no",
      sortable: true,
      filter: true,
    },
 
    { headerName: "SKU", field: "p_sku", sortable: true, filter: true },
    { headerName: "SKU Name", field: "p_name", sortable: true, filter: true },
    {
      headerName: "Device Move ID",
      field: "device_mov_id",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Requested Date",
      field: "insert_dt",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Requested By",
      field: "inserted_by",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Pick Location",
      field: "loc_out_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Drop Location",
      field: "loc_in_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "",
      field: "transaction_id",
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
              getr5ReportDetail({
                productionId: params.data.transaction_id,
                deviceType: deviceType,
              })
            )
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
  const { r5report, r5reportLoading } = useAppSelector((state) => state.report);


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
          loading={r5reportLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={r5report?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          paginationPageSize={paginationPageSize}
          enableCellTextSelection
        />
      </div>
      {r5report && (
        <CustomPagination
          currentPage={r5report?.pagination?.currentPage}
          totalPages={r5report?.pagination?.totalPages}
          totalRecords={r5report?.pagination?.totalRecords}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default R5ReportTable;
