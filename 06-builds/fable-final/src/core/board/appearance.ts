// === What's in this file ===
// The per-object look-and-feel fields the editor can set on any widget box, kept
// as plain leaf types with no other imports so every layer can share them: the DB
// schema + its Zod codec, the core domain types (DisplayObject / SnapshotObject),
// the <Board> renderer, the widgets, and the editor UI.
//
// These used to live nowhere -- the old editor could set text alignment, frames,
// scrolling, table columns and so on, but the rebuild's data model couldn't store
// any of it. This file is that missing vocabulary.
//
// TextAlign / VerticalAlign -- how text sits inside a box.
// ObjectBackgroundMode -- how a box paints its own background ("canvas" = punch a
//   hole so the board background shows through).
// ScrollDirection -- which way a scrolling box moves.
// DisplayObjectAppearance -- the full per-object appearance bundle.
// DisplayObjectTableLayout -- the column/row/header options for table widgets
//   (zmanim + events), stored inside the object's JSON content.
// defaultAppearance() -- the appearance a brand-new object starts with.

export type TextAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";
export type ObjectBackgroundMode = "solid" | "transparent" | "gradient" | "texture" | "image" | "canvas";
export type ScrollDirection = "up" | "down" | "left" | "right";

export interface DisplayObjectAppearance {
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  /** null = let the widget decide; a number is an explicit CSS line-height multiplier. */
  lineHeight: number | null;
  backgroundMode: ObjectBackgroundMode;
  /** The solid color (also the fallback when an image/gradient/texture is missing). */
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundGradient: string | null;
  backgroundTexture: string | null;
  frameId: string | null;
  frameThickness: number;
  scrollingEnabled: boolean;
  scrollingDirection: ScrollDirection;
  /** Pixels per second. */
  scrollingSpeed: number;
}

export type TableSplitMode = "even" | "fillHeight";
export type TableTimeFormat = "default" | "24h" | "hideAmPm";

export interface DisplayObjectTableLayout {
  columns: 1 | 2 | 3 | 4;
  splitMode: TableSplitMode;
  showHeader: boolean;
  headerTextColor: string | null;
  headerBackgroundColor: string | null;
  /** A column-header row (e.g. "Name" / "Time") drawn above the data in EACH column. */
  showColumnHeaders: boolean;
  columnHeaderLabel: string | null;
  columnHeaderValue: string | null;
  borderWidth: number;
  borderColor: string | null;
  borderRadius: number;
  alternatingRows: boolean;
  rowColor1: string | null;
  rowColor2: string | null;
  rowSpacing: number;
  columnGap: number;
  /** Padding inside each cell. Defaults match the old look (6 top/bottom, 10 sides); 0 = truly tight. */
  cellPaddingY: number;
  cellPaddingX: number;
  columnSeparator: boolean;
  columnSeparatorColor: string | null;
  columnSeparatorWidth: number;
  textAlign: TextAlign;
  timeFormat: TableTimeFormat;
}

export function defaultAppearance(backgroundColor = "transparent"): DisplayObjectAppearance {
  return {
    textAlign: "center",
    verticalAlign: "middle",
    lineHeight: null,
    backgroundMode: backgroundColor === "transparent" ? "transparent" : "solid",
    backgroundColor,
    backgroundImage: null,
    backgroundGradient: null,
    backgroundTexture: null,
    frameId: null,
    frameThickness: 0,
    scrollingEnabled: false,
    scrollingDirection: "up",
    scrollingSpeed: 60,
  };
}

export function defaultTableLayout(): DisplayObjectTableLayout {
  return {
    columns: 1,
    splitMode: "even",
    showHeader: false,
    headerTextColor: null,
    headerBackgroundColor: null,
    showColumnHeaders: false,
    columnHeaderLabel: null,
    columnHeaderValue: null,
    borderWidth: 0,
    borderColor: null,
    borderRadius: 0,
    alternatingRows: false,
    rowColor1: null,
    rowColor2: null,
    rowSpacing: 0,
    columnGap: 0,
    cellPaddingY: 6,
    cellPaddingX: 10,
    columnSeparator: false,
    columnSeparatorColor: null,
    columnSeparatorWidth: 1,
    textAlign: "center",
    timeFormat: "default",
  };
}
