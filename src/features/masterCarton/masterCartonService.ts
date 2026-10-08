import axiosInstance from "@/api/axiosInstance";
import {
  ApiEnvelope,
  LatestCartonInfo,
  LatestCartonResponse,
  MasterCartonDetails,
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

const toDetails = (record: MasterCartonRecord): MasterCartonDetails => ({
  cartonId: str(record.carton_no),
  product: str(record.product),
  color: str(record.color),
  mfgDate: fromApiMonth(str(record.mfg_month)),
  quantity: str(record.quantity),
  // "12.5 kg" → "12.5"; the sticker adds the KG unit.
  grossWeight: str(record.gross_weight).replace(/\s*kg$/i, ""),
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

/** Issues the next unique carton number and saves the record (counts as the first print). */
export const createMasterCarton = async (values: MasterCartonFormValues): Promise<MasterCartonDetails> => {
  const response = await axiosInstance.post<ApiEnvelope<MasterCartonRecord>>(MASTER_CARTON_ENDPOINTS.create, {
    product: values.product.trim(),
    color: values.color.trim(),
    mfg_month: toApiMonth(values.mfgDate),
    quantity: Number(values.quantity),
    gross_weight: values.grossWeight ? `${values.grossWeight} kg` : null,
  });
  const data = unwrap(response.data);
  if (!data?.carton_no) throw new Error("Carton number was not returned by the server.");
  return toDetails(data);
};

/** Allowed only within 5 minutes of creation (403 afterwards, 404 if unknown). */
export const reprintMasterCarton = async (cartonNo: string): Promise<ReprintResult> => {
  const response = await axiosInstance.post<ApiEnvelope<MasterCartonRecord>>(MASTER_CARTON_ENDPOINTS.reprint, {
    carton_no: cartonNo,
  });
  const data = unwrap(response.data);
  if (!data?.carton_no) throw new Error(`No details found for carton "${cartonNo}".`);
  return {
    details: toDetails(data),
    secondsLeft: typeof data.seconds_left === "number" ? data.seconds_left : null,
  };
};
