import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { PartCodeDataresponse } from "./MRRequestWithoutBomType";

const initialState = {
  getPartCodeLoading: false,
  partCodeData: null as PartCodeDataresponse["data"] | null,
};

export const getPertCodesync = createAsyncThunk<
  AxiosResponse<PartCodeDataresponse>,
  string | null
>("master/getPertCode", async (value) => {
  const response = await axiosInstance.get(`/backend/search/item/${value}`);
  return response;
});

const mrRequestWithoutBomSlice = createSlice({
  name: "materialRequestWithoutBom",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPertCodesync.pending, (state) => {
        state.getPartCodeLoading = true;
      })
      .addCase(getPertCodesync.fulfilled, (state, action) => {
        state.getPartCodeLoading = false;
        if (action.payload?.data?.success) {
          state.partCodeData = action.payload.data.data;
        }
      })
      .addCase(getPertCodesync.rejected, (state) => {
        state.getPartCodeLoading = false;
      });
  },
});

export default mrRequestWithoutBomSlice.reducer;
