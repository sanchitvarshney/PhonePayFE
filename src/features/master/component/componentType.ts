export type Components = {
  c_part_no: string;
  c_new_part_no: string;
  c_name: string;
  units_name: string;
  component_key: string;
  c_attr_category: string;
  is_enabled: string;
  c_approver_reason: string;
  approval_status: string;
};
export type ComponentDetails = {
  name: string;
  uom: string;
  description: string;
};

type Approvers = string[];

type ComponentData = {
  approvers: Approvers;
  components: Components[];
};
export type ComponentsApiResponse = {
  success: boolean;
  data: ComponentData;
};

export type Groupdata = {
  id: string;
  text: string;
};

export type GroupApiResponse = {
  success: boolean;
  data: Groupdata[];
};
export type UpdateconpinentDetail = {};

export type ComponentDetail = {
  partcode: string;
  alternate_part_codes: string[];
  alternate_part_keys: string[];
  alternate_part_name: string[];
  uomname: string;
  uomid: string;
  name: string;
  mrp: string;
  category: { code: string; name: string };
  subcategory: { code: string; name: string };
  enable_status: string;
  alert_status: string;
  brand: string;
  ean: string;
  weight: string;
  vweight: string;
  height: string;
  width: string;
  minqty: string;
  maxqty: string;
  minorderqty: string;
  leadtime: string;
  location: string;
  description: string;
  mfgCode: string;
  c_hsn: string;
  gst_rate: string;
};

export type ComponentDetailApiResponse = {
  code: number;
  data: ComponentDetail[];
  status: string;
};

export type UpdateComponentBasicDetailPayload = {
  componentKey: string;
  name: string;
  uom: string;
  category: string;
  subcategory: string;
  mrp: string;
  status: string;
  description: string;
};

export type UpdateComponentAdvanceDetail = {
  componentKey: string;
  brand: string;
  ean: string;
  weight: string;
  height: string;
  width: string;
  vweight: string;
};
export type UpdateCompoenntProductionDetailPayload = {
  componentKey: string;
  minStock: string;
  maxStock: string;
  minOrder: string;
  leadtime: string;
  anableAlert: string;
  purchaseCost: string;
  otherCost: string;
};

export type UpdateTaxDetailPayload = {
  componentKey: string;
  taxRate: number;
  hsn: string;
};

export interface ComponnetState {
  component: ComponentData | null;
  getComponentLoading: boolean;
  createComponentLoading: boolean;
  groupList: Groupdata[] | null;
  getGroupListLoading: boolean;
  getComponentDetailLoading: boolean;
  componentDetail: ComponentDetail[] | null;
  updateCompoenntBasciDetailLoading: boolean;
  updateCompoenntAdvanceDetailLoading: boolean;
  updateCompoenntProductionDetailLoading: boolean;
  updateCompoenntTaxDetailLoading: boolean;
}
