import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { reprintMasterCarton } from "@/features/masterCarton/masterCartonService";
import { CARTON_ID_PATTERN, REPRINT_EXPIRED_MESSAGE, getApiErrorMessage } from "@/features/masterCarton/masterCartonHelpers";
import { ReprintResult } from "@/features/masterCarton/masterCartonType";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoaded: (result: ReprintResult) => void;
};

const ReprintCartonDialog: React.FC<Props> = ({ open, onClose, onLoaded }) => {
  const [cartonId, setCartonId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    if (open) {
      setCartonId("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  const handleClose = () => {
    requestRef.current += 1;
    onClose();
  };

  const handleProcess = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const id = cartonId.trim();
    if (!id) {
      setError("Please enter a Carton ID.");
      return;
    }
    if (!CARTON_ID_PATTERN.test(id)) {
      setError("Invalid Carton ID. Use letters, numbers, '-', '_' or '/' only.");
      return;
    }

    const requestId = ++requestRef.current;
    setError("");
    setLoading(true);
    try {
      const result = await reprintMasterCarton(id);
      if (requestId !== requestRef.current) return;
      onLoaded(result);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setError(
        getApiErrorMessage(err, "Unable to fetch carton details. Please try again.", {
          404: `Carton number "${id}" not found.`,
          403: `${REPRINT_EXPIRED_MESSAGE}. A carton can only be reprinted within 5 minutes of creation.`,
        }),
      );
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" aria-labelledby="reprint-carton-title">
      {loading && (
        <div className="absolute top-0 left-0 right-0">
          <LinearProgress />
        </div>
      )}
      <form onSubmit={handleProcess} noValidate>
        <DialogTitle id="reprint-carton-title" fontWeight={600}>
          Reprint Master Carton
        </DialogTitle>
        <DialogContent className="flex flex-col gap-[16px]">
          <p className="text-sm text-slate-500">
            Enter the carton number to reprint. Reprint is allowed only within 5 minutes of creation.
          </p>
          <TextField
            label="Carton ID"
            placeholder="e.g. MSC/Surface00102"
            variant="filled"
            required
            autoFocus
            fullWidth
            value={cartonId}
            disabled={loading}
            error={!!error}
            onChange={(e) => {
              setCartonId(e.target.value);
              if (error) setError("");
            }}
            inputProps={{ maxLength: 40, autoComplete: "off" }}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loading} disabled={loading}>
            Process
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReprintCartonDialog;
