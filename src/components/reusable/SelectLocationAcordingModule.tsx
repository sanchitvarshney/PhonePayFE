import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import useDebounce from "@/hooks/useDebounce";
import axiosInstance from "@/api/axiosInstance";
import { useAppSelector } from "@/hooks/useReduxHook";
export type LocationType = {
  code: string;
  name: string;
  sku: string;
  text:string
};
type Props = {
  onChange: (value: LocationType | null) => void;
  value: LocationType | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  varient?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
  tabindex?: number;
  endPoint: string;
  disabled?:boolean;
  placeholder?:string;
  isSearch?:boolean
};

const SelectLocationAcordingModule: React.FC<Props> = ({
  value,
  onChange,
  label = "",
  width = "100%",
  error,
  helperText,
  varient = "outlined",
  required = false,
  size = "medium",
  tabindex = 0,
  endPoint,
  disabled,
  placeholder,
  isSearch=true

}) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [locationList, setLocationList] = useState<LocationType[]>([]);
  const { locationData } = useAppSelector((state) => state.location);

  const fetchLocations = async (query: string) => {
    setLoading(true);
   const  searchParam =  isSearch ?`?query=${query}`: null;
    try {
      const response = await axiosInstance.get(`${endPoint}${searchParam}`);
      setLocationList(response.data.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedInputValue) {
      fetchLocations(debouncedInputValue);
    }
  }, [debouncedInputValue]);
  useEffect(() => {
    fetchLocations("");
  }, [locationData]);
  return (
    <Autocomplete
      value={value}
      size={size}
      options={locationList || []}
      getOptionLabel={(option) => `${option.name ?? option.text} `}
      filterSelectedOptions
      
      onChange={(_, value) => {
      
        onChange(value);
      }}
      loading={loading}
      isOptionEqualToValue={(option, value) => option.code === value?.code || option.sku === value?.sku}
      onInputChange={(_, newInputValue, reason) => {
        (reason === "input" || reason === "clear") &&
          setInputValue(newInputValue);
      }}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          tabIndex={tabindex}
          required={required}
          error={error}
          helperText={helperText}
          {...params}
          label={label}
          placeholder={placeholder}
          variant={varient}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div>
            <p className="text-[13px]">{`${option.name ?? option.text}`}</p>
          </div>
        </li>
      )}
      sx={{ width }}
    />
  );
};

export default SelectLocationAcordingModule;
