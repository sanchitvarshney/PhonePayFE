import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  Commonstate,
  CurrencListResponse,
  UserApiResponse,
} from "./commonType";

export interface DeviceImage {
  image_id?: string;
  img_name?: string;
  img_url: string[];
  sim_no?: string;
  operator?: string;
  serial?: string;
  imei?: string;
  insertDt?: string;
}

export interface DeviceImageApiResponse {
  success: boolean;
  message: string;
  data: DeviceImage[];
}

const initialState: Commonstate & {
  deviceImages: DeviceImage[] | null;
  deviceImagesLoading: boolean;
  deviceImagesError: string | null;
} = {
  getUserLoading: false,
  userData: null,
  isueeList: null,
  isueeListLoading: false,
  currencyLoaidng: false,
  currencyData: null,
  costCenterLoading: false,
  costCenterData: null,
  deviceImages: null,
  deviceImagesLoading: false,
  deviceImagesError: null,
};

export const getUserAsync = createAsyncThunk<
  AxiosResponse<UserApiResponse>,
  string | null
>("common/getuser", async (searchinput) => {
  const response = await axiosInstance.get(
    `/backend/search/user/${searchinput}`
  );
  return response;
});
export const getIsueeList = createAsyncThunk<
  AxiosResponse<UserApiResponse>,
  string | null
>("common/getIsueeList", async (searchinput) => {
  const response = await axiosInstance.get(
    `/backend/search/issue/${searchinput}`
  );
  return response;
});
export const getCurrency = createAsyncThunk<AxiosResponse<CurrencListResponse>>(
  "common/getCurrency",
  async () => {
    const response = await axiosInstance.get(`/backend/currencies`);
    return response;
  }
);


export const getDeviceImages = createAsyncThunk<
  AxiosResponse<DeviceImageApiResponse>,
  { deviceType: string; awbNumber: string; serialNo: string }
>("common/getDeviceImages", async ({ deviceType, awbNumber, serialNo }) => {
  const isBerDevice = deviceType === "ber";
  const query = isBerDevice
    ? `serialNo=${serialNo}`
    : `awbNumber=${awbNumber}&serialNo=${serialNo}`;
  const response = await axiosInstance.get(
    `/swipeMachine/delivery/getImages/${deviceType}?${query}`
  );
  return response;
});

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserAsync.pending, (state) => {
        state.getUserLoading = true;
      })
      .addCase(getUserAsync.fulfilled, (state, action) => {
        state.getUserLoading = false;
        if (action.payload?.data?.success) {
          state.userData = action.payload.data.data;
        }
      })
      .addCase(getUserAsync.rejected, (state) => {
        state.getUserLoading = false;
      })
      .addCase(getIsueeList.pending, (state) => {
        state.isueeListLoading = true;
      })
      .addCase(getIsueeList.fulfilled, (state, action) => {
        state.isueeListLoading = false;
        if (action.payload?.data?.success) {
          state.isueeList = action.payload.data.data;
        }
      })
      .addCase(getIsueeList.rejected, (state) => {
        state.isueeListLoading = false;
      })
      .addCase(getCurrency.pending, (state) => {
        state.currencyLoaidng = true;
      })
      .addCase(getCurrency.fulfilled, (state, action) => {
        state.currencyLoaidng = false;
        if (action.payload?.data?.success) {
          state.currencyData = action.payload.data.data;
        }
      })
      .addCase(getCurrency.rejected, (state) => {
        state.currencyLoaidng = false;
      })

      .addCase(getDeviceImages.pending, (state) => {
        state.deviceImagesLoading = true;
        state.deviceImagesError = null;
        state.deviceImages = null;
      })
      .addCase(getDeviceImages.fulfilled, (state, action) => {
        state.deviceImagesLoading = false;
        if (
          action.payload?.data?.success &&
          action.payload?.data?.data?.length > 0
        ) {
          state.deviceImages = action.payload.data.data;
        } else {
          state.deviceImages = [];
          state.deviceImagesError = "No images found for this device.";
        }
      })
      .addCase(getDeviceImages.rejected, (state) => {
        state.deviceImagesLoading = false;
        state.deviceImagesError = "Failed to fetch images. Please try again.";
        state.deviceImages = null;
      });
  },
});

export default commonSlice.reducer;
