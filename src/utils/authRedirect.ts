const RETURN_TO_KEY = "returnTo";

const INVALID_RETURN_TO_PATTERN = /:\/\/|\/\//;

export const getCurrentRelativeUrl = (): string => {
  if (globalThis.window === undefined) return "/";
  return `${globalThis.window.location.pathname}${globalThis.window.location.search}${globalThis.window.location.hash}`;
};

export const isSafeReturnToPath = (value: string | null | undefined): boolean => {
  if (!value) return false;

  const normalized = value.trim();
  if (!normalized.startsWith("/")) return false;
  if (INVALID_RETURN_TO_PATTERN.test(normalized)) return false;

  try {
    const url = new URL(normalized, globalThis.window.location.origin);
    return url.origin === globalThis.window.location.origin;
  } catch {
    return false;
  }
};

export const storeReturnTo = (value: string): void => {
  if (globalThis.window === undefined) return;
  if (!isSafeReturnToPath(value)) return;
  sessionStorage.setItem(RETURN_TO_KEY, value);
};

export const storeCurrentPathAsReturnTo = (): void => {
  const currentPath = getCurrentRelativeUrl();
  if (currentPath === "/login") return;
  storeReturnTo(currentPath);
};

export const consumeReturnTo = (): string | null => {
  if (globalThis.window === undefined) return null;
  const value = sessionStorage.getItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
  if (!isSafeReturnToPath(value)) return null;
  return value;
};

export const getPostLoginRedirectPath = (fallback = "/"): string => {
  return consumeReturnTo() ?? fallback;
};
