import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Chip, LinearProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef } from "react";
import Divider from "@mui/material/Divider";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { Skeleton } from "@/components/ui/skeleton";
import { getBomItem } from "@/features/master/BOM/BOMSlice";
import MasterFGBOMDetailTable from "@/table/master/MasterFGBOMDetailTable";
import { AgGridReact } from "ag-grid-react";
import * as XLSX from "xlsx";

const MasterBomDetailPage: React.FC = () => {
  const gridRef = useRef<AgGridReact<any>>(null);
  const dispatch = useAppDispatch();
  const { bomDetailLoading, bomDetail } = useAppSelector((state) => state.bom);

  const navigate = useNavigate();
  const { id } = useParams();

  const onBtExport = useCallback(() => {
    if (!gridRef.current?.api) return;

    const rows: any[] = [];
    gridRef.current.api.forEachNode((node) => {
      if (node.data) rows.push(node.data);
    });

    const exportData = rows.map((row, index) => ({
      "#": index + 1,
      "Components": row.componentName,
      "Part Code": row.partCode,
      "Status": row.bomstatus == 1 ? "Active" : "Inactive",
      "Quantity": row.requiredQty,
      "Category": row.category,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BOM");
    XLSX.writeFile(workbook, "BOM-Export.xlsx");
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(getBomItem(id));
    }
  }, [id]);

  return (
    <div className="relative bg-white">
      <div className="absolute top-0 left-0 right-0">{bomDetailLoading && <LinearProgress />}</div>
      <div className="head bg-violet-50 h-[100px] border-b border-neutral-400/70 flex items-center justify-between">
        <div className="flex gap-[20px]">
          <Button onClick={() => navigate(-1)} className="p-0 pr-2 text-black bg-transparent rounded-none shadow-none rounded-e-md hover:bg-white/70">
            <Icons.left fontSize="small" />
          </Button>
          {bomDetailLoading ? (
            <div className="min-w-[300px] flex flex-col gap-[5px]">
              <Skeleton className="w-full rounded-md h-[20px]" />
              <Skeleton className="w-[70%] rounded-md h-[15px]" />
              <Skeleton className="w-[40%] rounded-md h-[13px]" />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-[10px]">
                <Typography variant="h1" fontSize={17} fontWeight={600}>
                  {bomDetail?.data?.header?.productName}
                </Typography>
              </div>
              <Chip
                label={bomDetail?.data?.header?.skuCode}
                size="small"
                variant="filled"
                sx={{ maxWidth: "max-content", px: "10px", background: "#5F259F", color: "white", fontWeight: 500 }}
              />
            </div>
          )}
          <Divider orientation="vertical" flexItem />
        </div>
        <div className="flex items-center pr-[20px] gap-[10px]">
          <Button disabled={bomDetailLoading} onClick={onBtExport} className="py-[5px] px-[10px] bg-white text-slate-600 border border-green-600 hover:bg-white/80">
            <Icons.download color="success" />
          </Button>
          <Button disabled={bomDetailLoading} onClick={() => dispatch(getBomItem(id || ""))} className="py-[5px] px-[10px] bg-white text-slate-600 border border-slate-600 hover:bg-white/80">
            <Icons.refresh />
          </Button>
          <Button disabled className="py-[5px] px-[10px] bg-white text-red-600 border border-red-600 hover:bg-white/80">
            <Icons.delete />
          </Button>
        </div>
      </div>
      <div className="border-b tsb border-neutral-400/70">
        {bomDetailLoading ? (
          <div className="h-[calc(100vh-151px)] flex items-center justify-center">
            <img src="/search.svg" className="w-[400px] opacity-60" alt="" />
          </div>
        ) : (
          <div className="h-[calc(100vh-151px)] grid grid-cols-[350px_1fr]">
            <div className="border-r border-neutral-400/70 p-[20px]">
              <List>
                <ListItem>
                  <ListItemText primary="Product Name" secondary={bomDetail?.data?.header?.productName} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="SKU Code" secondary={bomDetail?.data?.header?.skuCode} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="BOM Name" secondary={bomDetail?.data?.header?.subjectName} />
                </ListItem>
              </List>
            </div>
            <div className="h-full overflow-y-auto">
              <MasterFGBOMDetailTable gridRef={gridRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterBomDetailPage;
