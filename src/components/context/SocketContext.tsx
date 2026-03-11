import React, { createContext, useContext, useState } from "react";

type Props = { children: React.ReactNode };

export type NotificationData = {
  ID: number;
  [key: string]: unknown;
};

const SocketContext = createContext<any>(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const [isConnected] = useState(false);
  const [isLoading] = useState(false);

  const refreshConnection = () => {};
  const emitGetNotification = () => {};
  const onnotification = (_cb: (data: unknown) => void) => {};
  const off = () => {};
  const onDownloadReport = (_cb: (data: unknown) => void) => {};

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        isLoading,
        refreshConnection,
        emitGetNotification,
        onnotification,
        off,
        onDownloadReport,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
