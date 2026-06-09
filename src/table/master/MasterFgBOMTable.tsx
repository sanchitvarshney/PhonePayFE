import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { useAppSelector } from "@/hooks/useReduxHook";
import { useDispatch } from "react-redux";
import { changeBomStatus, getFGBomList } from "@/features/master/BOM/BOMSlice";
import { AppDispatch } from "@/features/Store";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { CircularProgress, Switch } from "@mui/material";
import { Link } from "react-router-dom";
import { Icons } from "@/components/icons";

type Props = {
  edit?: boolean;
  setEdit?: React.Dispatch<React.SetStateAction<boolean>>;
  view?: boolean;
  setView?: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProductId: React.Dispatch<React.SetStateAction<string | null>>;
  setBomName: React.Dispatch<React.SetStateAction<string | null>>;
};

const MasterFgBOMTable: React.FC<Props> = () => {
  const { fgBomList, fgBomListLoading, changeStatusLoading } = useAppSelector((state) => state.bom);
  const dispatch = useDispatch<AppDispatch>();
  const [id, setId] = useState<string>("");

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
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      width: 100,
      maxWidth: 100,
      cellRenderer: (row: any) => {
        const [isChecked, setIsChecked] = useState(Boolean(row?.data?.status));
        return (
          <div className="flex items-center h-full">
            {changeStatusLoading && id === row?.data?.id ? (
              <CircularProgress size={20} />
            ) : (
              <Switch
                checked={isChecked}
                onChange={(e) => {
                  setId(row?.data?.id);
                  const newStatus = e.target.checked ? 1 : 0;
                  setIsChecked(Boolean(newStatus));
                  const subject = row?.data?.subjectKey;
                  dispatch(changeBomStatus({ status: newStatus, subject })).then((res: any) => {
                    if (res.payload?.data?.success) {
                      dispatch(getFGBomList("FG"));
                    }
                  });
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      headerName: "BOM Name",
      field: "subjectName",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => (
        <Link className="text-[#5F259F] font-medium flex items-center h-full" to={`/master-fg-bom/${params?.data?.subjectKey}`}>
          {params?.value}
          <Icons.followLink fontSize="small" sx={{ fontSize: "14px", ml: 0.5 }} />
        </Link>
      ),
    },
    {
      headerName: "SKU",
      field: "skuCode",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Created Date",
      field: "insertDate",
      sortable: true,
      filter: true,
      flex: 1,
    },
  ];

  const defaultColDef = useMemo<ColDef>(() => {
    return { filter: true, floatingFilter: true };
  }, []);

  return (
    <div className="ag-theme-quartz h-[calc(100vh-100px)]">
      <AgGridReact
        loadingOverlayComponent={CustomLoadingOverlay}
        loading={fgBomListLoading}
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        suppressCellFocus={true}
        rowData={fgBomList || []}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowHeight={40}
        headerHeight={40}
        floatingFiltersHeight={36}
        pagination={true}
        paginationPageSize={20}
      />
    </div>
  );
};

export default MasterFgBOMTable;
