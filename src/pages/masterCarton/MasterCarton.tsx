import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
import {
  Alert,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Tooltip,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrintIcon from "@mui/icons-material/Print";
import ReplayIcon from "@mui/icons-material/Replay";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { showToast } from "@/utils/toasterContext";
import MasterCartonSticker from "@/components/masterCarton/MasterCartonSticker";
import StickerPrintPortal, {
  printSticker,
} from "@/components/masterCarton/StickerPrintPortal";
import ReprintCartonDialog from "@/components/masterCarton/ReprintCartonDialog";
import {
  createMasterCarton,
  fetchLatestCarton,
  reprintMasterCarton,
} from "@/features/masterCarton/masterCartonService";
import {
  MAX_STICKER_RANGE,
  MFG_DATE_FORMAT,
  REPRINT_EXPIRED_MESSAGE,
  getApiErrorMessage,
  getDefaultCartonValues,
  parseMfgDate,
  validateStickerRange,
} from "@/features/masterCarton/masterCartonHelpers";
import {
  LatestCartonInfo,
  MasterCartonBatch,
  MasterCartonDetails,
  MasterCartonFormValues,
  MasterCartonMode,
  ReprintResult,
} from "@/features/masterCarton/masterCartonType";

type LatestState = {
  status: "loading" | "ready" | "error";
  info: LatestCartonInfo | null;
  error: string;
};

const STICKER_PX_WIDTH = (100 * 96) / 25.4;
const STICKER_PX_HEIGHT = (75 * 96) / 25.4;
const MAX_PREVIEW_SCALE = 1.4;

const MODE_CHIP: Record<
  MasterCartonMode,
  { label: string; color: "primary" | "success" | "warning" }
> = {
  new: { label: "New Carton", color: "primary" },
  saved: { label: "Created", color: "success" },
  reprint: { label: "Reprint", color: "warning" },
};

const StepHeader: React.FC<{
  step: number;
  title: string;
  subtitle: string;
  extra?: React.ReactNode;
}> = ({ step, title, subtitle, extra }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-3">
      <span className="mt-[2px] h-7 w-7 shrink-0 rounded-full bg-[#5F259F] text-white text-sm font-semibold grid place-items-center">
        {step}
      </span>
      <div>
        <h2 className="text-base font-semibold text-slate-800 leading-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    {extra}
  </div>
);

const FieldGroup: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <fieldset className="flex flex-col gap-[12px]">
    <legend className="mb-[10px] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {title}
    </legend>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">{children}</div>
  </fieldset>
);

const InfoTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}> = ({ icon, label, value, hint }) => (
  <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-[14px] py-[10px] min-w-0">
    <span className="h-9 w-9 shrink-0 rounded-md bg-[#5F259F]/10 text-[#5F259F] grid place-items-center">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
        {label}
        {hint && (
          <Tooltip title={hint} arrow>
            <InfoOutlinedIcon
              sx={{ fontSize: 13 }}
              className="text-slate-400"
            />
          </Tooltip>
        )}
      </p>
      <div className="text-[15px] font-semibold text-slate-800 truncate">
        {value}
      </div>
    </div>
  </div>
);

const ScaledPreview: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(
        Math.min(
          MAX_PREVIEW_SCALE,
          width / STICKER_PX_WIDTH,
          height / STICKER_PX_HEIGHT,
        ),
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div
        className="bg-white rounded-sm shadow-[0_10px_30px_rgba(15,23,42,0.18)] ring-1 ring-black/5"
        style={{
          width: STICKER_PX_WIDTH * scale,
          height: STICKER_PX_HEIGHT * scale,
        }}
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const formatCartonRange = (cartonIds: string[]) =>
  cartonIds.length > 1
    ? `${cartonIds[0]} – ${cartonIds[cartonIds.length - 1]} (${cartonIds.length})`
    : (cartonIds[0] ?? "");

const NewCartonPreviewNote: React.FC<{
  control: Control<MasterCartonFormValues>;
}> = ({ control }) => {
  const range = Number(useWatch({ control, name: "range" })) || 1;
  return (
    <Alert severity="info" variant="outlined" sx={{ py: 0 }}>
      <strong>Preview only</strong> — this is how one sticker will look.{" "}
      {range > 1
        ? `When you click Print, ${range} stickers will print, each with its own Carton ID and barcode.`
        : "The Carton ID and barcode are added when you click Print."}
    </Alert>
  );
};

const StickerOutput: React.FC<{
  control: Control<MasterCartonFormValues>;
  cartonIds: string[];
}> = ({ control, cartonIds }) => {
  const values = useWatch({ control });
  const base = useMemo<Omit<MasterCartonDetails, "cartonId">>(
    () => ({
      product: values.product?.trim() ?? "",
      color: values.color?.trim() ?? "",
      mfgDate: values.mfgDate ?? "",
      quantity: values.quantity ?? "",
      grossWeight: values.grossWeight ?? "",
    }),
    [
      values.product,
      values.color,
      values.mfgDate,
      values.quantity,
      values.grossWeight,
    ],
  );
  const printIds = cartonIds.length ? cartonIds : [""];

  return (
    <>
      <ScaledPreview>
        <MasterCartonSticker details={{ ...base, cartonId: printIds[0] }} />
      </ScaledPreview>
      <StickerPrintPortal>
        {printIds.map((id, index) => (
          <div key={id || index} className="mc-print-page">
            <MasterCartonSticker details={{ ...base, cartonId: id }} />
          </div>
        ))}
      </StickerPrintPortal>
    </>
  );
};

const MasterCarton: React.FC = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MasterCartonFormValues>({
    defaultValues: getDefaultCartonValues(),
    mode: "onTouched",
  });

  const [mode, setMode] = useState<MasterCartonMode>("new");
  const [cartonIds, setCartonIds] = useState<string[]>([]);
  const [latest, setLatest] = useState<LatestState>({
    status: "loading",
    info: null,
    error: "",
  });
  const [saving, setSaving] = useState(false);
  const [reprintOpen, setReprintOpen] = useState(false);
  const [printRequest, setPrintRequest] = useState(0);

  const loadLatest = useCallback(async () => {
    setLatest({ status: "loading", info: null, error: "" });
    try {
      setLatest({
        status: "ready",
        info: await fetchLatestCarton(),
        error: "",
      });
    } catch (error) {
      setLatest({
        status: "error",
        info: null,
        error: getApiErrorMessage(
          error,
          "Unable to load the latest carton number.",
        ),
      });
    }
  }, []);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  useEffect(() => {
    if (!printRequest) return;
    const frame = requestAnimationFrame(() => printSticker());
    return () => cancelAnimationFrame(frame);
  }, [printRequest]);

  const applyAndPrint = (
    { values, cartonIds: issuedIds }: MasterCartonBatch,
    nextMode: MasterCartonMode,
  ) => {
    reset(values);
    setCartonIds(issuedIds);
    setMode(nextMode);
    setPrintRequest((n) => n + 1);
  };

  const startNewCarton = () => {
    reset(getDefaultCartonValues());
    setCartonIds([]);
    setMode("new");
    loadLatest();
  };

  const createAndPrint = handleSubmit(
    async (values) => {
      setSaving(true);
      try {
        const batch = await createMasterCarton(values);
        applyAndPrint(batch, "saved");
        showToast(
          `${batch.cartonIds.length > 1 ? "Cartons" : "Carton"} ${formatCartonRange(batch.cartonIds)} created`,
          "success",
        );
      } catch (error) {
        showToast(
          getApiErrorMessage(error, "Unable to create the master carton."),
          "error",
        );
      } finally {
        setSaving(false);
      }
    },
    () => showToast("Please fill all required fields correctly", "error"),
  );

  const reprintCurrent = async () => {
    setSaving(true);
    try {
      const batch = await reprintMasterCarton(
        cartonIds[0],
        cartonIds.length,
      );
      applyAndPrint(batch, mode);
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Unable to reprint this carton.", {
          403: REPRINT_EXPIRED_MESSAGE,
        }),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (saving) return;
    if (mode === "new") createAndPrint();
    else reprintCurrent();
  };

  const shortcutPrintRef = useRef<() => void>(() => {});
  shortcutPrintRef.current = () => {
    if (!reprintOpen) handlePrint();
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        shortcutPrintRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleReprintLoaded = (batch: ReprintResult) => {
    setReprintOpen(false);
    applyAndPrint(batch, "reprint");
    showToast(
      `Reprinting ${batch.cartonIds.length > 1 ? "cartons" : "carton"} ${formatCartonRange(batch.cartonIds)}`,
      "success",
    );
  };

  const locked = mode !== "new";
  const requiredText = (label: string) => ({
    validate: (value: string) => value.trim() !== "" || `${label} is required`,
  });

  return (
    <div className="h-[calc(100vh-55px)] w-full flex flex-col bg-[#faf5ff] overflow-y-auto lg:overflow-hidden">
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-[16px] md:px-[24px] py-[12px] bg-white border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-lg bg-[#5F259F]/10 text-[#5F259F] grid place-items-center">
            <Inventory2OutlinedIcon />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 leading-tight">
              Master Carton Sticker
            </h1>
            <p className="text-xs text-slate-500">
              Create and print 100 × 75 mm master carton labels
            </p>
          </div>
          <Chip
            size="small"
            label={MODE_CHIP[mode].label}
            color={MODE_CHIP[mode].color}
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </div>
        <div className="flex items-center gap-2">
          {mode !== "new" && (
            <Button
              variant="text"
              startIcon={<AddIcon />}
              disabled={saving}
              onClick={startNewCarton}
            >
              New Carton
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            disabled={saving}
            onClick={() => setReprintOpen(true)}
          >
            Reprint
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-[16px] md:gap-[20px] p-[12px] md:p-[20px]">
        {/* LEFT: details form */}
        <section
          aria-label="Enter details"
          className="min-h-0 flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto p-[16px] md:p-[22px] flex flex-col gap-[20px]">
            <StepHeader
              step={1}
              title="Enter Details"
              subtitle={
                locked
                  ? "This carton is issued — details are read-only"
                  : "Fill in the carton details. Fields marked * are required."
              }
            />

            <div aria-live="polite">
              {mode === "new" ? (
                <>
                  {latest.status === "loading" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                      <Skeleton variant="rounded" height={58} />
                      <Skeleton variant="rounded" height={58} />
                    </div>
                  )}
                  {latest.status === "error" && (
                    <Alert
                      severity="error"
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={loadLatest}
                        >
                          Retry
                        </Button>
                      }
                    >
                      {latest.error}
                    </Alert>
                  )}
                  {latest.status === "ready" && latest.info && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                      <InfoTile
                        icon={<HistoryOutlinedIcon fontSize="small" />}
                        label="Last Issued"
                        value={latest.info.latestCartonNo ?? "—"}
                      />
                      <InfoTile
                        icon={<TagOutlinedIcon fontSize="small" />}
                        label="Next Number"
                        hint="Preview only — not reserved. The final number is issued when you click PRINT."
                        value={
                          <span className="flex items-center gap-1">
                            <span className="truncate">
                              {latest.info.nextCartonNo || "—"}
                            </span>
                            <Tooltip title="Refresh">
                              <IconButton
                                size="small"
                                onClick={loadLatest}
                                aria-label="Refresh latest carton number"
                              >
                                <RefreshIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </span>
                        }
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-[#5F259F]/20 bg-[#5F259F]/[0.04] px-[16px] py-[12px] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 shrink-0 rounded-md bg-[#5F259F] text-white grid place-items-center">
                      <LockOutlinedIcon fontSize="small" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        {cartonIds.length > 1 ? "Carton IDs" : "Carton ID"}
                      </p>
                      <p className="text-lg font-bold text-slate-800 break-all leading-tight">
                        {formatCartonRange(cartonIds)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <FieldGroup title="Product">
              <Controller
                name="product"
                control={control}
                rules={requiredText("Product")}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Product"
                    variant="filled"
                    required
                    fullWidth
                    error={!!errors.product}
                    helperText={errors.product?.message}
                    slotProps={{
                      input: { readOnly: locked },
                      htmlInput: { maxLength: 60 },
                    }}
                  />
                )}
              />
              <Controller
                name="color"
                control={control}
                rules={requiredText("Color")}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Color"
                    variant="filled"
                    required
                    fullWidth
                    error={!!errors.color}
                    helperText={errors.color?.message}
                    slotProps={{
                      input: { readOnly: locked },
                      htmlInput: { maxLength: 30 },
                    }}
                  />
                )}
              />
            </FieldGroup>

            <FieldGroup title="Packing">
              <Controller
                name="mfgDate"
                control={control}
                rules={{ required: "MFG Date is required" }}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      enableAccessibleFieldDOMStructure={false}
                      label="MFG Date"
                      views={["year", "month"]}
                      openTo="month"
                      format={MFG_DATE_FORMAT}
                      disableFuture
                      readOnly={locked}
                      value={parseMfgDate(field.value)}
                      onChange={(value) =>
                        field.onChange(
                          value && value.isValid()
                            ? value.format(MFG_DATE_FORMAT)
                            : "",
                        )
                      }
                      slots={{ textField: TextField }}
                      slotProps={{
                        textField: {
                          variant: "filled",
                          required: true,
                          fullWidth: true,
                          onBlur: field.onBlur,
                          error: !!errors.mfgDate,
                          helperText: errors.mfgDate?.message,
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
              <Controller
                name="quantity"
                control={control}
                rules={{
                  required: "Quantity is required",
                  validate: (value) =>
                    Number(value) > 0 || "Quantity must be greater than 0",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                    label="Quantity"
                    variant="filled"
                    required
                    fullWidth
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    slotProps={{
                      input: {
                        readOnly: locked,
                        endAdornment: (
                          <InputAdornment position="end">PCS</InputAdornment>
                        ),
                      },
                      htmlInput: { inputMode: "numeric", maxLength: 6 },
                    }}
                  />
                )}
              />
              <Controller
                name="grossWeight"
                control={control}
                rules={{
                  pattern: {
                    value: /^\d+(\.\d{1,3})?$/,
                    message: "Enter a valid weight (max 3 decimals)",
                  },
                  validate: (value) =>
                    !value ||
                    Number(value) > 0 ||
                    "Gross Weight must be greater than 0",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .replace(/[^\d.]/g, "")
                          .replace(/(\..*)\./g, "$1"),
                      )
                    }
                    label="Gross Weight"
                    variant="filled"
                    fullWidth
                    error={!!errors.grossWeight}
                    helperText={errors.grossWeight?.message ?? "Optional"}
                    slotProps={{
                      input: {
                        readOnly: locked,
                        endAdornment: (
                          <InputAdornment position="end">KG</InputAdornment>
                        ),
                      },
                      htmlInput: { inputMode: "decimal", maxLength: 9 },
                    }}
                  />
                )}
              />
              <Controller
                name="range"
                control={control}
                rules={{ validate: validateStickerRange }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                    label="No. of Stickers"
                    variant="filled"
                    required
                    fullWidth
                    error={!!errors.range}
                    helperText={
                      errors.range?.message ??
                      `1 – ${MAX_STICKER_RANGE}, one carton ID per sticker`
                    }
                    slotProps={{
                      input: { readOnly: locked },
                      htmlInput: { inputMode: "numeric", maxLength: 3 },
                    }}
                  />
                )}
              />
            </FieldGroup>
          </div>

          <footer className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-[16px] md:px-[22px] py-[12px]">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              Shortcut
              <kbd className="rounded border border-neutral-300 bg-white px-[6px] py-[1px] font-sans text-[11px] text-slate-600">
                Ctrl
              </kbd>
              +
              <kbd className="rounded border border-neutral-300 bg-white px-[6px] py-[1px] font-sans text-[11px] text-slate-600">
                P
              </kbd>
            </p>
            <LoadingButton
              variant="contained"
              size="large"
              startIcon={<PrintIcon />}
              loading={saving}
              loadingPosition="start"
              onClick={handlePrint}
              sx={{ px: 4, fontWeight: 600 }}
            >
              {mode === "new" ? "Print Sticker" : "Print Again"}
            </LoadingButton>
          </footer>
        </section>

        {/* RIGHT: live preview (same component is used for printing) */}
        <section
          aria-label="Sticker preview"
          className="min-h-0 flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-[16px] md:p-[22px] pb-0">
            <StepHeader
              step={2}
              title="Sticker Preview"
              subtitle="Updates live as you type — this is exactly what prints"
              extra={
                <Chip size="small" label="100 × 75 mm" variant="outlined" />
              }
            />
          </div>

          <div className="flex-1 min-h-[280px] m-[16px] md:m-[22px] rounded-lg border border-dashed border-neutral-300 bg-neutral-50 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:16px_16px] flex p-[16px] md:p-[28px] overflow-hidden">
            <StickerOutput control={control} cartonIds={cartonIds} />
          </div>

          <div className="shrink-0 px-[16px] md:px-[22px] pb-[16px] md:pb-[22px] flex flex-col gap-[10px]">
            {mode === "new" && <NewCartonPreviewNote control={control} />}
            {cartonIds.length > 1 && (
              <Alert severity="info" variant="outlined" sx={{ py: 0 }}>
                Showing the first sticker — {cartonIds.length} stickers will
                print ({formatCartonRange(cartonIds)}).
              </Alert>
            )}
            <div className="flex flex-wrap gap-[8px] text-xs text-slate-500">
              <span className="font-medium text-slate-600">
                Printer settings:
              </span>
              <span className="rounded-full bg-neutral-100 px-[10px] py-[2px]">
                Paper 100 × 75 mm
              </span>
              <span className="rounded-full bg-neutral-100 px-[10px] py-[2px]">
                Margins: None
              </span>
              <span className="rounded-full bg-neutral-100 px-[10px] py-[2px]">
                Scale: 100%
              </span>
            </div>
          </div>
        </section>
      </div>

      <ReprintCartonDialog
        open={reprintOpen}
        onClose={() => setReprintOpen(false)}
        onLoaded={handleReprintLoaded}
      />
    </div>
  );
};

export default MasterCarton;
