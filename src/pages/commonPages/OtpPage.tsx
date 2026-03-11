import React, { useState } from "react";
import { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import { FormControl, OutlinedInput, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { showToast } from "@/utils/toasterContext";
import { verifyOtpAsync } from "@/features/authentication/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";

const OtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { saveUser } = useUser();
  const dispatch = useAppDispatch();
  const username = localStorage.getItem("username") || "";
  const { loading } = useAppSelector((state) => state.auth);

  const handleVerify = () => {
    if (!otp.trim()) {
      showToast("Please enter OTP", "error");
      return;
    }
    dispatch(verifyOtpAsync({ otp, secret: "", username: username || null })).then(
      (action: unknown) => {
        const a = action as { payload?: AxiosResponse<{ success?: boolean; data?: unknown }> };
        const body = a?.payload?.data;
        if (body?.success && body?.data) {
          saveUser(body.data as Parameters<typeof saveUser>[0]);
          localStorage.setItem("showOtpPage", "");
          localStorage.removeItem("username");
          showToast("Verified successfully", "success");
          navigate("/");
        } else {
          showToast("Invalid OTP", "error");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <Typography variant="h6" className="text-center mb-4">
          Two-step verification
        </Typography>
        <Typography variant="body2" className="text-center text-muted-foreground mb-4">
          Enter the OTP from your authenticator app.
        </Typography>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <OutlinedInput
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
        </FormControl>
        <Button onClick={handleVerify} disabled={loading} className="w-full">
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </div>
    </div>
  );
};

export default OtpPage;
