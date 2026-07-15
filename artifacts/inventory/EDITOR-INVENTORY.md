# Board Editor — Old vs New Inventory & Wix-Gap Analysis

The screen/board editor in the rebuild was built far too simply. This is the full
inventory of what the **old editor** (the tuned, Wix-like one) did, what the **new
editor** actually does, and every gap — so we can rebuild it properly.

Sources (all read in full): old code at the `legacy-zmanim` branch
(`packages/ui/src/admin/sections/EditorSection/` etc., worktree under
`.scratch/legacy-wt/`), new code at `apps/web/src/admin/editor/`, and your own
chat-history requirements mined from the 163-message editor rebuild thread.
Detailed source docs: `.scratch/editor-old-inventory.md`,
`.scratch/editor-new-inventory.md`, `.scratch/editor-journey.md`.

---

## Verdict

The old editor was ~4,660 lines across **16 purpose-built components**; the new one is
~900 lines in **one `EditorClient.tsx`**. The new editor reproduced roughly **20%** of
the old feature set and missed the two things that made the old one feel like Wix:

1. **It does not edit live.** In edit mode the new canvas shows each widget as a plain
   **dashed box with its name** — the real widget only appears when you flip a separate
   "Preview" toggle. The old editor rendered the **real widgets with real data while you
   edited** (it imported the live board renderer, `renderWidgetForEditor`). Your exact
   words: *"I need it to be exactly the same so I can edit it 'live'."*
2. **The whole Wix interaction layer is gone** — 8-way resize, snap/alignment guides,
   grid, multi-select, alignment+distribute, the add-widget grid overlay, the tabbed
   property panel with per-widget editors, and the frame/texture/gradient pickers.

---

## Root-cause architecture gaps

| # | Gap | Old | New |
|---|---|---|---|
| A1 | **Live render in edit mode** | Canvas calls `renderWidgetForEditor(obj, previewData)` from `display/BoardRenderer` so the editing surface == live board | Edit mode draws a `<div>` with the object **name**; real render only behind a "Preview" toggle, and even then it bypasses the live `<Board>` wrapper (no background/frame/scale parity) |
| A2 | **Single editor file** | 16 components (canvas, toolbars, pickers, property tabs, panels) | Everything crammed in `EditorClient.tsx` (643 lines) |
| A3 | **Per-object data model** | `DisplayObject` carried textAlign, verticalAlign, lineHeight, frame, scrolling, table-layout, etc. | `EditorObject` (`types.ts`) has only font + 2 colors; the `display_objects` table is missing those columns too — **schema work required** |
| A4 | **Style data model exposed** | Editor exposed texture/frame/gradient/activation-rule fields | The `styles` table HAS `backgroundTexture`, `backgroundFrameId/Thickness`, `backgroundGradient`, `activationRules` — but the editor exposes none of them |

---

## Capability matrix (by area)

Legend: ✅ full · 🟡 partial · ❌ missing. "Old source" = where to port from.

### 1. Canvas interaction
| Capability | Old | New | Old source |
|---|---|---|---|
| Drag-move objects | ✅ | ✅ | Canvas.tsx |
| Resize handles | ✅ 8-way (nw,n,ne,e,se,s,sw,w) | 🟡 1 (bottom-right only) | Canvas.tsx `HANDLE_DEFS` |
| Snap / alignment guides (pink lines, 4–6px threshold, edges+centers, vs canvas & other objects) | ✅ | ❌ | Canvas.tsx `computeSnapGuides` |
| Grid snapping (10px) | ✅ | ❌ | Canvas.tsx `snapToGrid` |
| Zoom: fit / fill / custom % | ✅ | 🟡 fit only, no controls | Canvas.tsx `ZoomMode`, CanvasToolbar |
| Multi-select (Shift/Ctrl-click, purple) | ✅ | ❌ | EditorSection.tsx |
| Keyboard: arrows 1px / Shift 10px, Delete, Esc | ✅ | 🟡 arrows+Delete (no Esc/multi) | EditorSection.tsx |
| Copy / paste / duplicate | ✅ Ctrl+C/V/D | 🟡 duplicate only | EditorSection.tsx |
| Undo / redo | ✅ | ✅ | store |
| Right-click context menu (edit/dup/copy/delete/paste) | ✅ | ❌ | Canvas.tsx |
| Z-order | ✅ index + controls | 🟡 forward/back swap only | — |

### 2. Layout & panels
| Capability | Old | New | Old source |
|---|---|---|---|
| Panel side | Left (admin chrome on right) | Right | — |
| Object-list view when nothing selected | ✅ dedicated, drag-reorder, per-row edit/dup/delete/visibility | 🟡 flat "Layers" name list, no inline actions | ObjectListPanel.tsx |
| Collapsible panel/sections | ✅ all sections collapsible, collapsed by default | ❌ | editorPanel store |
| Section + tab **memory** across object switches | ✅ (Zustand `activeTab`, `expandedSections`) | ❌ | stores/editorPanel.ts |

### 3. Property panel (tabbed)
| Tab / control | Old | New | Old source |
|---|---|---|---|
| Tabs (General / Appearance / Content) | ✅ | ❌ one flat scroll | PropertyPanel/* |
| General: name, type, X/Y/W/H, z-index, visible, **schedule rules** | ✅ | 🟡 name/X/Y/W/H/visible (no z-index field, no schedule rules) | GeneralTab.tsx |
| Appearance: font family/size/bold/italic/color | ✅ | ✅ | AppearanceTab.tsx |
| Appearance: **text-align, vertical-align, line-height** | ✅ | ❌ | AppearanceTab.tsx |
| Appearance: background modes (solid/transparent/gradient/texture/image/**canvas punch-through**) | ✅ | 🟡 solid + raw-CSS gradient only | AppearanceTab/BackgroundPicker |
| Appearance: **frame** (9-slice) + thickness | ✅ | ❌ | AppearanceTab/FramePicker |
| Appearance: **scrolling** (enable/direction/speed) | ✅ | ❌ | AppearanceTab.tsx |
| Appearance: **table layout** (border, header row, alternating rows) | ✅ | ❌ | AppearanceTab.tsx |
| Content: generic primitive fields | ✅ | 🟡 generic + raw JSON | ContentTab.tsx vs ContentFields.tsx |
| Content: **per-widget editors** (see §4) | ✅ | ❌ | ContentTab.tsx + sub-panels |

### 4. Per-widget content editors (old had bespoke UIs; new has none)
| Widget | Old controls | New |
|---|---|---|
| Digital clock | 24h / seconds / AM-PM | ❌ generic |
| Analog clock | presets + custom face/border/hand/numbers/ticks colors & styles | ❌ |
| Media viewer | all-media, rotate interval, fit mode, fade | ❌ |
| Zmanim table | date offset/mode, per-zman checkbox selector (`ZmanimListEditor`) | ❌ |
| Events table | title, date mode, show room/header, davening groups, dynamic schedules, **current/next emphasis** | ❌ |
| Scrolling ticker | all/specific announcements, layout, separator | ❌ |
| Jewish info | item selection + reorder, layout, separator, **per-item title modes** (hidden/default/custom/inline) | ❌ |
| Countdown | source mode, group/zman selectors, title, display toggles, format | ❌ |
| Multi-column tables | 1–4 columns, even-split vs fill-height, per-column headers, column gap/separator, row spacing, text align | ❌ |

### 5. Add-widget
| Capability | Old | New | Old source |
|---|---|---|---|
| Add-widget UI | ✅ centered **grid-of-cards overlay** "like Wix" (icon + name) | 🟡 plain text-button list in left rail | CanvasToolbar.tsx |

### 6. Pickers / backgrounds / frames
| Capability | Old | New | Old source |
|---|---|---|---|
| Background picker (tabs: solid/gradient/texture/image, live preview, upload) | ✅ | ❌ | BackgroundPicker.tsx |
| Frame picker (9-slice: ornamental/modern/minimal + thickness) | ✅ | ❌ | FramePicker.tsx |
| Gradient picker (presets by warm/cool/neutral/vibrant + custom angle/stops) | ✅ | 🟡 raw CSS text field | GradientPicker.tsx |
| Texture picker (stone/wood/fabric/metal/paper, incl. marble) | ✅ | ❌ | TexturePicker.tsx |
| Per-object image upload / canvas punch-through | ✅ | ❌ | AppearanceTab.tsx |

### 7. Styles, screens, preview
| Capability | Old | New | Old source |
|---|---|---|---|
| Style manager (list, create, duplicate, delete) | ✅ | 🟡 rename + canvas size of the one open style | StyleManager.tsx |
| Style **activation rules** (default / gregorian range / hebrew range / time-of-day) | ✅ | ❌ (schema supports it) | StyleManager.tsx |
| Screen selector + auto-pick assigned style | ✅ | ❌ (preview uses screens[0]) | CanvasToolbar/page.tsx |
| Alignment + distribute toolbar | ✅ | ❌ | AlignmentToolbar.tsx |
| Preview-date picker (Gregorian / **Hebrew** / **next-12-Shabbosim + weekday**) | ✅ | ❌ | PreviewDatePicker.tsx |
| Live preview link | ✅ | ✅ (opens `/show`) | — |

---

## Your Wix requirements (your own words) → status

- *"overlay over the canvas with all the options in a grid like Wix"* → ❌ (text list)
- *"resize grabbers on all sides … only on the top, left and top left corner. add it"* → 🟡 1 handle
- *"snapping lines like Canva has"* → ❌
- *"centering button, horizontal and vertical … align two boxes tops/bottoms/middles"* → ❌
- *"arrow keys … move the box over a pixel"* → ✅
- *"right panel like the wix editor … always there but collapsible … when nothing selected show a list of boxes"* → 🟡 (not collapsible, weak list) — and you later moved it **left**
- *"keep in memory which section is expanded … open to the same panel and section"* → ❌
- *"click an object … just select it on the canvas … buttons with a pencil to edit, duplicate, delete"* → ❌
- *"render the boxes … exactly the same … so I can edit it 'live' … populate with their data"* → ❌ (names only in edit mode)
- *"multiple columns … fill the entire height of the box and then spill over"* → ❌
- *"header row … display for each column … aligned to the data"* → ❌
- *"emphasizing the next and current event"* → ❌
- *"transparent … canvas background layer from below the box"* → ❌
- Frames / marble textures / gradients / prebuilt themes → ❌ / 🟡

---

## Not editor-UI (surfaced in the same chats; track separately)

- **Zmanim accuracy** (Tukachinsky within ~45s, BeeZee VB.NET engine reverse-engineer,
  elevation vs sea-level, 31.79/35.21/1000m, 55-week Neitz check). The rebuild already
  ships 32 zman types incl. Tukachinsky — verify against your live calendar separately.
- **Scheduling/visibility rules engine** (weekday/Shabbos/YT/CHM/fast/erev/Chanukah/
  Rosh Chodesh/DST, durations, rounding) — backend types exist (`scheduleRules`); the
  editor UI for them is missing.

---

## Source-of-truth map for the rebuild

Old editor lives on branch `legacy-zmanim` (readable worktree at `.scratch/legacy-wt/`):
`packages/ui/src/admin/sections/EditorSection/` (Canvas, CanvasToolbar, AlignmentToolbar,
BackgroundPicker, ObjectListPanel, PreviewDatePicker, StyleManager, EditorSection,
PropertyPanel/{GeneralTab,AppearanceTab,ContentTab,AnalogClockContent,CountdownContent}),
`packages/ui/src/editor/{FramePicker,GradientPicker,TexturePicker}.tsx`,
`packages/ui/src/stores/editorPanel.ts`, and `packages/ui/src/display/BoardRenderer.tsx`
(`renderWidgetForEditor`).

**Porting note:** it is not a copy-paste. The old app is a `packages/ui` monorepo on
`@zmanim-app/core` `DisplayObject`; the new app uses `apps/web` with the W1–W17 widget
registry and `SnapshotObject`/`<Board>`. The rebuild must: (1) add per-object appearance
+ table-layout columns to `display_objects` and `EditorObject`; (2) make the new widget
renderers honor those props; (3) render the live widgets in edit mode through the same
path as `<Board>`; then (4) layer the Wix interaction UX on top.

---

## Suggested rebuild order (for when you approve it)

1. **Live WYSIWYG canvas** — render real widgets with real data in edit mode via the
   `<Board>`/registry path (kills the #1 complaint). 
2. **Canvas interaction** — 8-way resize, snap/align guides, grid, multi-select,
   alignment+distribute, context menu, full keyboard.
3. **Panel/UX** — left object-list (select-only + inline edit/dup/delete), collapsible
   tabbed property panel with section+tab memory, Wix add-widget grid overlay.
4. **Appearance depth** — schema + UI for text/vertical align, line-height, background
   modes (incl. transparent + canvas punch-through), frame/texture/gradient pickers.
5. **Per-widget content editors** — table multi-column/fill-height/headers/row-styling,
   zmanim selection, events emphasis/scheduling, Jewish-info title modes, clocks, etc.
6. **Styles/screens/preview** — style manager + activation rules, screen selector,
   preview-date picker (Hebrew/weekly).

---

# Phase 1 — Feature ID Ledger (rebuild source of truth)

Stable IDs for the rebuild. Every ID must map to exactly one build todo and end as
KEEP (built+verified) or DROP-with-approval. "Old file" = `legacy-zmanim` worktree under
`.scratch/legacy-wt/packages/ui/src/...`. New target = `apps/web/src/admin/editor/`.

## Surface manifest (editor regions that must each have a working counterpart)
- **S1 Canvas** — the editing surface (old `admin/sections/EditorSection/Canvas.tsx`)
- **S2 Object panel** — object list + add-widget (old `ObjectListPanel.tsx`, `CanvasToolbar.tsx`)
- **S3 Property panel** — tabbed General/Appearance/Content (old `PropertyPanel/*`)
- **S4 Toolbars** — canvas toolbar + alignment toolbar (old `CanvasToolbar.tsx`, `AlignmentToolbar.tsx`)
- **S5 Pickers** — background/frame/gradient/texture (old `editor/{Background,Frame,Gradient,Texture}Picker.tsx`)
- **S6 Style/Screen mgmt** — style list + activation rules + screen select (old `StyleManager.tsx`)
- **S7 Preview** — live preview link + preview-date picker (old `PreviewDatePicker.tsx`)
- **S8 Live-render engine** — edit surface renders real widgets w/ real data (old `display/BoardRenderer` `renderWidgetForEditor`; new `board/Board` + registry)
- **S9 Editor UI state** — tab/section memory (old `stores/editorPanel.ts`)
- **S10 Data model** — schema/types backing all of the above

## Feature IDs

### S1 Canvas
- **E1.1** Drag-move objects — KEEP (new has it)
- **E1.2** 8-way resize handles (nw,n,ne,e,se,s,sw,w; 20px min) — FIX (new: 1 handle)
- **E1.3** Snap/alignment guides (pink lines, edges+centers vs canvas & objects, ~4–6px) — ADD
- **E1.4** Grid snap (10px) — ADD
- **E1.5** Zoom: fit / fill / custom % with controls — FIX (new: fit only)
- **E1.6** Multi-select (Shift/Ctrl/Cmd-click) — ADD
- **E1.7** Keyboard: arrows 1px / Shift 10px, Delete, Esc, Ctrl+C/V/D, Ctrl+Z/Y — FIX (new: partial)
- **E1.8** Z-order render by zIndex — KEEP
- **E1.9** Right-click context menu (edit/dup/copy/delete; paste on empty) — ADD
- **E1.10** Undo/redo — KEEP

### S2 Object panel
- **E2.1** List/detail view modes (auto-detail on select) — FIX
- **E2.2** Object list sorted by z, drag-reorder — FIX (new: flat name list, no reorder)
- **E2.3** Per-row actions: select-only on click, pencil-edit, duplicate, delete, visibility — ADD
- **E2.4** Add-widget grid-of-cards overlay ("like Wix") — FIX (new: text-button list)

### S3 Property panel (tabbed)
- **E3.1** Tabs General/Appearance/Content — ADD (new: one flat scroll)
- **E3.2** General: name, type(ro), X/Y/W/H, z-index, visibility, schedule-rules — FIX
- **E3.3** Appearance font/text: family, size, bold, italic, color — KEEP
- **E3.4** Appearance text-align / vertical-align / line-height / lang direction — ADD
- **E3.5** Appearance background modes: solid/transparent/gradient/texture/image/canvas-punch-through — FIX
- **E3.6** Appearance frame (9-slice) + thickness — ADD
- **E3.7** Appearance scrolling (enable/direction/speed 5–200) — ADD
- **E3.8** Appearance table-layout: border, header row + colors, alternating rows, column gap/separator, row spacing, text align, columns 1–4 even-split vs fill-height — ADD
- **E3.9** Content: per-widget editors (see S-widgets below) — ADD (new: generic+JSON)

### S3W Per-widget content editors
- **EW.1** Plain text — KEEP · **EW.2** Rich text (HTML) — KEEP
- **EW.3** Digital clock (24h/seconds/AM-PM) — ADD
- **EW.4** Analog clock (presets + custom face/border/hand/numbers/ticks) — ADD
- **EW.5** Media viewer (all-media, interval, fit, fade) — ADD
- **EW.6** Zmanim table (date offset/mode, per-zman checkbox selector) — ADD
- **EW.7** Events table (title, date mode, room/header toggles, davening groups, dynamic schedules, current/next emphasis) — ADD
- **EW.8** Scrolling ticker (all/specific announcements, layout, separator) — ADD
- **EW.9** Jewish info (item select+reorder, layout, separator, per-item title modes hidden/default/custom/inline) — ADD
- **EW.10** Countdown (source mode, group/zman selectors, title, toggles, format) — ADD
- **EW.11** Auto-populated widgets (yahrzeit/FIDS/sefira/date) — note row — KEEP

### S4 Toolbars
- **E4.1** Canvas toolbar (style select, new/del style, canvas W×H, add-widget, undo/redo, zoom, bg editor, preview, save) — FIX
- **E4.2** Alignment toolbar — single-object align-to-canvas (7 ops) — ADD
- **E4.3** Alignment toolbar — multi align-to-each-other + distribute (3+) — ADD

### S5 Pickers
- **E5.1** Background picker (tabs solid/gradient/texture/image, upload, live preview) — ADD
- **E5.2** Frame picker (ornamental/modern/minimal + thickness) — ADD
- **E5.3** Gradient picker (presets warm/cool/neutral/vibrant + custom angle/stops) — FIX (new: raw CSS field)
- **E5.4** Texture picker (stone/wood/fabric/metal/paper incl. marble) — ADD

### S6 Style / Screen management
- **E6.1** Style list (sorted, default badge), create/duplicate/delete — FIX (new: rename+size only)
- **E6.2** Style activation rules (default / gregorian range / hebrew range / time-of-day) — ADD (schema exists)
- **E6.3** Screen selector + auto-pick assigned style for preview — ADD

### S7 Preview
- **E7.1** Live preview link — KEEP
- **E7.2** Preview-date picker (Gregorian / Hebrew / next-12-Shabbosim + weekday + time, apply/reset) — ADD

### S8 Live-render engine
- **E8.1** Edit surface renders real widgets with real data (not name placeholders) — FIX (the #1 item)
- **E8.2** Editor uses the same render path as live `<Board>` (background/frame/scale parity) — FIX

### S9 Editor UI state
- **E9.1** Active-tab memory across object switches — ADD
- **E9.2** Expanded-section memory (collapsible sections, collapsed by default) — ADD

### S10 Data model (schema work)
- **E10.1** Per-object appearance columns: textAlign, verticalAlign, lineHeight, frameId, frameThickness, scrolling{enabled,dir,speed}, background mode/image/texture/gradient — ADD (migration)
- **E10.2** Per-object table-layout content shape (columns, splitMode, header, rowStyling, gaps, separators) — ADD
- **E10.3** Per-widget content shapes parity (clocks, countdown, jewish-info title modes, zmanim selection, events emphasis/schedules) — ADD
- **E10.4** `EditorObject`/`EditorStyle` types extended to carry all the above — ADD

## To-fix (structure problems to correct, not copy)
- **TF1** Edit mode shows widget *names*, not the live widget — unify on one render path.
- **TF2** Monolithic `EditorClient.tsx` — split into canvas / panels / pickers / per-widget editors by concern.
- **TF3** Property panel is one flat scroll — make it tabbed + collapsible with memory (your explicit ask).
- **TF4** Add-widget is a text list — make it the Wix grid overlay.
- **TF5** Data model can't express what the old editor edited — extend schema + types FIRST so UI isn't blocked.
- **TF6** Panel side/placement is a free choice ("what not how") — keep collapsible side panels that control all additions; move bars where they work best.

## Out of editor scope (tracked elsewhere, not part of this rebuild)
- Zmanim calculation accuracy (already 32 zman types incl. Tukachinsky — verify separately).
- Full scheduling/visibility rules *engine* (backend types exist; editor exposes the rules UI via E3.2/EW.7).

---

# Phase 1 addendum — S0 Editor shell & layout (this rebuild)

Added after the first editor rebuild shipped: the FEATURES (E1.x–E10.x, EW.x) came out
right, but the SHELL that hosts them was bolted inside the admin chrome and came out wrong
(see screenshots: opening the admin menu tray pushes the editor out of frame; dead space on
the left; the whole editor never fits; the side panels squeeze the canvas instead of
floating over it). This section is the missing inventory for the shell, mined again from the
OLD editor (`legacy-zmanim` worktree `EditorSection.tsx`, `CanvasToolbar.tsx`,
`ObjectListPanel.tsx`) for "what", plus the layout decisions made with the user in plan
`editor_full-screen_rebuild` (those decisions are now first-class inventory).

Old editor = WHAT, not HOW. The old shell was itself docked inside admin chrome with a
single right panel that toggled list <-> detail, and modal pickers. We keep every behavior
it had (collapsible panel, list/detail, tab/section memory, fit/fill/custom zoom, preview
date bar, canvas-size editing, all toolbar controls) and fix HOW it is laid out
(full-screen, dual floating panels over a full-bleed canvas).

## Surface
- **S0 Editor shell & layout** — the frame around everything: how the editor fills the
  screen, where the canvas/panels/top bar sit, and how panels open/collapse.
  Old: `admin/sections/EditorSection/EditorSection.tsx` (+ `CanvasToolbar.tsx`).
  New: `apps/web/src/admin/editor/shell/*`, `canvas/EditorCanvas.tsx`, `state/ui-store.ts`.

## Old-shell "what" to preserve (already built; must survive the shell rebuild)
- Collapsible panel + list/detail auto-switch on select (old `panelView`) — maps to E2.1.
- Tab + expanded-section memory across object switches (old `editorPanel` store) — E9.1/E9.2.
- Zoom fit / fill / custom% with visible control (old `onZoomReset` toggles fit<->fill) — E1.5.
- Preview-date bar (Gregorian/Hebrew/Shabbosim/weekday) always reachable — E7.2.
- Canvas W x H editing (old toolbar number inputs) — part of E4.1.
- Global controls reachable: style select/new/delete, add-widget, undo/redo, background,
  style list, preview, save — E4.1 / E6.1 / E5.1.

## New decisions (E0.x) — user-approved in plan `editor_full-screen_rebuild`
- **E0.1** Full-screen takeover: the editor fills the whole window; the admin sidebar,
  header, and `<main>` padding no longer constrain it. Fixes the push-out + dead space at
  the root. (Approach: `fixed inset-0` cover; admin chrome stays mounted underneath.)
- **E0.2** Full-bleed dark canvas filling the work area; the WHOLE board is auto-fit and
  visible on open and re-fits on window resize.
- **E0.3** Floating left icon rail (always visible) + a floating left panel that overlays
  the canvas when an icon is active; clicking the active icon collapses it.
- **E0.4** Floating right Properties panel overlaying the canvas; auto-opens when a widget
  is selected, collapsible to a thin reopen tab; nothing-selected shows the hint.
- **E0.5** "Back to admin" control in the top bar -> `/admin/[orgSlug]/screens`.
- **E0.6** Esc collapses open panels; panels retain open/section/tab memory (ties E9.1/E9.2).
- **E0.7** Zoom controls: fit / fill / custom% with a visible control and a fit reset (brings
  the current editor, which has fit+custom only, up to E1.5 by adding fill).
- **E0.8** Consistent floating-card styling (rounded, border, shadow, solid bg) so panels
  read as layers over the dark canvas (the Wix look).
- **E0.9** One-row top bar (no wrap) carrying the global controls + zoom + save.

## To-fix (shell structure problems this rebuild corrects)
- **TF7** Editor is bolted inside the admin shell -> sidebar push-out + left dead space.
  Fix: full-screen takeover (E0.1).
- **TF8** `100vh` editor sits below the 56px admin header -> vertical overflow, never fits.
  Fix: editor owns the viewport (E0.1/E0.2).
- **TF9** Panels are in-flow columns (`w-12`+`w-60` left, `aside w-72` right) that squeeze
  the canvas and clip the right panel. Fix: floating overlay panels (E0.3/E0.4).
- **TF10** No "fit-on-open" guarantee (wrapper was mis-sized). Fix: full-bleed canvas +
  fit recompute (E0.2).
