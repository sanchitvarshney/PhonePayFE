import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";
import type { R1ApiResponse, ReportStateType, r6reportApiResponse } from "./reportType";

const initialState: ReportStateType = {
  r1Data: null,
  getR1DataLoading: false,
  r6Report: null,
  wrongDeviceReport: null,
  r6ReportLoading: false,
  wrongDeviceReportLoading: false,
};

export const getR1Data = createAsyncThunk<
  AxiosResponse<R1ApiResponse>,
  { type: string; data: string }
>("report/getR1", async (date) => {
  const response = await axiosInstance.get(`/report/r1/detail?type=${date.type}&data=${date.data}`);
  return response;
});

export const getr6Report = createAsyncThunk<
  AxiosResponse<r6reportApiResponse>,
  {
    type: "MINNO" | "DATE";
    data: string;
    from: string;
    to: string;
    page: number;
    limit: number;
    module: string;
  }
>("report/getr6Report", async (payload) => {
  const response = await axiosInstance.get(
    payload.type === "MINNO"
      ? `/report/r6/MINNO?data=${payload.data}&module=${payload.module}&page=${payload.page}&limit=${payload.limit}`
      : `/report/r6/DATE?startDate=${payload.from}&endDate=${payload.to}&module=${payload.module}&page=${payload.page}&limit=${payload.limit}`
  );
  return response;
});

export const getWrongDeviceReport = createAsyncThunk<
  AxiosResponse<r6reportApiResponse>,
  { type: string; from: string; to: string; limit: number; page: number }
>("report/getWrongDeviceReport", async (payload) => {
  const response = await axiosInstance.get(
    `/wrongDevice/fetch/?fromDate=${payload.from}&toDate=${payload.to}&deliveryPartner=${payload.type}&page=${payload.page}&limit=${payload.limit}`
  );
  return response;
});

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    clearR1data(state) {
      state.r1Data = null;
    },
    clearR6data(state) {
      state.r6Report = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getR1Data.pending, (state) => {
        state.getR1DataLoading = true;
      })
      .addCase(getR1Data.fulfilled, (state, action) => {
        state.getR1DataLoading = false;
        if (action.payload.data.success) {
          state.r1Data = action.payload.data.data;
        }
      })
      .addCase(getR1Data.rejected, (state) => {
        state.getR1DataLoading = false;
      })
      .addCase(getr6Report.pending, (state) => {
        state.r6ReportLoading = true;
      })
      .addCase(getr6Report.fulfilled, (state, action) => {
        state.r6ReportLoading = false;
        if (action.payload.data.success) {
          state.r6Report = action.payload.data;
        }
      })
      .addCase(getr6Report.rejected, (state) => {
        state.r6ReportLoading = false;
      })
      .addCase(getWrongDeviceReport.pending, (state) => {
        state.wrongDeviceReportLoading = true;
      })
      .addCase(getWrongDeviceReport.fulfilled, (state, action) => {
        state.wrongDeviceReportLoading = false;
        if (action.payload.data.success) {
          state.wrongDeviceReport = action.payload.data.data;
        }
      })
      .addCase(getWrongDeviceReport.rejected, (state) => {
        state.wrongDeviceReportLoading = false;
      });
  },
});

export const { clearR1data, clearR6data } = reportSlice.actions;

export default reportSlice.reducer;

