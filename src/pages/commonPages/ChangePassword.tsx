import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { useUser } from "@/hooks/useUser";
import { changePasswordAsync } from "@/features/authentication/authSlice";
import { showToast } from "@/utils/toasterContext";

const ChangePassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, saveUser } = useUser();
  const { changepasswordloading } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      showToast("All fields are required", "error");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }
    if (!user?.crn_id) {
      showToast("User not found", "error");
      return;
    }
    dispatch(
      changePasswordAsync({
        userId: user.crn_id,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
    ).then((response: unknown) => {
      const payload = response as { payload?: { data?: { success?: boolean; message?: string } } };
      if (payload?.payload?.data?.success) {
        showToast(payload.payload.data.message || "Password changed", "success");
        if (user) {
          saveUser({ ...user, other: { ...user.other, c_p: true } });
        }
      } else {
        const msg = payload?.payload?.data?.message ?? "Failed to change password";
        showToast(msg, "error");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <Typography variant="h6" className="text-center mb-4">
          Change Password
        </Typography>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormControl fullWidth variant="outlined">
            <InputLabel>Current Password</InputLabel>
            <OutlinedInput
              name="oldPassword"
              type={showPasswords.old ? "text" : "password"}
              value={formData.oldPassword}
              onChange={handleChange}
              label="Current Password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => toggleVisibility("old")} edge="end" size="small">
                    {showPasswords.old ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl fullWidth variant="outlined">
            <InputLabel>New Password</InputLabel>
            <OutlinedInput
              name="newPassword"
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              label="New Password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => toggleVisibility("new")} edge="end" size="small">
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Confirm Password</InputLabel>
            <OutlinedInput
              name="confirmPassword"
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              label="Confirm Password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => toggleVisibility("confirm")} edge="end" size="small">
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Button type="submit" disabled={changepasswordloading} className="w-full">
            {changepasswordloading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
