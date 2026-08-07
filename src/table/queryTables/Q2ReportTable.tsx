import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { useAppSelector } from "@/hooks/useReduxHook";
import { ColDef } from "@ag-grid-community/core";
import { RowData } from "@/features/query/query/queryType";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";

type Props = {
  gridRef: any;
};
const Q6ReportTable: React.FC<Props> = ({ gridRef }) => {
  const [rowData, setRowData] = useState<RowData[]>([]);
  const { q2Statement, q2StatementLoading } = useAppSelector(
    (state) => state.query
  );
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
    };
  }, []);

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) {
      return null; // Return null if the input string is empty or undefined
    }
  
    const parts = dateString.split(" ");
    if (parts.length !== 2) {
      return null; // Return null if the date string doesn't contain both date and time parts
    }
  
    const dateParts = parts[0].split("-");
    if (dateParts.length !== 3) {
      return null; // Return null if the date part doesn't have exactly 3 components (DD-MM-YYYY)
    }
  
    const timeParts = parts[1].split(":");
    if (timeParts.length !== 3) {
      return null; // Return null if the time part doesn't have exactly 3 components (HH:mm:ss)
    }
  
    // Construct a new date in the format YYYY-MM-DDTHH:mm:ss
    const formattedDateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`;
  
    const parsedDate = new Date(formattedDateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate; // Return null if the resulting date is invalid
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

useEffect(() => {
  if (Array.isArray(q2Statement) && q2Statement.length > 0) {
    const convertedData: any[] = q2Statement
      .filter((item:any) => item.date) // filter out any items without date
      .map((item:any) => ({
        insertDate: parseDate(item.date),
        transaction: item.minNo,
        transactionType: item.transactionType,
        method: item.method,
        locIn: item.location,
        locOut: item.locationOut,
        insertBy: item.user,
        moveId: item.deviceMovId
      }));
    setRowData(convertedData);
  } else {
    setRowData([]);
  }
}, [q2Statement]);


  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
      valueGetter: (params: any) => params.node.rowIndex + 1,
    },
    {
      headerName: "Date",
      field: "insertDate",
      sortable: true,
      filter: true,
      sort: "asc",
      valueFormatter: (params: any) => formatDate(new Date(params.value)),
    },
    {
      headerName: "Transaction ID",
      field: "transaction",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Method",
      field: "method",
      sortable: true,
      filter: true,
      width: 150,
    },
    { headerName: "Location In", field: "locIn", sortable: true, filter: true },
    {
      headerName: "Location Out",
      field: "locOut",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Transaction Type",
      field: "transactionType",
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: "Move ID",
      field: "moveId",
      sortable: true,
      filter: true,
      width:250
    },
    {
      headerName: "Inserted By",
      field: "insertBy",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Remark",
      field: "remark",
      sortable: true,
      filter: true,
    },
  ];

  return (
    <div>
      <div className=" ag-theme-quartz h-[calc(100vh-100px)]">
        <AgGridReact
          loadingOverlayComponent={CustomLoadingOverlay}
          ref={gridRef}
          loading={q2StatementLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true} 
          paginationPageSize={20}
          enableCellTextSelection
        />
      </div>
    </div>
  );
};

export default Q6ReportTable;
