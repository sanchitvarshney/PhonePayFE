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

export type UploadFileData = {
  fileName: string;
  fileReference: string;
};

export type UploadSerialFileResponse = {
  success: boolean;
  message: string;
  data: UploadFileData;
};

export type InvoiceFileData = {
  originalFileName: string;
  fileID: string;
};

export type UploadInvoiceFileApiResponse = {
  success: boolean;
  message: string;
  data: InvoiceFileData[];
};

export type PartNameData = {
  partCode: string;
  partName: string;
  bomSubCategory: string;
};

export type PartNamesApiResponse = {
  success: boolean;
  status: string;
  message?: string;
  data?: PartNameData[];
  body?: PartNameData[];
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
  uploadSerialFileLoading: boolean;
  serialFiledata: UploadFileData | null;
  uploadInvoiceFileLoading: boolean;
  invociceFiledata: InvoiceFileData[] | null;
  getPartNamesLoading: boolean;
  partNamesData: PartNameData[] | null;
};
