// === What's in this file ===
// W0 completeness gate: every widget type the app can store (DisplayObjectType)
// must have a full registry entry — label, default content, content schema, and a
// renderer. If someone adds a new DisplayObjectType but forgets to register it,
// this test fails instead of the board silently showing a placeholder.

import { describe, expect, it } from "vitest";
import { DisplayObjectType } from "@/core/style-engine";
import { getWidget, listWidgets } from "./registry";

describe("widget registry completeness", () => {
  const allTypes = Object.values(DisplayObjectType);

  it.each(allTypes)("registers %s with a full definition", (type) => {
    const widget = getWidget(type);
    expect(widget, `missing registry entry for ${type}`).not.toBeNull();
    expect(widget!.label.length).toBeGreaterThan(0);
    expect(widget!.inventoryId).toMatch(/^W\d+$/);
    expect(typeof widget!.Renderer).not.toBe("undefined");
    expect(widget!.contentSchema).toBeDefined();
  });

  it("default content parses against the widget's own schema", () => {
    for (const widget of listWidgets()) {
      const result = widget.contentSchema.safeParse(widget.defaultContent());
      expect(result.success, `${widget.type} default content failed its schema: ${JSON.stringify(result)}`).toBe(true);
    }
  });

  it("has no entries for unknown types", () => {
    for (const widget of listWidgets()) {
      expect(allTypes).toContain(widget.type);
    }
  });
});
