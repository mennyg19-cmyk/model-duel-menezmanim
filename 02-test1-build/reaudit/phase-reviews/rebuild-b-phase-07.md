# Phase Review — Reaudit

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 7 | Reaudit: true

## Meta
- Arm reviewed: rebuild-b
- Phase: 7 — Full visual editor
- Files touched this phase: `src/admin/editor/**` (shell, canvas, geometry, panels, state, interaction, ContentEditors, editor-snapshot, map-rows, themes, types, ui, ZmanLimitEditor), `app/admin/[orgSlug]/editor/[[...styleId]]/page.tsx`, `app/api/org/[orgId]/styles/[styleId]/route.ts`, `app/api/org/[orgId]/lock/route.ts`, `app/api/org/[orgId]/editor/shared-data/route.ts`, `prisma/schema.prisma` (DisplayObject appearance columns).
- Diff: `diffs/b-p07.patch` is a one-line placeholder ("PHASE 1 - no previous phase"); review uses the snapshot tree at `snapshots/b/p07`.

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, glm-5.2-high for all reviews, do not guess contestant model, focus on this phase only, running-app optional (say N/A).
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist + 6 scores (1-10); fill every item with evidence or N/A + why.
- `FEATURE-INVENTORY.md`: 269 labels; Phase 7 claims `P6`, `P6.1-P6.16`, `D6`, `E18`, `F4`. Editor must edit styles only, one shared render path, edit-lock 5-min TTL.
- `EDITOR-INVENTORY.md`: 85 editor labels (S0-S10 + S3W, E0.x-E10.x, EW.x, TF1-TF10). #1 item: live render in edit mode via the same path as `/show`.
- `PHASE-PLAN.md` Phase 7: full-screen live WYSIWYG on the Phase 6 renderer; done when seeded board edits live, saves through every surface, and matches preview + `/show`.
- `STATUS.md`: claims typecheck/build pass, editor HTTP 200 with 17 objects, lock 409 for a second user, save round-trip visible in `/api/display/demo/main` and `/show/demo/main` 200, server stopped.
- `DECISION-LOG.md`: screen selector changes preview context only (writes still style-only); 5-min lock enforced on style save/duplicate/default/delete; time-of-day rules support overnight ranges; one shared Board path; demo screen id `main`.
- `b-p07.patch`: placeholder only — static evidence from snapshot tree used instead.

## Checklist

1. **Inventory coverage** — Claimed: `P6.1-P6.16`, `D6`, `E18`, `F4`, `S0-S10`+`S3W`, `E0.1-E0.9`, `E1.1-E1.10`, `E2.1-E2.4`, `E3.1-E3.9`, `EW.1-EW.11`, `E4.1-E4.3`, `E5.1-E5.4`, `E6.1-E6.3`, `E7.1-E7.2`, `E8.1-E8.2`, `E9.1-E9.2`, `E10.1-E10.4`, `TF1-TF10`.
   - E8.1/E8.2 (the #1 item): `EditorCanvas` renders `<BoardSurface snapshot={liveSnapshot}>` in BOTH edit and preview modes (`EditorCanvas.tsx:129-139,173`); `buildEditorSnapshot` produces the same `DisplaySnapshot` shape `/show` consumes. No name-placeholder boxes. PRESENT.
   - E1.2 8-way resize: `geometry/resize.ts` defines `HANDLES = ["nw","n","ne","e","se","s","sw","w"]` with min-size clamp; `SelectionLayer` renders all 8. PRESENT.
   - E1.3 snap guides: `geometry/snap.ts` + `computeSnap` draw pink guides; E1.4 grid snap via `snapToGrid`. PRESENT.
   - E1.6 multi-select + marquee: `SelectionLayer` shift/ctrl additive + marquee box-select. PRESENT.
   - E1.7 keyboard: `useEditorKeyboard` covers arrows (1px/10px), Delete/Backspace, Esc, Ctrl+C/V/D, Ctrl+Z/Y. PRESENT.
   - E2.4 add-widget grid overlay: `AddWidgetOverlay` is a centered grid-of-cards with icon + EN/HE labels. PRESENT.
   - E3.1 tabs: `PropertyPanel` renders general/appearance/content tabs; E3.2 general has name/type/X/Y/W/H/z-index/visible + `ScheduleRuleEditor` + group visibility. PRESENT.
   - E3.4-E3.8 appearance: align/vertical/line-height, background modes (solid/transparent/gradient/texture/image/canvas), frame+thickness, scrolling, table layout — all in `AppearanceTab`. PRESENT.
   - EW.1-EW.11: `ContentEditors.tsx` registers bespoke editors for all 17 widget types. PRESENT.
   - E6.2 activation rules: default/gregorian/hebrew/time-of-day with overnight support. PRESENT.
   - E7.2 preview-date picker: Gregorian + Hebrew + next-12 Shabbosim + weekday + time. PRESENT.
   - E10.1 schema: `DisplayObject` has textAlign/verticalAlign/lineHeight/backgroundMode/image/gradient/texture/frameId/frameThickness/scrolling* columns. PRESENT.
   - D6/E18 lock: `lock-repo.ts` 5-min TTL; `styles/[styleId]/route.ts` calls `requireOwnedLock` on PUT/POST/DELETE and returns 409. PRESENT.
   - F4 one canonical rule editor: `ScheduleRuleEditor` reused from `src/admin/schedules`. PRESENT.
   - PARTIAL: the collection route `styles/route.ts` PUT handler is a second write path that does NOT enforce the lock and does NOT persist appearance columns. The editor UI does not call it (saves go to `[styleId]`), but it remains exposed.
   - STUB: `EditorCanvas` context-menu `boardX`/`boardY` are hardcoded `0` with a "refined below via overlay" comment that is never implemented; paste-on-empty does not land at the cursor.

2. **Running app** — N/A. Snapshot has no `node_modules`; `b-p07.patch` is a placeholder. Static evidence only. STATUS claims typecheck/build pass, editor 200, lock 409, save round-trip to `/api/display/demo/main` and `/show/demo/main` 200 — consistent with the code paths reviewed but not independently re-run.

3. **No stubs** — No "coming soon" or dead buttons found. The context-menu board-coordinate stub (item 1) is a half-finished UX detail, not a marked-done stub. FIDS (W16) was finished in Phase 6 and its editor (`FidsEditor`) is real.

4. **Rule: ponytail** — Editor split into ~32 concern-sized files (shell/canvas/geometry/panels/state/interaction); no god file (largest is `PropertyPanel` ~498 lines). `ScheduleRuleEditor` reused rather than re-created. Shared decor presets centralized in `core/board/decor`. No new packages. `ponytail:`-style intent comments on non-obvious files (e.g. `editor-snapshot.ts`, `editor-store.ts`). Good.

5. **Rule: clean-code** — Naming is descriptive (`buildEditorSnapshot`, `requireOwnedLock`, `requestedOffsetsFor`). One render path, one store factory, one clipboard module. Geometry helpers (`rect`, `resize`, `snap`, `align`, `distribute`) are single-concern. Minor: `panelCard`/`btn`/`inputStyle` are inlined via `ui.tsx` tokens — consistent. The content tab renders `JsonFallback` ALONGSIDE the bespoke editor (`PropertyPanel.tsx:491`), so every widget shows a raw-JSON textarea below its editor — clutter, arguably an intentional power-user escape hatch.

6. **Rule: workflow** — STATUS records observable evidence (HTTP codes, object count, lock 409, save round-trip) and stops before Phase 8. DECISION-LOG logs the screen-selector vs style-only-write reconciliation and the lock policy with reversibility notes. No speculative product inventing; the screen selector decision explicitly reconciles with `P6`'s "editor edits styles only" rule.

7. **Rule: codegraph** — N/A for this snapshot review (no live index). Structural facts were read from the tree directly.

8. **Rule: git-discipline** — Contestant did NOT git. DECISION-LOG and STATUS both state no git command ran because the orchestrator owns commits. Correct.

9. **Todos / PHASE-PLAN fidelity** — Phase 7 promised every editor surface S0-S10, all E0/E/EW IDs, and TF1-TF10. All are present with real implementations (see item 1). The full-screen shell (E0.1-E0.9), live render (E8), 8-way resize, snap/grid/marquee, tabbed panel with section memory, per-widget editors, style manager + activation rules, preview-date picker, lock, undo/redo, clipboard, themes + palette-from-image are all in the tree.

10. **Context retention** — Builds directly on Phase 6: `editor-snapshot.ts` reuses `buildDisplaySnapshot`'s `SharedBoardData`/`SnapshotObject` shapes; `EditorCanvas` imports `BoardSurface` from `@/board/Board`; `map-rows.ts` reads the Phase 6 appearance columns. No earlier work dropped or contradicted. Prior decisions (one Board path, demo screen `main`, FIDS finished) are honored.

11. **Security** — `requireOrgMember(orgId, { write: true })` on all style/lock/shared-data writes; `styles/[styleId]` verifies `id + orgId` match before any write; lock ownership checked server-side via `getActiveLock`. 409 on lock contention. No client-trusted body for orgId/role. Media upload goes through the org-scoped `/api/org/[orgId]/media`. Minor: the collection `styles/route.ts` PUT bypasses the lock and ignores appearance columns — an exposed parallel write path (see findings).

12. **Code quality** — 8/10. Well-factored, deterministic geometry layer, clean store with gesture/commit separation, good comments on non-obvious intent. Deductions: the dual editor+JsonFallback rendering in the content tab; the unfinished context-menu board-coordinate math; the redundant collection-level PUT that duplicates the `[styleId]` write logic without lock/appearance parity.

13. **Findings**
   1. `app/api/org/[orgId]/styles/route.ts` PUT is a second style-write endpoint that does NOT call `requireOwnedLock` and does NOT persist appearance columns (textAlign, verticalAlign, lineHeight, backgroundMode, frame, scrolling). The editor saves to `[styleId]` (which is correct), so this path is unused by the UI but still exposed — a bypass of the documented "editor writes require the lock" policy and a silent appearance-data loss if any client hits it. Recommend deleting the PUT on the collection route (keep GET/POST) or routing it through the same locked, appearance-aware handler.
   2. `EditorCanvas.tsx:158` context menu sets `boardX: 0, boardY: 0` with a comment "refined below via overlay" that is never implemented. Paste from the context menu lands at the source object's offset, not at the right-click point. Minor UX gap; not a marked-done stub.
   3. `PropertyPanel.tsx:491` renders `<JsonFallback>` below every bespoke content editor, so each widget shows both its editor and a raw-JSON textarea. Intentional or not, it clutters the content tab and risks users editing JSON that the bespoke editor then overwrites on the next change.

## Scores (1-10)
- inventory_coverage: 9
- rule_adherence: 9
- plan_fidelity: 9
- context_retention: 9
- security: 8
- code_quality: 8
