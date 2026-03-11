import axios from "axios";
import { getToken } from "@/utils/tokenUtills";
import { showToast } from "@/utils/toasterContext";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  const savedSession = localStorage.getItem("session") || "25-26";
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
