import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CreateProductReturnMINPayloadType, CreateRawMinPayloadType, CreateRawMinResponse, RawminState } from "./RawMinType";
import { AxiosResponse } from "axios";
import axiosInstance from "@/api/axiosInstance";

const initialState: RawminState = {
  documnetFileData: null,
  createminLoading: false,
  formdata: null,
};

export const createRawMin = createAsyncThunk<AxiosResponse<CreateRawMinResponse>, CreateRawMinPayloadType>(
  "rawmin/createRawMin",
  async (payload) => {
    const response = await axiosInstance.post("/transaction/min_transaction", payload);
    return response;
  }
);

export const createProductReturnMIN = createAsyncThunk<AxiosResponse<CreateRawMinResponse>, CreateProductReturnMINPayloadType>(
  "rawmin/createProductReturnMIN",
  async (payload) => {
    const response = await axiosInstance.post("/transaction/minProdReturn", payload);
    return response;
  }
);

const RawMinSlice = createSlice({
  name: "rawmin",
  initialState,
  reducers: {
    storeDocumentFile: (state, action) => {
      if (state.documnetFileData) {
        state.documnetFileData?.push(action.payload);
      } else {
        state.documnetFileData = [action.payload];
      }
    },
    deletefile: (state, action) => {
      if (state.documnetFileData) {
        state.documnetFileData = state.documnetFileData.filter((f) => f.fileID !== action.payload);
      }
    },
    resetDocumentFile: (state) => {
      state.documnetFileData = null;
    },
    storeFormdata: (state, action) => {
      state.formdata = action.payload;
    },
    resetFormData: (state) => {
      state.formdata = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRawMin.pending, (state) => {
        state.createminLoading = true;
      })
      .addCase(createRawMin.fulfilled, (state) => {
        state.createminLoading = false;
      })
      .addCase(createRawMin.rejected, (state) => {
        state.createminLoading = false;
      });
  },
});

export const { storeDocumentFile, resetDocumentFile, deletefile, storeFormdata, resetFormData } = RawMinSlice.actions;
export default RawMinSlice.reducer;
