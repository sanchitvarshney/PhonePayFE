export type GetSkuDetail = {
  id: string;
  text: string;
};
export type GetSkudetailResponse = {
  data: GetSkuDetail[];
  success: boolean;
  status: string;
  message: string;
};
export type CreateBomPayload = {
  subject: string;
  type: string;
  sku: string;
  remark?: string;
  items: {
    component: string[];
    qty: string[];
    remark: string[];
    reference: string[];
    category?: string[];
    status?: string[];
  };
};
export type CreateBomResponse = {
  success: boolean;
  status: string;
  message: string;
};

type ComponentData = {
  requiredQty: string;
  bomstatus: string;
  category: string;
  compKey: string;
  componentName: string;
  partCode: string;
  componentDesc: string;
  unit: string;
};
type HeaderData = {
  skuCode: string;
  skukey: string;
  productName: string;
  subjectName: string;
  subjectKey: string;
};

export type FGBomResponse = {
  success: boolean;
  status: string;
  message: string;
  data: ComponentData[];
  header: HeaderData;
};
export type FGBomDetailResponse = {
  success: boolean;
  status: string;
  message: string;
  data: {
    data: ComponentData[];
    header: HeaderData;
  };
};

type UploadFileData = {
  partCode: string;
  componentName: string;
  compKey: string;
  quantity: number;
  ref: string;
  remarks: string;
  category: string;
  subCategory: string;
};

export type UploadFileApiResponse = {
  success: boolean;
  data: UploadFileData[];
};

export type AddBomPayload = {
  bomID: string;
  componentKey: string;
  quantity: number;
  category: string;
  reference: string;
};

export interface BomDetailApiResponse {
  success: boolean;
  status: string;
  data: {
    data: BomCompData[];
    header: BomHaederData;
  };
}

interface BomCompData {
  requiredQty: string;
  bomstatus: string;
  category: string;
  compKey: string;
  componentName: string;
  partCode: string;
  componentDesc: string;
  unit: string;
}

interface BomHaederData {
  skuCode: string;
  skukey: string;
  productName: string;
  subjectName: string;
  subjectKey: string;
}

export type BOMState = {
  skuData: GetSkuDetail[] | null;
  getSkudetailLoading: boolean;
  createBomLoading: boolean;
  fgBomList: any[] | null;
  fgBomListLoading: boolean;
  changeStatusLoading: boolean;
  bomItemList: any[] | null;
  bomDetail: any;
  bomDetailLoading: boolean;
  updateBomLoading: boolean;
  uploadFileLoading: boolean;
  uploadFileData: UploadFileData[] | null;
  addBomLoading: boolean;
  bomCompDetail: BomDetailApiResponse | null;
};
