// === What's in this file ===
// The one place tables (zmanim + minyan/events) turn rows into a laid-out grid, so the
// row-spacing, column-gap and fill-height behaviour live here once instead of being
// re-implemented (and re-broken) in each table widget. Given a list of label/value
// rows and a table layout, it handles: splitting into 1-4 columns, the gap between
// columns and between rows, "fill the height" vs natural rows, alternating row colours,
// an optional header bar, a border around the body, and optional column separators.
//
// TableRow -- one label/value pair to show.
// TableWidgetFrame -- renders the rows according to the layout.

import type { ReactNode } from "react";
import { defaultTableLayout, type DisplayObjectTableLayout } from "@/core/board/appearance";

export interface TableRow {
  key: string;
  label: ReactNode;
  value: ReactNode;
  /** Visually emphasize the happening-now / coming-up row (events table). */
  emphasis?: "current" | "next";
}

/**
 * The table layout for a table widget: the new `content.tableLayout` if present,
 * otherwise the old behaviour (alternating rows from the legacy rowColor fields, no
 * spacing) so existing boards look unchanged until someone opens the layout controls.
 */
export function resolveTableLayout(content: {
  tableLayout?: Partial<DisplayObjectTableLayout>;
  rowColor1?: string;
  rowColor2?: string;
}): DisplayObjectTableLayout {
  return {
    ...defaultTableLayout(),
    alternatingRows: true,
    rowColor1: content.rowColor1 ?? null,
    rowColor2: content.rowColor2 ?? "rgba(0,0,0,0.05)",
    ...(content.tableLayout ?? {}),
  };
}

/** The time-format options for a table: the layout's choice wins, else the widget's own flags. */
export function tableTimeOptions(
  layout: DisplayObjectTableLayout,
  content: { use24h?: boolean; hideAmPm?: boolean },
): { use24h: boolean; hideAmPm: boolean } {
  return {
    use24h: layout.timeFormat === "24h" ? true : content.use24h ?? false,
    hideAmPm: layout.timeFormat === "hideAmPm" ? true : content.hideAmPm ?? false,
  };
}

/** Split rows into N columns, filling each column top-to-bottom in order (balanced). */
function toColumns(rows: TableRow[], columns: number): TableRow[][] {
  const n = Math.max(1, Math.min(4, columns));
  if (n === 1) return [rows];
  const perColumn = Math.ceil(rows.length / n);
  const result: TableRow[][] = [];
  for (let i = 0; i < n; i++) result.push(rows.slice(i * perColumn, (i + 1) * perColumn));
  return result;
}

export function TableWidgetFrame({
  title,
  rows,
  layout,
  dir,
}: {
  title?: ReactNode;
  rows: TableRow[];
  layout: DisplayObjectTableLayout;
  dir: "rtl" | "ltr";
}) {
  const fill = layout.splitMode === "fillHeight";
  const showColumnHeaders = layout.showColumnHeaders && (layout.columnHeaderLabel || layout.columnHeaderValue);
  const cellPadding = `${layout.cellPaddingY}px ${layout.cellPaddingX}px`;
  // "Fill then spill" (the box fills one column top-to-bottom, then overflows into the
  // next) is a CSS multi-column flow -- but per-column headers need discrete columns, so
  // when headers are on we keep the balanced even-split layout instead.
  const spill = fill && layout.columns > 1 && !showColumnHeaders;

  const bodyBorder = {
    border: layout.borderWidth > 0 ? `${layout.borderWidth}px solid ${layout.borderColor ?? "currentColor"}` : undefined,
    borderRadius: layout.borderRadius || undefined,
    overflow: "hidden" as const,
  };

  const renderRow = (row: TableRow, idx: number) => {
    const striped = layout.alternatingRows
      ? idx % 2 === 0
        ? layout.rowColor1 ?? "transparent"
        : layout.rowColor2 ?? "rgba(0,0,0,0.05)"
      : undefined;
    const emphasis =
      row.emphasis === "next"
        ? { fontWeight: 700, borderInlineStart: "3px solid currentColor" }
        : row.emphasis === "current"
          ? { fontWeight: 700, borderInlineStart: "3px dashed currentColor", opacity: 0.95 }
          : null;
    return (
      <div
        key={row.key}
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          padding: cellPadding,
          textAlign: layout.textAlign,
          background: striped,
          flex: fill && !spill ? "1 1 0" : undefined,
          alignItems: "center",
          minHeight: 0,
          breakInside: spill ? "avoid" : undefined,
          ...emphasis,
        }}
      >
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{row.label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{row.value}</span>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }} dir={dir}>
      {layout.showHeader && title ? (
        <div
          style={{
            fontWeight: 700,
            padding: cellPadding,
            color: layout.headerTextColor ?? undefined,
            background: layout.headerBackgroundColor ?? undefined,
            textAlign: layout.textAlign,
          }}
        >
          {title}
        </div>
      ) : title ? (
        <div style={{ fontWeight: 700, marginBottom: 8, textAlign: layout.textAlign }}>{title}</div>
      ) : null}

      {spill ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            columnCount: layout.columns,
            columnGap: layout.columnGap,
            columnFill: "auto",
            columnRule: layout.columnSeparator
              ? `${layout.columnSeparatorWidth}px solid ${layout.columnSeparatorColor ?? "currentColor"}`
              : undefined,
            ...bodyBorder,
          }}
        >
          {rows.map((row, idx) => renderRow(row, idx))}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            gap: layout.columnGap,
            minHeight: 0,
            ...bodyBorder,
          }}
        >
          {((): ReactNode => {
            const columns = toColumns(rows, layout.columns);
            let rowCounter = 0;
            return columns.map((colRows, ci) => (
              <div key={ci} style={{ display: "contents" }}>
                {ci > 0 && layout.columnSeparator ? (
                  <div
                    style={{
                      width: layout.columnSeparatorWidth,
                      alignSelf: "stretch",
                      background: layout.columnSeparatorColor ?? "currentColor",
                      opacity: 0.4,
                    }}
                  />
                ) : null}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: layout.rowSpacing, minWidth: 0 }}>
                  {showColumnHeaders ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: cellPadding,
                        fontWeight: 700,
                        color: layout.headerTextColor ?? undefined,
                        background: layout.headerBackgroundColor ?? undefined,
                        textAlign: layout.textAlign,
                      }}
                    >
                      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{layout.columnHeaderLabel ?? ""}</span>
                      <span style={{ whiteSpace: "nowrap" }}>{layout.columnHeaderValue ?? ""}</span>
                    </div>
                  ) : null}
                  {colRows.map((row) => renderRow(row, rowCounter++))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
