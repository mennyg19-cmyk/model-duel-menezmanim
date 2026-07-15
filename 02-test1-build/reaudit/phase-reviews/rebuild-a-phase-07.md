# Phase review — rebuild-a Phase 7 (Visual editor)

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 7 | Reaudit: true

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 7
- Diff / files touched this phase: `a-p07.patch` is a 62-byte pointer ("PHASE 1 - no previous phase; see snapshot tree at c88b5ad"); review is against the snapshot tree at `audit/snapshots/a/p07`. Editor surface: `src/admin/editor/**` (shell, canvas, panels, state, geometry, interaction, ContentEditors, themes, ZmanLimitEditor, editor-snapshot, types) + API `app/api/org/[orgId]/{styles,lock,editor/shared-data}` + routes `app/admin/[orgSlug]/editor/**`.

## Proof-of-read
- **REAUDIT-INSTRUCTIONS.md**: single third-party reviewer, glm-5.2-high for all reviews, blind to contestant model, labels rebuild-a/b only; phase review uses PHASE-REVIEW-RUBRIC, focus on this phase's claimed IDs + snapshot/diff evidence, running-app optional (say N/A if not run).
- **PHASE-REVIEW-RUBRIC.md**: 13-item checklist (inventory, running app, no stubs, ponytail, clean-code, workflow, codegraph, git-discipline, todos/PHASE-PLAN fidelity, context retention, security, code quality, findings) + six 1–10 scores.
- **FEATURE-INVENTORY.md**: P6 = visual editor centerpiece (P6.1–P6.16); E14 styles CRUD transactional; E18 edit-lock D6 5-min TTL; F-NAV2 preview==live one render path; F4 one canonical rule editor; F-FIDS finish/drop call.
- **EDITOR-INVENTORY.md**: 11 surfaces S0–S10, 63 IDs E0/E1/E2/E3/EW/E4/E5/E6/E7/E8/E9/E10, TF1–TF10; #1 item = live render in edit mode via same path as `<Board>` (E8.1/E8.2/TF1); old editor ≈4,660 lines/16 components.
- **PHASE-PLAN (a/p07)**: Phase 7 = P6.1–P6.16, E14, E18, full editor inventory S0–S10 + E0–E10 + EW.* + TF1–TF10. Other phases map to other IDs (coverage table present).
- **STATUS (a/p07)**: claims P6.1–P6.16, E14, E18, S0–S10, E0–E10, EW.1–EW.11, E4.1–E4.3, E5.1–E5.4, E6.1–E6.3, E7.1–E7.2, E8.1–E8.2, E9.1–E9.2, E10.1–E10.4, TF1–TF10. Evidence: seed 4+13 objects, editor route 200, styles GET/PUT round-trip, lock POST/DELETE, shared-data 32 zmanim/3 minyanim, typecheck clean, 171 tests pass, build green.
- **DECISION-LOG (a/p07)**: harvested parent geometry + zustand, plain-CSS shell (no Tailwind/shadcn), themes+clipboard localStorage, Back→/screens, F-FIDS FINISH decided in Phase 2, F4 reuses Phase 5 ScheduleRuleEditor, codegraph skipped (no index).
- **a-p07.patch**: pointer only; spot-checked the snapshot tree directly (EditorClient, EditorCanvas, SelectionLayer, editor-store, ui-store, StoreProvider, PropertyPanel, ContentEditors, StyleManagerPanel, EditorShell/TopBar/LeftPanel, AddWidgetOverlay, AlignmentToolbar, ObjectListPanel, PreviewPanel, themes, types, clipboard, useEditorKeyboard, editor-snapshot, geometry.test, styles/lock/shared-data routes, editor pages).

## Checklist

1. **Inventory coverage** — P6.1–P6.16, E14, E18, and the full editor inventory S0–S10 / E0–E10 / EW.1–EW.11 / TF1–TF10 claimed. Evidence:
   - **E8.1/E8.2/TF1 (live render, #1 item) — PRESENT.** `EditorCanvas` renders `<BoardSurface snapshot={liveSnapshot}>` from `@/board/Board` (the same component `/show` uses); `editor-snapshot.ts` assembles a `DisplaySnapshot` identical in shape to the live board, so preview and `/show` share one render path. Edit mode shows all objects (incl. hidden) through the same path with a `SelectionLayer` overlay. This is the centerpiece requirement and it is met.
   - **S0/E0/TF7–TF10 (full-screen floating shell) — PRESENT.** `EditorShell` is `position:fixed; inset:0; z-index:100`; floating left icon rail + overlay left panel (`EditorLeftPanel`), floating right Properties panel (`EditorRightPanel`), one-row top bar, Esc collapses panels, Back→`/admin/[orgSlug]/screens` (E0.5).
   - **E1.1–E1.10 (canvas) — PRESENT** (drag, 8-way resize via `HANDLES`, snap guides `computeSnap`, grid snap, marquee + shift multi-select, keyboard arrows/shift/delete/esc/Ctrl+C/V/D/Z/Y, z-order, context menu, undo/redo). Geometry unit tests cover resize min-size, snap, align, distribute.
   - **E2.1–E2.4 (object panel) — PARTIAL.** List sorted top-first, per-row select/edit/visibility/duplicate/delete + up/down layer reorder. E2.2 asks for **drag-reorder**; implementation is up/down buttons only. Add-widget is the Wix-style grid-of-cards overlay (E2.4) — PRESENT.
   - **E3.1–E3.9 (property panel) — PRESENT** (tabbed General/Appearance/Content; General has name/type/X/Y/W/H/z-index/visible + ScheduleRuleEditor; Appearance has font, text/vertical align, line height, language, background modes incl. **canvas punch-through**, frame + thickness, scrolling, table layout). E3.8 table-layout UI exposes columns/split/header/alternating/row colors/gap/separator/align but leaves `showColumnHeaders`/`columnHeaderLabel`/`columnHeaderValue` unexposed in the UI (present in the type default only).
   - **EW.1–EW.10 — PRESENT** (plain/rich/digital-clock/analog/media/zmanim/events/ticker/jewish-info/countdown bespoke editors). EW.11 auto-populated widgets (yahrzeit/FIDS/sefira/date) correctly have no editor, only a note.
   - **E4.1–E4.3 (toolbars) — PRESENT** (canvas toolbar with style/canvas W×H/add/undo/redo/zoom/bg/preview/save; alignment toolbar single + multi + distribute).
   - **E5.1–E5.4 (pickers) — PARTIAL.** Background/frame/texture/gradient are `<select>` + raw CSS / file input, not the old tabbed visual pickers with live preview. Functional, data model satisfied, but shallow vs. inventory intent.
   - **E6.1–E6.3 (styles/screens) — PRESENT** (list/create/duplicate/delete/setDefault, activation rules default/gregorian/hebrew, canvas W×H + presets, screen selector in PreviewPanel).
   - **E7.1–E7.2 (preview) — PARTIAL.** Live link + Gregorian date + time + weekday jump + next-12-Shabbosim + reset all present. **Hebrew date is only a free-text "hint" input**, not a real Hebrew-calendar picker (inventory lists Hebrew as a first-class preview mode).
   - **E9.1/E9.2 (UI memory) — PRESENT** (`activeTab` + `openSections` persist in `ui-store` across object switches).
   - **E10.1–E10.4 (data model) — PRESENT** (`EditorObject`/`EditorStyle` carry appearance + table-layout + content; PUT persists textAlign/verticalAlign/lineHeight/frame/scrolling/background modes).
   - **E14 — PRESENT** (`/api/org/[orgId]/styles` GET/POST, `…/styles/[styleId]` GET/PUT/POST duplicate|setDefault/DELETE; PUT is transactional via `saveStyleLayout` and validates content server-side via `widget.contentSchema.safeParse`).
   - **E18 — PRESENT** (`/api/org/[orgId]/lock` GET/POST/DELETE; 5-min TTL, 409 on conflict, heartbeat every 2 min in `EditorTopBar`, release on unmount).
   - **TF1–TF10 — addressed** (live render, split files, tabbed panel, Wix grid, schema-first, full-screen takeover, viewport-owned, floating overlays, fit-on-open via ResizeObserver).

2. **Running app** — N/A. Snapshots ship no `node_modules`; I did not install/run. Relied on static evidence in the snapshot tree + STATUS's claimed evidence (editor route 200, styles round-trip, lock POST/DELETE, shared-data 32 zmanim/3 minyanim, typecheck clean, 171 tests, build green). `geometry.test.ts` confirms real unit tests exist for the canvas math.

3. **No stubs** — Mostly clean. One real stub: `StyleManagerPanel.applyTheme` has an empty `for (const o of objects)` loop with a comment promising to tint widgets but doing nothing — theme applies canvas background only. `PreviewPanel`'s `if (screen?.assignedStyleId) { … }` is an empty dead `if`. Neither is marked "done" in STATUS, but they are dead code in a shipped panel.

4. **Rule: ponytail** — Mostly followed. Zustand pinned (`zustand@5.0.2`), plain-CSS shell DECIDED and reversible, geometry harvested from parent rather than reinvented. Ladder respected. Minor bloat: the two dead-code spots above, and a double lock-acquire on mount (`EditorClient` useEffect POST + `EditorTopBar` heartbeat `tick()` POST both fire on mount — idempotent but wasteful).

5. **Rule: clean-code** — Good. Files split by concern (canvas/panels/shell/state/geometry/interaction), one pattern per concern (zustand vanilla stores via a provider, REST for saves), naming is descriptive (`beginGesture`/`applyLive`/`reorderLayers`), comments explain non-obvious intent (history-in-closure, edit-snapshot parity). One smell: `PropertyPanel` content tab renders **both** the bespoke `Editor` **and** `JsonFallback` below it when an editor exists (lines ~374–379) — a duplicate editing surface, likely a bug.

6. **Rule: workflow** — Expectation/verify discipline visible: STATUS walks a numbered evidence list with concrete observations (seed counts, route statuses, test count, build result); DECISION-LOG records reversible decisions with rationale. No speculative product inventing; open calls (F-FIDS) were DECIDED finish in Phase 2 and carried forward.

7. **Rule: codegraph** — N/A. No `.codegraph/` in the experiment workspace; reference trees read-only. DECISION-LOG logs the skip. Consistent with the rule's fallback clause.

8. **Rule: git-discipline** — Contestant did NOT git. No git operations in the snapshot; DECISION-LOG confirms "no git this run." Compliant.

9. **Todos / PHASE-PLAN fidelity** — Phase 7's PHASE-PLAN lists exactly P6.1–P6.16, E14, E18, S0–S10, E0–E10, EW.*, TF1–TF10; STATUS claims the same set and the tree bears it out. Gaps are partials (E2.2 drag-reorder, E5 visual pickers, E7.2 Hebrew picker, E3.8 column-header toggles) rather than missing IDs. Stopped before Phase 8 as instructed.

10. **Context retention** — Strong. Reuses Phase 5 `ScheduleRuleEditor` for object schedule rules (F4 one canonical editor), harvests parent geometry/Board/registry rather than forking, builds on Phase 2's F-NAV2 shared render path. No contradictions with earlier phases in DECISION-LOG.

11. **Security** — Clean. Every `/api/org/[orgId]/{styles,lock,editor/shared-data}` route calls `requireOrgRole` (viewer for reads, editor for writes) and uses the path `orgId`, not body. Save validates content server-side via `widget.contentSchema.safeParse` and rejects unknown widget types. Lock acquire is actor-scoped (`actor.userId`). No secrets, no client-trusted ownership. No issues found.

12. **Code quality** — 7/10. Well-architected split, real unit tests for geometry, schema-validated saves, live-render parity done right. Held back by: duplicate JsonFallback render in the content tab, `applyTheme` no-op loop, dead `if` in PreviewPanel, double lock-acquire on mount, and shallow pickers. None are structural; all are small fixes.

13. **Findings**
1. **E7.2 Hebrew preview is a free-text hint, not a Hebrew-calendar picker** — partial vs. inventory.
2. **`PropertyPanel` content tab renders `JsonFallback` twice** — once as the fallback for widgets without an editor, and again unconditionally beneath the bespoke `Editor` when one exists; duplicate raw-JSON textarea under every per-widget editor.
3. **`StyleManagerPanel.applyTheme` has an empty widget-tint loop** — dead code; theme only changes canvas background, not widget colors, despite the comment.
4. **`PreviewPanel` empty `if (screen?.assignedStyleId)` block** — dead code, no effect.
5. **Double lock-acquire on mount** — `EditorClient` and `EditorTopBar` both POST `/lock` on mount; idempotent but redundant.
6. **E2.2 object-list reorder is up/down buttons, not drag-reorder** — partial.
7. **E5.1–E5.4 pickers are selects/raw-CSS, not tabbed visual pickers with live preview** — partial.
8. **E3.8 `showColumnHeaders` / column-header label/value toggles not exposed in UI** — present in type default only.
9. **Context-menu `boardX`/`boardY` hardcoded `0`** — comment says "refined below via overlay" but never refined; paste lands at origin offset, not at cursor.

## Scores
- inventory_coverage: 8
- rule_adherence: 8
- plan_fidelity: 8
- context_retention: 9
- security: 9
- code_quality: 7
