// === What's in this file ===
// The contract every widget (W1-W17) implements so the board can render any of
// them the same way. One registry entry per widget type; the snapshot decides
// which entries to draw and feeds each one the shared data + its own content.
//
// WidgetRenderProps -- what a widget's Renderer receives: its placed object
//   (position/font/content), the shared board data, and the board mode.
// WidgetDefinition  -- one widget's registration: its type key (matches the
//   DisplayObjectType enum), the inventory id (W1-W17), a label, the default
//   content used when a new one is dropped on the canvas, and the Renderer.

import type { ComponentType } from "react";
import type { z } from "zod/v4";
import type { SharedBoardData, SnapshotObject, BoardMode } from "@/core/board/types";

export interface WidgetRenderProps {
  object: SnapshotObject;
  data: SharedBoardData;
  mode: BoardMode;
}

export interface WidgetDefinition {
  type: string;
  inventoryId: string;
  label: string;
  /** Hebrew label for the palette (RTL admin). */
  labelHebrew?: string;
  defaultContent: () => Record<string, unknown>;
  /** The widget's own content shape — used by the editor and import/export validation. */
  contentSchema: z.ZodType;
  Renderer: ComponentType<WidgetRenderProps>;
}
