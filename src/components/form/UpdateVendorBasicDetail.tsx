import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import React from "react";
import { Icons } from "@/components/icons";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getVendorBranch, updateBasicDetail } from "@/features/master/vendor/vedorSlice";
import { useParams } from "react-router-dom";
import { showToast } from "@/utils/toasterContext";

type FormDataType = {
  name: string;
  email: string;
  mobile: string;
  pannumber: string;
  cinnumber: string;
  gstin: string;
  paymentTerm: string;
};
type Props = {
  detail: {
    name: string;
    code: string;
    cinNo: string;
    gstin: string;
    panNo: string;
    email: string;
    mobile: string;
    paymentinDays: string;
  } | null;
  setUpdateBasicDetail: React.Dispatch<React.SetStateAction<boolean>>;
};
const UpdateVendorBasicDetail: React.FC<Props> = ({ detail, setUpdateBasicDetail }) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { vendorBasicDetailUpdateLoading } = useAppSelector((state) => state.vendor);
  const defaultValues = {
    name: detail?.name,
    email: detail?.email,
    mobile: detail?.mobile,
    pannumber: detail?.panNo,
    cinnumber: detail?.cinNo,
    gstin: detail?.gstin,
    paymentTerm: detail?.paymentinDays,
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
    if (JSON.stringify(data) === JSON.stringify(defaultValues)) return showToast("No changes made", "warning");
    const payload = { ...data, vendor: id || "" };
    dispatch(updateBasicDetail(payload)).then((res: any) => {
      if (res.payload?.data?.success) {
        dispatch(getVendorBranch(id || ""));
        setUpdateBasicDetail(false);
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-4 gap-[20px] py-[20px]">
          <TextField error={!!errors.name} helperText={errors.name?.message} {...register("name", { required: "Vendor Name is required" })} fullWidth variant="filled" label="Vendor Name" />
          <Controller
            name="email"
            rules={{
              required: "Vendor Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            control={control}
            render={({ field }) => <TextField error={!!errors.email} helperText={errors.email?.message} {...field} label="Vendor Email" variant="filled" />}
          />
          <Controller
            name="mobile"
            control={control}
            rules={{
              required: "Mobile Number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Invalid mobile number",
              },
            }}
            render={({ field }) => (
              <TextField
                error={!!errors.mobile}
                helperText={errors.mobile?.message}
                value={field.value}
                onChange={(e) => {
                  if (/^-?\d*\.?\d*$/.test(e.target.value)) {
                    field.onChange(e.target.value);
                  }
                }}
                label="Mobile Number"
                variant="filled"
              />
            )}
          />
          <Controller
            name="pannumber"
            rules={{
              required: "PAN Number is required",
              pattern: {
                value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                message: "Invalid PAN Number",
              },
            }}
            control={control}
            render={({ field }) => <TextField {...field} label="PAN Number" error={!!errors.pannumber} helperText={errors.pannumber?.message} variant="filled" />}
          />
          <Controller
            control={control}
            name="cinnumber"
            rules={{
              required: false,
              pattern: {
                value: /^[UL]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
                message: "Invalid CIN Number",
              },
            }}
            render={({ field }) => <TextField {...field} label="CIN  Number" error={!!errors.cinnumber} helperText={errors.cinnumber?.message} variant="filled" />}
          />

          <TextField {...register("paymentTerm", { required: "Payment Term is required" })} error={!!errors.paymentTerm} helperText={errors.paymentTerm?.message} label="Payments Terms (in-days)" type="number" variant="filled" />
        </div>

        <div className="flex items-center gap-[10px] mt-[20px]">
          <LoadingButton
            disabled={vendorBasicDetailUpdateLoading}
            onClick={() => {
              setUpdateBasicDetail(false);
            }}
            sx={{ background: "white", color: "red" }}
            variant="contained"
            startIcon={<Icons.close />}
          >
            Cancel
          </LoadingButton>
          <LoadingButton loading={vendorBasicDetailUpdateLoading} loadingPosition="start" type="submit" variant="contained" startIcon={<Icons.save />}>
            Save
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default UpdateVendorBasicDetail;
