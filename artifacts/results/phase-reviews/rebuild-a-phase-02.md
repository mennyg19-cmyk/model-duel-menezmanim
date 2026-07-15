# Phase review — rebuild-a / Phase 2: Public display board

Model: gpt-5.6-terra-high  
Runner: spawn  
Arm: rebuild-a  
Phase: 2  
Review date: 2026-07-15

## Meta

- Model (orchestrator-assigned): gpt-5.6-terra-high
- Arm reviewed: rebuild-a
- Phase number: 2
- Diff / files touched this phase: reviewed the current Phase 2 source in `app/show`, `app/api/display`, `src/board`, `src/widgets`, and `public/sw.js`, plus the redirect, service-worker registration, and F-CORE3 migration needed to validate claimed behavior. This reviewer created only this report.

## Proof-of-read

### `results/PHASE-REVIEW-RUBRIC.md`
- Requires a complete report with meta, proof-of-read, all thirteen checks, findings, and six 1–10 scores.
- Requires evidence or `N/A` for every check, including live-app verification where possible.
- Makes inventory coverage, no stubs, rules, plan fidelity, retention, security, and code quality explicit review obligations.

### `rebuild-a/PHASE-PLAN.md` — Phase 2
- Assigns R8/R9, SH.1–SH.10, W1–W17, F-NAV2, F-CORE3, F-FIDS, and the display snapshot endpoint to this phase.
- Calls for widget editor-shapes plus renderers, a shared board render path, and a surfaced F-FIDS decision.
- Places the actual visual editor in Phase 7, which matters when judging whether F-NAV2 is fully closed.

### `rebuild-a/STATUS.md`
- Declares Phase 2 complete and maps every claimed ID to routes, `LiveBoard`, `BoardSurface`, the registry, service worker, and migration.
- Records prior verification of seeded boards, API snapshots, date override, redirect, heartbeat, migration, 151 tests, typecheck, and build.
- States that the Phase 2 server was stopped after that prior verification.

### `rebuild-a/DECISION-LOG.md`
- Records the reversible F-FIDS decision as **finish**, implemented as a real `FidsBoard`.
- Explains the 10-second snapshot poll, 30-second heartbeat, service-worker cache, and F-CORE3 persisted backfill.
- Records that the board and widget contracts were harvested from the parent as a read-only reference to avoid snapshot-contract drift.

### `inventory/FEATURE-INVENTORY.md`
- Defines R8 as the public wall board and R9 as the demo redirect; SH.1–SH.10 cover style selection, absolute objects, live data, caching, heartbeat, date override, prefetch, and mobile layout.
- Defines W1–W17 as renderer-and-editor end-to-end behavior, with W3 represented by table layout and W16 requiring a finish-or-drop decision.
- Defines F-NAV2 as preview/live parity, F-CORE3 as a one-time persisted style-schedule migration, and F-FIDS as a decision rather than a placeholder.

### `rebuild-a/.cursor/rules/`
- `workflow` requires observable pre-build EXPECTED blocks, running-app evidence, and a phase gate.
- `ponytail` and `clean-code` require a smallest complete design, no speculative abstractions, clear names, and one pattern per concern.
- `codegraph` requires an index when permitted; `codegraph status` reports this project is not initialized. `git-discipline` reserves Git activity for the orchestrator in this experiment.

### Phase 2 source
- `/show` server pages and `/api/display` call the same `buildDisplaySnapshot` function; `LiveBoard` renders the shared `Board`.
- The registry covers every stored display-object type with a schema and renderer, while `registry.test.ts` verifies completeness.
- `public/sw.js` is registered by the root layout, and the one-time style-schedule migration persists legacy `assignedStyleId` values.

## Checklist

### 1. Inventory coverage

| Claimed IDs | Status | Evidence |
|---|---|---|
| R8 | PRESENT | `app/show/page.tsx`, `app/show/[orgSlug]/page.tsx`, and `app/show/[orgSlug]/[screenId]/page.tsx` load seeded board data, build a snapshot, and mount `LiveBoard`. |
| R9 | PRESENT | `next.config.ts` redirects `/demo/:screenId` to `/show/demo/:screenId` with a temporary redirect. |
| SH.1–SH.5, SH.8–SH.10 | PRESENT by code inspection | The shared snapshot builder receives date/breakpoint inputs; `LiveBoard` polls every 10 seconds; `BoardSurface` positions visible objects; `ScaleToFit` supports contain/width modes; W17 changes `?date=`; `Board` enables mobile width-fit plus vertical scroll. |
| SH.6 | PRESENT by code inspection | `app/layout.tsx` registers `/sw.js`; the worker network-first caches only display URLs and `/api/display`, with offline fallback to the last response. |
| SH.7 | PRESENT by code inspection | `LiveBoard` posts every 30 seconds and the heartbeat route updates only the requested org's matching screen. |
| W1–W17 | PRESENT by code inspection | `src/widgets/registry.ts` maps all 17 supported types to schemas and renderers. `registry.test.ts` passes for every enum entry, including the separate PLAIN/RICH text variants, W3's shared table layout, W16 FIDS, and W17 date picker. |
| F-FIDS | PRESENT | The decision log says finish; `FidsBoard.tsx` renders minyan rows, split-flap time text, and live status instead of a placeholder. |
| F-CORE3 | PRESENT | `src/db/migrate-style-schedules.ts` is idempotent and converts empty schedules with an `assignedStyleId` into a persisted default/all rule. |
| F-NAV2 | PARTIAL | Public pages and the display API share `buildDisplaySnapshot`, and public rendering uses `Board`/`BoardSurface`. The Phase 7 editor/preview does not yet exist, so preview-to-live parity cannot be demonstrated or fully closed. |

### 2. Running app

N/A for this review. `curl.exe` to `http://localhost:3101/show/demo` returned `000` (connection failure), so there was no listener to exercise or kill. The stale terminal records and `STATUS.md` describe a prior run, but are not fresh runtime evidence. Local static verification did pass: `npm run typecheck`, `npm test` (15 files / 151 tests), and `npm run build`.

### 3. No stubs

PARTIAL. The registry has renderers for every widget, and W16 is a real FIDS renderer rather than a “coming soon” string. R8, the snapshot API, heartbeat, date picker, scale behavior, and redirect have concrete implementations. The actual editor sub-panels and preview path are intentionally Phase 7 work, so the inventory's full editor → save → snapshot → show → preview chain is not yet observable.

### 4. Rule: ponytail

PRESENT. The implementation reuses one snapshot contract, one registry, one board surface, and one table frame rather than duplicating display paths. It adds no apparent new dependency for the display feature and keeps the migration small and re-runnable.

### 5. Rule: clean-code

PARTIAL. The registry, renderer contract, formatting helper, table frame, and board surface establish clear single sources of truth. Several source files contain long “what's in this file” narration blocks, which violate the comment rule without improving runtime behavior. More importantly, W1 uses a home-grown regex sanitizer where a trust boundary needs stronger handling.

### 6. Rule: workflow

PARTIAL. STATUS records useful post-build evidence and the reviewer independently passed typecheck, tests, and the production build. `.scratch/phase-plan.md` is absent, so the required pre-build EXPECTED blocks and item-by-item observed evidence are unavailable. Fresh running-app evidence is also unavailable because port 3101 was not listening.

### 7. Rule: codegraph

N/A. `codegraph status` reports the external rebuild project is not initialized. Initializing it would create files outside the only report path this reviewer is authorized to modify, so the required code was read directly.

### 8. Rule: git-discipline

N/A for contestant attribution. `git log` shows an orchestrator-style Phase 2 commit authored by Menny Grossman at the review-spawn time, but that does not establish contestant Git activity. This reviewer did not modify Git state.

### 9. Todos / PHASE-PLAN fidelity

PARTIAL. The public board, redirect, snapshot API, live refresh, cache, heartbeat, date override, scaling, mobile handling, widget registry/renderers, FIDS decision, and style-schedule migration align with the plan. F-NAV2 is only partially complete because the plan claims preview/live parity before the editor/preview surface exists.

### 10. Context retention

PRESENT. The phase keeps the Phase 1 snapshot and style-engine contracts, implements the previously deferred F-CORE3 migration, and follows the logged F-FIDS=finish choice. W3 is consistently treated as shared table layout rather than inventing a second stored object type.

### 11. Security

PARTIAL. The heartbeat update scopes its write to both org ID and screen ID, and the service worker avoids caching admin/auth URLs. However, W1 sends admin-authored HTML through `dangerouslySetInnerHTML` after regex-only filtering. Encoded schemes such as `href="java&#x73;cript:..."` bypass the raw `javascript:` match, so a saved rich-text payload can remain executable when clicked. The public heartbeat also has no screen-specific credential, allowing anyone with a public board URL to forge `lastSeenAt`.

### 12. Code quality

Score: **7/10**. The shared snapshot/render path, registry completeness test, idempotent migration, live widget updates, and production build are solid. The incomplete F-NAV2 proof, missing required expectation artifact, unavailable fresh smoke test, and two trust-boundary flaws prevent a higher score.

### 13. Findings

1. **High — W1 rich text can bypass sanitization.** `sanitizeHtml` is a regex filter used immediately before `dangerouslySetInnerHTML`; HTML-encoded URI schemes bypass its `javascript:`/`data:` check. Use a maintained, allow-list HTML sanitizer or a browser sanitizer API with a strict policy, and add hostile-payload tests.
2. **Medium — public heartbeat can be forged.** Anyone who knows a public `/show/{orgSlug}/{screenId}` URL can POST to its heartbeat endpoint and falsely refresh `lastSeenAt`. Use a per-screen secret or explicitly document that last-seen is only an untrusted activity hint.
3. **Medium — F-NAV2 remains unproven.** The public board foundation is shared, but the editor preview required for actual preview/live parity is not implemented until Phase 7. Keep this fix open until that surface renders the same `BoardSurface` with a parity test.
4. **Process — mandatory phase expectations are missing.** No `.scratch/phase-plan.md` exists, so the required pre-build and observed checklist evidence cannot support this phase gate.
5. **Verification — no fresh board smoke test.** Port 3101 was unreachable during review. The recorded prior smoke test is useful context, but it is not independent evidence for this gate.

## Scores

- inventory_coverage: 8
- rule_adherence: 6
- plan_fidelity: 8
- context_retention: 9
- security: 6
- code_quality: 7
