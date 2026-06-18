import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CraeteBomCellRender from "../Cellrenders/CraeteBomCellRender";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, IconButton } from "@mui/material";
import { Icons } from "@/components/icons";

interface RowData {
  id: string;
  component: { lable: string; value: string } | null;
  category: string;
  subcategory: string;
  status: string;
  qty: number;
  isNew: boolean;
  uom: string;
  remark: string;
  reference: string;
}
type Props = {
  rowData: RowData[];
  setRowdata: React.Dispatch<React.SetStateAction<RowData[]>>;
  addRow: () => void;
};

const MasterBOMCraeteTable: React.FC<Props> = ({ rowData, setRowdata, addRow }) => {
  const gridRef = useRef<AgGridReact<RowData>>(null);

  const handleDeleteRow = (id: string) => {
    setRowdata(rowData.filter((row) => row.id !== id));
  };

  const getAllTableData = () => {
    const allData: RowData[] = [];
    const rowCount = gridRef.current?.api.getDisplayedRowCount() ?? 0;
    for (let i = 0; i < rowCount; i++) {
      const rowNode = gridRef.current?.api.getDisplayedRowAtIndex(i);
      if (rowNode && rowNode.data) {
        allData.push(rowNode.data);
      }
    }
    setRowdata(allData);
  };

  const components = useMemo(
    () => ({
      textInputCellRenderer: (params: any) => <CraeteBomCellRender props={params} customFunction={getAllTableData} />,
    }),
    []
  );

  const columnDefs: ColDef[] = [
    {
      headerName: "",
      field: "action",
      width: 60,
      resizable: false,
      sortable: false,
      cellStyle: { padding: 0, display: "flex", alignItems: "center", justifyContent: "center" },
      cellRenderer: (params: any) => (
        <IconButton size="small" color="error" onClick={() => handleDeleteRow(params.data.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
      headerComponent: () => (
        <div className="flex items-center justify-center w-full h-full">
          <Button
            variant="contained"
            color="primary"
            style={{ borderRadius: "8px", width: 28, height: 28, minWidth: 0, padding: 0 }}
            onClick={addRow}
            size="small"
          >
            <Icons.add fontSize="small" />
          </Button>
        </div>
      ),
    },
    {
      headerName: "Components",
      field: "component",
      cellRenderer: "textInputCellRenderer",
      flex: 3,
      minWidth: 220,
    },
    {
      headerName: "Quantity",
      field: "qty",
      cellRenderer: "textInputCellRenderer",
      flex: 1,
      minWidth: 110,
    },
    {
      headerName: "UOM",
      field: "uom",
      flex: 1,
      minWidth: 80,
      maxWidth: 100,
      cellStyle: { display: "flex", alignItems: "center", padding: "0 8px", color: "#64748b", fontSize: "13px" },
    },
    {
      headerName: "Category",
      field: "category",
      cellRenderer: "textInputCellRenderer",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Sub Category",
      field: "subcategory",
      cellRenderer: "textInputCellRenderer",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Status",
      field: "status",
      cellRenderer: "textInputCellRenderer",
      flex: 1,
      minWidth: 130,
    },
    {
      headerName: "Reference",
      field: "reference",
      cellRenderer: "textInputCellRenderer",
      flex: 1,
      minWidth: 130,
    },
    {
      headerName: "Remark",
      field: "remark",
      cellRenderer: "textInputCellRenderer",
      flex: 1,
      minWidth: 130,
    },
  ];

  return (
    <div className="ag-theme-quartz h-full">
      <AgGridReact
        suppressCellFocus
        ref={gridRef}
        rowHeight={45}
        headerHeight={42}
        onCellFocused={(event: any) => {
          const { rowIndex, column } = event;
          const focusedCell = document.querySelector(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${column.colId}"] input`) as HTMLInputElement;
          const focusButton = document.querySelector(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${column.colId}"] button`) as HTMLButtonElement;
          if (focusedCell) focusedCell.focus();
          if (focusButton) focusButton.focus();
        }}
        navigateToNextCell={() => null}
        columnDefs={columnDefs}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        rowData={rowData}
        animateRows
        loading={false}
        components={components}
        defaultColDef={{ resizable: true, editable: false, cellStyle: { padding: "0 6px", display: "flex", alignItems: "center" } }}
      />
    </div>
  );
};

export default MasterBOMCraeteTable;
