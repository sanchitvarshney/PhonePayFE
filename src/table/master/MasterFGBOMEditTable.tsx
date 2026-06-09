import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import EditBomCellRenderer from "@/table/Cellrenders/EditBomCellRenderer";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/features/Store";
import { getFGBomList, UpdateBom } from "@/features/master/BOM/BOMSlice";
import LoadingButton from "@mui/lab/LoadingButton";
import { showToast } from "@/utils/toasterContext";
import { Icons } from "@/components/icons";

interface RowData {
  components: string;
  quantity: number;
  partCode: string;
  status: string;
  priority: string;
  qty: string;
  category: string;
  source: string;
  smtMiLoc: string;
  id: number;
  compKey: string;
  requiredQty: string;
  bomstatus: string;
}

const MasterFGBOMEditTable: React.FC<{ data: any; header?: any; setOpen?: any }> = ({ data, header, setOpen }) => {
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
      id: header.subjectKey,
      sku: header?.skukey,
    };
    dispatch(UpdateBom(payload)).then((res: any) => {
      if (res.payload.data.success) {
        dispatch(getFGBomList("FG"));
        setRowData([]);
        showToast(res.payload.data?.message, "success");
        setOpen(false);
      }
    });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "Components",
      field: "componentName",
      sortable: false,
      filter: false,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Part Code",
      field: "partCode",
      sortable: false,
      filter: false,
    },
    {
      headerName: "Status",
      field: "bomstatus",
      cellRenderer: EditBomCellRenderer,
    },
    {
      headerName: "Quantity",
      field: "requiredQty",
      cellRenderer: EditBomCellRenderer,
    },
    {
      headerName: "Category",
      field: "category",
      cellRenderer: EditBomCellRenderer,
    },
  ];

  return (
    <div className="ag-theme-quartz h-[calc(100vh-100px)]">
      <AgGridReact
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        suppressCellFocus={true}
        rowData={rowData}
        columnDefs={columnDefs}
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

export default MasterFGBOMEditTable;
