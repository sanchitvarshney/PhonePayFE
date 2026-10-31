import { getApiMessage } from "@/utils/getApiMessage";
import type { AwbCheckResult, DeliverySubmitResponse, SubmitDeliveryPayload } from "./deliveryType";

export const DELIVERY_FORM_FIELDS = {
  awb: "awb",
  itemName: "itemName",
  qty: "qty",
  remark: "remark",
  location: "location",
  video: "video",
} as const;

// The server trims and upper-cases the AWB; do the same so values compare equal.
export const normalizeAwb = (value: string) => value.trim().toUpperCase();

export const isAwbLimitReached = (info: AwbCheckResult | null) =>
  !!info && info.limit != null && info.entered >= info.limit;

export const buildDeliveryFormData = ({
  awb,
  itemName,
  qty,
  remark,
  location,
  video,
}: Omit<SubmitDeliveryPayload, "onUploadProgress">): FormData => {
  const formData = new FormData();
  formData.append(DELIVERY_FORM_FIELDS.awb, awb);
  formData.append(DELIVERY_FORM_FIELDS.itemName, itemName);
  formData.append(DELIVERY_FORM_FIELDS.qty, String(qty));
  formData.append(DELIVERY_FORM_FIELDS.remark, remark);
  formData.append(DELIVERY_FORM_FIELDS.location, location);
  formData.append(DELIVERY_FORM_FIELDS.video, video, video.name);
  return formData;
};

export const getDeliverySubmitResult = (
  body: DeliverySubmitResponse | undefined
): { ok: boolean; message: string } => {
  const ok = body?.success !== false;
  const fallback = ok ? "Wrong device saved successfully" : "Failed to save wrong device";
  return { ok, message: getApiMessage(body?.message, fallback) };
};
