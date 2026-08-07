import LocationAllotFormPanel from "@/components/locationAllotement/LocationAllotFormPanel";
import {
  CustomDrawer,
  CustomDrawerContent,
  CustomDrawerDescription,
  CustomDrawerHeader,
  CustomDrawerTitle,
} from "@/components/reusable/CustomDrawer";
import {
  clearAllotDetail,
  getAllotDetailAsync,
} from "@/features/locationAllotement/locationAllotSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { CircularProgress } from "@mui/material";
import React, { useEffect } from "react";

type Props = {
  open: boolean;
  editId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const LocationAllotEditDrawer: React.FC<Props> = ({
  open,
  editId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { allotDetail, getAllotDetailLoading } = useAppSelector(
    (state) => state.locationAllot,
  );

  useEffect(() => {
    if (open && editId) {
      dispatch(getAllotDetailAsync(editId));
    }
    if (!open) {
      dispatch(clearAllotDetail());
    }
  }, [open, editId, dispatch]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <CustomDrawer open={open} onOpenChange={handleClose}>
      <CustomDrawerContent side="right" className="min-w-[85%] p-0">
        <CustomDrawerHeader className="h-[60px] p-0 flex flex-col justify-center px-[20px] space-y-0 bg-zinc-200 gap-0">
          <CustomDrawerTitle className="text-slate-600 font-[500] p-0">
            Edit Location Allot
          </CustomDrawerTitle>
          <CustomDrawerDescription className="text-slate-500">
            {allotDetail?.for_module ?? ""}
          </CustomDrawerDescription>
        </CustomDrawerHeader>

        <div className="h-[calc(100vh-60px)]">
          {getAllotDetailLoading ? (
            <div className="flex items-center justify-center h-full">
              <CircularProgress size={36} />
            </div>
          ) : allotDetail ? (
            <LocationAllotFormPanel
              key={editId}
              embedded
              editId={editId}
              initialPageName={allotDetail.for_module}
              initialPageDescription={allotDetail.module_desc}
              initialLocationIds={allotDetail.location_ids}
              onSuccess={handleSuccess}
            />
          ) : null}
        </div>
      </CustomDrawerContent>
    </CustomDrawer>
  );
};

export default LocationAllotEditDrawer;
