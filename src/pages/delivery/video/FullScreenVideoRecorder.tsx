import React, { useEffect, useState } from "react";
import { Button, CircularProgress, IconButton } from "@mui/material";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import { Icons } from "@/components/icons";
import ConfirmDialog from "../ConfirmDialog";
import { useVideoRecorder } from "./useVideoRecorder";
import { VIDEO_CONFIG, formatDuration } from "./video.config";
import type { CameraErrorType, RecordedVideo } from "./video.types";

type Props = {
  onClose: () => void;
  onRecorded: (video: RecordedVideo) => void;
  onTooShort?: () => void;
};

const ERROR_MESSAGES: Record<CameraErrorType, { title: string; message: string }> = {
  permission: {
    title: "Camera access blocked",
    message:
      "Allow camera permission for this site in your browser settings, then tap Try Again.",
  },
  notFound: {
    title: "No camera found",
    message: "We couldn't find a camera on this device.",
  },
  inUse: {
    title: "Camera is busy",
    message: "Another app is using the camera. Close it and tap Try Again.",
  },
  unsupported: {
    title: "Recording not supported",
    message:
      typeof window !== "undefined" && !window.isSecureContext
        ? "The camera only works over a secure (HTTPS) connection."
        : "This browser can't record video. Please use the latest Chrome or Safari.",
  },
  unknown: {
    title: "Couldn't start the camera",
    message: "Something went wrong while opening the camera. Please try again.",
  },
};

const FullScreenVideoRecorder: React.FC<Props> = ({ onClose, onRecorded, onTooShort }) => {
  const {
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
  } = useVideoRecorder({ onRecorded, onTooShort });

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const handleBack = () => {
    if (isRecording) setConfirmDiscardOpen(true);
    else onClose();
  };

  // Lock page scroll behind the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const progress = Math.min(elapsedMs / VIDEO_CONFIG.maxDurationMs, 1);
  const remainingMs = Math.max(VIDEO_CONFIG.maxDurationMs - elapsedMs, 0);
  const errorInfo = error ? ERROR_MESSAGES[error] : null;

  return (
    <div className="fixed inset-0 z-[1300] flex h-[100dvh] flex-col bg-black text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))]">
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<Icons.left />}
          onClick={handleBack}
        >
          Back
        </Button>
        {isRecording ? (
          <span className="flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 font-mono text-sm font-semibold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {formatDuration(elapsedMs)}
          </span>
        ) : (
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            Record Video
          </span>
        )}
        <span className="w-[76px]" />
      </div>

      {isRecording && (
        <div className="h-1 w-full bg-white/10">
          <div
            className="h-full bg-red-500 transition-[width] duration-200 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Viewfinder */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {errorInfo ? (
          <div className="flex max-w-[320px] flex-col items-center gap-3 px-6 text-center">
            <VideocamOffOutlinedIcon sx={{ fontSize: 48 }} className="text-slate-400" />
            <span className="text-lg font-semibold">{errorInfo.title}</span>
            <span className="text-sm text-slate-300">{errorInfo.message}</span>
            {error !== "unsupported" && error !== "notFound" && (
              <Button
                variant="contained"
                startIcon={<Icons.refresh />}
                onClick={retryCamera}
                className="!mt-2"
              >
                Try Again
              </Button>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className="h-full w-full object-contain"
              style={facingMode === "user" ? { transform: "scaleX(-1)" } : undefined}
            />
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
                <CircularProgress size={40} sx={{ color: "white" }} />
                <span className="text-sm text-slate-300">Starting camera…</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-8 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
        <span className="w-12" />

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isReady || !!error}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white transition-transform active:scale-95 disabled:opacity-40"
          >
            <span
              className={`block bg-red-600 transition-all duration-200 ${
                isRecording ? "h-7 w-7 rounded-md" : "h-[60px] w-[60px] rounded-full"
              }`}
            />
          </button>
          <span className="text-xs tracking-wide text-slate-300">
            {isRecording
              ? `TAP TO STOP · ${formatDuration(remainingMs)} left`
              : `TAP TO RECORD · max ${Math.round(VIDEO_CONFIG.maxDurationMs / 1000)}s`}
          </span>
        </div>

        <IconButton
          onClick={toggleFacingMode}
          disabled={isRecording || !!error}
          aria-label="Switch camera"
          className="!h-12 !w-12 !bg-white/15 !text-white disabled:!opacity-40"
        >
          <FlipCameraAndroidIcon />
        </IconButton>
      </div>

      <ConfirmDialog
        open={confirmDiscardOpen}
        title="Discard recording?"
        message="The video you are recording will be lost. Do you want to go back?"
        confirmText="Discard"
        cancelText="Keep Recording"
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          onClose();
        }}
        onCancel={() => setConfirmDiscardOpen(false)}
      />
    </div>
  );
};

export default FullScreenVideoRecorder;
