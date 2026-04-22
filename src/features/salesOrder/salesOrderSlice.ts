import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";

type SalesOrderState = {
  loading: boolean;
  cancelLoading: boolean;
  challanLoading: boolean;
  dispatchLoading: boolean;
  error: string | null;
  formData: unknown;
  manageSalesOrderData: any;
  manageChallanData: any;
  dateRange: string | null;
};

const initialState: SalesOrderState = {
  loading: false,
  cancelLoading: false,
  challanLoading: false,
  dispatchLoading: false,
  error: null,
  formData: null,
  manageSalesOrderData: null,
  manageChallanData: null,
  dateRange: null,
};

export const createSalesOrder = createAsyncThunk<AxiosResponse<unknown>, unknown>(
  "salesOrder/createSalesOrder",
  async (payload) => {
    const response = await axiosInstance.post(
      "/salesorder/createSalesOrder",
      payload,
    );
    return response;
  },
);

export const updateSalesOrder = createAsyncThunk<AxiosResponse<unknown>, unknown>(
  "salesOrder/updateSalesOrder",
  async (payload) => {
    const response = await axiosInstance.post(
      "/salesorder/updateSalesOrder",
      payload,
    );
    return response;
  },
);

export const fetchSalesOrder = createAsyncThunk<
  AxiosResponse<unknown>,
  { wise: string; data: string }
>("salesOrder/fetchSalesOrder", async (payload) => {
  const response = await axiosInstance.get(
    `/salesorder/fetchSalesOrder?wise=${encodeURIComponent(
      payload.wise,
    )}&data=${encodeURIComponent(payload.data)}`,
  );
  return response;
});

export const fetchSalesOrderDetails = createAsyncThunk<
  AxiosResponse<unknown>,
  { salesOrder: string }
>("salesOrder/fetchSalesOrderDetails", async (payload) => {
  const response = await axiosInstance.get(
    `/salesorder/fetch-salesOrder-details?salesOrder=${encodeURIComponent(
      payload.salesOrder,
    )}`,
  );
  return response;
});

export const cancelSalesOrder = createAsyncThunk<AxiosResponse<unknown>, unknown>(
  "salesOrder/cancelSalesOrder",
  async (payload) => {
    const response = await axiosInstance.post(
      "/salesorder/cancel-salesOrder",
      payload,
    );
    return response;
  },
);

export type CreateChallanPayload = {
  salesOrder: string;
  placeOfSupply: string;
  stateCode: string;
  qty: string | number;
  challan_date: string;
  boxId: string;
};

export const createChallan = createAsyncThunk<
  AxiosResponse<unknown>,
  CreateChallanPayload,
  { rejectValue: { success: false; message: string } }
>("salesOrder/createChallan", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/salesorder/create-challan", payload);
    return response;
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error as Error)?.message ||
      "Failed to create challan";
    return rejectWithValue({ success: false, message: String(message) });
  }
});

export const fetchChallan = createAsyncThunk<
  AxiosResponse<unknown>,
  { wise: string; data: string }
>("salesOrder/fetchChallan", async (payload) => {
  const response = await axiosInstance.get(
    `/salesorder/fetch-challan?wise=${encodeURIComponent(payload.wise)}&data=${encodeURIComponent(
      payload.data,
    )}`,
  );
  return response;
});

export const challanPrint = createAsyncThunk<
  { success: boolean; message: string },
  { challanNo: string },
  { rejectValue: { success: false; message: string } }
>("salesOrder/challanPrint", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      "/challan-print/challanPrint",
      { challanNo: payload.challanNo },
      { responseType: "blob" },
    );
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.URL.revokeObjectURL(url);
      return rejectWithValue({
        success: false,
        message: "Unable to open PDF — allow pop-ups for this site, or try again.",
      });
    }
    // Revoke after the new tab has time to read the blob URL (immediate revoke can blank the tab).
    window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    return { success: true, message: "Challan PDF opened in a new tab" };
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error as Error)?.message ||
      "Failed to print challan";
    return rejectWithValue({ success: false, message: String(message) });
  }
});

export type CreateDispatchPayload = {
  challanNo: string;
  qty: number;
  serialNo: string[];
  salesOrder?: string;
  boxId?: string;
};

export const createDispatch = createAsyncThunk<
  AxiosResponse<unknown>,
  CreateDispatchPayload,
  { rejectValue: { success: false; message: string } }
>("salesOrder/createDispatch", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/salesorder/create-dispatch", payload);
    return response;
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error as Error)?.message ||
      "Failed to create dispatch";
    return rejectWithValue({ success: false, message: String(message) });
  }
});

const salesOrderSlice = createSlice({
  name: "salesOrder",
  initialState,
  reducers: {
    setSalesOrderFormData(state, action: { payload: unknown }) {
      state.formData = action.payload;
    },
    resetSalesOrderFormData(state) {
      state.formData = null;
    },
    setSalesOrderDateRange(state, action: { payload: string | null }) {
      state.dateRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSalesOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSalesOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createSalesOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create sales order";
      })
      .addCase(updateSalesOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSalesOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateSalesOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update sales order";
      })
      .addCase(fetchSalesOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.manageSalesOrderData =
          (action.payload as AxiosResponse<{ data?: unknown }>).data ??
          action.payload;
      })
      .addCase(fetchSalesOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch sales order";
      })
      .addCase(cancelSalesOrder.pending, (state) => {
        state.cancelLoading = true;
        state.error = null;
      })
      .addCase(cancelSalesOrder.fulfilled, (state) => {
        state.cancelLoading = false;
      })
      .addCase(cancelSalesOrder.rejected, (state, action) => {
        state.cancelLoading = false;
        state.error = action.error.message || "Failed to cancel sales order";
      })
      .addCase(createChallan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChallan.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createChallan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create challan";
      })
      .addCase(fetchChallan.pending, (state) => {
        state.challanLoading = true;
        state.error = null;
      })
      .addCase(fetchChallan.fulfilled, (state, action) => {
        state.challanLoading = false;
        state.manageChallanData =
          (action.payload as AxiosResponse<{ data?: unknown }>).data ??
          action.payload;
      })
      .addCase(fetchChallan.rejected, (state, action) => {
        state.challanLoading = false;
        state.error = action.error.message || "Failed to fetch challan";
      })
      .addCase(createDispatch.pending, (state) => {
        state.dispatchLoading = true;
        state.error = null;
      })
      .addCase(createDispatch.fulfilled, (state) => {
        state.dispatchLoading = false;
      })
      .addCase(createDispatch.rejected, (state, action) => {
        state.dispatchLoading = false;
        state.error = action.error.message || "Failed to create dispatch";
      });
  },
});

export const {
  setSalesOrderFormData,
  resetSalesOrderFormData,
  setSalesOrderDateRange,
} = salesOrderSlice.actions;
export default salesOrderSlice.reducer;
