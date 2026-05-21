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

export type R1ReportRow = {
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

export type R1ReportApiResponse = {
  success: boolean;
  data: {
    data: {
      records: R1ReportRow[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
      };
    };
  };
};

export type R3ReportRow = {
  componentName: string;
  partName: string;
  qty: string;
  transactionId: string;
  location: string;
  consumedDate: string;
  insertBy: string;
};

export type R3ReportPagination = {
  page: number;
  limit: number;
  total: string | number;
  totalPages: number;
};

export type R3ReportApiResponse = {
  success: boolean;
  message: string;
  data: R3ReportRow[];
  pagination: R3ReportPagination;
};

export type ReportStateType = {
  r1Data: DocumentData | null;
  getR1DataLoading: boolean;
  r1Report: any;
  wrongDeviceReport: any;
  r1ReportLoading: boolean;
  wrongDeviceReportLoading: boolean;
  r2Report: any;
  r2ReportLoading: boolean;
  r3report: R3ReportApiResponse | null;
  r3reportLoading: boolean;
  r3ReportDetail: any;
  r3ReportDetailLoading: boolean;

};

