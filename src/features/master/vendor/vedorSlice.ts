import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  AddVendorBranchPayload,
  UpadteVendorBranchPayload,
  VendorBarnchResponse,
  VendorBasicDetailUpdatePayload,
  VendorCreatePayload,
  VendorResponse,
  VendorState,
} from "./vendorType";
import { showToast } from "@/utils/toasterContext";

const initialState: VendorState = {
  vendor: null,
  getvendorLoading: false,
  createVendorLoading: false,
  files: null,
  uploadfileloading: false,
  vendorDetail: null,
  getVendorDetailLoading: false,
  updateVendorBranchLoading: false,
  addvendorbranchLoading: false,
  vendorBasicDetailUpdateLoading: false,
};

export const getVendor = createAsyncThunk<AxiosResponse<VendorResponse>>(
  "master/vendor/getVendor",
  async () => {
    const response = await axiosInstance.get(`/vendor/vendorList`);
    return response;
  }
);

export const getVendorBranch = createAsyncThunk<
  AxiosResponse<VendorBarnchResponse>,
  string
>("master/vendor/getVendorBranch", async (id) => {
  const response = await axiosInstance.get(`/vendor/vendorDetail/${id}`);
  return response;
});

export const updateVendorBranch = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  UpadteVendorBranchPayload
>("master/vendor/updateVendor", async (payload) => {
  const response = await axiosInstance.put(`/vendor/updateVendorBranch`, payload);
  return response;
});

export const updateBasicDetail = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  VendorBasicDetailUpdatePayload
>("master/vendor/updateBasicDetail", async (payload) => {
  const response = await axiosInstance.put(
    `/vendor/updateVendorBasicDetail`,
    payload
  );
  return response;
});

export const addVendorBranch = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  AddVendorBranchPayload
>("master/vendor/addVendorBranch", async (payload) => {
  const response = await axiosInstance.post(`/vendor/addVendorBranch`, payload);
  return response;
});

export const createVendor = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  VendorCreatePayload
>("master/vendor/createVendor", async (payload) => {
  const response = await axiosInstance.post(`/vendor/addVendor`, payload);
  return response;
});

export const uploadFile = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string; data: { name: string } }>,
  FormData
>("master/vendor/uploadFile", async (file) => {
  const response = await axiosInstance.post(`/vendor/uploadFiles`, file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
});

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getVendor.pending, (state) => {
        state.getvendorLoading = true;
      })
      .addCase(getVendor.fulfilled, (state, action) => {
        state.getvendorLoading = false;
        const res = action.payload?.data as VendorResponse | undefined;
        if (res?.success && res?.data != null) {
          state.vendor = Array.isArray(res.data) ? res.data : [];
        }
      })
      .addCase(getVendor.rejected, (state) => {
        state.getvendorLoading = false;
      })
      .addCase(getVendorBranch.pending, (state) => {
        state.getVendorDetailLoading = true;
      })
      .addCase(getVendorBranch.fulfilled, (state, action) => {
        state.getVendorDetailLoading = false;
        if (action.payload.data.success) {
          state.vendorDetail = action.payload.data.data;
        }
      })
      .addCase(getVendorBranch.rejected, (state) => {
        state.getVendorDetailLoading = false;
      })
      .addCase(createVendor.pending, (state) => {
        state.createVendorLoading = true;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.createVendorLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(createVendor.rejected, (state) => {
        state.createVendorLoading = false;
      })
      .addCase(addVendorBranch.pending, (state) => {
        state.addvendorbranchLoading = true;
      })
      .addCase(addVendorBranch.fulfilled, (state, action) => {
        state.addvendorbranchLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(addVendorBranch.rejected, (state) => {
        state.addvendorbranchLoading = false;
      })
      .addCase(uploadFile.pending, (state) => {
        state.uploadfileloading = true;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploadfileloading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
          if (state.files) {
            state.files.push(action.payload.data.data.name);
          } else {
            state.files = [action.payload.data.data.name];
          }
        }
      })
      .addCase(uploadFile.rejected, (state) => {
        state.uploadfileloading = false;
      })
      .addCase(updateVendorBranch.pending, (state) => {
        state.updateVendorBranchLoading = true;
      })
      .addCase(updateVendorBranch.fulfilled, (state, action) => {
        state.updateVendorBranchLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updateVendorBranch.rejected, (state) => {
        state.updateVendorBranchLoading = false;
      })
      .addCase(updateBasicDetail.pending, (state) => {
        state.vendorBasicDetailUpdateLoading = true;
      })
      .addCase(updateBasicDetail.fulfilled, (state, action) => {
        state.vendorBasicDetailUpdateLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updateBasicDetail.rejected, (state) => {
        state.vendorBasicDetailUpdateLoading = false;
      });
  },
});

export default vendorSlice.reducer;
