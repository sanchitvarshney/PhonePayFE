import { Input, Select } from "antd";
import { IoMdCheckmark } from "react-icons/io";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { transformSkuCode } from "@/utils/transformUtills";
import { Button, Typography } from "@mui/material";
import AntCompSelect from "@/components/reusable/antSelecters/AntCompSelect";
import AntLocationSelectAcordinttoModule from "@/components/reusable/antSelecters/AntLocationSelectAcordinttoModule";
import { getPOComponentDetail } from "@/features/procurement/poSlices";

interface POCellRendererProps {
  props: any;
  customFunction: () => void;
}
const POCellRenderer: React.FC<POCellRendererProps> = ({ props, customFunction }) => {
  const { value, colDef, data, api, column } = props;
  const [currency, setCurrency] = useState<string>(data.excRate);
  const [open, setOpen] = useState<boolean>(false);
  const { currencyData, currencyLoaidng } = useAppSelector((state) => state.common);
  const dispatch = useAppDispatch();

  useEffect(() => {
    customFunction();
  }, [value]);
  const handleChange = (value: string) => {
    const newValue = value;
    data[colDef.field] = newValue; // update the data
    if (data.gstType === "L") {
      data["sgst"] = ((Number(data.gstRate) / 100) * Number(data.taxableValue)) / 2;
      data["cgst"] = ((Number(data.gstRate) / 100) * Number(data.taxableValue)) / 2;
      data["igst"] = 0;
    } else {
      data["sgst"] = 0;
      data["cgst"] = 0;
      data["igst"] = (Number(data.gstRate) / 100) * Number(data.taxableValue);
    }
    api.refreshCells({ rowNodes: [props.node], columns: [column, "taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "excRate"] }); // refresh the cell to show the new value
  };
  const handleInputChange = (e: any) => {
    const newValue = e.target.value;
    data[colDef.field] = newValue; // update the data
    data["taxableValue"] = Number(data.qty) * Number(data.rate);
    if (data.excRate != 0 || data.excRate != "") {
      data["taxableValue"] = Number(data.qty) * Number(data.rate) * Number(data.excRate);
    }
    if (data.gstType === "L") {
      data["sgst"] = ((Number(data.gstRate) / 100) * Number(data.taxableValue)) / 2;
      data["cgst"] = ((Number(data.gstRate) / 100) * Number(data.taxableValue)) / 2;
      data["igst"] = 0;
    } else {
      data["sgst"] = 0;
      data["cgst"] = 0;
      data["igst"] = (Number(data.gstRate) / 100) * Number(data.taxableValue);
    }
    api.refreshCells({ rowNodes: [props.node], columns: [column, "taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "excRate"] }); // refresh the cell to show the new value
  };

  const renderContent = () => {
    switch (colDef.field) {
      case "partComponent":
        return (
          // <Select
          //   filterOption={false}
          //   showSearch
          //   loading={getPartCodeLoading}
          //   className="w-full custom-select"
          //   value={value}
          //   onSearch={(input) => dispatch(getPertCodesync(input ? input : null))}
          //   placeholder={colDef.headerName}
          //   onChange={(selectedValue) => {
          //     handleChange(selectedValue);
          //   }}
          //   options={partCodeData?.map((item) => ({
          //     value: item.id,
          //     label: `${item.part_code}-${item.text}`,
          //   }))}
          // />
          <AntCompSelect
            getUom={(value) => {
              data.uom = value;
              api.refreshCells({ rowNodes: [props.node], columns: [column, "component", "remark", "qty", "uom"] });
              customFunction();
            }}
            onChange={(selectedValue) => {
              const newValue = selectedValue;
              dispatch(getPOComponentDetail(newValue?.value || "")).then((res:any) => {
                if(res.payload.data.status==="success"){
                  data["hsnCode"]=res.payload.data.data.hsn;
                }
              });
              data[colDef.field] = newValue;
              api.refreshCells({ rowNodes: [props.node], columns: [column, "component", "remark", "qty", "uom"] });
              api.refreshCells({ rowNodes: [props.node], columns: [column, "taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "excRate"] });
              
            }}
            value={
              value
                ? {
                    ...value,
                    label: value?.label || value?.text || value?.lable,
                  }
                : null
            }
          />
        );
      case "gstType":
        return (
          <Select
            onKeyDown={(e) => e.preventDefault()}
            value={value}
            className="w-full custom-input"
            placeholder="Select gst type"
            onChange={(value) => handleChange(value)}
            options={[
              { value: "L", label: "Local" },
              { value: "I", label: "Inter State" },
            ]}
            
          />
        );
      case "location":
        return (
          <AntLocationSelectAcordinttoModule
            endpoint="/transaction/rm-inward-location"
            onChange={(value) => {
              const newValue = value;
              data[colDef.field] = newValue; // update the data
              api.refreshCells({ rowNodes: [props.node], columns: [column, "taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "excRate"] });
            }}
            value={value}
          />
        );
      case "autoConsump":
        return (
          <Select
            className="w-full custom-input"
            defaultValue=""
            onChange={(value) => handleChange(value)}
            options={[{ value: "N", label: "NO" }]}
          />
        );
      case "currency":
        return (
          <div className="flex items-center gap-[5px]">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger>
                <Button type="button" variant={"outlined"}>
                  {currencyData?.find((item) => item.id === value)?.text}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-[10px] w-[350px] shadow-none" style={{ boxShadow: "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" }}>
                <Typography fontSize={"16px"} fontWeight={"500"}>
                  Choose Currency & Enter Currency Rate
                </Typography>
                <div className="flex items-center gap-[10px]">
                  <Select
                    loading={currencyLoaidng}
                    className="w-[60px] h-[40px] "
                    defaultValue="₹"
                    value={value}
                    onSelect={(e) => {
                      data["currency"] = e;
                      api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency"] }); // refresh the cell to show the new value
                    }}
                    onChange={(e) => {
                      data.currency = e;
                      api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] }); // refresh the cell to show the new value
                      if (currencyData?.find((item) => item.id === e)?.text === "₹") {
                        data["foreignValue"] = 0;
                        data["taxableValue"] = Number(data.qty) * Number(data.rate);
                        api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] });
                      } else if (currency === "0" || currency === "") {
                        data["taxableValue"] = Number(data.qty) * Number(data.rate);
                        api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] }); // refresh the cell to show the new value
                      } else {
                        data["foreignValue"] = Number(data.qty) * Number(data.rate);
                        data["taxableValue"] = Number(data.qty) * Number(data.rate) * Number(currency);
                        api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] }); // refresh the cell to show the new value
                      }
                    }}
                    options={transformSkuCode(currencyData)}
                  />
                  <Input
                    disabled={currencyData?.find((item) => item.id === data.currency)?.text === "₹"}
                    value={currency}
                    className="h-[40px] custom-input"
                    type="number"
                    placeholder="Exchange Rate"
                    onChange={(e) => {
                      setCurrency(e.target.value);

                      if (currencyData?.find((item) => item.id === data.currency)?.text === "₹") {
                        data["taxableValue"] = Number(data.qty) * Number(data.rate);
                        data["foreignValue"] = 0;
                        api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] }); // refresh the cell to show the new value
                      } else if (e.target.value === "0" || e.target.value === "") {
                        data["taxableValue"] = Number(data.qty) * Number(data.rate);
                        api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] }); // refresh the cell to show the new value
                      } else {
                        data["taxableValue"] = Number(data.qty) * Number(data.rate) * Number(e.target.value);
                        data["foreignValue"] = Number(data.qty) * Number(data.rate);
                        api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] }); // refresh the cell to show the new value
                      }
                      data["excRate"] = Number(e.target.value);
                      api.refreshCells({ rowNodes: [props.node], columns: [, "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue", "excRate"] });
                    }}
                  />
                </div>
                <div className="mt-[10px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <p className="font-[500]">Total Cost in ₹:</p>
                    <p className="text-[14px]">{data.taxableValue}</p>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <p className="font-[500]">Total Cost in {currencyData?.find((item: any) => item.id === data.currency)?.text}:</p>
                    <p className="text-[14px]">{data.currency == "₹" ? data.taxableValue : data.foreignValue}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-[10px] h-[50px] mt-[10px]">
                  <Button type="button" onClick={() => setOpen(false)} startIcon={<IoMdCheckmark className="h-[18px] w-[18px]" />} variant="contained">
                    Submit
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      case "rate":
        return (
          <div className="flex items-center gap-[5px] ">
            <Input
              min={0}
              onChange={(e) => {
                if (/^-?\d*\.?\d*$/.test(e.target.value)) {
                  handleInputChange(e);
                  if (currencyData?.find((item) => item.id === data.currency)?.text === "₹") {
                    data["foreignValue"] = 0;
                    data["taxableValue"] = Number(data.qty) * Number(data.rate);
                    api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] });
                  } else if (currency === "0" || currency === "") {
                    data["taxableValue"] = Number(data.qty) * Number(data.rate);
                    api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] }); // refresh the cell to show the new value
                  } else {
                    data["foreignValue"] = Number(data.qty) * Number(data.rate);
                    data["taxableValue"] = Number(data.qty) * Number(data.rate) * Number(data.excRate);
                    api.refreshCells({ rowNodes: [props.node], columns: ["taxableValue", "rate", "qty", "igst", "cgst", "sgst", "gstRate", "currency", "foreignValue"] }); // refresh the cell to show the new value
                  }
                }
              }}
              value={value}
              placeholder={colDef.headerName}
              className="w-[100%]  custom-input"
            />
          </div>
        );
      case "qty":
        return (
          <Input
            suffix={data.uom}
            onChange={(e) => {
              if (/^-?\d*\.?\d*$/.test(e.target.value)) {
                handleInputChange(e);
              }
            }}
            value={value}
            placeholder={colDef.headerName}
            className="w-[100%] custom-input"
          />
        );

      case "taxableValue":
        return (
          <div className="flex items-center h-full w-full min-h-[40px]">
            <span>{value % 1 == 0 ? value : value?.toFixed(2) ?? "0.00"}</span>
          </div>
        );
      case "foreignValue":
        return (
          <div className="flex items-center h-full w-full min-h-[40px]">
            <span>{value % 1 == 0 ? value : value?.toFixed(2) ?? "0.00"}</span>
          </div>
        );
      case "hsnCode":
        return <Input onChange={handleInputChange} value={value} type="text" placeholder={colDef.headerName} className="w-[100%] custom-input" />;
      case "gstRate":
        return (
          <Input
            min={0}
            onChange={(e) => {
              if (/^-?\d*\.?\d*$/.test(e.target.value)) {
                handleInputChange(e);
              }
            }}
            value={value}
            placeholder={colDef.headerName}
            className="w-[100%]  custom-input"
            suffix="%"
          />
        );
      case "cgst":
        return (
          <div className="flex items-center h-full w-full min-h-[40px]">
            <span>{value % 1 == 0 ? value : value?.toFixed(2) ?? "0.00"}</span>
          </div>
        );
      case "sgst":
        return (
          <div className="flex items-center h-full w-full min-h-[40px]">
            <span>{value % 1 == 0 ? value : value?.toFixed(2) ?? "0.00"}</span>
          </div>
        );
      case "igst":
        return (
          <div className="flex items-center h-full w-full min-h-[40px]">
            <span>{value % 1 == 0 ? value : value?.toFixed(2) ?? "0.00"}</span>
          </div>
        );
      case "remarks":
        return <Input onChange={handleInputChange} value={value} type="text" placeholder={colDef.headerName} className="w-[100%] custom-input" />;
    }
  };

  if (data.isNew) {
    return renderContent();
  }

  return <span>{value}</span>;
};

export default POCellRenderer;
