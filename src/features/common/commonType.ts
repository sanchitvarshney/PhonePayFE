export type userData = {
  id: string;
  text: string;
};

export type UserApiResponse = {
  status: string;
  message: string;
  success: boolean;
  data: userData[];
};
export type CurrencListResponse = {
  status: string;
  success: boolean;
  data: userData[];
};
export type CostCenter = {
  text: string;
  id: string;
};

export type CostCenterApiResponse = {
  success: boolean;
  status: string;
  message: string;
  data: CostCenter[];
};

export type Commonstate = {
  getUserLoading: boolean;
  userData: userData[] | null;
  isueeList: userData[] | null;
  isueeListLoading: boolean;
  currencyLoaidng: boolean;
  currencyData: userData[] | null;
  costCenterLoading: boolean;
  costCenterData: CostCenter[] | null;
};
