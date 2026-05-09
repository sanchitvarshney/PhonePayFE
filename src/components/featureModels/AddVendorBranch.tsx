import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Divider, LinearProgress, TextField, Typography } from "@mui/material";
import { Icons } from "@/components/icons";
import SelectState, { StateData } from "@/components/reusable/SelectState";
import { Controller, useForm } from "react-hook-form";
import { AddVendorBranchPayload } from "@/features/master/vendor/vendorType";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { addVendorBranch, getVendorBranch } from "@/features/master/vendor/vendorSlice";
import { useParams } from "react-router-dom";
type Props = {
  open: boolean;
  handleClose: () => void;
};
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
const AddVendorBranch: React.FC<Props> = ({ open, handleClose }) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { addvendorbranchLoading } = useAppSelector((state) => state.vendor);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormDataType>({
    mode: "all",
    defaultValues: {
      branch: "",
      state: null,
      city: "",
      address: "",
      pincode: "",
      email: "",
      fax: "",
      gstin: "",
      mobile: "",
    },
  });

  const onSubmit = (data: FormDataType) => {
    const payload: AddVendorBranchPayload = {
      vendor: id || "",
      branch: data.branch,
      state: data.state?.code || "",
      city: data.city,
      address: data.address,
      pincode: data.pincode,
      mobile: data.mobile,
      gstin: data.gstin,
      email: data.email,
      fax: data.fax,
    };
    dispatch(addVendorBranch(payload)).then((res: any) => {
      if (res.payload?.data?.success) {
        reset();
        handleClose();
        dispatch(getVendorBranch(id || ""));
      }
    });
  };
  return (
    <Dialog maxWidth="md" open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <div className="absolute top-0 left-0 right-0">{addvendorbranchLoading && <LinearProgress />}</div>
      <DialogTitle id="alert-dialog-title">
        <Typography fontWeight={600} fontSize={20}>
          Add Vendor Branch
        </Typography>
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-[700px] ">
        <DialogContent className="max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-[20px] py-[20px] ">
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
            <TextField label="FAX Number" variant="filled" {...register("fax")} />
            <div className="col-span-2">
              <TextField fullWidth label="Complete Address" multiline rows={4} sx={{ mt: "20px" }} variant="filled" {...register("address", { required: "Address is required" })} error={!!errors.address} helperText={errors.address?.message} />
            </div>
          </div>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button disabled={addvendorbranchLoading} onClick={handleClose} startIcon={<Icons.close fontSize="small" />} sx={{ color: "red", background: "white" }} variant="contained">
            Cancel
          </Button>
          <Button type="submit" disabled={addvendorbranchLoading} startIcon={<Icons.add fontSize="small" />} autoFocus variant="contained">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddVendorBranch;
