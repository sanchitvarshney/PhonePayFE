export type PartCodeData = {
  id: string;
  text: string;
  part_code: string;
  material_code: string;
  specification: string;
  unit: string;
};

export type PartCodeDataresponse = {
  data: PartCodeData[];
  status: string;
  message: string;
  success: boolean;
};
