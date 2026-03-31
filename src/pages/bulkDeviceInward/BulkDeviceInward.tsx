import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import MaterialInvardUploadDocumentDrawer from "@/components/Drawers/wearhouse/MaterialInvardUploadDocumentDrawer";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  clearaddressdetail,
} from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import {
  resetDocumentFile,
  resetFormData,
} from "@/features/wearhouse/Rawmin/RawMinSlice";
import {
  Autocomplete,
  Divider,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LoadingButton } from "@mui/lab";
import { Icons } from "@/components/icons";
import { showToast } from "@/utils/toasterContext";
import ConfirmationModel from "@/components/reusable/ConfirmationModel";
import Success from "@/components/reusable/Success";
import axiosInstance from "@/api/axiosInstance";
import {
  getDispatchFromDetail,
  getShippingAddress,
} from "@/features/master/client/clientSlice";
import { inrRupeesInWordsUpper } from "@/utils/inrAmountWords";
// import AddPOTable from "./AddPOTable";
import {
  createPO,
  getPODetail,
  setFormData,
  updatePO,
} from "@/features/procurement/poSlices";
import { useNavigate } from "react-router-dom";
import FullPageLoading from "@/components/shared/FullPageLoading";
import SerialNumberUpload from "@/components/procurement/SerialNumberUpload";

interface RowData {
  id: string;
  partComponent: { label: string; value: string; hsn?: string } | null;
  hsnCode: string;
  qty: number;
  rate: number;
  amount: number;
  isNew?: boolean;
  updaterow?: string;
  poid?: string;
}

interface BillAddress {
  id: number;
  gst: string;
  pin: string;
  addressLine1: string;
  addressLine2: string;
  label: string;
}

interface ShippingAddress {
  id: number;
  pin: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  label: string;
}

interface BillFromAddress {
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pin: string;
  gstin: string;
}

interface ShipFromAddress {
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pin: string;
  gstin: string;
}
interface FormData {
  billaddressid: any;
  billaddress: BillAddress;
  shipaddressid: any;
  shipaddress: ShippingAddress;
  billFrom: BillFromAddress;
  shipFrom: ShipFromAddress;
  placeOfSupply: string;
  stateCode: string;
  ewayBillNo?: string;
  vehicleNo?: string;
  boxNo: string;
  challanNo: string;
  challanDate: string | dayjs.Dayjs;
}
const BulkDeviceInward: React.FC = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState<boolean>(false);
  const [minNo, setMinno] = useState<string>("");
  const [upload, setUpload] = useState<boolean>(false);
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [productOptions, setProductOptions] = useState<
    Array<{ label: string; value: string; hsn?: string }>
  >([]);
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.po);
  const { formData } = useAppSelector((state) => state.po);
  const { dispatchFromDetails, shippingAddress } = useAppSelector(
    (state) => state.client,
  ) as any;
  const isEdit = window.location.href.includes("edit-po");
  const id =
    window.location.href.split("edit-po/")[1]?.replace(/_/g, "/") || "";

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      billFrom: {
        companyName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        pin: "",
        gstin: "",
      },
      shipFrom: {
        companyName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        pin: "",
        gstin: "",
      },
      placeOfSupply: "",
      stateCode: "",
      ewayBillNo: "",
      vehicleNo: "",
      boxNo: "",
      challanNo: "",
      challanDate: "",
    },
  });

  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Form Details", "Add Component Details", "Review & Submit"];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    // Set form values from Redux state before going back
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
    setActiveStep((prevStep) => prevStep - 1);
  };

  const checkRequiredFields = (data: RowData[]) => {
    let hasErrors = false;
    const missingDetails: string[] = [];

    data.forEach((item, index) => {
      const missingFields: string[] = [];

      if (!item.partComponent?.value) missingFields.push("Goods/Product");
      if (!item.hsnCode) missingFields.push("HSN/SAC");
      if (!item.qty || item.qty < 1) missingFields.push("Qty");
      if (item.rate === undefined || item.rate === null || item.rate <= 0)
        missingFields.push("Rate");

      if (missingFields.length > 0) {
        missingDetails.push(`Row ${index + 1}: ${missingFields.join(", ")}`);
        hasErrors = true;
      }
    });

    if (missingDetails.length > 0) {
      showToast(
        `Some required fields are missing:\n${missingDetails.join("\n")}`,
        "error",
      );
    }

    return hasErrors;
  };

  const resetall = () => {
    setRowData([]);
    setSerialNumbers([]);
    reset();
    dispatch(resetDocumentFile());
    dispatch(clearaddressdetail());
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!data.billaddressid) {
      showToast("Please select a bill address", "error");
      return;
    }
    if (!data.shipaddressid) {
      showToast("Please select a shipping address", "error");
      return;
    }

    try {
      dispatch(setFormData(data as any));
      setActiveStep(1); // Directly set the step instead of using handleNext
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("Error submitting form", "error");
    }
  };
  const finalSubmit = () => {
    if (formData) {
      if (rowData.length === 0) {
        showToast("Please Add Material Details", "error");
      } else {
        if (!checkRequiredFields(rowData)) {
          const component = rowData.map(
            (item) => item.partComponent?.value || "",
          );
          const qty = rowData.map((item) => Number(item.qty));
          const rate = rowData.map((item) => Number(item.rate));
          const hsncode = rowData.map((item) => item.hsnCode || "");

          const challanDate = formData.challanDate;
          let formattedChallanDate = "";
          if (challanDate) {
            const date = dayjs(challanDate);
            if (date.isValid()) {
              formattedChallanDate = date.format("DD-MM-YYYY");
            }
          }

          const payload: any = {
            component,
            qty,
            rate,
            hsncode,
            serialno: serialNumbers,
            placeOfSupply: formData.placeOfSupply,
            stateCode: formData.stateCode,
            challanNo: formData.challanNo,
            challanDate: formattedChallanDate,
            boxNo: formData.boxNo,
            ewayBillNo: formData.ewayBillNo,
            vehicleNo: formData.vehicleNo,
            billFrom: formData.billFrom,
            shipFrom: formData.shipFrom,
            billaddressid: formData.billaddressid,
            billaddress: formData.billaddress,
            shipaddressid: formData.shipaddressid,
            shipaddress: formData.shipaddress,
            updaterow: rowData.map((item) => item.updaterow),
            poid: id,
            vendor_type: "v01",
          };
          if (isEdit) {
            dispatch(updatePO(payload)).then((response: any) => {
              if (response.payload.data.success) {
                showToast(response.payload?.data?.message, "success");
                resetall();
                handleNext();
                dispatch(resetFormData());
                navigate("/procurement/manage");
              }
            });
          } else {
            dispatch(createPO(payload)).then((response: any) => {
              if (response.payload.data.success) {
                showToast(response.payload?.data?.message, "success");
                resetall();
                handleNext();
                dispatch(resetFormData());
                setMinno(response.payload?.data?.data.po_id);
              }
            });
          }
        }
      }
    }
  };
  useEffect(() => {
    dispatch(getDispatchFromDetail());
    dispatch(getShippingAddress());

    axiosInstance
      .get("/product/bySku/null?type=soundBox")
      .then((response: any) => {
        const raw = response?.data?.data ?? response?.data ?? [];
        const mapped = Array.isArray(raw)
          ? raw.map((item: any) => ({
              label: item.name,
              value: item.sku,
              hsn: item.hsn,
            }))
          : [];
        setProductOptions(mapped);
      })
      .catch(() => {
        // axiosInstance interceptor already toasts errors
      });
  }, []);

  const handleBillAddressChange = (value: any) => {
    if (value) {
      setValue("billaddressid", value.code);
      setValue("billaddress.label", value.label);
      setValue("billaddress.addressLine1", value.addressLine1);
      setValue("billaddress.addressLine2", value.addressLine2);
      setValue("billaddress.gst", value.gst);
      setValue("billaddress.pin", value.pin);
    }
  };
  const handleShipAddressChange = (value: any) => {
    if (value) {
      setValue("shipaddressid", value.code);
      setValue("shipaddress.label", value.label);
      setValue("shipaddress.addressLine1", value.addressLine1);
      setValue("shipaddress.addressLine2", value.addressLine2);
      setValue("shipaddress.city", value.city);
      setValue("shipaddress.pin", value.pin);
    }
  };
  const billLabel = watch("billaddress.label");
  const shipLabel = watch("shipaddress.label");
  useEffect(() => {
    if (isEdit) {
      dispatch(getPODetail({ id: id })).then((response: any) => {
        if (response.payload.success) {
          const { bill, ship, materials, header } = response.payload.data;

          setValue("billaddressid", bill?.code || "");
          handleBillAddressChange(bill || "");
          setValue("shipaddressid", ship?.code || "");
          handleShipAddressChange(ship || "");
          setValue("placeOfSupply", header?.placeOfSupply || "");
          setValue("stateCode", header?.stateCode || "");
          setValue("challanNo", header?.challanNo || "");
          setValue("boxNo", header?.boxNo || "");
          setValue("ewayBillNo", header?.ewayBillNo || "");
          setValue("vehicleNo", header?.vehicleNo || "");

          if (header?.challanDate) {
            try {
              const [day, month, year] = String(header.challanDate).split("-");
              const parsedDate = dayjs(`${year}-${month}-${day}`);
              if (parsedDate.isValid()) setValue("challanDate", parsedDate);
            } catch (error) {
              console.error("Error parsing date:", error);
            }
          }

          setRowData(
            materials.map((item: any) => ({
              id: String(item.updateid ?? ""),
              partComponent: {
                label: item.component_short,
                value: item.componentKey,
                hsn: item.hsncode,
              },
              hsnCode: item.hsncode || "",
              qty: Number(item.orderqty) || 0,
              rate: Number(item.rate) || 0,
              amount: (Number(item.orderqty) || 0) * (Number(item.rate) || 0),
              isNew: true,
              updaterow: item.updateid,
            })),
          );
        }
      });
    }
  }, [isEdit]);

  return (
    <>
      <ConfirmationModel
        open={alert}
        onClose={() => setAlert(false)}
        title="Are you sure?"
        content="Are you sure you want to reset all fields and table data?"
        cancelText="Cancel"
        confirmText="Continue"
        onConfirm={() => {
          resetall();
          dispatch(resetDocumentFile());
          dispatch(resetFormData());
          setActiveStep(0);
          setAlert(false);
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white w-full flex-1 min-h-0 flex flex-col overflow-hidden">
        <MaterialInvardUploadDocumentDrawer open={upload} setOpen={setUpload} />
        {loading && <FullPageLoading />}
        <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          <div className="flex-shrink-0 h-[50px] flex items-center w-full px-[20px] bg-neutral-50 border-b border-neutral-300">
            <Stepper activeStep={activeStep} className="w-full">
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>

          {activeStep === 0 && (
            <div className="h-[calc(100vh-200px)] py-[20px] sm:px-[10px] md:px-[30px] lg:px-[50px] flex flex-col gap-[20px] overflow-y-auto">
              {/* SECTION 1: Bill From */}
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.shipping />
                  <h2 className="text-lg font-semibold">Bill From</h2>
                </div>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    borderColor: "#f59e0b",
                    flexGrow: 1,
                  }}
                />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                <Controller
                  name="billFrom.companyName"
                  control={control}
                  rules={{ required: "Bill From Address is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      value={
                        dispatchFromDetails?.data?.find(
                          (address: any) => address.code === field.value,
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.code || "");
                        setValue(
                          "billFrom.addressLine1",
                          newValue?.addressLine1 || "",
                        );
                        setValue(
                          "billFrom.addressLine2",
                          newValue?.addressLine2 || "",
                        );
                        setValue("billFrom.city", newValue?.city || "");
                        setValue("billFrom.pin", newValue?.pin || "");
                        setValue("billFrom.gstin", newValue?.gst || "");
                      }}
                      disablePortal
                      id="bill-from-address"
                      options={dispatchFromDetails || []}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Bill From Address"
                          error={!!errors.billFrom?.companyName}
                          helperText={errors.billFrom?.companyName?.message}
                          variant="filled"
                        />
                      )}
                    />
                  )}
                />
                <TextField
                  variant="filled"
                  multiline
                  rows={3}
                  error={!!errors.billFrom?.addressLine1}
                  helperText={errors?.billFrom?.addressLine1?.message}
                  focused={!!watch("billFrom.addressLine1")}
                  fullWidth
                  label="Address Line 1"
                  className="h-[100px] resize-none"
                  {...register("billFrom.addressLine1", {
                    required: "Address Line 1 is required",
                  })}
                />
                <TextField
                  variant="filled"
                  multiline
                  rows={3}
                  error={!!errors.billFrom?.addressLine2}
                  helperText={errors?.billFrom?.addressLine2?.message}
                  focused={!!watch("billFrom.addressLine2")}
                  fullWidth
                  label="Address Line 2"
                  className="h-[100px] resize-none"
                  {...register("billFrom.addressLine2")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.billFrom?.city}
                  helperText={errors?.billFrom?.city?.message}
                  focused={!!watch("billFrom.city")}
                  fullWidth
                  label="City/State"
                  {...register("billFrom.city")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.billFrom?.pin}
                  helperText={errors?.billFrom?.pin?.message}
                  focused={!!watch("billFrom.pin")}
                  fullWidth
                  label="Pin Code"
                  {...register("billFrom.pin")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.billFrom?.gstin}
                  helperText={errors?.billFrom?.gstin?.message}
                  focused={!!watch("billFrom.gstin")}
                  fullWidth
                  label="GSTIN"
                  {...register("billFrom.gstin")}
                />
              </div>

              {/* SECTION 2: Ship From */}
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.building />
                  <h2 className="text-lg font-semibold">Ship From</h2>
                </div>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    borderColor: "#f59e0b",
                    flexGrow: 1,
                  }}
                />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                <Controller
                  name="shipFrom.companyName"
                  control={control}
                  rules={{ required: "Ship From Address is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      value={
                        shippingAddress?.data?.find(
                          (address: any) => address.code === field.value,
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.code || "");
                        setValue(
                          "shipFrom.addressLine1",
                          newValue?.addressLine1 || "",
                        );
                        setValue(
                          "shipFrom.addressLine2",
                          newValue?.addressLine2 || "",
                        );
                        setValue("shipFrom.city", newValue?.city || "");
                        setValue("shipFrom.pin", newValue?.pin || "");
                        setValue("shipFrom.gstin", newValue?.gst || "");
                      }}
                      disablePortal
                      id="ship-from-address"
                      options={shippingAddress || []}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Ship From Address"
                          error={!!errors.shipFrom?.companyName}
                          helperText={errors.shipFrom?.companyName?.message}
                          variant="filled"
                        />
                      )}
                    />
                  )}
                />
                <TextField
                  variant="filled"
                  multiline
                  rows={3}
                  error={!!errors.shipFrom?.addressLine1}
                  helperText={errors?.shipFrom?.addressLine1?.message}
                  focused={!!watch("shipFrom.addressLine1")}
                  fullWidth
                  label="Address Line 1"
                  className="h-[100px] resize-none"
                  {...register("shipFrom.addressLine1", {
                    required: "Address Line 1 is required",
                  })}
                />
                <TextField
                  variant="filled"
                  multiline
                  rows={3}
                  error={!!errors.shipFrom?.addressLine2}
                  helperText={errors?.shipFrom?.addressLine2?.message}
                  focused={!!watch("shipFrom.addressLine2")}
                  fullWidth
                  label="Address Line 2"
                  className="h-[100px] resize-none"
                  {...register("shipFrom.addressLine2")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.shipFrom?.city}
                  helperText={errors?.shipFrom?.city?.message}
                  focused={!!watch("shipFrom.city")}
                  fullWidth
                  label="City/State"
                  {...register("shipFrom.city")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.shipFrom?.pin}
                  helperText={errors?.shipFrom?.pin?.message}
                  focused={!!watch("shipFrom.pin")}
                  fullWidth
                  label="Pin Code"
                  {...register("shipFrom.pin")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.shipFrom?.gstin}
                  helperText={errors?.shipFrom?.gstin?.message}
                  focused={!!watch("shipFrom.gstin")}
                  fullWidth
                  label="GSTIN"
                  {...register("shipFrom.gstin")}
                />
              </div>

              {/* SECTION 3: Bill To */}
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.shipping />
                  <h2 className="text-lg font-semibold">Bill To</h2>
                </div>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    borderColor: "#f59e0b",
                    flexGrow: 1,
                  }}
                />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                <Controller
                  name="billaddressid"
                  rules={{
                    required: {
                      value: true,
                      message: "Bill Address is required",
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      value={
                        dispatchFromDetails?.data?.find(
                          (address: any) => address.code === field.value,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        handleBillAddressChange(newValue)
                      }
                      disablePortal
                      id="combo-box-demo"
                      options={dispatchFromDetails || []}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={(billLabel || "Bill Address") as any}
                          error={!!errors.billaddressid}
                          helperText={(errors as any).billaddressid?.message}
                          variant="filled"
                        />
                      )}
                    />
                  )}
                />
                <TextField
                  variant="filled"
                  error={!!errors.billaddress?.addressLine1}
                  helperText={errors?.billaddress?.addressLine1?.message}
                  focused={!!watch("billaddress.addressLine1")}
                  multiline
                  rows={3}
                  fullWidth
                  label="Address Line 1"
                  className="h-[100px] resize-none"
                  {...register("billaddress.addressLine1")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.billaddress?.addressLine2}
                  helperText={errors?.billaddress?.addressLine2?.message}
                  focused={!!watch("billaddress.addressLine2")}
                  multiline
                  rows={3}
                  fullWidth
                  label="Address Line 2"
                  className="h-[100px] resize-none"
                  {...register("billaddress.addressLine2")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.billaddress?.gst}
                  helperText={errors?.billaddress?.gst?.message}
                  focused={!!watch("billaddress.gst")}
                  fullWidth
                  label="GSTIN"
                  {...register("billaddress.gst")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.billaddress?.pin}
                  helperText={errors?.billaddress?.pin?.message}
                  focused={!!watch("billaddress.pin")}
                  fullWidth
                  label="Pin Code"
                  {...register("billaddress.pin")}
                />
              </div>

              {/* SECTION 4: Ship To */}
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.building />
                  <h2 className="text-lg font-semibold">Ship To</h2>
                </div>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    borderColor: "#f59e0b",
                    flexGrow: 1,
                  }}
                />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                <Controller
                  name="shipaddressid"
                  rules={{
                    required: {
                      value: true,
                      message: "Ship Address is required",
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      value={
                        shippingAddress?.data?.find(
                          (address: any) => address.code === field.value,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        handleShipAddressChange(newValue)
                      }
                      disablePortal
                      id="combo-box-demo"
                      options={shippingAddress || []}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={(shipLabel || "Ship Address") as any}
                          error={!!errors.shipaddressid}
                          helperText={(errors as any).shipaddressid?.message}
                          variant="filled"
                        />
                      )}
                    />
                  )}
                />
                <TextField
                  variant="filled"
                  error={!!errors.shipaddress?.addressLine1}
                  helperText={errors?.shipaddress?.addressLine1?.message}
                  focused={!!watch("shipaddress.addressLine1")}
                  multiline
                  rows={3}
                  fullWidth
                  label="Address Line 1"
                  className="h-[100px] resize-none"
                  {...register("shipaddress.addressLine1")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.shipaddress?.addressLine2}
                  helperText={errors?.shipaddress?.addressLine2?.message}
                  focused={!!watch("shipaddress.addressLine2")}
                  multiline
                  rows={3}
                  fullWidth
                  label="Address Line 2"
                  className="h-[100px] resize-none"
                  {...register("shipaddress.addressLine2")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.shipaddress?.city}
                  helperText={errors?.shipaddress?.city?.message}
                  focused={!!watch("shipaddress.city")}
                  fullWidth
                  label="City"
                  {...register("shipaddress.city")}
                />
                <TextField
                  variant="filled"
                  error={!!errors.shipaddress?.pin}
                  helperText={errors?.shipaddress?.pin?.message}
                  focused={!!watch("shipaddress.pin")}
                  fullWidth
                  label="Pin Code"
                  {...register("shipaddress.pin")}
                />
              </div>

              {/* SECTION 5: Document Details */}
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.documentDetail />
                  <h2 className="text-lg font-semibold">Document Details</h2>
                </div>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    borderColor: "#f59e0b",
                    flexGrow: 1,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-[30px] py-[20px]">
                <TextField
                  variant="filled"
                  error={!!errors.placeOfSupply}
                  helperText={errors?.placeOfSupply?.message}
                  focused={!!watch("placeOfSupply")}
                  fullWidth
                  label="Place of Supply"
                  {...register("placeOfSupply", {
                    required: "Place of Supply is required",
                  })}
                />
                <TextField
                  variant="filled"
                  error={!!errors.stateCode}
                  helperText={errors?.stateCode?.message}
                  focused={!!watch("stateCode")}
                  fullWidth
                  label="State Code"
                  {...register("stateCode", {
                    required: "State Code is required",
                  })}
                />
                <TextField
                  variant="filled"
                  error={!!errors.challanNo}
                  helperText={errors?.challanNo?.message}
                  focused={!!watch("challanNo")}
                  fullWidth
                  label="Challan Number"
                  {...register("challanNo", {
                    required: "Challan No is required",
                  })}
                />
                <TextField
                  variant="filled"
                  error={!!errors.boxNo}
                  helperText={errors?.boxNo?.message}
                  focused={!!watch("boxNo")}
                  fullWidth
                  label="Box ID"
                  {...register("boxNo", {
                    required: "Box No is required",
                  })}
                />
                <Controller
                  name="challanDate"
                  control={control}
                  rules={{
                    required: "Challan Date is required",
                    validate: (value) => {
                      if (!value) return "Challan Date is required";
                      return dayjs(value).isValid() || "Invalid date";
                    },
                  }}
                  render={({ field }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        enableAccessibleFieldDOMStructure={false}
                        format="DD-MM-YYYY"
                        slots={{
                          textField: TextField,
                        }}
                        slotProps={{
                          textField: {
                            variant: "filled",
                            error: !!errors.challanDate,
                            helperText: (errors as any).challanDate?.message,
                            fullWidth: true,
                          },
                        }}
                        value={
                          field.value && dayjs(field.value).isValid()
                            ? dayjs(field.value)
                            : null
                        }
                        onChange={(newValue) => {
                          if (newValue && dayjs(newValue).isValid()) {
                            field.onChange(newValue);
                            dispatch(
                              setFormData({
                                ...formData,
                                challanDate: newValue,
                              }),
                            );
                          }
                        }}
                        sx={{ width: "100%" }}
                        label="Challan Date"
                        name="challanDate"
                      />
                    </LocalizationProvider>
                  )}
                />
                <TextField
                  variant="filled"
                  focused={!!watch("ewayBillNo")}
                  fullWidth
                  label="E-way Bill No"
                  {...register("ewayBillNo")}
                />
                <TextField
                  variant="filled"
                  focused={!!watch("vehicleNo")}
                  fullWidth
                  label="Vehicle Number"
                  {...register("vehicleNo")}
                />
              </div>

              {/* GOODS SECTION moved to form page */}
              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.documentDetail />
                  <h2 className="text-lg font-semibold">Goods Details</h2>
                </div>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    borderColor: "#f59e0b",
                    flexGrow: 1,
                  }}
                />
              </div>
              <div className="p-[20px] flex flex-col gap-[15px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="px-[10px] py-[8px] font-[500]">S.No</th>
                        <th className="px-[10px] py-[8px] font-[500]">
                          Description of Goods (SKU)
                        </th>
                        <th className="px-[10px] py-[8px] font-[500]">
                          HSN/SAC
                        </th>
                        <th className="px-[10px] py-[8px] font-[500]">
                          Quantity
                        </th>
                        <th className="px-[10px] py-[8px] font-[500]">Rate</th>
                        <th className="px-[10px] py-[8px] font-[500]">
                          Amount
                        </th>
                        <th className="px-[10px] py-[8px] font-[500]">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowData.map((row, idx) => (
                        <tr key={row.id}>
                          <td className="px-[10px] py-[8px] w-[60px]">
                            {idx + 1}
                          </td>
                          <td className="px-[10px] py-[8px] min-w-[280px]">
                            <Autocomplete
                              value={row.partComponent}
                              onChange={(_, newValue) => {
                                setRowData((prev) =>
                                  prev.map((r) => {
                                    if (r.id !== row.id) return r;
                                    const nextHsn = newValue?.hsn || r.hsnCode;
                                    const nextAmount =
                                      (r.qty || 0) * (r.rate || 0);
                                    return {
                                      ...r,
                                      partComponent: newValue,
                                      hsnCode: nextHsn || "",
                                      amount: nextAmount,
                                    };
                                  }),
                                );
                              }}
                              disablePortal
                              id={`sku-autocomplete-${row.id}`}
                              options={productOptions}
                              getOptionLabel={(opt) => opt?.label || ""}
                              renderInput={(params) => (
                                <TextField {...params} variant="filled" />
                              )}
                            />
                          </td>
                          <td className="px-[10px] py-[8px] w-[160px]">
                            <TextField
                              variant="filled"
                              value={row.hsnCode || ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                setRowData((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, hsnCode: v } : r,
                                  ),
                                );
                              }}
                            />
                          </td>
                          <td className="px-[10px] py-[8px] w-[130px]">
                            <TextField
                              variant="filled"
                              type="number"
                              required
                              inputProps={{ min: 1 }}
                              value={row.qty === 0 ? "" : row.qty}
                              onChange={(e) => {
                                const v = e.target.value;
                                setRowData((prev) =>
                                  prev.map((r) => {
                                    if (r.id !== row.id) return r;
                                    const nextQty = v === "" ? 0 : Number(v);
                                    return {
                                      ...r,
                                      qty: nextQty,
                                      amount: nextQty * (r.rate || 0),
                                    };
                                  }),
                                );
                              }}
                            />
                          </td>
                          <td className="px-[10px] py-[8px] w-[130px]">
                            <TextField
                              variant="filled"
                              type="number"
                              required
                              value={row.rate === 0 ? "" : row.rate}
                              onChange={(e) => {
                                const v = e.target.value;
                                setRowData((prev) =>
                                  prev.map((r) => {
                                    if (r.id !== row.id) return r;
                                    const nextRate = v === "" ? 0 : Number(v);
                                    return {
                                      ...r,
                                      rate: nextRate,
                                      amount: (r.qty || 0) * nextRate,
                                    };
                                  }),
                                );
                              }}
                            />
                          </td>
                          <td className="px-[10px] py-[8px] w-[140px]">
                            {(row.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-[10px] py-[8px] w-[70px]">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setRowData((prev) =>
                                  prev.filter((r) => r.id !== row.id),
                                );
                              }}
                            >
                              <Icons.delete />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="px-[10px] py-[8px]" colSpan={3}>
                          <strong>Total</strong>
                        </td>
                        <td className="px-[10px] py-[8px]">
                          <strong>
                            {rowData.reduce((acc, r) => acc + (r.qty || 0), 0)}
                          </strong>
                        </td>
                        <td className="px-[10px] py-[8px]" />
                        <td className="px-[10px] py-[8px]">
                          <strong>
                            {rowData
                              .reduce((acc, r) => acc + (r.amount || 0), 0)
                              .toFixed(2)}
                          </strong>
                        </td>
                        <td className="px-[10px] py-[8px]" />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="text-slate-700">
                  <p className="font-[500]">Amount Chargeable (in Words)</p>
                  <p className="text-[14px]">
                    {inrRupeesInWordsUpper(
                      rowData.reduce((acc, r) => acc + (r.amount || 0), 0),
                    )}
                  </p>
                </div>

                <LoadingButton
                  variant="contained"
                  sx={{ width: "fit-content" }}
                  startIcon={<Icons.add />}
                  onClick={() => {
                    const newId =
                      typeof crypto !== "undefined" &&
                      (crypto as any).randomUUID
                        ? (crypto as any).randomUUID()
                        : `${Date.now()}_${Math.random()}`;
                    setRowData((prev) => [
                      ...prev,
                      {
                        id: newId,
                        partComponent: null,
                        hsnCode: "",
                        qty: 0,
                        rate: 0,
                        amount: 0,
                        isNew: true,
                      },
                    ]);
                  }}
                >
                  Add Row
                </LoadingButton>
              </div>
            </div>
          )}
          {activeStep === 1 && (
            <div className="flex-1 min-h-0 w-full overflow-auto">
              <div className="px-[20px] py-[20px]">
                <SerialNumberUpload
                  onSerialNumbersChange={(serials: string[]) =>
                    setSerialNumbers(serials)
                  }
                />
              </div>
            </div>
          )}
          {activeStep === 2 && (
            <div className="h-[calc(100vh-200px)] flex items-center justify-center">
              <div className="flex flex-col justify-center gap-[10px]">
                <Success />
                <Typography variant="inherit" fontWeight={500}>
                  PO No. : {minNo}
                </Typography>
                <LoadingButton
                  onClick={() => setActiveStep(0)}
                  variant="contained"
                >
                  Create New PO
                </LoadingButton>
              </div>
            </div>
          )}
          <div className="h-[50px] border-t border-neutral-300 flex items-center justify-end px-[20px] bg-neutral-50 gap-[10px] relative">
            {activeStep === 0 && (
              <>
                <LoadingButton
                  sx={{ background: "white", color: "red" }}
                  variant="contained"
                  startIcon={<Icons.refreshv2 />}
                  onClick={() => {
                    setAlert(true);
                  }}
                >
                  Reset
                </LoadingButton>

                <LoadingButton
                  type="submit"
                  variant="contained"
                  endIcon={<Icons.next />}
                  onClick={() => {
                    onSubmit(watch());
                  }}
                >
                  Next
                </LoadingButton>
              </>
            )}
            {activeStep === 1 && (
              <>
                <LoadingButton
                  disabled={loading}
                  sx={{ background: "white", color: "red" }}
                  variant="contained"
                  startIcon={<Icons.previous />}
                  onClick={() => {
                    handleBack();
                  }}
                >
                  Back
                </LoadingButton>
                <LoadingButton
                  disabled={loading}
                  sx={{ background: "white", color: "red" }}
                  variant="contained"
                  startIcon={<Icons.refreshv2 />}
                  onClick={() => {
                    setAlert(true);
                  }}
                >
                  Reset
                </LoadingButton>
                <LoadingButton
                  loading={loading}
                  loadingPosition="start"
                  variant="contained"
                  startIcon={<Icons.save />}
                  onClick={() => {
                    finalSubmit();
                  }}
                >
                  Submit
                </LoadingButton>
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default BulkDeviceInward;
