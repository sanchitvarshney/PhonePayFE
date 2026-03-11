import React, { useState } from "react";
import MasterLocationViewDrawer from "@/components/Drawers/master/MasterLocationViewDrawer";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { createLocationAsync } from "@/features/master/location/locationSlice";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import SelectLocation, { LocationType } from "@/components/reusable/SelectLocation";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocationList from "@/components/master/LocationList";

const PHONEPE_PURPLE = "#5F259F";

type FormType = {
  name: string;
  address: string;
  parent: LocationType | null;
  type: string | undefined;
};

const MasterLocation: React.FC = () => {
  const [viewLocation, setViewLocation] = useState<boolean>(false);
  const { createLocationLoading } = useAppSelector((state) => state.location);
  const dispatch = useAppDispatch();
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
      parent: null,
      type: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormType> = (data) => {
    const newdata = {
      name: data.name,
      address: data.address,
      parent: data.parent!.id,
      type: data.type || "",
    };
    dispatch(createLocationAsync(newdata)).then((res: unknown) => {
      const action = res as { payload?: { data?: { success?: boolean } } };
      if (action.payload?.data?.success) {
        reset();
      }
    });
  };

  return (
    <>
      <MasterLocationViewDrawer open={viewLocation} setOpen={setViewLocation} />
      <div className="h-[calc(100vh-50px)] grid grid-cols-[550px_1fr] bg-white">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-[20px] border-r border-neutral-300"
        >
          <Typography
            variant="h1"
            className="text-slate-600"
            fontSize={20}
            fontWeight={500}
          >
            Add Location
          </Typography>
          <div className="mt-[20px]">
            <TextField
              fullWidth
              label="Location Name"
              {...register("name", { required: "Location Name is required" })}
            />
            {errors.name && (
              <span className="text-[12px] text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-[30px] mt-[30px]">
            <div>
              <Controller
                name="parent"
                control={control}
                rules={{ required: "Parent Location is required" }}
                render={({ field }) => (
                  <SelectLocation
                    label="Parent Location"
                    varient="outlined"
                    size="medium"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.parent && (
                <span className="text-[12px] text-red-500">
                  {errors.parent.message}
                </span>
              )}
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
                <span className="text-[12px] text-red-500">
                  {errors.type.message}
                </span>
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
            <LoadingButton
              type="submit"
              loadingPosition="start"
              loading={createLocationLoading}
              startIcon={<SaveIcon fontSize="small" />}
              variant="contained"
              sx={{
                backgroundColor: PHONEPE_PURPLE,
                "&:hover": { backgroundColor: "#4a1d7a" },
              }}
            >
              Submit
            </LoadingButton>
          </div>
        </form>
        <div>
          <LocationList onViewDetails={() => setViewLocation(true)} />
        </div>
      </div>
    </>
  );
};

export default MasterLocation;
