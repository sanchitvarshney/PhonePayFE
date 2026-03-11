import { LoadingButton } from "@mui/lab";
import { InputAdornment, TextField } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { useParams } from "react-router-dom";
import { showToast } from "@/utils/toasterContext";
import { Icons } from "@/components/icons";
import { getComponentDetailSlice, updateCompoenntTaxDetailAsync } from "@/features/master/component/componentSlice";

type FormDataType = {
  taxRate: string | number;
  hsn: string;
};

type Props = {
  detail: {
    taxRate: number | string;
    hsn: string;
  } | null;
  setUpdateTaxDetail: React.Dispatch<React.SetStateAction<boolean>>;
};

const UpdateComponentTaxDetail: React.FC<Props> = ({ detail, setUpdateTaxDetail }) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { updateCompoenntTaxDetailLoading } = useAppSelector((state) => state.component);

  const defaultValues: FormDataType = {
    taxRate: detail?.taxRate || 0,
    hsn: detail?.hsn || "",
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
      taxRate: Number(data.taxRate),
      hsn: data.hsn,
    };
    dispatch(updateCompoenntTaxDetailAsync(payload)).then((res: any) => {
      if (res.payload?.data?.success) {
        dispatch(getComponentDetailSlice(id || ""));
        setUpdateTaxDetail(false);
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-4 gap-[20px] py-[20px]">
          <TextField {...register("hsn")} fullWidth variant="filled" label="HSN Code" />
          <TextField
            inputProps={{ min: 0 }}
            type="number"
            {...register("taxRate")}
            fullWidth
            variant="filled"
            label="GST Rate"
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
            }}
          />
        </div>
        <div className="flex items-center gap-[10px] mt-[20px]">
          <LoadingButton
            disabled={updateCompoenntTaxDetailLoading}
            onClick={() => setUpdateTaxDetail(false)}
            sx={{ background: "white", color: "red" }}
            variant="contained"
            startIcon={<Icons.close />}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            loading={updateCompoenntTaxDetailLoading}
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

export default UpdateComponentTaxDetail;

