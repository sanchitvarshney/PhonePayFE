import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";

const PHONEPE_PURPLE = "#5F259F";

type FormType = {
  name: string;
  address: string;
  type: string;
};

const MasterLocation: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues: {
      name: "",
      address: "",
      type: "",
    },
  });

  const onSubmit = () => {};

  return (
    <div className="h-[calc(100vh-50px)] grid grid-cols-[550px_1fr] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="p-[20px] border-r border-neutral-300">
        <Typography variant="h1" className="text-slate-600" fontSize={20} fontWeight={500}>
          Add Location
        </Typography>
        <div className="mt-[20px]">
          <TextField
            fullWidth
            label="Location Name"
            {...register("name", { required: "Location Name is required" })}
          />
          {errors.name && (
            <span className="text-[12px] text-red-500">{errors.name.message}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-[30px] mt-[30px]">
          <div>
            <TextField fullWidth label="Parent Location" variant="outlined" size="medium" />
          </div>
          <div>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Location Type is required" }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="location-type-label">Location Type</InputLabel>
                  <Select
                    {...field}
                    labelId="location-type-label"
                    id="location-type"
                    label="Location Type"
                  >
                    <MenuItem value="1">Storable</MenuItem>
                    <MenuItem value="0">Non-Storable</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            {errors.type && (
              <span className="text-[12px] text-red-500">{errors.type.message}</span>
            )}
          </div>
        </div>
        <div className="py-[20px]">
          <TextField
            error={!!errors.address}
            helperText={errors.address?.message}
            fullWidth
            label="Address"
            multiline
            rows={3}
            {...register("address", { required: "Address is required" })}
            className="h-[100px] resize-none"
          />
        </div>
        <div className="h-[50px] p-0 flex items-center px-[20px] gap-[10px] justify-end">
          <Button
            onClick={() => reset()}
            type="button"
            startIcon={<RefreshIcon fontSize="small" />}
            variant="contained"
            sx={{ color: "red", backgroundColor: "white" }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            startIcon={<SaveIcon fontSize="small" />}
            variant="contained"
            sx={{ backgroundColor: PHONEPE_PURPLE, "&:hover": { backgroundColor: "#4a1d7a" } }}
          >
            Submit
          </Button>
        </div>
      </form>
      <div className="p-[20px] overflow-auto">
        <Typography variant="h2" className="text-slate-600" fontSize={18} fontWeight={500}>
          Location List
        </Typography>
        <p className="text-sm text-slate-500 mt-2">Location tree will appear here.</p>
      </div>
    </div>
  );
};

export default MasterLocation;
