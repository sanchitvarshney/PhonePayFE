import type { ReportColumn } from "@/components/report/store/storeReportUtils";
import { formatDateTime } from "@/components/report/store/storeReportUtils";
import { StatusBadge } from "@/components/report/store/ReportBlocks";
import type { AwbReceivedRow } from "@/features/storeReports/storeReportsTypes";

type PartnerFields = {
  delivery_partner?: string;
  delivery_partner_name?: string;
  scan_type?: string;
  method?: string;
};

// Challan scans have no partner, so label them instead of leaving the cell blank.
export const partnerLabel = (row: PartnerFields) =>
  row.delivery_partner_name ||
  row.delivery_partner ||
  (row.scan_type === "CHALLAN" || row.method === "Challan" ? "Challan" : "—");

export const partnerColumn = <T extends PartnerFields>(): ReportColumn<T> => ({
  header: "Partner",
  value: partnerLabel,
  minWidth: 130,
});

export const awbReceivedColumns = (withStatus: boolean): ReportColumn<AwbReceivedRow>[] => [
  { header: "AWB / Challan No.", field: "awb_no", minWidth: 170, pinned: "left", bold: true },
  { header: "Scan ID", field: "scan_id", minWidth: 160 },
  { header: "Doc ID", field: "doc_id", minWidth: 90 },
  { header: "Scan Type", field: "scan_type", minWidth: 100 },
  partnerColumn<AwbReceivedRow>(),
  { header: "AWB Count", field: "awb_count", numeric: true, width: 105 },
  { header: "Serials", field: "serials", numeric: true, width: 95 },
  { header: "Wrong Devices", field: "wrong_devices", numeric: true, width: 110 },
  { header: "Entered", field: "entered", numeric: true, width: 95, bold: true },
  ...(withStatus
    ? [
        {
          header: "Status",
          field: "status",
          width: 115,
          cellRenderer: (p: { value?: string }) => <StatusBadge value={p.value} />,
        } as ReportColumn<AwbReceivedRow>,
      ]
    : []),
  { header: "Received At", value: (r) => formatDateTime(r.received_at), minWidth: 165 },
  { header: "Received By", field: "received_by", minWidth: 130 },
];
