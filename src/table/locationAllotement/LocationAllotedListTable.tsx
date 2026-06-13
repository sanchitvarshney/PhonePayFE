import { Icons } from "@/components/icons";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { LocationAllotedItem } from "@/utils/locationAllotementType/locationTypes";
import { IconButton } from "@mui/material";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useMemo } from "react";

type Props = {
  rowData: LocationAllotedItem[];
  loading: boolean;
  onEdit: (row: LocationAllotedItem) => void;
};

const LocationAllotedListTable: React.FC<Props> = ({
  rowData,
  loading,
  onEdit,
}) => {
  const columnDefs = useMemo<any>(
    () => [
      {
        headerName: "Module Name",
        field: "module_name",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 280,
      },
      {
        headerName: "Module Description",
        field: "module_description",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 220,
      },
      {
        headerName: "Action",
        colId: "action",
        sortable: false,
        filter: false,
        width: 120,
        maxWidth: 120,
        cellRenderer: (params:any) => (
          <div className="flex items-center justify-center gap-[4px] h-full w-full">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(params.data)}
            >
              <Icons.edit fontSize="small" />
            </IconButton>
          
          </div>
        ),
      },
    ],
    [onEdit],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      filter: true,
      floatingFilter: true,
    }),
    [],
  );

  return (
    <div className="ag-theme-quartz h-full">
      <AgGridReact<LocationAllotedItem>
        loading={loading}
        loadingOverlayComponent={CustomLoadingOverlay}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        suppressCellFocus
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        headerHeight={40}
        floatingFiltersHeight={36}
        rowHeight={40}
        pagination
        paginationPageSize={25}
        paginationPageSizeSelector={[25, 50, 100]}
      />
    </div>
  );
};

export default LocationAllotedListTable;
