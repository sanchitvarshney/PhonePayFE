import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  LinearProgress,
} from "@mui/material";

interface SharedDialogProps {
  open: boolean;
  title: string;
  content: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  color?: "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  showConfirm?: boolean;
}

const ConfirmationModel: React.FC<SharedDialogProps> = ({
  open,
  title,
  content,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  startIcon,
  endIcon,
  loading = false,
  color = "error",
  showConfirm = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="dialog-title">
      <div className="absolute top-0 left-0 right-0">
        {loading && <LinearProgress />}
      </div>
      <DialogTitle id="dialog-title" fontWeight={600}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ minWidth: "600px" }}>
        <Typography variant="inherit">{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          disabled={loading}
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{ background: "white", color: "red" }}
        >
          {cancelText}
        </Button>
        {!showConfirm && (
          <Button
            autoFocus
            size="small"
            color={color}
            disabled={loading}
            onClick={onConfirm}
            variant="contained"
            startIcon={startIcon}
            endIcon={endIcon}
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModel;
