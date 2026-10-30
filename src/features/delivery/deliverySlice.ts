import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getApiMessage } from "@/utils/getApiMessage";
import { buildDeliveryFormData } from "./delivery.utils";
import { showToast } from "@/utils/toasterContext";
import {
  DeliveryState,
  DeliverySubmitResponse,
  SubmitDeliveryPayload,
  WrongDeviceReportPayload,
  WrongDeviceReportResponse,
} from "./deliveryType";

export const DELIVERY_ENDPOINTS = {
  submit: "/wrongDevice/video/create",
  videoList: "/wrongDevice/video/list",
};

const initialState: DeliveryState = {
  isSubmitting: false,
  submitError: null,
  wrongDeviceList: null,
  wrongDeviceLoading: false,
};

const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const submitDelivery = createAsyncThunk<
  DeliverySubmitResponse | undefined,
  SubmitDeliveryPayload,
  { rejectValue: string }
>(
  "delivery/submitDelivery",
  async ({ onUploadProgress, ...payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<DeliverySubmitResponse>(
        DELIVERY_ENDPOINTS.submit,
        buildDeliveryFormData(payload),
        { ...multipartConfig, onUploadProgress }
      );
      return response.data;
    } catch (err) {
      const axiosErr = err as AxiosError<DeliverySubmitResponse>;
      return rejectWithValue(
        getApiMessage(
          axiosErr.response?.data?.message,
          axiosErr.message || "Failed to submit delivery details"
        )
      );
    }
  }
);

export const getWrongDeviceVideoReport = createAsyncThunk<
  WrongDeviceReportResponse,
  WrongDeviceReportPayload,
  { rejectValue: string }
>("delivery/getWrongDeviceVideoReport", async ({ fromDate, toDate }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<WrongDeviceReportResponse>(
      DELIVERY_ENDPOINTS.videoList,
      { params: { fromDate, toDate } }
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<WrongDeviceReportResponse>;
    return rejectWithValue(
      getApiMessage(
        axiosErr.response?.data?.message,
        axiosErr.message || "Failed to fetch wrong device report"
      )
    );
  }
});

const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {
    resetDeliveryState: (state) => {
      state.isSubmitting = false;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitDelivery.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitDelivery.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(submitDelivery.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError =
          action.payload ?? action.error.message ?? "Failed to submit delivery details";
      })
      .addCase(getWrongDeviceVideoReport.pending, (state) => {
        state.wrongDeviceLoading = true;
      })
      .addCase(getWrongDeviceVideoReport.fulfilled, (state, action) => {
        state.wrongDeviceLoading = false;
        if (action.payload?.success === false) {
          showToast(getApiMessage(action.payload.message, "No data found"), "error");
        }
        state.wrongDeviceList = action.payload?.data ?? [];
      })
      .addCase(getWrongDeviceVideoReport.rejected, (state, action) => {
        state.wrongDeviceLoading = false;
        state.wrongDeviceList = [];
        showToast(action.payload ?? "Failed to fetch wrong device report", "error");
      });
  },
});

export const { resetDeliveryState } = deliverySlice.actions;
export default deliverySlice.reducer;
