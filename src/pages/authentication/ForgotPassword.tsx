import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import { Button } from "@/components/ui/button";

const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow text-center">
        <Typography variant="h6" className="mb-4">
          Forgot Password
        </Typography>
        <Typography variant="body2" className="text-muted-foreground mb-4">
          Contact your administrator to reset your password.
        </Typography>
        <Button asChild variant="outline">
          <Link to="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
