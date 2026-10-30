import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/hooks/useReduxHook";
import { showToast } from "@/utils/toasterContext";
import { submitDelivery } from "@/features/delivery/deliverySlice";
import { getDeliverySubmitResult } from "@/features/delivery/delivery.utils";
import { prepareVideoForUpload } from "./video/compressVideo";
import { VIDEO_CONFIG, formatBytes } from "./video/video.config";
import type { RecordedVideo } from "./video/video.types";

export type SubmitPhase = "idle" | "processing" | "uploading";

type DeliveryDetails = {
  awb: string;
  deliveryPartner: string;
  remark: string;
};

const toFileSafe = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "") || "awb";

export const useDeliverySubmit = () => {
  const dispatch = useAppDispatch();
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [progress, setProgress] = useState(0); // 0–100
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastPctRef = useRef(-1);

  const updateProgress = useCallback((ratio: number) => {
    const pct = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
    if (pct === lastPctRef.current) return;
    lastPctRef.current = pct;
    setProgress(pct);
  }, []);

  const startPhase = useCallback((next: SubmitPhase) => {
    lastPctRef.current = -1;
    setProgress(0);
    setPhase(next);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (phase === "idle") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase]);

  const submit = useCallback(
    async (details: DeliveryDetails, video: RecordedVideo): Promise<boolean> => {
      if (busyRef.current) return false;
      busyRef.current = true;
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        startPhase("processing");
        const file = await prepareVideoForUpload(
          video,
          `delivery_${toFileSafe(details.awb)}_${Date.now()}`,
          { signal: controller.signal, onProgress: updateProgress }
        );

        if (file.size > VIDEO_CONFIG.maxUploadBytes) {
          showToast(
            `Video is too large (${formatBytes(file.size)}). Please record a shorter clip.`,
            "error"
          );
          return false;
        }

        startPhase("uploading");
        const result = await dispatch(
          submitDelivery({
            ...details,
            video: file,
            durationMs: video.durationMs,
            onUploadProgress: (e) => {
              if (e.total) updateProgress(e.loaded / e.total);
            },
          })
        );

        if (submitDelivery.fulfilled.match(result)) {
          const { ok, message } = getDeliverySubmitResult(result.payload);
          showToast(message, ok ? "success" : "error");
          return ok;
        }
        return false;
      } catch (error) {
        if ((error as DOMException)?.name !== "AbortError") {
          showToast("Couldn't process the video. Please retake and try again.", "error");
        }
        return false;
      } finally {
        busyRef.current = false;
        abortRef.current = null;
        setPhase("idle");
        setProgress(0);
      }
    },
    [dispatch, startPhase, updateProgress]
  );

  return { phase, progress, isBusy: phase !== "idle", submit };
};
