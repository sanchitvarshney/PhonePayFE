import { VendorData } from "@/components/reusable/SelectVendor";
import { Dayjs } from "dayjs";

export type DocumentFileData = {
  originalFileName: string;
  fileID: string;
};

export type CreateRawMinPayloadType = {
  vendor: string;
  vendorbranch: string;
  address: string;
  doc_id: string;
  doc_date: string;
  vendortype: string;
  invoiceAttachment: string;
  component: string[];
  qty: number[];
  rate: number[];
  remarks: string[];
  // Optional metadata used by Good Spare Inward excel upload flow
  location?: string;
  costCenter?: string;
  boxId?: string[];
  challanNo?: string[];
  challanDate?: string[];
  curierName?: string[];
  courierName?: string[];
  docketNo?: string[];
  recievedDate?: string[];
  receivedDate?: string[];
  // cc: string;
  deliveryAddress: string;
  deliveryGst: string;
  minType?: string;
};

export type CreateProductReturnMINPayloadType = {
  component: string[];
  qty: number[];
  location: string[];
  hsnCode: string[];
  remarks: string[];
  minType: string;
};

export type CreateRawMinResponse = {
  status: string;
  success: boolean;
  message: string;
};

export type InvoiceFileType = {
  originalFileName: string;
  fileID: string;
};

export type RawMINFormData = {
  pickLocation?: { label: string; value: string } | null;
  costCenter?: { label: string; value: string } | null;
  vendorType: string;
  vendor: VendorData | null;
  vendorBranch: string;
  vendorAddress: string;
  gstin: string;
  doucmentDate: Dayjs | null;
  documentId: string;
};

export type RawminState = {
  documnetFileData: DocumentFileData[] | null;
  createminLoading: boolean;
  formdata: RawMINFormData | null;
};
