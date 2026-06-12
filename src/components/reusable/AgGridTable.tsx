import { forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { AgGridReactProps } from "ag-grid-react";
import {
  AG_GRID_DEFAULT_HEIGHT_CLASS,
  AG_GRID_THEME_CLASS,
} from "@/config/agGridConfig";
import { cn } from "@/lib/utils";

export type AgGridTableProps<TData = unknown> = AgGridReactProps<TData> & {
  /** Tailwind height class for the grid container. */
  heightClass?: string;
  /** Extra classes on the grid container (theme + height are applied by default). */
  wrapperClassName?: string;
};

/**
 * App-standard AG Grid wrapper.
 * Row/header height, centered cells, and no-rows overlay come from global config in `agGridConfig.ts`.
 */
function AgGridTableInner<TData = unknown>(
  {
    heightClass = AG_GRID_DEFAULT_HEIGHT_CLASS,
    wrapperClassName,
    className,
    ...gridProps
  }: AgGridTableProps<TData>,
  ref: React.Ref<AgGridReact<TData>>,
) {
  return (
    <AgGridReact<TData>
      ref={ref}
      className={cn(AG_GRID_THEME_CLASS, heightClass, wrapperClassName, className)}
      {...gridProps}
    />
  );
}

export const AgGridTable = forwardRef(AgGridTableInner) as <TData = unknown>(
  props: AgGridTableProps<TData> & { ref?: React.Ref<AgGridReact<TData>> },
) => React.ReactElement;
