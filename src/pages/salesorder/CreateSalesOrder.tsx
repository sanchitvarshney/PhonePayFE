import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  clearaddressdetail,
} from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import {
  resetDocumentFile,
} from "@/features/wearhouse/Rawmin/RawMinSlice";
import {
  createSalesOrder,
  resetSalesOrderFormData,
  setSalesOrderFormData,
  updateSalesOrder,
} from "@/features/salesOrder/salesOrderSlice";
import {
  Autocomplete,
  Divider,
  InputAdornment,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Icons } from "@/components/icons";
import { showToast } from "@/utils/toasterContext";
import ConfirmationModel from "@/components/reusable/ConfirmationModel";
import axiosInstance from "@/api/axiosInstance";
import {
  getClient,
  getClientShipping,
  getDispatchFromDetail,
    getShippingAddress,
} from "@/features/master/client/clientSlice";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FullPageLoading from "@/components/shared/FullPageLoading";

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
  id: string;
  gst: string;
  pin: string;
  addressLine1: string;
  addressLine2: string;
  label: string;
}

interface ShippingAddress {
  id: string;
  pin: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  label: string;
}

interface BillFromAddress {
  companyName: string;
  id?: string;
  code?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pin: string;
  gstin: string;
}

interface ShipFromAddress {
  companyName: string;
  id?: string;
  code?: string;
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
}

const defaultFormValues: FormData = {
  billaddressid: "",
  billaddress: {
    id: "",
    gst: "",
    pin: "",
    addressLine1: "",
    addressLine2: "",
    label: "",
  },
  shipaddressid: "",
  shipaddress: {
    id: "",
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
};

const deriveDeviceModelFromText = (text: string): string => {
  if (!text) return "";
  return text.replace(/^\s*\([^)]*\)\s*/, "").trim();
};

const normalizeCompareText = (value: unknown): string => {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

export const isOptionMatchedByCodeOrLabel = (option: any, selectedValue: unknown): boolean => {
  const selected = normalizeCompareText(selectedValue);
  if (!selected) return false;
  const optionCode = normalizeCompareText(option?.code ?? option?.id);
  const optionLabel = normalizeCompareText(option?.label ?? option?.companyName);
  return optionCode === selected || optionLabel === selected;
};

const findAddressOptionByCodeOrLabel = (options: any[], selectedValue: unknown) => {
  return options.find((item: any) => isOptionMatchedByCodeOrLabel(item, selectedValue)) ?? null;
};

export const resolveAddressAutocompleteValue = (options: any[], selectedValue: unknown) => {
  const matched = findAddressOptionByCodeOrLabel(options, selectedValue);
  if (matched) return matched;
  const normalized = normalizeCompareText(selectedValue);
  if (!normalized) return null;
  const raw = String(selectedValue ?? "").trim();
  return {
    code: raw,
    id: raw,
    label: raw,
    companyName: raw,
  };
};

const mapSalesOrderDetailsToFormValues = (details: any): FormData => {
  const billAddress = details?.billaddress ?? details?.billAddress ?? {};
  const shipAddress = details?.shipaddress ?? details?.shipAddress ?? {};
  const billFrom = details?.billFrom ?? details?.bill_from ?? {};
  const shipFrom = details?.shipFrom ?? details?.ship_from ?? {};
  const billFromCode =
    billFrom?.code ??
    billFrom?.id ??
    details?.billFromCode ??
    details?.billFromId ??
    details?.bill_from_code ??
    details?.bill_from_id ??
    "";
  const shipFromCode =
    shipFrom?.code ??
    shipFrom?.id ??
    details?.shipFromCode ??
    details?.shipFromId ??
    details?.ship_from_code ??
    details?.ship_from_id ??
    "";

  return {
    billaddressid:
      details?.billaddressid ??
      details?.billaddress_id ??
      details?.billAddressId ??
      billAddress?.code ??
      "",
    billaddress: {
      id: String(
        billAddress?.id ??
          details?.billAddressId ??
          details?.billaddressid ??
          details?.billaddress_id ??
          "",
      ),
      gst:
        billAddress?.gst ??
        billAddress?.gstin ??
        details?.billToGst ??
        "",
      pin: billAddress?.pin ?? details?.billToPin ?? "",
      addressLine1:
        billAddress?.addressLine1 ??
        billAddress?.line1 ??
        details?.billToAddressLine1 ??
        "",
      addressLine2:
        billAddress?.addressLine2 ??
        billAddress?.line2 ??
        details?.billToAddressLine2 ??
        "",
      label: billAddress?.label ?? details?.billToLabel ?? "",
    },
    shipaddressid:
      details?.shipaddressid ??
      details?.shipaddress_id ??
      details?.shipAddressId ??
      shipAddress?.code ??
      "",
    shipaddress: {
      id: String(
        shipAddress?.id ??
          details?.shipAddressId ??
          details?.shipaddressid ??
          details?.shipaddress_id ??
          "",
      ),
      pin: shipAddress?.pin ?? details?.shipToPin ?? "",
      city: shipAddress?.city ?? details?.shipToCity ?? "",
      addressLine1:
        shipAddress?.addressLine1 ??
        shipAddress?.line1 ??
        details?.shipToAddressLine1 ??
        "",
      addressLine2:
        shipAddress?.addressLine2 ??
        shipAddress?.line2 ??
        details?.shipToAddressLine2 ??
        "",
      label: shipAddress?.label ?? details?.shipToLabel ?? "",
    },
    billFrom: {
      companyName:
        String(
          billFrom?.companyName ||
            details?.billFromCompanyName ||
            billFromCode ||
            "",
        ),
      id: String(
        billFrom?.id ??
          details?.billFromId ??
          details?.billFromCode ??
          "",
      ),
      code: String(
        billFrom?.code ??
          details?.billFromCode ??
          details?.billFromId ??
          "",
      ),
      addressLine1:
        billFrom?.addressLine1 ??
        billFrom?.line1 ??
        details?.billFromAddressLine1 ??
        "",
      addressLine2:
        billFrom?.addressLine2 ??
        billFrom?.line2 ??
        details?.billFromAddressLine2 ??
        "",
      city: billFrom?.city ?? details?.billFromCity ?? "",
      pin: billFrom?.pin ?? details?.billFromPin ?? "",
      gstin: billFrom?.gstin ?? billFrom?.gst ?? details?.billFromGstin ?? "",
    },
    shipFrom: {
      companyName:
        String(
          shipFrom?.companyName ||
            details?.shipFromCompanyName ||
            shipFromCode ||
            "",
        ),
      id: String(
        shipFrom?.id ??
          details?.shipFromId ??
          details?.shipFromCode ??
          "",
      ),
      code: String(
        shipFrom?.code ??
          details?.shipFromCode ??
          details?.shipFromId ??
          "",
      ),
      addressLine1:
        shipFrom?.addressLine1 ??
        shipFrom?.line1 ??
        details?.shipFromAddressLine1 ??
        "",
      addressLine2:
        shipFrom?.addressLine2 ??
        shipFrom?.line2 ??
        details?.shipFromAddressLine2 ??
        "",
      city: shipFrom?.city ?? details?.shipFromCity ?? "",
      pin: shipFrom?.pin ?? details?.shipFromPin ?? "",
      gstin: shipFrom?.gstin ?? shipFrom?.gst ?? details?.shipFromGstin ?? "",
    },
  };
};

const mapSalesOrderDetailsToSingleRow = (details: any): SingleRowData => {
  const partValue =
    details?.component ??
    details?.component_id ??
    details?.partcode ??
    details?.sku ??
    "";
  const partLabel =
    details?.component_name ??
    details?.component ??
    details?.deviceModal ??
    details?.device_model ??
    details?.partcode ??
    details?.sku ??
    "";

  return {
    id: newSingleRowId(),
    partComponent: partValue
      ? {
          label: String(partLabel),
          value: String(partValue),
          id: String(partValue),
          sku: String(details?.sku ?? ""),
          device_key: String(
            details?.device_key ??
              details?.deviceKey ??
              details?.device_key_id ??
              details?.deviceKeyId ??
              "",
          ),
          device_model: String(
            details?.deviceModal ??
            details?.device_model ??
              details?.device_modal ??
              deriveDeviceModelFromText(String(partLabel)),
          ),
          device_modal: String(
            details?.device_modal ?? details?.device_model ?? "",
          ),
        }
      : null,
    qty: Number(details?.qty ?? details?.quantity ?? 0),
    rate: Number(details?.rate ?? details?.price ?? 0),
  };
};

const CreateSalesOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { salesOrderId } = useParams<{ salesOrderId?: string }>();
  const resolvedSalesOrderId = salesOrderId
    ? decodeURIComponent(salesOrderId)
    : "";
  const isEditMode = location.pathname.includes("/sales-order/edit/");
  const [alert, setAlert] = useState<boolean>(false);
  const [prefillLoading, setPrefillLoading] = useState<boolean>(false);
  const [singleRow, setSingleRow] = useState<SingleRowData>({
    id: newSingleRowId(),
    partComponent: null,
    qty: 0,
    rate: 0,
  });
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
  const { loading, formData } = useAppSelector(
    (state) => state.salesOrder,
  ) as {
    loading: boolean;
    formData: FormData | null;
  };
  const { dispatchFromDetails, shippingAddress,clientdata, clientShippingdata } = useAppSelector(
    (state) => state.client,
  ) as any;

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

  const resetall = () => {
    setSingleRow({
      id: newSingleRowId(),
      partComponent: null,
      qty: 0,
      rate: 0,
    });
    reset(defaultFormValues);
    dispatch(resetDocumentFile());
    dispatch(clearaddressdetail());
    dispatch(resetSalesOrderFormData());
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
      dispatch(setSalesOrderFormData(data as any));
      finalSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("Error submitting form", "error");
    }
  };
  const finalSubmit = (submittedFormData?: FormData) => {
    const activeFormData: FormData | null = submittedFormData ?? formData;
    if (!activeFormData) {
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

    const payload: any = {
      component,
      sku: singleRow.partComponent?.sku || "",
      device_key: singleRow.partComponent?.device_key || "",
      device_model: singleRow.partComponent?.device_model || "",
      device_modal: singleRow.partComponent?.device_modal || "",
      qty,
      rate,
      serialno: [],
      billFrom: activeFormData.billFrom,
      shipFrom: activeFormData.shipFrom,
      billaddressid: activeFormData.billaddressid,
      billaddress: activeFormData.billaddress,
      shipaddressid: activeFormData.shipaddressid,
      shipaddress: activeFormData.shipaddress,
      orderType: "sales-order",
    };
    const submitAction = isEditMode
      ? updateSalesOrder({
          ...payload,
          salesOrder: resolvedSalesOrderId,
        })
      : createSalesOrder(payload);

    dispatch(submitAction).then((response: any) => {
      console.log(response)
      if(response.payload.data.success) {
        showToast(response.payload.data.message, "success");
        resetall();
        navigate("/sales-order/manage");
      } else {
        showToast(response.payload.data.message, "error");
      }
    }).catch((error: any) => {
      showToast(error.response.data.message, "error");
      console.error("Error creating sales order:", error);
    });
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

  useEffect(() => {
    const fetchSalesOrderDetails = async () => {
      if (!resolvedSalesOrderId) return;

      setPrefillLoading(true);
      try {
        const response = await axiosInstance.get(
          `/salesorder/fetch-salesOrder-details?salesOrder=${encodeURIComponent(
            resolvedSalesOrderId,
          )}`,
        );
        const responseData = response?.data?.data ?? response?.data?.response ?? response?.data;
        const details = Array.isArray(responseData)
          ? responseData[0]
          : Array.isArray(responseData?.data)
            ? responseData.data[0]
            : responseData;

        if (!details) {
          showToast("Sales order details not found", "error");
          return;
        }

        const mappedFormData = mapSalesOrderDetailsToFormValues(details);
        const mappedSingleRow = mapSalesOrderDetailsToSingleRow(details);

        reset(mappedFormData);
        dispatch(setSalesOrderFormData(mappedFormData as any));
        setSingleRow(mappedSingleRow);

        if (mappedSingleRow.partComponent) {
          const selectedPartComponent = mappedSingleRow.partComponent;
          setSkuOptions((previous) => {
            const alreadyPresent = previous.some(
              (option) => option.value === selectedPartComponent.value,
            );
            if (alreadyPresent) return previous;
            return [...previous, selectedPartComponent];
          });
        }
      } catch (error) {
        console.error("Failed to fetch sales order details", error);
        showToast("Failed to fetch sales order details", "error");
      } finally {
        setPrefillLoading(false);
      }
    };

    fetchSalesOrderDetails();
  }, [dispatch, reset, resolvedSalesOrderId]);

  const handleBillAddressChange = (value: any) => {
    if (value) {
      setValue("billaddress.id", String(value.id ?? value.code ?? ""));
      setValue("billaddress.label", value.name);
      setValue("billaddress.addressLine1", value.addressLine1);
      setValue("billaddress.addressLine2", value.addressLine2);
      setValue("billaddress.gst", value.gst);
      setValue("billaddress.pin", value.pinCode);
    }
      dispatch(getClientShipping({id: value.code}));
    };
  const handleShipAddressChange = (value: any) => {
    
    if (value) {
      setValue("shipaddress.id", String(value.shipId ?? value.code ?? ""));
      setValue("shipaddress.label", value.company);
      setValue("shipaddress.addressLine1", value.address1);
      setValue("shipaddress.addressLine2", value.address2);
      setValue("shipaddress.city", value.city);
      setValue("shipaddress.pin", value.pincode);
    }
  };

  const handleBillFromAddressFill = (value: any) => {
    if (value) {
      setValue("billFrom.id", String(value.id ?? value.code ?? ""));
      setValue("billFrom.code", String(value.code ?? value.id ?? ""));
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
      setValue("shipFrom.id", String(value.id ?? value.code ?? ""));
      setValue("shipFrom.code", String(value.code ?? value.id ?? ""));
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
    dispatch(getClient());
    
  }, []);

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
          setAlert(false);
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white w-full flex-1 min-h-0 flex flex-col overflow-hidden">
        {(loading || prefillLoading) && <FullPageLoading />}
        <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
            <div className="h-[calc(100vh-150px)] py-[20px] sm:px-[10px] md:px-[30px] lg:px-[50px] flex flex-col gap-[20px] overflow-y-auto">
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
                      getOptionLabel={(option: any) =>
                        option?.label || option?.companyName || option?.code || option?.id || ""
                      }
                      isOptionEqualToValue={(option: any, value: any) =>
                        !!value &&
                        isOptionMatchedByCodeOrLabel(option, value?.code ?? value?.label)
                      }
                      value={
                        resolveAddressAutocompleteValue(
                          dispatchFromDetails?.data || dispatchFromDetails || [],
                          field.value,
                        )
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.code ?? newValue?.label ?? "");
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
                      getOptionLabel={(option: any) =>
                        option?.label || option?.companyName || option?.code || option?.id || ""
                      }
                      isOptionEqualToValue={(option: any, value: any) =>
                        !!value &&
                        isOptionMatchedByCodeOrLabel(option, value?.code ?? value?.label)
                      }
                      value={
                        resolveAddressAutocompleteValue(
                          shippingAddress?.data || shippingAddress || [],
                          field.value,
                        )
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.code ?? newValue?.label ?? "");
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
                        clientdata?.data ||
                        clientdata ||
                        []
                      }
                      getOptionLabel={(option: any) => option.name || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        !!value && option.code === value.code
                      }
                      value={
                        (
                          clientdata?.data ||
                          clientdata ||
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
                        clientShippingdata?.[0]?.shipAddress || clientShippingdata || []
                      }
                      getOptionLabel={(option: any) => option.company || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        !!value && option.shipId === value.code
                      }
                      value={
                        (
                          clientShippingdata?.[0]?.shipAddress ||
                          clientShippingdata ||
                          []
                        ).find(
                          (item: any) => item.shipId === field.value,
                        ) ?? null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.shipId ?? "");
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

              <div className="flex items-center w-full gap-3">
                <div className="flex items-center gap-[5px]">
                  <Icons.documentDetail />
                  <h2 className="text-lg font-semibold">SKU Details</h2>
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
                        label="Select SKU"
                        variant="filled"
                      />
                    )}
                  />
                  <TextField
                    variant="filled"
                    type="number"
                    label="Quantity"
                    value={singleRow.qty === 0 ? "" : singleRow.qty}
                    onChange={(e) => {
                      const rawQty = e.target.value;
                      const nextQty = rawQty === "" ? 0 : Math.trunc(Number(rawQty));
                      setSingleRow((prev) => ({
                        ...prev,
                        qty: nextQty,
                      }));
                    }}
                    fullWidth
                    inputProps={{ min: 1, step: 1 }}
                    InputProps={{ endAdornment: <InputAdornment position="end">pcs</InputAdornment> }}
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
            </div>
          <div className="h-[50px] border-t border-neutral-300 flex items-center justify-end px-[20px] bg-neutral-50 gap-[10px] relative">
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
              type="submit"
              loading={loading}
              loadingPosition="start"
              variant="contained"
              startIcon={<Icons.save />}
            >
              {isEditMode ? "Update" : "Submit"}
            </LoadingButton>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateSalesOrder;
