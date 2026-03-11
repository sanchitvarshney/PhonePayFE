import React, { useState } from "react";
import { CustomDrawer,  CustomDrawerContent, CustomDrawerHeader, CustomDrawerFooter, CustomDrawerTitle, CustomDrawerDescription } from "@/components/reusable/CustomDrawer"; // Update with the correct path
import { CustomButton } from "@/components/reusable/CustomButton";
import { HiOutlineRefresh } from "react-icons/hi";
import { IoCheckmark } from "react-icons/io5";
import CustomInput from "@/components/reusable/CustomInput";
import CustomSelect from "@/components/reusable/CustomSelect";
import { IoDocumentText } from "react-icons/io5";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const MasterComponentsUpdateDrawer: React.FC<Props> = ({ open, setOpen }) => {
  const [openDeatail, setOpenDetail] = useState<boolean>(false);
  return (
    <div>
      <CustomDrawer open={openDeatail} onOpenChange={setOpenDetail}>
        <CustomDrawerContent className="p-0 min-w-[40%]" onInteractOutside={(e)=>e.preventDefault()}>
          <CustomDrawerHeader className="h-[60px] p-0 flex flex-col justify-center px-[20px] bg-zinc-200 gap-0">
            <CustomDrawerTitle className="text-slate-600 font-[500] p-0">Category Details</CustomDrawerTitle>
          </CustomDrawerHeader>
          <div className="px-[20px] py-[20px] flex flex-col gap-[30px]">
            <p className="text-[13px] text-muted-foreground">Select a Category to continue In Case of category "Others" no attributes will be required and no unique Id will be generated</p>
            <div className="grid grid-cols-2 gap-[30px]">
              <CustomInput label="Unique ID" />
              <CustomSelect placeholder="Category" />
            </div>
            <CustomButton icon={<IoCheckmark className="h-[18px] w-[18px] " />} className="bg-cyan-700 hover:bg-cyan-800 max-w-max">
              Submit
            </CustomButton>
          </div>
        </CustomDrawerContent>
      </CustomDrawer>
      <CustomDrawer open={open} onOpenChange={setOpen}>
        <CustomDrawerContent side="right" className="min-w-[80%] p-0">
          <CustomDrawerHeader className="h-[60px] p-0 flex flex-col justify-center px-[20px] space-y-0 bg-zinc-200 gap-0">
            <CustomDrawerTitle className="text-slate-600 font-[500] p-0">Update Component</CustomDrawerTitle>
            <CustomDrawerDescription className="">Part Code:P10001</CustomDrawerDescription>
          </CustomDrawerHeader>
          <div className="h-[calc(100vh-110px)] overflow-y-auto flex flex-col gap-[30px] px-[20px] ">
            <div className=""></div>
            <fieldset className="border p-[20px] rounded-md">
              <legend className="text-slate-600 font-[600]">Basic Details</legend>
              <div className="grid grid-cols-3 gap-[30px]">
                <CustomInput disabled label="Part Code" />
                <CustomInput label="Component Name" />
                <CustomSelect placeholder="UOM" />
                <CustomInput label="Type" />
                <CustomInput label="MRP" />
                <CustomSelect placeholder="Group" />
              </div>
              <div className="flex items-center justify-between mt-[30px]">
                <div>
                  <p className="text-slate-500 text-[15px]">Attribute Code</p>
                  <p className="text-slate-600 text-[14px]">210023</p>
                </div>
                <div className="flex items-center gap-[20px] w-[50%]">
                  <CustomButton onClick={() => setOpenDetail(true)} icon={<IoDocumentText className="h-[18px] w-[18px] text-slate-600" />} variant={"outline"} className="text-slate-600">
                    Details
                  </CustomButton>
                  <CustomSelect placeholder="Is Enabled" className="w-[300px]" />
                  <CustomInput label="Job Work" className="w-[300px]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[30px] mt-[30px]">
                <div>
                  <CustomSelect placeholder="QC Status" />
                </div>
                <div className="flex flex-col">
                  <Label className="text-slate-500 text-[15px]">Description</Label>
                  <Textarea className="h-[100px]" />
                </div>
              </div>
            </fieldset>
            <fieldset className="border p-[20px] rounded-md">
              <legend className="text-slate-600 font-[600]">Tax Details</legend>
              <div className="grid grid-cols-3 gap-[30px]">
                <CustomSelect placeholder="Tax Type" />
                <CustomSelect placeholder="Tax Rate %" />
              </div>
            </fieldset>
            <fieldset className="border p-[20px] rounded-md">
              <legend className="text-slate-600">Advance Details</legend>
              <div className="grid grid-cols-3 gap-[30px]">
                <CustomInput label="Brand" />
                <CustomInput label="Brand" />
                <CustomInput label="Weight(gms)" />
                <CustomInput label="Height(mm)" />
                <CustomInput label="Width(mm)" />
                <CustomInput label="Volumetric Weight" />
              </div>
            </fieldset>
            <fieldset className="border p-[20px] rounded-md">
              <legend className="text-slate-600 font-[600]">Production Details</legend>
              <div className="grid grid-cols-3 gap-[30px]">
                <CustomInput label="Min Stock" />
                <CustomInput label="Max Stock" />
                <CustomInput label="Min Order" />
                <CustomInput label="Lead Time" />
                <CustomInput label="Enable Alert" />
                <CustomInput label="Purchase Cost" />
                <CustomInput label="Other Cost" />
              </div>
            </fieldset>
            <div className="h-[50px]"></div>
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

export default MasterComponentsUpdateDrawer;
