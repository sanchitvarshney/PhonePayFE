import React, { useState } from "react";
import { CustomDrawer, CustomDrawerContent, CustomDrawerHeader, CustomDrawerFooter, CustomDrawerTitle } from "@/components/reusable/CustomDrawer"; // Update with the correct path
import { CustomButton } from "@/components/reusable/CustomButton";
import { HiOutlineRefresh } from "react-icons/hi";
import { IoCheckmark } from "react-icons/io5";
import CustomInput from "@/components/reusable/CustomInput";
import FileUploaderTest from "@/components/reusable/FileUploaderTest";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const MasterComponentsUplaodImageDrawer: React.FC<Props> = ({ open, setOpen }) => {
  const [files,setfiles]= useState<File[] | null>(null)
  return (
    <div>
      <CustomDrawer open={open} onOpenChange={setOpen}>
        <CustomDrawerContent side="right" className="p-0 min-w-[30%]" >
          <CustomDrawerHeader className="h-[60px] p-0 flex flex-col justify-center px-[20px] bg-zinc-200 gap-0">
            <CustomDrawerTitle  className="text-slate-600 font-[500] p-0">0402-74R-0%-0.1W-SMD-Resistor</CustomDrawerTitle>
          </CustomDrawerHeader>
                <div className="h-[calc(100vh-110px)] overflow-y-hidden py-[20px]flex flex-col gap-[30px] px-[20px] py-[20px]">
                   <div className="grid gap-[30px]">
                    <CustomInput label="Caption"/>
                    <FileUploaderTest files={files} setFiles={setfiles}/>
                   </div>
                </div>
        
          <CustomDrawerFooter className="h-[50px] p-0 flex items-center px-[20px] border-t gap-[10px] justify-end">
            <CustomButton icon={<HiOutlineRefresh className="h-[18px] w-[18px] text-red-600" />} variant={"outline"}>
              Reset
            </CustomButton>
            <CustomButton icon={<IoCheckmark className="h-[18px] w-[18px] " />} className="bg-cyan-700 hover:bg-cyan-800">
              Submit
            </CustomButton>
            </CustomDrawerFooter>
        </CustomDrawerContent>
      </CustomDrawer>
    </div>
  );
};

export default MasterComponentsUplaodImageDrawer;
