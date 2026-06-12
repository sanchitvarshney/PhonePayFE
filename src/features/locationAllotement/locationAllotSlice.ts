import axiosInstance from "@/api/axiosInstance";
import {
  LocationAllotDetailResponse,
  LocationAllotState,
  LocationAllotedApiItem,
  LocationAllotedListResponse,
  parseLocationsValue,
} from "@/utils/locationAllotementType/locationTypes";
import { showToast } from "@/utils/toasterContext";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

const mapListItem = (item: LocationAllotedApiItem) => ({
  loc_all_key: String(item.loc_all_key),
  module_name: item.module_name ?? item.for_module ?? "",
  module_description: item.module_description ?? item.module_desc ?? "",
});

const initialState: LocationAllotState = {
  allotedList: [],
  allotDetail: null,
  getAllotedListLoading: false,
  getAllotDetailLoading: false,
  allotLocationLoading: false,
  updateAllotLoading: false,
};

export const getAllotedListAsync = createAsyncThunk<
  AxiosResponse<LocationAllotedListResponse>
>("locationAllot/getAllotedList", async () => {
  const response = await axiosInstance.get("/location/fetch_loc_all");
  return response;
});

export const getAllotDetailAsync = createAsyncThunk<
  AxiosResponse<LocationAllotDetailResponse>,
  string
>("locationAllot/getAllotDetail", async (locAllKey) => {
  const response = await axiosInstance.get(
    `/location/fetch_location_all_update/${locAllKey}`,
  );
  return response;
});

export const allotLocationAsync = createAsyncThunk<
  AxiosResponse<any>,
  any
>("locationAllot/allot", async (payload) => {
  const response = await axiosInstance.post("/location/location_allotted", payload);
  return response;
});

export const updateAllotLocationAsync = createAsyncThunk<
  AxiosResponse<any>,
  any
>("locationAllot/updateAllot", async (payload) => {
  const response = await axiosInstance.put(
    "/location/location_allotted_update",
    {
      key: payload.loc_all_key,
      module_name: payload.for_module,
      module_description: payload.module_desc,
      locations: [payload.locations],
    },
  );
  return response;
});

const locationAllotSlice = createSlice({
  name: "locationAllot",
  initialState,
  reducers: {
    clearAllotDetail: (state) => {
      state.allotDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllotedListAsync.pending, (state) => {
        state.getAllotedListLoading = true;
      })
      .addCase(getAllotedListAsync.fulfilled, (state, action) => {
        state.getAllotedListLoading = false;
        const list = action.payload?.data?.data;
        state.allotedList = Array.isArray(list) ? list.map(mapListItem) : [];
      })
      .addCase(getAllotedListAsync.rejected, (state) => {
        state.getAllotedListLoading = false;
        state.allotedList = [];
      })
      .addCase(getAllotDetailAsync.pending, (state) => {
        state.getAllotDetailLoading = true;
        state.allotDetail = null;
      })
      .addCase(getAllotDetailAsync.fulfilled, (state, action) => {
        state.getAllotDetailLoading = false;
        const detail = action.payload?.data?.data;
        if (detail) {
          state.allotDetail = {
            loc_all_key: String(detail.loc_all_key),
            for_module: detail.for_module ?? "",
            module_desc: detail.module_desc ?? "",
            location_ids: parseLocationsValue(detail.locations),
          };
        }
      })
      .addCase(getAllotDetailAsync.rejected, (state) => {
        state.getAllotDetailLoading = false;
        state.allotDetail = null;
      })
      .addCase(allotLocationAsync.pending, (state) => {
        state.allotLocationLoading = true;
      })
      .addCase(allotLocationAsync.fulfilled, (state, action) => {
        state.allotLocationLoading = false;
        if (action.payload?.data?.success) {
          showToast(
            action.payload.data.message ?? "Location allotted successfully",
            "success",
          );
        }
      })
      .addCase(allotLocationAsync.rejected, (state) => {
        state.allotLocationLoading = false;
      })
      .addCase(updateAllotLocationAsync.pending, (state) => {
        state.updateAllotLoading = true;
      })
      .addCase(updateAllotLocationAsync.fulfilled, (state, action) => {
        state.updateAllotLoading = false;
        if (action.payload?.data?.success) {
          showToast(
            action.payload.data.message ?? "Location allotment updated successfully",
            "success",
          );
        }
      })
      .addCase(updateAllotLocationAsync.rejected, (state) => {
        state.updateAllotLoading = false;
      });
  },
});

export const { clearAllotDetail } = locationAllotSlice.actions;
export default locationAllotSlice.reducer;
