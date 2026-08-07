export type PartCodeData = {
  id: string;
  text: string;
  part_code: string;
  material_code: string;
  specification: string;
  unit: string;
};
export type LocationData = {
  text: string;
  id: string;
  specification: string;
};
export type SkuCodeData = {
  id: string;
  text: string;
  skuCode: string;
  unit: string;
};
export type AvailbleQtyResponse = {
  status: string;
  success: boolean;
  data: {
    Stock: number;
    location: string;
    item: string;
  };
};
export type SkuCodeDataresponse = {
  data: SkuCodeData[];
  status: string;
  success: boolean;
};
export type LocationApiresponse = {
  data: LocationData[];
  status: string;
  success: boolean;
};
export type PartCodeDataresponse = {
  data: PartCodeData[];
  status: string;
  message: string;
  success: boolean;
};
export type CreateProductRequestResponse = {
  status: string;
  message: string;
  success: boolean;
};
export type CreateProductRequestType = {
  reqType: string;
  putLocation: string;
  itemKey: string[];
  picLocation: string[];
  qty: string[];
  remark: string[];
  comment: string;
  forTrc?: string;
};

export type AvailbleQtyItem = {
  location: string;
  item: string;
  Stock: number;
};

export type MRRequestWithoutBomState = {
  getPartCodeLoading: boolean;
  partCodeData: PartCodeDataresponse["data"] | null;
  type: string;
  createProductRequestLoading: boolean;
  locationData: LocationData[] | null;
  craeteRequestData: CreateProductRequestResponse | null;
  availbleQtyData: AvailbleQtyItem[] | null;
  getSkuLoading: boolean;
  skuCodeData: SkuCodeDataresponse["data"] | null;
};