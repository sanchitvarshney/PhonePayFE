interface Totals {
  cgst: number;
  sgst: number;
  igst: number;
  taxableValue: number;
}
interface RowData {
  partComponent: { lable: string; value: string } | null;
  qty: number;
  rate: string;
  taxableValue: number;
  foreignValue: number;
  hsnCode: string;
  gstType: string;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  location: { lable: string; value: string } | null;
  autoConsump: string;
  remarks: string;
  id: string;
  currency?: string;
  isNew?: boolean;
  uom: string;
}

export const calculateTotals = (data: RowData[]): Totals => {
  return data.reduce<Totals>(
    (totals, row) => {
      totals.cgst += row.cgst;
      totals.sgst += row.sgst;
      totals.igst += row.igst;
      totals.taxableValue += row.taxableValue;
      return totals;
    },
    {
      cgst: 0,
      sgst: 0,
      igst: 0,
      taxableValue: 0,
    }
  );
};
