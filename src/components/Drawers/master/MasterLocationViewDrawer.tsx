import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppSelector } from "@/hooks/useReduxHook";
import { CgSpinner } from "react-icons/cg";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MasterLocationViewDrawer: React.FC<Props> = ({ open, setOpen }) => {
  const { getLocationDetailsLoading, getLocationDetails } = useAppSelector(
    (state) => state.location
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="h-[50px] px-5 bg-zinc-200 border-b border-zinc-400 flex flex-row items-center">
          <SheetTitle className="text-slate-600 font-medium p-0">
            Location Detail
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-50px)] overflow-y-auto p-5">
          {getLocationDetailsLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <CgSpinner className="h-[50px] w-[50px] animate-spin text-slate-500" />
            </div>
          ) : (
            <ul>
              <li className="py-2 border-b text-slate-600 flex items-center justify-between">
                <span className="font-semibold">Location Name :</span>
                <span className="font-medium">{getLocationDetails?.loc_name}</span>
              </li>
              <li className="py-2 border-b text-slate-600 flex items-center justify-between">
                <span className="font-semibold">Parent Location :</span>
                <span className="font-medium">{getLocationDetails?.parent_loc_name}</span>
              </li>
              <li className="py-2 border-b text-slate-600 flex items-center justify-between">
                <span className="font-semibold">Location Type :</span>
                <span className="font-medium">{getLocationDetails?.loc_type}</span>
              </li>
              <li className="py-2 border-b text-slate-600 flex items-center justify-between">
                <span className="font-semibold">Address :</span>
                <span className="font-medium">{getLocationDetails?.loc_address}</span>
              </li>
              <li className="py-2 border-b text-slate-600 flex items-center justify-between">
                <span className="font-semibold">Insert Date :</span>
                <span className="font-medium">{getLocationDetails?.insert_date}</span>
              </li>
              <li className="py-2 border-b text-slate-600 flex items-center justify-between">
                <span className="font-semibold">Insert By :</span>
                <span className="font-medium">{getLocationDetails?.insert_by}</span>
              </li>
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MasterLocationViewDrawer;
