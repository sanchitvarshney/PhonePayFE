import { getApiMessage } from "@/utils/getApiMessage";
import type { DeliverySubmitResponse, SubmitDeliveryPayload } from "./deliveryType";


export const DELIVERY_FORM_FIELDS = {
  awb: "awb",
  deliveryPartner: "delivery_partner",
  remark: "remark",
  videoDuration: "video_duration",
  video: "video",
} as const;

export const buildDeliveryFormData = ({
  awb,
  deliveryPartner,
  remark,
  video,
  durationMs,
}: Omit<SubmitDeliveryPayload, "onUploadProgress">): FormData => {
  const formData = new FormData();
  formData.append(DELIVERY_FORM_FIELDS.awb, awb);
  formData.append(DELIVERY_FORM_FIELDS.deliveryPartner, deliveryPartner);
  formData.append(DELIVERY_FORM_FIELDS.remark, remark);
  formData.append(DELIVERY_FORM_FIELDS.videoDuration, String(Math.round(durationMs / 1000)));
  formData.append(DELIVERY_FORM_FIELDS.video, video, video.name);
  return formData;
};


export const getDeliverySubmitResult = (
  body: DeliverySubmitResponse | undefined
): { ok: boolean; message: string } => {
  const ok = body?.success !== false;
  const fallback = ok
    ? "Delivery details submitted successfully"
    : "Failed to submit delivery details";
  return { ok, message: getApiMessage(body?.message, fallback) };
};
