export type PoStateType = {
  data: unknown[];
  loading: boolean;
  error: unknown;
  managePoData: unknown;
  dateRange: unknown;
  formData: unknown;
  printLoading: boolean;
  cancelLoading: boolean;
  fetchPODataLoading: boolean;
  fetchPOData: unknown;
  completedPoData: unknown;
  submitPOMINLoading: boolean;
  uploadMinInvoiceLoading: boolean;
};

export type PoListResponse = {
  status: string;
  success: boolean;
  data: unknown[];
};
