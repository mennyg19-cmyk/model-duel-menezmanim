// === What's in this file ===
// Plain data shapes the visual editor passes around on the client. Kept separate
// from actions.ts (which is "use server") so client components import just the
// types without dragging a server module along.

import type { DisplayObjectAppearance } from "@/core/board/appearance";
import type { ScheduleRule } from "@/core/scheduler";
import type { ScheduleGroupVisibility } from "@/db/json";

export interface EditorObject {
  id: string;
  type: string;
  name: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  layer: number;
  fontFamily: string;
  fontSize: number;
  fontBold: boolean;
  fontItalic: boolean;
  foreColor: string;
  backColor: string;
  language: string;
  appearance: DisplayObjectAppearance;
  content: Record<string, unknown>;
  visible: boolean;
  /** When this widget is shown (empty/null = always). The engine treats multiple rules as "all must match". */
  scheduleRules: ScheduleRule[] | null;
  /** Show only when one of these schedule groups is active ({ [groupId]: true }). */
  scheduleGroupVisibility: ScheduleGroupVisibility | null;
}

export interface EditorStyle {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  backgroundMode: string;
  backgroundImage: string | null;
  backgroundGradient: string | null;
  backgroundTexture: string | null;
  backgroundFrameId: string | null;
  backgroundFrameThickness: number | null;
}
