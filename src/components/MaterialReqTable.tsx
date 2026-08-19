import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { StatusPanelDef } from "@ag-grid-community/core";
import MaterialCellRender from "./MaterialCellRender";
import { Icons } from "@/components/icons";
import { Button, IconButton } from "@mui/material";
import { useAppSelector } from "@/hooks/useReduxHook";

interface RowData {
  code: { lable: string; value: string; deviceKey?: string } | null;
  pickLocation: { lable: string; value: string } | null;
  batch: { lable: string; value: string } | null;
  orderqty: string;
  remarks: string;
  id: string;
  isNew: boolean;
  availableqty: string;
}
type Props = {
  rowData: RowData[];
  setRowdata: React.Dispatch<React.SetStateAction<RowData[]>>;
  addRow: () => void;
  module?: string;
};
const MaterialReqTable: React.FC<Props> = ({
  rowData,
  setRowdata,
  addRow,
  module = "",
}) => {
  const gridRef = useRef<AgGridReact<RowData>>(null);
   const { type } = useAppSelector((state) => state.materialRequestWithoutBom);
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
      textInputCellRenderer: (params: any) => (
        <MaterialCellRender
          props={params}
          customFunction={getAllTableData}
          module={module}
        />
      ),
    }),
    [],
  );

  const handleDeleteRow = (id: string) => {
    setRowdata(rowData.filter((row) => row.id !== id));
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "id",
      width: 50,
      valueGetter: "node.rowIndex + 1",
      pinned: "left",
    },
    {
      headerName: "Action",
      field: "action",
      width: 80,
      suppressNavigable: true,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center w-full h-full">
          <IconButton onClick={() => handleDeleteRow(params.data.id)}>
            <Icons.delete fontSize="small" color="error" />
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
            onClick={addRow}
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
      headerName: type === "device" ? "Device Name" : "Part Code",
      field: "code",
      cellRenderer: "textInputCellRenderer",
      minWidth: 300,
    },
    {
      headerName: "Pick Location",
      field: "pickLocation",
      cellRenderer: "textInputCellRenderer",
      minWidth: 300,
    },
    ...(type === "device"
      ? [
          {
            headerName: "Batch",
            field: "batch",
            cellRenderer: "textInputCellRenderer",
            minWidth: 250,
          },
        ]
      : []),
    {
      headerName: "Available Qty",
      field: "availableqty",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "Order Qty",
      field: "orderqty",
      cellRenderer: "textInputCellRenderer",
      minWidth: 250,
    },
    {
      headerName: "Remarks",
      field: "remarks",
      cellRenderer: "textInputCellRenderer",
    },
    {
      headerName: "unit",
      field: "unit",
      hide: true,
    },
  ];

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }
        e.preventDefault();
        addRow();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="ag-theme-quartz material-req-grid h-[calc(100vh-100px)]">
      <AgGridReact
        ref={gridRef}
        rowHeight={50}
        headerHeight={40}
        getRowId={(params) => params.data.id}
        onCellFocused={(event: any) => {
          if (event.column?.getColId() === "action") return;
          const { rowIndex, column } = event;
          const focusedCell = document.querySelector(
            `.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${column.colId}"] input `,
          ) as HTMLInputElement;
          const focusButton = document.querySelector(
            `.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${column.colId}"] button `,
          ) as HTMLButtonElement;

          if (focusedCell) {
            focusedCell.focus();
          }
          if (focusButton) {
            focusButton.focus();
          }
        }}
        columnDefs={columnDefs}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        rowData={rowData}
        animateRows
        loading={false}
        statusBar={statusBar}
        components={components}
        defaultColDef={{
          resizable: true,
          editable: false,
        }}
        navigateToNextCell={() => {
          return null;
        }}
      />
    </div>
  );
};

export default MaterialReqTable;
