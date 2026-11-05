import React from "react";
import { CalendarRange, RotateCw, Search, SearchX, X, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TableSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const TableSearch: React.FC<TableSearchProps> = ({ value, onChange, placeholder }) => (
  <div className="relative w-full sm:w-64">
    <Search
      aria-hidden
      className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Search this page…"}
      aria-label={placeholder ?? "Search this page"}
      className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5F259F] focus:outline-none focus:ring-2 focus:ring-[#5F259F]/20 [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

export const ReportEmptyState: React.FC<{
  title: string;
  message: string;
  icon?: "calendar" | "search";
  action?: React.ReactNode;
}> = ({ title, message, icon = "calendar", action }) => {
  const Icon = icon === "search" ? SearchX : CalendarRange;
  return (
    <div className="flex max-w-md flex-col items-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5F259F]/10 text-[#5F259F]">
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export const ReportErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div
    role="alert"
    className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
  >
    <XCircle aria-hidden className="h-5 w-5 shrink-0 text-red-600" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-red-800">The report couldn't be loaded</p>
      <p className="text-sm text-red-700">{message}</p>
    </div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        <RotateCw aria-hidden className="h-4 w-4" />
        Try again
      </button>
    )}
  </div>
);

export const ReportLoadingState: React.FC = () => (
  <div aria-busy="true" aria-label="Loading report" className="flex flex-col gap-2 p-4">
    <Skeleton className="h-9 w-full bg-slate-200" />
    {Array.from({ length: 10 }).map((_, i) => (
      <Skeleton key={i} className="h-7 w-full bg-slate-100" />
    ))}
  </div>
);

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  ENTERED: "bg-sky-50 text-sky-700 ring-sky-200",
  COMPLETE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export const StatusBadge: React.FC<{ value?: string }> = ({ value }) =>
  value ? (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        STATUS_STYLES[value] ?? "bg-slate-50 text-slate-600 ring-slate-200"
      )}
    >
      {value.charAt(0) + value.slice(1).toLowerCase()}
    </span>
  ) : null;

export const AgeBadge: React.FC<{ days?: number }> = ({ days }) => {
  if (days == null) return null;
  const tone =
    days >= 7
      ? "bg-red-50 text-red-700 ring-red-200"
      : days >= 3
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-slate-50 text-slate-600 ring-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-inset",
        tone
      )}
    >
      {days} {days === 1 ? "day" : "days"}
    </span>
  );
};
