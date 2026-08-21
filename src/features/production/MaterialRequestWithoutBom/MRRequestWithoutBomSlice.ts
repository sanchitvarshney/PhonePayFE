import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  AvailbleQtyItem,
  AvailbleQtyResponse,
  CreateProductRequestResponse,
  CreateProductRequestType,
  DeviceBatchResponse,
  MRRequestWithoutBomState,
  PartCodeDataresponse,
} from "./MRRequestWithoutBomType";

const initialState: MRRequestWithoutBomState = {
  getPartCodeLoading: false,
  partCodeData: null,
  type: "part",
  createProductRequestLoading: false,
  locationData: null,
  craeteRequestData: null,
  availbleQtyData: null,
  getSkuLoading: false,
  skuCodeData: null,
  deviceBatchLoading: false,
  deviceBatchData: [],
};

const upsertAvailbleQty = (
  state: MRRequestWithoutBomState,
  data: AvailbleQtyItem,
) => {
  if (!state.availbleQtyData) {
    state.availbleQtyData = [];
  }
  const existingIndex = state.availbleQtyData.findIndex(
    (item) =>
      item.location === data.location &&
      item.item === data.item &&
      item.batchId === data.batchId,
  );
  if (existingIndex >= 0) {
    state.availbleQtyData[existingIndex] = data;
  } else {
    state.availbleQtyData.push(data);
  }
};

export const getPertCodesync = createAsyncThunk<
  AxiosResponse<PartCodeDataresponse>,
  string | null
>("master/getPertCode", async (value) => {
  const response = await axiosInstance.get(`/backend/search/item/${value}`);
  return response;
});

export const createProductRequest = createAsyncThunk<
  AxiosResponse<CreateProductRequestResponse>,
  CreateProductRequestType
>("/req/submit", async (value) => {
  const response = await axiosInstance.post(
    `/request/submit/${value.reqType}`,
    value,
  );
  return response;
});






export const getDeviceBatches = createAsyncThunk<
  AxiosResponse<DeviceBatchResponse>,
  { deviceKey: string }
>("request/fetchDeviceBatches", async (params) => {
  const response = await axiosInstance.get(
    `/request/fetch-batches?device_key=${encodeURIComponent(params.deviceKey)}`,
  );
  return response;
});

export const getAvailbleQty = createAsyncThunk<
  AxiosResponse<AvailbleQtyResponse>,
  {
    type: string;
    itemCode: string;
    location: { value?: string } | string;
    batchId?: string;
  }
>("wearhouse/getAvailbleQty", async (params) => {
  const locationValue =
    typeof params.location === "string"
      ? params.location
      : params.location.value ?? "";
  const query = params.batchId
    ? `?batchId=${encodeURIComponent(params.batchId)}`
    : "";
  const response = await axiosInstance.get(
    `/backend/stock/${params.type}/${params.itemCode}/${locationValue}${query}`,
  );
  return response;
});

export const getSwipeAvailbleQty = createAsyncThunk<
  AxiosResponse<AvailbleQtyResponse>,
  {
    type: string;
    itemCode: string;
    location: { value?: string } | string;
    batchId?: string;
  }
>("wearhouse/getSwipeAvailbleQty", async (params) => {
  const locationValue =
    typeof params.location === "string"
      ? params.location
      : params.location.value ?? "";
  const query = params.batchId
    ? `?batchId=${encodeURIComponent(params.batchId)}`
    : "";
  const response = await axiosInstance.get(
    `/backend/stockv2/${params.type}/${params.itemCode}/${locationValue}${query}`,
  );
  return response;
});

const mrRequestWithoutBomSlice = createSlice({
  name: "materialRequestWithoutBom",
  initialState,
  reducers: {
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    clearAvailbleQtyData: (state) => {
      state.availbleQtyData = null;
    },
  },
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
      })
      .addCase(createProductRequest.pending, (state) => {
        state.createProductRequestLoading = true;
      })
      .addCase(createProductRequest.fulfilled, (state, action) => {
        state.createProductRequestLoading = false;
        if (action.payload?.data?.success) {
          state.craeteRequestData = action.payload.data;
        }
      })
      .addCase(createProductRequest.rejected, (state) => {
        state.createProductRequestLoading = false;
      })
  

 
      .addCase(getDeviceBatches.pending, (state) => {
        state.deviceBatchLoading = true;
      })
      .addCase(getDeviceBatches.fulfilled, (state, action) => {
        state.deviceBatchLoading = false;
        const deviceKey = action.meta.arg.deviceKey;
        const batches = action.payload?.data?.data ?? [];
        const existingIndex = state.deviceBatchData.findIndex(
          (group) => group.deviceKey === deviceKey,
        );
        if (existingIndex >= 0) {
          state.deviceBatchData[existingIndex] = { deviceKey, batches };
        } else {
          state.deviceBatchData.push({ deviceKey, batches });
        }
      })
      .addCase(getDeviceBatches.rejected, (state) => {
        state.deviceBatchLoading = false;
      })
      .addCase(getAvailbleQty.fulfilled, (state, action) => {
        if (action.payload?.data?.success) {
          upsertAvailbleQty(state, {
            ...action.payload.data.data,
            batchId: action.meta.arg.batchId,
          });
        }
      })
      .addCase(getSwipeAvailbleQty.fulfilled, (state, action) => {
        if (action.payload?.data?.success) {
          upsertAvailbleQty(state, {
            ...action.payload.data.data,
            batchId: action.meta.arg.batchId,
          });
        }
      });
  },
});

export const { setType, clearAvailbleQtyData } =
  mrRequestWithoutBomSlice.actions;
export default mrRequestWithoutBomSlice.reducer;
