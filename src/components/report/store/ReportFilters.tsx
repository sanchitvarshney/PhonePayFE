import React, { useEffect, useState } from "react";
import { Input, Select } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getWrongDeviceLocations } from "@/features/delivery/deliverySlice";
import { fetchPartners } from "@/features/storeReports/storeReportsService";
import type {
  AwbStatus,
  PartnerOption,
  ScanType,
} from "@/features/storeReports/storeReportsTypes";

export const FilterField: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
  label,
  hint,
  children,
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-medium text-slate-600">
      {label}
      {hint && <span className="font-normal text-slate-400"> · {hint}</span>}
    </span>
    {children}
  </label>
);

type ValueProps<V> = { value?: V; onChange: (value: V | undefined) => void };

export const TextFilter: React.FC<
  ValueProps<string> & { label: string; placeholder: string; hint?: string; onEnter?: () => void }
> = ({ label, placeholder, hint, value, onChange, onEnter }) => (
  <FilterField label={label} hint={hint}>
    <Input
      allowClear
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value || undefined)}
      onPressEnter={onEnter}
      className="h-9"
    />
  </FilterField>
);

const selectProps = {
  allowClear: true,
  showSearch: true,
  optionFilterProp: "label",
  className: "h-9 w-full",
} as const;

export const PartnerFilter: React.FC<ValueProps<string>> = ({ value, onChange }) => {
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPartners()
      .then((list) => active && setPartners(list))
      .catch(() => undefined)
      .finally(() => active && setPartnersLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <FilterField label="Delivery partner">
      <Select
        {...selectProps}
        value={value}
        onChange={(v) => onChange(v || undefined)}
        loading={partnersLoading}
        placeholder="All partners"
        options={partners.map((p) => ({ value: p.key, label: p.name }))}
      />
    </FilterField>
  );
};

export const LocationFilter: React.FC<ValueProps<string>> = ({ value, onChange }) => {
  const dispatch = useAppDispatch();
  const { locations, locationsLoading } = useAppSelector((state) => state.delivery);

  useEffect(() => {
    if (!locations.length) dispatch(getWrongDeviceLocations());
  }, [dispatch, locations.length]);

  return (
    <FilterField label="Location">
      <Select
        {...selectProps}
        value={value}
        onChange={(v) => onChange(v || undefined)}
        loading={locationsLoading}
        placeholder="All locations"
        options={locations.map((l) => ({ value: l.key, label: l.name }))}
      />
    </FilterField>
  );
};

export const ScanTypeFilter: React.FC<ValueProps<ScanType>> = ({ value, onChange }) => (
  <FilterField label="Scan type">
    <Select
      {...selectProps}
      showSearch={false}
      value={value}
      onChange={(v) => onChange(v || undefined)}
      placeholder="Partner & challan"
      options={[
        { value: "PARTNER", label: "Partner (AWB)" },
        { value: "CHALLAN", label: "Challan" },
      ]}
    />
  </FilterField>
);

export const StatusFilter: React.FC<ValueProps<AwbStatus>> = ({ value, onChange }) => (
  <FilterField label="Status">
    <Select
      {...selectProps}
      showSearch={false}
      value={value}
      onChange={(v) => onChange(v || undefined)}
      placeholder="All statuses"
      options={[
        { value: "PENDING", label: "Pending — nothing entered" },
        { value: "ENTERED", label: "Entered — some entered" },
        { value: "COMPLETE", label: "Complete — count reached" },
      ]}
    />
  </FilterField>
);
