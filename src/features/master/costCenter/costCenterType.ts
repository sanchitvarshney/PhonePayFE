export type CostCenter = {
  costCenter: string; // form field: display name
  description: string; // form field: code or internal description
};

export type CostCenterData = {
  name: string;
  code: string;
  insertDt: string;
};

export type CostCenterApiResponse = {
  success: boolean;
  message: string;
  data: CostCenterData[];
};

export type CostCenterCreateApiResponse = {
  success: boolean;
  message: string;
};

export interface CostCenterState {
  costCenter: CostCenterData[] | null;
  getCostCenterLoading: boolean;
  createCostCenterLoading: boolean;
}
