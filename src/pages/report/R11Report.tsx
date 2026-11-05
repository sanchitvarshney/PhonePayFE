import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Barcode, Clock3, Hourglass, PackageX, ScanLine, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import AwbReceivedVsEnteredReport from "./storeReports/AwbReceivedVsEnteredReport";
import AwbPendingReport from "./storeReports/AwbPendingReport";
import SerialInwardReport from "./storeReports/SerialInwardReport";
import WrongDeviceStoreReport from "./storeReports/WrongDeviceStoreReport";
import PartnerSummaryReport from "./storeReports/PartnerSummaryReport";

type ReportKey = "received" | "pending" | "serial" | "wrong" | "partner";

const REPORTS: {
  value: ReportKey;
  label: string;
  icon: React.ElementType;
  render: () => React.ReactNode;
}[] = [
  { value: "received", label: "Received vs Entered", icon: ScanLine, render: () => <AwbReceivedVsEnteredReport /> },
  { value: "pending", label: "Pending AWBs", icon: Hourglass, render: () => <AwbPendingReport /> },
  { value: "serial", label: "Serial Inward", icon: Barcode, render: () => <SerialInwardReport /> },
  { value: "wrong", label: "Wrong Devices", icon: PackageX, render: () => <WrongDeviceStoreReport /> },
  { value: "partner", label: "Partner Summary", icon: Truck, render: () => <PartnerSummaryReport /> },
];

const isReportKey = (v: string | null): v is ReportKey => REPORTS.some((r) => r.value === v);

const R11Report: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get("tab");
  const active: ReportKey = isReportKey(param) ? param : "received";

  // Tabs mount on first visit and then stay mounted, so each keeps its filters and data.
  const [visited, setVisited] = useState<Set<ReportKey>>(() => new Set([active]));

  const select = (value: ReportKey) => {
    setVisited((prev) => (prev.has(value) ? prev : new Set(prev).add(value)));
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", value);
        return next;
      },
      { replace: true }
    );
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pt-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#5F259F]/10 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#5F259F]">
              R11
            </span>
            <span className="text-sm font-semibold text-slate-800">Store Reports</span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              · AWB &amp; challan receiving, entry and wrong devices
            </span>
          </div>
          <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
            <Clock3 aria-hidden className="h-3.5 w-3.5" />
            Each report keeps its own filters
          </span>
        </div>
        <div className="overflow-x-auto">
          <div role="tablist" aria-label="Store reports" className="flex min-w-max gap-1">
            {REPORTS.map(({ value, label, icon: Icon }) => {
              const selected = value === active;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  id={`r11-tab-${value}`}
                  aria-selected={selected}
                  aria-controls={`r11-panel-${value}`}
                  onClick={() => select(value)}
                  className={cn(
                    "relative inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5F259F]",
                    selected
                      ? "border-[#5F259F] text-[#5F259F]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        {REPORTS.filter(({ value }) => visited.has(value) || value === active).map(
          ({ value, render }) => (
            <div
              key={value}
              role="tabpanel"
              id={`r11-panel-${value}`}
              aria-labelledby={`r11-tab-${value}`}
              hidden={value !== active}
              className="p-3 lg:h-full"
            >
              {render()}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default R11Report;
