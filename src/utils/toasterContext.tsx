import React, { createContext, useContext, ReactNode } from "react";
import { useToaster } from "@/hooks/useToaster";
import MuiToaster from "@/components/ui/MuiToaster";

interface ToasterContextType {
  showToast: (message: string, severity: "error" | "warning" | "info" | "success") => void;
}

const ToasterContext = createContext<ToasterContextType | null>(null);

export const ToasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toastState, showToast, closeToast } = useToaster();
  return (
    <ToasterContext.Provider value={{ showToast }}>
      {children}
      <MuiToaster
        message={toastState.message}
        severity={toastState.severity}
        open={toastState.open}
        onClose={closeToast}
      />
    </ToasterContext.Provider>
  );
};

let showToastFn: ToasterContextType["showToast"];

export const ToasterConsumer: React.FC = () => {
  const context = useContext(ToasterContext);
  if (context) showToastFn = context.showToast;
  return null;
};

export const showToast = (
  message: string,
  severity: "error" | "warning" | "info" | "success" = "info"
) => {
  if (showToastFn) {
    showToastFn(message, severity);
  } else {
    console.warn("showToast not ready:", message, severity);
  }
};
