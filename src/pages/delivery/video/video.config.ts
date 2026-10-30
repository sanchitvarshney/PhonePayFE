export const VIDEO_CONFIG = {
  maxDurationMs: 20_000,
  minDurationMs: 1_500,
  maxLongEdge: 1280,
  frameRate: 30,
  bitsPerPixel: 0.1,
  minBitrate: 1_000_000,
  maxBitrate: 3_000_000,
  compressMinBytes: 4 * 1024 * 1024,
  bitrateTolerance: 1.5,
  maxUploadBytes: 100 * 1024 * 1024,
};

const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E",
  "video/mp4;codecs=avc1",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

export const isVideoRecordingSupported = (): boolean =>
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== "undefined";

export const getRecorderMimeType = (): string | undefined =>
  MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported?.(type));

export const getTargetBitrate = (
  width = 1280,
  height = 720,
  frameRate = VIDEO_CONFIG.frameRate
): number => {
  const fps = Math.min(frameRate || VIDEO_CONFIG.frameRate, VIDEO_CONFIG.frameRate);
  const raw = width * height * fps * VIDEO_CONFIG.bitsPerPixel;
  return Math.round(
    Math.min(VIDEO_CONFIG.maxBitrate, Math.max(VIDEO_CONFIG.minBitrate, raw))
  );
};

export const getVideoExtension = (mimeType: string): string => {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("quicktime")) return "mov";
  return "webm";
};

export const formatDuration = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const formatBytes = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
