Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 8 | Reaudit: true

# Phase review — rebuild-b, Phase 8 (Admin shell, dashboard, screens, styles)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 8
- Diff / files touched this phase: `app/admin/page.tsx`, `app/admin/[orgSlug]/page.tsx`, `app/admin/[orgSlug]/screens/page.tsx`, `src/admin/shell/{AdminShell,nav,load-admin,types,LogoutButton}.tsx`, `src/admin/dashboard/{DashboardClient,LivePreviewWidget,QuickAddModals}.tsx`, `src/admin/screens/ScreenManager.tsx`, plus `app/api/org/[orgId]/screens/{route,[screenId]/route}.ts` and `styles/{route,[styleId]/route}.ts` touched/verified. Phase diff file `diffs/b-p08.patch` was a placeholder ("PHASE 1 - no previous phase"); review uses the snapshot tree directly.

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, GLM, no guessing contestant model; phase-only focus, running-app optional (N/A OK), prefer static evidence.
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist + six 1–10 scores; write full report to the spawn path.
- `FEATURE-INVENTORY.md`: R5 admin shell; P3 dashboard (stats, quick actions, Live Display, plan/usage, org switcher, quick-add, embedded preview); P7 screens/styles (list/CRUD, custom resolution F6, breakpoint style schedules, copy URL, open/preview, heartbeat, StyleListPanel, mismatch warnings, today's active style per breakpoint); F1 real routes, F2 client org switch, F-NAV1 no `/display`.
- `snapshots/b/p08/PHASE-PLAN.md` (Phase 8): claims `R5`; `P3`, `P3.1–P3.7`; `P7`, `P7.1–P7.9`; `F1`, `F2`, `F6`, `F-NAV1`. Done = deep-linkable admin sections + dashboard/screen actions open `/show/...`, not `/display`.
- `snapshots/b/p08/STATUS.md`: claims Phase 8 complete; typecheck + build passed; running app on 3102 returned 200 for `/admin/demo` and `/admin/demo/screens`; screen PUT saved 1600x900 with 2 breakpoint schedules; `/api/display/demo/main?bp=full` returned style + 17 objects; quick-add announcement returned 201; HTML had `/show/demo/` and no `/display`.
- `snapshots/b/p08/DECISION-LOG.md`: new Phase 8 decisions — admin deep links under `/admin/[orgSlug]`, soft plan caps, Live Display always `/show`, screen selector changes preview context only, five-minute lock enforced on style writes, time-of-day style rules with overnight ranges. Prior decisions (one board renderer, demo `main`, style-only editor writes) retained.
- `diffs/b-p08.patch`: placeholder only; spot-checked snapshot tree instead.

## Checklist

1. **Inventory coverage** — All claimed IDs PRESENT with evidence.
   - `R5` admin shell: `AdminShell.tsx` sidebar + nav + org switcher; `/admin` redirects to first active org (`app/admin/page.tsx`); `/admin/[orgSlug]` dashboard and `/admin/[orgSlug]/screens` are real routes.
   - `P3.1` stat cards: `DashboardClient.tsx` cards for davening/announcements/yahrzeits/sponsors/members/styles/screens, each linking to its section.
   - `P3.2` quick actions: present (Schedules, Content, Screens & Styles, Visual Editor, Open live board).
   - `P3.3` Live Display → `/show`: `publicShowUrl(orgSlug, liveScreen)` used in header and quick actions; no `/display` links (grep confirms only `/api/display` API + decision/log text).
   - `P3.4` plan/usage: `planLimits` soft caps (free 1/3, basic 3/10, pro 10/50, enterprise ∞), display-only per DECISION-LOG.
   - `P3.5` org switcher: `switchOrg` does `router.push(rewriteOrgPath(...))` — client-side, no full reload (F2).
   - `P3.6` quick-add modals: `QuickAddModals.tsx` covers event/announcement/yahrzeit/sponsor with real POSTs to E8/E9/E10/E11.
   - `P3.7` embedded live preview: `LivePreviewWidget.tsx` renders `BoardSurface` from `/api/display/...?bp=`, with screen selector + desktop/tablet/mobile breakpoint toggle + Edit in Editor + Open Full Screen.
   - `P7.1` screen list, `P7.2` add/edit + custom WxH (`PRESETS` + custom width/height, F6), `P7.3` breakpoint-aware style schedule editor (style/breakpoint/priority/rule per entry), `P7.4` copy URL, `P7.5` open/preview, `P7.6` active toggle/delete/heartbeat (lastSeenAt shown), `P7.7` StyleListPanel (thumbnails + create/rename/duplicate/setDefault/delete/open-in-editor), `P7.8` resolution-mismatch warnings, `P7.9` today's active style per breakpoint with mini previews — all PRESENT in `ScreenManager.tsx`.
   - `F1` real routes, `F2` client org switch, `F6` custom resolution, `F-NAV1` no `/display` — all PRESENT.

2. **Running app** — Not run by reviewer (snapshots have no node_modules); N/A per reaudit instructions. STATUS.md records build/typecheck pass + 200s + 201 + 17-object snapshot on port 3102; static evidence corroborates the claims.

3. **No stubs** — No dead buttons or "coming soon" marked done. Members/Settings/Import nav entries are rendered as disabled `adm-navSoon` spans with `title="Later phase"` and `phaseReady: false` — explicitly deferred to Phase 9/10, not hidden as complete.

4. **Rule: ponytail** — Shortest-diff respected: dashboard and screens reuse the Phase 6/7 `BoardSurface` + `/api/display` path instead of a second renderer. No new packages. Soft plan caps are display-only and logged as reversible. `parseResolution`/`formatResolution`/`publicShowUrl` are small reused helpers. Minor: `ScreenManager` re-implements breakpoint scaling math that `LivePreviewWidget` also has — borderline duplication but the two scales differ (480×270 vs 220×124), so leaving it is defensible.

5. **Rule: clean-code** — Naming is intent-clear (`switchOrg`, `mismatchWarnings`, `todayByBreakpoint`, `withStyleLock`). One pattern per concern: all admin pages share `AdminShell` + `requireAdminMe`/`pickMembership`/`loadDashboardData`. Files split by concern (shell, dashboard, screens). Error messages state what failed and the status. No god files (`ScreenManager` is the largest at ~695 lines but single-concern). Minor: `screenDto.publicUrl` builds with `row.orgId` and the GET collection handler re-derives with slug — two sources of truth for the same field.

6. **Rule: workflow** — Expectation/verify discipline visible: STATUS.md lists observable checks (200 routes, 201 quick-add, 17 objects, no `/display` in HTML). DECISION-LOG logs the soft-cap and `/show`-only choices with rationale and reversibility. No speculative product inventing; Phase 9/10 scope explicitly left untouched.

7. **Rule: codegraph** — Structural lookups not applicable to this review (read-only snapshot, no MCP). File navigation done via direct Read of known paths. No forbidden grep-for-symbol used; the one grep was a literal `/display` string search for F-NAV1 evidence.

8. **Rule: git-discipline** — Contestant did not git. DECISION-LOG and STATUS proof-of-read both state the orchestrator owns commits/pushes; no git commands in evidence. Pass.

9. **Todos / PHASE-PLAN fidelity** — Did what the plan said. "Done when each admin section deep-links correctly and dashboard/screen actions open the correct seeded public display rather than `/display`" — met: `/admin/[orgSlug]` and `/admin/[orgSlug]/screens` are real routes, all board links use `publicShowUrl`. Phase 9 (members/settings/tutorial/themes) correctly not started.

10. **Context retention** — Built on prior phases without contradiction: reuses Phase 6 `BoardSurface` + `/api/display`, Phase 7 `BoardSurface` preview path, the D6 edit lock from Phase 7, the flat `/api/me` contract, and `Screen.lastSeenAt` from Phase 6. The "screen selector changes preview context, not screen data" decision explicitly reconciles with the Phase 7 editor ledger.

11. **Security** — `requireOrgMember` verifies session + membership + role for every `/api/org/[orgId]/*` write; `findFirst({ id, orgId })` before every update/delete prevents cross-org writes; super-admin bypass is server-derived from session. Screens PUT/POST/DELETE all gated. Concerns: (a) screens PUT accepts arbitrary `resolution` strings without `parseResolution` validation — malformed data can persist (low impact, display-only); (b) style rename via collection PUT bypasses the edit lock the DECISION-LOG says all style writes require (see Findings); (c) `SESSION_SECRET` defaults to a hardcoded dev secret in middleware — acceptable for the experiment arm but flagged.

12. **Code quality** — 8/10. Clean component split, consistent fetch/error pattern, good a11y (`aria-label` on org switch, breakpoint group, preview screen). Latent DTO/validation gaps and the rename lock-bypass keep it below 9.

13. **Findings**
   1. **Style rename bypasses the edit lock.** `ScreenManager.styleAction("rename")` calls the collection `PUT /api/org/[orgId]/styles` (no lock check), while `duplicate`/`setDefault`/`delete` go through `[styleId]` which enforces `requireOwnedLock`. Inconsistent with the 2026-07-15 decision that all style save/duplicate/default/delete operations require the lock. Fix: route rename through the `[styleId]` POST `action` path or add `requireOwnedLock` to the collection PUT.
   2. **`screenDto.publicUrl` uses `row.orgId`, not slug.** POST/PUT responses return `/show/{orgId}/{screenId}`; only the GET collection handler re-derives the slug URL. The UI builds its own slug URLs so it is not user-visible, but the DTO contract is wrong and could mislead a future caller.
   3. **Screens PUT does not validate resolution.** `parseResolution` exists in `nav.ts` but is unused server-side; any string can be saved. Validate on the API to keep the invariant the UI relies on.
   4. **Styles collection PUT can orphan defaults.** It sets `isDefault` without the transactional "unset all others" that the `[styleId]` route does. A caller flipping `isDefault` via collection PUT can leave two defaults. Low risk today (UI uses `[styleId]` for setDefault) but a latent footgun.

## Scores
- inventory_coverage: 9
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 8
- code_quality: 8
