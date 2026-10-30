import type { AxiosProgressEvent } from "axios";

export interface DeliverySubmitResponse {
  success?: boolean;
  message?: unknown;
  status?: string;
  data?: unknown;
}

export interface SubmitDeliveryPayload {
  awb: string;
  deliveryPartner: string;
  remark: string;
  video: File;
  durationMs: number;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
}

export interface WrongDeviceRow {
  id: number;
  uniqueKey: string;
  awb: string;
  deliveryPartner: string;
  remark: string;
  videoUrl: string;
  videoDuration: number; // seconds
  insertedBy: string;
  insertDate: string; // YYYY-MM-DD HH:mm:ss
}

export interface WrongDeviceReportPayload {
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
}

export interface WrongDeviceReportResponse {
  success?: boolean;
  message?: unknown;
  data?: WrongDeviceRow[];
}

export interface DeliveryState {
  isSubmitting: boolean;
  submitError: string | null;
  wrongDeviceList: WrongDeviceRow[] | null;
  wrongDeviceLoading: boolean;
}
