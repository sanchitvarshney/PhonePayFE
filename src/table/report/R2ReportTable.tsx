import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { useAppSelector } from "@/hooks/useReduxHook";
import { Button } from "@mui/material";
import { useSocketContext } from "@/components/context/SocketContext";
import { DownloadIcon } from "@radix-ui/react-icons";
import { formatNumber } from "@/utils/numberFormatUtils";
import CustomPagination from "@/components/reusable/CustomPagination";
type Props = {
  gridRef: RefObject<AgGridReact<any>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTxn?: React.Dispatch<React.SetStateAction<string>> | any;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  pageSize: number;
};

// Define new column definitions

// Generate dummy data according to pagination needs
const R2ReportTable: React.FC<Props> = ({ gridRef, handlePageChange, handlePageSizeChange, pageSize }) => {
  const { emitDownloadr2Report } =
    useSocketContext();
  // const dispatch = useAppDispatch();
  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "id",
      sortable: true,
      filter: true,
      minWidth: 100,
      valueGetter: "node.rowIndex+1",
    },

    { headerName: "SKU", field: "sku", sortable: true, filter: true, minWidth: 100 },
    {
      headerName: "SKU Name",
      field: "deviceModel",
      sortable: true,
      filter: true,
    minWidth: 100,
    },
    {
      headerName: "Dispatch Date",
      field: "dispatchDate",
      sortable: true,
      filter: true,
    minWidth: 100,
    },
    {
      headerName: "Dispatch Qty",
      field: "qty",
      sortable: true,
      filter: true,
    minWidth: 100,
      valueFormatter: (params: any) => {
        return formatNumber(params.value);
      },
    },
    {
      headerName: "Insert By",
      field: "insertBy",
      sortable: true,
      filter: true,
    minWidth: 100
    },
    // {
    //   headerName: "TXN ID",
    //   field: "txnId",
    //   sortable: false,
    //   filter: true,
    // minWidth: 100,
    //   hide: true,
    // },
    {
      headerName: "Dispatch ID",
      field: "dispatchId",
      sortable: true,
      filter: true,
    minWidth: 100,
      hide: false,
    },

    {
      headerName: "",
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <Button
          onClick={() => {
            const id = params?.data?.dispatchId;
                
         
              emitDownloadr2Report({ txnId: id, type:"dispatchwise" });
  
          }}
          variant="contained"
          size="small"
          startIcon={<DownloadIcon fontSize="small" />}
        >
          Download
        </Button>
      ),
      width: 150,
    },
  ];
  const { r2Report, r2ReportLoading } = useAppSelector((state) => state.report);

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
          loading={r2ReportLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={r2Report?.data ||  []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          paginationPageSize={paginationPageSize}
          enableCellTextSelection
        />
      </div>
       {r2Report && <CustomPagination
          currentPage={r2Report?.pagination?.page}
          totalPages={r2Report?.pagination?.totalPages}
          totalRecords={r2Report?.pagination?.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
        />}
    </div>
  );
};

export default R2ReportTable;
