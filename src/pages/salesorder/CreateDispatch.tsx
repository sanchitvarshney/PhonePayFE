import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import {
  Divider,
  Paper,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import SerialNumberUpload from "@/components/procurement/SerialNumberUpload";
import {
  createDispatch,
  fetchChallanDetails,
} from "@/features/salesOrder/salesOrderSlice";
import { showToast } from "@/utils/toasterContext";
import { Icons } from "@/components/icons";

type ChallanRow = {
  challanNo?: string;
  challan_no?: string;
  salesOrder?: string;
  sales_order?: string;
  salesOrderNo?: string;
  challanQty?: string | number;
  qty?: string | number;
  quantity?: string | number;
  challanDate?: string;
  challan_date?: string;
  placeOfSupply?: string;
  stateCode?: string;
  sku?: string;
  deviceModel?: string;
  deviceModal?: string;
  rate?: string | number;
  boxId?: string;
  box_id?: string;
  billFromCompanyName?: string;
  billFromAddressLine1?: string;
  billFromAddressLine2?: string;
  billFromCity?: string;
  billFromPin?: string;
  billFromGstin?: string;
  shipFromCompanyName?: string;
  shipFromAddressLine1?: string;
  shipFromAddressLine2?: string;
  shipFromCity?: string;
  shipFromPin?: string;
  shipFromGstin?: string;
  billToLabel?: string;
  billToAddressLine1?: string;
  billToAddressLine2?: string;
  billToPin?: string;
  billToGst?: string;
  shipToLabel?: string;
  shipToAddressLine1?: string;
  shipToAddressLine2?: string;
  shipToCity?: string;
  shipToPin?: string;
};

function getChallanNumber(rowData: ChallanRow | null): string {
  if (!rowData) return "";
  return (
    rowData.challanNo ??
    rowData.challan_no ??
    ""
  );
}

function getChallanQty(rowData: ChallanRow | null): number {
  if (!rowData) return 0;
  return Number(rowData.challanQty ?? rowData.qty ?? rowData.quantity ?? 0) || 0;
}

function getSalesOrderNumber(rowData: ChallanRow | null): string {
  if (!rowData) return "";
  return (
    rowData.salesOrder ??
    rowData.sales_order ??
    rowData.salesOrderNo ??
    ""
  );
}

function normalizeChallanPayload(payload: any): ChallanRow | null {
  const data = payload?.data ?? payload?.response ?? payload;
  if (Array.isArray(data)) return (data[0] as ChallanRow) ?? null;
  if (Array.isArray(data?.data)) return (data.data[0] as ChallanRow) ?? null;
  if (data && typeof data === "object") return data as ChallanRow;
  return null;
}

function ChallanDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={56} animation="wave" />
        ))}
      </div>
      <Skeleton variant="rounded" height={100} className="w-full" animation="wave" />
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={`m-${i}`} variant="rounded" height={56} animation="wave" />
        ))}
      </div>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={`b-${i}`} variant="rounded" height={56} animation="wave" />
        ))}
      </div>
    </div>
  );
}

const CreateDispatch: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { challanNo = "" } = useParams();
  const initialChallanNo = decodeURIComponent(challanNo || "");
  const { dispatchLoading, challanLoading } = useAppSelector((state) => state.salesOrder);
  const showChallanSkeleton = Boolean(initialChallanNo.trim()) && challanLoading;

  const [activeStep, setActiveStep] = useState<number>(0);
  const [challanDetails, setChallanDetails] = useState<ChallanRow | null>(null);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [serialUploadKey, setSerialUploadKey] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");

  const effectiveChallanNo = useMemo(
    () => getChallanNumber(challanDetails) || initialChallanNo,
    [challanDetails, initialChallanNo],
  );
  const expectedQty = useMemo(() => getChallanQty(challanDetails), [challanDetails]);

  const handleFetchChallan = async () => {
    if (!initialChallanNo.trim()) {
      showToast("Challan number not found", "error");
      return;
    }
    const result: any = await dispatch(
      fetchChallanDetails({ challanNo: initialChallanNo.trim() }),
    );
    const payload = result?.payload?.data ?? result?.payload;
    const row = normalizeChallanPayload(payload);
    if (!row || !getChallanNumber(row)) {
      showToast("Challan details not found", "error");
      return;
    }
    setChallanDetails(row);
    showToast("Challan fetched successfully", "success");
  };

  useEffect(() => {
    if (initialChallanNo.trim()) {
      void handleFetchChallan();
    }
    // initialChallanNo is route-bound; auto-fetch once per route change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChallanNo]);

  const handleNext = () => {
    if (!challanDetails) {
      showToast("Please fetch challan details first", "error");
      return;
    }
    if (expectedQty <= 0) {
      showToast("Invalid challan qty", "error");
      return;
    }
    setActiveStep(1);
  };

  const handleDownloadSampleFile = () => {
    const sampleRows = [{ serialno: "SN000001" }, { serialno: "SN000002" }];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SerialNumbers");
    XLSX.writeFile(wb, "dispatch_serial_sample.xlsx");
  };

  const handleSubmit = async () => {
    if (!challanDetails) {
      showToast("Challan details not loaded", "error");
      return;
    }
    const normalizedSerials = serialNumbers
      .map((serial) => String(serial ?? "").trim())
      .filter(Boolean);
    const unique = new Set(normalizedSerials);
    if (unique.size !== normalizedSerials.length) {
      showToast("Duplicate serial numbers found in uploaded file", "error");
      return;
    }
    if (expectedQty <= 0) {
      showToast("Invalid challan qty", "error");
      return;
    }
    if (normalizedSerials.length !== expectedQty) {
      showToast(
        `Uploaded serial count (${normalizedSerials.length}) must match challan quantity (${expectedQty})`,
        "error",
      );
      return;
    }

    const payload = {
      challanNo: effectiveChallanNo,
      qty: expectedQty,
      serialNo: normalizedSerials,
      salesOrder: getSalesOrderNumber(challanDetails),
      boxId: challanDetails?.boxId ?? challanDetails?.box_id ?? "",
      remarks: remarks.trim(),
    };

    const result: any = await dispatch(createDispatch(payload));
    if (createDispatch.fulfilled.match(result)) {
      const body: any = result?.payload?.data ?? result?.payload ?? {};
      const isSuccess =
        Boolean(body?.success) || String(body?.status ?? "").toLowerCase() === "success";
      const message = body?.message || "Dispatch created successfully";
      if (!isSuccess) {
        showToast(message || "Failed to create dispatch", "error");
        return;
      }
      showToast(message, "success");
      navigate("/sales-order/manage-challan");
      return;
    }

    const rejectedPayload: any = result?.payload;
    showToast(
      rejectedPayload?.message || result?.error?.message || "Failed to create dispatch",
      "error",
    );
  };

  return (
    <div className="h-[calc(100vh-100px)] min-h-0 bg-white p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h6" className="text-slate-700 font-semibold">
            Create Dispatch
          </Typography>
          <Typography variant="body2" className="text-slate-500">
            Challan: {initialChallanNo || "-"}
          </Typography>
        </div>
        <LoadingButton
          variant="outlined"
          onClick={() => navigate("/sales-order/manage-challan", { state: location.state })}
        >
          Back to Manage Challan
        </LoadingButton>
      </div>

      <Stepper activeStep={activeStep} alternativeLabel>
        <Step>
          <StepLabel>Challan Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Upload Serial Numbers</StepLabel>
        </Step>
      </Stepper>

      {activeStep === 0 ? (
        <Paper variant="outlined" className="p-4 flex flex-col gap-4">
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center gap-[5px]">
              <Icons.documentDetail />
              <h2 className="text-lg font-semibold">Challan Details</h2>
            </div>
            <Divider
              sx={{
                borderBottomWidth: 2,
                borderColor: "#f59e0b",
                flexGrow: 1,
              }}
            />
          </div>
          {showChallanSkeleton ? (
            <ChallanDetailsSkeleton />
          ) : (
            <>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                <TextField label="Sales Order" value={getSalesOrderNumber(challanDetails)} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Challan No" value={getChallanNumber(challanDetails)} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Challan Date" value={challanDetails?.challanDate ?? challanDetails?.challan_date ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Qty" value={expectedQty || ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Place of Supply" value={challanDetails?.placeOfSupply ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="State Code" value={challanDetails?.stateCode ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="SKU" value={challanDetails?.sku ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Device Model" value={challanDetails?.deviceModel ?? challanDetails?.deviceModal ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Rate" value={challanDetails?.rate ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Box ID" value={challanDetails?.boxId ?? challanDetails?.box_id ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              </div>

              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.shipping />
                  <h2 className="text-lg font-semibold">Bill From</h2>
                </div>
                <Divider sx={{ borderBottomWidth: 2, borderColor: "#f59e0b", flexGrow: 1 }} />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                <TextField label="Company" value={challanDetails?.billFromCompanyName ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Address Line 1" value={challanDetails?.billFromAddressLine1 ?? ""} InputProps={{ readOnly: true }} fullWidth multiline rows={2} variant="filled" />
                <TextField label="Address Line 2" value={challanDetails?.billFromAddressLine2 ?? ""} InputProps={{ readOnly: true }} fullWidth multiline rows={2} variant="filled" />
                <TextField label="City" value={challanDetails?.billFromCity ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Pin" value={challanDetails?.billFromPin ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="GSTIN" value={challanDetails?.billFromGstin ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              </div>

              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.building />
                  <h2 className="text-lg font-semibold">Ship From</h2>
                </div>
                <Divider sx={{ borderBottomWidth: 2, borderColor: "#f59e0b", flexGrow: 1 }} />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                <TextField label="Company" value={challanDetails?.shipFromCompanyName ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Address Line 1" value={challanDetails?.shipFromAddressLine1 ?? ""} InputProps={{ readOnly: true }} fullWidth multiline rows={2} variant="filled" />
                <TextField label="Address Line 2" value={challanDetails?.shipFromAddressLine2 ?? ""} InputProps={{ readOnly: true }} fullWidth multiline rows={2} variant="filled" />
                <TextField label="City" value={challanDetails?.shipFromCity ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Pin" value={challanDetails?.shipFromPin ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="GSTIN" value={challanDetails?.shipFromGstin ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              </div>

              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.shipping />
                  <h2 className="text-lg font-semibold">Bill To</h2>
                </div>
                <Divider sx={{ borderBottomWidth: 2, borderColor: "#f59e0b", flexGrow: 1 }} />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                <TextField label="Label" value={challanDetails?.billToLabel ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Address Line 1" value={challanDetails?.billToAddressLine1 ?? ""} InputProps={{ readOnly: true }} fullWidth multiline rows={2} variant="filled" />
                <TextField label="Address Line 2" value={challanDetails?.billToAddressLine2 ?? ""} InputProps={{ readOnly: true }} fullWidth multiline rows={2} variant="filled" />
                <TextField label="Pin" value={challanDetails?.billToPin ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="GSTIN" value={challanDetails?.billToGst ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              </div>

              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.building />
                  <h2 className="text-lg font-semibold">Ship To</h2>
                </div>
                <Divider sx={{ borderBottomWidth: 2, borderColor: "#f59e0b", flexGrow: 1 }} />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                <TextField label="Label" value={challanDetails?.shipToLabel ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Address Line 1" value={challanDetails?.shipToAddressLine1 ?? ""} InputProps={{ readOnly: true }} fullWidth multiline rows={2} variant="filled" />
                <TextField label="Address Line 2" value={challanDetails?.shipToAddressLine2 ?? ""} InputProps={{ readOnly: true }} fullWidth multiline rows={2} variant="filled" />
                <TextField label="City" value={challanDetails?.shipToCity ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Pin" value={challanDetails?.shipToPin ?? ""} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              </div>
            </>
          )}

          <TextField
            label="Remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Optional — sent with dispatch"
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            disabled={showChallanSkeleton}
          />

          <div className="flex justify-end">
            <LoadingButton
              variant="contained"
              onClick={handleNext}
              endIcon={<Icons.next />}
              loading={showChallanSkeleton}
              disabled={showChallanSkeleton || !challanDetails || expectedQty <= 0}
            >
              Next
            </LoadingButton>
          </div>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          className="p-4 flex flex-col flex-1 min-h-0 gap-4 overflow-hidden"
        >
          <Typography variant="body2" className="text-slate-600 shrink-0">
            Upload serial number Excel with column name <b>serialno</b>. Total serial count must
            be exactly {expectedQty}.
          </Typography>
          <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto">
            <SerialNumberUpload
              key={serialUploadKey}
              serialPreviewWrapperClassName="max-h-[min(50vh,420px)]"
              onSerialNumbersChange={(serials) => {
                const normalized = serials.map((x) => String(x ?? "").trim()).filter(Boolean);
                if (normalized.length > 0 && normalized.length !== expectedQty) {
                  showToast(
                    `Uploaded serial count (${normalized.length}) must match challan quantity (${expectedQty})`,
                    "error",
                  );
                  setSerialNumbers([]);
                  setSerialUploadKey((prev) => prev + 1);
                  return;
                }
                setSerialNumbers(normalized);
              }}
            />
            <div className="shrink-0">
              <LoadingButton
                type="button"
                variant="text"
                startIcon={<Icons.download />}
                onClick={handleDownloadSampleFile}
              >
                Download Serial Sample File
              </LoadingButton>
            </div>
          </div>

          <div className="flex shrink-0 justify-between gap-3 border-t border-neutral-200 pt-4 mt-auto">
            <LoadingButton variant="outlined" onClick={() => setActiveStep(0)}>
              Back
            </LoadingButton>
            <LoadingButton variant="contained" onClick={handleSubmit} loading={dispatchLoading}>
              Submit Dispatch
            </LoadingButton>
          </div>
        </Paper>
      )}
    </div>
  );
};

export default CreateDispatch;

