import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import React from "react";
import { Icons } from "@/components/icons";
import { Controller, useForm } from "react-hook-form";
import SelectState, { StateData } from "@/components/reusable/SelectState";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { UpadteVendorBranchPayload } from "@/features/master/vendor/vendorType";
import { getVendorBranch, updateVendorBranch } from "@/features/master/vendor/vendorSlice";
import { useParams } from "react-router-dom";
import { replaceBrWithNewLine } from "@/utils/replacebrtag";

type FormDataType = {
  branch: string;
  state: StateData | null;
  city: string;
  address: string;
  pincode: string;
  email: string;
  fax: string;
  gstin: string;
  mobile: string;
};
type Props = {
  branch: {
    code: string;
    branch: string;
    state: {
      state: string;
      name: string;
    };
    city: string;
    address: string;
    pincode: string;
    mobile: string;
    email: string;
    fax: string;
    gstin: string;
  };
  setEditBranchId: React.Dispatch<React.SetStateAction<string>>;
  scrollToSection: (id: string) => void;
};
const UpdateVendorBranchForm: React.FC<Props> = ({ branch, setEditBranchId, scrollToSection }) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { updateVendorBranchLoading } = useAppSelector((state) => state.vendor);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormDataType>({
    mode: "all",
    defaultValues: {
      branch: branch.branch,
      state: { Name: branch.state.name, Code: branch.state.state },
      city: branch.city,
      address: replaceBrWithNewLine(branch.address) || "",
      pincode: branch.pincode,
      email: branch.email,
      fax: branch.fax,
      gstin: branch.gstin,
      mobile: branch.mobile,
    },
  });
  const onSubmit = (data: FormDataType) => {
    const payload: UpadteVendorBranchPayload = {
      code: branch.code,
      vendor_code: id || "",
      label: data.branch,
      state: data.state?.Code || "",
      city: data.city,
      address: data.address,
      pincode: data.pincode,
      mobile: data.mobile,
      gstin: data.gstin,
      email: data.email,
    };
    dispatch(updateVendorBranch(payload)).then((res: any) => {
      if (res.payload?.data?.success) {
        setEditBranchId("");
        dispatch(getVendorBranch(id || "")).then((res: any) => {
          if (res.payload?.data?.success) {
            scrollToSection(branch.code);
          }
        });
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-4 gap-[20px] py-[20px]">
          <TextField error={!!errors.branch} helperText={errors.branch?.message} label="Branch Name" variant="filled" {...register("branch", { required: "Branch name is required" })} />
          <Controller control={control} name="state" render={({ field }) => <SelectState error={!!errors.state} value={field.value} onChange={field.onChange} helperText={errors.state?.message} label="State" varient="filled" />} />
          <TextField label="City" variant="filled" {...register("city", { required: "City is required" })} error={!!errors.city} helperText={errors.city?.message} />
          <TextField label="Pincode" variant="filled" {...register("pincode", { required: "Pincode is required" })} error={!!errors.pincode} helperText={errors.pincode?.message} />
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
          <TextField label="GST Number" variant="filled" {...register("gstin", { required: "GST Number is required" })} error={!!errors.gstin} helperText={errors.gstin?.message} />
          <div className="col-span-2">
            <TextField fullWidth label="Complete Address" multiline rows={4} sx={{ mt: "20px" }} variant="filled" {...register("address", { required: "Address is required" })} error={!!errors.address} helperText={errors.address?.message} />
          </div>
        </div>

        <div className="flex items-center gap-[10px] mt-[20px]">
          <LoadingButton
            disabled={updateVendorBranchLoading}
            onClick={() => {
              setEditBranchId("");
            }}
            sx={{ background: "white", color: "red" }}
            variant="contained"
            startIcon={<Icons.close />}
          >
            Cancel
          </LoadingButton>
          <LoadingButton loading={updateVendorBranchLoading} loadingPosition="start" type="submit" variant="contained" startIcon={<Icons.save />}>
            Save
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default UpdateVendorBranchForm;
