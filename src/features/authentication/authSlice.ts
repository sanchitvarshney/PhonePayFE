import axiosInstance from "@/api/axiosInstance";
import { getToken, setToken } from "@/utils/tokenUtills";
import { showToast } from "@/utils/toasterContext";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  AuthState,
  ForgotPasswordOtpPayload,
  LoginCredentials,
  LoginResponse,
  PasswordChangePayload,
  ResetPasswordPayload,
} from "./authType";

const initialState: AuthState = {
  user: null,
  loading: false,
  token: getToken(),
  changepasswordloading: false,
  otpLoading: false,
};

export const loginUserAsync = createAsyncThunk<
  AxiosResponse<LoginResponse>,
  LoginCredentials
>("auth/loginUser", async (loginCredential, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<LoginResponse>("/auth/signin", loginCredential);
    return response;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error);
  }
});

export const changePasswordAsync = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  PasswordChangePayload
>("auth/changePassword", async (payload) => {
  const response = await axiosInstance.put("/user/change-my-password", payload);
  return response;
});

export const verifyOtpAsync = createAsyncThunk<
  AxiosResponse<{ success: boolean; data?: unknown }>,
  { otp: string; secret: string; username: string | null }
>("auth/verifyOtp", async (payload) => {
  const response = await axiosInstance.post("/auth/verify", payload);
  return response;
});

export const getPasswordOtp = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  ForgotPasswordOtpPayload
>("auth/getPasswordOtp", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/user/get-password-otp/", {
      params: { emailId: payload.emailId },
    });
    return response;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error);
  }
});

export const updatePassword = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  ResetPasswordPayload
>("auth/updatePassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put("/user/update-password", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.clear();
      state.user = null;
      state.token = null;
      window.location.href = "/login";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        const res = action.payload as AxiosResponse<LoginResponse>;
        const body = res?.data;
        if (body?.success && body?.data) {
          setToken(body.data.token);
          localStorage.setItem("loggedinUser", btoa(JSON.stringify(body.data)));
        }
        if (body && !body.data) {
          localStorage.setItem("showOtpPage", body.isTwoStep || "");
          localStorage.setItem("username", body.username || "");
        }
        state.loading = false;
      })
      .addCase(loginUserAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(changePasswordAsync.pending, (state) => {
        state.changepasswordloading = true;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.changepasswordloading = false;
      })
      .addCase(changePasswordAsync.rejected, (state) => {
        state.changepasswordloading = false;
      })
      .addCase(verifyOtpAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOtpAsync.fulfilled, (state, action) => {
        const res = action.payload as AxiosResponse<{ success?: boolean; data?: unknown }>;
        const body = res?.data;
        if (body?.success && body?.data) {
          const data = body.data as { token?: string };
          if (data.token) setToken(data.token);
          localStorage.setItem("showOtpPage", "");
          localStorage.setItem("loggedinUser", btoa(JSON.stringify(body.data)));
        }
        state.loading = false;
      })
      .addCase(verifyOtpAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getPasswordOtp.pending, (state) => {
        state.otpLoading = true;
      })
      .addCase(getPasswordOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(getPasswordOtp.rejected, (state, action) => {
        state.otpLoading = false;
        const payload = action.payload as { message?: string } | undefined;
        showToast(payload?.message || "Failed to send verification code", "error");
      })
      .addCase(updatePassword.pending, (state) => {
        state.otpLoading = true;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.otpLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.otpLoading = false;
        const payload = action.payload as { message?: string } | undefined;
        showToast(payload?.message || "Failed to reset password", "error");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
