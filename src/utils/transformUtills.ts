export const transformUomSelectData = (data: any[] | null) => {
  if (data === null) {
    return undefined;
  }
  return data.map((item) => ({
    label: item.units_name,
    value: item.units_id,
  }));
};

export const transformGroupSelectData = (data: any[] | null) => {
  if (data === null) {
    return undefined;
  }
  return data.map((item) => ({
    label: item.text,
    value: item.id,
  }));
};

export const transformSkuCode = (data: any[] | null) => {
  if (data === null) {
    return undefined;
  }
  return data.map((item) => ({
    label: item.text,
    value: item.id,
  }));
};

export const transformPartCode = (data: any[] | null) => {
  if (data === null) {
    return undefined;
  }
  return data.map((item) => ({
    label: item.text,
    value: item.id,
  }));
};

export const transformBothComponentCode = (data: any[] | null) => {
  if (data === null) {
    return undefined;
  }
  return data.map((item) => ({
    label: item.text,
    value: item.id,
  }));
};

export const transformBranchList = (data: any[] | null) => {
  if (data === null) {
    return undefined;
  }
  return data.map((item) => ({
    text: item.branch_name,
    id: item.branch_code,
    address: item.address,
  }));
};
