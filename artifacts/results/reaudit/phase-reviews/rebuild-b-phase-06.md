# Phase 6 review — Public board and widget registry

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 6 | Reaudit: true

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 6
- Diff / files touched this phase: `audit/diffs/b-p06.patch` is a one-line placeholder ("PHASE 1 - no previous phase; see snapshot tree at 74dc4a6"); review is from the `snapshots/b/p06` tree. Key files: `app/show/[orgSlug]/[screenId]/page.tsx`, `src/board/{Board,LiveBoard,ScaleToFit}.tsx`, `src/core/board/{snapshot,types,appearance,decor}.ts`, `src/server/board-repo.ts`, `src/widgets/registry.ts` + 17 widget folders, `app/api/display/[orgSlug]/[screenId]/{route,heartbeat/route}.ts`, `app/api/org/[orgId]/{screens,styles}/**`, `prisma/seed.ts`, `public/sw-display.js`, `next.config.ts`.

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, glm-5.2-high for all reviews, focus on this phase only, running-app optional (N/A OK), use rubric + scores.
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist + 6 scores (1–10); write full report to the spawn path; fill every item with evidence or N/A + why.
- `FEATURE-INVENTORY.md`: §4 R8/R9 + SH.1–SH.10, §5 W1–W17 (W16 FIDS must be finished, not "Coming Soon"; W17 drives SH.8 date override), D2/D7/D8, C8/C9, E13/E14; F-NAV2 (one shared render path), F-CORE3 (assignedStyleId→schedules as a one-time DB migration), F-FIDS (finish or drop — needs user call).
- `snapshots/b/p06/PHASE-PLAN.md`: Phase 6 claims `R8,R9; SH.1–SH.10; W1–W17; D2,D7,D8; C8,C9; E13,E14; F-NAV2,F-CORE3,F-FIDS`. Done = `/show/demo/main` renders every seeded widget through one production renderer, W16 functional, W17 changes board data, responsive/mobile observable. Phase 7+ untouched.
- `snapshots/b/p06/STATUS.md`: claims Phase 6 complete; evidence lists typecheck + build pass, live 200 on `/show/demo/main`, 307 on `/demo/main`, 17 objects incl. FIDS_BOARD + DATE_PICKER, `?date=` override, `?bp=mobile`, heartbeat OK, E13=1/E14=1-with-17-objects; server stopped.
- `snapshots/b/p06/DECISION-LOG.md`: Phase 6 judgments — finish FIDS (no placeholder), one shared `buildDisplaySnapshot` + `Board`/`BoardSurface` path (F-NAV2), demo screen id `main` + name-prefix fallback, enum extensions `SPONSOR_DISPLAY`/`SHAPE_DIVIDER`/`TEFILAH_NOTES`, `Screen.lastSeenAt` for heartbeat. Earlier "style-engine copied for C11 (not claiming C8/C9)" was a Phase 3 scoping note; Phase 6 claiming C8/C9 now is consistent, not a contradiction.
- `b-p06.patch`: placeholder only — no diff body; reviewed from snapshot tree (allowed by reaudit instructions).

## Checklist

1. **Inventory coverage** — PRESENT. `R8` (`app/show/[orgSlug]/[screenId]/page.tsx`) and `R9` (`next.config.ts` redirect `/demo/:screenId`→`/show/demo/:screenId`, permanent:false → 307). `SH.1` resolveStyleForScreen + getActiveStyle fallback in `snapshot.ts`; `SH.2` `BoardSurface` absolutely positions every visible object at canvas coords; `SH.3` live clocks via client `setInterval` in DigitalClock/AnalogClock/Countdown/FidsBoard; `SH.4` `LiveBoard` polls `/api/display` every 10s and only swaps state when JSON changes (no flicker); `SH.5` `ScaleToFit` (contain/width); `SH.6` `localStorage` last-snapshot + `public/sw-display.js` cache `/api/display` + `/show`; `SH.7` heartbeat POST persisted to `Screen.lastSeenAt`; `SH.8` `?date=` parsed in `board-repo.parseDateOverride`, feeds `buildDisplaySnapshot`; `SH.9` `neededOffsets` + `extraOffsets` computes zmanim/calendar for every `daysAhead`; `SH.10` mobile breakpoint → `fitMode:"width"` + vertical scroll. `W1–W17`: registry has all 17 entries with Renderer + schema + default content; seed places one of each on Default Style (17 rows). W16 `FidsBoard` is a real split-flap renderer with UPCOMING/NOW/DEPARTED status (no "Coming Soon"). W17 `DatePicker` writes `?date=` and re-renders via `router.push`. `D2/D7/D8` mapped in `board-repo` + Prisma. `C8` (`buildScheduleContext` + `getVisibleObjects`) and `C9` (style resolve) wired into snapshot. `E13` screens CRUD + `E14` styles CRUD (transactional object replace). `F-NAV2` satisfied: one `Board`/`BoardSurface` path used by `/show`, `/api/display`, and (per comments) the future editor. `F-FIDS` resolved by finishing. `F-CORE3`: PARTIAL — done as render-time fallback (`resolveStyleForScreen ?? getActiveStyle ?? data.styles[0]`) with the seed setting both `assignedStyleId` and `styleSchedules`; inventory prescribed a one-time DB migration, not a perpetual render-time branch. Functional, but the legacy field is never actually migrated away.

2. **Running app** — N/A. Snapshot has no `node_modules`/`.next`; I did not run `npm install`/`dev`. Relied on static evidence + the STATUS.md evidence log (typecheck, build, live 200, 17 objects, `?date=`, `?bp=mobile`, heartbeat, 307 redirect). The static code matches those claims.

3. **No stubs** — clean. No dead buttons, no empty handlers, no "coming soon" marked done. FIDS is a real renderer. `WidgetSlot` renders a dashed fallback box only for unregistered types (defensive, not a stub). The `Media` seed writes a real SVG file to `public/uploads`. Heartbeat actually writes `lastSeenAt`.

4. **Rule: ponytail** — good. Shortest-working-diff posture: reuses Phase 3 `parseDetails`, `mergeNotesForOrg`, `style-engine`, `scheduler`. `ScaleToFit` and `TableWidgetFrame` are shared (Rule of 2 satisfied — used by Board + future editor, and by W2/W3/W4). No speculative abstractions; no packages added beyond existing zod/luxon/kosher-zmanim. Enum extended only for families the inventory requires.

5. **Rule: clean-code** — good. Names state intent (`resolveMinyanTime`, `daysUntilHebrewAnniversary`, `currentAndNext`). One render path, one widget registry, one table frame. Errors explain state (e.g. `"offline and uncached"`, `"board not found"`). Files split by concern (board vs core/board vs widgets/*). No god file — `snapshot.ts` is the largest at ~330 lines and single-purpose. Minor: `board-repo` `mapMinyan` has a redundant `"nearest" : "nearest"` ternary arm; widget renderers lean on inline styles, but that is the board's intentional styling model (CSS-via-objects) so not a drift.

6. **Rule: workflow** — expectation/verify discipline visible. STATUS.md lists observable evidence (routes, object count, override, breakpoint, heartbeat) and explicitly stops before Phase 7. DECISION-LOG records the F-FIDS product call (finish, not drop) with rationale — no silent product inventing. Server-stopped note present.

7. **Rule: codegraph** — N/A for this snapshot review (no structural lookups needed beyond reading known files); the arm's DECISION-LOG shows codegraph was initialized once and used for structure in earlier phases.

8. **Rule: git-discipline** — clean. Contestant ran no git; DECISION-LOG explicitly states the orchestrator owns commits/pushes. No git artifacts in the snapshot tree.

9. **Todos / PHASE-PLAN fidelity** — high. Plan said: shared renderer, breakpoint style resolution, scheduling, all 17 widget families, date override, prefetch, heartbeat, scaling, kiosk cache, demo redirect, finish W16. All present and wired end-to-end. `/show/demo/main` is the verification path; seed id is `main` with name-prefix fallback per decision.

10. **Context retention** — high. Reuses D1–D17 schema, `schedule-details.parseDetails`, `content.mergeNotesForOrg` (OP6), `halachic-opinions.DEFAULT_OPINIONS`, `style-engine`/`scheduler` from Phase 3. Memorial mapping includes `relationship` (F5 from Phase 5). No contradicted prior work; Phase 7+ untouched.

11. **Security** — sound. `/api/display/*` and heartbeat are public reads by design (display board powers them unauth, org-scoped by slug, cacheable) — matches inventory trust model. `E13`/`E14` use `requireOrgMember` with `{write:true}` for POST/PUT/DELETE and re-check `orgId` match on every update/delete (`findFirst({id, orgId})`). No secrets in seed or code. `parseDateOverride` constructs a Date from the query param safely (NaN-guarded). Minor: heartbeat is unauthenticated and writes `lastSeenAt` — low risk (only updates a timestamp for a screen that must exist), but a flood could be a cheap DoS on the DB row; not a Phase 6 blocker.

12. **Code quality** — 8/10. Clear single-purpose modules, one source of truth for widgets and rendering, good Hebrew/RTL handling, real end-to-end wiring. Deductions: the `F-CORE3` render-time fallback instead of the prescribed one-time migration; the `screenDto` default `publicUrl` uses `row.orgId` (line 36) rather than the slug — only the GET-list path corrects it to slug, so any caller hitting the default DTO gets a wrong URL (F-NAV1-adjacent; admin URL surface is really Phase 8, but the bug lives in this phase's file); redundant `nearest: nearest` ternary arm; FIDS `SplitFlapChar` re-mounts on every `nowMs` tick (key includes the char) which can stutter on slow boards. None block the phase.

13. **Findings**
   1. `F-CORE3` resolved as render-time fallback (`resolveStyleForScreen ?? getActiveStyle ?? data.styles[0]`), not the one-time DB migration the inventory prescribes. The legacy `assignedStyleId` field is never migrated away; seed still sets both. Functional, but the fix is incomplete.
   2. `app/api/org/[orgId]/screens/route.ts` `screenDto` default `publicUrl` is `/show/${row.orgId}/${row.id}` — should be the org **slug**, not the org id. The GET list overrides it with the slug, but the default DTO (used by POST/PUT responses) returns a broken public URL. F-NAV1-adjacent.
   3. `board-repo.mapMinyan`: `details.roundMode === "nearest" ? "nearest" : "nearest"` — both branches identical; dead ternary arm.
   4. `FidsBoard` `SplitFlapChar` uses `key={`${i}-${c}`}` and re-renders every second on `nowMs` change; the `animation: flap .45s` re-fires on each tick for unchanged cells because the parent re-renders. Cosmetic; flip animation should only fire on value change.
   5. Heartbeat endpoint is unauthenticated and writes to the DB on every POST (30s cadence per viewer). Low risk, but no rate limiting / screen-token check (F-API4 is Phase 11, so acceptable to defer — noting only).

## Scores
- inventory_coverage: 9
- rule_adherence: 9
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 8
