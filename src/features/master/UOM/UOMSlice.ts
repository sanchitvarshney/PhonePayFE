import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { UOM, UomApiResponse, UomCreateApiresponse, UOMState } from "./UOMType";

const initialState: UOMState = {
  UOM: null,
  getUOMloading: false,
  createUOMloading: false,
};

export const getUOMAsync = createAsyncThunk<AxiosResponse<UomApiResponse>>(
  "master/getUOM",
  async () => {
    const response = await axiosInstance.get("/uom");
    return response;
  }
);
export const createUomAsync = createAsyncThunk<
  AxiosResponse<UomCreateApiresponse>,
  UOM
>("master/createuom", async (uom) => {
  const response = await axiosInstance.post("/uom/insert", uom);
  return response;
});

const uomSlice = createSlice({
  name: "uom",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUOMAsync.pending, (state) => {
        state.getUOMloading = true;
      })
      .addCase(getUOMAsync.fulfilled, (state, action) => {
        state.getUOMloading = false;
        if (action.payload?.data?.success) {
          state.UOM = action.payload.data.data;
        }
      })
      .addCase(getUOMAsync.rejected, (state) => {
        state.getUOMloading = false;
      })
      .addCase(createUomAsync.pending, (state) => {
        state.createUOMloading = true;
      })
      .addCase(createUomAsync.fulfilled, (state) => {
        state.createUOMloading = false;
      })
      .addCase(createUomAsync.rejected, (state) => {
        state.createUOMloading = false;
      });
  },
});

export default uomSlice.reducer;
