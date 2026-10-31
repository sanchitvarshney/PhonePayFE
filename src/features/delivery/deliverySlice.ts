import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import dayjs from "dayjs";
import { getApiMessage } from "@/utils/getApiMessage";
import { buildDeliveryFormData, normalizeAwb } from "./delivery.utils";
import {
  ApiResponse,
  AwbCheckResult,
  DeliveryState,
  DeliverySubmitResponse,
  SubmitDeliveryPayload,
  WrongDeviceLocation,
  WrongDeviceReportPayload,
  WrongDeviceReportResponse,
  WrongDeviceRow,
} from "./deliveryType";

export const DELIVERY_ENDPOINTS = {
  checkAwb: "/store/awb-serial/wrong-device/awb",
  locations: "/store/awb-serial/wrong-device/locations",
  submit: "/store/awb-serial/wrong-device",
  list: "/store/awb-serial/wrong-device/list",
};

const WRONG_DEVICE_PAGE_ID = "";
const pageHeaders = WRONG_DEVICE_PAGE_ID ? { page_id: WRONG_DEVICE_PAGE_ID } : {};

const toErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiResponse<unknown>>;
  return getApiMessage(axiosErr.response?.data?.message, axiosErr.message || fallback);
};

const initialState: DeliveryState = {
  isSubmitting: false,
  submitError: null,
  awbInfo: null,
  awbChecking: false,
  awbError: null,
  locations: [],
  locationsLoading: false,
  wrongDeviceList: null,
  wrongDeviceLoading: false,
};

export const checkWrongDeviceAwb = createAsyncThunk<
  AwbCheckResult,
  string,
  { rejectValue: string }
>("delivery/checkWrongDeviceAwb", async (awb, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ApiResponse<AwbCheckResult>>(
      DELIVERY_ENDPOINTS.checkAwb,
      { params: { awb: normalizeAwb(awb) }, headers: pageHeaders }
    );
    if (response.data?.success === false || !response.data?.data) {
      return rejectWithValue(getApiMessage(response.data?.message, "Invalid AWB number"));
    }
    return response.data.data;
  } catch (err) {
    return rejectWithValue(toErrorMessage(err, "Invalid AWB number"));
  }
});

export const getWrongDeviceLocations = createAsyncThunk<
  WrongDeviceLocation[],
  void,
  { rejectValue: string }
>("delivery/getWrongDeviceLocations", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ApiResponse<WrongDeviceLocation[]>>(
      DELIVERY_ENDPOINTS.locations,
      { headers: pageHeaders }
    );
    return response.data?.data ?? [];
  } catch (err) {
    return rejectWithValue(toErrorMessage(err, "Failed to load locations"));
  }
});

export const submitDelivery = createAsyncThunk<
  DeliverySubmitResponse | undefined,
  SubmitDeliveryPayload,
  { rejectValue: string }
>(
  "delivery/submitDelivery",
  async ({ onUploadProgress, ...payload }, { rejectWithValue }) => {
    try {
      // AWB also goes in the query so the server can reject it before the upload starts.
      const response = await axiosInstance.post<DeliverySubmitResponse>(
        DELIVERY_ENDPOINTS.submit,
        buildDeliveryFormData(payload),
        {
          params: { awb: payload.awb },
          headers: { "Content-Type": "multipart/form-data", ...pageHeaders },
          timeout: 0,
          onUploadProgress,
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(toErrorMessage(err, "Failed to save wrong device"));
    }
  }
);

const fetchList = (params: WrongDeviceReportPayload) =>
  axiosInstance.get<WrongDeviceReportResponse>(DELIVERY_ENDPOINTS.list, {
    params,
    headers: pageHeaders,
  });

export const getWrongDeviceVideoReport = createAsyncThunk<
  WrongDeviceReportResponse,
  WrongDeviceReportPayload,
  { rejectValue: string }
>("delivery/getWrongDeviceVideoReport", async (payload, { rejectWithValue }) => {
  try {
    const response = await fetchList(payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(toErrorMessage(err, "Failed to fetch wrong device report"));
  }
});

// Video links expire after 5 minutes, so fetch a fresh one for the row when it's opened.
export const fetchFreshVideoUrl = async (row: WrongDeviceRow): Promise<string | null> => {
  const insertDate = dayjs(row.insert_dt);
  const day = insertDate.isValid() ? insertDate.format("YYYY-MM-DD") : null;
  const response = await fetchList({
    awb: row.awb_no,
    ...(day ? { from: day, to: day } : {}),
  });
  return response.data?.data?.find((r) => r.id === row.id)?.videoUrl ?? null;
};

const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {
    resetDeliveryState: (state) => {
      state.isSubmitting = false;
      state.submitError = null;
    },
    clearAwbCheck: (state) => {
      state.awbInfo = null;
      state.awbError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkWrongDeviceAwb.pending, (state) => {
        state.awbChecking = true;
        state.awbInfo = null;
        state.awbError = null;
      })
      .addCase(checkWrongDeviceAwb.fulfilled, (state, action) => {
        state.awbChecking = false;
        state.awbInfo = action.payload;
      })
      .addCase(checkWrongDeviceAwb.rejected, (state, action) => {
        state.awbChecking = false;
        state.awbError = action.payload ?? "Invalid AWB number";
      })
      .addCase(getWrongDeviceLocations.pending, (state) => {
        state.locationsLoading = true;
      })
      .addCase(getWrongDeviceLocations.fulfilled, (state, action) => {
        state.locationsLoading = false;
        state.locations = action.payload;
      })
      .addCase(getWrongDeviceLocations.rejected, (state) => {
        state.locationsLoading = false;
        state.locations = [];
      })
      .addCase(submitDelivery.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitDelivery.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const data = action.payload?.data;
        if (action.payload?.success !== false && data && state.awbInfo?.awb === data.awb) {
          state.awbInfo = { ...state.awbInfo, entered: data.entered, limit: data.limit };
        }
      })
      .addCase(submitDelivery.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError =
          action.payload ?? action.error.message ?? "Failed to save wrong device";
      })
      .addCase(getWrongDeviceVideoReport.pending, (state) => {
        state.wrongDeviceLoading = true;
      })
      .addCase(getWrongDeviceVideoReport.fulfilled, (state, action) => {
        state.wrongDeviceLoading = false;
        state.wrongDeviceList = action.payload?.data ?? [];
      })
      // axiosInstance already shows a toast for failed requests.
      .addCase(getWrongDeviceVideoReport.rejected, (state) => {
        state.wrongDeviceLoading = false;
        state.wrongDeviceList = [];
      });
  },
});

export const { resetDeliveryState, clearAwbCheck } = deliverySlice.actions;
export default deliverySlice.reducer;
