export interface LocationData {
  label: string;
  name: string;
  status: string;
  children?: LocationData[];
}

export type CreateLocationPayloadtype = {
  name: string;
  parent: string;
  type: string;
  address: string;
};
export type CreateLocationResponse = {
  status: string;
  message: string;
  success: boolean;
};
export interface LocationResponse {
  status: string;
  data: LocationData[];
  success: boolean;
}
export interface StatusUpdateResponse {
  status: string;
  success: boolean;
  message: string;
}

export type GetLocationDetails = {
  loc_name: string;
  parent_loc_name: string;
  loc_type: "Storable" | "Non-Storable";
  loc_address: string;
  insert_date: string;
  insert_by: string;
};
export type GetLocationDetailsresponse = {
  success: boolean;
  data: GetLocationDetails;
  status: string;
};
export type LocationStates = {
  getLocationLoading: boolean;
  locationData: LocationData[] | null;
  createLocationLoading: boolean;
  createLocationData: CreateLocationResponse | null;
  updateStatusLoading: boolean;
  changeStatusData: StatusUpdateResponse | null;
  getLocationDetails: GetLocationDetails | null;
  getLocationDetailsLoading: boolean;
};
