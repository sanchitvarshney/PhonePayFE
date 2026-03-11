import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getLocationAsync, getLocationDetails } from "@/features/master/location/locationSlice";
import type { LocationData } from "@/features/master/location/locationType";
import { Button } from "@/components/ui/button";

const flattenLocations = (data: LocationData[], prefix = ""): { name: string; label: string }[] => {
  let result: { name: string; label: string }[] = [];
  data.forEach((item) => {
    result.push({ name: item.name, label: item.label });
    if (item.children?.length) {
      result = result.concat(flattenLocations(item.children, `${prefix}${item.name} / `));
    }
  });
  return result;
};

type Props = {
  onViewDetails: (key: string) => void;
};

const LocationList: React.FC<Props> = ({ onViewDetails }) => {
  const dispatch = useAppDispatch();
  const { getLocationLoading, createLocationData, changeStatusData } = useAppSelector(
    (state) => state.location
  );
  const [rows, setRows] = useState<{ name: string; label: string }[]>([]);

  useEffect(() => {
    dispatch(getLocationAsync()).then((res: unknown) => {
      const action = res as { payload?: { data?: { success?: boolean; data?: LocationData[] } } };
      if (action.payload?.data?.success && action.payload.data.data) {
        setRows(flattenLocations(action.payload.data.data));
      }
    });
  }, [dispatch, createLocationData, changeStatusData]);

  if (getLocationLoading && rows.length === 0) {
    return (
      <div className="p-5 flex items-center justify-center text-slate-500">
        Loading locations...
      </div>
    );
  }

  return (
    <div className="p-5 overflow-auto h-full">
      <div className="font-semibold text-slate-600 mb-3">Location List</div>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between py-2 border-b border-neutral-200 text-sm text-slate-700"
          >
            <span>{row.name}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-[#5F259F] border-[#5F259F] hover:bg-[#5F259F]/10"
              onClick={() => {
                dispatch(getLocationDetails(row.label));
                onViewDetails(row.label);
              }}
            >
              View
            </Button>
          </li>
        ))}
      </ul>
      {rows.length === 0 && !getLocationLoading && (
        <p className="text-slate-500 text-sm">No locations yet.</p>
      )}
    </div>
  );
};

export default LocationList;
