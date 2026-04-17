import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";

type SalesOrderState = {
  loading: boolean;
  error: string | null;
  formData: unknown;
  manageSalesOrderData: any;
  dateRange: string | null;
};

const initialState: SalesOrderState = {
  loading: false,
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
      });
  },
});

export const {
  setSalesOrderFormData,
  resetSalesOrderFormData,
  setSalesOrderDateRange,
} = salesOrderSlice.actions;
export default salesOrderSlice.reducer;
