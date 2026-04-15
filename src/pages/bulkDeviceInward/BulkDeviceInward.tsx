import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import MaterialInvardUploadDocumentDrawer from "@/components/Drawers/wearhouse/MaterialInvardUploadDocumentDrawer";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  clearaddressdetail,
} from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import {
  resetDocumentFile,
} from "@/features/wearhouse/Rawmin/RawMinSlice";
import {
  Autocomplete,
  Divider,
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
// import AddPOTable from "./AddPOTable";
import {
  createBulkDeviceInward,
  getPODetail,
  setFormData,
  updatePO,
} from "@/features/procurement/poSlices";
import { useNavigate } from "react-router-dom";
import FullPageLoading from "@/components/shared/FullPageLoading";
import SerialNumberUpload from "@/components/procurement/SerialNumberUpload";

interface SingleRowData {
  id: string;
  partComponent: {
    label: string;
    value: string;
    id: string;
    sku: string;
    device_key: string;
    device_model: string;
    device_modal: string;
  } | null;
  hsnCode: string;
  qty: number;
  rate: number;
  updaterow?: string;
}

function newSingleRowId(): string {
  return typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : `${Date.now()}_${Math.random()}`;
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

const defaultFormValues: FormData = {
  billaddressid: "",
  billaddress: {
    id: 0,
    gst: "",
    pin: "",
    addressLine1: "",
    addressLine2: "",
    label: "",
  },
  shipaddressid: "",
  shipaddress: {
    id: 0,
    pin: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    label: "",
  },
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
};

const deriveDeviceModelFromText = (text: string): string => {
  if (!text) return "";
  return text.replace(/^\s*\([^)]*\)\s*/, "").trim();
};

const BulkDeviceInward: React.FC = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState<boolean>(false);
  const [minNo, setMinno] = useState<string>("");
  const [upload, setUpload] = useState<boolean>(false);
  const [singleRow, setSingleRow] = useState<SingleRowData>({
    id: newSingleRowId(),
    partComponent: null,
    hsnCode: "",
    qty: 0,
    rate: 0,
  });
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [skuOptions, setSkuOptions] = useState<
    Array<{
      label: string;
      value: string;
      id: string;
      sku: string;
      device_key: string;
      device_model: string;
      device_modal: string;
    }>
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
    defaultValues: defaultFormValues,
  });

  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Form Details", "Add Component Details", "Review & Submit"];

  const handleBack = () => {
    // Set form values from Redux state before going back
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
    setActiveStep((prevStep) => prevStep - 1);
  };

  const resetall = () => {
    setSingleRow({
      id: newSingleRowId(),
      partComponent: null,
      hsnCode: "",
      qty: 0,
      rate: 0,
    });
    setSerialNumbers([]);
    reset(defaultFormValues);
    dispatch(resetDocumentFile());
    dispatch(clearaddressdetail());
    dispatch(setFormData(null as any));
    setActiveStep(0);
    setMinno("");
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
    if (!formData) {
      showToast("Please fill form details first", "error");
      return;
    }
    if (!singleRow.partComponent) {
      showToast("Please select a product", "error");
      return;
    }
    if (!singleRow.qty || singleRow.qty <= 0) {
      showToast("Please enter valid quantity", "error");
      return;
    }
    if (!singleRow.rate || singleRow.rate <= 0) {
      showToast("Please enter valid rate", "error");
      return;
    }

    const component = singleRow.partComponent?.value || "";
    const qty = singleRow.qty;
    const rate = singleRow.rate;
    const hsncode = singleRow.hsnCode;

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
      sku: singleRow.partComponent?.sku || "",
      device_key: singleRow.partComponent?.device_key || "",
      device_model: singleRow.partComponent?.device_model || "",
      device_modal: singleRow.partComponent?.device_modal || "",
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
      updaterow:
        singleRow.updaterow !== undefined && singleRow.updaterow !== null
          ? singleRow.updaterow
          : "",
      poid: id,
      vendor_type: "v01",
    };
    if (isEdit) {
      dispatch(updatePO(payload)).then((response: any) => {
        const body = response?.payload?.data ?? response?.payload ?? {};
        if (body?.success === true || String(body?.status).toLowerCase() === "success") {
          showToast(body?.message ?? "Details Submitted successfully", "success");
          resetall();
          navigate("/procurement/manage");
        } else {
          showToast(body?.message ?? "Failed to submit details", "error");
        }
      });
    } else {
      dispatch(createBulkDeviceInward(payload)).then((response: any) => {
        const requestStatus = response?.meta?.requestStatus;
        const body = response?.payload?.data ?? response?.payload ?? {};
        const statusText = String(body?.status ?? body?.data?.status ?? "").toLowerCase();
        const isSuccess =
          requestStatus === "fulfilled" &&
          (body?.success === true ||
            body?.data?.success === true ||
            statusText === "success");

        if (isSuccess) {
          showToast(
            body?.message ??
              body?.data?.message ??
              "Device inward created successfully",
            "success"
          );
          const ref =
            body?.data?.po_id ??
            body?.data?.id ??
            body?.data?.dc_id ??
            body?.dc_id ??
            body?.data?.challan_no ??
            body?.challan_no ??
            "";
          resetall();
          setMinno(ref ? String(ref) : "");
          setActiveStep(2);
        } else {
          showToast(
            body?.message ??
              body?.data?.message ??
              "Failed to create device inward",
            "error"
          );
        }
      });
    }
  };
  useEffect(() => {
    dispatch(getDispatchFromDetail());
    dispatch(getShippingAddress());
  }, []);

  useEffect(() => {
    const fetchSkuOptions = async () => {
      try {
        const response = await axiosInstance.get(
          "/product/bySku/null?type=soundBox",
        );
        const options =
          response.data.data?.map((item: any) => ({
            label: item.text,
            value: item.id,
            id: item.id,
            sku: item.sku ?? item.text ?? "",
            device_key: item.device_key ?? item.deviceKey ?? item.id ?? "",
            device_modal:
              item.device_modal ??
              item.device_model ??
              item.deviceModel ??
              deriveDeviceModelFromText(item.text ?? ""),
          })) ?? [];
        setSkuOptions(options);
      } catch (error) {
        console.error("Failed to fetch SKU options", error);
      }
    };
    fetchSkuOptions();
  }, []);

  const handleBillAddressChange = (value: any) => {
    if (value) {
      setValue("billaddress.label", value.label);
      setValue("billaddress.addressLine1", value.addressLine1);
      setValue("billaddress.addressLine2", value.addressLine2);
      setValue("billaddress.gst", value.gst);
      setValue("billaddress.pin", value.pin);
    }
  };
  const handleShipAddressChange = (value: any) => {
    if (value) {
      setValue("shipaddress.label", value.label);
      setValue("shipaddress.addressLine1", value.addressLine1);
      setValue("shipaddress.addressLine2", value.addressLine2);
      setValue("shipaddress.city", value.city);
      setValue("shipaddress.pin", value.pin);
    }
  };

  const handleBillFromAddressFill = (value: any) => {
    if (value) {
      setValue(
        "billFrom.addressLine1",
        value.addressLine1 || "",
      );
      setValue(
        "billFrom.addressLine2",
        value.addressLine2 || "",
      );
      setValue("billFrom.city", value.city || "");
      setValue("billFrom.pin", value.pin || "");
      setValue("billFrom.gstin", value.gst || "");
    }
  };
  const handleShipFromAddressFill = (value: any) => {
    if (value) {
      setValue(
        "shipFrom.addressLine1",
        value.addressLine1 || "",
      );
      setValue(
        "shipFrom.addressLine2",
        value.addressLine2 || "",
      );
      setValue("shipFrom.city", value.city || "");
      setValue("shipFrom.pin", value.pin || "");
      setValue("shipFrom.gstin", value.gst || "");
    }
  };
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

          const first = materials[0];
          if (first) {
            setSingleRow({
              id: String(first.updateid ?? newSingleRowId()),
              partComponent: first.componentKey
                ? {
                    label: first.component_short || "",
                    value: first.componentKey,
                    id: String(first.componentKey),
                    sku: first.sku || first.component_short || "",
                    device_key:
                      first.device_key || first.deviceKey || String(first.componentKey),
                    device_model:
                      first.device_model ||
                      first.deviceModel ||
                      deriveDeviceModelFromText(first.component_short || ""),
                    device_modal:
                      first.device_modal || first.device_model || first.deviceModal || "",
                  }
                : null,
              hsnCode: first.hsncode || "",
              qty: Number(first.orderqty) || 0,
              rate: Number(first.rate) || 0,
              updaterow: first.updateid,
            });
          }
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
                      options={
                        dispatchFromDetails?.data ||
                        dispatchFromDetails ||
                        []
                      }
                      getOptionLabel={(option: any) => option.label || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        !!value && option.code === value.code
                      }
                      value={
                        (
                          dispatchFromDetails?.data ||
                          dispatchFromDetails ||
                          []
                        ).find(
                          (item: any) => item.code === field.value,
                        ) ?? null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.code ?? "");
                        handleBillFromAddressFill(newValue);
                      }}
                      disablePortal
                      id="bill-from-address"
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
                      options={
                        shippingAddress?.data || shippingAddress || []
                      }
                      getOptionLabel={(option: any) => option.label || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        !!value && option.code === value.code
                      }
                      value={
                        (
                          shippingAddress?.data ||
                          shippingAddress ||
                          []
                        ).find(
                          (item: any) => item.code === field.value,
                        ) ?? null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.code ?? "");
                        handleShipFromAddressFill(newValue);
                      }}
                      disablePortal
                      id="ship-from-address"
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
                      options={
                        dispatchFromDetails?.data ||
                        dispatchFromDetails ||
                        []
                      }
                      getOptionLabel={(option: any) => option.label || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        !!value && option.code === value.code
                      }
                      value={
                        (
                          dispatchFromDetails?.data ||
                          dispatchFromDetails ||
                          []
                        ).find(
                          (item: any) => item.code === field.value,
                        ) ?? null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.code ?? "");
                        handleBillAddressChange(newValue);
                      }}
                      disablePortal
                      id="combo-box-bill-to"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Bill To Address"
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
                      options={
                        shippingAddress?.data || shippingAddress || []
                      }
                      getOptionLabel={(option: any) => option.label || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        !!value && option.code === value.code
                      }
                      value={
                        (
                          shippingAddress?.data ||
                          shippingAddress ||
                          []
                        ).find(
                          (item: any) => item.code === field.value,
                        ) ?? null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.code ?? "");
                        handleShipAddressChange(newValue);
                      }}
                      disablePortal
                      id="combo-box-ship-to"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Ship To Address"
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
            </div>
          )}
          {activeStep === 1 && (
            <div className="flex-1 min-h-0 w-full overflow-auto">
              <div className="px-[20px] py-[20px] flex flex-col gap-[20px]">
                <div className="grid grid-cols-3 gap-[30px]">
                  <Autocomplete
                    value={singleRow.partComponent}
                    onChange={(_, newValue) =>
                      setSingleRow((prev) => ({
                        ...prev,
                        partComponent: newValue,
                      }))
                    }
                    disablePortal
                    options={skuOptions}
                    getOptionLabel={(option) => option.label || ""}
                    isOptionEqualToValue={(option, value) =>
                      !!value && option.value === value.value
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Description of Goods (SKU)"
                        variant="filled"
                      />
                    )}
                  />
                  <TextField
                    variant="filled"
                    label="HSN/SAC Code"
                    value={singleRow.hsnCode}
                    onChange={(e) =>
                      setSingleRow((prev) => ({
                        ...prev,
                        hsnCode: e.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    variant="filled"
                    type="number"
                    label="Quantity"
                    value={singleRow.qty === 0 ? "" : singleRow.qty}
                    onChange={(e) =>
                      setSingleRow((prev) => ({
                        ...prev,
                        qty: Number(e.target.value),
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    variant="filled"
                    type="number"
                    label="Rate"
                    value={singleRow.rate === 0 ? "" : singleRow.rate}
                    onChange={(e) =>
                      setSingleRow((prev) => ({
                        ...prev,
                        rate: Number(e.target.value),
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    variant="filled"
                    label="Amount"
                    value={(singleRow.qty * singleRow.rate).toFixed(2)}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </div>
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
                  onClick={() => resetall()}
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
