import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axiosInstance from "@/api/axiosInstance";

export type SubCategoryType = {
  catId: string;
  name: string;
};

type Props = {
  onChange: (value: SubCategoryType | null) => void;
  value: SubCategoryType | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  variant?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
  categoryId: string | null;
  disabled?: boolean;
};

const SelectSubCategory: React.FC<Props> = ({
  value,
  onChange,
  label = "Select Subcategory",
  width = "100%",
  error,
  helperText,
  variant = "outlined",
  required = false,
  size = "medium",
  categoryId,
  disabled = false,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<SubCategoryType[]>([]);

  const fetchSubCategories = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/component/category/subCategoryList/${categoryId}`
      );
      if (response.data?.success) {
        setOptions(response.data.data || []);
      } else {
        setOptions([]);
      }
    } catch (e) {
      console.error("Error fetching subcategories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchSubCategories();
    } else {
      setOptions([]);
    }
  }, [categoryId]);

  return (
    <Autocomplete
      disabled={disabled}
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

export default SelectSubCategory;

