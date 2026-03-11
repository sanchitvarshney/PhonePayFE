import React, { RefObject, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import { useAppSelector } from "@/hooks/useReduxHook";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { Link } from "react-router-dom";
import { Icons } from "@/components/icons";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uploadImage: boolean;
  setUploadImage: React.Dispatch<React.SetStateAction<boolean>>;
  viewImage: boolean;
  setViewImage: React.Dispatch<React.SetStateAction<boolean>>;
  gridRef?: RefObject<AgGridReact<any>>;
};

const MsterComponentsMaterialListTable: React.FC<Props> = ({ gridRef }) => {
  const { component, getComponentLoading } = useAppSelector((state) => state.component);
  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      maxWidth: 100,
      field: "id",
      filter: false,
      valueGetter: (params: any) => params.node.rowIndex + 1,
    },
    {
      headerName: "Name",
      field: "c_name",
      sortable: true,
      filter: true,
      minWidth: 300,
      cellRenderer: (params: any) => (
        <Link className=" text-cyan-600" to={`/master-components/${params?.data?.component_key}`}>
          <span className="whitespace-normal">{params?.value}</span>
          <Icons.followLink sx={{ fontSize: "15px", mx: 1 }} />
        </Link>
      ),
      autoHeight: true,
    },
    {
      headerName: "Part Code",
      field: "c_part_no",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Is Enabled",
      field: "is_enabled",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (params?.value === "Y" ? "Enable" : "Disable"),
    },
    {
      headerName: "UOM",
      field: "units_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "key",
      field: "component_key",
      hide: true,
    },
  ];
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      floatingFilter: false,
    };
  }, []);
  return (
    <div>
      <div className=" ag-theme-quartz h-[calc(100vh-140px)]">
        <AgGridReact
          ref={gridRef}
          loadingOverlayComponent={CustomLoadingOverlay}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          loading={getComponentLoading}
          rowData={component?.components}
          suppressCellFocus={true}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSizeSelector={[20, 30, 50]}
          paginationPageSize={30}
        />
      </div>
    </div>
  );
};

export default MsterComponentsMaterialListTable;
