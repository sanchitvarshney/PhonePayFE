import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraErrorType, FacingMode, RecordedVideo } from "./video.types";
import {
  VIDEO_CONFIG,
  getRecorderMimeType,
  getTargetBitrate,
  isVideoRecordingSupported,
} from "./video.config";

type Params = {
  onRecorded: (video: RecordedVideo) => void;
  onTooShort?: () => void;
};

const mapCameraError = (error: unknown): CameraErrorType => {
  switch ((error as DOMException)?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "permission";
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return "notFound";
    case "NotReadableError":
    case "TrackStartError":
      return "inUse";
    default:
      return "unknown";
  }
};

// Records straight from the device camera with getUserMedia + MediaRecorder.
export const useVideoRecorder = ({ onRecorded, onTooShort }: Params) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const discardRef = useRef(false);
  const onRecordedRef = useRef(onRecorded);
  const onTooShortRef = useRef(onTooShort);
  onRecordedRef.current = onRecorded;
  onTooShortRef.current = onTooShort;

  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<CameraErrorType | null>(() =>
    isVideoRecordingSupported() ? null : "unsupported"
  );
  // Bumped to force a fresh getUserMedia attempt after an error.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isVideoRecordingSupported()) return;
    let cancelled = false;
    setIsReady(false);

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: VIDEO_CONFIG.maxLongEdge },
          height: { ideal: Math.round((VIDEO_CONFIG.maxLongEdge * 9) / 16) },
          frameRate: { ideal: VIDEO_CONFIG.frameRate, max: VIDEO_CONFIG.frameRate },
        },
      })
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        if (!cancelled) {
          setError(null);
          setIsReady(true);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(mapCameraError(err));
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [facingMode, attempt]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || recorderRef.current) return;

    const settings = stream.getVideoTracks()[0]?.getSettings() ?? {};
    const width = settings.width ?? 1280;
    const height = settings.height ?? 720;
    const mimeType = getRecorderMimeType();
    const options: MediaRecorderOptions = {
      videoBitsPerSecond: getTargetBitrate(width, height, settings.frameRate),
    };
    if (mimeType) options.mimeType = mimeType;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch {
      recorder = new MediaRecorder(stream);
    }

    chunksRef.current = [];
    discardRef.current = false;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const durationMs = Date.now() - startedAtRef.current;
      const type = recorder.mimeType || mimeType || "video/webm";
      const chunks = chunksRef.current;
      chunksRef.current = [];
      recorderRef.current = null;
      setIsRecording(false);
      setElapsedMs(0);
      if (discardRef.current) return;
      if (durationMs < VIDEO_CONFIG.minDurationMs || chunks.length === 0) {
        onTooShortRef.current?.();
        return;
      }
      onRecordedRef.current({
        blob: new Blob(chunks, { type }),
        mimeType: type,
        durationMs,
        width,
        height,
      });
    };

    recorderRef.current = recorder;
    recorder.start(1000);
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setIsRecording(true);
  }, []);

  // Auto-stop at the max duration.
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setElapsedMs(elapsed);
      if (elapsed >= VIDEO_CONFIG.maxDurationMs) stopRecording();
    }, 250);
    return () => clearInterval(id);
  }, [isRecording, stopRecording]);

  useEffect(() => {
    if (!isRecording) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") stopRecording();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRecording, stopRecording]);

  useEffect(
    () => () => {
      discardRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      recorderRef.current = null;
      chunksRef.current = [];
    },
    []
  );

  const toggleFacingMode = useCallback(() => {
    if (recorderRef.current) return;
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const retryCamera = useCallback(() => {
    if (!isVideoRecordingSupported()) return;
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return {
    videoRef,
    facingMode,
    isReady,
    isRecording,
    elapsedMs,
    error,
    startRecording,
    stopRecording,
    toggleFacingMode,
    retryCamera,
  };
};
