export type UOM = {
  uom: string;
  description: string;
};
type UnitsData = {
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

export type UomApiResponse = {
  success: boolean;
  data: UnitsData[];
};

export type UomCreateApiresponse = {
  success: boolean;
  message: string;
};
export interface UOMState {
  UOM: UnitsData[] | null;
  getUOMloading: boolean;
  createUOMloading: boolean;
}
