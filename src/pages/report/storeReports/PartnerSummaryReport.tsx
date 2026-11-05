import { useMemo, useState } from "react";
import StoreReportShell from "@/components/report/store/StoreReportShell";
import StoreReportGrid from "@/components/report/store/StoreReportGrid";
import { TableSearch } from "@/components/report/store/ReportBlocks";
import {
  PartnerFilter,
  ScanTypeFilter,
  StatusFilter,
  TextFilter,
} from "@/components/report/store/ReportFilters";
import { useStoreReport } from "@/components/report/store/useStoreReport";
import { ReportColumn, formatNumber, sumBy } from "@/components/report/store/storeReportUtils";
import { STORE_REPORT_PATHS } from "@/features/storeReports/storeReportsService";
import type { PartnerSummaryRow } from "@/features/storeReports/storeReportsTypes";

const NUMERIC_FIELDS = [
  "awbs",
  "declared_count",
  "serials",
  "wrong_devices",
  "entered",
  "pending_awbs",
  "complete_awbs",
] as const;

const columns: ReportColumn<PartnerSummaryRow>[] = [
  {
    header: "Partner",
    value: (r) => r.partner_name || r.partner_code,
    minWidth: 180,
    pinned: "left",
    bold: true,
  },
  { header: "Code", field: "partner_code", minWidth: 110 },
  { header: "AWBs", field: "awbs", numeric: true, minWidth: 100, bold: true },
  { header: "Declared Count", field: "declared_count", numeric: true, minWidth: 120 },
  { header: "Serials", field: "serials", numeric: true, minWidth: 100 },
  { header: "Wrong Devices", field: "wrong_devices", numeric: true, minWidth: 115 },
  { header: "Entered", field: "entered", numeric: true, minWidth: 100 },
  { header: "Pending AWBs", field: "pending_awbs", numeric: true, minWidth: 115 },
  { header: "Complete AWBs", field: "complete_awbs", numeric: true, minWidth: 120 },
];

const PartnerSummaryReport = () => {
  const report = useStoreReport<PartnerSummaryRow>({
    path: STORE_REPORT_PATHS.partnerSummary,
    paged: false,
  });
  const { filters, setFilter, generate, rows } = report;
  const [search, setSearch] = useState("");

  const totals = useMemo(() => {
    const t = Object.fromEntries(
      NUMERIC_FIELDS.map((f) => [f, sumBy(rows, (r) => r[f])])
    ) as Record<(typeof NUMERIC_FIELDS)[number], number>;
    return t;
  }, [rows]);

  const pinnedBottomRowData = useMemo(
    () => (rows.length ? [{ partner_name: "Grand Total", partner_code: "", ...totals }] : []),
    [rows.length, totals]
  );

  return (
    <StoreReportShell
      report={report}
      title="Partner Summary"
      description="One row per delivery partner; challan scans are grouped as CHALLAN."
      dateLabel="AWB received date"
      onExport={() => report.exportAll(columns, "AWB_Partner_Summary", "Partner Summary")}
      summary={[
        { label: "AWBs received", value: formatNumber(totals.awbs), highlight: true },
        { label: "Partners", value: formatNumber(rows.length) },
        { label: "Entered", value: formatNumber(totals.entered) },
        { label: "Serials", value: formatNumber(totals.serials) },
        { label: "Wrong devices", value: formatNumber(totals.wrong_devices) },
        { label: "Pending AWBs", value: formatNumber(totals.pending_awbs) },
        { label: "Complete AWBs", value: formatNumber(totals.complete_awbs) },
      ]}
      toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search partners…" />}
      filters={
        <>
          <PartnerFilter value={filters.deliveryPartner} onChange={(v) => setFilter("deliveryPartner", v)} />
          <ScanTypeFilter value={filters.scanType} onChange={(v) => setFilter("scanType", v)} />
          <StatusFilter value={filters.status} onChange={(v) => setFilter("status", v)} />
          <TextFilter
            label="AWB / Challan No."
            hint="partial match"
            placeholder="e.g. 1234"
            value={filters.awb}
            onChange={(v) => setFilter("awb", v)}
            onEnter={generate}
          />
        </>
      }
    >
      <StoreReportGrid
        rows={rows}
        columns={columns}
        loading={report.loading}
        quickFilterText={search}
        pinnedBottomRowData={pinnedBottomRowData}
      />
    </StoreReportShell>
  );
};

export default PartnerSummaryReport;
