export const getApiMessage = (message: unknown, fallback = ""): string => {
  if (typeof message === "string") return message || fallback;
  if (message && typeof message === "object") {
    const msg = (message as { msg?: unknown }).msg;
    if (typeof msg === "string" && msg) return msg;
  }
  return fallback;
};
