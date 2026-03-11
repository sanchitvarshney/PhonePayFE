import React from "react";
import { CustomDrawer,  CustomDrawerContent, CustomDrawerHeader, CustomDrawerTitle } from "@/components/reusable/CustomDrawer"; // Update with the correct path

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const MasterComponnetsViewImageDrawer: React.FC<Props> = ({ open, setOpen }) => {
  return (
    <div>
      <CustomDrawer open={open} onOpenChange={setOpen}>
        <CustomDrawerContent side="right" className="min-w-[40%] p-0" >
          <CustomDrawerHeader className="h-[60px] p-0 flex flex-col justify-center px-[20px] bg-zinc-200 gap-0">
            <CustomDrawerTitle  className="text-slate-600 font-[500] p-0">P10001</CustomDrawerTitle>
          </CustomDrawerHeader>
                <div className="h-[calc(100vh-110px)] overflow-y-hidden">

                </div>
        </CustomDrawerContent>
      </CustomDrawer>
    </div>
  );
};

export default MasterComponnetsViewImageDrawer;
