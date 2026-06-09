import React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

interface Option {
  value: string;
  label: string;
}

interface ReusableSelectProps {
  options: Option[];
  label?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
  sx?: object;
  variant?: "outlined" | "standard" | "filled";
}

const MuiSelect: React.FC<ReusableSelectProps> = ({ options, label, value, onChange, fullWidth = true, sx = { minWidth: 120 }, variant }) => {
  const handleChange = (event: SelectChangeEvent) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <Box sx={sx}>
      <FormControl variant={variant} fullWidth={fullWidth}>
        <InputLabel id="select-label">{label}</InputLabel>
        <Select labelId="select-label" value={value} onChange={handleChange} label={label}>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MuiSelect;
