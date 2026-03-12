import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { Link } from "react-router-dom";
import { Icons } from "@/components/icons";
import { useAppSelector } from "@/hooks/useReduxHook";
import { Typography } from "@mui/material";

type Props = {
  updateProduct?: boolean;
  setUpdateProduct?: React.Dispatch<React.SetStateAction<boolean>>;
  viewProduct?: boolean;
  setViewProduct?: React.Dispatch<React.SetStateAction<boolean>>;
};

const MasterVendorDetailTable: React.FC<Props> = () => {
  const { vendor, getvendorLoading } = useAppSelector((state) => state.vendor);
  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "id",
      sortable: true,
      filter: false,
      valueGetter: "node.rowIndex+1",
      width: 64,
      minWidth: 64,
      cellStyle: { paddingLeft: "12px" },
    },
    {
      headerName: "Name",
      field: "vendor_name",
      sortable: true,
      filter: true,
      minWidth: 280,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2 min-h-[40px] w-full">
          <Link
            to={`/master-vendor/${params.data.vendor_code}`}
            className="flex items-center gap-2 text-cyan-600 hover:underline w-full text-left break-words"
            title={params.value ?? ""}
          >
            <span className="break-words">{params.value ?? ""}</span>
            <Icons.followLink sx={{ fontSize: "16px", flexShrink: 0 }} />
          </Link>
        </div>
      ),
      wrapText: true,
      autoHeight: true,
      cellStyle: { textAlign: "left", overflow: "visible" },
    },
    { headerName: "Code", field: "vendor_code", sortable: true, filter: true, minWidth: 120, flex: 1 },
    {
      headerName: "Vendor Status",
      field: "vendor_status",
      sortable: false,
      filter: false,
      minWidth: 120,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <Typography fontSize={14} textAlign={"start"} color={params.value === "A" ? "success" : "error"}>
            {params.value === "A" ? "Active" : "Inactive"}
          </Typography>
        </div>
      ),
    },
    { headerName: "PAN No.", field: "vendor_pan", sortable: true, filter: false, minWidth: 130, flex: 1 },
    { headerName: "GST No.", field: "vendor_gst", sortable: true, filter: false, minWidth: 140, flex: 1 },
  ];
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      floatingFilter: true,
      resizable: true,
      wrapText: false,
    };
  }, []);
  const rowData = Array.isArray(vendor) ? vendor : [];

  return (
    <div
      className="ag-theme-quartz w-full"
      style={{
        width: "100%",
        height: "calc(100vh - 140px)",
        minHeight: 400,
      }}
    >
      <AgGridReact
        loading={getvendorLoading}
        loadingOverlayComponent={CustomLoadingOverlay}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        suppressCellFocus={true}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSizeSelector={[10, 25, 50]}
        domLayout="normal"
        suppressHorizontalScroll={false}
        ensureDomOrder={true}
      />
    </div>
  );
};

export default MasterVendorDetailTable;
