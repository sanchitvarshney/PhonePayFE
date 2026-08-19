import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  BulkDeviceBatchListResponse,
  BulkDeviceInwardListResponse,
  BulkDeviceInwardSerialsResponse,
  BulkDeviceInwardState,
  InwardLocationResponse,
  UploadInvoiceResponse,
} from "./bulkDeviceInwardType";

const initialState: BulkDeviceInwardState = {
  manageList: [],
  manageListLoading: false,
  batches: [],
  batchesLoading: false,
  serials: [],
  serialsLoading: false,
  inwardLocations: [],
  inwardLocationsLoading: false,
  uploadInvoiceLoading: false,
  invoicePath: "",
  uploadSerialLoading: false,
  transferLoading: false,
  error: null,
};

/** Same shared upload endpoint Good Spare Inward uses (fields: file, fileName) — confirmed real, not a placeholder. */
export const uploadBulkInvoiceFile = createAsyncThunk<
  AxiosResponse<UploadInvoiceResponse>,
  FormData
>("bulkDeviceInward/uploadInvoice", async (params) => {
  const response = await axiosInstance.post(
    "/partCode/upload-invoice",
    params,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response;
});

/** Datewise branch confirmed: GET /inward/fetch-device-inward?from=DD-MM-YYYY&to=DD-MM-YYYY. Challanwise branch still a placeholder — needs confirmation. */
export const getBulkDeviceInwardList = createAsyncThunk<
  AxiosResponse<BulkDeviceInwardListResponse>,
  | { wise: "datewise"; from: string; to: string }
  | { wise: "challanwise"; data: string }
>("bulkDeviceInward/list", async (payload) => {
  const response = await axiosInstance.get(
    payload.wise === "datewise"
      ? `/inward/fetch-device-inward?from=${payload.from}&to=${payload.to}`
      : `/inward/fetch-device-inward?challanNo=${payload.data}`
  );
  return response;
});

/** Placeholder endpoint — needs confirmation from backend. */
export const getBulkDeviceInwardBatches = createAsyncThunk<
  AxiosResponse<BulkDeviceBatchListResponse>,
  { challanNo: string }
>("bulkDeviceInward/batches", async (payload) => {
  const response = await axiosInstance.get(
    `/inward/deviceInward/batches?challanNo=${encodeURIComponent(payload.challanNo)}`
  );
  return response;
});

export const getBulkDeviceInwardSerials = createAsyncThunk<
  AxiosResponse<BulkDeviceInwardSerialsResponse>,
  { minNo: string }
>("bulkDeviceInward/serials", async (payload) => {
  const response = await axiosInstance.get(
    `/inward/fetch_inward_serials?device_detailTxnId=${encodeURIComponent(payload.minNo)}`
  );
  return response;
});

export const getInwardLocation = createAsyncThunk<
  AxiosResponse<InwardLocationResponse>
>("bulkDeviceInward/inwardLocation", async () => {
  const response = await axiosInstance.get("/inward/inwardLocation");
  return response;
});

export const uploadBulkDeviceSerial = createAsyncThunk<
  AxiosResponse<unknown>,
  {
    minNo: string;
    sku: string;
    qty: number;
    serialno: string[];
    device_key: string;
    putLocation: string;
  }
>("bulkDeviceInward/uploadSerial", async (payload) => {
  const response = await axiosInstance.post(
    "/inward/inwardDeviceSerials",
    payload
  );
  return response;
});

/** Placeholder endpoint — needs confirmation from backend. */
export const transferBulkDeviceBatch = createAsyncThunk<
  AxiosResponse<unknown>,
  { batchId: string | number; challanNo: string }
>("bulkDeviceInward/transfer", async (payload) => {
  const response = await axiosInstance.post(
    "/inward/deviceInward/transfer",
    payload
  );
  return response;
});

const bulkDeviceInwardSlice = createSlice({
  name: "bulkDeviceInward",
  initialState,
  reducers: {
    storeInvoicePath: (state, action) => {
      state.invoicePath = action.payload;
    },
    resetInvoicePath: (state) => {
      state.invoicePath = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadBulkInvoiceFile.pending, (state) => {
        state.uploadInvoiceLoading = true;
      })
      .addCase(uploadBulkInvoiceFile.fulfilled, (state) => {
        state.uploadInvoiceLoading = false;
      })
      .addCase(uploadBulkInvoiceFile.rejected, (state, action) => {
        state.uploadInvoiceLoading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(getBulkDeviceInwardList.pending, (state) => {
        state.manageListLoading = true;
      })
      .addCase(getBulkDeviceInwardList.fulfilled, (state, action) => {
        state.manageListLoading = false;
        state.manageList = action.payload?.data?.data ?? [];
      })
      .addCase(getBulkDeviceInwardList.rejected, (state, action) => {
        state.manageListLoading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(getBulkDeviceInwardBatches.pending, (state) => {
        state.batchesLoading = true;
      })
      .addCase(getBulkDeviceInwardBatches.fulfilled, (state, action) => {
        state.batchesLoading = false;
        state.batches = action.payload?.data?.data ?? [];
      })
      .addCase(getBulkDeviceInwardBatches.rejected, (state, action) => {
        state.batchesLoading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(getBulkDeviceInwardSerials.pending, (state) => {
        state.serialsLoading = true;
      })
      .addCase(getBulkDeviceInwardSerials.fulfilled, (state, action) => {
        state.serialsLoading = false;
        state.serials = action.payload?.data?.data?.batches ?? [];
      })
      .addCase(getBulkDeviceInwardSerials.rejected, (state, action) => {
        state.serialsLoading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(getInwardLocation.pending, (state) => {
        state.inwardLocationsLoading = true;
      })
      .addCase(getInwardLocation.fulfilled, (state, action) => {
        state.inwardLocationsLoading = false;
        state.inwardLocations = action.payload?.data?.data ?? [];
      })
      .addCase(getInwardLocation.rejected, (state, action) => {
        state.inwardLocationsLoading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(uploadBulkDeviceSerial.pending, (state) => {
        state.uploadSerialLoading = true;
      })
      .addCase(uploadBulkDeviceSerial.fulfilled, (state) => {
        state.uploadSerialLoading = false;
      })
      .addCase(uploadBulkDeviceSerial.rejected, (state, action) => {
        state.uploadSerialLoading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(transferBulkDeviceBatch.pending, (state) => {
        state.transferLoading = true;
      })
      .addCase(transferBulkDeviceBatch.fulfilled, (state) => {
        state.transferLoading = false;
      })
      .addCase(transferBulkDeviceBatch.rejected, (state, action) => {
        state.transferLoading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export const { storeInvoicePath, resetInvoicePath } =
  bulkDeviceInwardSlice.actions;
export default bulkDeviceInwardSlice.reducer;
