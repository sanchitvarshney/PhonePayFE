export const LOCATION_ALLOTEMENT_ALLOWED_CRNS = [
  "CRN2913859",
  "CRN103522",
] as const;

export const LOCATION_ALLOTEMENT_ROUTES = [
  "/location/location-allot",
  "/location/location-alloted-list",
] as const;

export const canAccessLocationAllotement = (crnId?: string | null): boolean =>
  Boolean(crnId && LOCATION_ALLOTEMENT_ALLOWED_CRNS.includes(crnId as (typeof LOCATION_ALLOTEMENT_ALLOWED_CRNS)[number]));
