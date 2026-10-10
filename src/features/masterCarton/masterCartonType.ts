export type MasterCartonFormValues = {
  product: string;
  color: string;
  mfgDate: string; 
  quantity: string;
  grossWeight: string; 
  range: string; 
};

export type MasterCartonDetails = Omit<MasterCartonFormValues, "range"> & {
  cartonId: string;
};

export type MasterCartonBatch = {
  values: MasterCartonFormValues;
  cartonIds: string[];
};

export type MasterCartonMode = "new" | "saved" | "reprint";

export type ApiEnvelope<T> = {
  success: boolean;
  code: number;
  status: string;
  message?: string;
  data: T;
};

export type MasterCartonRecord = {
  carton_no: string | string[];
  product: string | null;
  color: string | null;
  mfg_month: string | null; // "YYYY-MM"
  quantity: number | null;
  gross_weight: string | null; // "12.5 kg"
  reprint_count?: number;
  created_at?: string;
  seconds_left?: number;
};

export type LatestCartonResponse = {
  latest: MasterCartonRecord | null;
  nextCartonNo: string;
};

export type LatestCartonInfo = {
  latestCartonNo: string | null;
  nextCartonNo: string;
};

export type ReprintResult = MasterCartonBatch & {
  secondsLeft: number | null;
};
