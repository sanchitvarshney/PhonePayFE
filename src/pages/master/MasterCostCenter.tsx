import React, { useEffect } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import MasterCostCenterTable from "@/table/master/MasterCostCenterTable";
import { useForm, SubmitHandler } from "react-hook-form";
import { CostCenter } from "@/features/master/costCenter/costCenterType";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  createCostCenterAsync,
  getCostCenterAsync,
} from "@/features/master/costCenter/costCenterSlice";
import { showToast } from "@/utils/toasterContext";
import { Button, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

const MasterCostCenter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { createCostCenterLoading } = useAppSelector(
    (state) => state.costCenter
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CostCenter>();

  const onSubmit: SubmitHandler<CostCenter> = (data) => {
    dispatch(createCostCenterAsync(data)).then((res: any) => {
      if (res.payload?.data?.success) {
        reset();
        dispatch(getCostCenterAsync());
        showToast(res.payload.data.message, "success");
      }
    });
  };

  useEffect(() => {
    dispatch(getCostCenterAsync());
  }, [dispatch]);

  return (
    <div className="h-[calc(100vh-50px)] relative  ">
      <div className="grid  w-full grid-cols-[500px_1fr] bg-white ">
        <div className="w-full border-r border-neutral-300">
          <form onSubmit={handleSubmit(onSubmit)} className="p-[30px]">
            <Typography
              className="text-slate-600"
              variant="h1"
              component={"div"}
              fontSize={20}
              fontWeight={500}
            >
              Create Cost Center
            </Typography>
            <div className="py-[20px] flex flex-col gap-[30px]">
              <div>
                <TextField
                  fullWidth
                  label="Cost Center"
                  {...register("costCenter", {
                    required: "Cost Center is required",
                  })}
                />
                {errors.costCenter && (
                  <span className=" text-[12px] text-red-500">
                    {errors.costCenter.message}
                  </span>
                )}
              </div>
              <div>
                <TextField
                  label="Code"
                  placeholder="e.g. FIN001"
                  sx={{ maxWidth: 280 }}
                  {...register("description", {
                    required: "Code is required",
                  })}
                />
                {errors.description && (
                  <span className=" text-[12px] text-red-500">
                    {errors.description.message}
                  </span>
                )}
              </div>
            </div>
            <div className="h-[50px] p-0 flex items-center px-[20px] gap-[10px] justify-end">
              <Button
                startIcon={<RefreshIcon fontSize="small" />}
                onClick={() => reset()}
                variant="contained"
                sx={{ background: "white", color: "red" }}
              >
                Reset
              </Button>
              <LoadingButton
                startIcon={<SaveIcon fontSize="small" />}
                loadingPosition="start"
                type="submit"
                variant="contained"
                loading={createCostCenterLoading}
              >
                Submit
              </LoadingButton>
            </div>
          </form>
        </div>
        <div>
          <MasterCostCenterTable />
        </div>
      </div>
    </div>
  );
};

export default MasterCostCenter;
