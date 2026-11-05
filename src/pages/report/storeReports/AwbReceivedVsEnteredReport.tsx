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
import { formatNumber } from "@/components/report/store/storeReportUtils";
import { STORE_REPORT_PATHS } from "@/features/storeReports/storeReportsService";
import type { AwbReceivedRow } from "@/features/storeReports/storeReportsTypes";
import { awbReceivedColumns } from "./storeReportColumns";

const columns = awbReceivedColumns(true);

const AwbReceivedVsEnteredReport = () => {
  const report = useStoreReport<AwbReceivedRow>({ path: STORE_REPORT_PATHS.awbReceivedVsEntered });
  const { filters, setFilter, generate, rows, total } = report;
  const [search, setSearch] = useState("");

  const pageCounts = useMemo(() => {
    const count = (s: string) => rows.filter((r) => r.status === s).length;
    return { pending: count("PENDING"), entered: count("ENTERED"), complete: count("COMPLETE") };
  }, [rows]);

  return (
    <StoreReportShell
      report={report}
      title="AWB Received vs Entered"
      description="Every received AWB with its declared count, entries and status."
      dateLabel="AWB received date"
      onExport={() => report.exportAll(columns, "AWB_Received_vs_Entered", "Received vs Entered")}
      summary={[
        { label: "Total AWBs", value: formatNumber(total), highlight: true },
        { label: "Pending (page)", value: formatNumber(pageCounts.pending) },
        { label: "Entered (page)", value: formatNumber(pageCounts.entered) },
        { label: "Complete (page)", value: formatNumber(pageCounts.complete) },
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
          <StatusFilter value={filters.status} onChange={(v) => setFilter("status", v)} />
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

export default AwbReceivedVsEnteredReport;
