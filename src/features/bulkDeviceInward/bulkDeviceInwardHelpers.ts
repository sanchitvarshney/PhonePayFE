export const getChallanNo = (row: any): string =>
  row?.challanNumber ?? row?.challanNo ?? row?.challan_no ?? "";

export const getChallanQty = (row: any): number =>
  Number(row?.qty ?? row?.total_qty ?? 0);

export const getUploadedQty = (row: any): number =>
  Number(row?.inwardQty ?? row?.uploadedQty ?? row?.uploaded_qty ?? 0);

export const getMinNo = (row: any): string => row?.minNo ?? "";

export const getDeviceKey = (row: any): string => row?.deviceKey ?? "";

export const getDeviceSku = (row: any): string => row?.deviceSku ?? "";

export const getRemainingQty = (row: any): number => {
  if (row?.pendingInwardQty !== undefined && row?.pendingInwardQty !== null) {
    return Number(row.pendingInwardQty);
  }
  return Math.max(getChallanQty(row) - getUploadedQty(row), 0);
};
