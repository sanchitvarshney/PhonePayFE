import { useEffect, useRef, useState } from "react";
import { Button, CircularProgress, Dialog, IconButton } from "@mui/material";
import { Close, VideocamOffOutlined } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
};

// Native Shape Detection API (Chrome on Android); not in TS's DOM lib yet.
type DetectedBarcode = { rawValue: string };
type BarcodeDetectorInstance = {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
};
type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
};

const getBarcodeDetector = (): BarcodeDetectorCtor | undefined =>
  typeof window !== "undefined"
    ? (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
    : undefined;

// Native BarcodeDetector is used when available; otherwise ZXing (iOS Safari, Firefox, desktop Chrome on Windows).
export const isBarcodeScanSupported = (): boolean =>
  typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

const FORMATS = [
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "ean_13",
  "itf",
  "qr_code",
  "data_matrix",
];

const SCAN_INTERVAL_MS = 150;

// Reads one frame from the video; resolves to the decoded text, or undefined if nothing was found.
type FrameScanner = (video: HTMLVideoElement) => Promise<string | undefined>;

const createNativeScanner = async (): Promise<FrameScanner | null> => {
  const Detector = getBarcodeDetector();
  if (!Detector) return null;
  const supported = (await Detector.getSupportedFormats?.().catch(() => [])) ?? FORMATS;
  const formats = FORMATS.filter((f) => supported.includes(f));
  if (!formats.length) return null;
  const detector = new Detector({ formats });
  return async (video) => {
    const codes = await detector.detect(video);
    return codes.find((c) => c.rawValue?.trim())?.rawValue.trim();
  };
};

const createZxingScanner = async (): Promise<FrameScanner> => {
  // Loaded only when needed, so devices with native support don't download it.
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
    import("@zxing/browser"),
    import("@zxing/library"),
  ]);
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.CODABAR,
    BarcodeFormat.EAN_13,
    BarcodeFormat.ITF,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
  ]);
  const reader = new BrowserMultiFormatReader(hints);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  return async (video) => {
    if (!ctx || !video.videoWidth || !video.videoHeight) return undefined;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      return reader.decodeFromCanvas(canvas).getText().trim() || undefined;
    } catch {
      return undefined; // No barcode in this frame.
    }
  };
};

const getErrorMessage = (err: unknown) => {
  const name = (err as DOMException)?.name;
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "The camera only works over a secure (HTTPS) connection.";
  }
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera access is blocked. Allow camera permission for this site, then tap Try Again.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "We couldn't find a camera on this device.";
  }
  if (name === "NotReadableError") {
    return "Another app is using the camera. Close it and tap Try Again.";
  }
  return "Couldn't start the camera. Please try again.";
};

const AWBScannerDialog = ({ open, onClose, onScan }: Props) => {
  // Callback ref: the dialog renders in a portal, so the element may appear after the first effect.
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open || !video) return;

    let stream: MediaStream | null = null;
    let timer = 0;
    let cancelled = false;
    setReady(false);
    setError(null);

    const start = async () => {
      const scanFrame = (await createNativeScanner().catch(() => null)) ?? (await createZxingScanner());
      if (cancelled) return;

      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (cancelled) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      if (cancelled) return;
      setReady(true);

      const tick = async () => {
        if (cancelled) return;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          try {
            const text = await scanFrame(video);
            if (text && !cancelled) {
              cancelled = true;
              navigator.vibrate?.(80);
              onScanRef.current(text);
              return;
            }
          } catch {
            // Frame not decodable yet — keep trying.
          }
        }
        if (!cancelled) timer = window.setTimeout(tick, SCAN_INTERVAL_MS);
      };
      tick();
    };

    start().catch((err) => {
      if (!cancelled) setError(getErrorMessage(err));
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
  }, [open, video, attempt]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen PaperProps={{ sx: { bgcolor: "black" } }}>
      <div className="relative flex h-full w-full flex-col">
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-3">
          <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white">
            Scan AWB barcode
          </span>
          <IconButton onClick={onClose} sx={{ color: "white", bgcolor: "rgba(0,0,0,0.5)" }}>
            <Close />
          </IconButton>
        </div>

        <video
          ref={setVideo}
          className="h-full w-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {ready && !error && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
            <div className="relative h-[38%] w-full max-w-[420px] rounded-xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              <div className="absolute left-3 right-3 top-1/2 h-0.5 animate-pulse bg-red-500" />
            </div>
            <span className="text-center text-sm text-white">
              Place the AWB barcode inside the frame
            </span>
          </div>
        )}

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CircularProgress sx={{ color: "white" }} />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6 text-center">
            <VideocamOffOutlined sx={{ fontSize: 48 }} className="text-white" />
            <span className="text-sm text-slate-200">{error}</span>
            <div className="flex gap-2">
              <Button variant="contained" onClick={() => setAttempt((n) => n + 1)}>
                Try Again
              </Button>
              <Button variant="outlined" onClick={onClose} sx={{ color: "white", borderColor: "white" }}>
                Enter Manually
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default AWBScannerDialog;
