export const DELIVERY_PARTNERS = [
  { value: "eCOM", text: "eCommerce" },
  { value: "eKart", text: "eKart" },
  { value: "dVery", text: "Delhivery" },
  { value: "DTDC", text: "DTDC" },
  { value: "F1", text: "F1" },
  { value: "PLADA", text: "PLADA" },
  { value: "BILLBOX", text: "BILLBOX" },
  { value: "XPRESSBEES", text: "XPRESSBEES" },
  { value: "DARTX", text: "DARTX" },
  { value: "NANDAN", text: "NANDAN" },
  { value: "MARK", text: "MARK" },
  { value: "ShipRocket", text: "ShipRocket" },
  { value: "DSKCargo", text: "DSK Cargo and Logistics" },
  { value: "ShadowFox", text: "ShadowFox" },
  { value: "GMS", text: "GMS" },
  { value: "BLUEDART", text: "BLUEDART" },
  { value: "Trackon", text: "TrackOn" },
];

const AWB_LENGTH_RANGES: Record<string, { min: number; max: number }> = {
  eCOM: { min: 9, max: 12 },
  eKart: { min: 10, max: 16 },
  dVery: { min: 12, max: 14 },
  DTDC: { min: 8, max: 14 },
  F1: { min: 3, max: 10 },
  PLADA: { min: 8, max: 10 },
  BILLBOX: { min: 8, max: 10 },
  XPRESSBEES: { min: 14, max: 15 },
  DARTX: { min: 8, max: 10 },
  NANDAN: { min: 8, max: 13 },
  DSKCargo: { min: 7, max: 13 },
  ShipRocket: { min: 7, max: 13 },
  ShadowFox: { min: 12, max: 18 },
  GMS: { min: 9, max: 10 },
  BLUEDART: { min: 11, max: 13 },
  Trackon: { min: 12, max: 14 },
};

export const getAWBLengthRange = (partnerId: string): { min: number; max: number } | null =>
  AWB_LENGTH_RANGES[partnerId] ?? null;

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "rgb(203 213 225)" },
    "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
    "&.Mui-focused fieldset": { borderColor: "rgb(14 116 144)" },
  },
};

export const selectSx = {
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(203 213 225)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(148 163 184)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(14 116 144)" },
};
