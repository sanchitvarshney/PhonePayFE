import React, { useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axiosInstance from "@/api/axiosInstance";

export type Bomtype = {
  code: string;
  name: string;
};
type Props = {
  onChange: (value: Bomtype | null) => void;
  value: Bomtype | null | any;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  varient?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
  id?:string;
};

const SelectBom: React.FC<Props> = ({ value, onChange, label = "Search Device", width = "100%", error, helperText, varient = "outlined", required = false, size = "medium" ,id }) => {
//   const [inputValue, setInputValue] = useState("");
//   const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [bomList, setBomList] = useState<Bomtype[]>([]);

  // Fetch devices based on SKU query
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/bom/productBoms/${id}`);
      setBomList(response.data.data); // Response is based on the LocationApiresponse type
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      onFocus={() => fetchDevices()}
      value={value}
      size={size}
      options={bomList || []}
      getOptionLabel={(option) => `${option.name}`}
      filterSelectedOptions
      onChange={(_, value) => {
        onChange(value);
      }}
      loading={loading}
      isOptionEqualToValue={(option, value) => option.code === value?.code}
      onInputChange={(_, reason) => {
        (reason === "input" || reason === "clear");
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
            <p className="text-[13px]">{`${option.name}`}</p>
          </div>
        </li>
      )}
      sx={{ width }}
    />
  );
};

export default SelectBom;
