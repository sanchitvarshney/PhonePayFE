import { showToast } from "@/utils/toasterContext";
import { getToken } from "@/utils/tokenUtills";
import { getSocketUrl } from "@/utils/socketSettings";
import { io, Socket } from "socket.io-client";

interface ISocketService {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  on: <T>(event: string, callback: (data: T) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  emit: <T>(event: string, data: T) => void;
  isConnected: () => boolean;
}

class SocketService implements ISocketService {
  socket: Socket | null = null;
  isLoading = false;

  connect() {
    if (this.socket?.connected) return;
    this.isLoading = true;
    this.socket = io(getSocketUrl(), {
      transports: ["websocket"],
      auth: { authorization: getToken() },
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.isLoading = false;
    });
    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isLoading = false;
    });

    this.socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
      this.isLoading = false;
    });
    this.socket.on("error_msg", (error_msg: any) => {
      console.log(error_msg);
      showToast(error_msg, "error");
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on<T>(event: string, callback: (data: T) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
      return;
    }
    this.socket?.off(event);
  }

  emit<T>(event: string, data: T) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
  refreshConnection() {
    console.log("Refreshing socket connection...");
    this.disconnect();
    this.connect();
  }
}

export const socketService = new SocketService();