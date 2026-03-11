export type Location = {
  id: string;
  text: string;
};
export type LocationApiresponse = {
  success: boolean;
  data: Location[];
  status: string;
};

type VendoAddressData = {
  address: string;
  gstid: string;
  state: string;
  country: string;
  einvoice_status: string;
};
export type VendorAddressApiResponse = {
  success: boolean;
  message: string;
  data: VendoAddressData;
};

export type DeviceMinSate = {
  getLocationLoading: boolean;
  locationData: Location[] | null;
  getVendorLoading: boolean;
  VendorData: Location[] | null;
  getVendorBranchLoading: boolean;
  VendorBranchData: Location[] | null;
  venderaddressloading: boolean;
  venderaddressdata: VendoAddressData | null;
};
