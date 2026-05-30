const SOCKET_URL_KEY = "phonepe_custom_socket_url";

/**
 * Get the socket URL for connections.
 * Returns user-configured URL from settings if set, otherwise the env default.
 */
export const getSocketUrl = (): string => {
  const custom = localStorage.getItem(SOCKET_URL_KEY);
  if (custom && custom.trim() !== "") {
    return custom.trim().replace(/\/$/, "");
  }
  return import.meta.env.VITE_SOCKET_URL || "";
};


export const setSocketUrl = (url: string): void => {
  const value = url.trim();
  if (value === "") {
    localStorage.removeItem(SOCKET_URL_KEY);
  } else {
    localStorage.setItem(SOCKET_URL_KEY, value.replace(/\/$/, ""));
  }
};


export const getStoredSocketUrl = (): string => {
  return localStorage.getItem(SOCKET_URL_KEY) || "";
};

/** Resolve a socket file path/URL and drop the port (e.g. :3025) for browser downloads. */
export const resolveDownloadUrl = (fileUrl: string): string => {
  const baseUrl = getSocketUrl().replace(/:\d+$/, "");
  try {
    const resolved = new URL(fileUrl, baseUrl);
    if (resolved.port) {
      resolved.port = "";
    }
    return resolved.href;
  } catch {
    return fileUrl;
  }
};
