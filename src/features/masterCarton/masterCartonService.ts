import axiosInstance from "@/api/axiosInstance";
import {
  ApiEnvelope,
  LatestCartonInfo,
  LatestCartonResponse,
  MasterCartonBatch,
  MasterCartonFormValues,
  MasterCartonRecord,
  ReprintResult,
} from "./masterCartonType";
import { fromApiMonth, toApiMonth } from "./masterCartonHelpers";


const BASEURL = "/sticker";
export const MASTER_CARTON_ENDPOINTS = {
  latest: BASEURL + "/masterCarton/latest",
  create: BASEURL + "/masterCarton",
  reprint: BASEURL + "/masterCarton/reprint",
};

/** Returns `data`, or throws the API message when `success` is false. */
const unwrap = <T>(body: ApiEnvelope<T>): T => {
  if (!body?.success) throw new Error(body?.message || "Request failed. Please try again.");
  return body.data;
};

const str = (value: unknown): string => (value === null || value === undefined ? "" : String(value).trim());

/** `carton_no` is an array (one ID per sticker); a single string is accepted too. */
const toCartonIds = (raw: MasterCartonRecord["carton_no"]): string[] =>
  (Array.isArray(raw) ? raw : [raw]).map(str).filter(Boolean);

const toBatch = (record: MasterCartonRecord, cartonIds: string[]): MasterCartonBatch => ({
  cartonIds,
  values: {
    product: str(record.product),
    color: str(record.color),
    mfgDate: fromApiMonth(str(record.mfg_month)),
    quantity: str(record.quantity),
    // "12.5 kg" → "12.5"; the sticker adds the KG unit.
    grossWeight: str(record.gross_weight).replace(/\s*kg$/i, ""),
    range: String(cartonIds.length),
  },
});

/** Last issued number and a non-reserved preview of the next one. */
export const fetchLatestCarton = async (): Promise<LatestCartonInfo> => {
  const response = await axiosInstance.get<ApiEnvelope<LatestCartonResponse>>(MASTER_CARTON_ENDPOINTS.latest);
  const data = unwrap(response.data);
  return {
    latestCartonNo: data?.latest?.carton_no ? str(data.latest.carton_no) : null,
    nextCartonNo: str(data?.nextCartonNo),
  };
};

/** Issues `range` new unique carton numbers and saves them (counts as the first print). */
export const createMasterCarton = async (values: MasterCartonFormValues): Promise<MasterCartonBatch> => {
  const response = await axiosInstance.post<ApiEnvelope<MasterCartonRecord>>(MASTER_CARTON_ENDPOINTS.create, {
    product: values.product.trim(),
    color: values.color.trim(),
    mfg_month: toApiMonth(values.mfgDate),
    quantity: Number(values.quantity),
    gross_weight: values.grossWeight ? `${values.grossWeight} kg` : null,
    range: Number(values.range),
  });
  const data = unwrap(response.data);
  const cartonIds = toCartonIds(data?.carton_no);
  if (!cartonIds.length) throw new Error("Carton number was not returned by the server.");
  return toBatch(data, cartonIds);
};

export const reprintMasterCarton = async (cartonNo: string, range: number): Promise<ReprintResult> => {
  const response = await axiosInstance.post<ApiEnvelope<MasterCartonRecord>>(MASTER_CARTON_ENDPOINTS.reprint, {
    carton_no: cartonNo,
    range,
  });
  const data = unwrap(response.data);
  const cartonIds = toCartonIds(data?.carton_no);
  if (!cartonIds.length) throw new Error(`No details found for carton "${cartonNo}".`);
  return {
    ...toBatch(data, cartonIds),
    secondsLeft: typeof data.seconds_left === "number" ? data.seconds_left : null,
  };
};
