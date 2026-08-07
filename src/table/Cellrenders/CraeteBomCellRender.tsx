import AntCompSelect from "@/components/reusable/antSelecters/AntCompSelect";
import { Input, Select } from "antd";
import React from "react";

interface CraeteBomProps {
  props: any;
  customFunction: () => void;
}

const categoryOptions = [
  { value: "PART", label: "PART" },
  { value: "PCB", label: "PCB" },
  { value: "OTHER", label: "OTHER" },
  { value: "PACKING", label: "PACKING" },
];
const CraeteBomCellRender: React.FC<CraeteBomProps> = ({ props, customFunction }) => {
  const { value, colDef, data, api, column } = props;

  const handleInputChange = (e: any) => {
    const newValue = e.target.value;
    data[colDef.field] = newValue;
    api.refreshCells({
      rowNodes: [props.node],
      columns: [column, "id", "component", "qty", "remark", "reference"],
    });
  };

  const renderContent = () => {
    switch (colDef.field) {
      case "component":
        return (
          <AntCompSelect
            getUom={(value) => {
              data.uom = value;
              api.refreshCells({
                rowNodes: [props.node],
                columns: [column, "component", "remark", "qty", "uom", "reference"],
              });
              customFunction();
            }}
            onChange={(selectedValue) => {
              data[colDef.field] = selectedValue;
              api.refreshCells({
                rowNodes: [props.node],
                columns: [column, "component", "remark", "qty", "uom", "reference"],
              });
            }}
            value={value}
          />
        );
      case "category":
        return (
          <Select
            value={value || undefined}
            placeholder="Category"
            style={{ width: "100%" }}
            onChange={(val) => {
              data[colDef.field] = val;
              api.refreshCells({
                rowNodes: [props.node],
                columns: [column, "component", "remark", "qty", "uom", "reference"],
              });
            }}
            options={categoryOptions}
            className="custom-input"
          />
        );
      case "status":
        return (
          <Select
            style={{ width: "100%" }}
            className="custom-input"
            value={value || "1"}
            onChange={(selectedValue) => {
              data[colDef.field] = selectedValue;
              api.refreshCells({
                rowNodes: [props.node],
                columns: [column, "component", "remark", "qty", "uom", "reference"],
              });
            }}
            options={[
              { label: "Active", value: "1" },
              { label: "Inactive", value: "0" },
            ]}
          />
        );
      case "qty":
        return (
          <Input
            value={value}
            placeholder={colDef.headerName}
            className="custom-input"
            style={{ width: "100%" }}
            onChange={(e) => {
              if (/^-?\d*\.?\d*$/.test(e.target.value)) {
                if (Number(e.target.value) >= 0) {
                  handleInputChange(e);
                }
              }
            }}
          />
        );
      case "reference":
        return (
          <Input
            value={value}
            placeholder={colDef.headerName}
            className="custom-input"
            style={{ width: "100%" }}
            onChange={(e) => {
              handleInputChange(e);
            }}
          />
        );
      case "remark":
        return (
          <Input
            value={value}
            placeholder={colDef.headerName}
            className="custom-input"
            style={{ width: "100%" }}
            onChange={(e) => {
              handleInputChange(e);
            }}
          />
        );
    }
  };

  if (data.isNew) {
    return renderContent();
  }
  return <span>{value}</span>;
};

export default CraeteBomCellRender;
