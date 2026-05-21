import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";
// import { Button } from "@mui/material";
// import FullscreenIcon from "@mui/icons-material/Fullscreen";
// import { r3ReportDetail } from "@/features/report/report/reportSlice";
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
  // setOpen,
  handlePageChange,
  handlePageSizeChange,
  pageSize,
}) => {
  // const dispatch = useAppDispatch();
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
      headerName: "Component Name",
      field: "componentName",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Part Code",
      field: "partName",
      sortable: true,
      filter: true,
    },
    {
      headerName: "QTY",
      field: "qty",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Transaction ID",
      field: "transactionId",
      sortable: true,
      filter: true,
    },
    { headerName: "Location", field: "location", sortable: true, filter: true },
    { headerName: "Consumed Date", field: "consumedDate", sortable: true, filter: true },
   
    // {
    //   headerName: "",
    //   pinned: "right",
    //   sortable: false,
    //   filter: false,
    //   cellRenderer: (params: any) => (
    //     <Button
    //       onClick={() => {
    //         setOpen(true);
    //         dispatch(
    //           r3ReportDetail({
    //             query: params.data.prodductionId,
    //           })
    //         );
    //       }}
    //       variant="contained"
    //       size="small"
    //       startIcon={<FullscreenIcon fontSize="small" />}
    //     >
    //       Detail
    //     </Button>
    //   ),
    //   width: 150,
    // },
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
          currentPage={r3report?.pagination?.page}
          totalPages={r3report?.pagination?.totalPages}
          totalRecords={Number(r3report?.pagination?.total ?? 0)}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default R3ReportTable;
