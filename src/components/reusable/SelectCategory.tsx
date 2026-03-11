import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axiosInstance from "@/api/axiosInstance";

export type CategoryType = {
  catId: string;
  name: string;
};

type Props = {
  onChange: (value: CategoryType | null) => void;
  value: CategoryType | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  variant?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
};

const SelectCategory: React.FC<Props> = ({
  value,
  onChange,
  label = "Select Category",
  width = "100%",
  error,
  helperText,
  variant = "outlined",
  required = false,
  size = "medium",
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<CategoryType[]>([]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/component/category/categoryList");
      setOptions(response.data?.data ?? []);
    } catch (e) {
      console.error("Error fetching categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options.length) fetchCategories();
  }, []);

  return (
    <Autocomplete
      value={value}
      size={size}
      options={options || []}
      getOptionLabel={(option) => option.name}
      filterSelectedOptions
      onChange={(_, val) => onChange(val)}
      loading={loading}
      isOptionEqualToValue={(option, val) => option.catId === val?.catId}
      renderInput={(params) => (
        <TextField
          required={required}
          error={error}
          helperText={helperText}
          {...params}
          label={label}
          variant={variant}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <p className="text-[13px]">{option.name}</p>
        </li>
      )}
      sx={{ width }}
    />
  );
};

export default SelectCategory;

