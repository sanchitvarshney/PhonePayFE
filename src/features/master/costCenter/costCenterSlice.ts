import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  CostCenter,
  CostCenterApiResponse,
  CostCenterCreateApiResponse,
  CostCenterState,
} from "./costCenterType";

const initialState: CostCenterState = {
  costCenter: null,
  getCostCenterLoading: false,
  createCostCenterLoading: false,
};

export const getCostCenterAsync = createAsyncThunk<
  AxiosResponse<CostCenterApiResponse>
>("master/getCostCenter", async () => {
  const response = await axiosInstance.get("/uom");
  return response;
});

export const createCostCenterAsync = createAsyncThunk<
  AxiosResponse<CostCenterCreateApiResponse>,
  CostCenter
>("master/createCostCenter", async (payload) => {
  const response = await axiosInstance.post("/uom/insert", {
    uom: payload.costCenter,
    description: payload.description,
  });
  return response;
});

const costCenterSlice = createSlice({
  name: "costCenter",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCostCenterAsync.pending, (state) => {
        state.getCostCenterLoading = true;
      })
      .addCase(getCostCenterAsync.fulfilled, (state, action) => {
        state.getCostCenterLoading = false;
        if (action.payload?.data?.success) {
          state.costCenter = action.payload.data.data;
        }
      })
      .addCase(getCostCenterAsync.rejected, (state) => {
        state.getCostCenterLoading = false;
      })
      .addCase(createCostCenterAsync.pending, (state) => {
        state.createCostCenterLoading = true;
      })
      .addCase(createCostCenterAsync.fulfilled, (state) => {
        state.createCostCenterLoading = false;
      })
      .addCase(createCostCenterAsync.rejected, (state) => {
        state.createCostCenterLoading = false;
      });
  },
});

export default costCenterSlice.reducer;
