import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { useParams } from "react-router-dom";
import { showToast } from "@/utils/toasterContext";
import { Icons } from "@/components/icons";
import { getComponentDetailSlice, updateCompoenntAdvanceDetailAsync } from "@/features/master/component/componentSlice";

type FormDataType = {
  brand: string;
  ean: string;
  weight: string;
  height: string;
  width: string;
  vweight: string;
};

type Props = {
  detail: {
    brand: string;
    ean: string;
    weight: string;
    height: string;
    width: string;
    vweight: string;
  } | null;
  setUpdateAdvanceDetail: React.Dispatch<React.SetStateAction<boolean>>;
};

const UpdateComponentAdvanceDetail: React.FC<Props> = ({ detail, setUpdateAdvanceDetail }) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { updateCompoenntAdvanceDetailLoading } = useAppSelector((state) => state.component);

  const defaultValues: FormDataType = {
    brand: detail?.brand || "",
    ean: detail?.ean || "",
    weight: detail?.weight || "",
    height: detail?.height || "",
    width: detail?.width || "",
    vweight: detail?.vweight || "",
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormDataType>({
    mode: "all",
    defaultValues,
  });

  const onSubmit = (data: FormDataType) => {
    if (JSON.stringify(data) === JSON.stringify(defaultValues)) {
      return showToast("No changes made", "warning");
    }
    const payload = { ...data, componentKey: id || "" };
    dispatch(updateCompoenntAdvanceDetailAsync(payload)).then((res: any) => {
      if (res.payload?.data?.success) {
        dispatch(getComponentDetailSlice(id || ""));
        setUpdateAdvanceDetail(false);
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-4 gap-[20px] py-[20px]">
          <Controller
            name="brand"
            rules={{ required: "Brand is required" }}
            control={control}
            render={({ field }) => (
              <TextField
                error={!!errors.brand}
                helperText={errors.brand?.message}
                {...field}
                label="Brand"
                variant="filled"
              />
            )}
          />
          <TextField {...register("ean")} fullWidth variant="filled" label="EAN" />
          <TextField {...register("weight")} fullWidth variant="filled" label="Weight (gms)" />
          <TextField {...register("height")} fullWidth variant="filled" label="Height (mm)" />
          <TextField {...register("width")} fullWidth variant="filled" label="Width (mm)" />
          <TextField {...register("vweight")} fullWidth variant="filled" label="Volumetric Weight" />
        </div>
        <div className="flex items-center gap-[10px] mt-[20px]">
          <LoadingButton
            disabled={updateCompoenntAdvanceDetailLoading}
            onClick={() => setUpdateAdvanceDetail(false)}
            sx={{ background: "white", color: "red" }}
            variant="contained"
            startIcon={<Icons.close />}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            loading={updateCompoenntAdvanceDetailLoading}
            loadingPosition="start"
            type="submit"
            variant="contained"
            startIcon={<Icons.save />}
          >
            Save
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default UpdateComponentAdvanceDetail;

