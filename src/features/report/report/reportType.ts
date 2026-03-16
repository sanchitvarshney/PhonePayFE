export type R1DataItem = {
  insertDt: string;
  skuCode: string;
  skuName: string;
  serialNo: string;
  imei: string;
  simAvailiblity: string;
  uom: string;
  inQty: number;
  inLoc: string;
  vendorName: string;
  vendorCode: string;
  docType: string;
  docId: string;
  minNo: string;
  insertBy: string;
};

type DocumentHead = {
  insertDt: string;
  skuCode: string;
  skuName: string;
  uom: string;
  inLoc: string;
  vendorName: string;
  vendorCode: string;
  vendorAddress: string;
  docType: string;
  docNo: string;
  docDate: string;
};

type DocumentBody = {
  serialNo: string;
  imei: string;
  simAvailability: string;
  model: string;
};

type DocumentData = {
  head: DocumentHead;
  body: DocumentBody[];
};

export type R1ApiResponse = {
  status: string;
  success: boolean;
  data: DocumentData;
};

export type r6report = {
  txnId: string;
  partCode: string;
  componentName: string;
  uom: string;
  qty: number;
  location: string;
  rate: string;
  hsn: string;
  vendorCode: string;
  vendorName: string;
  vendorAddress: string;
  insertDt: string;
  insertby: string;
  subCategory: string;
  category: string;
};

export type r6reportApiResponse = {
  success: boolean;
  data: {
    data: {
      records: r6report[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
      };
    };
  };
};

export type ReportStateType = {
  r1Data: DocumentData | null;
  getR1DataLoading: boolean;
  r6Report: any;
  wrongDeviceReport: any;
  r6ReportLoading: boolean;
  wrongDeviceReportLoading: boolean;
};

