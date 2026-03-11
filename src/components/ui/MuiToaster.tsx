import React from "react";
import { Snackbar, Alert, AlertProps } from "@mui/material";

interface ToasterProps {
  message: string;
  severity?: AlertProps["severity"];
  open: boolean;
  duration?: number;
  onClose?: () => void;
}

const MuiToaster: React.FC<ToasterProps> = ({
  message,
  severity = "info",
  open,
  duration = 3000,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert variant="filled" onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default MuiToaster;
