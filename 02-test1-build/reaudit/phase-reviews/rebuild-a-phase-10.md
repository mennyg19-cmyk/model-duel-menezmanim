Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 10 | Reaudit: true

# Phase review — rebuild-a, Phase 10 (Import / Export)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 10
- Diff / files touched this phase: `a-p10.patch` is empty ("PHASE 1 - no previous phase"); reviewed the p10 snapshot tree directly. Phase 10 surfaces:
  - `src/admin/import-export/ImportExportHub.tsx`
  - `src/io/{csv,csv.test,entities,ics,beezee,beezee.test,bzs-apply,zmanim-html,screenshot}.ts`
  - `src/server/io-repo.ts`
  - `app/admin/[orgSlug]/import-export/page.tsx`
  - `app/api/org/[orgId]/{export,import}/route.ts`

## Proof-of-read
- REAUDIT-INSTRUCTIONS: single third-party reviewer, glm-5.2-high for all reviews, do not guess contestant model; phase review uses PHASE-REVIEW-RUBRIC, focus on this phase only, running-app optional (snapshots have no node_modules), say N/A if not run.
- PHASE-REVIEW-RUBRIC: 13-item checklist + 6 scores (1–10); fill every item with evidence or N/A + why; write report to given path.
- FEATURE-INVENTORY: P10.1–P10.6, E19, F9 (real BZS parse path), F10 (PDF from v1 HTML), F-DUP-CSV (one CSV helper), F-SCREENSHOT (board screenshot). Multi-week CSV wants parsha headers, group filters, names L/R, Sunday/Shabbos basis, computed dynamic times.
- PHASE-PLAN (Phase 10): P10.1–P10.6, E19, F9, F10, F-DUP-CSV, F-SCREENSHOT — each claimed in exactly this phase.
- STATUS: claims Phase 10 complete; 6-point verification walk on 2026-07-15 (export CSV/JSON/HTML/SVG, import preview, BeeZee `zmanimWritten:2`, typecheck clean, 178 tests, build green).
- DECISION-LOG: Phase 10 entry "import/export defaults" — E19 admin role, F9 = ported parseBzs + apply, F10 = v1 HTML + browser print, F-SCREENSHOT = SVG + print HTML, F-DUP-CSV = one `src/io/csv.ts`, harvested parent `apps/web/src/io/*` read-only. All marked reversible.
- Snapshot spot-check: read ImportExportHub, csv.ts, csv.test.ts, entities.ts, beezee.ts, beezee.test.ts, bzs-apply.ts, zmanim-html.ts, screenshot.ts, ics.ts, io-repo.ts, export route, import route, import-export page, board/types.ts.

## Checklist

1. **Inventory coverage** —
   - P10.1 Import hub (CSV/JSON/ICS preview→commit, append/replace): PRESENT (`ImportExportHub` main tab + `import` route actions preview/commit).
   - P10.2 Export per-type CSV/JSON + full-org JSON backup + ICS: PRESENT (`export` route, `buildOrgBackup`, `formatIcs`).
   - P10.3 Multi-week luach CSV: PARTIAL. Weeks 1–52, Sunday/Shabbos basis, names L/R, parsha + holiday columns all present. But the "group filter" is a naive case-insensitive substring match over Parsha/Holiday/Day text (`export` route `zmanimCsv`), not filtering by schedule-group IDs/names as the inventory implies. No "parsha rows/cols" layout — only a flat row-per-day table. HTML path hardcodes `language: "both"`; no EN/HE/both toggle in the UI.
   - P10.4 / F-SCREENSHOT: PARTIAL (stub-adjacent). `boardSnapshotToSvg` draws one labeled rectangle per object (`<rect>` + `<text>` with `name (type)`), not an actual visual capture of the rendered widgets. Inventory F-SCREENSHOT calls for a "screenshot of current display"; this is a structural schematic, not a screenshot. Printable HTML just wraps the same SVG.
   - P10.5 Groups+Events two-file CSV with samples + preview + append/replace: PRESENT (`groups-events` tab, sample downloads, `import` route `type: "groups-events"`).
   - P10.6 Per-list JSON import + sample JSON: PRESENT (`sampleJson`, JSON format in `recordsFromText`).
   - E19 (`/api/org/[orgId]/import|export`): PRESENT.
   - F9 real BZS parse path: PARTIAL. `parseBzs` is ported from v1 and is wired via `applyBzsImport` + the `beezee` import action (not filename-only — fixes the v2 web bug). However `INDEX_TO_ZMAN` is a 13-entry hardcoded map (indices 0–12); unmapped indices are silently skipped, and `beezee.test.ts` only asserts hex-decode mechanics — no real-customer `.bzs` file is exercised. The `beezee.ts` header comment still says "NOT yet wired into the import flow and has NOT been checked against real customer .bzs files or mapped onto our schema," directly contradicting STATUS/DECISION-LOG claiming F9 done.
   - F10 PDF from v1 HTML: PRESENT (`generateZmanimHtml` + `window.print()`). `orgNameHebrew` is set to `ctx.org.name` (English), so the Hebrew org name is not actually sourced.
   - F-DUP-CSV: PRESENT — single `src/io/csv.ts` family.

2. **Running app** — N/A. Snapshot has no `node_modules`; not run this review. STATUS claims a 6-point walk on 3101 with 178 tests / typecheck / build green — not independently verifiable here.

3. **No stubs** — No dead buttons or "coming soon" in the hub. Two borderline cases: the screenshot SVG is a labeled-rectangle schematic rather than a real capture (effectively a placeholder dressed as a feature), and the F9 field mapping is unverified against real files. Neither is marked as a stub.

4. **Rule: ponytail** — Good. No new deps; reused the single csv helper across import/export; shortest diff per surface; no unrequested abstractions. One gap: the screenshot shortcut (rectangles instead of real widget rendering) is exactly the kind of deliberate shortcut that should carry a `ponytail:` comment with an upgrade path — it does not.

5. **Rule: clean-code** — Mostly good. `entities.ts` is a clean single source for column maps; one error-handling pattern; one data-fetch pattern. `io-repo.ts` uses `as never` casts to satisfy Drizzle's per-table insert typing — acceptable workaround. Minor: `str` and `num` helpers in `entities.ts` are identical (`v => v == null ? "" : String(v)`) under two names. The stale self-contradicting header in `beezee.ts` is a clean-code drift (comment no longer matches code).

6. **Rule: workflow** — Expectation/verify discipline visible (STATUS walks 6 evidence points). No speculative product inventing; F-FIDS decision was surfaced in an earlier phase. Workflow gap: F9's mapping is unverified, so it should have been logged BLOCKED or surfaced to the user as an open call — instead it is marked DECIDED/done in both STATUS and DECISION-LOG while the source comment still says deferred.

7. **Rule: codegraph** — N/A. No `.codegraph/` in the experiment workspace; logged in DECISION-LOG ("codegraph skipped"). Read/dir fallback used, consistent with the rule.

8. **Rule: git-discipline** — Contestant must NOT git. No evidence of git operations in the snapshot. Pass.

9. **Todos / PHASE-PLAN fidelity** — PHASE-PLAN Phase 10 lists P10.1–P10.6, E19, F9, F10, F-DUP-CSV, F-SCREENSHOT; STATUS claims all. Fidelity is good on the surface, with quality gaps on F9 (unverified mapping + stale comment), P10.4 (schematic not capture), and P10.3 (substring "group filter", hardcoded HTML language).

10. **Context retention** — Builds cleanly on prior phases: reuses entity defs, board snapshot, `loadOrgZmanimContext`, `buildDisplaySnapshot`. No dropped prior work. The one drift is the stale `beezee.ts` header that contradicts the current claimed status.

11. **Security** — Export and import routes call `requireOrgRole(orgId, "admin")`; `AuthError` mapped to 401. Backup restore is additive only (never deletes). Replace mode deletes org-scoped rows — admin-gated, scoped by `orgId` from the path, not the body. BZS/CSV/ICS parsing is pure string handling (no eval, no shell). SVG/HTML output escapes text. No secrets in the snapshot. No size cap on `body.text`, but experiment-local — acceptable. No issues found.

12. **Code quality** — 7/10. Clean module separation, real ported parser, tests for CSV + BeeZee mechanics, proper role guards, additive restore. Dinged for: stale self-contradicting comment in `beezee.ts`; screenshot schematic masquerading as a capture; P10.3 group filter is a naive substring match and HTML language is hardcoded; `orgNameHebrew` not actually sourced; trivial `str`/`num` duplication.

13. **Findings**
   1. F9 mapping unverified — `beezee.ts` header says "NOT yet wired… NOT checked against real customer .bzs files" but `bzs-apply.ts` + the import route wire it and STATUS/DECISION-LOG mark F9 done. Either verify against a real `.bzs` or log BLOCKED. Stale comment must be reconciled.
   2. P10.4 / F-SCREENSHOT — `boardSnapshotToSvg` draws labeled rectangles, not a real visual capture of the board. Marked done but is effectively a placeholder; flag as `ponytail:` with an upgrade path or finish it.
   3. P10.3 group filter is a case-insensitive substring match over Parsha/Holiday/Day text, not schedule-group filtering by group IDs/names as the inventory implies.
   4. P10.3 HTML luach hardcodes `language: "both"`; no EN/HE/both toggle in the UI; `orgNameHebrew` falls back to the English org name.
   5. Minor: `str` and `num` in `entities.ts` are identical helpers under two names.
   6. STATUS claims 178 tests / typecheck / build green — not independently verifiable from the snapshot (no `node_modules`); running-app verification N/A this review.

## Scores
- inventory_coverage: 8
- rule_adherence: 8
- plan_fidelity: 8
- context_retention: 9
- security: 9
- code_quality: 7
