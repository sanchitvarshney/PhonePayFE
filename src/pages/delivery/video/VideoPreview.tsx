import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { Icons } from "@/components/icons";
import { formatBytes, formatDuration } from "./video.config";
import type { RecordedVideo } from "./video.types";

type Props = {
  video: RecordedVideo | null;
  onRecord: () => void;
  onRetake: () => void;
  disabled?: boolean;
  error?: boolean;
};

const VideoPreview: React.FC<Props> = ({ video, onRecord, onRetake, disabled, error }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!video) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(video.blob);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  if (!video) {
    return (
      <button
        type="button"
        onClick={onRecord}
        disabled={disabled}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors active:scale-[0.99] disabled:opacity-50 ${
          error
            ? "border-red-400 bg-red-50/50 text-red-600"
            : "border-slate-300 bg-slate-50 text-cyan-700 hover:border-cyan-600 hover:bg-cyan-50"
        }`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-700 text-white">
          <VideocamOutlinedIcon fontSize="large" />
        </span>
        <span className="text-base font-semibold">Tap to record video</span>
        <span className="text-xs text-slate-500">Uses your device camera</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg bg-black">
        {src && (
          <video
            key={src}
            src={src}
            controls
            playsInline
            preload="metadata"
            className="mx-auto max-h-[50vh] w-full object-contain"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          {formatDuration(video.durationMs)} · {formatBytes(video.blob.size)}
        </span>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<Icons.refresh />}
          onClick={onRetake}
          disabled={disabled}
        >
          Retake
        </Button>
      </div>
    </div>
  );
};

export default React.memo(VideoPreview);
