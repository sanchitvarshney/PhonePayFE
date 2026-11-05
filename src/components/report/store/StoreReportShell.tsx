import React, { useCallback, useEffect, useId, useState } from "react";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button } from "@mui/material";
import {
  AlertTriangle,
  CalendarRange,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { rangePresets } from "@/utils/rangePresets";
import CustomPagination from "@/components/reusable/CustomPagination";
import { STORE_REPORT_MAX_DAYS } from "@/features/storeReports/storeReportsService";
import type { StoreReportState } from "./useStoreReport";
import { ReportEmptyState, ReportErrorState, ReportLoadingState } from "./ReportBlocks";
import { formatNumber } from "./storeReportUtils";

const { RangePicker } = DatePicker;

export type SummaryItem = { label: string; value: React.ReactNode; highlight?: boolean };

type Props = {
  report: StoreReportState<unknown>;
  title: string;
  description: string;
  dateLabel: string;
  filters?: React.ReactNode;
  summary?: SummaryItem[];
  toolbar?: React.ReactNode;
  onExport?: () => void;
  children: React.ReactNode;
};

const COLLAPSE_KEY = "storeReports.filterPanelCollapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
};

const formatPeriod = (from: string, to: string) => {
  const f = dayjs(from, "DD-MM-YYYY");
  const t = dayjs(to, "DD-MM-YYYY");
  return f.isSame(t, "day")
    ? f.format("DD MMM YYYY")
    : `${f.format("DD MMM YYYY")} – ${t.format("DD MMM YYYY")}`;
};

// No future dates and at most 92 days between start and end.
const disabledDate = (current: Dayjs, info?: { from?: Dayjs }) => {
  if (!current) return false;
  if (current.isAfter(dayjs(), "day")) return true;
  if (info?.from) return Math.abs(current.diff(info.from, "day")) >= STORE_REPORT_MAX_DAYS;
  return false;
};

const PanelHeading: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({
  children,
  action,
}) => (
  <div className="mb-2.5 flex items-center justify-between">
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{children}</h3>
    {action}
  </div>
);

const RailButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ label, onClick, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F259F] disabled:pointer-events-none disabled:opacity-40"
  >
    {children}
  </button>
);

const StoreReportShell: React.FC<Props> = ({
  report,
  title,
  description,
  dateLabel,
  filters,
  summary = [],
  toolbar,
  onExport,
  children,
}) => {
  const panelId = useId();
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  const {
    date,
    setDate,
    applied,
    filtersChanged,
    activeFilterCount,
    resetFilters,
    loading,
    exporting,
    error,
    generate,
    rows,
    total,
    page,
    limit,
    paged,
    goToPage,
    changeLimit,
  } = report;

  const hasReport = !!applied;
  const hasRows = rows.length > 0;
  const canExport = hasRows && !exporting && !loading;
  const period = applied ? formatPeriod(applied.startDate, applied.endDate) : null;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-3 lg:h-full lg:flex-row">
      {/* Left: filters + summary */}
      <aside
        id={panelId}
        aria-label="Report filters and summary"
        className={cn(
          "shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[width] duration-200 ease-out lg:flex lg:flex-col",
          collapsed ? "lg:w-14" : "lg:w-[320px]"
        )}
      >
        {collapsed ? (
          <div className="flex items-center gap-1 p-2 lg:h-full lg:flex-col lg:py-3">
            <RailButton label="Expand filters panel" onClick={toggle}>
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            </RailButton>
            <span className="mx-1 h-5 w-px bg-slate-200 lg:mx-0 lg:my-1 lg:h-px lg:w-6" />
            <RailButton label="Change filters" onClick={toggle}>
              <SlidersHorizontal className="h-[18px] w-[18px]" />
            </RailButton>
            <RailButton label="Reload report" onClick={generate} disabled={loading}>
              <RotateCw className={cn("h-[18px] w-[18px]", loading && "animate-spin")} />
            </RailButton>
            {onExport && (
              <RailButton label="Export to Excel" onClick={onExport} disabled={!canExport}>
                <Download className="h-[18px] w-[18px]" />
              </RailButton>
            )}
            <span className="ml-2 text-xs font-medium text-slate-500 lg:ml-0 lg:mt-4 lg:rotate-180 lg:[writing-mode:vertical-rl]">
              Filters &amp; summary
            </span>
          </div>
        ) : (
          <div className="flex flex-col lg:h-full lg:min-h-0">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-slate-900">Filters &amp; summary</span>
              <RailButton label="Collapse filters panel" onClick={toggle}>
                <PanelLeftClose className="h-[18px] w-[18px]" />
              </RailButton>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              <section className="px-4 py-4">
                <PanelHeading>{dateLabel}</PanelHeading>
                <RangePicker
                  className="h-10 w-full"
                  presets={rangePresets}
                  onChange={(value) =>
                    setDate({ from: value?.[0] ?? null, to: value?.[1] ?? null })
                  }
                  disabledDate={disabledDate}
                  placeholder={["Start date", "End date"]}
                  value={date.from && date.to ? [date.from, date.to] : null}
                  format="DD/MM/YYYY"
                  allowClear={false}
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Up to {STORE_REPORT_MAX_DAYS} days, both days included.
                </p>
              </section>

              {filters && (
                <section className="px-4 py-4">
                  <PanelHeading
                    action={
                      activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#5F259F] hover:underline"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset ({activeFilterCount})
                        </button>
                      )
                    }
                  >
                    Filters
                  </PanelHeading>
                  <div className="flex flex-col gap-3">{filters}</div>
                </section>
              )}

              <section className="px-4 py-4">
                <div className="flex flex-col gap-2">
                  <LoadingButton
                    fullWidth
                    variant="contained"
                    disableElevation
                    startIcon={<Icons.search fontSize="small" />}
                    loadingPosition="start"
                    loading={loading}
                    onClick={generate}
                    sx={{ textTransform: "none", fontWeight: 600, height: 40 }}
                  >
                    {hasReport ? "Update report" : "Generate report"}
                  </LoadingButton>
                  {onExport && (
                    <LoadingButton
                      fullWidth
                      variant="outlined"
                      loading={exporting}
                      loadingPosition="start"
                      startIcon={<Download className="h-4 w-4" />}
                      onClick={onExport}
                      disabled={!canExport}
                      sx={{ textTransform: "none", fontWeight: 600, height: 40 }}
                    >
                      {exporting
                        ? "Preparing Excel…"
                        : paged && total > rows.length
                          ? `Export all ${formatNumber(total)} rows`
                          : "Export to Excel"}
                    </LoadingButton>
                  )}
                </div>
                {filtersChanged && (
                  <p
                    role="status"
                    className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-800"
                  >
                    <AlertTriangle aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
                    Filters changed. Click Update report to refresh the data.
                  </p>
                )}
              </section>

              {hasReport && summary.length > 0 && (
                <section className="px-4 py-4">
                  <PanelHeading>Summary</PanelHeading>
                  <dl className="grid grid-cols-2 gap-2">
                    {summary.map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          "rounded-lg border px-3 py-2.5",
                          item.highlight
                            ? "col-span-2 border-[#5F259F]/20 bg-[#5F259F]/5"
                            : "border-slate-200 bg-slate-50/60"
                        )}
                      >
                        <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
                        <dd
                          className={cn(
                            "mt-0.5 font-semibold leading-tight tabular-nums",
                            item.highlight ? "text-[22px] text-[#5F259F]" : "text-lg text-slate-900"
                          )}
                        >
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Right: report */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500">
              {description}
              {period && (
                <span className="text-slate-400">
                  {" "}
                  · <CalendarRange className="inline h-3 w-3 -translate-y-px" /> {period}
                </span>
              )}
            </p>
          </div>
          {hasReport && toolbar && (
            <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
          )}
        </div>

        {collapsed && hasReport && summary.length > 0 && (
          <dl className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50/60 px-4 py-2.5">
            {summary.map((item) => (
              <div
                key={item.label}
                className="flex items-baseline gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1"
              >
                <dt className="text-xs text-slate-500">{item.label}</dt>
                <dd className="text-sm font-semibold tabular-nums text-slate-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {error && !loading && (
          <div className="border-b border-slate-200 p-3">
            <ReportErrorState message={error} onRetry={generate} />
          </div>
        )}

        <div className="relative min-h-[420px] flex-1 lg:min-h-0">
          {hasReport && (hasRows || loading) ? (
            <div className="absolute inset-0">{children}</div>
          ) : loading ? (
            <ReportLoadingState />
          ) : hasReport ? (
            <div className="flex h-full items-center justify-center p-6">
              <ReportEmptyState
                icon="search"
                title="No records found"
                message="Nothing matches these filters for the selected period. Try a wider date range or fewer filters."
                action={
                  activeFilterCount > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RotateCcw className="h-4 w-4" />}
                      onClick={resetFilters}
                      sx={{ textTransform: "none" }}
                    >
                      Reset filters
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            !error && (
              <div className="flex h-full items-center justify-center p-6">
                <ReportEmptyState
                  title="Choose a report period"
                  message="Select a date range and filters, then click Generate report."
                />
              </div>
            )
          )}
        </div>

        {paged && hasReport && total > 0 && (
          <div className="border-t border-slate-200">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={total}
              onPageChange={goToPage}
              pageSize={limit}
              onPageSizeChange={changeLimit}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default StoreReportShell;
