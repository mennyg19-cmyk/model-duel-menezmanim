# Phase review — rebuild-a / Phase 7

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 7

## Proof-of-read

**PHASE-REVIEW-RUBRIC.md**
- Requires evidence or N/A for every checklist item, an explicit inventory status, and six 1–10 scores.
- Requires direct assessment of running-app evidence, no stubs, rule adherence, plan fidelity, context retention, security, and craft.
- This report applies its stricter “PRESENT / PARTIAL / STUB / MISSING” definitions to the claimed Phase 7 surface.

**rebuild-a/PHASE-PLAN.md — Phase 7**
- Assigns P6.1–P6.16, E14, E18, every editor S/E/EW ID, and TF1–TF10 to this phase.
- Makes the visual editor the centerpiece and requires it to use the shared live-board render path.
- Earlier phase ownership means the editor should edit styles and preview real screen data, not introduce a screen-management feature.

**rebuild-a/STATUS.md**
- Claims Phase 7 complete, with a seeded Main Board and Widget Showcase, a running server on 3101, and green typecheck/test/build.
- Claims style save round-trip, lock acquire/release, and `shared-data` results with 32 zmanim and three minyanim.
- Identifies `/admin/demo/editor` as the editor entry and says Phase 8 has not started.

**rebuild-a/DECISION-LOG.md**
- Records the use of the parent geometry/store approach, REST style and lock APIs, and localStorage for themes and clipboard.
- States that editor canvas data comes from a shared-data endpoint and that the editor is full-screen over the admin shell.
- Confirms the intended “one shared Board render path” direction and the no-git contestant constraint.

**EDITOR-INVENTORY.md**
- Defines live editing through the same board renderer as the number-one requirement, plus the full Wix-like canvas and property/editor surface.
- Requires 11 surfaces, per-widget editors, pickers, style/screen/preview handling, state memory, and backing data-model work.
- Lists all structural fixes, including the live-render, monolith, tabbed-panel, picker, data-model, and full-screen-shell fixes.

**FEATURE-INVENTORY.md — P6, E14, E18**
- Defines the P6.1–P6.16 behavior, including rulers, actual-background auto-contrast, time-of-day activation rules, and a functional clipboard.
- Requires E14 style/object persistence and E18 five-minute edit locking.
- Makes F-NAV2 explicit: preview and live display must render through one shared path.

## Gate result

**FAIL — do not advance Phase 8.** The central live canvas is real and the save endpoint exists, but the lock is advisory only and multiple claimed editor-inventory controls are incomplete or non-functional.

## Checklist

1. **Inventory coverage**
   - **P6.1 — PARTIAL.** `EditorCanvas.tsx` implements fit/fill/custom zoom, grid, and move snapping. No rulers are rendered, and resize only grid-snaps when smart snapping is off; it has no resize smart guides.
   - **P6.2–P6.7 — PRESENT.** `AddWidgetOverlay.tsx`, `SelectionLayer.tsx`, `AlignmentToolbar.tsx`, `ObjectListPanel.tsx`, and `editor-store.ts` cover palette, multi-select/marquee, eight handles, drag/nudge, align/distribute, z-order, rename/visibility/duplicate/delete/reorder.
   - **P6.8 — PARTIAL.** Tabbed General/Appearance/Content exists and uses `ScheduleRuleEditor`. Table controls omit persisted fields such as header colors, column-header labels, border settings, padding, separator color/width, and time format. Several specialized editors lack promised controls: events date/header/dynamic scheduling, ticker layout, Jewish-info reorder, and countdown display/format toggles.
   - **P6.9 — PARTIAL.** Style CRUD/default/canvas settings work through E14, but the UI offers only default, Gregorian range, and Hebrew range. It has no time-of-day activation rule. Screen selection changes data only and does not auto-pick the assigned style.
   - **P6.10 — PARTIAL.** Gregorian date, time, weekday, and next 12 Shabbos controls affect shared data. “Hebrew date hint” is explicitly free text and does not set a preview date.
   - **P6.11 — PRESENT.** `EditorTopBar.tsx` sends the full working document to E14; `saveStyleLayout()` updates the style and replaces objects in one database transaction.
   - **P6.12 / E18 — PARTIAL, blocking.** E18 creates, refreshes, reads, and deletes a five-minute org lock. Neither the editor nor E14 checks lock ownership before editing or saving, so a second editor can overwrite the first editor’s complete style replacement.
   - **P6.13 — PRESENT.** The per-editor document store records history, supports undo/redo, and the keyboard bindings cover Ctrl/Cmd+Z, Shift+Z, and Y.
   - **P6.14 — PARTIAL.** Eight themes, custom-theme localStorage, and image palette extraction exist. `applyTheme()` leaves its widget-color loop empty, so the theme’s `foreColor` is unused.
   - **P6.15 — PRESENT.** Clipboard has memory and localStorage persistence, keyboard bindings, and a context menu.
   - **P6.16 — PRESENT.** Reused `ScheduleRuleEditor` is wired in General, and `ZmanLimitEditor` computes an earliest/latest/round/offset preview from shared data.
   - **E14 — PRESENT.** Style APIs are role-protected and validate each widget content payload before transactional persistence.
   - **S0/E0 and TF2/TF3/TF4/TF6–TF10 — PRESENT.** The editor is a full-screen, floating-panel shell split into focused files; panels collapse, retain tab/section state, and the canvas refits through `ResizeObserver`.
   - **S1/E1 and TF1 — PRESENT for live rendering, PARTIAL for the remaining canvas detail.** `EditorCanvas.tsx` builds an in-memory `DisplaySnapshot` and renders it through `BoardSurface` with an input overlay. This is the same `BoardSurface` used by live `<Board>`, satisfying F-NAV2 for the rendering path.
   - **S2/E2 — PRESENT.** List/detail behavior, row actions, and reorder buttons are functional. The inventory’s drag-reorder wording is not met; reordering is button-based.
   - **S3/E3, S3W/EW, S5/E5, S6/E6, S7/E7, and S10/E10 — PARTIAL.** See findings 2–5. The data model and renderer support more fields than the UI exposes, so this is not a storage-only issue.
   - **S8/E8 — PRESENT.** `editor-snapshot.ts` converts unsaved objects into the display snapshot consumed by `BoardSurface`, and `/api/org/[orgId]/editor/shared-data` obtains real board data for the selected preview screen.
   - **S9/E9 — PRESENT.** `ui-store.ts` retains active tab and collapsed-section state for the editor session.
   - **TF5 — PRESENT at the data-contract layer.** Schema columns, editor mapping, snapshot mapping, and board appearance rendering exist. The incomplete picker UI still prevents full inventory coverage.

2. **Running app**
   - Ran `npm run typecheck` successfully.
   - Ran `npm test`: 17 files and 171 tests passed, including 17 geometry tests.
   - Verified `GET http://localhost:3101/show/demo` returned 200 while the claimant’s server was running. The server on PID 16812 was terminated after this review.
   - I could not perform authenticated pointer/save/lock interaction in a browser in this runner. The report therefore relies on code tracing for those flows rather than treating the claimant’s self-reported curl checks as independent proof.

3. **No stubs**
   - The live canvas is not a name-placeholder stub: it renders `BoardSurface` under `SelectionLayer`.
   - The frame and texture picker controls are functional stubs in practice. UI values are `ornamental` and `marble`, while `frameStyle()` accepts `ornamental-gold`/`ornamental-dark` and `backgroundCss()` treats bare `marble` as a CSS keyword rather than looking up `TEXTURE_PRESETS`.
   - The Hebrew preview input is presented as a “hint” and intentionally has no behavior. It cannot count as the claimed Hebrew-date picker.

4. **Rule: ponytail**
   - The phase correctly split the former monolith into focused canvas, shell, panels, state, geometry, and API files.
   - The empty widget-color loop in `StyleManagerPanel.tsx` and duplicated simplified picker lists are dead/incomplete logic, not a minimal complete implementation.
   - Result: PARTIAL.

5. **Rule: clean-code**
   - Strengths: pure geometry helpers have targeted tests; E14 validates registered-widget content; `BoardSurface` centralizes renderer parity.
   - Problems: picker constants duplicate the canonical decor catalogue but do not match its IDs; `ContentEditors.tsx` is a 359-line mixed editor registry; save and lock responsibilities are disconnected.
   - Result: PARTIAL.

6. **Rule: workflow**
   - STATUS provides claimed seeded-data and command evidence, and Phase 7 stays within the planned editor/API scope.
   - No independent expectation artifact or authenticated interaction evidence was available. Multiple inventory claims were marked complete despite the gaps above.
   - Result: PARTIAL.

7. **Rule: codegraph**
   - N/A. The experiment’s decision log says codegraph was skipped because the workspace was unindexed. This reviewer used direct source inspection.

8. **Rule: git-discipline**
   - The repository contains commit `c88b5ad` with the Phase 7 files. Its author is Menny Grossman and the message explicitly says “Review spawning.”
   - That is evidence of an orchestrator commit, not evidence that the contestant ran git. No contestant git violation can be established from the available evidence.

9. **Todos / PHASE-PLAN fidelity**
   - The implementation follows the planned architectural direction for a style-only editor, live shared-data canvas, full-screen shell, E14, and E18.
   - It does not fully satisfy the plan’s complete P6/editor-inventory claim because required controls are missing, partially wired, or non-functional.
   - Result: PARTIAL.

10. **Context retention**
   - Strong: the editor reuses `BoardSurface`, preserving the prior F-NAV2 shared-renderer decision instead of rebuilding a separate preview renderer.
   - Strong: it reuses `ScheduleRuleEditor` rather than creating another rules UI.
   - Weak: the plan/inventory calls for full editor parity, but the implementation leaves clear legacy requirements incomplete.
   - Result: PARTIAL.

11. **Security**
   - E14 and E18 require org role checks; E14 scopes style reads/writes to the requested org and validates widget content schemas.
   - The edit lock is a trust/concurrency boundary but is unenforced at save time. A valid editor who does not own the active lock can still PUT a full replacement layout.
   - Result: PARTIAL.

12. **Code quality — 6/10**
   - The central rendering, geometry, store split, transactional save, and testable math are solid.
   - Incomplete inventory implementation, advisory-only locking, mismatched picker identifiers, and several no-op/partial controls keep this below phase-ready quality.

13. **Findings**
   1. **Blocking — E18 lock does not protect saves.** `EditorClient.tsx` only changes a label on 409, while `EditorTopBar.tsx` still enables editing and saving. `styles/[styleId]/route.ts` never checks `getActiveLock()` or owner identity before `saveStyleLayout()`. Concurrent editors can overwrite each other.
   2. **High — E5.2/E5.4 picker selections do not map to renderable decor.** Both property and style panels emit `ornamental`/`marble`; `decor.ts` recognizes `ornamental-gold`/`ornamental-dark` and expects actual texture CSS. The visible controls do not produce the selected frame or texture.
   3. **High — P6.8/E3/EW completeness is overstated.** Table UI omits several fields already supported by `TableWidgetFrame`; event, ticker, Jewish-info, and countdown editors omit material required controls. Raw JSON is not parity with dedicated controls.
   4. **Medium — P6.9/E6.2/E6.3 and P6.10/E7.2 are incomplete.** No time-of-day style activation exists; preview-screen selection does not auto-pick assigned style; Hebrew preview is only inert text.
   5. **Medium — P6.1 is incomplete.** There are no rulers, and resize lacks smart snapping/guides.
   6. **Medium — P6.14 applies only part of a theme.** The theme widget-color loop is empty and `foreColor` is unused.
   7. **Medium — reviewer evidence is insufficient for a claimed complete visual-editor phase.** No independent authenticated browser walk covered widget interactions, save persistence, denied lock behavior, or all editor inventory controls.

## Scores

- inventory_coverage: 5
- rule_adherence: 5
- plan_fidelity: 5
- context_retention: 7
- security: 5
- code_quality: 6
