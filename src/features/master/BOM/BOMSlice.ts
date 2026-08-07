import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AddBomPayload, BomDetailApiResponse, BOMState, CreateBomPayload, CreateBomResponse, FGBomDetailResponse, FGBomResponse, GetSkudetailResponse, UploadFileApiResponse } from "./BOMType";
import { showToast } from "@/utils/toasterContext";

const initialState: BOMState = {
  skuData: null,
  getSkudetailLoading: false,
  createBomLoading: false,
  fgBomList: null,
  fgBomListLoading: false,
  changeStatusLoading: false,
  bomItemList: null,
  bomDetail: null,
  bomDetailLoading: false,
  updateBomLoading: false,
  uploadFileData: null,
  uploadFileLoading: false,
  addBomLoading: false,
  bomCompDetail: null,
};

export const getskudeatilAsync = createAsyncThunk<AxiosResponse<GetSkudetailResponse>, string>("master/getSkudeatil", async (skucode) => {
  const response = await axiosInstance.get(`/product/bySku/${skucode}`);
  return response;
});
export const createBomAsync = createAsyncThunk<AxiosResponse<CreateBomResponse>, CreateBomPayload>("master/createbom", async (payload) => {
  const response = await axiosInstance.post(`/bom/add`, payload);
  return response;
});

export const getFGBomList = createAsyncThunk<AxiosResponse<FGBomResponse>, string>("bom/list", async (type: string) => {
  const response = await axiosInstance.get(`/bom/list/${type}`);
  return response;
});

export const changeBomStatus = createAsyncThunk<AxiosResponse<FGBomResponse>, { status: number; subject: string }>("bom/changeStatus", async ({ status, subject }) => {
  const response = await axiosInstance.put(`/bom/change/${status}/${subject}`);
  return response;
});

export const getBomItem = createAsyncThunk<AxiosResponse<FGBomResponse>, string>("bom/items", async (id: string) => {
  const response = await axiosInstance.get(`/bom/items/${id}`);
  return response;
});

export const fetchBomProduct = createAsyncThunk<AxiosResponse<BomDetailApiResponse>, string>("bom/detail", async (id: string) => {
  const response = await axiosInstance.get(`/bom/${id}/detail`);
  return response;
});
export const fetchBomDetail = createAsyncThunk<AxiosResponse<FGBomDetailResponse>, string>("bom/fetchBomDetail", async (id: string) => {
  const response = await axiosInstance.get(`/bom/${id}/detail`);
  return response;
});
export const UpdateBom = createAsyncThunk<AxiosResponse<any>, any>("master/updateBom", async (payload) => {
  const response = await axiosInstance.put(`/bom/update/${payload.id}/${payload.sku}`, payload);
  return response;
});
export const addComponentInBom = createAsyncThunk<AxiosResponse<{ status: number; message: string; success: boolean }>, AddBomPayload>("master/addComponentInBom", async (payload) => {
  const response = await axiosInstance.put(`/bom/addComponent`, payload);
  return response;
});
export const addAlternativeComponent = createAsyncThunk<AxiosResponse<{ status: number; message: string; success: boolean }>, AddBomPayload>("master/addAlternativeComponent", async (payload) => {
  const response = await axiosInstance.put(`/bom/addAlternateComponent`, payload);
  return response;
});

export const getAlternativeComponent = createAsyncThunk<AxiosResponse<{ status: number; message: string; success: boolean, data: any }>, {bomID: string, componentKey: string}>("master/getAlternativeComponent", async (payload) => {
  const response = await axiosInstance.get(`/bom/getAlternateComponent?bomID=${payload.bomID}&componentKey=${payload.componentKey}`);
  return response;
});
export const uploadfile = createAsyncThunk<AxiosResponse<UploadFileApiResponse>, FormData>("master/bom/uploadfile", async (payload) => {
  const response = await axiosInstance.post(`/bom/bomUpload`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
});
const BOMSlice = createSlice({
  name: "BOM",
  initialState,
  reducers: {
    resetUploadFileData: (state) => {
      state.uploadFileData = null;
    },
    resetBomDetail: (state) => {
      state.bomCompDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getskudeatilAsync.pending, (state) => {
        state.getSkudetailLoading = true;
      })
      .addCase(getskudeatilAsync.fulfilled, (state, action) => {
        state.getSkudetailLoading = false;
        if (action.payload.data.success) {
          state.skuData = action.payload.data.data;
        }
      })
      .addCase(getskudeatilAsync.rejected, (state) => {
        state.getSkudetailLoading = false;
      })
      .addCase(getFGBomList.pending, (state) => {
        state.fgBomListLoading = true;
      })
      .addCase(getFGBomList.fulfilled, (state, action) => {
        state.fgBomListLoading = false;
        if (action.payload.data.success) {
          state.fgBomList = action.payload.data.data;
        }
      })
      .addCase(getFGBomList.rejected, (state) => {
        state.fgBomListLoading = false;
      })
      .addCase(changeBomStatus.pending, (state) => {
        state.changeStatusLoading = true;
      })
      .addCase(changeBomStatus.fulfilled, (state, action) => {
        state.changeStatusLoading = false;
        showToast(action.payload.data?.message, "success");
      })
      .addCase(changeBomStatus.rejected, (state) => {
        state.changeStatusLoading = false;
      })
      .addCase(getBomItem.pending, (state) => {
        state.fgBomListLoading = true;
        state.bomDetailLoading = true;
      })
      .addCase(getBomItem.fulfilled, (state, action) => {
        state.fgBomListLoading = false;
        state.bomDetailLoading = false;
        state.bomItemList = action.payload.data.data;
        state.bomDetail = action.payload.data;
      })
      .addCase(getBomItem.rejected, (state) => {
        state.fgBomListLoading = false;
        state.bomDetailLoading = false;
      })
      .addCase(fetchBomProduct.pending, (state) => {
        state.fgBomListLoading = true;
      })
      .addCase(fetchBomProduct.fulfilled, (state, action) => {
        state.fgBomListLoading = false;
        if (action.payload.data.success) {
          state.bomCompDetail = action.payload.data;
        }
      })
      .addCase(fetchBomProduct.rejected, (state) => {
        state.fgBomListLoading = false;
      })
      .addCase(fetchBomDetail.pending, (state) => {
        state.bomDetailLoading = true;
      })
      .addCase(fetchBomDetail.fulfilled, (state, action) => {
        state.bomDetailLoading = false;
        state.bomDetail = action.payload.data;
      })
      .addCase(fetchBomDetail.rejected, (state) => {
        state.bomDetailLoading = false;
      })
      .addCase(UpdateBom.pending, (state) => {
        state.updateBomLoading = true;
      })
      .addCase(UpdateBom.fulfilled, (state) => {
        state.updateBomLoading = false;
      })
      .addCase(UpdateBom.rejected, (state) => {
        state.updateBomLoading = false;
      })
      .addCase(createBomAsync.pending, (state) => {
        state.createBomLoading = true;
      })
      .addCase(createBomAsync.fulfilled, (state, action) => {
        state.createBomLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data?.message, "success");
        }
      })
      .addCase(createBomAsync.rejected, (state) => {
        state.createBomLoading = false;
      })
      .addCase(uploadfile.pending, (state) => {
        state.uploadFileLoading = true;
        state.uploadFileData = [];
      })
      .addCase(uploadfile.fulfilled, (state, action) => {
        state.uploadFileLoading = false;
        if (action.payload.data.success) {
          state.uploadFileData = action.payload.data.data;
        }
      })
      .addCase(uploadfile.rejected, (state) => {
        state.uploadFileLoading = false;
        state.uploadFileData = [];
      })
      .addCase(addComponentInBom.pending, (state) => {
        state.addBomLoading = true;
      })
      .addCase(addComponentInBom.fulfilled, (state, action) => {
        state.addBomLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(addComponentInBom.rejected, (state) => {
        state.addBomLoading = false;
      })
      .addCase(getAlternativeComponent.pending, (state) => {
        state.addBomLoading = true;
      })
      .addCase(getAlternativeComponent.fulfilled, (state) => {
        state.addBomLoading = false;
      })
      .addCase(getAlternativeComponent.rejected, (state) => {
        state.addBomLoading = false;
      })
      .addCase(addAlternativeComponent.pending, (state) => {
        state.addBomLoading = true;
      })
      .addCase(addAlternativeComponent.fulfilled, (state, action) => {
        state.addBomLoading = false;
        if (action.payload.data.success) {
          showToast(action.payload.data.message, "success");
        }
      })
      .addCase(addAlternativeComponent.rejected, (state) => {
        state.addBomLoading = false;
      });
  },
});

export const { resetUploadFileData, resetBomDetail } = BOMSlice.actions;
export default BOMSlice.reducer;
