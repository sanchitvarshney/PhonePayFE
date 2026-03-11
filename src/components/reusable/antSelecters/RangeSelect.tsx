import React, { useState } from "react";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  value?: { from: Dayjs | null; to: Dayjs | null };
  onChange?: (dates: { from: Dayjs | null; to: Dayjs | null }) => void;
  disabledDate?: (current: Dayjs | null) => boolean;
  format?: string;
  className?: string;
  placeholder?: [string, string];
  presets?: { label: string; value: [Dayjs, Dayjs] }[];
}

const RangeSelect: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  disabledDate,
  format = "DD/MM/YYYY",
  className = "",
  placeholder = ["Start date", "End date"],
  presets,
}) => {
  const [internalValue, setInternalValue] = useState<{
    from: Dayjs | null;
    to: Dayjs | null;
  }>({ from: null, to: null });

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    const updatedValue = {
      from: dates ? dates[0] : null,
      to: dates ? dates[1] : null,
    };
    setInternalValue(updatedValue);
    if (onChange) onChange(updatedValue);
  };

  const computedValue = value || internalValue;
  return (
    <RangePicker
      className={`w-full h-[50px] border-[2px] rounded-sm ${className} border-neutral-400/70 hover:border-neutral-400`}
      presets={presets}
      onChange={handleDateChange}
      disabledDate={disabledDate}
      placeholder={placeholder}
      value={
        computedValue.from && computedValue.to
          ? [computedValue.from, computedValue.to]
          : null
      }
      format={format}
    />
  );
};

export default RangeSelect;
