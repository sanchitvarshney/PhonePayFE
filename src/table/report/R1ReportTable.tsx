import React, { RefObject, useEffect, useMemo, useState } from "react";
import type { ColDef } from "@ag-grid-community/core";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { AgGridReact } from "@ag-grid-community/react";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import { CircularProgress, IconButton } from "@mui/material";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import axiosInstance from "@/api/axiosInstance";
import { showToast } from "@/utils/toasterContext";
import FullPageLoading from "@/components/shared/FullPageLoading";
import { clearR1Report } from "@/features/report/report/reportSlice";
import { formatNumber } from "@/utils/numberFormatUtils";
import CustomPagination from "@/components/reusable/CustomPagination";
import { VisibilityOutlined } from "@mui/icons-material";

type Props = {
  gridRef?: RefObject<AgGridReact<any>>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  pageSize: number;
};

const R1ReportTable: React.FC<Props> = ({ gridRef, handlePageChange, handlePageSizeChange, pageSize }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);
  const [current, setCurrent] = React.useState<string>("");
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const { r1Report, r1ReportLoading, wrongDeviceReportLoading } = useAppSelector((state) => state.report);

  const generateprint = async (min: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/transaction/printMaterialMin?minno=${min}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, "_blank");
      showToast("PDF generated successfully!", "success");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      if (error.response) {
        const contentType = error.response.headers["content-type"];
        if (contentType.includes("application/json")) {
          const errorData = await error.response.data.text();
          const parsedError = JSON.parse(errorData);
          const backendMessage = parsedError.message || "An error occurred";
          showToast(backendMessage, "error");
        } else {
          showToast("Error generating PDF", "error");
        }
      } else {
        showToast("Network error or server not reachable", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
    };
  }, []);

  useEffect(() => {
    const fetchGridData = async () => {
      setLoading(true);
      const reportData: any = r1Report;
      const header = reportData?.data?.header;
      const data = reportData?.data?.data;
      const filteredHeader = header?.filter((col: string) => col !== "Print" && col !== "Transaction ID");

      const dynamicColumnDefs: ColDef[] =
        filteredHeader?.map((col: string) => ({
          field: col,
          headerName: col,
          sortable: true,
          filter: true,
          resizable: true,
          autoHeight: true,
          width: 250,
          cellRenderer: (params: any) => {
            if (col === "MINNo" && params.data.Print) {
              return (
                <div className="flex items-center justify-center gap-2">
                  {loading && current === params.data["Insert Date"] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <>
                      <MuiTooltip title="Print" placement="left">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            generateprint(params.value);
                            setCurrent(params.data["Insert Date"]);
                          }}
                        >
                          <LocalPrintshopIcon fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                      <MuiTooltip title="View" placement="left">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            window.open(params.data["Invoice File Date"], "_blank", "noopener,noreferrer");
                          }}
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                    </>
                  )}
                  <span className="ml-2">{params.value}</span>
                </div>
              );
            }
            if ((col === "Qty" && params.data.Qty) || (col === "Rate" && params.data.Rate)) {
              return formatNumber(params.value);
            }
            return params.value;
          },
        })) ?? [];

      setColumnDefs(dynamicColumnDefs);
      setRowData(data || []);
      setLoading(false);
    };

    fetchGridData();
  }, [r1Report?.data]);

  useEffect(() => {
    dispatch(clearR1Report());
  }, [dispatch]);

  return (
    <div>
      {loading && <FullPageLoading />}
      <div className="relative ag-theme-quartz h-[calc(100vh-160px)]">
        <AgGridReact
          loadingOverlayComponent={CustomLoadingOverlay}
          ref={gridRef}
          loading={r1ReportLoading || wrongDeviceReportLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          paginationPageSize={20}
          enableCellTextSelection
        />
      </div>
      {rowData && (
        <CustomPagination
          currentPage={r1Report?.pagination?.currentPage as any}
          totalPages={r1Report?.pagination?.totalPages as any}
          totalRecords={r1Report?.pagination?.totalRecords as any}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default R1ReportTable;

