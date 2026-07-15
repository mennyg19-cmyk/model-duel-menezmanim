// === What's in this file ===
// The one board renderer (C4). Given a finished snapshot it draws the authored
// canvas, places every visible widget at its exact coordinates, and dispatches
// each to its registered renderer. This is the only code that paints a board, so
// /show, the editor, the desktop and exports all look identical.
//
// The canvas surface is split out as <BoardSurface> so the editor can render the
// EXACT same surface (with real widgets + real data) under its editing overlay,
// instead of drawing its own fake preview. <Board> is the live wrapper that scales
// that surface to fill a screen; the editor supplies its own zoom instead.
//
// canvasBackground() -- the style's background fields as a CSS background.
// BoardObjectSlot() -- one placed widget: its wrapper box + the widget renderer.
// BoardSurface() -- the authored-size canvas with background + all objects.
// Board() -- the full-screen scaled wrapper used by the live display surfaces.

import type { DisplaySnapshot, SnapshotObject, SnapshotStyle } from "@/core/board/types";
import { ScaleToFit } from "./ScaleToFit";
import { getWidget } from "@/widgets/registry";
import { backgroundCss, frameStyle, scrollCss } from "@/core/board/decor";

export function canvasBackground(style: SnapshotStyle): string {
  return (
    backgroundCss({
      mode: style.backgroundMode,
      color: style.backgroundColor,
      gradient: style.backgroundGradient,
      texture: style.backgroundTexture,
      image: style.backgroundImage,
    }) ?? style.backgroundColor
  );
}

function fontWeight(bold: boolean): number {
  return bold ? 700 : 400;
}

function WidgetSlot({ object, snapshot }: { object: SnapshotObject; snapshot: DisplaySnapshot }) {
  const widget = getWidget(object.type);
  if (!widget) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5, border: "1px dashed currentColor", fontSize: 14 }}>
        {object.name} ({object.type})
      </div>
    );
  }
  const Renderer = widget.Renderer;
  return <Renderer object={object} data={snapshot.data} mode={snapshot.mode} />;
}

const VERTICAL_JUSTIFY = { top: "flex-start", middle: "center", bottom: "flex-end" } as const;

/** One placed widget: the positioned box the Board paints + the widget itself. */
export function BoardObjectSlot({
  object,
  snapshot,
  pointerEvents = "auto",
}: {
  object: SnapshotObject;
  snapshot: DisplaySnapshot;
  pointerEvents?: "auto" | "none";
}) {
  const a = object.appearance;
  const background = backgroundCss({
    mode: a.backgroundMode,
    color: a.backgroundColor,
    gradient: a.backgroundGradient,
    texture: a.backgroundTexture,
    image: a.backgroundImage,
  });
  const frame = frameStyle(a.frameId, a.frameThickness);
  const scroll = scrollCss({
    enabled: a.scrollingEnabled,
    direction: a.scrollingDirection,
    speed: a.scrollingSpeed,
    width: object.position.width,
    height: object.position.height,
  });

  const inner = <WidgetSlot object={object} snapshot={snapshot} />;

  return (
    <div
      style={{
        position: "absolute",
        left: object.position.x,
        top: object.position.y,
        width: object.position.width,
        height: object.position.height,
        zIndex: object.zIndex,
        fontFamily: object.font.family,
        fontSize: object.font.size,
        fontWeight: fontWeight(object.font.bold),
        fontStyle: object.font.italic ? "italic" : "normal",
        color: object.font.color,
        textAlign: a.textAlign,
        lineHeight: a.lineHeight ?? undefined,
        background,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent: VERTICAL_JUSTIFY[a.verticalAlign],
        ...frame,
        pointerEvents,
      }}
    >
      {scroll ? <div style={{ ...scroll, width: "100%", flexShrink: 0 }}>{inner}</div> : inner}
    </div>
  );
}

/**
 * The authored-resolution canvas: the style background plus every object at its
 * exact coordinates. No scaling here -- the caller (Board for live, the editor for
 * editing) decides how to scale this surface. `objectPointerEvents="none"` lets the
 * editor capture all gestures on its overlay instead of the live widgets.
 */
export function BoardSurface({
  snapshot,
  objectPointerEvents = "auto",
}: {
  snapshot: DisplaySnapshot & { style: SnapshotStyle };
  objectPointerEvents?: "auto" | "none";
}) {
  const style = snapshot.style;
  const canvasFrame = frameStyle(style.backgroundFrameId ?? null, style.backgroundFrameThickness ?? 0);
  return (
    <div
      style={{
        position: "relative",
        width: style.canvasWidth,
        height: style.canvasHeight,
        background: canvasBackground(style),
        overflow: "hidden",
        boxSizing: "border-box",
        ...canvasFrame,
      }}
    >
      {snapshot.objects.map((object) => (
        <BoardObjectSlot key={object.id} object={object} snapshot={snapshot} pointerEvents={objectPointerEvents} />
      ))}
    </div>
  );
}

export function Board({ snapshot }: { snapshot: DisplaySnapshot }) {
  const style = snapshot.style;
  if (!style) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        No active board style for this screen.
      </div>
    );
  }

  const fitMode = snapshot.breakpoint === "mobile" ? "width" : "contain";

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: fitMode === "width" ? "auto" : "hidden" }}>
      <ScaleToFit width={style.canvasWidth} height={style.canvasHeight} fitMode={fitMode}>
        <BoardSurface snapshot={{ ...snapshot, style }} />
      </ScaleToFit>
    </div>
  );
}
