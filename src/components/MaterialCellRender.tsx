import AntCompSelect from "@/components/reusable/antSelecters/AntCompSelect";
import AntLocationSelectAcordinttoModule from "@/components/reusable/antSelecters/AntLocationSelectAcordinttoModule";
import {
  getAvailbleQty,
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
  if (field === "code" || field === "pickLocation") {
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

  useEffect(() => {
    if (!availbleQtyData || !itemCode || !locationCode) {
      setAvailbleQty("--");
      return;
    }

    const matchingItem:any = availbleQtyData.find(
      (item) => item.location === locationCode && item.item === itemCode,
    );
      console.log(matchingItem);
    setAvailbleQty(matchingItem?.Stock);
    onChange(String(matchingItem?.Stock));
  }, [availbleQtyData, itemCode, locationCode]);

  return <span>{availbleQty}</span>;
});

AvailableQtyCell.displayName = "AvailableQtyCell";

const MaterialCellRender: React.FC<MaterialInvardCellRendererProps> = ({
  props,
  customFunction,
  module,
}) => {
  const dispatch = useAppDispatch();
  const { value, colDef, data, api } = props;

  const refreshCell = (columns: string[]) => {
    api.refreshCells({ rowNodes: [props.node], columns });
  };

  const handleInputChange = (e: any) => {
  data[colDef.field] = e?.target ? e.target.value : e;
    refreshCell([colDef.field]);
  };

  const renderContent = () => {
    switch (colDef.field) {
      case "code":
        return (
          <AntCompSelect
            getUom={(unitValue) => {
              data.unit = unitValue;
              refreshCell(["orderqty"]);
              customFunction();
            }}
            onChange={(selectedValue) => {
              data[colDef.field] = selectedValue;

              if (selectedValue && data?.pickLocation) {
                const fetchQty =
                  module === "swipe" ? getSwipeAvailbleQty : getAvailbleQty;
                dispatch(
                  fetchQty({
                    itemCode: selectedValue.value || "",
                    type: "RM",
                    location: data.pickLocation,
                  }),
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

              if (locationValue && data?.code) {
                const fetchQty =
                  module === "swipe" ? getSwipeAvailbleQty : getAvailbleQty;
                dispatch(
                  fetchQty({
                    itemCode: data.code?.value ?? data.code,
                    type: "RM",
                    location: locationValue.value,
                  }),
                );
              }
              refreshCell([colDef.field]);
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

export default memo(MaterialCellRender);
