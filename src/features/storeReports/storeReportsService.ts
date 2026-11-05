import axiosInstance from "@/api/axiosInstance";
import type {
  PartnerOption,
  StoreReportParams,
  StoreReportResponse,
} from "./storeReportsTypes";

export const STORE_REPORT_PATHS = {
  awbReceivedVsEntered: "/report/awb-received-vs-entered",
  awbPending: "/report/awb-pending",
  serialInward: "/report/awb-serial-inward",
  wrongDevice: "/report/awb-wrong-device",
  partnerSummary: "/report/awb-partner-summary",
} as const;

export type StoreReportPath = (typeof STORE_REPORT_PATHS)[keyof typeof STORE_REPORT_PATHS];

const PARTNERS_PATH = "/store/awb-serial/wrong-device/partners";

export const STORE_REPORT_MAX_DAYS = 92;
export const STORE_REPORT_MAX_LIMIT = 500;

// Drops empty filters so the server only sees what the user picked.
const cleanParams = (params: StoreReportParams) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

export const fetchStoreReport = async <T>(
  path: StoreReportPath,
  params: StoreReportParams,
  signal?: AbortSignal
): Promise<StoreReportResponse<T>> => {
  const response = await axiosInstance.get<StoreReportResponse<T>>(path, {
    params: cleanParams(params),
    signal,
  });
  return response.data;
};

// Paged reports return at most 500 rows per call, so export walks every page.
export const fetchAllStoreReportRows = async <T>(
  path: StoreReportPath,
  params: StoreReportParams,
  paged: boolean
): Promise<T[]> => {
  if (!paged) return (await fetchStoreReport<T>(path, params)).data ?? [];

  const rows: T[] = [];
  for (let page = 1; ; page++) {
    const res = await fetchStoreReport<T>(path, {
      ...params,
      page,
      limit: STORE_REPORT_MAX_LIMIT,
    });
    const data = res.data ?? [];
    rows.push(...data);
    const total = res.total ?? rows.length;
    if (data.length < STORE_REPORT_MAX_LIMIT || rows.length >= total) return rows;
  }
};

type RawPartner = Record<string, unknown>;

// Accepts { key, name }, { code, name }, { value, text } or { partner_code, partner_name }.
const toPartnerOption = (p: RawPartner): PartnerOption => {
  const key = String(p.key ?? p.code ?? p.value ?? p.partner_code ?? "");
  const name = String(p.name ?? p.text ?? p.partner_name ?? key);
  return { key, name };
};

// Every report tab shares one partners request.
let partnersRequest: Promise<PartnerOption[]> | null = null;

export const fetchPartners = (): Promise<PartnerOption[]> => {
  partnersRequest ??= axiosInstance
    .get<{ data?: RawPartner[] }>(PARTNERS_PATH)
    .then((res) => (res.data?.data ?? []).map(toPartnerOption).filter((p) => p.key))
    .catch((err) => {
      partnersRequest = null;
      throw err;
    });
  return partnersRequest;
};
