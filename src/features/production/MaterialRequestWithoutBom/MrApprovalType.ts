export type PendingRequests = {
  userName: string;
  transactionId: string;
  insertDate: string; // You can later parse this string into a date if needed
  transactionType: string;
};

export type PendingMrRequestResponse = {
  status: string;
  success: boolean;
  data: PendingRequests[];
};

export type Head = {
  skuCode: string;
  skuName: string;
  bomName: string;
  locationName: string;
  mfgQty: string;
  comment: string;
  transactionId: string;
};

export type ProcessRequestDataBody = {
  remark: string;
  partKey: string;
  partName: string;
  requiredQty: string;
  partCode: string;
  uom: string;
};

export type ProcessRequestData = {
  head: Head;
  body: ProcessRequestDataBody[];
};
export type ProcessApiResponse = {
  status: string;
  success: boolean;
  data: ProcessRequestData;
};
export type RequestDetail = {
  name: string;
  id: string;
  requestDate: string;
};
type ItemDetailType = {
  stock: number;
  reqQty: number;
};
export type ItemDetailApiResponse = {
  status: string;
  success: boolean;
  data: ItemDetailType[];
};

export type ApprovePayload = {
  transactionId: string;
  itemsCode: string;
  pickLocation: string;
  issueQty: string;
  remarks: string;
};
export type ApproveItemsResponse = {
  status: string;
  success: boolean;
  message: string;
};
export type ApproveDeviceRequestType = {
  itemCode: string;
  txnID: string;
  pickLocation: string;
  issueQty: string;
  srlNumber: string[];
};
export type ApproveSwipeRequestType = {
  transactionId: string,
  productKey: string,
  qty: number|string,
  pickLocation: string,
  productDetail:any[];
};
export type ApproveDeviceRequestResponse = {
  status: string;
  success: boolean;
  message: string;
};

export type MaterialRejectPayload = {
  itemCode: string;
  txnId: string;
  remarks: string;
};
export type MaterialRejectResponse = {
  status: string;
  success: boolean;
  message: string;
};

export type AprovedMaterialList = {
  transaction: string;
  createDate: string;
  totalRm: number;
};
export type AprovedMaterialListResponse = {
  status: string;
  success: boolean;
  data: AprovedMaterialList[];
};
export type AprovedMaterialListPayload = {
  user: string;
  date: string;
};
type ApproveItemDetail = {
  item_name: string;
  item_code: string;
  item_uom: string;
  execute_qty: number;
  status: string;
  type: string;
  appTxnId: string;
};

export type ApproveItemDetailApiResponse = {
  success: boolean;
  data: ApproveItemDetail[];
  status: string;
};
export type SerialResponseData = {
  success: boolean;
  message: string;
  status: string;
  data: Serial[];
};

type Serial = {
  srlNo: string;
};

export type PendingMrRequestState = {
  pendingMrRequestData: PendingRequests[] | null;
  getPendingMrRequestLoading: boolean;
  processRequestData: ProcessRequestData | null;
  processMrRequestLoading: boolean;
  requestDetail: RequestDetail | null;
  itemDetail: ItemDetailType[] | null;
  itemDetailLoading: boolean;
  approveItemLoading: boolean;
  rejectItemLoading: boolean;
  cancelItemLoading: boolean;
  approvedMaterialListData: AprovedMaterialList[] | null;
  approvedMaterialListLoading: boolean;
  approveItemDetail: ApproveItemDetail[] | null;
  approveItemDetailLoading: boolean;
  serial: Serial[] | null;
  serialLoading: boolean;
  swipeDeviceLoading: boolean;
  swipeDeviceData:PendingRequests[]|null
  deviceLoading: boolean;
  deviceData:any[]|null
};
