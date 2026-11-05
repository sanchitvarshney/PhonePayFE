import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import dayjs, { Dayjs } from "dayjs";
import { showToast } from "@/utils/toasterContext";
import { getApiMessage } from "@/utils/getApiMessage";
import {
  STORE_REPORT_MAX_DAYS,
  STORE_REPORT_MAX_LIMIT,
  StoreReportPath,
  fetchAllStoreReportRows,
  fetchStoreReport,
} from "@/features/storeReports/storeReportsService";
import type { StoreReportParams } from "@/features/storeReports/storeReportsTypes";
import { ReportColumn, exportRowsToExcel } from "./storeReportUtils";

export type StoreReportFilters = Omit<
  StoreReportParams,
  "startDate" | "endDate" | "page" | "limit"
>;

export type DateRange = { from: Dayjs | null; to: Dayjs | null };

type Options = {
  path: StoreReportPath;
  paged?: boolean;
  defaultDays?: number;
};

const DEFAULT_LIMIT = 50;
const API_DATE = "DD-MM-YYYY";

const defaultRange = (days: number): DateRange => ({
  from: dayjs().subtract(days - 1, "day").startOf("day"),
  to: dayjs().startOf("day"),
});

const trimFilters = (filters: StoreReportFilters): StoreReportFilters =>
  Object.fromEntries(
    Object.entries(filters)
      .map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      .filter(([, v]) => v !== undefined && v !== "")
  );

const paramsKey = (p: StoreReportParams | null) => {
  if (!p) return "";
  const { page: _page, limit: _limit, ...rest } = p;
  return JSON.stringify(Object.entries(rest).sort(([a], [b]) => a.localeCompare(b)));
};

const toErrorMessage = (err: unknown) => {
  const axiosErr = err as AxiosError<{ message?: unknown }>;
  return getApiMessage(
    axiosErr.response?.data?.message,
    axiosErr.message || "Failed to load report"
  );
};

// Owns one report's filters, paging and data. Each report tab keeps its own state.
export const useStoreReport = <T>({ path, paged = true, defaultDays = 7 }: Options) => {
  const [date, setDate] = useState<DateRange>(() => defaultRange(defaultDays));
  const [filters, setFilters] = useState<StoreReportFilters>({});
  const [applied, setApplied] = useState<StoreReportParams | null>(null);
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const generatedOnce = useRef(false);

  // On unmount, cancel the request and allow the first load to run again on remount.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      generatedOnce.current = false;
    },
    []
  );

  const load = useCallback(
    async (params: StoreReportParams): Promise<T[] | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStoreReport<T>(path, params, controller.signal);
        if (res.success === false) {
          setError(getApiMessage(res.message, "Failed to load report"));
          setRows([]);
          setTotal(0);
          return null;
        }
        const data = res.data ?? [];
        setRows(data);
        setTotal(res.total ?? data.length);
        setApplied(params);
        setFetchedAt(Date.now());
        return data;
      } catch (err) {
        if (axios.isCancel(err)) return null;
        setError(toErrorMessage(err));
        return null;
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    },
    [path]
  );

  const currentParams = useMemo<StoreReportParams | null>(() => {
    if (!date.from || !date.to) return null;
    return {
      startDate: date.from.format(API_DATE),
      endDate: date.to.format(API_DATE),
      ...trimFilters(filters),
    };
  }, [date, filters]);

  const generate = useCallback(() => {
    if (!currentParams || !date.from || !date.to) {
      showToast("Select a date range", "error");
      return;
    }
    if (date.to.diff(date.from, "day") + 1 > STORE_REPORT_MAX_DAYS) {
      showToast(`Date range can be at most ${STORE_REPORT_MAX_DAYS} days`, "error");
      return;
    }
    setPage(1);
    load(paged ? { ...currentParams, page: 1, limit } : currentParams);
  }, [currentParams, date, limit, load, paged]);

  // Load the default period the first time the report opens.
  useEffect(() => {
    if (generatedOnce.current) return;
    generatedOnce.current = true;
    generate();
  }, [generate]);

  const goToPage = useCallback(
    (next: number) => {
      if (!applied) return;
      setPage(next);
      load({ ...applied, page: next, limit });
    },
    [applied, limit, load]
  );

  const changeLimit = useCallback(
    (next: number) => {
      const size = Math.min(Math.max(Math.round(next) || DEFAULT_LIMIT, 1), STORE_REPORT_MAX_LIMIT);
      setLimit(size);
      if (!applied) return;
      setPage(1);
      load({ ...applied, page: 1, limit: size });
    },
    [applied, load]
  );

  const refresh = useCallback(
    () => (applied ? load({ ...applied, ...(paged ? { page, limit } : {}) }) : Promise.resolve(null)),
    [applied, limit, load, page, paged]
  );

  const setFilter = useCallback(
    <K extends keyof StoreReportFilters>(key: K, value: StoreReportFilters[K]) =>
      setFilters((f) => ({ ...f, [key]: value })),
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({});
    setDate(defaultRange(defaultDays));
  }, [defaultDays]);

  const exportAll = useCallback(
    async (columns: ReportColumn<T>[], fileName: string, sheetName: string) => {
      if (!applied) return;
      setExporting(true);
      try {
        const { page: _page, limit: _limit, ...params } = applied;
        const all = await fetchAllStoreReportRows<T>(path, params, paged);
        if (!all.length) {
          showToast("No data to export", "warning");
          return;
        }
        const suffix = `${applied.startDate}_to_${applied.endDate}`;
        exportRowsToExcel(all, columns, `${fileName}_${suffix}.xlsx`, sheetName);
      } catch (err) {
        showToast(toErrorMessage(err), "error");
      } finally {
        setExporting(false);
      }
    },
    [applied, path, paged]
  );

  const activeFilterCount = Object.keys(trimFilters(filters)).length;

  return {
    date,
    setDate,
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
    applied,
    filtersChanged: !!applied && paramsKey(currentParams) !== paramsKey(applied),
    rows,
    total,
    page,
    limit,
    offset: paged ? (page - 1) * limit : 0,
    paged,
    loading,
    exporting,
    error,
    fetchedAt,
    generate,
    refresh,
    goToPage,
    changeLimit,
    exportAll,
  };
};

export type StoreReportState<T> = ReturnType<typeof useStoreReport<T>>;
