import React, { useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Autocomplete, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  createComponentAsync,
  getComponentsAsync,
  getGroupsAsync,
} from "@/features/master/component/componentSlice";
import { getUOMAsync } from "@/features/master/UOM/UOMSlice";
import { showToast } from "@/utils/toasterContext";

const PHONEPE_PURPLE = "#5F259F";

type UOMOption = {
  units_id: string;
  units_name: string;
  units_details?: string;
};

type FormData = {
  component: string;
  part: string;
  notes: string;
  uom: UOMOption | null;
  hsn: string;
};

const MasterComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { UOM, getUOMloading } = useAppSelector((state) => state.uom);
  const { createComponentLoading } = useAppSelector((state) => state.component);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      component: "",
      part: "",
      notes: "",
      uom: null,
      hsn: "",
    },
  });

  useEffect(() => {
    dispatch(getComponentsAsync());
    dispatch(getUOMAsync());
    dispatch(getGroupsAsync());
  }, [dispatch]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!data.uom) {
      showToast("Please select a UOM", "error");
      return;
    }
    const payload = {
      name: data.component,
      description: data.notes,
      uom: data.uom.units_id,
      part: data.part,
      hsn: data.hsn,
    };
    dispatch(createComponentAsync(payload)).then((res: unknown) => {
      const action = res as { payload?: { data?: { success?: boolean; message?: string } } };
      if (action.payload?.data?.success) {
        reset();
        dispatch(getComponentsAsync());
        showToast(action.payload.data.message ?? "Created", "success");
      }
    });
  };

  return (
    <div className="h-[calc(100vh-50px)] grid grid-cols-[400px_1fr] bg-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-5 border-r border-neutral-300 flex flex-col gap-4"
      >
        <Typography variant="h1" className="text-slate-600" fontSize={20} fontWeight={500}>
          Add New Component
        </Typography>
        <TextField
          fullWidth
          label="Component Name"
          {...register("component", { required: "Component Name is required" })}
        />
        {errors.component && (
          <span className="text-[12px] text-red-500">{errors.component.message}</span>
        )}
        <TextField fullWidth label="Part Code" {...register("part")} />
        <Controller
          name="uom"
          control={control}
          rules={{ required: "UOM is required" }}
          render={({ field }) => (
            <Autocomplete
              loading={getUOMloading}
              value={field.value}
              options={UOM ?? []}
              getOptionLabel={(opt) => (opt as UOMOption).units_name}
              renderInput={(params) => (
                <TextField {...params} label="Select UOM" variant="outlined" />
              )}
              onChange={(_, value) => field.onChange(value)}
              isOptionEqualToValue={(opt, val) =>
                (opt as UOMOption).units_id === (val as UOMOption)?.units_id
              }
            />
          )}
        />
        {errors.uom && (
          <span className="text-[12px] text-red-500">{errors.uom.message}</span>
        )}
        <TextField fullWidth label="HSN Code" {...register("hsn")} />
        <TextField
          fullWidth
          label="Notes"
          multiline
          rows={3}
          {...register("notes")}
        />
        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="outline" onClick={() => reset()} className="gap-1">
            <RefreshIcon fontSize="small" /> Reset
          </Button>
          <LoadingButton
            type="submit"
            startIcon={<SaveIcon fontSize="small" />}
            loading={createComponentLoading}
            variant="contained"
            sx={{
              backgroundColor: PHONEPE_PURPLE,
              "&:hover": { backgroundColor: "#4a1d7a" },
            }}
          >
            Submit
          </LoadingButton>
        </div>
      </form>
      <div className="p-5 overflow-auto">
        <Typography variant="h2" className="text-slate-600" fontSize={18} fontWeight={500}>
          Component List
        </Typography>
        <p className="text-sm text-slate-500 mt-2">
          Same APIs as BharatPayFE (/component, /group/groupSelect2, /uom). Connect a grid here if needed.
        </p>
      </div>
    </div>
  );
};

export default MasterComponent;
