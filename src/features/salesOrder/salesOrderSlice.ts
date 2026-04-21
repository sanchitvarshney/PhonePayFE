import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";

type SalesOrderState = {
  loading: boolean;
  cancelLoading: boolean;
  error: string | null;
  formData: unknown;
  manageSalesOrderData: any;
  dateRange: string | null;
};

const initialState: SalesOrderState = {
  loading: false,
  cancelLoading: false,
  error: null,
  formData: null,
  manageSalesOrderData: null,
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
      });
  },
});

export const {
  setSalesOrderFormData,
  resetSalesOrderFormData,
  setSalesOrderDateRange,
} = salesOrderSlice.actions;
export default salesOrderSlice.reducer;
