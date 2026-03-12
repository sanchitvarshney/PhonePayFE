const API_BASE_URL_KEY = "phonepe_custom_api_base_url";

/**
 * Get the API base URL for requests.
 * Returns user-configured URL from settings if set, otherwise the env default.
 */
export const getApiBaseUrl = (): string => {
  const custom = localStorage.getItem(API_BASE_URL_KEY);
  if (custom && custom.trim() !== "") {
    return custom.trim().replace(/\/$/, ""); // trim trailing slash
  }
  return import.meta.env.VITE_REACT_APP_API_BASE_URL || "";
};

/**
 * Save user's custom API base URL (e.g. local/dev route).
 * Pass empty string to clear and use default from env.
 */
export const setApiBaseUrl = (url: string): void => {
  const value = url.trim();
  if (value === "") {
    localStorage.removeItem(API_BASE_URL_KEY);
  } else {
    localStorage.setItem(API_BASE_URL_KEY, value.replace(/\/$/, ""));
  }
};

/**
 * Get the raw stored value (for display in settings). May be empty.
 */
export const getStoredApiBaseUrl = (): string => {
  return localStorage.getItem(API_BASE_URL_KEY) || "";
};
