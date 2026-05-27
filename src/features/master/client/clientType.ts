export type CraeteClientPayload = {
  name: string;
  gst: string;
  country: string;
  state: string;
  city: string;
  address: string;
  panno: string;
  phone: string;
  email: string;
  website: string;
  salesperson: string;
  addressDetails: Record<string, string>;
};

type CustomerData = {
  code: string;
  c_id: string;
  name: string;
  gst: string;
  mobile: string;
  email: string;
  city: string;
};

export type CustomerApiResponse = {
  success: boolean;
  data: CustomerData[];
};

export type ClientDetailApiresponse = {
  success: boolean;
  data: unknown;
};

export type AddressDetailApiResponse = {
  success: boolean;
  data: unknown;
};

export type DispatchFromDetail = {
  address: string;
  addressLine1: string;
  cin: string;
  addressLine2: string;
  code: string;
  company: string;
  gst: string;
  insert_dt: string;
  label: string;
  mobileNo: string;
  pan: string;
  pin: string;
};

export type DispatchFromDetailApiResponse = {
  success: boolean;
  data: DispatchFromDetail[];
};

export type AddShipToAddressPayload = Record<string, string>;
export type AddBranchPayload = Record<string, string>;
export type UpdateShipToPayload = Record<string, string>;
export type UpdateBillingAddressPayload = Record<string, string>;
export type BasicDetailPayload = Record<string, string>;

export type ClientState = {
  createClientLoading: boolean;
  clientdata: CustomerData[] | null;
  getClientLoading: boolean;
  clientDetail: unknown;
  clientDetailLoading: boolean;
  addressDetail: unknown;
  addressDetailLoading: boolean;
  addShiptoAddressLoading: boolean;
  addBranchLoading: boolean;
  updateshiptoAddressLoading: boolean;
  addressId: string | null;
  shipId: string | null;
  updateBillingAddressLoading: boolean;
  billId: string | null;
  updateBasicDetailLoading: boolean;
  dispatchFromDetailsLoading: boolean;
  dispatchFromDetails: DispatchFromDetail[] | null;
  getShippingAddressLoading: boolean;
  shippingAddress: unknown[] | null;
  getClientShippingLoading: boolean;
  clientShippingdata: unknown[] | null;
};
