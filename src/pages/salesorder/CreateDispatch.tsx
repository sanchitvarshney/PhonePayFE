import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { Paper, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import * as XLSX from "xlsx";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import SerialNumberUpload from "@/components/procurement/SerialNumberUpload";
import { createDispatch, fetchChallan } from "@/features/salesOrder/salesOrderSlice";
import { showToast } from "@/utils/toasterContext";
import { Icons } from "@/components/icons";

type ChallanRow = {
  challanNo?: string;
  challan_no?: string;
  salesOrder?: string;
  sales_order?: string;
  salesOrderNo?: string;
  qty?: string | number;
  quantity?: string | number;
  boxId?: string;
  box_id?: string;
  challan_date?: string;
  challanDate?: string;
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
  return Number(rowData.qty ?? rowData.quantity ?? 0) || 0;
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

const CreateDispatch: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { challanNo = "" } = useParams();
  const initialChallanNo = decodeURIComponent(challanNo || "");
  const { challanLoading, dispatchLoading } = useAppSelector((state) => state.salesOrder);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [challanDetails, setChallanDetails] = useState<ChallanRow | null>(null);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [serialUploadKey, setSerialUploadKey] = useState<number>(0);

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
      fetchChallan({ wise: "challanwise", data: initialChallanNo.trim() }),
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
    <div className="h-[calc(100vh-100px)] bg-white p-6 flex flex-col gap-4">
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
          <div className="flex items-end gap-3">
            <TextField
              label="Challan Number"
              value={initialChallanNo}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <LoadingButton
              variant="contained"
              onClick={handleFetchChallan}
              loading={challanLoading}
              startIcon={<Icons.search />}
            >
              Fetch Challan
            </LoadingButton>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Sales Order"
              value={getSalesOrderNumber(challanDetails)}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Challan No"
              value={getChallanNumber(challanDetails)}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Qty"
              value={expectedQty || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Box ID"
              value={challanDetails?.boxId ?? challanDetails?.box_id ?? ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </div>

          <div className="flex justify-end">
            <LoadingButton variant="contained" onClick={handleNext} endIcon={<Icons.next />}>
              Next
            </LoadingButton>
          </div>
        </Paper>
      ) : (
        <Paper variant="outlined" className="p-4 flex flex-col gap-4">
          <Typography variant="body2" className="text-slate-600">
            Upload serial number Excel with column name <b>serialno</b>. Total serial count must
            be exactly {expectedQty}.
          </Typography>
          <SerialNumberUpload
            key={serialUploadKey}
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

          <div>
            <LoadingButton
              type="button"
              variant="text"
              startIcon={<Icons.download />}
              onClick={handleDownloadSampleFile}
            >
              Download Serial Sample File
            </LoadingButton>
          </div>

          <div className="flex justify-between">
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

