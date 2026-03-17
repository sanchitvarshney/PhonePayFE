import React, { useRef, useEffect, useCallback, useState } from "react";
import { TextField, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

/** Uppercase + lowercase (exclude I,O,i,l for clarity) + digits */
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789";
const LENGTH = 5;

export const generateCode = (): string => {
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
};

const drawCaptcha = (canvasRef: React.RefObject<HTMLCanvasElement | null>, code: string) => {
  if (!canvasRef?.current || !code) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const width = 180;
  const height = 56;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);

  ctx.fillStyle = "#f0f2f5";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(${80 + Math.random() * 80},${80 + Math.random() * 80},${80 + Math.random() * 80},0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(${100 + Math.random() * 100},${100 + Math.random() * 100},${100 + Math.random() * 100},0.4)`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }

  const letterWidth = width / (code.length + 1);
  ctx.font = "bold 24px Arial";
  code.split("").forEach((char, i) => {
    ctx.save();
    const x = letterWidth * (i + 0.6) + (Math.random() * 8 - 4);
    const y = 28 + (Math.random() * 8 - 4);
    ctx.translate(x, y);
    ctx.rotate(Math.random() * 0.4 - 0.2);
    ctx.fillStyle = `rgb(${30 + Math.random() * 60},${30 + Math.random() * 60},${30 + Math.random() * 60})`;
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
};

export const CAPTCHA_LENGTH = LENGTH;

export type ImageCaptchaProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCodeChange?: (code: string) => void;
  onRefresh?: () => void;
  placeholder?: string;
  inputStyle?: React.CSSProperties;
};

/**
 * Client-side image captcha (no backend, no third party).
 * Renders random letters on a canvas; user types what they see.
 */
const ImageCaptcha: React.FC<ImageCaptchaProps> = ({
  value = "",
  onChange,
  onCodeChange,
  onRefresh,
  placeholder = "Enter text shown above",
  inputStyle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState(() => generateCode());

  const refresh = useCallback(() => {
    const newCode = generateCode();
    setCode(newCode);
    drawCaptcha(canvasRef, newCode);
    onCodeChange?.(newCode);
    onRefresh?.();
  }, [onCodeChange, onRefresh]);

  useEffect(() => {
    drawCaptcha(canvasRef, code);
  }, [code]);

  useEffect(() => {
    onCodeChange?.(code);
  }, [code, onCodeChange]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            display: "block",
          }}
        />
        <IconButton onClick={refresh} size="small" title="Refresh captcha" aria-label="Refresh captcha">
          <RefreshIcon fontSize="small" />
        </IconButton>
      </div>
      <TextField
        value={value}
        size="small"
        onChange={onChange}
        placeholder={placeholder}
        slotProps={{ htmlInput: { maxLength: LENGTH, autoComplete: "off" } }}
        style={{ width: 180, ...inputStyle }}
        variant="outlined"
      />
    </div>
  );
};

export default ImageCaptcha;
