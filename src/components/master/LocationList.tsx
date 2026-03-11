import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ColDef, ModuleRegistry } from "@ag-grid-community/core";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoDocumentTextSharp } from "react-icons/io5";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { changeSatatus, getLocationAsync, getLocationDetails } from "@/features/master/location/locationSlice";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

// TypeScript types for hierarchical data and row data
interface HierarchicalData {
  label: string;
  name: string;
  status: string;
  children?: HierarchicalData[];
}
type Props = {
  setViewLocation?: React.Dispatch<React.SetStateAction<boolean>>;
};

interface RowData {
  orgHierarchy: string[];
  name: string;
  status: React.ReactNode;
  action?: React.ReactNode;
  label?: string;
}

// Utility function to flatten hierarchical data
const flattenHierarchy = (data: HierarchicalData[], parentHierarchy: string[] = []): RowData[] => {
  let result: RowData[] = [];

  data.forEach((item) => {
    const currentHierarchy = [...parentHierarchy, item.name];
    result.push({
      orgHierarchy: currentHierarchy,
      name: item.name,
      status: item.status,
      label: item.label,
    });

    if (item.children && item.children.length > 0) {
      result = result.concat(flattenHierarchy(item.children, currentHierarchy));
    }
  });

  return result;
};

// Example component
const TreeDataLocation: React.FC<Props> = ({ setViewLocation }) => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<RowData[]>([]);
  const { getLocationLoading, createLocationData, changeStatusData } = useAppSelector((state) => state.location);
  const dispatch = useAppDispatch();
  const [columnDefs] = useState<ColDef[]>([
    { field: "name" },
    { field: "label", hide: true },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const { data } = params;
        const [active, setActive] = useState(params.value === "ACTIVE" ? 1 : 0);
        return (
          <div>
            <Switch
              defaultChecked={params.value === "ACTIVE" ? true : false}
              checked={active === 1 ? true : false}
              onCheckedChange={(e) => {
                setActive(e ? 1 : 0);
                dispatch(changeSatatus({ key: data?.label, value: e ? "1" : "0" }));
              }}
              className="data-[state=checked]:bg-cyan-700"
            />
          </div>
        );
      },

      maxWidth: 200,
    },
    {
      headerName: "Action",
      field: "action",
      cellRenderer: (params: any) => (
        <DropdownMenu>
          <div className="flex items-center px-[20px] h-full">
            <DropdownMenuTrigger className="p-[5px] focus-visible::ring-slate-300 ">
              <BsThreeDotsVertical className="font-[600] text-[20px] text-slate-600" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="w-[170px]">
            <DropdownMenuItem
              className="flex items-center gap-[10px] text-slate-600"
              onSelect={() => {
                setViewLocation && setViewLocation(true);
                dispatch(getLocationDetails(params?.data?.label));
              }}
            >
              <IoDocumentTextSharp className="h-[18px] w-[18px] text-slate-500" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      sortable: false,
      filter: false,
      maxWidth: 120,
    },
  ]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
    }),
    []
  );

  const autoGroupColumnDef = useMemo<ColDef>(
    () => ({
      headerName: "Location Hierarchy",
      minWidth: 300,
      cellRendererParams: {
        suppressCount: true,
      },
    }),
    []
  );

  const getDataPath = useCallback((data: RowData) => {
    return data.orgHierarchy;
  }, []);

  // Load and set the data on component mount
  useEffect(() => {
    dispatch(getLocationAsync()).then((response: any) => {
      if (response.payload.data.success) {
        const transformedData = flattenHierarchy(response.payload?.data?.data);
        setRowData(transformedData);
      }
    });
  }, [createLocationData, changeStatusData]);
  return (
    <div className=" ag-theme-quartz h-[calc(100vh-50px)]">
      <AgGridReact
      loadingOverlayComponent={CustomLoadingOverlay}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        loading={getLocationLoading}
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        treeData={true}
        groupDefaultExpanded={-1}
        suppressCellFocus={true}
        getDataPath={getDataPath}
      />
    </div>
  );
};
export default TreeDataLocation;
