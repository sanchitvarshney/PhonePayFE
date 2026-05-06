import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";
import type { R1ApiResponse, ReportStateType, R1ReportApiResponse } from "./reportType";

const initialState: ReportStateType = {
  r1Data: null,

  getR1DataLoading: false,
  r1Report: null,
  wrongDeviceReport: null,
  r1ReportLoading: false,
  wrongDeviceReportLoading: false,
  r2Report: null,
  r2ReportLoading: false,
    r3report: null,
  r3reportLoading: false,
  r3ReportDetail: null,
  r3ReportDetailLoading: false,

};

export const getR1Data = createAsyncThunk<
  AxiosResponse<R1ApiResponse>,
  { type: string; data: string }
>("report/getR1", async (date) => {
  const response = await axiosInstance.get(`/report/r1/detail?type=${date.type}&data=${date.data}`);
  return response;
});

export const getR1Report = createAsyncThunk<
  AxiosResponse<R1ReportApiResponse>,
  {
    type: "MINNO" | "DATE";
    data: string;
    from: string;
    to: string;
    page: number;
    limit: number;
    module: string;
  }
>("report/getR1Report", async (payload) => {
  const response = await axiosInstance.get(
    payload.type === "MINNO"
      ? `/report/r1/MINNO?data=${payload.data}&module=${payload.module}&page=${payload.page}&limit=${payload.limit}`
      : `/report/r1/DATE?startDate=${payload.from}&endDate=${payload.to}&module=${payload.module}&page=${payload.page}&limit=${payload.limit}`
  );
  return response;
});



export const getr2Report = createAsyncThunk<
  AxiosResponse<any>,
  {
    from?: string;
    to?: string;
    wise: string;
    page?: number;
    limit?: number;
    data?: any;
  }
>("report/getr2Report", async (query) => {
  const response = await axiosInstance.get(
`/report/r2?from=${query.from}&to=${query.to}&page=${query.page}&limit=${query.limit}&wise=${query.wise}&data=${query.data?.sku}`
  );
  return response;
});




export const getWrongDeviceReport = createAsyncThunk<
  AxiosResponse<R1ReportApiResponse>,
  { type: string; from: string; to: string; limit: number; page: number }
>("report/getWrongDeviceReport", async (payload) => {
  const response = await axiosInstance.get(
    `/wrongDevice/fetch/?fromDate=${payload.from}&toDate=${payload.to}&deliveryPartner=${payload.type}&page=${payload.page}&limit=${payload.limit}`
  );
  return response;
});



export const getr3Report = createAsyncThunk<
  AxiosResponse<any>,
  any
>("report/getr3Report", async (query) => {
  const response = await axiosInstance.get(
  
    `/report/r4/DATE?from=${query.from}&to=${query.to}&page=${query.page}&limit=${query.limit}`
  );
  return response;
});


export const r3ReportDetail = createAsyncThunk<
  AxiosResponse<any>,
  { query: string }
>("report/r4ReportDetail", async (query) => {
  const response = await axiosInstance.get(
    `/report/r4/consumed/${query.query}`
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
    clearR1Report(state) {
      state.r1Report = null;
    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(getr2Report.pending, (state) => {
        state.r2ReportLoading = true;
        // state.r5report = null;
      })
      .addCase(getr2Report.fulfilled, (state, action) => {
        state.r2ReportLoading = false;
        if (action.payload.data.success) {
          state.r2Report = action.payload.data;
        }
      })
      .addCase(getr2Report.rejected, (state) => {
        state.r2ReportLoading = false;
        // state.r5report = null;
      })
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
      .addCase(getR1Report.pending, (state) => {
        state.r1ReportLoading = true;
      })
      .addCase(getR1Report.fulfilled, (state, action) => {
        state.r1ReportLoading = false;
        if (action.payload.data.success) {
          state.r1Report = action.payload.data;
        }
      })
      .addCase(getR1Report.rejected, (state) => {
        state.r1ReportLoading = false;
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

export const { clearR1data, clearR1Report } = reportSlice.actions;

export default reportSlice.reducer;