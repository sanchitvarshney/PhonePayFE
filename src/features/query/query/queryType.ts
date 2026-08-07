interface Vendor {
  type: string;
  name: string;
  code: string;
}
export type RowData = {
  insertDate: string;
  type: string;
  transaction: string;
  qtyIn: number;
  qtyOut: number;
  locIn: string;
  locOut: string;
  insertBy: string;
  vendor: string;
  vendorCode: string;
  poNumber?: string;
};
interface TransactionType {
  type: string;
  txnID: string;
}

type TransactionData = {
  transactionType: string;
  refId: string;
  minNo: string;
  time: string;
  location: string | null;
  user: string | null;
  serial: string;
  imei: string;
  locationOut:string;
  method:string;
  manufacturingMonth?:string
  deviceMovId?:string
  name?:string
};
export type R2ApiResponse = {
  status: "success";
  success: boolean;
  data: TransactionData[];
};

export interface BodyItem {
  type: TransactionType;
  vendor: Vendor;
  qtyIn: number;
  qtyOut: number;
  insertBy: string;
  locIn: string;
  locOut: string;
  insertDate: string;
  category: string;
  subCategory: string;
  IMEI: string;
  SRLNo: string;
  poNumber?: string | undefined;
  issue?: string;
}

interface Head {
  code: string;
  name: string;
  uom: string;
  closingQty: number;
  openingQty: number;
  lasttIN: string;
  lastRate: string;
}

export interface Response {
  head: Head;
  body: BodyItem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
}

export interface Q1ApiResponse {
  success: boolean;
  status: string;
  response: Response;
}

export type component = {
  NAME: string;
  CODE: string;
  KEY: string;
  SOURCE: string;
};
export type componentApiResponse = {
  status: string;
  success: boolean;
  data: component[];
};

type ComponentData = {
  component: {
    partCode: string;
    name: string;
    uom: string;
  };
  locationQty: Array<{
    locationName: string;
    closeQty: number;
  }>;
};

export type Q3ApiResponse = {
  status: string;
  success: boolean;
  data: ComponentData;
};

export type QueryStateType = {
  q1Data: Response | null;
  getQ1DataLoading: boolean;
  componentData: component[] | null;
  getComponentDataLoading: boolean;
  getQ2DataLading: boolean;
  q2Data: Response | null;
  q2Pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  } | null;
  q3data: ComponentData | null;
  q3DataLoading: boolean;
  q2StatementLoading: boolean;
  q2Statement: TransactionData[] | null;
  q3Pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  } | null;
q3Data: any | null;
  getQ3DataLading: boolean;
};

