import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  ComponentDetailApiResponse,
  ComponentsApiResponse,
  ComponnetState,
  GroupApiResponse,
  UpdateComponentAdvanceDetail,
  UpdateCompoenntProductionDetailPayload,
  UpdateComponentBasicDetailPayload,
  UpdateTaxDetailPayload,
} from "./componentType";
import { UomCreateApiresponse } from "../UOM/UOMType";
import { showToast } from "@/utils/toasterContext";

const initialState: ComponnetState = {
  component: null,
  getComponentLoading: false,
  createComponentLoading: false,
  groupList: null,
  getGroupListLoading: false,
  getComponentDetailLoading: false,
  componentDetail: null,
  updateCompoenntBasciDetailLoading: false,
  updateCompoenntAdvanceDetailLoading: false,
  updateCompoenntProductionDetailLoading: false,
  updateCompoenntTaxDetailLoading: false,
};

export const getComponentsAsync = createAsyncThunk<
  AxiosResponse<ComponentsApiResponse>
>("master/getcomponents", async () => {
  const response = await axiosInstance.get("/component");
  return response;
});
export const createComponentAsync = createAsyncThunk<
  AxiosResponse<UomCreateApiresponse>,
  { name: string; description: string; uom: string; compFor?: string; part?: string; hsn?: string }
>("master/create_component", async (component) => {
  const response = await axiosInstance.post("/component/create_component", component);
  return response;
});
export const getGroupsAsync = createAsyncThunk<AxiosResponse<GroupApiResponse>>(
  "group/groupSelect2",
  async () => {
    const response = await axiosInstance.get("/group/groupSelect2");
    return response;
  }
);
export const getComponentDetailSlice = createAsyncThunk<
  AxiosResponse<ComponentDetailApiResponse>,
  string
>("group/getComponentSlice", async (id) => {
  const response = await axiosInstance.get(
    `/component/getComponentDetailsByCode/${id}`
  );
  return response;
});
export const updateCompoenntBasicDetailAsync = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  UpdateComponentBasicDetailPayload
>("group/updateCompoenntBasicDetailAsync", async (payload) => {
  const response = await axiosInstance.put(
    `/component/updateComponentBasicDetail`,
    payload
  );
  return response;
});
export const updateCompoenntAdvanceDetailAsync = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  UpdateComponentAdvanceDetail
>("group/updateCompoenntAdvanceDetailAsync", async (payload) => {
  const response = await axiosInstance.put(
    `/component/updateComponentAdvanceDetail`,
    payload
  );
  return response;
});
export const updateCompoenntProductionDetailAsync = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  UpdateCompoenntProductionDetailPayload
>("group/updateCompoenntProductionDetailAsync", async (payload) => {
  const response = await axiosInstance.put(
    `/component/updateComponentProductionDetail`,
    payload
  );
  return response;
});
export const updateCompoenntTaxDetailAsync = createAsyncThunk<
  AxiosResponse<{ success: boolean; message: string }>,
  UpdateTaxDetailPayload
>("group/updateCompoenntTaxDetailAsync", async (payload) => {
  const response = await axiosInstance.put(
    `/component/updateComponentTaxDetail`,
    payload
  );
  return response;
});

const componentSlice = createSlice({
  name: "component",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getComponentsAsync.pending, (state) => {
        state.getComponentLoading = true;
      })
      .addCase(getComponentsAsync.fulfilled, (state, action) => {
        state.getComponentLoading = false;
        if (action.payload?.data?.success) {
          state.component = action.payload.data.data;
        }
      })
      .addCase(getComponentsAsync.rejected, (state) => {
        state.getComponentLoading = false;
      })
      .addCase(createComponentAsync.pending, (state) => {
        state.createComponentLoading = true;
      })
      .addCase(createComponentAsync.fulfilled, (state) => {
        state.createComponentLoading = false;
      })
      .addCase(createComponentAsync.rejected, (state) => {
        state.createComponentLoading = false;
      })
      .addCase(getGroupsAsync.pending, (state) => {
        state.getGroupListLoading = true;
      })
      .addCase(getGroupsAsync.fulfilled, (state, action) => {
        state.getGroupListLoading = false;
        if (action.payload?.data?.success) {
          state.groupList = action.payload.data.data;
        }
      })
      .addCase(getGroupsAsync.rejected, (state) => {
        state.getGroupListLoading = false;
      })
      .addCase(getComponentDetailSlice.pending, (state) => {
        state.getComponentDetailLoading = true;
      })
      .addCase(getComponentDetailSlice.fulfilled, (state, action) => {
        state.getComponentDetailLoading = false;
        if (action.payload?.data?.status === "success") {
          state.componentDetail = action.payload.data.data;
        }
      })
      .addCase(getComponentDetailSlice.rejected, (state) => {
        state.getComponentDetailLoading = false;
      })
      .addCase(updateCompoenntBasicDetailAsync.pending, (state) => {
        state.updateCompoenntBasciDetailLoading = true;
      })
      .addCase(updateCompoenntBasicDetailAsync.fulfilled, (state, action) => {
        state.updateCompoenntBasciDetailLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updateCompoenntBasicDetailAsync.rejected, (state) => {
        state.updateCompoenntBasciDetailLoading = false;
      })
      .addCase(updateCompoenntAdvanceDetailAsync.pending, (state) => {
        state.updateCompoenntAdvanceDetailLoading = true;
      })
      .addCase(updateCompoenntAdvanceDetailAsync.fulfilled, (state, action) => {
        state.updateCompoenntAdvanceDetailLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updateCompoenntAdvanceDetailAsync.rejected, (state) => {
        state.updateCompoenntAdvanceDetailLoading = false;
      })
      .addCase(updateCompoenntProductionDetailAsync.pending, (state) => {
        state.updateCompoenntProductionDetailLoading = true;
      })
      .addCase(updateCompoenntProductionDetailAsync.fulfilled, (state, action) => {
        state.updateCompoenntProductionDetailLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updateCompoenntProductionDetailAsync.rejected, (state) => {
        state.updateCompoenntProductionDetailLoading = false;
      })
      .addCase(updateCompoenntTaxDetailAsync.pending, (state) => {
        state.updateCompoenntTaxDetailLoading = true;
      })
      .addCase(updateCompoenntTaxDetailAsync.fulfilled, (state, action) => {
        state.updateCompoenntTaxDetailLoading = false;
        if (action.payload?.data?.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(updateCompoenntTaxDetailAsync.rejected, (state) => {
        state.updateCompoenntTaxDetailLoading = false;
      });
  },
});

export default componentSlice.reducer;
