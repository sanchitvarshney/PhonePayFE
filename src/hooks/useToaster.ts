import { useState } from "react";

export const useToaster = () => {
  const [toastState, setToastState] = useState({
    open: false,
    message: "",
    severity: "info" as "error" | "warning" | "info" | "success",
  });

  const showToast = (message: string, severity: "error" | "warning" | "info" | "success" = "info") => {
    setToastState({ open: true, message, severity });
  };

  const closeToast = () => {
    setToastState((prev) => ({ ...prev, open: false }));
  };

  return { toastState, showToast, closeToast };
};
