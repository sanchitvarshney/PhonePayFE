import React from "react";
import Select, { Props as SelectProps, StylesConfig, components } from "react-select";
import { FaCaretDown } from "react-icons/fa";
import { cn } from "@/lib/utils";

type OptionType = {
  label: string;
  value: string;
  isDisabled?: boolean;
};

interface ReactSelectProps extends SelectProps<OptionType, false> {
  isLoading?: boolean;
  required?: boolean;
  fullborder?: boolean;
}

const DropdownIndicator = (props: any) => (
  <components.DropdownIndicator {...props}>
    <FaCaretDown className="text-slate-400 text-[23px]" />
  </components.DropdownIndicator>
);

const CustomSelect: React.FC<ReactSelectProps> = ({
  isLoading = false,
  components: customComponents = { DropdownIndicator },
  loadingMessage = () => <div className="text-sm text-slate-500">Loading...</div>,
  fullborder = false,
  options,
  required = false,
  placeholder = "Select an option",
  className,
  ...props
}) => {
  const styles: StylesConfig<OptionType, false> = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: fullborder ? "5px" : "",
      border: fullborder ? "1px solid #94a3b8" : "none",
      borderBottom: !fullborder && state.isFocused ? "1px solid #94a3b8" : "1px solid #94a3b8",
      borderColor: "#94a3b8",
      boxShadow: "none",
      color: "#475569",
      background: "transparent",
      fontSize: "15px",
      cursor: "pointer",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#e2e8f0" : state.isFocused ? "#fff" : "white",
      color: "#475569",
      cursor: "pointer",
      borderRadius: "5px",
      transition: "all 0.1s",
      fontSize: "15px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#475569",
    }),
    menu: (provided) => ({
      ...provided,
      background: "#fff",
      borderRadius: "10px",
      border: "none",
      boxShadow:
        "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
    }),
    menuList: (provided) => ({
      ...provided,
      background: "#fff",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "5px",
      borderRadius: "10px",
    }),
  };

  return (
    <Select
      isClearable
      styles={styles}
      components={customComponents}
      isLoading={isLoading}
      isSearchable
      loadingMessage={loadingMessage}
      options={options}
      className={cn(className)}
      placeholder={
        required ? (
          <span>
            {placeholder} <span className="text-red-500 text-[15px]">*</span>
          </span>
        ) : (
          placeholder
        )
      }
      {...props}
    />
  );
};

export default CustomSelect;

