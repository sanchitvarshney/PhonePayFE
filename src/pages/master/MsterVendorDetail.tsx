import { CustomButton } from "@/components/reusable/CustomButton";
import MasterVendorDetailTable from "@/table/master/MasterVendorDetailTable";
import { Icons } from "@/components/icons";
import React, { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useReduxHook";
import { getVendor } from "@/features/master/vendor/vedorSlice";

const MsterVendorDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getVendor());
  }, [dispatch]);

  return (
    <div className="h-full w-full flex flex-col min-h-0">
      <div className="flex-shrink-0 h-[50px] flex items-center justify-end px-[20px]">
        <CustomButton icon={<Icons.download sx={{ fontSize: 18 }} />} className="bg-cyan-700 hover:bg-cyan-800">
          Download
        </CustomButton>
      </div>
      <div className="flex-1 min-h-0 w-full">
        <MasterVendorDetailTable />
      </div>
    </div>
  );
};

export default MsterVendorDetail;
