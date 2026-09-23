import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { socketService } from "@/SocketService";

type Props = { children: React.ReactNode };

export type NotificationData = {
  ID: number;
  [key: string]: unknown;
};

const noop = () => {};

// A safe fallback so consumers never crash destructuring this context - e.g. if a
// component briefly reads a stale context reference during a dev HMR update, or is
// ever rendered outside <SocketProvider> by mistake. Socket features just no-op then.
const defaultSocketContextValue = {
  isConnected: false,
  isLoading: false,
  refreshConnection: noop,
  emitGetNotification: noop,
  onnotification: noop,
  onDownloadReport: noop,
  emitDownloadReport: noop,
  off: noop,
  emitDownloadr2Report: noop,
  emitDownloadR3Report: noop,
  emitDownloadR5Report: noop,
  emitDownloadQ3Report: noop,
  emitDownloadR6Report: noop,
  emitDownloadR10Report: noop,
  emitDownloadR9Report: noop,
  emitDownloadR8Report: noop,
};

const SocketContext = createContext<any>(defaultSocketContextValue);

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bindConnectionListenersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setIsLoading(false);
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setIsLoading(false);
    };
    const onConnectError = () => {
      setIsConnected(false);
      setIsLoading(false);
    };

    const bindConnectionListeners = () => {
      socketService.off("connect", onConnect);
      socketService.off("disconnect", onDisconnect);
      socketService.off("connect_error", onConnectError);
      socketService.on("connect", onConnect);
      socketService.on("disconnect", onDisconnect);
      socketService.on("connect_error", onConnectError);
    };

    bindConnectionListenersRef.current = bindConnectionListeners;

    setIsLoading(true);
    socketService.connect();
    bindConnectionListeners();
    setIsConnected(socketService.isConnected());

    return () => {
      bindConnectionListenersRef.current = null;
      socketService.off("connect", onConnect);
      socketService.off("disconnect", onDisconnect);
      socketService.off("connect_error", onConnectError);
      socketService.disconnect();
    };
  }, []);

  const refreshConnection = useCallback(() => {
    setIsLoading(true);
    setIsConnected(false);
    socketService.refreshConnection();
    bindConnectionListenersRef.current?.();
    setIsConnected(socketService.isConnected());
  }, []);

  const emitGetNotification = () => {
    socketService.emit("getNotification", "");
  };

   const emitDownloadReport = (payload: any) => {
  
    socketService.emit("inwardReport", payload);
  };

  const onnotification = (callback: (data: NotificationData[]) => void) => {
    socketService.on("socket_receive_notification", callback);
  };


  const off = (event: string, callback?: (...args: unknown[]) => void) => {
    socketService.off(event, callback);
  };

    const onDownloadReport = (
    callback: (data: { notificationId: string; percent: string }) => void
  ) => {
    socketService.on("progress", callback);
  };



  const emitDownloadr2Report = (payload: any) => {
    console.log(payload,"data")
    socketService.emit("r2Report", payload);
  };

  const emitDownloadR3Report = (payload: any) => {
    socketService.emit("r3ConsumptionReport", payload);
  };
    const emitDownloadR5Report = (payload: any) => {
    console.log("clicked");
    socketService.emit("deviceConsReport", payload);
  };
      const emitDownloadQ3Report = (payload: any) => {
    console.log("clicked");
    socketService.emit("deviceConsReport", payload);
  };

  const emitDownloadR6Report = (payload: any) => {
    socketService.emit("rmStockReport", payload);
  };

  const emitDownloadR10Report = (payload: any) => {
    socketService.emit("deviceOnLocation", payload);
  };

  const emitDownloadR9Report = (payload: any) => {
    socketService.emit("generateDeviceStockExcel", payload);
  };

  const emitDownloadR8Report = (payload: any) => {
    socketService.emit("device_transfer_report", payload);
  };

  const value = useMemo(
    () => ({
      isConnected,
      isLoading,
      refreshConnection,
      emitGetNotification,
      onnotification,
      onDownloadReport,
      emitDownloadReport,
      off,
     emitDownloadr2Report,
      emitDownloadR3Report,
        emitDownloadR5Report,
        emitDownloadQ3Report,
        emitDownloadR6Report,
        emitDownloadR10Report,
        emitDownloadR9Report,
        emitDownloadR8Report
    }),
    [isConnected, isLoading, refreshConnection]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
