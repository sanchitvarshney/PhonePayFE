import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import useDebounce from "@/hooks/useDebounce";
import axiosInstance from "@/api/axiosInstance";
import { useAppSelector } from "@/hooks/useReduxHook";

export type LocationType = {
  id: string;
  text: string;
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
};

const SelectLocation: React.FC<Props> = ({
  value,
  onChange,
  label = "Search Location",
  width = "100%",
  error,
  helperText,
  varient = "outlined",
  required = false,
  size = "medium",
  tabindex = 0,
}) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [locationList, setLocationList] = useState<LocationType[]>([]);
  const { locationData } = useAppSelector((state) => state.location);

  const fetchLocations = async (query: string | null) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/backend/search/location/${query ?? ""}`
      );
      setLocationList(response.data?.data ?? []);
    } catch {
      setLocationList([]);
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
    fetchLocations(null);
  }, [locationData]);

  return (
    <Autocomplete
      tabIndex={tabindex}
      value={value}
      size={size}
      options={locationList || []}
      getOptionLabel={(option) => `${(option as LocationType).text}`}
      filterSelectedOptions
      onChange={(_, val) => onChange(val as LocationType | null)}
      loading={loading}
      isOptionEqualToValue={(option, val) => (option as LocationType).id === (val as LocationType)?.id}
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
          <div>
            <p className="text-[13px]">{(option as LocationType).text}</p>
          </div>
        </li>
      )}
      sx={{ width }}
    />
  );
};

export default SelectLocation;
