/** Shape returned by GET /inward/fetch-device-inward. */
export type BulkDeviceInwardRow = {
  challanNumber: string;
  challanDate: string;
  deviceSku: string;
  deviceKey: string;
  minNo: string;
  qty: string | number;
  rate: string | number;
  pendingInwardQty: number;
  inwardQty: number;
  insertDt?: string;
  insertBy?: string;
  [key: string]: unknown;
};

/** One serial batch, as returned inside GET /inward/fetch_inward_serials?device_detailTxnId=<minNo>. */
export type BulkDeviceInwardSerialBatch = {
  batchId: string;
  totalQty: string | number;
  serials: string[];
  insertDt: string;
};

export type BulkDeviceInwardSerialsResponse = {
  success: boolean;
  status: string;
  data: {
    deviceSku: string;
    deviceDetailTxnId: string;
    challanNumber: string;
    batches: BulkDeviceInwardSerialBatch[];
  };
};

/** Shape returned by GET /inward/inwardLocation. */
export type InwardLocationOption = {
  [key: string]: unknown;
};

export type InwardLocationResponse = {
  success: boolean;
  data: InwardLocationOption[];
};

export type BulkDeviceBatch = {
  batchId: string | number;
  challanNo: string;
  qty: number;
  serialno: string[];
  uploadedDate: string;
  transferred: boolean;
};

export type BulkDeviceInwardListResponse = {
  success: boolean;
  data: BulkDeviceInwardRow[];
};

export type BulkDeviceBatchListResponse = {
  success: boolean;
  data: BulkDeviceBatch[];
};

export type UploadInvoiceResponse = {
  success: boolean;
  data: string;
  message?: string;
};

export type BulkDeviceInwardState = {
  manageList: BulkDeviceInwardRow[];
  manageListLoading: boolean;
  batches: BulkDeviceBatch[];
  batchesLoading: boolean;
  serials: BulkDeviceInwardSerialBatch[];
  serialsLoading: boolean;
  inwardLocations: InwardLocationOption[];
  inwardLocationsLoading: boolean;
  uploadInvoiceLoading: boolean;
  invoicePath: string;
  uploadSerialLoading: boolean;
  transferLoading: boolean;
  error: string | null;
};
