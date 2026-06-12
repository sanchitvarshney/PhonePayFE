import AntCompSelect from "@/components/reusable/antSelecters/AntCompSelect";
import { Input } from "antd";
import React from "react";
// import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";

interface MaterialInvardCellRendererProps {
  props: any;
  customFunction: () => void;
}

const CreateProductionCellrenderer: React.FC<MaterialInvardCellRendererProps> = ({ props,customFunction }) => {
  // const dispatch = useAppDispatch();
  const { value, colDef, data, api, column } = props;

  const handleInputChange = (e: any) => {
    const newValue = e.target.value;
    data[colDef.field] = newValue; // update the data
    api.refreshCells({ rowNodes: [props.node], columns: [column, "component", "remark", "requiredQty", "uom"] });
  };

  const renderContent = () => {
    switch (colDef.field) {
      case "component":
        return (
          <AntCompSelect
          getUom={(value) => {
            data.uom = value;
            api.refreshCells({ rowNodes: [props.node], columns: [column, "component", "remark", "requiredQty", "uom"] });
            customFunction();
          }}
          onChange={(selectedValue) => {
            const newValue = selectedValue;
            data[colDef.field] = newValue;
            api.refreshCells({ rowNodes: [props.node], columns: [column, "component", "remark", "requiredQty", "uom"] });
          }}
          value={value}
        />
        );
      case "requiredQty":
        return <Input className="custom-input" suffix={data.uom}  onChange={(e) => {
          if (/^-?\d*\.?\d*$/.test(e.target.value)) {
            if (Number(e.target.value) >= 0) {
              handleInputChange(e);
            }
          }
        }} value={value}  placeholder={colDef.headerName} />;
      case "remark":
        return <Input className="custom-input" onChange={handleInputChange} value={value} type="text" placeholder={colDef.headerName} />;

      case "componentName":
        return <Input className=" border-0" value={value} type="text" placeholder={colDef.headerName} readOnly/>;

        case "partCode":
          return <Input className=" border-0" value={value} type="text" placeholder={colDef.headerName} readOnly/>;

      case "category":
        return <Input className=" border-0" value={value} type="text" placeholder={colDef.headerName} readOnly/>;

    }
  };

  if (data.isNew) {
    return renderContent();
  }
  return <span>{value}</span>;
};

export default CreateProductionCellrenderer;
