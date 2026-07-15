"use client";

import { listWidgets } from "@/widgets/registry";
import { panelCard, btn } from "../ui";
import { useDoc, useUi } from "../state/StoreProvider";

const WIDGET_ICONS: Record<string, string> = {
  DIGITAL_CLOCK: "◷",
  ANALOG_CLOCK: "◴",
  ZMANIM_TABLE: "☀",
  EVENTS_TABLE: "☷",
  JEWISH_INFO: "✡",
  PLAIN_TEXT: "T",
  RICH_TEXT: "¶",
  COUNTDOWN_TIMER: "⌛",
  SCROLLING_TICKER: "↔",
  YAHRZEIT_DISPLAY: "🕯",
  SPONSOR_DISPLAY: "★",
  MEDIA_VIEWER: "▧",
  SHAPE_DIVIDER: "━",
  TEFILAH_NOTES: "≡",
  SEFIRA_COUNTER: "49",
  FIDS_BOARD: "▦",
  DATE_PICKER: "▣",
};

export function AddWidgetOverlay() {
  const open = useUi((s) => s.addOverlayOpen);
  const setAddOverlay = useUi((s) => s.setAddOverlay);
  const setSelection = useUi((s) => s.setSelection);
  const addWidget = useDoc((s) => s.addWidget);
  if (!open) return null;
  const widgets = listWidgets();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "rgba(2,6,23,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={() => setAddOverlay(false)}
    >
      <div
        style={{ ...panelCard, width: "min(900px, 100%)", maxHeight: "80vh", overflow: "auto", padding: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Add widget</h2>
          <button type="button" style={btn} onClick={() => setAddOverlay(false)}>
            Close
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
          {widgets.map((w) => (
            <button
              key={w.type}
              type="button"
              onClick={() => {
                const id = addWidget(w.type);
                if (id) setSelection([id]);
                setAddOverlay(false);
              }}
              style={{
                ...btn,
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 12,
              }}
            >
              <span aria-hidden style={{ fontSize: 24, lineHeight: 1 }}>
                {WIDGET_ICONS[w.type] ?? "◇"}
              </span>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{w.label}</span>
              <span style={{ fontSize: 10, color: "#94a3b8" }} dir="rtl">
                {w.labelHebrew}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
