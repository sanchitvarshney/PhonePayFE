export type MasterCartonFormValues = {
  product: string;
  color: string;
  mfgDate: string; // "MMM YYYY", e.g. "Oct 2026"
  quantity: string;
  grossWeight: string; // KG
};

export type MasterCartonDetails = MasterCartonFormValues & {
  cartonId: string;
};

/** "new" = not yet issued; "saved" = issued by POST /masterCarton; "reprint" = loaded via reprint API. */
export type MasterCartonMode = "new" | "saved" | "reprint";

export type ApiEnvelope<T> = {
  success: boolean;
  code: number;
  status: string;
  message?: string;
  data: T;
};

export type MasterCartonRecord = {
  carton_no: string;
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

export type ReprintResult = {
  details: MasterCartonDetails;
  secondsLeft: number | null;
};
