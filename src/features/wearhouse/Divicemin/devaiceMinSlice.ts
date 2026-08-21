import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  DeviceMinSate,
  LocationApiresponse,
  PartNamesApiResponse,
  UploadInvoiceFileApiResponse,
  UploadSerialFileResponse,
  VendorAddressApiResponse,
} from "./DeviceMinType";

const initialState: DeviceMinSate = {
  getLocationLoading: false,
  locationData: null,
  getVendorLoading: false,
  VendorData: null,
  getVendorBranchLoading: false,
  VendorBranchData: null,
  venderaddressloading: false,
  venderaddressdata: null,
  uploadSerialFileLoading: false,
  serialFiledata: null,
  uploadInvoiceFileLoading: false,
  invociceFiledata: null,
  getPartNamesLoading: false,
  partNamesData: null,
};

export const getLocationAsync = createAsyncThunk<AxiosResponse<LocationApiresponse>, string | null>(
  "wearhouse/getLocation",
  async (params) => {
    const response = await axiosInstance.get(`/backend/search/location/${params ?? null}`);
    return response;
  }
);

export const getVendorAsync = createAsyncThunk<AxiosResponse<LocationApiresponse>, string | null>(
  "wearhouse/getVendor",
  async (params) => {
    const response = await axiosInstance.get(`/vendor/vendorOptions/${params}`);
    return response;
  }
);

export const getVendorBranchAsync = createAsyncThunk<AxiosResponse<LocationApiresponse>, string>(
  "wearhouse/getVendorBranch",
  async (params) => {
    const response = await axiosInstance.get(`/vendor/vendorBranchList?vendorcode=${params}`);
    return response;
  }
);

export const getVendorAddress = createAsyncThunk<AxiosResponse<VendorAddressApiResponse>, string>(
  "wearhouse/getVendoraddress",
  async (params) => {
    const response = await axiosInstance.get(`/vendor/vendorAddress?branchcode=${params}`);
    return response;
  }
);

export const uploadSerialFile = createAsyncThunk<AxiosResponse<UploadSerialFileResponse>, FormData>(
  "wearhouse/deviceMin/uploadSerial",
  async (params) => {
    const response = await axiosInstance.post(`/deviceMin/uploadSerial`, params, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  }
);

export const uploadInvoiceFile = createAsyncThunk<AxiosResponse<UploadInvoiceFileApiResponse>, FormData>(
  "wearhouse/deviceMin/upload-invoice",
  async (params) => {
    const response = await axiosInstance.post(`/partCode/upload-invoice`, params, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  }
);

export const getPartNamesAsync = createAsyncThunk<
  AxiosResponse<PartNamesApiResponse>,
  { bomKey: string; partCode: string[] }
>(
  "wearhouse/deviceMin/getPartNames",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/consumption/getPartNames?bomKey=${payload.bomKey}`,
        { partCode: payload.partCode }
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data ?? { message: error.message });
    }
  }
);

const deviceMinSlice = createSlice({
  name: "deviceMin",
  initialState,
  reducers: {
    clearaddressdetail: (state) => {
      state.venderaddressdata = null;
      state.VendorBranchData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLocationAsync.pending, (state) => {
        state.getLocationLoading = true;
      })
      .addCase(getLocationAsync.fulfilled, (state, action) => {
        state.getLocationLoading = false;
        if (action.payload?.data?.success) {
          state.locationData = action.payload.data.data;
        }
      })
      .addCase(getLocationAsync.rejected, (state) => {
        state.getLocationLoading = false;
      })
      .addCase(getVendorAsync.pending, (state) => {
        state.getVendorLoading = true;
      })
      .addCase(getVendorAsync.fulfilled, (state, action) => {
        state.getVendorLoading = false;
        if (action.payload?.data?.success) {
          state.VendorData = action.payload.data.data;
        }
      })
      .addCase(getVendorAsync.rejected, (state) => {
        state.getVendorLoading = false;
      })
      .addCase(getVendorBranchAsync.pending, (state) => {
        state.getVendorBranchLoading = true;
      })
      .addCase(getVendorBranchAsync.fulfilled, (state, action) => {
        state.getVendorBranchLoading = false;
        if (action.payload?.data?.success) {
          state.VendorBranchData = action.payload.data.data;
        }
      })
      .addCase(getVendorBranchAsync.rejected, (state) => {
        state.getVendorBranchLoading = false;
      })
      .addCase(getVendorAddress.pending, (state) => {
        state.venderaddressloading = true;
      })
      .addCase(getVendorAddress.fulfilled, (state, action) => {
        state.venderaddressloading = false;
        if (action.payload?.data?.success) {
          state.venderaddressdata = action.payload.data.data;
        }
      })
      .addCase(getVendorAddress.rejected, (state) => {
        state.venderaddressloading = false;
      })
      .addCase(uploadSerialFile.pending, (state) => {
        state.uploadSerialFileLoading = true;
      })
      .addCase(uploadSerialFile.fulfilled, (state, action) => {
        state.uploadSerialFileLoading = false;
        if (action.payload.data.success) {
          state.serialFiledata = action.payload.data.data;
        }
      })
      .addCase(uploadSerialFile.rejected, (state) => {
        state.uploadSerialFileLoading = false;
      })
      .addCase(uploadInvoiceFile.pending, (state) => {
        state.uploadInvoiceFileLoading = true;
      })
      .addCase(uploadInvoiceFile.fulfilled, (state, action) => {
        state.uploadInvoiceFileLoading = false;
        if (action.payload.data.success) {
          state.invociceFiledata = action.payload.data.data;
        }
      })
      .addCase(uploadInvoiceFile.rejected, (state) => {
        state.uploadInvoiceFileLoading = false;
      })
      .addCase(getPartNamesAsync.pending, (state) => {
        state.getPartNamesLoading = true;
      })
      .addCase(getPartNamesAsync.fulfilled, (state, action) => {
        state.getPartNamesLoading = false;
        const list = action.payload?.data?.data ?? action.payload?.data?.body ?? [];
        state.partNamesData = Array.isArray(list) ? list : [];
      })
      .addCase(getPartNamesAsync.rejected, (state) => {
        state.getPartNamesLoading = false;
      });
  },
});

export const { clearaddressdetail } = deviceMinSlice.actions;
export default deviceMinSlice.reducer;
