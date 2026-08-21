import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, InputAdornment, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import * as XLSX from "xlsx";
import {
  CustomDrawer,
  CustomDrawerContent,
  CustomDrawerDescription,
  CustomDrawerHeader,
  CustomDrawerTitle,
} from "@/components/reusable/CustomDrawer";
import SerialNumberUpload from "@/components/procurement/SerialNumberUpload";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  getInwardLocation,
  uploadBulkDeviceSerial,
} from "@/features/bulkDeviceInward/bulkDeviceInwardSlice";
import {
  getChallanNo,
  getDeviceKey,
  getDeviceSku,
  getMinNo,
  getRemainingQty,
} from "@/features/bulkDeviceInward/bulkDeviceInwardHelpers";
import { showToast } from "@/utils/toasterContext";

type LocationOption = { label: string; value: string };

const toLocationOption = (item: any): LocationOption => ({
  label: String(item?.text ?? item?.name ?? item?.label ?? ""),
  value: String(item?.id ?? item?.code ?? item?.value ?? item?.key ?? ""),
});

type Props = {
  open: boolean;
  row: any;
  onClose: () => void;
  onSuccess: () => void;
};

const downloadSerialSampleFile = () => {
  const sampleRows = [["PPSS20001112588"], ["PPSS20001126959"]];
  const ws = XLSX.utils.aoa_to_sheet(sampleRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SerialNumbers");
  XLSX.writeFile(wb, "serial_number_sample.xlsx");
};

const getDuplicateValues = (values: string[]): string[] => {
  const seen = new Map<string, string>();
  const duplicates = new Set<string>();
  values.forEach((raw) => {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return;
    if (seen.has(normalized)) {
      duplicates.add(seen.get(normalized)!);
      return;
    }
    seen.set(normalized, raw.trim());
  });
  return Array.from(duplicates);
};

const UploadSerialNoDrawer: React.FC<Props> = ({
  open,
  row,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { uploadSerialLoading, inwardLocations, inwardLocationsLoading } =
    useAppSelector((state) => state.bulkDeviceInward);
  const [step, setStep] = useState<0 | 1>(0);
  const [qty, setQty] = useState<number>(0);
  const [location, setLocation] = useState<LocationOption | null>(null);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [serialUploadKey, setSerialUploadKey] = useState(0);

  const remaining = getRemainingQty(row);
  const challanNo = getChallanNo(row);
  const minNo = getMinNo(row);
  const deviceKey = getDeviceKey(row);
  const deviceSku = getDeviceSku(row);

  const locationOptions = useMemo(
    () => inwardLocations.map(toLocationOption),
    [inwardLocations],
  );

  useEffect(() => {
    if (open) {
      setStep(0);
      setQty(0);
      setLocation(null);
      setSerialNumbers([]);
      setSerialUploadKey((prev) => prev + 1);
      dispatch(getInwardLocation());
    }
  }, [open, row, dispatch]);

  const handleNext = () => {
    if (!qty || qty <= 0) {
      showToast("Please enter a valid quantity", "error");
      return;
    }
    if (qty > remaining) {
      showToast(`Quantity cannot exceed remaining qty (${remaining})`, "error");
      return;
    }
    if (!location) {
      showToast("Please select a location", "error");
      return;
    }
    setStep(1);
  };

  const handleSerialNumbersChange = (serials: string[]) => {
    const normalized = serials.map((s) => String(s ?? "").trim()).filter(Boolean);
    const duplicates = getDuplicateValues(normalized);
    if (duplicates.length > 0) {
      showToast(`Duplicate serial numbers found: ${duplicates.join(", ")}`, "error");
      setSerialNumbers([]);
      setSerialUploadKey((prev) => prev + 1);
      return;
    }
    if (normalized.length !== qty) {
      showToast(
        `Uploaded serial count (${normalized.length}) must match quantity (${qty})`,
        "error",
      );
      setSerialNumbers([]);
      setSerialUploadKey((prev) => prev + 1);
      return;
    }
    setSerialNumbers(normalized);
  };

  const handleSubmit = async () => {
    if (serialNumbers.length !== qty) {
      showToast("Please upload serial numbers matching the quantity", "error");
      return;
    }
    if (!location) {
      showToast("Please select a location", "error");
      return;
    }
    const result: any = await dispatch(
      uploadBulkDeviceSerial({
        minNo,
        sku: deviceSku,
        qty,
        serialno: serialNumbers,
        device_key: deviceKey,
        putLocation: location.value,
      }),
    );
    if (uploadBulkDeviceSerial.fulfilled.match(result)) {
      const body: any = result.payload?.data ?? {};
      if (body?.success !== false) {
        showToast(body?.message ?? "Serial numbers uploaded successfully", "success");
        onSuccess();
        return;
      }
      showToast(body?.message ?? "Failed to upload serial numbers", "error");
      return;
    }
    // Rejected requests already surface their real message via the axios
    // response interceptor; no fallback toast needed here.
  };

  return (
    <CustomDrawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <CustomDrawerContent side="right" className="min-w-[700px] p-0 flex flex-col">
        <CustomDrawerHeader className="h-[60px] flex-shrink-0 p-0 flex flex-col justify-center px-[20px] space-y-0 bg-zinc-200 gap-0">
          <CustomDrawerTitle className="text-slate-600 font-[500] p-0">
            Upload Serial No
          </CustomDrawerTitle>
          <CustomDrawerDescription className="text-slate-500">
            Challan {challanNo} &middot; Remaining Qty: {remaining}
          </CustomDrawerDescription>
        </CustomDrawerHeader>
        <div className="p-[20px] flex flex-col gap-[20px] overflow-y-auto flex-1 min-h-0">
          {step === 0 ? (
            <div className="grid grid-cols-2 gap-[20px]">
              <TextField
                variant="filled"
                type="number"
                label="Quantity"
                value={qty === 0 ? "" : qty}
                onChange={(e) => setQty(Math.trunc(Number(e.target.value)) || 0)}
                fullWidth
                inputProps={{ min: 1, max: remaining, step: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">pcs</InputAdornment>,
                }}
              />
              <Autocomplete
                options={locationOptions}
                loading={inwardLocationsLoading}
                value={location}
                onChange={(_, newValue) => setLocation(newValue)}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                slotProps={{ popper: { disablePortal: true } }}
                renderInput={(params) => (
                  <TextField {...params} variant="filled" label="Location" />
                )}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-[20px]">
                <Typography variant="inherit">Quantity: {qty}</Typography>
                <Typography variant="inherit">Location: {location?.label}</Typography>
              </div>
              <SerialNumberUpload
                key={serialUploadKey}
                onSerialNumbersChange={handleSerialNumbersChange}
                onDownloadSample={downloadSerialSampleFile}
              />
            </>
          )}
        </div>
        <div className="p-[20px] pt-0 flex-shrink-0 flex gap-[10px]">
          {step === 0 ? (
            <LoadingButton
              variant="contained"
              onClick={handleNext}
              className="max-w-max"
            >
              Next
            </LoadingButton>
          ) : (
            <>
              <LoadingButton variant="outlined" onClick={() => setStep(0)}>
                Back
              </LoadingButton>
              <LoadingButton
                variant="contained"
                loading={uploadSerialLoading}
                disabled={serialNumbers.length !== qty}
                onClick={handleSubmit}
              >
                Submit
              </LoadingButton>
            </>
          )}
        </div>
      </CustomDrawerContent>
    </CustomDrawer>
  );
};

export default UploadSerialNoDrawer;
