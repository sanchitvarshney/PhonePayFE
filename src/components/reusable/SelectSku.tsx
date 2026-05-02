import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import useDebounce from "@/hooks/useDebounce";
import axiosInstance from "@/api/axiosInstance";

export type DeviceType = {
  id: string;
  text: string;
};
type Props = {
  onChange: (value: DeviceType | null) => void;
  value: any | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  varient?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
  disabled?: boolean;
};

const SelectDevice: React.FC<Props> = ({ value, onChange, label = "Search Device", width = "100%", error, helperText, varient = "outlined", required = false, size = "medium", disabled = false }) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [deviceList, setDeviceList] = useState<DeviceType[]>([]);

  // Fetch devices based on SKU query
  const fetchDevices = async (query: string | null) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/product/bySku/${query}`);
      setDeviceList(response.data.data); // Response is based on the LocationApiresponse type
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedInputValue) {
      fetchDevices(debouncedInputValue);
    }
  }, [debouncedInputValue]);

  return (
    <Autocomplete
      disabled={disabled}
      onFocus={() => fetchDevices(null)}
      value={value}
      size={size}
      options={deviceList || []}
      getOptionLabel={(option) => `${option.text}`}
      filterSelectedOptions
      onChange={(_, value) => {
        onChange(value);
      }}
      loading={loading}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      onInputChange={(_, newInputValue, reason) => {
        (reason === "input" || reason === "clear") && setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          required={required}
          error={error}
          helperText={helperText}
          {...params}
          label={label}
          variant={varient}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div>
            <p className="text-[13px]">{`${option.text}`}</p>
          </div>
        </li>
      )}
      sx={{ width }}
    />
  );
};

export default SelectDevice;
