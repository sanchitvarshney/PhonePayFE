export type RecordedVideo = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  width: number;
  height: number;
};

export type CameraErrorType = "permission" | "notFound" | "inUse" | "unsupported" | "unknown";

export type FacingMode = "environment" | "user";
