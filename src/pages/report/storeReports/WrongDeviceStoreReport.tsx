import { useCallback, useMemo, useRef, useState } from "react";
import { PlayCircle } from "lucide-react";
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
  sumBy,
} from "@/components/report/store/storeReportUtils";
import { STORE_REPORT_PATHS } from "@/features/storeReports/storeReportsService";
import type { StoreWrongDeviceRow } from "@/features/storeReports/storeReportsTypes";
import { showToast } from "@/utils/toasterContext";
import { partnerColumn } from "./storeReportColumns";

// Video links last 5 minutes; reload a little before that.
const LINK_TTL_MS = 4.5 * 60 * 1000;

const WrongDeviceStoreReport = () => {
  const report = useStoreReport<StoreWrongDeviceRow>({ path: STORE_REPORT_PATHS.wrongDevice });
  const { filters, setFilter, generate, rows, total, fetchedAt, refresh } = report;
  const [search, setSearch] = useState("");

  const stateRef = useRef({ fetchedAt, refresh });
  stateRef.current = { fetchedAt, refresh };

  // The tab opens first, before any request, so the browser doesn't block it as a popup.
  const openVideo = useCallback(async (row: StoreWrongDeviceRow) => {
    const tab = window.open("", "_blank");
    let url = row.videoUrl;
    try {
      const { fetchedAt: at, refresh: reload } = stateRef.current;
      if (Date.now() - at > LINK_TTL_MS) {
        const fresh = await reload();
        url = fresh?.find((r) => r.id === row.id)?.videoUrl ?? url;
      }
    } catch {
      /* fall back to the link we have */
    }
    if (!url) {
      tab?.close();
      showToast("Video link is not available", "error");
      return;
    }
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const columns = useMemo<ReportColumn<StoreWrongDeviceRow>[]>(
    () => [
      { header: "AWB / Challan No.", field: "awb_no", minWidth: 160, pinned: "left", bold: true },
      { header: "Item", field: "item_name", minWidth: 160 },
      { header: "Qty", field: "qty", numeric: true, width: 80 },
      { header: "Method", field: "method", minWidth: 90 },
      { header: "Scan ID", field: "scan_id", minWidth: 160 },
      partnerColumn<StoreWrongDeviceRow>(),
      { header: "Location", value: (r) => r.location_name || r.location_key, minWidth: 140 },
      { header: "Remark", field: "remark", minWidth: 180, flex: 1.5 },
      { header: "Entered By", field: "entered_by", minWidth: 130 },
      { header: "Entry Date", value: (r) => formatDateTime(r.insert_dt), minWidth: 165 },
      {
        header: "Video",
        width: 110,
        pinned: "right",
        exportable: false,
        cellRenderer: (p: { data?: StoreWrongDeviceRow }) =>
          p.data?.videoUrl ? (
            <button
              type="button"
              onClick={() => p.data && openVideo(p.data)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#5F259F] hover:bg-[#5F259F]/10"
            >
              <PlayCircle className="h-4 w-4" />
              Play
            </button>
          ) : (
            <span className="text-xs text-slate-400">No video</span>
          ),
      },
    ],
    [openVideo]
  );

  return (
    <StoreReportShell
      report={report}
      title="Wrong Devices"
      description="Items without serial saved against an AWB or challan, with their video."
      dateLabel="Entry date"
      onExport={() => report.exportAll(columns, "AWB_Wrong_Devices", "Wrong Devices")}
      summary={[
        { label: "Total entries", value: formatNumber(total), highlight: true },
        { label: "Qty (page)", value: formatNumber(sumBy(rows, (r) => r.qty)) },
        { label: "AWBs (page)", value: formatNumber(new Set(rows.map((r) => r.awb_no)).size) },
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
          <TextFilter
            label="Item"
            placeholder="e.g. Blue shirt"
            value={filters.item}
            onChange={(v) => setFilter("item", v)}
            onEnter={generate}
          />
          <PartnerFilter value={filters.deliveryPartner} onChange={(v) => setFilter("deliveryPartner", v)} />
          <ScanTypeFilter value={filters.scanType} onChange={(v) => setFilter("scanType", v)} />
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
        getRowId={(r) => String(r.id)}
      />
    </StoreReportShell>
  );
};

export default WrongDeviceStoreReport;
