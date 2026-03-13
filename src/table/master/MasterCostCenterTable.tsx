import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useAppSelector } from "@/hooks/useReduxHook";
import { Skeleton } from "@/components/ui/skeleton";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";

const CustomLoadingCellRenderer: React.FC = () => {
  return (
    <div className="loading-cell">
      <Skeleton className="h-[20px] w-full" />
    </div>
  );
};

const columnDefs: ColDef[] = [
  {
    headerName: "#",
    field: "ID",
    sortable: true,
    filter: true,
    flex: 1,
  },
  {
    headerName: "Cost Center",
    field: "units_name",
    sortable: true,
    filter: true,
    flex: 1,
  },
  {
    headerName: "Specification",
    field: "units_details",
    sortable: true,
    filter: true,
    flex: 1,
  },
];

const MasterCostCenterTable: React.FC = () => {
  const { costCenter, getCostCenterLoading } = useAppSelector(
    (state) => state.costCenter
  );

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      floatingFilter: true,
    };
  }, []);

  return (
    <div>
      <div className="ag-theme-quartz h-[calc(100vh-50px)]">
        <AgGridReact
          loadingOverlayComponent={CustomLoadingOverlay}
          suppressCellFocus={true}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          rowData={costCenter ?? []}
          loading={getCostCenterLoading}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          headerHeight={40}
          floatingFiltersHeight={36}
          rowHeight={40}
          pagination={true}
          paginationPageSize={50}
          components={{
            customLoadingCellRenderer: CustomLoadingCellRenderer,
          }}
          loadingCellRenderer="customLoadingCellRenderer"
        />
      </div>
    </div>
  );
};

export default MasterCostCenterTable;
