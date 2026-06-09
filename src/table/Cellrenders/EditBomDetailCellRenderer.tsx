import React from "react";
import { Input, Select } from "antd";

const categoryOptions = [
  { value: "PART", label: "PART" },
  { value: "PCB", label: "PCB" },
  { value: "OTHER", label: "OTHER" },
  { value: "PACKING", label: "PACKING" },
];

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const EditBomDetailCellRenderer: React.FC<any> = ({ value, colDef, data, api, column, node }) => {
  const handleChange = (newValue: any) => {
    data[colDef.field] = newValue;
    api.refreshCells({
      rowNodes: [node],
      columns: [column],
    });
  };

  if (colDef.field === "bomstatus") {
    return (
      <Select
        value={value}
        style={{ width: "100%" }}
        onChange={(value) => {
          data[colDef.field] = value;
          api.refreshCells({
            rowNodes: [node],
            columns: [column],
          });
        }}
        options={statusOptions}
        className="custom-select"
      />
    );
  }

  if (colDef.field === "requiredQty") {
    return (
      <Input
        className="custom-input"
        value={value}
        onChange={(e) => {
          if (/^-?\d*\.?\d*$/.test(e.target.value)) {
            if (Number(e.target.value) >= 0) {
              handleChange(e.target.value);
            }
          }
        }}
        style={{ width: "100%" }}
      />
    );
  }

  if (colDef.field === "category") {
    return (
      <Select
        value={value}
        style={{ width: "100%" }}
        onChange={(value) => {
          data[colDef.field] = value;
          api.refreshCells({
            rowNodes: [node],
            columns: [column],
          });
        }}
        options={categoryOptions}
        className="custom-select"
      />
    );
  }

  return <span>{value}</span>;
};

export default EditBomDetailCellRenderer;
