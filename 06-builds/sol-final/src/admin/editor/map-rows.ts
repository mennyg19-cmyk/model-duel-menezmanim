import type { DisplayObjectAppearance } from "@/core/board/appearance";
import type { StyleActivationRule } from "@/core/style-engine";
import type { EditorObject, EditorStyle } from "@/admin/editor/types";

type StyleRow = {
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
  isDefault: boolean;
  activationRules: StyleActivationRule[] | unknown;
  sortOrder: number;
};

type ObjectRow = {
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
  textAlign: string;
  verticalAlign: string;
  lineHeight: number | null;
  backgroundMode: string;
  backgroundImage: string | null;
  backgroundGradient: string | null;
  backgroundTexture: string | null;
  frameId: string | null;
  frameThickness: number;
  scrollingEnabled: boolean;
  scrollingDirection: string;
  scrollingSpeed: number;
  content: Record<string, unknown> | null;
  visible: boolean;
  scheduleRules: EditorObject["scheduleRules"];
  scheduleGroupVisibility: EditorObject["scheduleGroupVisibility"];
};

export function toEditorStyle(row: StyleRow): EditorStyle {
  return {
    id: row.id,
    name: row.name,
    canvasWidth: row.canvasWidth,
    canvasHeight: row.canvasHeight,
    backgroundColor: row.backgroundColor,
    backgroundMode: row.backgroundMode,
    backgroundImage: row.backgroundImage,
    backgroundGradient: row.backgroundGradient,
    backgroundTexture: row.backgroundTexture,
    backgroundFrameId: row.backgroundFrameId,
    backgroundFrameThickness: row.backgroundFrameThickness,
  };
}

export function toEditorObject(o: ObjectRow): EditorObject {
  const appearance: DisplayObjectAppearance = {
    textAlign: o.textAlign as DisplayObjectAppearance["textAlign"],
    verticalAlign: o.verticalAlign as DisplayObjectAppearance["verticalAlign"],
    lineHeight: o.lineHeight ?? null,
    backgroundMode: o.backgroundMode as DisplayObjectAppearance["backgroundMode"],
    backgroundColor: o.backColor,
    backgroundImage: o.backgroundImage ?? null,
    backgroundGradient: o.backgroundGradient ?? null,
    backgroundTexture: o.backgroundTexture ?? null,
    frameId: o.frameId ?? null,
    frameThickness: o.frameThickness,
    scrollingEnabled: o.scrollingEnabled,
    scrollingDirection: o.scrollingDirection as DisplayObjectAppearance["scrollingDirection"],
    scrollingSpeed: o.scrollingSpeed,
  };
  return {
    id: o.id,
    type: o.type,
    name: o.name,
    posX: o.posX,
    posY: o.posY,
    width: o.width,
    height: o.height,
    layer: o.layer,
    fontFamily: o.fontFamily,
    fontSize: o.fontSize,
    fontBold: o.fontBold,
    fontItalic: o.fontItalic,
    foreColor: o.foreColor,
    backColor: o.backColor,
    language: o.language,
    appearance,
    content: (o.content as Record<string, unknown> | null) ?? {},
    visible: o.visible,
    scheduleRules: o.scheduleRules ?? null,
    scheduleGroupVisibility: o.scheduleGroupVisibility ?? null,
  };
}
