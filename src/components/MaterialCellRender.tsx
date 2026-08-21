import AntBatchSelect from "@/components/reusable/antSelecters/AntBatchSelect";
import AntCompSelect from "@/components/reusable/antSelecters/AntCompSelect";
import AntLocationSelectAcordinttoModule from "@/components/reusable/antSelecters/AntLocationSelectAcordinttoModule";
import AntSkuSelect from "@/components/reusable/antSelecters/AntSkuSelect";
import {
  getAvailbleQty,
  getDeviceBatches,
  getSwipeAvailbleQty,
} from "@/features/production/MaterialRequestWithoutBom/MRRequestWithoutBomSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { Input } from "antd";
import React, { memo, useEffect, useState } from "react";

interface MaterialInvardCellRendererProps {
  props: any;
  customFunction: () => void;
  module?: string;
}

const formatDisplayValue = (field: string, val: any): string => {
  if (val == null || val === "") return "";
  if (field === "code" || field === "pickLocation" || field === "batch") {
    return val?.label || val?.lable || val?.text || "";
  }
  return String(val);
};

const AvailableQtyCell = memo<{ data: any, onChange?: any }>(({ data, onChange }) => {
  const { availbleQtyData } = useAppSelector(
    (state) => state.materialRequestWithoutBom,
  );


  const [availbleQty, setAvailbleQty] = useState<any>();
  console.log(availbleQty,"data")

  const itemCode = data?.code?.value;
  const locationCode = data?.pickLocation?.value;
  const batchId = data?.batch?.value;

  useEffect(() => {
    if (!availbleQtyData || !itemCode || !locationCode) {
      setAvailbleQty("--");
      return;
    }

    const matchingItem:any = availbleQtyData.find(
      (item) =>
        item.location === locationCode &&
        item.item === itemCode &&
        item.batchId === batchId,
    );
      console.log(matchingItem);
    setAvailbleQty(matchingItem?.Stock);
    onChange(String(matchingItem?.Stock));
  }, [availbleQtyData, itemCode, locationCode, batchId]);

  return <span>{availbleQty}</span>;
});

AvailableQtyCell.displayName = "AvailableQtyCell";

const MaterialCellRender: React.FC<MaterialInvardCellRendererProps> = ({
  props,
  customFunction,
  module,
}) => {
  const dispatch = useAppDispatch();
  const { type } = useAppSelector((state) => state.materialRequestWithoutBom);
  const { value, colDef, data, api } = props;

  const refreshCell = (columns: string[]) => {
    api.refreshCells({ rowNodes: [props.node], columns });
  };

  const getStockType = () =>
    type === "device" && module !== "swipe" ? "SKU" : "RM";

  const fetchAvailableQty = (
    itemCode: string,
    location: { value?: string } | string,
    batchId?: string,
  ) => {
    const fetchQty =
      module === "swipe" ? getSwipeAvailbleQty : getAvailbleQty;
    dispatch(
      fetchQty({
        itemCode,
        type: getStockType(),
        location,
        ...(batchId ? { batchId } : {}),
      }),
    );
  };

  const handleInputChange = (e: any) => {
  data[colDef.field] = e?.target ? e.target.value : e;
    refreshCell([colDef.field]);
  };

  const renderContent = () => {
    switch (colDef.field) {
      case "code":
        return type === "device" ? (
          <AntSkuSelect
            onChange={(selectedValue) => {
              data[colDef.field] = selectedValue;
              // Stock lookup for SKU requires a batchId, which isn't known
              // until the batch dropdown (populated from this device, after
              // pick location) is selected — so no fetchAvailableQty call here.
              data.batch = null;
              // Fetch the batch list here rather than relying on
              // AntBatchSelect's own effect — ag-grid can reuse cell params
              // across refreshes, so a prop-driven fetch can lag behind.
              if (selectedValue?.deviceKey) {
                dispatch(getDeviceBatches({ deviceKey: selectedValue.deviceKey }));
              }
              refreshCell([colDef.field, "batch"]);
            }}
            value={value}
          />
        ) : (
          <AntCompSelect
            getUom={(unitValue) => {
              data.unit = unitValue;
              refreshCell(["orderqty"]);
              customFunction();
            }}
            onChange={(selectedValue) => {
              data[colDef.field] = selectedValue;

              if (selectedValue && data?.pickLocation) {
                fetchAvailableQty(
                  selectedValue.value || "",
                  data.pickLocation,
                );
              }
              refreshCell([colDef.field]);
            }}
            value={value}
          />
        );

      case "pickLocation":
        return (
          <AntLocationSelectAcordinttoModule
            endpoint="/request/pickLocation"
            onChange={(locationValue) => {
              data[colDef.field] = locationValue;

              // For SKU rows, the stock lookup needs a batchId, which is
              // only available once the batch is chosen (after location).
              if (locationValue && data?.code && type !== "device") {
                fetchAvailableQty(
                  data.code?.value ?? data.code,
                  locationValue.value,
                );
              }
              refreshCell([colDef.field, "batch"]);
            }}
            value={value}
          />
        );

      case "batch":
        return (
          <AntBatchSelect
            deviceKey={data.code?.deviceKey}
            onChange={(selectedValue) => {
              data[colDef.field] = selectedValue;
              data.orderqty =
                selectedValue?.totalQty != null
                  ? String(selectedValue.totalQty)
                  : data.orderqty;

              if (selectedValue && data?.code && data?.pickLocation) {
                fetchAvailableQty(
                  data.code?.value ?? data.code,
                  data.pickLocation,
                  selectedValue.value,
                );
              }
              refreshCell([colDef.field, "orderqty", "availableqty"]);
            }}
            value={value}
          />
        );

      case "orderqty":
      {
        console.log(value,"data")
          return (
          <div className="flex items-center h-full w-full">
            <Input
              suffix={data.unit}
              min={0}
              onChange={(e) => {
                const unit = (data?.unit || "").toString().toLowerCase();
                const valueStr = e.target.value;
                const isDecimalAllowed = unit === "ltr" || unit === "kg";
                const decimalPattern = /^\d*(?:\.\d*)?$/;
                const integerPattern = /^\d*$/;

                if (
                  (isDecimalAllowed && decimalPattern.test(valueStr)) ||
                  (!isDecimalAllowed && integerPattern.test(valueStr))
                ) {
                  handleInputChange(e);
                }
              }}
              value={value}
              placeholder={colDef.headerName}
              className="custom-input w-full"
            />
          </div>
        );
      }

      case "remarks":
        return (
          <Input
            onChange={handleInputChange}
            value={value}
            type="text"
            placeholder={colDef.headerName}
            className="custom-input w-full"
          />
        );

      case "availableqty":
        return <AvailableQtyCell data={data} onChange={handleInputChange}   />;

      default:
        return <span>{formatDisplayValue(colDef.field, value)}</span>;
    }
  };

  if (data.isNew) {
    return renderContent();
  }

  return <span>{formatDisplayValue(colDef.field, value)}</span>;
};

export default MaterialCellRender;
