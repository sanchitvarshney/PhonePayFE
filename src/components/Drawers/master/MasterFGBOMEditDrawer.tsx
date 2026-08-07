import React, { useEffect } from "react";
import { CustomDrawer, CustomDrawerContent, CustomDrawerHeader, CustomDrawerTitle } from "@/components/reusable/CustomDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MasterFGBOMEditTable from "@/table/master/MasterFGBOMEditTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/features/Store";
import { fetchBomProduct } from "@/features/master/BOM/BOMSlice";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProductId?: string | null;
};

const MasterFGBOMEditDrawer: React.FC<Props> = ({ open, setOpen, selectedProductId }) => {
  const [data, setData] = React.useState<any[]>([]);
  const [header, setHeader] = React.useState<any>([]);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (selectedProductId) {
      dispatch(fetchBomProduct(selectedProductId)).then((res: any) => {
        setData(res.payload.data.data.data);
        setHeader(res.payload.data.data.header);
      });
    }
  }, [dispatch, selectedProductId]);

  return (
    <div>
      <CustomDrawer open={open} onOpenChange={setOpen}>
        <CustomDrawerContent side="right" className="min-w-[90%] p-0">
          <CustomDrawerHeader className="h-[50px] p-0 flex flex-col justify-center px-[20px] bg-slate-100 gap-0 border-b border-zinc-400">
            <CustomDrawerTitle className="text-slate-600 font-[500] p-0">{header?.subjectName}</CustomDrawerTitle>
          </CustomDrawerHeader>
          <div className="h-[calc(100vh-50px)] overflow-y-hidden grid grid-cols-[450px_1fr]">
            <div className="p-[10px] border-r">
              <Card className="overflow-hidden rounded-md">
                <CardHeader className="h-[50px] p-0 flex flex-col justify-center px-[20px] bg-slate-100">
                  <CardTitle className="text-slate-600 font-[500]">Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-[20px]">
                  <div className="flex flex-col">
                    <p className="text-slate-600 font-[500]">Product</p>
                    <p className="text-[14px] text-muted-foreground">{header?.productName || "--"}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-slate-600 font-[500]">SKU</p>
                    <p className="text-[14px] text-muted-foreground">{header?.skuCode || "--"}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-slate-600 font-[500]">BOM</p>
                    <p className="text-[14px] text-muted-foreground">{header?.subjectName}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <MasterFGBOMEditTable data={data} header={header} setOpen={setOpen} />
          </div>
        </CustomDrawerContent>
      </CustomDrawer>
    </div>
  );
};

export default MasterFGBOMEditDrawer;
