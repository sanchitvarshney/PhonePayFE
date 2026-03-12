import { Input } from "antd";
import React, { useEffect, useCallback } from "react";
import { useAppSelector } from "@/hooks/useReduxHook";
import AntLocationSelectAcordinttoModule from "@/components/reusable/antSelecters/AntLocationSelectAcordinttoModule";
import { formatNumber } from "@/utils/numberFormatUtils";
import { showToast } from "@/utils/toasterContext";

interface POCellRendererProps {
  props: any;
  customFunction: () => void;
}

const MINFromPOTextInputCellRenderer: React.FC<POCellRendererProps> = ({
  props,
  customFunction,
}) => {
  const { value, colDef, data, api } = props;
  const { currencyData } = useAppSelector((state) => state.common);

  useEffect(() => {
    if (data.isNew) {
      customFunction();
    }
  }, [value, data.isNew, customFunction]);

  const updateCellAndRefresh = useCallback(
    (newValue: any, field: string) => {
      data[field] = newValue;
      api.applyTransaction({
        update: [data],
      });
      if (data.isNew) {
        customFunction();
      }
    },
    [data, api, customFunction]
  );

  const renderContent = () => {
    switch (colDef.field) {
      case "partComponent":
        return <span>{value}</span>;
      case "location":
        return (
          <AntLocationSelectAcordinttoModule
            endpoint="/transaction/rm-inward-location"
            onChange={(value) => {
              updateCellAndRefresh(value, colDef.field);
            }}
            value={value}
          />
        );
      case "rate":
        return (
          <div className="flex items-center gap-[5px]">
            <Input
              min={0}
              onChange={(e) => {
                if (/^-?\d*\.?\d*$/.test(e.target.value)) {
                  const newValue = e.target.value;
                  updateCellAndRefresh(newValue, colDef.field);

                  if (
                    currencyData?.find((item) => item.id === data.currency)
                      ?.text === "₹"
                  ) {
                    updateCellAndRefresh(0, "foreignValue");
                    updateCellAndRefresh(
                      Number(data.qty) * Number(newValue),
                      "taxableValue"
                    );
                  } else if (data.currency === "0" || data.currency === "") {
                    updateCellAndRefresh(
                      Number(data.qty) * Number(newValue),
                      "taxableValue"
                    );
                  } else {
                    updateCellAndRefresh(
                      Number(data.qty) * Number(newValue),
                      "foreignValue"
                    );
                    updateCellAndRefresh(
                      Number(data.qty) *
                        Number(newValue) *
                        Number(data.excRate),
                      "taxableValue"
                    );
                  }

                  const taxableValue = data.taxableValue;
                  if (data.gstType === "L") {
                    const sgst =
                      ((Number(data.gstRate) / 100) * taxableValue) / 2;
                    const cgst =
                      ((Number(data.gstRate) / 100) * taxableValue) / 2;
                    updateCellAndRefresh(sgst, "sgst");
                    updateCellAndRefresh(cgst, "cgst");
                    updateCellAndRefresh(0, "igst");
                  } else {
                    updateCellAndRefresh(0, "sgst");
                    updateCellAndRefresh(0, "cgst");
                    const igst = (Number(data.gstRate) / 100) * taxableValue;
                    updateCellAndRefresh(igst, "igst");
                  }
                }
              }}
              value={value}
              placeholder={colDef.headerName}
              className="w-[100%] custom-input"
            />
          </div>
        );
      case "qty":
        return (
          <Input
            suffix={data.uom}
            onChange={(e) => {
              if (/^-?\d*\.?\d*$/.test(e.target.value)) {
                const newValue = e.target.value;
                const pendingQty = Number(data.pendingQty) || 0;
                const numQty = Number(newValue) || 0;
                if (newValue !== "" && pendingQty > 0 && numQty > pendingQty) {
                  showToast("Qty cannot exceed pending qty", "error");
                  return;
                }
                updateCellAndRefresh(newValue, colDef.field);

                let taxableValue = numQty * Number(data.rate);
                if (data.excRate != 0 && data.excRate != "") {
                  taxableValue =
                    numQty * Number(data.rate) * Number(data.excRate);
                  updateCellAndRefresh(
                    numQty * Number(data.rate),
                    "foreignValue"
                  );
                }
                updateCellAndRefresh(taxableValue, "taxableValue");

                if (data.gstType === "L") {
                  const sgst =
                    ((Number(data.gstRate) / 100) * taxableValue) / 2;
                  const cgst =
                    ((Number(data.gstRate) / 100) * taxableValue) / 2;
                  updateCellAndRefresh(sgst, "sgst");
                  updateCellAndRefresh(cgst, "cgst");
                  updateCellAndRefresh(0, "igst");
                } else {
                  updateCellAndRefresh(0, "sgst");
                  updateCellAndRefresh(0, "cgst");
                  const igst = (Number(data.gstRate) / 100) * taxableValue;
                  updateCellAndRefresh(igst, "igst");
                }
              }
            }}
            value={value}
            placeholder={colDef.headerName}
            className="w-[100%] custom-input"
          />
        );
      case "taxableValue":
      case "foreignValue":
      case "gstRate":
      case "cgst":
      case "sgst":
      case "igst":
        return <span>{formatNumber(value)}</span>;
      case "hsnCode":
        return <span>{data.hsnCode}</span>;
      case "remarks":
      case "gstType":
        return <span>{value}</span>;
      case "orderremark":
        return (
          <Input
            onChange={(e) => {
              updateCellAndRefresh(e.target.value, colDef.field);
            }}
            value={value}
            type="text"
            placeholder={colDef.headerName}
            className="w-[100%] custom-input"
          />
        );
    }
  };

  if (data.isNew) {
    return renderContent();
  }

  return <span>{formatNumber(value)}</span>;
};

export default React.memo(MINFromPOTextInputCellRenderer);
