import React from "react";
import { CustomDrawer, CustomDrawerContent, CustomDrawerHeader, CustomDrawerTitle } from "@/components/reusable/CustomDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MasterSFGBOMEditTable from "@/table/master/MasterSFGBOMEditTable";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MasterSFGBOMEditDrawer: React.FC<Props> = ({ open, setOpen }) => {
  return (
    <div>
      <CustomDrawer open={open} onOpenChange={setOpen}>
        <CustomDrawerContent side="right" className="min-w-[100%] p-0">
          <CustomDrawerHeader className="h-[50px] p-0 flex flex-col justify-center px-[20px] bg-slate-100 gap-0 border-b border-zinc-400">
            <CustomDrawerTitle className="text-slate-600 font-[500] p-0">SFG BOM Edit</CustomDrawerTitle>
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
                    <p className="text-[14px] text-muted-foreground">--</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-slate-600 font-[500]">SFG Part Code</p>
                    <p className="text-[14px] text-muted-foreground">--</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-slate-600 font-[500]">SFG</p>
                    <p className="text-[14px] text-muted-foreground">--</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-slate-600 font-[500]">SKU</p>
                    <p className="text-[14px] text-muted-foreground">--</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-slate-600 font-[500]">BOM</p>
                    <p className="text-[14px] text-muted-foreground">--</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <MasterSFGBOMEditTable data={[]} />
          </div>
        </CustomDrawerContent>
      </CustomDrawer>
    </div>
  );
};

export default MasterSFGBOMEditDrawer;
