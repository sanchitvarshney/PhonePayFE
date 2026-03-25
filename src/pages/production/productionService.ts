import axiosInstance from "@/api/axiosInstance";

export type StageConfig = {
  stage: string;
  manpower: number;
  details: string[];
};

export type ProductionEntry = {
  stage: string;
  manpower: number;
  detail: string;
  timeSlot: string;
  value: string;
};

export const TIME_SLOTS = [
  ...Array.from({ length: 24 }, (_, i) => {
    const start = String(i).padStart(2, "0");
    const endNum = i + 1; // show last slot as 23 TO 24 (not 23 TO 00)
    const end = endNum === 24 ? "24" : String(endNum).padStart(2, "0");
    return `${start} TO ${end}`;
  }),
];

export const STAGE_CONFIG: StageConfig[] = [
  { stage: "CHARGING", manpower: 2, details: ["Charging Ok", "Charging Defect"] },
  { stage: "FLASHING", manpower: 2, details: ["Flashing Ok", "Flashing Defect"] },
  { stage: "IQC", manpower: 3, details: ["IQC Ok(Refurb Line)", "IQC Repair", "IQC Defect"] },
  { stage: "REPAIR", manpower: 7, details: ["Repair OK", "Repair BR"] },
  { stage: "QR REMOVAL", manpower: 1, details: ["OK"] },
  { stage: "VI", manpower: 1, details: ["VI OK", "DEFECT"] },
  { stage: "CLENING", manpower: 10, details: ["QR OK", "QR Defect"] },
  { stage: "FQC", manpower: 2, details: ["OK", "NG"] },
  { stage: "QR PASTING", manpower: 1, details: ["OK", "NG"] },
  { stage: "CLIP STICKER", manpower: 2, details: ["OK", "NG"] },
  { stage: "SERIAL NO", manpower: 1, details: ["OK", "NG"] },
];

type FetchPayload = {
  startDate: string; // DD-MM-YYYY
  endDate: string; // DD-MM-YYYY
  module?: string;
  page?: number;
  limit?: number;
};

const extractRecords = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const toTrimmedString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
};

const getManpower = (r: any, stage: string): number => {
  if (typeof r?.manpower === "number") return r.manpower;
  return STAGE_CONFIG.find((x) => x.stage === stage)?.manpower ?? 0;
};

export const fetchProductionR4EntriesByDate = async (payload: FetchPayload): Promise<ProductionEntry[]> => {
  const module = payload.module ?? "PRODUCTION";
  const page = payload.page ?? 1;
  const limit = payload.limit ?? 10000;

  const response = await axiosInstance.get(
    `/report/r4/DATE?startDate=${payload.startDate}&endDate=${payload.endDate}&module=${module}&page=${page}&limit=${limit}`,
  );

  const records = extractRecords(response.data?.data ?? response.data);
  const out: ProductionEntry[] = [];

  for (const r of records) {
    const stage = toTrimmedString(r?.stage);
    const detail = toTrimmedString(r?.detail);
    const timeSlot = toTrimmedString(r?.timeSlot ?? r?.time_slot);
    const value = toTrimmedString(r?.value ?? r?.val);

    // Shape 1: flat records [{ stage, detail, timeSlot, value, manpower? }, ...]
    if (stage && detail && timeSlot && value) {
      out.push({
        stage,
        manpower: getManpower(r, stage),
        detail,
        timeSlot,
        value,
      });
      continue;
    }

    // Shape 2: excel-like rows [{ stage, detail, manpower?, "8 TO 9": "...", ... }, ...]
    if (stage && detail) {
      const manpower = getManpower(r, stage);
      for (const slot of TIME_SLOTS) {
        const cellValue = toTrimmedString(r?.[slot]);
        if (!cellValue) continue;
        out.push({
          stage,
          manpower,
          detail,
          timeSlot: slot,
          value: cellValue,
        });
      }
    }
  }

  return out;
};

export const buildProductionReportRows = (entries: ProductionEntry[]): Array<Record<string, string>> => {
  const lookup = new Map<string, string>();
  for (const e of entries) lookup.set(`${e.stage}|${e.detail}|${e.timeSlot}`, e.value);

  const rows: Array<Record<string, string>> = [];
  for (const config of STAGE_CONFIG) {
    for (const d of config.details) {
      const row: Record<string, string> = {
        stage: config.stage,
        manpower: String(config.manpower),
        detail: d,
      };
      for (const slot of TIME_SLOTS) {
        row[slot] = lookup.get(`${config.stage}|${d}|${slot}`) ?? "";
      }
      rows.push(row);
    }
  }
  return rows;
};

export type SaveProductionPayload = {
  date: string; // DD-MM-YYYY
  stage: string;
  manpower: number;
  detail: string;
  timeSlot: string;
  value?: string; // optional
  remarks?: string; // optional placeholder
};

export const saveProductionDummy = async (payload: SaveProductionPayload): Promise<void> => {
  await axiosInstance.post("/production/addProductionData", payload);
};

