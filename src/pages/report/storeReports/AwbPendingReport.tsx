import { useMemo, useState } from "react";
import StoreReportShell from "@/components/report/store/StoreReportShell";
import StoreReportGrid from "@/components/report/store/StoreReportGrid";
import { AgeBadge, TableSearch } from "@/components/report/store/ReportBlocks";
import { PartnerFilter, ScanTypeFilter, TextFilter } from "@/components/report/store/ReportFilters";
import { useStoreReport } from "@/components/report/store/useStoreReport";
import { ReportColumn, formatNumber } from "@/components/report/store/storeReportUtils";
import { STORE_REPORT_PATHS } from "@/features/storeReports/storeReportsService";
import type { AwbReceivedRow } from "@/features/storeReports/storeReportsTypes";
import { awbReceivedColumns } from "./storeReportColumns";

const columns: ReportColumn<AwbReceivedRow>[] = [
  ...awbReceivedColumns(false),
  {
    header: "Age",
    field: "age_days",
    width: 100,
    cellRenderer: (p: { value?: number }) => <AgeBadge days={p.value} />,
  },
];

const AwbPendingReport = () => {
  const report = useStoreReport<AwbReceivedRow>({ path: STORE_REPORT_PATHS.awbPending });
  const { filters, setFilter, generate, rows, total } = report;
  const [search, setSearch] = useState("");

  const oldest = useMemo(() => Math.max(0, ...rows.map((r) => Number(r.age_days) || 0)), [rows]);
  const overWeek = useMemo(() => rows.filter((r) => Number(r.age_days) >= 7).length, [rows]);

  return (
    <StoreReportShell
      report={report}
      title="Pending AWBs"
      description="Received AWBs with nothing entered yet, and how long they have waited."
      dateLabel="AWB received date"
      onExport={() => report.exportAll(columns, "Pending_AWBs", "Pending AWBs")}
      summary={[
        { label: "Pending AWBs", value: formatNumber(total), highlight: true },
        { label: "Oldest (page)", value: rows.length ? `${oldest} days` : "—" },
        { label: "7+ days (page)", value: formatNumber(overWeek) },
      ]}
      toolbar={<TableSearch value={search} onChange={setSearch} />}
      filters={
        <>
          <TextFilter
            label="AWB / Challan No."
            hint="partial match"
            placeholder="e.g. 1234"
            value={filters.awb}
            onChange={(v) => setFilter("awb", v)}
            onEnter={generate}
          />
          <PartnerFilter value={filters.deliveryPartner} onChange={(v) => setFilter("deliveryPartner", v)} />
          <ScanTypeFilter value={filters.scanType} onChange={(v) => setFilter("scanType", v)} />
          <TextFilter
            label="Doc ID"
            placeholder="e.g. D1"
            value={filters.docId}
            onChange={(v) => setFilter("docId", v)}
            onEnter={generate}
          />
        </>
      }
    >
      <StoreReportGrid
        rows={rows}
        columns={columns}
        loading={report.loading}
        offset={report.offset}
        quickFilterText={search}
      />
    </StoreReportShell>
  );
};

export default AwbPendingReport;
