// === What's in this file ===
// Turns the editor's UNSAVED working document (objects + style + the shared board
// data fetched from the server) into the exact same DisplaySnapshot the live board
// renders. That's how the editor canvas shows real widgets with real data while you
// edit -- it feeds <BoardSurface> the same shape /show feeds it, so they can't drift.
// Client-safe on purpose: no server or kosher-zmanim imports.
//
// emptySharedData() -- a blank shared-data bundle so the canvas can render before
//   the real data arrives.
// requestedOffsetsFor() -- which day-offsets the current objects need (0 plus any
//   widget's `daysAhead`), so the server can compute zmanim for unsaved widgets too.
// buildEditorSnapshot() -- assemble the in-memory snapshot from the working document.

import type { DisplaySnapshot, SharedBoardData, SnapshotObject, BoardMode } from "@/core/board/types";
import type { EditorObject, EditorStyle } from "./types";

export function emptySharedData(): SharedBoardData {
  return {
    now: new Date().toISOString(),
    timezone: "UTC",
    zmanimByOffset: { "0": [] },
    calendarByOffset: {},
    minyanim: [],
    memorials: [],
    announcements: [],
    sponsors: [],
    media: [],
    scheduleGroups: [],
    displayNameOverrides: {},
  };
}

/** Day-offsets the objects reference (always 0, plus any widget's `daysAhead`). */
export function requestedOffsetsFor(objects: EditorObject[]): number[] {
  const offsets = new Set<number>([0]);
  for (const obj of objects) {
    const raw = (obj.content as { daysAhead?: unknown }).daysAhead;
    if (typeof raw === "number" && Number.isFinite(raw)) offsets.add(Math.trunc(raw));
  }
  return [...offsets].sort((a, b) => a - b);
}

function toSnapshotObject(obj: EditorObject): SnapshotObject {
  return {
    id: obj.id,
    type: obj.type,
    name: obj.name,
    position: { x: obj.posX, y: obj.posY, width: obj.width, height: obj.height },
    zIndex: obj.layer,
    font: { family: obj.fontFamily, size: obj.fontSize, bold: obj.fontBold, italic: obj.fontItalic, color: obj.foreColor },
    backgroundColor: obj.backColor,
    language: obj.language as SnapshotObject["language"],
    // The flat backColor is the saved solid colour (back_color); keep the appearance's
    // fallback colour in lockstep so the preview's solid background matches what saves.
    appearance: { ...obj.appearance, backgroundColor: obj.backColor },
    content: obj.content,
  };
}

export function buildEditorSnapshot(
  style: EditorStyle,
  objects: EditorObject[],
  data: SharedBoardData,
  mode: BoardMode,
): DisplaySnapshot & { style: NonNullable<DisplaySnapshot["style"]> } {
  return {
    generatedAt: new Date().toISOString(),
    effectiveDate: data.now,
    mode,
    breakpoint: "full",
    org: { id: "", name: "", slug: "" },
    screen: { id: "", name: "" },
    style: {
      id: style.id,
      name: style.name,
      canvasWidth: style.canvasWidth,
      canvasHeight: style.canvasHeight,
      backgroundColor: style.backgroundColor,
      backgroundMode: style.backgroundMode,
      backgroundImage: style.backgroundImage ?? undefined,
      backgroundGradient: style.backgroundGradient ?? undefined,
      backgroundTexture: style.backgroundTexture ?? undefined,
      backgroundFrameId: style.backgroundFrameId,
      backgroundFrameThickness: style.backgroundFrameThickness,
    },
    objects: [...objects].sort((a, b) => a.layer - b.layer).map(toSnapshotObject),
    data,
  };
}
