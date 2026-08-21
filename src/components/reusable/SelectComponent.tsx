import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import useDebounce from "@/hooks/useDebounce";
import axiosInstance from "@/api/axiosInstance";

export type ComponentType = {
  id: string;
  text: string;
  part_code: string;
};

type Props = {
  onChange: (value: ComponentType | null) => void;
  value: ComponentType | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  required?: boolean;
  varient?: "outlined" | "standard" | "filled";
  size?: "small" | "medium";
};

const SelectComponent: React.FC<Props> = ({
  value,
  onChange,
  label = "Search Item",
  width = "100%",
  error,
  helperText,
  required = false,
  varient = "outlined",
  size = "medium",
}) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [itemList, setItemList] = useState<ComponentType[]>([]);

  const fetchItems = async (query: string | null) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/backend/search/item/${query}`);
      setItemList(response.data.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedInputValue) {
      fetchItems(debouncedInputValue);
    }
  }, [debouncedInputValue]);

  useEffect(() => {
    fetchItems(null);
  }, []);

  return (
    <Autocomplete 
      value={value}
      size={size}
      options={itemList || []}
      getOptionLabel={(option) => `(${option.part_code})-${option.text}`}
      filterSelectedOptions
      onChange={(_, newValue) => {
        onChange(newValue);
      }}
      loading={loading}
      isOptionEqualToValue={(option, val) => option.id === val?.id}
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
            <p className="text-[13px]">{`(${option.part_code})-${option.text}`}</p>
          </div>
        </li>
      )}
      sx={{ width }}
    />
  );
};

export default SelectComponent;

