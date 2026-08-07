import {
  allotLocationAsync,
  updateAllotLocationAsync,
} from "@/features/locationAllotement/locationAllotSlice";
import { getLocationAsync } from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  formatLocationsValue,
  LocationAllotForm,
} from "@/utils/locationAllotementType/locationTypes";
import { showToast } from "@/utils/toasterContext";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const EMPTY_LOCATION_IDS: string[] = [];

type Props = {
  editId?: string | null;
  initialPageName?: string;
  initialPageDescription?: string;
  initialLocationIds?: string[];
  onSuccess?: () => void;
  embedded?: boolean;
};

const LocationAllotFormPanel: React.FC<Props> = ({
  editId = null,
  initialPageName = "",
  initialPageDescription = "",
  initialLocationIds = EMPTY_LOCATION_IDS,
  onSuccess,
  embedded = false,
}) => {
  const dispatch = useAppDispatch();
  const { allotLocationLoading, updateAllotLoading } = useAppSelector(
    (state) => state.locationAllot,
  );
  const { locationData, getLocationLoading } = useAppSelector(
    (state) => state.divicemin,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialLocationIds),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const isEditMode = Boolean(editId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationAllotForm>({
    defaultValues: {
      pageName: initialPageName,
      pageDescription: initialPageDescription,
    },
  });

  useEffect(() => {
    dispatch(getLocationAsync("null"));
  }, [dispatch]);

  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return locationData;
    return locationData?.filter((loc) => loc.text.toLowerCase().includes(query));
  }, [locationData, searchQuery]);

  const handleToggleLocation = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRefresh = () => {
    setSelectedIds(new Set(initialLocationIds));
    setSearchQuery("");
    dispatch(getLocationAsync("null"));
  };

  const onSubmit: SubmitHandler<LocationAllotForm> = (data) => {
    if (selectedIds.size === 0) {
      showToast("Please select at least one location", "error");
      return;
    }

    const payload = {
      module_name: data.pageName,
      module_description: data.pageDescription,
      locations: formatLocationsValue(Array.from(selectedIds)),
    };

    const action = isEditMode
      ? updateAllotLocationAsync({ loc_all_key: editId!, ...payload })
      : allotLocationAsync(payload);

    dispatch(action).then((res: any) => {
      if (res.payload?.data?.success) {
        if (!isEditMode) {
          reset();
          setSelectedIds(new Set());
          setSearchQuery("");
          dispatch(getLocationAsync("null"));
        }
        onSuccess?.();
      }
    });
  };

  const containerHeight = embedded
    ? "h-full"
    : "h-[calc(100vh-50px)]";

  return (
    <div className={`${containerHeight} bg-white flex flex-col`}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
        <div className="px-[25px] pb-[20px] border-b border-neutral-200">
          <div className="flex w-full items-center gap-[30px] mt-[24px]">
            <div className="max-w-[350px] w-full">
              <TextField
                fullWidth
                variant="standard"
                placeholder="Page Name"
                {...register("pageName", { required: "Page Name is required" })}
              />
              {errors.pageName && (
                <span className="text-[12px] text-red-500">{errors.pageName.message}</span>
              )}
            </div>
            <div className="max-w-[350px] w-full">
              <TextField
                fullWidth
                variant="standard"
                placeholder="Page Description"
                {...register("pageDescription", {
                  required: "Page Description is required",
                })}
              />
              {errors.pageDescription && (
                <span className="text-[12px] text-red-500">
                  {errors.pageDescription.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-[30px] py-[20px]">
          <div className="flex items-center gap-[16px] mb-[16px]">
            <Typography fontSize={16} fontWeight={500} className="text-slate-700 shrink-0">
              Location(s)
            </Typography>

            <FormControl size="small" sx={{ width: 220 }}>
              <OutlinedInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" className="text-zinc-400" />
                  </InputAdornment>
                }
              />
            </FormControl>

            <div className="flex-1" />

            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                size="small"
                disabled={getLocationLoading}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Typography fontSize={14} className="text-slate-600 shrink-0">
              Total selected location(s): {selectedIds.size}
            </Typography>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto border border-neutral-200 rounded-sm p-[16px]">
            {getLocationLoading ? (
              <div className="flex items-center justify-center h-full">
                <CircularProgress size={32} />
              </div>
            ) : filteredLocations?.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Typography className="text-zinc-400">No locations found</Typography>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[24px] gap-y-[12px]">
                {filteredLocations?.map((location) => {
                  const locationId = String(location.id);
                  return (
                  <FormControlLabel
                    key={locationId}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedIds.has(locationId)}
                        onChange={() => handleToggleLocation(locationId)}
                      />
                    }
                    label={
                      <Typography fontSize={14} className="text-slate-700">
                        {location.text}
                      </Typography>
                    }
                    sx={{ m: 0, alignItems: "center" }}
                  />
                );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="h-[60px] px-[30px] flex items-center justify-end border-t border-neutral-200">
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isEditMode ? updateAllotLoading : allotLocationLoading}
            loadingPosition="start"
            startIcon={<SaveIcon fontSize="small" />}
          >
            Submit
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default LocationAllotFormPanel;
