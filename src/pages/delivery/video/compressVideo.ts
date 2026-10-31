import type { RecordedVideo } from "./video.types";
import {
  VIDEO_CONFIG,
  getRecorderMimeType,
  getTargetBitrate,
  getVideoExtension,
} from "./video.config";

type CompressOptions = {
  onProgress?: (ratio: number) => void;
  signal?: AbortSignal;
};

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

const fitWithin = (width: number, height: number, maxLongEdge: number) => {
  const scale = Math.min(1, maxLongEdge / Math.max(width, height));
  const even = (n: number) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return { width: even(width), height: even(height) };
};


export const needsCompression = (video: RecordedVideo): boolean => {
  if (video.blob.size < VIDEO_CONFIG.compressMinBytes) return false;
  const seconds = Math.max(video.durationMs / 1000, 1);
  const actualBitrate = (video.blob.size * 8) / seconds;
  const { width, height } = fitWithin(video.width, video.height, VIDEO_CONFIG.maxLongEdge);
  const target = getTargetBitrate(width, height);
  return (
    actualBitrate > target * VIDEO_CONFIG.bitrateTolerance ||
    Math.max(video.width, video.height) > VIDEO_CONFIG.maxLongEdge
  );
};


const reencodeVideo = (source: RecordedVideo, { onProgress, signal }: CompressOptions) =>
  new Promise<Blob>((resolve, reject) => {
    const url = URL.createObjectURL(source.blob);
    const video = document.createElement("video") as VideoWithFrameCallback;
    const chunks: Blob[] = [];
    let recorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let frameHandle = 0;
    let finished = false;

    const cleanup = () => {
      finished = true;
      if (video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(frameHandle);
      cancelAnimationFrame(frameHandle);
      stream?.getTracks().forEach((track) => track.stop());
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
      URL.revokeObjectURL(url);
      signal?.removeEventListener("abort", onAbort);
    };

    const fail = (error: Error) => {
      if (finished) return;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      cleanup();
      reject(error);
    };

    function onAbort() {
      fail(new DOMException("Compression cancelled", "AbortError"));
    }

    if (signal?.aborted) return onAbort();
    signal?.addEventListener("abort", onAbort);

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(video);
    video.onerror = () => fail(new Error("Unable to read the recorded video"));

    video.onloadedmetadata = () => {
      const { width, height } = fitWithin(
        video.videoWidth || source.width,
        video.videoHeight || source.height,
        VIDEO_CONFIG.maxLongEdge
      );
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx || typeof canvas.captureStream !== "function") {
        fail(new Error("Video compression is not supported on this browser"));
        return;
      }

      stream = canvas.captureStream(VIDEO_CONFIG.frameRate);
      const mimeType = getRecorderMimeType();
      const options: MediaRecorderOptions = {
        videoBitsPerSecond: getTargetBitrate(width, height),
      };
      if (mimeType) options.mimeType = mimeType;
      recorder = new MediaRecorder(stream, options);
      const activeRecorder = recorder;

      activeRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      activeRecorder.onstop = () => {
        const type = activeRecorder.mimeType || mimeType || source.mimeType;
        cleanup();
        resolve(new Blob(chunks, { type }));
      };

      const totalSeconds =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : source.durationMs / 1000;

      const draw = () => {
        if (finished) return;
        ctx.drawImage(video, 0, 0, width, height);
        onProgress?.(Math.min(video.currentTime / totalSeconds, 0.99));
        scheduleFrame();
      };
      const scheduleFrame = () => {
        frameHandle = video.requestVideoFrameCallback
          ? video.requestVideoFrameCallback(draw)
          : requestAnimationFrame(draw);
      };

      video.onended = () => {
        if (finished) return;
        ctx.drawImage(video, 0, 0, width, height);
        onProgress?.(1);
        if (activeRecorder.state !== "inactive") activeRecorder.stop();
      };

      activeRecorder.start(1000);
      video
        .play()
        .then(scheduleFrame)
        .catch(() => fail(new Error("Unable to process the recorded video")));
    };

    video.src = url;
  });


export const prepareVideoForUpload = async (
  video: RecordedVideo,
  fileBaseName: string,
  options: CompressOptions = {}
): Promise<File> => {
  let output: Blob = video.blob;

  if (needsCompression(video)) {
    try {
      const compressed = await reencodeVideo(video, options);
      if (compressed.size > 0 && compressed.size < video.blob.size * 0.9) {
        output = compressed;
      }
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") throw error;
      console.warn("Video compression skipped:", error);
    }
  }
  options.onProgress?.(1);

  const type = output.type || video.mimeType;
  return new File([output], `${fileBaseName}.${getVideoExtension(type)}`, { type });
};
