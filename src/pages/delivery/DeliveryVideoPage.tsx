import { useCallback, useEffect, useState } from "react";
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
import { resetDeliveryState } from "@/features/delivery/deliverySlice";
import { DELIVERY_PARTNERS, fieldSx, getAWBLengthRange, selectSx } from "./delivery.constants";
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
  deliveryPartner: string;
  remark: string;
  video: RecordedVideo | null;
};

const defaultValues: DeliveryFormValues = {
  awb: "",
  deliveryPartner: "",
  remark: "",
  video: null,
};

const REMARK_MAX_LENGTH = 200;
const CAN_SCAN = isBarcodeScanSupported();

const FieldLabel = ({ children, required }: { children: string; required?: boolean }) => (
  <Typography variant="subtitle1" className="text-slate-600 font-medium">
    {children}
    {required ? <span className="text-red-500"> *</span> : (
      <span className="text-xs font-normal text-slate-400"> (optional)</span>
    )}
  </Typography>
);

const DeliveryVideoContent = () => {
  const dispatch = useAppDispatch();
  const submitError = useAppSelector((state) => state.delivery.submitError);
  const { phase, progress, isBusy, submit } = useDeliverySubmit();

  const [recorderOpen, setRecorderOpen] = useState(false);
  const [retakeConfirmOpen, setRetakeConfirmOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [submittedAwb, setSubmittedAwb] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DeliveryFormValues>({ defaultValues, mode: "onTouched" });

  useEffect(
    () => () => {
      dispatch(resetDeliveryState());
    },
    [dispatch]
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
      showToast(`AWB scanned: ${value}`, "success");
    },
    [setValue]
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
    const awb = values.awb.trim();
    const ok = await submit(
      { awb, deliveryPartner: values.deliveryPartner, remark: values.remark.trim() },
      values.video
    );
    if (ok) {
      reset(defaultValues);
      setSubmittedAwb(awb);
    }
  };

  const handleNewEntry = () => {
    dispatch(resetDeliveryState());
    setSubmittedAwb(null);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[560px] items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-700 text-white">
            <Icons.shipping />
          </span>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-slate-800">Wrong Device</h1>
            <p className="text-xs text-slate-500">Scan AWB, record and submit video</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[560px] p-3 sm:p-6">
        {submittedAwb ? (
          <Card elevation={0} className="border border-slate-200">
            <CardContent className="flex flex-col items-center gap-3 !py-10 text-center">
              <CheckCircle sx={{ fontSize: 64 }} className="text-green-600" />
              <Typography variant="h6" className="!font-semibold text-slate-800">
                Submitted successfully
              </Typography>
              <Typography variant="body2" className="text-slate-500">
                Wrong device video for AWB <span className="font-semibold">{submittedAwb}</span> has
                been uploaded.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Icons.add />}
                onClick={handleNewEntry}
                className="!mt-3"
              >
                Submit Another
              </Button>
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
                  <FieldLabel required>AWB</FieldLabel>
                  <Controller
                    name="awb"
                    control={control}
                    rules={{
                      validate: (value, formValues) => {
                        const awb = value.trim();
                        if (!awb) return "AWB is required";
                        const range = getAWBLengthRange(formValues.deliveryPartner);
                        if (range && (awb.length < range.min || awb.length > range.max)) {
                          return `AWB must be ${range.min}–${range.max} characters for the selected partner`;
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Enter or scan AWB number"
                        disabled={isBusy}
                        error={!!errors.awb}
                        helperText={errors.awb?.message}
                        sx={fieldSx}
                        // Scanners send Enter after the code; don't submit the form.
                        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                        slotProps={{
                          htmlInput: {
                            autoComplete: "off",
                            autoCapitalize: "characters",
                            spellCheck: false,
                          },
                          input: {
                            endAdornment: CAN_SCAN && (
                              <InputAdornment position="end">
                                <IconButton
                                  edge="end"
                                  aria-label="Scan AWB barcode"
                                  onClick={() => setScannerOpen(true)}
                                  disabled={isBusy}
                                >
                                  <QrCodeScanner className="text-cyan-700" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <FieldLabel required>Delivery Partner</FieldLabel>
                  <Controller
                    name="deliveryPartner"
                    control={control}
                    rules={{ required: "Delivery partner is required", deps: ["awb"] }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.deliveryPartner} disabled={isBusy}>
                        <Select
                          {...field}
                          displayEmpty
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                          renderValue={(value) =>
                            value ? (
                              DELIVERY_PARTNERS.find((p) => p.value === value)?.text ?? value
                            ) : (
                              <span className="text-slate-400">Select delivery partner</span>
                            )
                          }
                        >
                          {DELIVERY_PARTNERS.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.text}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.deliveryPartner && (
                          <FormHelperText>{errors.deliveryPartner.message}</FormHelperText>
                        )}
                      </FormControl>
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
                        placeholder="Add a note about this delivery"
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
                    rules={{ validate: (value) => !!value || "Please record a delivery video" }}
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
                  disabled={isBusy}
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
