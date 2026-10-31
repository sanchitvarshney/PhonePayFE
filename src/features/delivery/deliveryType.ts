import type { AxiosProgressEvent } from "axios";

export interface ApiResponse<T> {
  success?: boolean;
  message?: unknown;
  data?: T;
}

export interface AwbCheckResult {
  awb: string;
  scanId: string;
  docId: string;
  deliveryPartner: string;
  scanType: string; // "PARTNER" | "CHALLAN"
  entered: number;
  limit: number | null; // null = no limit
}

export interface WrongDeviceLocation {
  key: string;
  name: string;
}

export interface SubmitDeliveryPayload {
  awb: string;
  itemName: string;
  qty: number;
  remark: string;
  location: string;
  video: File;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
}

export interface SubmitDeliveryResult extends AwbCheckResult {
  id: number;
  itemName: string;
  qty: number;
  location: string;
}

export type DeliverySubmitResponse = ApiResponse<SubmitDeliveryResult>;

export interface WrongDeviceRow {
  id: number;
  awb_no: string;
  scan_id: string;
  method: string; // "AWB" | "Challan"
  item_name: string;
  qty: number;
  remark: string;
  insert_by: string;
  insert_dt: string;
  videoUrl: string; // signed link, valid for 5 minutes
}

export interface WrongDeviceReportPayload {
  from?: string; // YYYY-MM-DD, server defaults to today
  to?: string; // YYYY-MM-DD, server defaults to today
  awb?: string;
}

export type WrongDeviceReportResponse = ApiResponse<WrongDeviceRow[]>;

export interface DeliveryState {
  isSubmitting: boolean;
  submitError: string | null;
  awbInfo: AwbCheckResult | null;
  awbChecking: boolean;
  awbError: string | null;
  locations: WrongDeviceLocation[];
  locationsLoading: boolean;
  wrongDeviceList: WrongDeviceRow[] | null;
  wrongDeviceLoading: boolean;
}
