import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  CreateLocationPayloadtype,
  CreateLocationResponse,
  GetLocationDetailsresponse,
  LocationResponse,
  LocationStates,
  StatusUpdateResponse,
} from "./locationType";
import { showToast } from "@/utils/toasterContext";

const initialState: LocationStates = {
  getLocationLoading: false,
  locationData: null,
  createLocationLoading: false,
  createLocationData: null,
  updateStatusLoading: false,
  changeStatusData: null,
  getLocationDetailsLoading: false,
  getLocationDetails: null,
};

export const getLocationAsync = createAsyncThunk<AxiosResponse<LocationResponse>>(
  "master/getLocation",
  async () => {
    const response = await axiosInstance.get("/location ");
    return response;
  }
);
export const createLocationAsync = createAsyncThunk<
  AxiosResponse<CreateLocationResponse>,
  CreateLocationPayloadtype
>("master/createLcation", async (location) => {
  const response = await axiosInstance.post("/location/add", location);
  return response;
});
export const changeSatatus = createAsyncThunk<
  AxiosResponse<StatusUpdateResponse>,
  { value: string; key: string }
>("master/updateStatus", async (updatedvalue) => {
  const response = await axiosInstance.put(
    `/location/status/${updatedvalue.value}/${updatedvalue.key}`
  );
  return response;
});
export const getLocationDetails = createAsyncThunk<
  AxiosResponse<GetLocationDetailsresponse>,
  string
>("master/getLocationDetails", async (key) => {
  const response = await axiosInstance.get(`/location/details/${key}`);
  return response;
});

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
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
      .addCase(createLocationAsync.pending, (state) => {
        state.createLocationLoading = true;
      })
      .addCase(createLocationAsync.fulfilled, (state, action) => {
        state.createLocationLoading = false;
        if (action.payload?.data?.success) {
          state.createLocationData = action.payload.data;
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(createLocationAsync.rejected, (state) => {
        state.createLocationLoading = false;
      })
      .addCase(changeSatatus.pending, (state) => {
        state.updateStatusLoading = true;
      })
      .addCase(changeSatatus.fulfilled, (state, action) => {
        state.updateStatusLoading = false;
        if (action.payload?.data?.success) {
          state.changeStatusData = action.payload.data;
          showToast(action.payload.data?.message, "success");
        }
      })
      .addCase(changeSatatus.rejected, (state) => {
        state.updateStatusLoading = false;
      })
      .addCase(getLocationDetails.pending, (state) => {
        state.getLocationDetailsLoading = true;
      })
      .addCase(getLocationDetails.fulfilled, (state, action) => {
        state.getLocationDetailsLoading = false;
        if (action.payload?.data?.success) {
          state.getLocationDetails = action.payload.data.data;
        }
      })
      .addCase(getLocationDetails.rejected, (state) => {
        state.getLocationDetailsLoading = false;
      });
  },
});

export default locationSlice.reducer;
