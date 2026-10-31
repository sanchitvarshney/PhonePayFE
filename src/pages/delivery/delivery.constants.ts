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

export const getPartnerName = (code: string) =>
  DELIVERY_PARTNERS.find((p) => p.value === code)?.text ?? code;

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
