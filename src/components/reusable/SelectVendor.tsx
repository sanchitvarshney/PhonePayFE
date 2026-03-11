import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import useDebounce from "@/hooks/useDebounce";
import axiosInstance from "@/api/axiosInstance";

export type VendorData = {
  id: string;
  text: string;
};

type VendorApiResponse = {
  success: boolean;
  data: VendorData[];
  status: string;
};

type Props = {
  onChange: (value: VendorData | null) => void;
  value: VendorData | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  varient?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
};

const SelectVendor: React.FC<Props> = ({
  value,
  onChange,
  label = "Search Vendor",
  width = "100%",
  error,
  helperText,
  varient = "outlined",
  required = false,
  size = "medium",
}) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [vendorList, setVendorList] = useState<VendorData[]>([]);

  const fetchVendors = async (query: string | null) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<VendorApiResponse>(
        `/vendor/vendorOptions/${query}`
      );
      if (response.data.success) {
        setVendorList(response.data.data);
      } else {
        setVendorList([]);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedInputValue) {
      fetchVendors(debouncedInputValue);
    }
  }, [debouncedInputValue]);
  useEffect(() => {
    fetchVendors(null);
  }, []);

  return (
    <Autocomplete
      onFocus={() => fetchVendors(null)}
      value={value}
      size={size}
      options={vendorList || []}
      getOptionLabel={(option) => `${option.text}`}
      filterOptions={(options) => options}
      onChange={(_, val) => onChange(val)}
      loading={loading}
      isOptionEqualToValue={(option, val) => option.id === val?.id}
      onInputChange={(_, newInputValue, reason) => {
        (reason === "input" || reason === "clear") &&
          setInputValue(newInputValue);
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
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div>
            <p className="text-[13px]">{option.text}</p>
          </div>
        </li>
      )}
      sx={{ width }}
    />
  );
};

export default SelectVendor;
