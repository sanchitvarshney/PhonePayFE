import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";
import type { Q1ApiResponse, Q3ApiResponse, QueryStateType, R2ApiResponse, componentApiResponse } from "./queryType";

const initialState: QueryStateType = {
  getQ1DataLoading: false,
  q1Data: null,
  getComponentDataLoading: false,
  componentData: null,
  getQ2DataLading: false,
  q2Data: null,
  q2Pagination: null,
  q3data: null,
  q3DataLoading: false,
  q2StatementLoading: false,
  q2Statement: null,

};

export const getQ1Data = createAsyncThunk<
  AxiosResponse<Q1ApiResponse>,
  { date: string | null; value: string; location: string | null }
>("query/getQ1", async (params) => {
  const response = await axiosInstance.get(
    params.location
      ? `/query/log/DV?data=${params.value}&location=${params.location}`
      : `/query/log/DV?date=${params.date}&data=${params.value}`
  );
  return response;
});

export const getBothComponentData = createAsyncThunk<AxiosResponse<componentApiResponse>, string | null>(
  "query/getComponentData",
  async (inputs) => {
    const response = await axiosInstance.get(`/backend/search/sku/${inputs}`);
    return response;
  }
);

export const getQ3DatA = createAsyncThunk<
  AxiosResponse<Q3ApiResponse>,
  { date: string; comp: string;  }
>(
  "query/getQ3DatA",
  async (payload) => {
    const response = await axiosInstance.get(
      `/query/q1/${payload.comp}/${payload.date}`,
    );
    return response;
  }
);
export const getQ2Data = createAsyncThunk<AxiosResponse<R2ApiResponse>, { id: string; type: string }>("query/getQ2Data", async (payload) => {
  const response = await axiosInstance.get(`/query/${payload.type === "swipe" ? `swipeMachineDetail?srlOrImei=${payload.id}` : `devicetimeline?srl=${payload.id}`}`);
  return response;
});

const querySlice = createSlice({
  name: "query",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getQ1Data.pending, (state) => {
        state.getQ1DataLoading = true;
      })
      .addCase(getQ1Data.fulfilled, (state, action) => {
        state.getQ1DataLoading = false;
        if (action.payload.data.success) {
          state.q1Data = action.payload.data.response;
        }
      })
      .addCase(getQ1Data.rejected, (state) => {
        state.getQ1DataLoading = false;
        state.q1Data = null;
      })
      .addCase(getBothComponentData.pending, (state) => {
        state.getComponentDataLoading = true;
      })
      .addCase(getBothComponentData.fulfilled, (state, action) => {
        state.getComponentDataLoading = false;
        if (action.payload.data.success) {
          state.componentData = action.payload.data.data;
        }
      })
      .addCase(getBothComponentData.rejected, (state) => {
        state.getComponentDataLoading = false;
      })
      .addCase(getQ3DatA.pending, (state) => {
        state.q3DataLoading = true;
      })
      .addCase(getQ3DatA.fulfilled, (state, action) => {
        state.q3DataLoading = false;
        if (action.payload.data.success) {
          state.q3data = action.payload.data.data;
        }
      })
      .addCase(getQ3DatA.rejected, (state) => {
        state.q3DataLoading = false;
        state.q3data = null;
      })
         .addCase(getQ2Data.pending, (state) => {
        state.q2StatementLoading = true;
        state.q2Statement = null;
      })
      .addCase(getQ2Data.fulfilled, (state, action) => {
        state.q2StatementLoading = false;
        if (action.payload.data.success) {
          state.q2Statement = action.payload.data.data;
        }
      })
      .addCase(getQ2Data.rejected, (state) => {
        state.q2StatementLoading = false;
        state.q2Statement = null;
      });
  },
});

export default querySlice.reducer;

