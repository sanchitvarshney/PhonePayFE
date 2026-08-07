import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  AddBranchPayload,
  AddShipToAddressPayload,
  BasicDetailPayload,
  ClientState,
  CraeteClientPayload,
  CustomerApiResponse,
  UpdateBillingAddressPayload,
  UpdateShipToPayload,
} from "./clientType";
import { showToast } from "@/utils/toasterContext";

const initialState: ClientState = {
  createClientLoading: false,
  clientdata: null,
  getClientLoading: false,
  clientDetail: null,
  clientDetailLoading: false,
  addressDetail: null,
  addressDetailLoading: false,
  dispatchFromDetails: null,
  dispatchFromDetailsLoading: false,
  addShiptoAddressLoading: false,
  addBranchLoading: false,
  updateshiptoAddressLoading: false,
  addressId: null,
  shipId: null,
  updateBillingAddressLoading: false,
  billId: null,
  updateBasicDetailLoading: false,
  getShippingAddressLoading: false,
  shippingAddress: null,
  getClientShippingLoading: false,
  clientShippingdata: null,
};

export const createClient = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  CraeteClientPayload
>("master/client/createClient", async (payload) => {
  const response = await axiosInstance.post(`/client/createclient`, payload);
  return response;
});
export const getClient = createAsyncThunk<
  AxiosResponse<CustomerApiResponse>,
  void
>("master/client/getclient", async () => {
  const response = await axiosInstance.get(`/client/viewclients`);
  return response;
});
export const getClientDetail = createAsyncThunk<
  AxiosResponse<{ success: boolean; data: unknown }>,
  string
>("master/client/getClientDetail", async (id) => {
  const response = await axiosInstance.get(`/client/clientDetails?client=${id}`);
  return response;
});
export const getClientAddressDetail = createAsyncThunk<
  AxiosResponse<{ success: boolean; data: unknown }>,
  string
>("master/client/getClientAddressDetail", async (id) => {
  const response = await axiosInstance.get(
    `/client/branchDetails?addressID=${id}`
  );
  return response;
});
export const getDispatchFromDetail = createAsyncThunk<
  AxiosResponse<{ success: boolean; data: ClientState["dispatchFromDetails"] }>,
  void
>("master/client/getDispatchFromDetail", async () => {
  const response = await axiosInstance.get(`/billingAddress/getAll`);
  return response;
});

export const getShippingAddress = createAsyncThunk<
  AxiosResponse<{ success: boolean; data: unknown }>,
  void
>("master/client/getShippingAddress", async () => {
  const response = await axiosInstance.get(`/shippingAddress/getAll`);
  return response;
});

export const getClientShipping = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  { id: string }
>("master/client/getClientShipping", async ({ id }) => {
  const response = await axiosInstance.get(`/client/clientDetails?client=${id}`);

  return response;
});

export const addShipToAddress = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  AddShipToAddressPayload
>("master/client/addShipToAddress", async (payload) => {
  const response = await axiosInstance.post(
    `/client/addShipmentAddress`,
    payload
  );
  return response;
});
export const addClientBranch = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  AddBranchPayload
>("master/client/addClientBranch", async (payload) => {
  const response = await axiosInstance.post(`/client/addBranch`, payload);
  return response;
});
export const updateShipToDetail = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  UpdateShipToPayload
>("master/client/updateShipToDetail", async (payload) => {
  const response = await axiosInstance.put(`/client/updateShipment`, payload);
  return response;
});
export const updatebillingAddress = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  UpdateBillingAddressPayload
>("master/client/updatebillingAddress", async (payload) => {
  const response = await axiosInstance.put(`/client/updateBranch`, payload);
  return response;
});
export const updateBasicDetail = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  BasicDetailPayload
>("master/client/updateBasicDetail", async (payload) => {
  const response = await axiosInstance.put(`/client/updateClient`, payload);
  return response;
});

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setAddressId: (state, action) => {
      state.addressId = action.payload;
    },
    setShipId: (state, action) => {
      state.shipId = action.payload;
    },
    clearAddressId: (state) => {
      state.addressId = null;
    },
    clearShipId: (state) => {
      state.shipId = null;
    },
    setBillId: (state, action) => {
      state.billId = action.payload;
    },
    clearBillId: (state) => {
      state.billId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClient.pending, (state) => {
        state.createClientLoading = true;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.createClientLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(createClient.rejected, (state) => {
        state.createClientLoading = false;
      })
      .addCase(getShippingAddress.pending, (state) => {
        state.getShippingAddressLoading = true;
      })
      .addCase(getShippingAddress.fulfilled, (state, action) => {
        state.getShippingAddressLoading = false;
        if (action.payload?.data?.success) {
          state.shippingAddress = action.payload.data.data as ClientState["shippingAddress"];
        }
      })
      .addCase(getShippingAddress.rejected, (state) => {
        state.getShippingAddressLoading = false;
      })
      .addCase(getClient.pending, (state) => {
        state.getClientLoading = true;
        state.clientdata = null;
      })
      .addCase(getClient.fulfilled, (state, action) => {
        state.getClientLoading = false;
        if (action.payload?.data?.success) {
          state.clientdata = action.payload.data.data as ClientState["clientdata"];
        }
      })
      .addCase(getClient.rejected, (state) => {
        state.getClientLoading = false;
        state.clientdata = null;
      })
          .addCase(getClientShipping.pending, (state) => {
        state.getClientShippingLoading = true;
        state.clientShippingdata = null;
      })
      .addCase(getClientShipping.fulfilled, (state, action) => {
        state.getClientShippingLoading = false;
        if (action.payload?.data?.success) {
          //@ts-ignore
          state.clientShippingdata = action.payload.data.data.branch as any;
        }
      })
      .addCase(getClientShipping.rejected, (state) => {
        state.getClientShippingLoading = false;
        state.clientShippingdata = null;
      })
      .addCase(getDispatchFromDetail.pending, (state) => {
        state.dispatchFromDetailsLoading = true;
        state.dispatchFromDetails = null;
      })
      .addCase(getDispatchFromDetail.fulfilled, (state, action) => {
        state.dispatchFromDetailsLoading = false;
        if (action.payload?.data?.success) {
          state.dispatchFromDetails = action.payload.data.data as ClientState["dispatchFromDetails"];
        }
      })
      .addCase(getDispatchFromDetail.rejected, (state) => {
        state.dispatchFromDetailsLoading = false;
        state.dispatchFromDetails = null;
      })
      .addCase(getClientDetail.pending, (state) => {
        state.clientDetailLoading = true;
        state.clientDetail = null;
      })
      .addCase(getClientDetail.fulfilled, (state, action) => {
        state.clientDetailLoading = false;
        if (action.payload?.data?.success) {
          state.clientDetail = action.payload.data.data;
        }
      })
      .addCase(getClientDetail.rejected, (state) => {
        state.clientDetailLoading = false;
        state.clientDetail = null;
      })
      .addCase(getClientAddressDetail.pending, (state) => {
        state.addressDetailLoading = true;
        state.addressDetail = null;
      })
      .addCase(getClientAddressDetail.fulfilled, (state, action) => {
        state.addressDetailLoading = false;
        if (action.payload?.data?.success) {
          state.addressDetail = action.payload.data.data;
        }
      })
      .addCase(getClientAddressDetail.rejected, (state) => {
        state.addressDetailLoading = false;
        state.addressDetail = null;
      })
      .addCase(addShipToAddress.pending, (state) => {
        state.addShiptoAddressLoading = true;
      })
      .addCase(addShipToAddress.fulfilled, (state, action) => {
        state.addShiptoAddressLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(addShipToAddress.rejected, (state) => {
        state.addShiptoAddressLoading = false;
      })
      .addCase(addClientBranch.pending, (state) => {
        state.addBranchLoading = true;
      })
      .addCase(addClientBranch.fulfilled, (state, action) => {
        state.addBranchLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(addClientBranch.rejected, (state) => {
        state.addBranchLoading = false;
      })
      .addCase(updateShipToDetail.pending, (state) => {
        state.updateshiptoAddressLoading = true;
      })
      .addCase(updateShipToDetail.fulfilled, (state, action) => {
        state.updateshiptoAddressLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updateShipToDetail.rejected, (state) => {
        state.updateshiptoAddressLoading = false;
      })
      .addCase(updatebillingAddress.pending, (state) => {
        state.updateBillingAddressLoading = true;
      })
      .addCase(updatebillingAddress.fulfilled, (state, action) => {
        state.updateBillingAddressLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updatebillingAddress.rejected, (state) => {
        state.updateBillingAddressLoading = false;
      })
      .addCase(updateBasicDetail.pending, (state) => {
        state.updateBasicDetailLoading = true;
      })
      .addCase(updateBasicDetail.fulfilled, (state, action) => {
        state.updateBasicDetailLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updateBasicDetail.rejected, (state) => {
        state.updateBasicDetailLoading = false;
      });
  },
});

export const {
  setAddressId,
  setShipId,
  clearAddressId,
  clearShipId,
  setBillId,
  clearBillId,
} = clientSlice.actions;
export default clientSlice.reducer;
