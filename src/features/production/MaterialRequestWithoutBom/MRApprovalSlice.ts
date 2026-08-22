import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

import { showToast } from "@/utils/toasterContext";
import { ApproveDeviceRequestResponse,  ApproveItemDetailApiResponse, ApproveItemsResponse, ApprovePayload, ApproveSwipeRequestType, AprovedMaterialListPayload, AprovedMaterialListResponse, ItemDetailApiResponse, MaterialRejectPayload, MaterialRejectResponse, PendingMrRequestResponse, PendingMrRequestState, ProcessApiResponse, RequestDetail, SerialResponseData } from "./MrApprovalType";

const initialState: PendingMrRequestState = {
  pendingMrRequestData: null,
  getPendingMrRequestLoading: false,
  processRequestData: null,
  processMrRequestLoading: false,
  requestDetail: null,
  itemDetail: null,
  itemDetailLoading: false,
  approveItemLoading: false,
  rejectItemLoading: false,
  cancelItemLoading: false,
  approvedMaterialListData: null,
  approvedMaterialListLoading: false,
  approveItemDetail: null,
  approveItemDetailLoading: false,
  serial: null,
  serialLoading: false,
  swipeDeviceData: null,
  swipeDeviceLoading: false,
  deviceLoading: false,
};

export const getPendingMaterialListsync = createAsyncThunk<
  AxiosResponse<PendingMrRequestResponse>,
  string
>("master/getPendingMrrequst", async (reqType) => {
  const response = await axiosInstance.get(`/request/list/${reqType}`);
  return response;
});

export const getPendingSwipeDeviceListsync = createAsyncThunk<
  AxiosResponse<PendingMrRequestResponse>
>("master/getPendingSwipeDeviceListsync", async () => {
  const response = await axiosInstance.get("/reqv2/getMaterialReqV2List ");
  return response;
});

export const serailList = createAsyncThunk<
  AxiosResponse<SerialResponseData>,
  string
>("master/serailList", async (id) => {
  const response = await axiosInstance.get(
    `/request/approvalSerial?txnID=${id}`,
  );
  return response;
});
export const getProcessMrReqeustAsync = createAsyncThunk<
  AxiosResponse<ProcessApiResponse>,
  { id: string; batchId?: string }
>("master/getProcessMrrequst", async ({ id, batchId }) => {
  const query = batchId ? `?batchId=${encodeURIComponent(batchId)}` : "";
  const response = await axiosInstance.get(`/request/detail/${id}${query}`);
  return response;
});

export const getProcessSwipeReqeustAsync = createAsyncThunk<
  AxiosResponse<ProcessApiResponse>,
  string
>("master/getProcessMrrequst", async (id) => {
  const response = await axiosInstance.get(`/reqv2/detail/${id}`);
  return response;
});

export const getItemDetailsAsync = createAsyncThunk<
  AxiosResponse<ItemDetailApiResponse>,
  { txnid: string; itemKey: string; picLocation: string; batchId?: string }
>("master/getItemDetails", async (params) => {
  const query = params.batchId
    ? `?batchId=${encodeURIComponent(params.batchId)}`
    : "";
  const response = await axiosInstance.get(
    `/request/stock/${params.txnid}/${params.itemKey}/${params.picLocation}${query}`,
  );
  return response;
});

export const getItemSwipeDetailsAsync = createAsyncThunk<
  AxiosResponse<ItemDetailApiResponse>,
  { txnid: string; itemKey: string; picLocation: string }
>("master/getItemSwipeDetailsAsync", async (params) => {
  const response = await axiosInstance.get(
    `/reqv2/stock/${params.txnid}/${params.itemKey}/${params.picLocation}`,
  );
  return response;
});

export const approveSelectedItemAsync = createAsyncThunk<
  AxiosResponse<ApproveItemsResponse>,
  ApprovePayload
>("master/approveSelectedItem", async (params) => {
  const itemsCode = params.itemsCode ?? params.itemCode;
  const transactionId = params.transactionId ?? params.txnID;
  const response = await axiosInstance.post(
    `/request/approve/${itemsCode}/${transactionId}`,
    params,
  );
  return response;
});

export const approveSwipeDeviceRequest = createAsyncThunk<
  AxiosResponse<ApproveDeviceRequestResponse>,
  ApproveSwipeRequestType
>("master/approveDeviceType", async (params) => {
  const response = await axiosInstance.put(
    `/reqv2/approveMaterialReqV2`,
    params,
  );
  return response;
});


export const isExistItemOnLocation = createAsyncThunk<AxiosResponse<any>, any>(
  "master/existItem",
  async ({ id, type, location }) => {
    const query =
      `/utils/checkLocation?pickLocation=${location}&type=${type}` +
      (type === "SOUNDBOX" ? `&serial_no=${id}` : `&serial=${id}`);

    const response = await axiosInstance.get(query);
    return response;
  },
);

export const materialRequestReject = createAsyncThunk<
  AxiosResponse<MaterialRejectResponse>,
  MaterialRejectPayload
>("master/materialRequestReject", async (params) => {
  const response = await axiosInstance.put(
    `/request/reject/${params.itemCode}/${params.txnId}`,
    { remarks: params.remarks },
  );
  return response;
});
export const materialRequestCancel = createAsyncThunk<
  AxiosResponse<MaterialRejectResponse>,
  { txnID: string; remarks: string; type: string }
>("master/materialRequestCancel", async (params) => {
  const response = await axiosInstance.put(
    `/request/cancel/${params.txnID}?type=${params.type}`,
    { remark: params.remarks },
  );
  return response;
});
export const getApprovedMaterialList = createAsyncThunk<
  AxiosResponse<AprovedMaterialListResponse>,
  AprovedMaterialListPayload
>("master/getApprovedMaterialList", async (params) => {
  const response = await axiosInstance.get(
    `/request/approvalStatus/${params.user}?date=${params.date}`,
  );
  return response;
});
export const getApproveItemDetail = createAsyncThunk<
  AxiosResponse<ApproveItemDetailApiResponse>,
  string
>("master/getApproveItemDetail", async (params) => {
  const response = await axiosInstance.get(`/request/approvalItem/${params}`);
  return response;
});

const MrApprovalSlice = createSlice({
  name: "mrapproval",
  initialState,
  reducers: {
    setRequestDetail: (state, action: PayloadAction<RequestDetail>) => {
      state.requestDetail = action.payload;
    },
    clearRequestDetail: (state) => {
      state.requestDetail = null;
    },
    clearItemdetail: (state) => {
      state.itemDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPendingMaterialListsync.pending, (state) => {
        state.getPendingMrRequestLoading = true;
      })
      .addCase(getPendingMaterialListsync.fulfilled, (state, action) => {
        state.getPendingMrRequestLoading = false;
        if (action.payload.data.success) {
          state.pendingMrRequestData = action.payload.data.data;
        }
      })
      .addCase(getPendingMaterialListsync.rejected, (state) => {
        state.getPendingMrRequestLoading = false;
        state.pendingMrRequestData = [];
      })
     
      .addCase(getPendingSwipeDeviceListsync.pending, (state) => {
        state.swipeDeviceLoading = true;
      })
      .addCase(getPendingSwipeDeviceListsync.fulfilled, (state, action) => {
        state.swipeDeviceLoading = false;
        if (action.payload.data.success) {
          state.swipeDeviceData = action.payload.data.data;
        }
      })
      .addCase(getPendingSwipeDeviceListsync.rejected, (state) => {
        state.swipeDeviceLoading = false;
        state.swipeDeviceData = [];
      })
      .addCase(serailList.pending, (state) => {
        state.serialLoading = true;
      })
      .addCase(serailList.fulfilled, (state, action) => {
        state.serialLoading = false;
        if (action.payload.data.success) {
          state.serial = action.payload.data.data;
        }
      })
      .addCase(serailList.rejected, (state) => {
        state.serialLoading = false;
        state.serial = [];
      })
      .addCase(getProcessMrReqeustAsync.pending, (state) => {
        state.processMrRequestLoading = true;
      })
      .addCase(getProcessMrReqeustAsync.fulfilled, (state, action) => {
        state.processMrRequestLoading = false;
        if (action.payload.data.success) {
          state.processRequestData = action.payload.data.data;
        }
      })
      .addCase(getProcessMrReqeustAsync.rejected, (state) => {
        state.processMrRequestLoading = false;
        state.processRequestData = null;
      })
      .addCase(getItemDetailsAsync.pending, (state) => {
        state.itemDetailLoading = true;
      })
      .addCase(getItemDetailsAsync.fulfilled, (state, action) => {
        state.itemDetailLoading = false;
        if (action.payload.data.success) {
          state.itemDetail = action.payload.data.data;
        }
      })
      .addCase(getItemDetailsAsync.rejected, (state) => {
        state.itemDetailLoading = false;
      })
      .addCase(getItemSwipeDetailsAsync.pending, (state) => {
        state.itemDetailLoading = true;
      })
      .addCase(getItemSwipeDetailsAsync.fulfilled, (state, action) => {
        state.itemDetailLoading = false;
        if (action.payload.data.success) {
          state.itemDetail = action.payload.data.data;
        }
      })
      .addCase(getItemSwipeDetailsAsync.rejected, (state) => {
        state.itemDetailLoading = false;
      })
      .addCase(approveSelectedItemAsync.pending, (state) => {
        state.approveItemLoading = true;
      })
      .addCase(approveSelectedItemAsync.fulfilled, (state, action) => {
        state.approveItemLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload?.data?.message, "success");
        } else {
          showToast(action.payload?.data?.message, "error");
        }
      })
      .addCase(approveSelectedItemAsync.rejected, (state) => {
        state.approveItemLoading = false;
      })
     
      .addCase(materialRequestReject.pending, (state) => {
        state.rejectItemLoading = true;
      })
      .addCase(materialRequestReject.fulfilled, (state, action) => {
        state.rejectItemLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload?.data?.message, "success");
        } else {
          showToast(action.payload?.data?.message, "error");
        }
      })
      .addCase(materialRequestReject.rejected, (state) => {
        state.rejectItemLoading = false;
      })
      .addCase(materialRequestCancel.pending, (state) => {
        state.cancelItemLoading = true;
      })
      .addCase(materialRequestCancel.fulfilled, (state, action) => {
        state.cancelItemLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload?.data?.message, "success");
        } else {
          showToast(action.payload?.data?.message, "error");
        }
      })
      .addCase(materialRequestCancel.rejected, (state) => {
        state.cancelItemLoading = false;
      })
      .addCase(getApprovedMaterialList.pending, (state) => {
        state.approvedMaterialListLoading = true;
      })
      .addCase(getApprovedMaterialList.fulfilled, (state, action) => {
        state.approvedMaterialListLoading = false;
        if (action.payload.data.success) {
          state.approvedMaterialListData = action.payload.data.data;
        }
      })
      .addCase(getApprovedMaterialList.rejected, (state) => {
        state.approvedMaterialListLoading = false;
        state.approvedMaterialListData = [];
      })
      .addCase(getApproveItemDetail.pending, (state) => {
        state.approveItemDetailLoading = true;
      })
      .addCase(getApproveItemDetail.fulfilled, (state, action) => {
        state.approveItemDetailLoading = false;
        if (action.payload.data.success) {
          state.approveItemDetail = action.payload.data.data;
        }
      })
      .addCase(getApproveItemDetail.rejected, (state) => {
        state.approveItemDetailLoading = false;
        state.approveItemDetail = [];
      });
  },
});

export const { setRequestDetail, clearRequestDetail, clearItemdetail } =
  MrApprovalSlice.actions;
export default MrApprovalSlice.reducer;
