import React, { useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axiosInstance from "@/api/axiosInstance";

export type GroupdataType = {
  id: string;
  text: string;
};

type Props = {
  onChange: (value: GroupdataType | null) => void;
  value: GroupdataType | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  varient?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
};

const SelectUom: React.FC<Props> = ({
  value,
  onChange,
  label = "Select UOM",
  width = "100%",
  error,
  helperText,
  varient = "outlined",
  required = false,
  size = "medium",
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<GroupdataType[]>([]);

  const fetchUom = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/uom/uomSelect2");
      setOptions(response.data?.data ?? []);
    } catch (e) {
      console.error("Error fetching UOM:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      onFocus={fetchUom}
      value={value}
      size={size}
      options={options || []}
      getOptionLabel={(option) => option.text}
      filterSelectedOptions
      onChange={(_, val) => onChange(val)}
      loading={loading}
      isOptionEqualToValue={(option, val) => option.id === val?.id}
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
          <p className="text-[13px]">{option.text}</p>
        </li>
      )}
      sx={{ width }}
    />
  );
};

export default SelectUom;

