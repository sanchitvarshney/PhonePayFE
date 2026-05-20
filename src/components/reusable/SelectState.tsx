import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axiosInstance from "@/api/axiosInstance";

export type StateData = {
  name: string;
  code: string;
};

type StateApiResponse = {
  status: string;
  message: string;
  success: boolean;
  data: StateData[];
};

type Props = {
  onChange: (value: StateData | null) => void;
  value: StateData | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  varient?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
  disabled?: boolean;
};

const SelectState: React.FC<Props> = ({
  value,
  onChange,
  label = "Select State",
  width = "100%",
  error,
  helperText,
  varient = "outlined",
  required = false,
  size = "medium",
  disabled = false,
}) => {
  const [stateList, setStateList] = useState<StateData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<StateApiResponse>(`/backend/stateCode`);
      if (response.data.success) {
        setStateList(response.data.data || []);
      } else {
        setStateList([]);
      }
    } catch (err) {
      console.error("Error fetching states:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  return (
    <Autocomplete
      value={value}
      size={size}
      options={stateList || []}
      getOptionLabel={(option) => `${option.name} (${option.code})`}
      onChange={(_, val) => onChange(val)}
      loading={loading}
      isOptionEqualToValue={(option, val) => option.code === val?.code}
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
            <p className="text-[13px]">{`${option.name} (${option.code})`}</p>
          </div>
        </li>
      )}
      sx={{ width }}
      disabled={disabled}
    />
  );
};

export default SelectState;
