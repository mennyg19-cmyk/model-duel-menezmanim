# Phase 10 review — Import/export

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 10

## Meta
- Arm reviewed: rebuild-a
- Phase number: 10
- Diff / files touched this phase: commit `0380784` contains the Phase 10 routes, hub, IO modules, tests, status/decision updates, and nav/page wiring under `rebuild-a`; it also contains rebuild-b work. The Phase 10 subset is the import/export page, two E19 routes, `src/io/*`, `src/server/io-repo.ts`, and supporting status/decision/nav files.

## Proof-of-read

### `results/PHASE-REVIEW-RUBRIC.md`
- Requires evidence or `N/A` for all 13 checks, not a summary-only review.
- Requires inventory, runtime, stub, rule, plan, context, security, and quality findings.
- Requires six 1–10 aggregation scores at the bottom.

### `rebuild-a/PHASE-PLAN.md`
- Assigns Phase 10 P10.1–P10.6, E19, F9, F10, F-DUP-CSV, and F-SCREENSHOT.
- Defines this phase as import/export after mobile and super-admin work, before i18n/tutorial.
- Its coverage table assigns each listed ID only to Phase 10.

### `rebuild-a/STATUS.md`
- Claims CSV/JSON/ICS preview/commit, per-type and backup export, multi-week luach, SVG/print capture, Groups+Events, BZS parsing, and one CSV helper.
- Records a 3101 walkthrough and reports 178 passing tests, typecheck, and build.
- States Phase 11 is not started.

### `rebuild-a/DECISION-LOG.md`
- Chooses guarded E19 routes, real BZS text parsing into configs/minyanim, browser-print HTML for F10, SVG capture for F-SCREENSHOT, and one CSV module.
- Says the Phase 10 decisions are reversible.
- Records that CodeGraph is unavailable in this experiment.

### `inventory/FEATURE-INVENTORY.md`
- P10.1 requires CSV/JSON/ICS import with column mapping, preview, and commit.
- P10.3 requires 1–52-week computed luach CSV with parsha, group filters, name order, and Sunday/Shabbos basis.
- P10.4–P10.6 require a real display screenshot, two-file Groups+Events CSV flow, and per-list JSON imports; E19 requires guarded import/export.

### Phase 10 implementation under `rebuild-a`
- Read the import/export page and hub, both E19 route handlers, repository layer, CSV/entity/ICS/BZS/screenshot/HTML modules, and the two Phase 10 test files.
- Started `npm run dev` on port 3101, authenticated the seeded owner, opened `/admin/demo/import-export`, and exercised protected exports. The reviewer-started server was killed after verification.
- Ran `npm run typecheck`, `npm test` (19 files, 178 tests), and `npm run build`; all passed.

## Checklist

1. **Inventory coverage — PARTIAL**
   - **P10.1: PARTIAL.** CSV, JSON, and ICS are parsed; preview and append/replace commit routes exist. The UI renders only a row count and errors, not the returned columns/sample rows, and it provides no column-mapping step. Headers must exactly match the entity definition.
   - **P10.2: PRESENT.** The hub exposes CSV/JSON links for all six entity types, full-org JSON backup, and an ICS calendar. The GET route produces downloads with content-disposition headers.
   - **P10.3: PARTIAL.** The route computes 1–52 weeks, supports Sunday/Shabbos basis and names order, and emits CSV/HTML. `groups` filtering is implemented only as a direct query parameter; no group-filter control is exposed in the hub.
   - **P10.4 / F-SCREENSHOT: STUB.** `boardSnapshotToSvg` draws rectangles and `name (type)` labels, not the board's rendered clocks, zmanim, minyanim, Hebrew date, media, or widget content. Runtime SVG output confirmed this placeholder geometry.
   - **P10.5: PARTIAL.** Separate group/event text inputs, samples, preview, and append/replace import exist, and CSV output includes a BOM. It is not a two-file upload flow: unlike P10.1 and BZS, this tab has no file pickers.
   - **P10.6: PRESENT.** Each entity can be selected with JSON format, sample JSON is downloadable, and preview/commit use the same parser path.
   - **E19: PRESENT.** Both routes are present and call `requireOrgRole(orgId, "admin")` before processing.
   - **F9: PARTIAL.** The BZS request sends file text to `applyBzsImport`, which parses and transactionally writes configs/minyanim. The mapping has no real-file coverage, silently skips unmapped indexes, and tests exercise only parser mechanics.
   - **F10: PRESENT.** `generateZmanimHtml` produces bilingual weekly printable HTML and the route returns it for browser Print to PDF. This matches the logged no-PDF-engine decision.
   - **F-DUP-CSV: PRESENT.** `src/io/csv.ts` is the common read/write implementation used by entity samples and E19 export/import paths.

2. **Running app — PARTIAL**
   - Started the app at `http://localhost:3101`; authenticated `owner@demo.local`; `/admin/demo/import-export` returned 200.
   - Authenticated `type=zmanim&format=html&weeks=2` returned 200. An unauthenticated backup request returned 401.
   - Authenticated screenshot SVG returned 200 but contained only four labeled object boxes, confirming the P10.4 finding. Server was stopped after the check.

3. **No stubs — FAIL**
   - Screenshot export is presented as “Board SVG” and “Board print HTML” but serializes placeholder boxes rather than the active board.
   - The rest of the buttons issue concrete guarded requests. BZS receives full content rather than a filename-only request.

4. **Rule: ponytail — PASS with one scope failure**
   - Browser print HTML, native SVG, and one CSV utility avoid unnecessary packages and duplicate helpers.
   - The screenshot shortcut is too small for the promised behavior: it avoids a canvas dependency by replacing the feature with a labeled layout diagram.

5. **Rule: clean-code — PARTIAL**
   - Route handlers consistently translate `AuthError`; entity definitions centralize parse/export shapes; mutating imports use transactions.
   - `src/io/beezee.ts` and its test still say the parser is “NOT yet wired” and “deferred,” contradicting the Phase 10 apply path. This leaves misleading maintenance guidance.
   - Tests cover CSV escaping and basic parser mechanics, but not E19 route behavior, BZS schema mapping, restore, generated HTML, or screenshot content.

6. **Rule: workflow — PARTIAL**
   - STATUS records commands, route responses, and a stop before Phase 11; the claimed scope matches the plan and decision log.
   - The claimed walkthrough did not catch the visible screenshot placeholder, missing column mapping/preview display, or absent group filter/file inputs. Completion evidence therefore overstates P10.1, P10.3–P10.5, and F-SCREENSHOT.

7. **Rule: codegraph — N/A**
   - The experiment has no CodeGraph index, as documented in DECISION-LOG. Static review was the available fallback.

8. **Rule: git-discipline — UNPROVEN, no direct contestant breach found**
   - The worktree is clean and HEAD is combined experiment commit `0380784`, authored by Menny Grossman, covering rebuild-a Phase 10 and rebuild-b Phase 8.
   - The prompt says the contestant must not use git, but current history cannot attribute that combined commit to the contestant. STATUS itself claims no contestant git action.

9. **Todos / PHASE-PLAN fidelity — PARTIAL**
   - The planned page, E19 endpoints, BZS parse/apply path, print HTML, CSV consolidation, samples, backup, and guarded access were built in the expected locations.
   - The plan’s screenshot, column-mapping/usable preview, optional filter UI, and two-file flow expectations are not fully met.

10. **Context retention — PARTIAL**
   - The implementation follows the Phase 10 decision to use browser-print HTML instead of a PDF engine and calls the established org-role guard.
   - BZS source comments and tests retain an earlier “not wired/deferred” state after the code was wired, creating a contradiction for later phases.

11. **Security — PASS**
   - Both E19 methods require an admin role before reading or writing. Runtime unauthenticated backup export returned 401.
   - Import parsing reports invalid JSON/rows and backup restore strips source `id`, `orgId`, and timestamps before assigning the server route’s org ID.
   - No secrets or client-provided org ownership bypasses were found in the reviewed Phase 10 path.

12. **Code quality — 5/10**
   - The export/import separation, entity definitions, transaction boundaries, and low-dependency print/CSV choices are solid.
   - The screenshot is a functional placeholder sold as a capture, key UI requirements are backend-only, and verification coverage does not test the risky import/mapping paths.

13. **Findings**
   1. **High — F-SCREENSHOT/P10.4 is not implemented.** `src/io/screenshot.ts` emits object bounding boxes and labels instead of rendered board content; runtime output proves it.
   2. **High — P10.1 lacks required column mapping and usable data preview.** The backend returns columns/samples, but the UI never displays them and requires exact source headers.
   3. **Medium — P10.3/P10.5 controls are incomplete.** Group filters have no UI and the advertised two-file Groups+Events flow accepts pasted text only.
   4. **Medium — F9 is insufficiently verified and documented inconsistently.** BZS mapping has only parser-mechanics tests while code/comments still say it is unwired/deferred.
   5. **Low — No endpoint-level Phase 10 tests.** The suite passes, but it does not cover guarded E19 behavior, backup restore, HTML output, or screenshot fidelity.

## Scores (1–10 each, for orchestrator aggregation)
- inventory_coverage: 6
- rule_adherence: 7
- plan_fidelity: 6
- context_retention: 6
- security: 8
- code_quality: 5
