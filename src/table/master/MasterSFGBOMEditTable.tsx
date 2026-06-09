import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import EditBomCellRenderer from "@/table/Cellrenders/EditBomCellRenderer";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/features/Store";
import { getFGBomList, UpdateBom } from "@/features/master/BOM/BOMSlice";
import LoadingButton from "@mui/lab/LoadingButton";
import { showToast } from "@/utils/toasterContext";
import { Icons } from "@/components/icons";

interface RowData {
  compKey: string;
  componentName: string;
  partCode: string;
  requiredQty: string;
  bomstatus: string;
  category: string;
}

const MasterSFGBOMEditTable: React.FC<{ data: any; header?: any; setOpen?: any }> = ({ data, header, setOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [rowData, setRowData] = useState<RowData[]>([]);

  useEffect(() => {
    if (data) {
      setRowData(data);
    }
  }, [data]);

  const handleSubmit = () => {
    const payload = {
      items: {
        component: rowData.map((row) => row.compKey),
        qty: rowData.map((row) => Number(row.requiredQty)),
        status: rowData.map((row) => Number(row.bomstatus)),
        category: rowData.map((row) => row.category),
      },
      id: header?.subjectKey,
      sku: header?.skukey,
    };
    dispatch(UpdateBom(payload)).then((res: any) => {
      if (res.payload.data.success) {
        dispatch(getFGBomList("SFG"));
        setRowData([]);
        showToast(res.payload.data?.message, "success");
        setOpen(false);
      }
    });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "rowIndex",
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
      width: 70,
      maxWidth: 70,
    },
    {
      headerName: "Components",
      field: "componentName",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Part Code",
      field: "partCode",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Status",
      field: "bomstatus",
      cellRenderer: EditBomCellRenderer,
      width: 130,
    },
    {
      headerName: "Quantity",
      field: "requiredQty",
      cellRenderer: EditBomCellRenderer,
      width: 130,
    },
    {
      headerName: "Category",
      field: "category",
      cellRenderer: EditBomCellRenderer,
      flex: 1,
      minWidth: 140,
    },
  ];

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      cellStyle: { padding: "0 6px", display: "flex", alignItems: "center" },
    };
  }, []);

  return (
    <div className="ag-theme-quartz h-[calc(100vh-100px)]">
      <AgGridReact
        loadingOverlayComponent={CustomLoadingOverlay}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        suppressCellFocus={true}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowHeight={45}
        headerHeight={40}
        components={{ EditBomCellRenderer }}
      />
      <div className="flex items-center justify-end px-[20px] h-[50px] border-t border-neutral-300">
        <LoadingButton
          loadingPosition="start"
          type="submit"
          variant="contained"
          startIcon={<Icons.save fontSize="small" />}
          onClick={handleSubmit}
        >
          Submit
        </LoadingButton>
      </div>
    </div>
  );
};

export default MasterSFGBOMEditTable;
