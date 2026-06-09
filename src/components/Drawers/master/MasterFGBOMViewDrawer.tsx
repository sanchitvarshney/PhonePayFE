import React, { useEffect } from "react";
import { CustomDrawer, CustomDrawerContent, CustomDrawerHeader, CustomDrawerTitle } from "@/components/reusable/CustomDrawer";
import MasterFGBOMViewTable from "@/table/master/MasterFGBOMViewTable";
import { getBomItem } from "@/features/master/BOM/BOMSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/features/Store";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bomName?: string | null;
  selectedProductId?: string | null;
};

const MasterFGBOMViewDrawer: React.FC<Props> = ({ open, setOpen, bomName, selectedProductId }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (selectedProductId) {
      dispatch(getBomItem(selectedProductId));
    }
  }, [dispatch, selectedProductId]);

  return (
    <div>
      <CustomDrawer open={open} onOpenChange={setOpen}>
        <CustomDrawerContent side="right" className="min-w-[60%] p-0">
          <CustomDrawerHeader className="h-[50px] p-0 flex flex-col justify-center px-[20px] bg-slate-100 gap-0 border-b border-zinc-400">
            <CustomDrawerTitle className="text-slate-600 font-[500] p-0">{bomName}</CustomDrawerTitle>
          </CustomDrawerHeader>
          <div className="h-[calc(100vh-50px)] overflow-y-hidden">
            <MasterFGBOMViewTable />
          </div>
        </CustomDrawerContent>
      </CustomDrawer>
    </div>
  );
};

export default MasterFGBOMViewDrawer;
