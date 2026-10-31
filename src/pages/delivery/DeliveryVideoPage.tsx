import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { CheckCircle, QrCodeScanner } from "@mui/icons-material";
import { Icons } from "@/components/icons";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { showToast } from "@/utils/toasterContext";
import {
  checkWrongDeviceAwb,
  clearAwbCheck,
  getWrongDeviceLocations,
  resetDeliveryState,
} from "@/features/delivery/deliverySlice";
import { isAwbLimitReached, normalizeAwb } from "@/features/delivery/delivery.utils";
import type { AwbCheckResult } from "@/features/delivery/deliveryType";
import { fieldSx, getPartnerName, selectSx } from "./delivery.constants";
import ConfirmDialog from "./ConfirmDialog";
import FullScreenVideoRecorder from "./video/FullScreenVideoRecorder";
import VideoPreview from "./video/VideoPreview";
import { VIDEO_CONFIG } from "./video/video.config";
import type { RecordedVideo } from "./video/video.types";
import { useDeliverySubmit } from "./useDeliverySubmit";
import { useIsMobileDevice } from "@/hooks/useIsMobileDevice";
import MobileOnlyNotice from "./MobileOnlyNotice";
import AWBScannerDialog, { isBarcodeScanSupported } from "./AWBScannerDialog";

type DeliveryFormValues = {
  awb: string;
  location: string;
  itemName: string;
  qty: string;
  remark: string;
  video: RecordedVideo | null;
};

const defaultValues: DeliveryFormValues = {
  awb: "",
  location: "",
  itemName: "",
  qty: "1",
  remark: "",
  video: null,
};

const REMARK_MAX_LENGTH = 200;
const ITEM_NAME_MAX_LENGTH = 100;
const QTY_MAX = 9999;
const CAN_SCAN = isBarcodeScanSupported();

type SubmittedEntry = { awb: string; itemName: string; qty: number };

const FieldLabel = ({ children, required }: { children: string; required?: boolean }) => (
  <Typography variant="subtitle1" className="text-slate-600 font-medium">
    {children}
    {required ? <span className="text-red-500"> *</span> : (
      <span className="text-xs font-normal text-slate-400"> (optional)</span>
    )}
  </Typography>
);

const formatEntries = (info: AwbCheckResult) =>
  info.limit == null ? `${info.entered} (no limit)` : `${info.entered} of ${info.limit}`;

const AwbInfoCard = ({ info }: { info: AwbCheckResult }) => {
  const limitReached = isAwbLimitReached(info);
  return (
    <div
      className={`grid grid-cols-2 gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-xs ${
        limitReached ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
      }`}
    >
      <span className="text-slate-500">Partner</span>
      <span className="font-medium text-slate-800">{getPartnerName(info.deliveryPartner)}</span>
      <span className="text-slate-500">Scan type</span>
      <span className="font-medium text-slate-800">{info.scanType}</span>
      <span className="text-slate-500">Scan ID</span>
      <span className="font-medium text-slate-800 break-all">{info.scanId}</span>
      <span className="text-slate-500">Entries</span>
      <span className={`font-medium ${limitReached ? "text-red-600" : "text-slate-800"}`}>
        {formatEntries(info)}
      </span>
      {limitReached && (
        <span className="col-span-2 pt-1 font-medium text-red-600">
          Entry limit for this AWB is reached.
        </span>
      )}
    </div>
  );
};

const DeliveryVideoContent = () => {
  const dispatch = useAppDispatch();
  const { submitError, awbInfo, awbChecking, awbError, locations, locationsLoading } =
    useAppSelector((state) => state.delivery);
  const { phase, progress, isBusy, submit } = useDeliverySubmit();

  const [recorderOpen, setRecorderOpen] = useState(false);
  const [retakeConfirmOpen, setRetakeConfirmOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedEntry | null>(null);
  // Shares one request when blur, Enter and submit all ask to check the same AWB.
  const pendingCheckRef = useRef<{ awb: string; promise: Promise<AwbCheckResult | null> } | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<DeliveryFormValues>({ defaultValues, mode: "onTouched" });

  useEffect(() => {
    dispatch(getWrongDeviceLocations());
    return () => {
      dispatch(resetDeliveryState());
      dispatch(clearAwbCheck());
    };
  }, [dispatch]);

  const runAwbCheck = useCallback(
    (raw: string): Promise<AwbCheckResult | null> => {
      const awb = normalizeAwb(raw);
      if (!awb) return Promise.resolve(null);
      if (awbInfo?.awb === awb) return Promise.resolve(awbInfo);
      if (pendingCheckRef.current?.awb === awb) return pendingCheckRef.current.promise;

      setValue("awb", awb);
      const promise = dispatch(checkWrongDeviceAwb(awb)).then((result) =>
        checkWrongDeviceAwb.fulfilled.match(result) ? result.payload : null
      );
      pendingCheckRef.current = { awb, promise };
      promise.finally(() => {
        if (pendingCheckRef.current?.promise === promise) pendingCheckRef.current = null;
      });
      return promise;
    },
    [awbInfo, dispatch, setValue]
  );

  const openRecorder = useCallback(() => setRecorderOpen(true), []);
  const closeRecorder = useCallback(() => setRecorderOpen(false), []);
  const requestRetake = useCallback(() => setRetakeConfirmOpen(true), []);

  const handleRecorded = useCallback(
    (video: RecordedVideo) => {
      setValue("video", video, { shouldValidate: true, shouldDirty: true });
      setRecorderOpen(false);
    },
    [setValue]
  );

  const handleScanned = useCallback(
    (value: string) => {
      setValue("awb", value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setScannerOpen(false);
      runAwbCheck(value);
    },
    [setValue, runAwbCheck]
  );

  const handleTooShort = useCallback(() => {
    showToast(
      `Recording is too short. Please record at least ${Math.ceil(
        VIDEO_CONFIG.minDurationMs / 1000
      )} seconds.`,
      "warning"
    );
  }, []);

  const onSubmit = async (values: DeliveryFormValues) => {
    if (!values.video) return;
    const info = await runAwbCheck(values.awb);
    if (!info) return;
    if (isAwbLimitReached(info)) {
      showToast("Entry limit for this AWB is reached", "error");
      return;
    }

    const entry: SubmittedEntry = {
      awb: info.awb,
      itemName: values.itemName.trim(),
      qty: Number(values.qty),
    };
    const ok = await submit(
      { ...entry, remark: values.remark.trim(), location: values.location },
      values.video
    );
    if (ok) setSubmitted(entry);
  };

  // Same AWB keeps the AWB and location for the next item on that parcel.
  const handleNext = (sameAwb: boolean) => {
    const location = getValues("location");
    dispatch(resetDeliveryState());
    if (sameAwb && submitted) {
      reset({ ...defaultValues, awb: submitted.awb, location });
    } else {
      dispatch(clearAwbCheck());
      reset({ ...defaultValues, location });
    }
    setSubmitted(null);
  };

  const limitReached = isAwbLimitReached(awbInfo);

  return (
    <div className="min-h-[100dvh] w-full bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[560px] items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-700 text-white">
            <Icons.shipping />
          </span>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-slate-800">Wrong Device</h1>
            <p className="text-xs text-slate-500">Save an item without serial, with a video</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[560px] p-3 sm:p-6">
        {submitted ? (
          <Card elevation={0} className="border border-slate-200">
            <CardContent className="flex flex-col items-center gap-3 !py-10 text-center">
              <CheckCircle sx={{ fontSize: 64 }} className="text-green-600" />
              <Typography variant="h6" className="!font-semibold text-slate-800">
                Saved successfully
              </Typography>
              <Typography variant="body2" className="text-slate-500">
                <span className="font-semibold">{submitted.itemName}</span> (qty {submitted.qty})
                saved on AWB <span className="font-semibold">{submitted.awb}</span>.
              </Typography>
              {awbInfo?.awb === submitted.awb && (
                <Typography variant="body2" className="text-slate-500">
                  Entries on this AWB: {formatEntries(awbInfo)}
                </Typography>
              )}
              <div className="!mt-3 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  variant="contained"
                  startIcon={<Icons.add />}
                  onClick={() => handleNext(true)}
                  disabled={limitReached}
                >
                  Add Item (Same AWB)
                </Button>
                <Button variant="outlined" onClick={() => handleNext(false)}>
                  New AWB
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card elevation={0} className="border border-slate-200">
            <CardContent>
              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-[20px]"
              >
                <div className="flex flex-col gap-[10px]">
                  <FieldLabel required>AWB / Challan No.</FieldLabel>
                  <Controller
                    name="awb"
                    control={control}
                    rules={{ validate: (value) => !!value.trim() || "AWB is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Enter or scan AWB / challan number"
                        disabled={isBusy}
                        error={!!errors.awb || !!awbError}
                        helperText={errors.awb?.message ?? awbError}
                        sx={fieldSx}
                        onChange={(e) => {
                          field.onChange(e);
                          if (awbInfo || awbError) dispatch(clearAwbCheck());
                        }}
                        onBlur={() => {
                          field.onBlur();
                          runAwbCheck(field.value);
                        }}
                        // Scanners send Enter after the code: check the AWB instead of submitting.
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();
                          runAwbCheck(field.value);
                        }}
                        slotProps={{
                          htmlInput: {
                            autoComplete: "off",
                            autoCapitalize: "characters",
                            spellCheck: false,
                          },
                          input: {
                            endAdornment: (awbChecking || CAN_SCAN) && (
                              <InputAdornment position="end">
                                {awbChecking ? (
                                  <CircularProgress size={22} />
                                ) : (
                                  <IconButton
                                    edge="end"
                                    aria-label="Scan AWB barcode"
                                    onClick={() => setScannerOpen(true)}
                                    disabled={isBusy}
                                  >
                                    <QrCodeScanner className="text-cyan-700" />
                                  </IconButton>
                                )}
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                  {awbInfo && <AwbInfoCard info={awbInfo} />}
                </div>

                <div className="flex flex-col gap-[10px]">
                  <FieldLabel required>Location</FieldLabel>
                  <Controller
                    name="location"
                    control={control}
                    rules={{ required: "Location is required" }}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        error={!!errors.location}
                        disabled={isBusy || locationsLoading}
                      >
                        <Select
                          {...field}
                          displayEmpty
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                          renderValue={(value) =>
                            value ? (
                              locations.find((l) => l.key === value)?.name ?? value
                            ) : (
                              <span className="text-slate-400">
                                {locationsLoading ? "Loading locations..." : "Select location"}
                              </span>
                            )
                          }
                        >
                          {locations.map((item) => (
                            <MenuItem key={item.key} value={item.key}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.location ? (
                          <FormHelperText>{errors.location.message}</FormHelperText>
                        ) : (
                          !locationsLoading &&
                          locations.length === 0 && (
                            <FormHelperText>
                              No locations are allotted for this module.
                            </FormHelperText>
                          )
                        )}
                      </FormControl>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <FieldLabel required>Item Name</FieldLabel>
                  <Controller
                    name="itemName"
                    control={control}
                    rules={{
                      validate: (value) => {
                        const name = value.trim();
                        if (!name) return "Item name is required";
                        if (name.length < 2) return "Item name must be at least 2 characters";
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="e.g. Blue shirt"
                        disabled={isBusy}
                        error={!!errors.itemName}
                        helperText={errors.itemName?.message}
                        sx={fieldSx}
                        slotProps={{ htmlInput: { maxLength: ITEM_NAME_MAX_LENGTH } }}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <FieldLabel required>Quantity</FieldLabel>
                  <Controller
                    name="qty"
                    control={control}
                    rules={{
                      validate: (value) => {
                        const qty = Number(value);
                        return (
                          (Number.isInteger(qty) && qty >= 1 && qty <= QTY_MAX) ||
                          `Enter a whole number from 1 to ${QTY_MAX}`
                        );
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        disabled={isBusy}
                        error={!!errors.qty}
                        helperText={errors.qty?.message}
                        sx={fieldSx}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                        slotProps={{
                          htmlInput: { inputMode: "numeric", min: 1, max: QTY_MAX, step: 1 },
                        }}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <FieldLabel>Remark</FieldLabel>
                  <Controller
                    name="remark"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={6}
                        placeholder="Add a note about this item"
                        disabled={isBusy}
                        sx={fieldSx}
                        helperText={
                          <span className="flex justify-end">
                            {field.value.length}/{REMARK_MAX_LENGTH}
                          </span>
                        }
                        slotProps={{ htmlInput: { maxLength: REMARK_MAX_LENGTH } }}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <FieldLabel required>Video</FieldLabel>
                  <Controller
                    name="video"
                    control={control}
                    rules={{ validate: (value) => !!value || "Please record a video" }}
                    render={({ field }) => (
                      <VideoPreview
                        video={field.value}
                        onRecord={openRecorder}
                        onRetake={requestRetake}
                        disabled={isBusy}
                        error={!!errors.video}
                      />
                    )}
                  />
                  {errors.video && (
                    <span className="text-[12px] text-red-500">{errors.video.message}</span>
                  )}
                </div>

                {submitError && !isBusy && (
                  <Alert severity="error" variant="outlined">
                    <span className="block font-medium">{submitError}</span>
                    <span className="block text-xs">
                      Your details and video are kept — tap Submit to try again.
                    </span>
                  </Alert>
                )}

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  loading={isBusy}
                  loadingPosition="start"
                  startIcon={<Icons.uploadfile />}
                  disabled={isBusy || awbChecking || limitReached}
                >
                  {phase === "processing"
                    ? "Optimizing video..."
                    : phase === "uploading"
                      ? "Uploading..."
                      : "Submit"}
                </LoadingButton>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      {recorderOpen && (
        <FullScreenVideoRecorder
          onClose={closeRecorder}
          onRecorded={handleRecorded}
          onTooShort={handleTooShort}
        />
      )}

      {scannerOpen && (
        <AWBScannerDialog
          open
          onClose={() => setScannerOpen(false)}
          onScan={handleScanned}
        />
      )}

      <ConfirmDialog
        open={retakeConfirmOpen}
        title="Retake video?"
        message="Your current recording will be replaced once you record a new one."
        confirmText="Retake"
        cancelText="Cancel"
        onConfirm={() => {
          setRetakeConfirmOpen(false);
          openRecorder();
        }}
        onCancel={() => setRetakeConfirmOpen(false)}
      />

      <Backdrop open={isBusy} sx={{ zIndex: 1400, flexDirection: "column", gap: 2, px: 3 }}>
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          {phase === "uploading" && progress >= 100 ? (
            <CircularProgress size={72} thickness={4} sx={{ color: "white" }} />
          ) : (
            <>
              <CircularProgress
                variant="determinate"
                value={progress}
                size={72}
                thickness={4}
                sx={{ color: "white" }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-base font-bold text-white">
                {progress}%
              </span>
            </>
          )}
        </Box>
        <span className="text-center text-lg font-semibold tracking-wide text-white">
          {phase === "processing"
            ? "Optimizing video..."
            : progress >= 100
              ? "Finishing up..."
              : "Uploading video..."}
        </span>
        <span className="text-center text-sm text-slate-300">
          Please keep this screen open until it completes
        </span>
      </Backdrop>
    </div>
  );
};

// Mobile-only module: desktop browsers get a notice instead of the camera form.
const DeliveryVideoPage = () => {
  const isMobile = useIsMobileDevice();
  return isMobile ? <DeliveryVideoContent /> : <MobileOnlyNotice />;
};

export default DeliveryVideoPage;
