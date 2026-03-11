import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { useParams } from "react-router-dom";
import { showToast } from "@/utils/toasterContext";
import { Icons } from "@/components/icons";
import { getComponentDetailSlice, updateCompoenntProductionDetailAsync } from "@/features/master/component/componentSlice";

type FormDataType = {
  minStock: string;
  maxStock: string;
  minOrder: string;
  leadtime: string;
  anableAlert: string;
  purchaseCost: string;
  otherCost: string;
};

type Props = {
  detail: {
    minStock: string;
    maxStock: string;
    minOrder: string;
    leadtime: string;
    anableAlert: string;
    purchaseCost: string;
    otherCost: string;
  } | null;
  setUpdateProductionDetail: React.Dispatch<React.SetStateAction<boolean>>;
};

const UpdateComponentProductionDetail: React.FC<Props> = ({ detail, setUpdateProductionDetail }) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { updateCompoenntProductionDetailLoading } = useAppSelector((state) => state.component);

  const defaultValues: FormDataType = {
    minStock: detail?.minStock || "",
    maxStock: detail?.maxStock || "",
    minOrder: detail?.minOrder || "",
    leadtime: detail?.leadtime || "",
    anableAlert: detail?.anableAlert || "",
    purchaseCost: detail?.purchaseCost || "",
    otherCost: detail?.otherCost || "",
  };

  const { register, handleSubmit } = useForm<FormDataType>({
    mode: "all",
    defaultValues,
  });

  const onSubmit = (data: FormDataType) => {
    if (JSON.stringify(data) === JSON.stringify(defaultValues)) {
      return showToast("No changes made", "warning");
    }
    const payload = {
      componentKey: id || "",
      ...data,
    };
    dispatch(updateCompoenntProductionDetailAsync(payload)).then((res: any) => {
      if (res.payload?.data?.success) {
        dispatch(getComponentDetailSlice(id || ""));
        setUpdateProductionDetail(false);
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-4 gap-[20px] py-[20px]">
          <TextField inputProps={{ min: 0 }} type="number" {...register("minStock")} fullWidth variant="filled" label="Min Stock" />
          <TextField inputProps={{ min: 0 }} type="number" {...register("maxStock")} fullWidth variant="filled" label="Max Stock" />
          <TextField inputProps={{ min: 0 }} type="number" {...register("minOrder")} fullWidth variant="filled" label="Min Order" />
          <TextField {...register("leadtime")} fullWidth variant="filled" label="Leadtime" />
          <TextField {...register("anableAlert")} fullWidth variant="filled" label="Enable Alert" />
          <TextField inputProps={{ min: 0 }} type="number" {...register("purchaseCost")} fullWidth variant="filled" label="Purchase Cost" />
          <TextField inputProps={{ min: 0 }} type="number" {...register("otherCost")} fullWidth variant="filled" label="Other Cost" />
        </div>
        <div className="flex items-center gap-[10px] mt-[20px]">
          <LoadingButton
            disabled={updateCompoenntProductionDetailLoading}
            onClick={() => setUpdateProductionDetail(false)}
            sx={{ background: "white", color: "red" }}
            variant="contained"
            startIcon={<Icons.close />}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            loading={updateCompoenntProductionDetailLoading}
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

export default UpdateComponentProductionDetail;

