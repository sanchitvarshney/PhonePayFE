import type { ColDef, ExcelStyle } from "@ag-grid-community/core";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as XLSX from "xlsx";

dayjs.extend(customParseFormat);

const numberFormatter = new Intl.NumberFormat("en-IN");

export const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatNumber = (value: unknown) => numberFormatter.format(toNumber(value));

export const sumBy = <T>(rows: T[], get: (row: T) => unknown) =>
  rows.reduce((sum, row) => sum + toNumber(get(row)), 0);

const DATE_FORMATS = [
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
  "DD-MM-YYYY HH:mm:ss",
  "DD-MM-YYYY HH:mm",
  "YYYY-MM-DD",
  "DD-MM-YYYY",
];

export const formatDateTime = (value: unknown): string => {
  if (!value) return "";
  const text = String(value);
  const parsed = dayjs(text, DATE_FORMATS, true);
  const d = parsed.isValid() ? parsed : dayjs(text);
  return d.isValid() ? d.format("DD-MM-YYYY hh:mm A") : text;
};

// One column spec drives both the grid and the Excel export.
export type ReportColumn<T> = {
  header: string;
  field?: keyof T & string;
  value?: (row: T) => unknown;
  width?: number;
  minWidth?: number;
  flex?: number;
  numeric?: boolean;
  bold?: boolean;
  pinned?: "left" | "right";
  cellRenderer?: ColDef<T>["cellRenderer"];
  exportable?: boolean;
};

const readValue = <T>(col: ReportColumn<T>, row: T) =>
  col.value ? col.value(row) : col.field ? row[col.field] : "";

export const rowIndexCol: ColDef = {
  headerName: "#",
  colId: "rowIndex",
  sortable: false,
  width: 70,
  pinned: "left",
  cellClass: "text-slate-400",
  valueGetter: (params) =>
    params.node?.rowPinned ? "" : (params.context?.offset ?? 0) + (params.node?.rowIndex ?? 0) + 1,
};

export const toColDefs = <T>(columns: ReportColumn<T>[]): ColDef<T>[] => [
  rowIndexCol as ColDef<T>,
  ...columns.map<ColDef<T>>((col) => ({
    headerName: col.header,
    colId: col.field ?? col.header,
    field: col.field as ColDef<T>["field"],
    valueGetter: col.value
      ? (params) => (params.data ? col.value!(params.data) : undefined)
      : undefined,
    width: col.width,
    minWidth: col.minWidth ?? 110,
    flex: col.width ? undefined : col.flex ?? 1,
    pinned: col.pinned,
    cellRenderer: col.cellRenderer,
    type: col.numeric ? "numericColumn" : undefined,
    cellStyle: col.numeric
      ? { textAlign: "right", fontWeight: col.bold ? 600 : 400 }
      : col.bold
        ? { textAlign: "left", fontWeight: 600 }
        : undefined,
  })),
];

export const storeDefaultColDef: ColDef = {
  sortable: true,
  resizable: true,
  filter: false,
  wrapHeaderText: true,
  autoHeaderHeight: true,
  cellClassRules: {
    "grand-total-cell": (params) => params.node.rowPinned === "bottom",
  },
};

export const storeExcelStyles: ExcelStyle[] = [
  {
    id: "header",
    interior: { color: "#5F259F", pattern: "Solid" },
    font: { color: "#FFFFFF", bold: true },
  },
];

export const totalRowClass = (params: { node?: { rowPinned?: string | null } }) =>
  params.node?.rowPinned === "bottom" ? "store-total-row" : undefined;

export const exportRowsToExcel = <T>(
  rows: T[],
  columns: ReportColumn<T>[],
  fileName: string,
  sheetName: string
) => {
  const cols = columns.filter((c) => c.exportable !== false);
  const data = rows.map((row, i) => {
    const record: Record<string, unknown> = { "#": i + 1 };
    cols.forEach((c) => {
      record[c.header] = readValue(c, row) ?? "";
    });
    return record;
  });
  const sheet = XLSX.utils.json_to_sheet(data, { header: ["#", ...cols.map((c) => c.header)] });
  sheet["!cols"] = [{ wch: 6 }, ...cols.map((c) => ({ wch: Math.max(12, c.header.length + 4) }))];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName.slice(0, 31));
  XLSX.writeFile(book, fileName);
};
