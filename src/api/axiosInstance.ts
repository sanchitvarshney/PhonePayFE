import axios from "axios";
import { getToken } from "@/utils/tokenUtills";
import { getApiBaseUrl } from "@/utils/apiSettings";
import { showToast } from "@/utils/toasterContext";

/** India FY is Apr 1 – Mar 31. Short label matches backend, e.g. "25-26" for FY 2025–26. */
function getIndianFinancialYearSession(now = new Date()): string {
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1–12
  const startYear = m >= 4 ? y : y - 1;
  const endYear = startYear + 1;
  const two = (n: number) => String(n).slice(-2);
  return `${two(startYear)}-${two(endYear)}`;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  // Use user-configured API base URL from Settings when set
  config.baseURL = getApiBaseUrl();
  const token = getToken();
  const savedSession =
    localStorage.getItem("session")?.trim() ||
    getIndianFinancialYearSession();
  const savedCompanyBranch = localStorage.getItem("companyBranch") || "BRMSC031";

  if (token) {
    config.headers.Authorization = `${token}`;
    config.headers["session"] = savedSession;
    config.headers["companyBranch"] = savedCompanyBranch;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    const message =
      error.response?.data?.message?.msg ??
      error.response?.data?.message ??
      "An unexpected error occurred";
    if (typeof window !== "undefined" && message) {
      showToast(message, "error");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
