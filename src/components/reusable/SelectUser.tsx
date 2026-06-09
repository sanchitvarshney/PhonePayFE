import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import useDebounce from "@/hooks/useDebounce";
import axiosInstance from "@/api/axiosInstance";

export type UserData = {
  id: string;
  text: string;
};

type UserApiResponse = {
  status: string;
  message: string;
  success: boolean;
  data: UserData[];
};

type Props = {
  onChange: (value: UserData | null) => void;
  value: UserData | null | undefined;
  label?: string;
  width?: string;
  error?: boolean;
  helperText?: string | null;
  varient?: "outlined" | "standard" | "filled";
  required?: boolean;
  size?: "small" | "medium";
};

const SelectUser: React.FC<Props> = ({ value, onChange, label = "Search User", width = "100%", error, helperText, varient = "outlined", required = false, size = "medium" }) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [userList, setUserList] = useState<UserData[]>([]);

  // Fetch users based on search input
  const fetchUsers = async (query: string | null) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<UserApiResponse>(`/backend/search/user/${query}`);
      if (response.data.success) {
        setUserList(response.data.data);
      } else {
        setUserList([]);
        console.warn("Failed to fetch users:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedInputValue) {
      fetchUsers(debouncedInputValue);
    }
  }, [debouncedInputValue]);

  return (
    <Autocomplete
      onFocus={() => fetchUsers(null)}
      value={value}
      size={size}
      options={userList || []}
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

export default SelectUser;
