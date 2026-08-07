export type LocationItem = {
  id: string;
  text: string;
};

export type LocationAllotForm = {
  pageName: string;
  pageDescription: string;
};

export type LocationAllotApiDetail = {
  id: number | string;
  for_module: string;
  module_desc: string;
  loc_all_key: string;
  locations: string;
  company_branch?: string;
};

export type LocationAllotedApiItem = {
  id?: number | string;
  module_name?: string;
  module_description?: string;
  for_module?: string;
  module_desc?: string;
  loc_all_key: string;
  locations?: string;
  company_branch?: string;
};

export type LocationAllotDetail = {
  loc_all_key: string;
  for_module: string;
  module_desc: string;
  location_ids: string[];
};

export type LocationAllotedItem = {
  loc_all_key: string;
  module_name: string;
  module_description: string;
};

export type LocationAllotPayload = {
  for_module: string;
  module_desc: string;
  locations: string;
};

export type LocationAllotUpdatePayload = LocationAllotPayload & {
  loc_all_key: string;
};

export type LocationAllotResponse = {
  success: boolean;
  message: string;
  status?: string;
};

export type LocationAllotedListResponse = {
  success: boolean;
  data: LocationAllotedApiItem[];
  message?: string;
};

export type LocationAllotDetailResponse = {
  success: boolean;
  data: LocationAllotApiDetail;
  message?: string;
};

export type LocationAllotState = {
  allotedList: LocationAllotedItem[];
  allotDetail: LocationAllotDetail | null;
  getAllotedListLoading: boolean;
  getAllotDetailLoading: boolean;
  allotLocationLoading: boolean;
  updateAllotLoading: boolean;
};

export const parseLocationsValue = (
  locations: string | string[] | null | undefined,
): string[] => {
  if (!locations) return [];
  if (Array.isArray(locations)) {
    return locations.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(locations)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const formatLocationsValue = (locationIds: string[]): string =>
  locationIds.join(",");
