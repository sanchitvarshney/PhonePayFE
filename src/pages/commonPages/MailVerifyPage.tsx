import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormControl, OutlinedInput, Typography } from "@mui/material";
import { useUser } from "@/hooks/useUser";
import { showToast } from "@/utils/toasterContext";

const MailVerifyPage: React.FC = () => {
  const { user, saveUser } = useUser();
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (!otp.trim()) {
      showToast("Please enter OTP", "error");
      return;
    }
    if (user) {
      const updated = {
        ...user,
        other: { ...user.other, e_v: true, c_p: user.other?.c_p, m_v: user.other?.m_v },
      };
      saveUser(updated);
      showToast("Email verified successfully", "success");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <Typography variant="h6" className="text-center mb-4">
          Verify your email
        </Typography>
        <Typography variant="body2" className="text-center text-muted-foreground mb-4">
          Enter the OTP sent to your email.
        </Typography>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <OutlinedInput
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
        </FormControl>
        <Button onClick={handleVerify} className="w-full" variant="default">
          Verify
        </Button>
      </div>
    </div>
  );
};

export default MailVerifyPage;
