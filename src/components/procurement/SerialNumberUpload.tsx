import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Icons } from "@/components/icons";

export interface SerialNumberUploadProps {
  onSerialNumbersChange: (serials: string[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
  /** Tailwind classes for the serial preview table wrapper (e.g. max height + scroll). */
  serialPreviewWrapperClassName?: string;
}

function normalizeHeader(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export default function SerialNumberUpload({
  onSerialNumbersChange,
  disabled = false,
  disabledMessage = "",
  serialPreviewWrapperClassName,
}: SerialNumberUploadProps) {
  const [error, setError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [serials, setSerials] = useState<string[]>([]);

  const rows = useMemo(
    () => serials.map((s, i) => ({ sn: i + 1, value: s })),
    [serials],
  );

  const parseFile = async (file: File) => {
    setError("");
    setFileName(file.name);

    const buf = await file.arrayBuffer();
    const workbook = XLSX.read(buf, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    if (!data || data.length === 0) {
      throw new Error("Empty file");
    }

    const headerRow = data[0] || [];
    const colIdx = headerRow.findIndex((h) => normalizeHeader(h) === "serialno");
    if (colIdx === -1) {
      throw new Error('Column "serialno" not found');
    }

    const extracted = data
      .slice(1)
      .map((r) => String((r || [])[colIdx] ?? "").trim())
      .filter(Boolean);

    setSerials(extracted);
    onSerialNumbersChange(extracted);
  };

  return (
    <div className="border border-neutral-200 rounded-md p-[20px] bg-white">
      <div className="flex items-center justify-between gap-[10px]">
        <div className="flex items-center gap-[8px]">
          <Icons.uploadfile />
          <Typography variant="inherit" fontWeight={600}>
            Upload Serial Numbers
          </Typography>
        </div>
        <LoadingButton
          component="label"
          variant="contained"
          startIcon={<Icons.uploadfile />}
          disabled={disabled}
        >
          Upload File
          <input
            type="file"
            hidden
            accept=".xlsx,.xls,.csv"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                await parseFile(f);
              } catch (err: any) {
                const msg = err?.message || "Failed to parse file";
                setError(msg);
                setSerials([]);
                onSerialNumbersChange([]);
              } finally {
                e.target.value = "";
              }
            }}
          />
        </LoadingButton>
      </div>

      <div className="pt-[10px] flex flex-col gap-[10px]">
        <TextField
          variant="filled"
          label="Uploaded File"
          value={fileName || ""}
          InputProps={{ readOnly: true }}
          fullWidth
        />

        {error ? (
          <Typography variant="inherit" className="text-red-600">
            {error}
          </Typography>
        ) : disabled && disabledMessage ? (
          <Typography variant="inherit" className="text-amber-600">
            {disabledMessage}
          </Typography>
        ) : (
          <Typography variant="inherit" className="text-slate-600">
            Total Serial Numbers: {serials.length}
          </Typography>
        )}

        {serials.length > 0 && (
          <div
            className={
              serialPreviewWrapperClassName
                ? `overflow-auto ${serialPreviewWrapperClassName}`
                : "overflow-x-auto"
            }
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-[10px] py-[8px] font-[500]">S.No</th>
                  <th className="px-[10px] py-[8px] font-[500]">
                    Serial Number
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.sn}-${r.value}`}>
                    <td className="px-[10px] py-[8px] w-[70px]">{r.sn}</td>
                    <td className="px-[10px] py-[8px]">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

