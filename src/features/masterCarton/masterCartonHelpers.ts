import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";
import { MasterCartonFormValues } from "./masterCartonType";

dayjs.extend(customParseFormat);

export const MFG_DATE_FORMAT = "MMM YYYY";
const API_MONTH_FORMAT = "YYYY-MM";

export const CARTON_ID_PATTERN = /^[A-Za-z0-9\-_/]{1,40}$/;

export const MIN_STICKER_RANGE = 1;
export const MAX_STICKER_RANGE = 100;

export const validateStickerRange = (value: string): true | string => {
  const n = Number(value);
  if (!value || !Number.isInteger(n)) return "No. of Stickers is required";
  return (
    (n >= MIN_STICKER_RANGE && n <= MAX_STICKER_RANGE) ||
    `Enter a value between ${MIN_STICKER_RANGE} and ${MAX_STICKER_RANGE}`
  );
};

export const REPRINT_EXPIRED_MESSAGE = "Reprint window expired";

export const getDefaultCartonValues = (): MasterCartonFormValues => ({
  product: "Surface case",
  color: "White",
  mfgDate: dayjs().format(MFG_DATE_FORMAT),
  quantity: "100",
  grossWeight: "",
  range: "1",
});

export const parseMfgDate = (value: string) => {
  const parsed = dayjs(value, MFG_DATE_FORMAT, true);
  return parsed.isValid() ? parsed : null;
};

export const toApiMonth = (mfgDate: string): string | null => parseMfgDate(mfgDate)?.format(API_MONTH_FORMAT) ?? null;

export const fromApiMonth = (raw: string): string => {
  if (!raw) return "";
  const parsed = dayjs(raw, API_MONTH_FORMAT, true);
  return parsed.isValid() ? parsed.format(MFG_DATE_FORMAT) : raw;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
  statusMessages: Record<number, string> = {},
): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Network error. Please check your connection and try again.";
    const override = statusMessages[error.response.status];
    if (override) return override;
    const message = error.response.data?.message?.msg ?? error.response.data?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
};
