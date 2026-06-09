import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";

interface RowData {
  id: number;
  status: string;
  product: string;
  sku: string;
  label: string;
  createdDate: string;
}

type Props = {
  edit?: boolean;
  setEdit?: React.Dispatch<React.SetStateAction<boolean>>;
  view?: boolean;
  setView?: React.Dispatch<React.SetStateAction<boolean>>;
};

const MasterSFGBOMTable: React.FC<Props> = ({ setEdit, setView }) => {
  const rowData: RowData[] = [
    { id: 1, status: "Active", product: "Product 1", sku: "SKU001", label: "Label 1", createdDate: "2024-08-01" },
    { id: 2, status: "Inactive", product: "Product 2", sku: "SKU002", label: "Label 2", createdDate: "2024-08-15" },
  ];

  const columnDefs: ColDef[] = [
    {
      headerName: "Action",
      field: "action",
      cellRenderer: () => (
        <div className="flex items-center h-full">
          <DropdownMenu>
            <div className="flex items-center px-[20px] h-full">
              <DropdownMenuTrigger className="p-[5px] h-full flex items-center">
                <BsThreeDotsVertical className="font-[600] text-[20px] text-slate-600" />
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent className="w-[170px]" side="bottom" align="start">
              <DropdownMenuItem className="flex items-center gap-[10px] text-slate-600" onSelect={() => setEdit && setEdit(true)}>
                <FaEdit className="h-[18px] w-[18px] text-slate-500" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-[10px] text-slate-600" onSelect={() => setView && setView(true)}>
                <HiMiniViewfinderCircle className="h-[18px] w-[18px] text-slate-500" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="flex items-center gap-[10px] text-slate-600">
                <Download className="h-[18px] w-[18px] text-slate-500" />
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
    { headerName: "ID", field: "id", sortable: true, filter: true, width: 70 },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: () => (
        <div className="flex items-center h-full">
          <Switch id="airplane-mode" />
        </div>
      ),
    },
    { headerName: "Product", field: "product", sortable: true, filter: true, flex: 1 },
    { headerName: "SKU", field: "sku", sortable: true, filter: true, flex: 1 },
    { headerName: "Label", field: "label", sortable: true, filter: true, flex: 1 },
    { headerName: "Created Date", field: "createdDate", sortable: true, filter: true, flex: 1 },
  ];

  const defaultColDef = useMemo<ColDef>(() => {
    return { filter: true };
  }, []);

  return (
    <div className="ag-theme-quartz h-[calc(100vh-100px)]">
      <AgGridReact loadingOverlayComponent={CustomLoadingOverlay} overlayNoRowsTemplate={OverlayNoRowsTemplate} suppressCellFocus={true} rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} pagination={true} paginationPageSize={10} />
    </div>
  );
};

export default MasterSFGBOMTable;
