import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { StatusPanelDef } from "@ag-grid-community/core";
import { calculateTotals } from "@/utils/calculateTotalMin";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { Button, IconButton } from "@mui/material";
import { Icons } from "@/components/icons";
import { generateUniqueId } from "@/utils/uniqueid";
import POCellRenderer from "@/table/Cellrenders/POCellRenderer";
interface RowData {
  partComponent: { lable: string; value: string } | null;
  qty: number;
  rate: string;
  taxableValue: number;
  foreignValue: number;
  hsnCode: string;
  gstType: string;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  location: { lable: string; value: string } | null;
  autoConsump: string;
  remarks: string;
  id: string;
  currency: string;
  isNew?: boolean;
  excRate: number;
  uom: string;
}
interface Totals {
  cgst: number;
  sgst: number;
  igst: number;
  taxableValue: number;
}
type Props = {
  rowData: RowData[];
  setRowData: React.Dispatch<React.SetStateAction<RowData[]>>;
  setTotal: React.Dispatch<React.SetStateAction<Totals>>;
  exchange:any
  currency:any
  gstTypeStatus:string
};
const AddPOTable: React.FC<Props> = ({ rowData, setRowData, setTotal, exchange, currency,gstTypeStatus }) => {
  const gridRef = useRef<AgGridReact<RowData>>(null);
  const getAllTableData = () => {
    const allData: RowData[] = [];

    const rowCount = gridRef.current?.api.getDisplayedRowCount() ?? 0;
    for (let i = 0; i < rowCount; i++) {
      const rowNode = gridRef.current?.api.getDisplayedRowAtIndex(i);

      if (rowNode && rowNode.data) {
        allData.push(rowNode.data);
      }
    }
    setTotal(calculateTotals(allData));
  };

  const handleAddRow = () => {
    getAllTableData();
    const newRow: RowData = {
      id: generateUniqueId(),
      partComponent: null,
      qty: 0,
      rate: "",
      taxableValue: 0,
      foreignValue: 0,
      hsnCode: "",
      gstType: gstTypeStatus,
      gstRate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      location: null,
      autoConsump: "",
      remarks: "",
      currency: currency,
      isNew: true,
      excRate: exchange,
      uom: "",
    };
    setRowData([newRow, ...rowData]);
  };
  const handleDeleteRow = (id: string) => {
    setRowData(rowData.filter((row) => row.id !== id));
  };
  const statusBar = useMemo<{
    statusPanels: StatusPanelDef[];
  }>(() => {
    return {
      statusPanels: [
        { statusPanel: "agFilteredRowCountComponent", align: "right" },
        { statusPanel: "agSelectedRowCountComponent", align: "right" },
        { statusPanel: "agAggregationComponent", align: "right" },
      ],
    };
  }, []);

  const components = useMemo(
    () => ({
      textInputCellRenderer: (params: any) => <POCellRenderer props={params} customFunction={getAllTableData} />,
      
    }),
    []
  );
  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      valueGetter: "node.rowIndex + 1",
      width: 50,
      pinned: "left",
    },
    {
      headerName: "Action",
      field: "action",
      width: 100,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center w-full h-full">
          <IconButton color="error" onClick={() => handleDeleteRow(params.data.id)}>
            <Icons.delete fontSize="small" />
          </IconButton>
        </div>
      ),
      headerComponent: () => (
        <div className="flex items-center justify-center w-full h-full">
          <Button
            variant="contained"
            color="primary"
            style={{
              borderRadius: "10%",
              width: 25,
              height: 25,
              minWidth: 0,
              padding: 0,
            }}
            onClick={handleAddRow}
            size="small"
            sx={{ zIndex: 1 }}
          >
            <Icons.add fontSize="small" />
          </Button>
        </div>
      ),
      pinned: "left",
    },
    {
      headerName: "",
      field: "excRate",
      cellRenderer: "textInputCellRenderer",
      hide: true,
    },
    {
      headerName: "Part Component",
      field: "partComponent",
      cellRenderer: "textInputCellRenderer",
      minWidth: 300,
    },
    {
      headerName: "Qty",
      field: "qty",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "Rate",
      field: "rate",
      cellRenderer: "textInputCellRenderer",
      width: 200,
    },
    // {
    //   headerName: "",
    //   field: "currency",
    //   cellRenderer: "textInputCellRenderer",
    //   width: 80,
    // },
    {
      headerName: "Taxable Value",
      field: "taxableValue",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "Foreign Value",
      field: "foreignValue",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "HSN Code",
      field: "hsnCode",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "GST Type",
      field: "gstType",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "GST Rate",
      field: "gstRate",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "CGST",
      field: "cgst",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "SGST",
      field: "sgst",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "IGST",
      field: "igst",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "Remarks",
      field: "remarks",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "uom",
      field: "uom",

      hide: true,
    },
  ];

  return (
    <div className=" ag-theme-quartz h-[calc(100vh-200px)]">
      <AgGridReact
        suppressCellFocus={false}
        ref={gridRef}
        onCellFocused={(event: any) => {
          const { rowIndex, column } = event;
          const focusedCell = document.querySelector(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${column.colId}"] input `) as HTMLInputElement;
          const focusButton = document.querySelector(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${column.colId}"] button `) as HTMLButtonElement;

          if (focusedCell) {
            focusedCell.focus();
          }
          if (focusButton) {
            focusButton.focus();
          }
        }}
        navigateToNextCell={() => {
          return null; // Returning null prevents default focus movement
        }}
        columnDefs={columnDefs}
        rowData={rowData}
        animateRows
        statusBar={statusBar}
        components={components}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        defaultColDef={{
          resizable: true,
          suppressCellFlash: true,
          editable: false,
        }}
      />
    </div>
  );
};

export default AddPOTable;
