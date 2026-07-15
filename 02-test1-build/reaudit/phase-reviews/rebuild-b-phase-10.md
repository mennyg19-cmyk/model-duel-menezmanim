Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 10 | Reaudit: true

# Phase 10 review — Import/export and super-admin

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 10
- Diff / files touched this phase: `app/admin/[orgSlug]/import/page.tsx`, `app/admin/super/page.tsx`, `app/api/org/[orgId]/{import,export}/route.ts`, `app/api/admin/{orgs,orgs/[orgId]/{status,plan,data},clone,reseed-demo,users,notes}/route.ts`, `src/admin/import-export/ImportExportHub.tsx`, `src/admin/super/SuperAdminConsole.tsx`, `src/io/{csv,beezee,bzs-apply,import-export,weekly-export,screenshot}.ts`, `src/domain/{super-admin,org-clone,org-access}.ts`. (Diff bundle `b-p10.patch` was empty placeholder; evidence taken from snapshot tree.)

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, glm-5.2-high for all reviews, blind to contestant model, phase-only scope, running-app optional (N/A OK), use rubric + scores.
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist + 6 scores (1–10); fill every item with evidence or N/A+why.
- `FEATURE-INVENTORY.md`: Phase 10 owns `R6`; `P10`, `P10.1–P10.6`; `SA.1–SA.9`; `E19–E21`; `F9–F12`, `F-DUP-CSV`, `F-SCREENSHOT`, `F-API5`. F9 = BZS must parse content not filename; F10 = PDF via recoverable v1 HTML; F11 = reuse editors; F12 = real user actions; F-DUP-CSV = one CSV family; F-SCREENSHOT = image export; F-API5 = server-side role/ownership.
- `snapshots/b/p10/PHASE-PLAN.md` (Phase 10): done = sample files round-trip with previews and errors, exports open, org vs super-admin auth boundaries hold.
- `snapshots/b/p10/STATUS.md`: claims import hub, exports (CSV/JSON/ICS/weekly CSV+HTML/screenshot SVG), super-admin console (orgs/create/status/plan/data/clone/reseed/users/notes), 403 for non-super on `/api/admin/*`, 400 on empty BZS. Typecheck/build passed; running-app evidence cited.
- `snapshots/b/p10/DECISION-LOG.md`: one CSV helper (`src/io/csv.ts`), content-based BZS, HTML print-PDF (no PDF lib), SVG screenshot from `buildDisplaySnapshot`, super-admin data via deep links, real user actions, plus earlier-phase decisions carried (section-merge settings, `/show` links, flat `/api/me`).
- `diffs/b-p10.patch`: placeholder only ("PHASE 1 - no previous phase"); reviewed snapshot tree instead.
- Spot-check of `snapshots/b/p10` tree: io + admin + api files present and consistent with STATUS/DECISION-LOG claims.

## Checklist

1. **Inventory coverage**
   - `P10.1` Import wizard (CSV/JSON/ICS/BZS, map columns, preview, commit): PRESENT — `ImportExportHub` + `import/route.ts` + `previewImport`/`commitImport`. File upload + textarea + append/replace + preview + commit. **Gap:** column mapping (`mapColumns`) exists in `csv.ts` and the route accepts `mapping`, but the hub UI never sends one — sub-feature effectively dead.
   - `P10.2` per-type CSV/JSON/ICS + full-org JSON: PRESENT — `exportOrgData`.
   - `P10.3` multi-week CSV (1–52, parsha headers, group filters, names side, basis, computed times): PARTIAL — `buildWeeklyScheduleCsv` does weeks/basis/names/groupIds, but `parsha` is a placeholder string `Week ${w+1}`, not a real parsha from C7; groupIds plumbed in code but not exposed in hub UI.
   - `P10.4` image/screenshot export: PRESENT (as SVG via `buildBoardScreenshotSvg`, decision-logged; not a stub).
   - `P10.5` two-file Groups+Events CSV flow with sample downloads, append/replace, preview, parse errors, UTF-8 BOM: PARTIAL — single `groups-events` category, not a two-file flow; sample returned into textarea, not a download link; BOM ✓ (`stringifyCsv`).
   - `P10.6` per-list JSON import (announcements/yahrzeit/sponsors) with sample JSON + preview: PRESENT — `json-*` categories + `sampleJson`.
   - `F9` BZS content parse: PRESENT — `parseBzs` decodes hex-CSV zmanimDefs + toladotEntries; `applyBzsImport` writes ZmanimConfig + MinyanSchedule in a transaction; empty content → 400 with explicit message.
   - `F10` PDF via HTML: PRESENT — `buildWeeklyScheduleHtml` bilingual, print-CSS, no new dep.
   - `F11` reuse editors: PRESENT — `/api/admin/orgs/[orgId]/data` returns deep links into normal admin sections; no duplicate editor.
   - `F12` real user actions: PRESENT — `setSuperAdmin`, `removeMembership` with self-revoke guard.
   - `F-DUP-CSV` one CSV: PRESENT — single `src/io/csv.ts` (parse + stringify + mapColumns).
   - `F-SCREENSHOT`: PRESENT (SVG).
   - `F-API5` server-side guards: PRESENT — `requireSuperAdmin` + `requireOrgMember` (role + membership, org resolved server-side by id OR slug, body orgId not trusted).
   - `R6` super-admin route: PRESENT — `app/admin/super/page.tsx` + `SuperAdminConsole`.
   - `SA.1` list, `SA.2` create, `SA.3` status (approve/reject/suspend/reactivate via PATCH), `SA.4` plan, `SA.5` data deep-links, `SA.6` clone, `SA.7` reseed, `SA.8` users, `SA.9` baseline notes CRUD: all PRESENT.
   - `E19` import/export, `E20` admin orgs, `E21` clone/reseed/users: PRESENT.

2. **Running app** — N/A. Snapshot only (no `node_modules`); per reaudit instructions, static evidence preferred. STATUS cites typecheck/build + running-app checks (import 200, preview/commit wrote 1, BZS preview 26, empty BZS 400, weekly HTML 200, SVG 200, owner 403, super 200, clone 201). Not independently re-run.

3. **No stubs** — Mostly clean. FIDS handled in Phase 6. Concerns: weekly `parsha` is a fake "Week N" string (stub for the parsha-header sub-feature); super-admin "Add note" writes a hardcoded placeholder row (month 1/day 1/固定 text) instead of a real form — borderline stub marked functional. Media CSV import is explicitly rejected with an error (honest, not a stub).

4. **Rule: ponytail** — Strong. One CSV helper, HTML print-PDF instead of a PDF lib, SVG screenshot instead of a headless browser, tutorial without react-joyride (earlier phase). No new deps. No unrequested abstractions. Shortest-working-diff posture visible.

5. **Rule: clean-code** — Mostly good. Naming clear (`buildWeeklyScheduleCsv`, `applyBzsImport`, `requireSuperAdmin`). `commitRows` is a long if/else category chain (dispatch table would be cleaner). Minor `as string` casts on row fields. `parseCsvField` in `beezee.ts` partly re-derives CSV quoting that `csv.ts` already handles, but BZS is hex-CSV so the divergence is defensible. One pattern per concern holds.

6. **Rule: workflow** — Expectation/verify discipline visible in STATUS (observable evidence: counts, status codes). Decisions logged with why + reversibility. No speculative product inventing; open calls (F-FIDS) handled in Phase 6 with a logged decision.

7. **Rule: codegraph** — N/A for this phase; contestant read known files directly. No structural grep-for-symbol violation observable.

8. **Rule: git-discipline** — Contestant did NOT git (per experiment override); STATUS and DECISION-LOG both note orchestrator owns commits. No git commands in snapshot. Pass.

9. **Todos / PHASE-PLAN fidelity** — Plan's done-criteria (round-trip with previews/errors, exports open, auth boundaries) met. Gaps vs plan text: column-mapping UI and true two-file Groups+Events flow not delivered; parsha headers are a placeholder.

10. **Context retention** — Reuses Phase 6 `loadBoardData`/`buildDisplaySnapshot` for screenshots, Phase 8 `AdminShell`/`loadShellPrefs`, `default-groups`, prior settings section-merge decision. No contradictions with earlier phases; earlier work not dropped.

11. **Security** — `requireOrgMember` resolves org server-side and checks membership + role; body `orgId` never trusted raw. `requireSuperAdmin` checks `session.isSuperAdmin`. All `/api/admin/*` routes guard before any write. Self-super-admin-revoke blocked. Clone/reseed/plan/status all super-admin guarded. No secrets in tree. No injection (Prisma parameterized). Public reads untouched here. Strong.

12. **Code quality** — 7/10. Functional, consistent, well-named, honest error messages, good transaction discipline in `applyBzsImport`/`cloneOrganization`/`reseedDemoOrganization`. Deductions: placeholder parsha, hardcoded "Add note", `commitRows` if/else chain, mapping UI absent.

13. **Findings**
   1. Weekly export `parsha` column is a placeholder (`Week ${w+1}`), not a real parsha from C7 — P10.3 "parsha headers" sub-feature is a stub.
   2. P10.5 "two-file Groups+Events CSV flow" is collapsed into one category; sample is loaded into the textarea rather than offered as a download; not the two-file flow the inventory describes.
   3. Column mapping (P10.1 "map columns") is implemented backend-side but the `ImportExportHub` UI never sends a `mapping` — feature is wired-but-unreachable.
   4. Super-admin "Add note" creates a hardcoded placeholder row (month 1 / day 1 / fixed HE+EN text) instead of a real create form — borderline stub marked done.
   5. `commitRows` is a long category if/else chain; a dispatch table would be cleaner (minor).
   6. `groupIds` filter is plumbed through `buildWeeklyScheduleCsv`/`buildWeeklyScheduleHtml` but not exposed in the hub UI (minor).

## Scores
- inventory_coverage: 8
- rule_adherence: 9
- plan_fidelity: 8
- context_retention: 9
- security: 9
- code_quality: 7
