import { provideGlobalGridOptions, type ColDef } from "ag-grid-community";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";

/** Shared column defaults — merged into every grid (local colDef overrides per column). */
export const globalDefaultColDef: ColDef = {
  headerClass: "ag-header-cell-center",
  cellClass: "ag-cell-center",
};

/** Theme wrapper class used on grid containers. */
export const AG_GRID_THEME_CLASS = "ag-theme-quartz";

/** Default full-height class; override per screen when layout differs. */
export const AG_GRID_DEFAULT_HEIGHT_CLASS = "h-[calc(100vh-50px)]";

provideGlobalGridOptions(
  {
    headerHeight: 40,
    rowHeight: 40,
    defaultColDef: globalDefaultColDef,
    overlayNoRowsTemplate: OverlayNoRowsTemplate,
  },
  "deep",
);
