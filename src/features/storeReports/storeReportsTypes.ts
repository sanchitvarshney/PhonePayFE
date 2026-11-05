export type ScanType = "PARTNER" | "CHALLAN";
export type AwbStatus = "PENDING" | "ENTERED" | "COMPLETE";

// Query params shared by every store report. Dates are DD-MM-YYYY.
export interface StoreReportParams {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
  deliveryPartner?: string;
  scanType?: ScanType;
  awb?: string;
  status?: AwbStatus;
  docId?: string;
  serial?: string;
  model?: string;
  location?: string;
  item?: string;
}

export interface StoreReportResponse<T> {
  success?: boolean;
  message?: unknown;
  total?: number;
  page?: number;
  limit?: number;
  data?: T[];
}

export interface PartnerOption {
  key: string; // partner code
  name: string;
}

// Reports 1 and 2
export interface AwbReceivedRow {
  awb_no: string;
  scan_id: string;
  doc_id: string;
  scan_type: string;
  delivery_partner: string;
  delivery_partner_name: string;
  awb_count: number;
  received_at: string;
  received_by: string;
  serials: number;
  wrong_devices: number;
  entered: number;
  status: AwbStatus;
  age_days: number;
}

// Report 3
export interface SerialInwardRow {
  awb_no: string;
  method: string;
  scan_id: string;
  doc_id: string;
  scan_type: string;
  delivery_partner: string;
  delivery_partner_name: string;
  serial_no: string;
  device_sku: string;
  device_model: string;
  location_key: string;
  location_name: string;
  transaction_id: string;
  device_mov_id: string;
  inward_by: string;
  insert_dt: string;
}

// Report 4
export interface StoreWrongDeviceRow {
  id: number;
  awb_no: string;
  method: string;
  scan_id: string;
  delivery_partner: string;
  delivery_partner_name: string;
  item_name: string;
  qty: number;
  remark: string;
  location_key: string;
  location_name: string;
  entered_by: string;
  insert_dt: string;
  videoUrl: string; // valid for 5 minutes
}

// Report 5
export interface PartnerSummaryRow {
  partner_code: string;
  partner_name: string;
  awbs: number;
  declared_count: number;
  serials: number;
  wrong_devices: number;
  entered: number;
  pending_awbs: number;
  complete_awbs: number;
}
