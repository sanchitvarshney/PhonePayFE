export type CostCenter = {
  costCenter: string;
  description: string;
};

type CostCenterData = {
  ID: number;
  units_type: string;
  units_name: string;
  units_details: string;
  insert_date: string;
  update_date: string;
  inserted_by: string;
  updated_by: string;
  units_id: string;
};

export type CostCenterApiResponse = {
  success: boolean;
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
