import { useState } from "react";
import StoreReportShell from "@/components/report/store/StoreReportShell";
import StoreReportGrid from "@/components/report/store/StoreReportGrid";
import { TableSearch } from "@/components/report/store/ReportBlocks";
import {
  LocationFilter,
  PartnerFilter,
  ScanTypeFilter,
  TextFilter,
} from "@/components/report/store/ReportFilters";
import { useStoreReport } from "@/components/report/store/useStoreReport";
import {
  ReportColumn,
  formatDateTime,
  formatNumber,
} from "@/components/report/store/storeReportUtils";
import { STORE_REPORT_PATHS } from "@/features/storeReports/storeReportsService";
import type { SerialInwardRow } from "@/features/storeReports/storeReportsTypes";
import { partnerColumn } from "./storeReportColumns";

const columns: ReportColumn<SerialInwardRow>[] = [
  { header: "Serial No.", field: "serial_no", minWidth: 160, pinned: "left", bold: true },
  { header: "AWB / Challan No.", field: "awb_no", minWidth: 160 },
  { header: "Method", field: "method", minWidth: 90 },
  { header: "Scan ID", field: "scan_id", minWidth: 160 },
  { header: "Doc ID", field: "doc_id", minWidth: 90 },
  partnerColumn<SerialInwardRow>(),
  { header: "SKU", field: "device_sku", minWidth: 120 },
  { header: "Model", field: "device_model", minWidth: 140 },
  { header: "Location", value: (r) => r.location_name || r.location_key, minWidth: 140 },
  { header: "Transaction ID", field: "transaction_id", minWidth: 150 },
  { header: "Movement ID", field: "device_mov_id", minWidth: 130 },
  { header: "Inward By", field: "inward_by", minWidth: 130 },
  { header: "Inward Date", value: (r) => formatDateTime(r.insert_dt), minWidth: 165 },
];

const SerialInwardReport = () => {
  const report = useStoreReport<SerialInwardRow>({ path: STORE_REPORT_PATHS.serialInward });
  const { filters, setFilter, generate, rows, total } = report;
  const [search, setSearch] = useState("");

  return (
    <StoreReportShell
      report={report}
      title="Serial Inward"
      description="Serial devices inwarded through the AWB or challan entry screen."
      dateLabel="Serial inward date"
      onExport={() => report.exportAll(columns, "AWB_Serial_Inward", "Serial Inward")}
      summary={[{ label: "Total serials", value: formatNumber(total), highlight: true }]}
      toolbar={<TableSearch value={search} onChange={setSearch} />}
      filters={
        <>
          <TextFilter
            label="Serial No."
            placeholder="Serial number"
            value={filters.serial}
            onChange={(v) => setFilter("serial", v)}
            onEnter={generate}
          />
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
            label="Model"
            hint="product key"
            placeholder="Product key"
            value={filters.model}
            onChange={(v) => setFilter("model", v)}
            onEnter={generate}
          />
          <LocationFilter value={filters.location} onChange={(v) => setFilter("location", v)} />
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

export default SerialInwardReport;
