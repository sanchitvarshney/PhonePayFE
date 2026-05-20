import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { PoListResponse, PoStateType } from "./poTypes";

const initialState: PoStateType = {
  data: [],
  loading: false,
  error: null,
  managePoData: [],
  dateRange: null,
  formData: null,
  printLoading: false,
  cancelLoading: false,
  fetchPODataLoading: false,
  fetchPOData: [],
  completedPoData: [],
  submitPOMINLoading: false,
  uploadMinInvoiceLoading: false,
};

export const getListofPo = createAsyncThunk<
  AxiosResponse<PoListResponse>,
  {
    wise: "powise" | "datewise" | "vendorwise" | string;
    data: string;
    limit: number;
    page: number;
  }
>("po/fetchPendingData4PO", async (payload) => {
  const response = await axiosInstance.get(
    payload.wise === "powise"
      ? `/po/fetchPendingData4PO?wise=powise&data=${payload.data}&limit=${payload.limit}&page=${payload.page}`
      : `/po/fetchPendingData4PO?wise=datewise&data=${payload.data}&limit=${payload.limit}&page=${payload.page}`
  );
  return response;
});

export const getListofCompletedPo = createAsyncThunk<
  AxiosResponse<PoListResponse>,
  {
    wise: "powise" | "datewise" | "vendorwise" | string;
    data: string;
    limit: number;
    page: number;
  }
>("po/fetchCompletedData4PO", async (payload) => {
  const response = await axiosInstance.get(
    payload.wise === "powise"
      ? `/po/fetchCompletePO?wise=powise&data=${payload.data}&limit=${payload.limit}&page=${payload.page}`
      : `/po/fetchCompletePO?wise=datewise&data=${payload.data}&limit=${payload.limit}&page=${payload.page}`
  );
  return response as AxiosResponse<PoListResponse>;
});

export const createPO = createAsyncThunk<AxiosResponse<unknown>, unknown>(
  "po/createPO",
  async (payload) => {
    const response = await axiosInstance.post("/po/createPO", payload);
    return response;
  }
);

/** Bulk Device Inward / delivery-challan style create — not under `/po/`. */
export const createBulkDeviceInward = createAsyncThunk<
  AxiosResponse<unknown>,
  unknown
>("bulkDeviceInward/create", async (payload) => {
  const response = await axiosInstance.post(
    "/inward/deviceInward",
    payload
  );
  return response;
});

export const updatePO = createAsyncThunk<AxiosResponse<unknown>, unknown>(
  "po/updatePO",
  async (payload) => {
    const response = await axiosInstance.put("/po/updateData4Update", payload);
    return response;
  }
);

export const cancelPO = createAsyncThunk<AxiosResponse<unknown>, unknown>(
  "po/cancelPO",
  async (payload) => {
    const response = await axiosInstance.post("/po/cancelPO", payload);
    return response;
  }
);

export const fetchPOData = createAsyncThunk<
  AxiosResponse<unknown>,
  { id: string }
>("po/fetchPOData", async (payload) => {
  const response = await axiosInstance.get(
    `/po/fetchComponentList4PO?poid=${payload.id}`
  );
  return response;
});

export const getPODetail = createAsyncThunk<
  unknown,
  { id: string }
>("po/getPODetail", async (payload) => {
  const response = await axiosInstance.get(
    `/po/fetchData4Update?pono=${payload.id}`
  );
  return response.data;
});

export const getPOComponentDetail = createAsyncThunk<
  AxiosResponse<unknown>,
  string
>("po/getPOComponentDetail", async (id) => {
  const response = await axiosInstance.get(
    `/po/getComponentDetailsByCode/${id}`
  );
  return response;
});

export const fetchDataForMIN = createAsyncThunk<
  AxiosResponse<unknown>,
  string
>("po/fetchDataForMIN", async (id) => {
  const response = await axiosInstance.get(`/po/fetchData4MIN?pono=${id}`);
  return response;
});

export const submitPOMIN = createAsyncThunk<
  AxiosResponse<unknown>,
  unknown
>("po/submitPOMIN", async (payload) => {
  const response = await axiosInstance.post("/po/poMIN", payload);
  return response;
});

export const uploadMinInvoice = createAsyncThunk<
  unknown,
  { files: File }
>("/po/uploadInvoice", async ({ files }) => {
  const formData = new FormData();
  formData.append("files", files);
  const response = await axiosInstance.post("/po/uploadInvoice", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
});

export const poPrint = createAsyncThunk<
  unknown,
  { id: string },
  { rejectValue: unknown }
>("/poPrint", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/po/printPo?poid=${data.id}`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PO_${data.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return { success: true, data: null, message: "PDF downloaded successfully" };
  } catch (error: unknown) {
    return rejectWithValue({
      success: false,
      data: null,
      message: (error as Error)?.message || "Failed to download PDF",
      error,
    });
  }
});

const procurementPoSlice = createSlice({
  name: "procurementPo",
  initialState,
  reducers: {
    setDateRange(state, action: { payload: unknown }) {
      state.dateRange = action.payload;
    },
    setFormData(state, action: { payload: unknown }) {
      state.formData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getListofPo.pending, (state) => {
        state.loading = true;
      })
      .addCase(getListofPo.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload as AxiosResponse<PoListResponse>;
        state.managePoData = res?.data ?? action.payload;
      })
      .addCase(getListofPo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getListofCompletedPo.pending, (state) => {
        state.loading = true;
      })
      .addCase(getListofCompletedPo.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload as AxiosResponse<PoListResponse>;
        state.completedPoData = res?.data ?? action.payload;
      })
      .addCase(getListofCompletedPo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getPODetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPODetail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getPODetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPOData.pending, (state) => {
        state.fetchPODataLoading = true;
      })
      .addCase(fetchPOData.fulfilled, (state, action) => {
        state.fetchPODataLoading = false;
        const res = action.payload as AxiosResponse<{ data?: unknown }>;
        state.fetchPOData = res?.data?.data ?? res?.data ?? action.payload;
      })
      .addCase(fetchPOData.rejected, (state, action) => {
        state.fetchPODataLoading = false;
        state.error = action.error.message;
      })
      .addCase(poPrint.pending, (state) => {
        state.printLoading = true;
      })
      .addCase(poPrint.fulfilled, (state) => {
        state.printLoading = false;
      })
      .addCase(poPrint.rejected, (state, action) => {
        state.printLoading = false;
        state.error = action.error.message;
      })
      .addCase(cancelPO.pending, (state) => {
        state.cancelLoading = true;
      })
      .addCase(cancelPO.fulfilled, (state) => {
        state.cancelLoading = false;
      })
      .addCase(cancelPO.rejected, (state, action) => {
        state.cancelLoading = false;
        state.error = action.error.message;
      })
      .addCase(createPO.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPO.fulfilled, (state, action) => {
        state.loading = false;
        state.managePoData = (action.payload as AxiosResponse<{ data?: unknown }>)?.data ?? action.payload;
      })
      .addCase(createPO.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBulkDeviceInward.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBulkDeviceInward.fulfilled, (state, action) => {
        state.loading = false;
        state.managePoData =
          (action.payload as AxiosResponse<{ data?: unknown }>)?.data ??
          action.payload;
      })
      .addCase(createBulkDeviceInward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updatePO.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePO.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePO.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchDataForMIN.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDataForMIN.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchDataForMIN.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(submitPOMIN.pending, (state) => {
        state.submitPOMINLoading = true;
      })
      .addCase(submitPOMIN.fulfilled, (state) => {
        state.submitPOMINLoading = false;
      })
      .addCase(submitPOMIN.rejected, (state, action) => {
        state.submitPOMINLoading = false;
        state.error = action.error.message;
      })
      .addCase(uploadMinInvoice.pending, (state) => {
        state.uploadMinInvoiceLoading = true;
      })
      .addCase(uploadMinInvoice.fulfilled, (state) => {
        state.uploadMinInvoiceLoading = false;
      })
      .addCase(uploadMinInvoice.rejected, (state, action) => {
        state.uploadMinInvoiceLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setDateRange, setFormData } = procurementPoSlice.actions;
export default procurementPoSlice.reducer;
