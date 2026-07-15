Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 4 | Reaudit: true

# Phase review — rebuild-a, Phase 4 (Admin shell + dashboard)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 4
- Diff / files touched this phase: `app/admin/**` (index, `[orgSlug]` layout + 8 section routes), `src/admin/**` (AdminShell, AdminThemeProvider, theme.ts, nav.ts, plan-limits.ts, Dashboard, DashboardBoardPreview, QuickAddModals, LaterSectionPage, load-dashboard.ts), `app/api/org/by-slug/[orgSlug]/dashboard/route.ts`, `app/api/org/[orgId]/dashboard/quick-add/route.ts`, `src/db/seed.ts` (demo-b). Phase diff (`a-p04.patch`) only points at the snapshot tree; review done from the snapshot tree directly.

## Proof-of-read
- **REAUDIT-INSTRUCTIONS.md** — single third-party reviewer; do NOT guess contestant model; phase-only focus; static evidence preferred; running-app N/A OK.
- **PHASE-REVIEW-RUBRIC.md** — 13-item checklist + 6 scores (1–10); fill every item with evidence or N/A+why.
- **FEATURE-INVENTORY.md** — Phase 4 slice: R5 `/admin`, F1 real routes, F2 client org switch, F-NAV1 Live Display→`/show`, P3.1–P3.7 dashboard, P12 admin theme picker (light/dark/mono/custom CSS vars).
- **PHASE-PLAN.md (a/p04)** — Phase 4 maps R5+F1+F2, P3.1–P3.7+F-NAV1, P12; later sections are F1 route shells only (DECISION-LOG).
- **STATUS.md (a/p04)** — claims R5/F1/F2/F-NAV1/P3.1–P3.7/P12 PRESENT; 9-step verification log walked 2026-07-15 on port 3101; typecheck clean, `npm test 16/154`, build green.
- **DECISION-LOG.md (a/p04)** — five Phase-4-era decisions: F1 later sections = route shells; F2 client switch + seed demo-b + last-org localStorage; F-NAV1 → /show only; P12 themes in localStorage; plan caps local table (plans.ts absent from harvested core). All marked DECIDED, reversible.
- **a-p04.patch** — stub pointing at snapshot tree; no line diff supplied.
- **Snapshot code (a/p04)** — spot-checked all admin components, routes, dashboard/quick-add APIs, auth guards, seed.

## Checklist

1. **Inventory coverage** — Claimed: R5, F1, F2, F-NAV1, P3.1–P3.7, P12.
   - R5 PRESENT: `app/admin/page.tsx` redirects to last/first org (`/admin/{slug}`); `[orgSlug]/layout.tsx` mounts shell + theme provider with auth + membership guard.
   - F1 PRESENT: real routes for dashboard, schedules, content, editor, screens, members, settings, import-export, theme. Later sections honestly render `LaterSectionPage` shells with phase notes — NOT claimed as P4–P11 done (DECISION-LOG explicit).
   - F2 PRESENT: `AdminShell.switchOrg` uses `router.push`, persists `menez-last-org`; seed adds `demo-b` with its own style/screen; `app/admin/page.tsx` reads nothing from localStorage server-side but client switch works.
   - F-NAV1 PRESENT: `Dashboard` Live Display href = `/show/{slug}/{primaryScreenId}`; preview "Open Full Screen" = `/show/{slug}/{screenId}`. Grep confirms no `/display` href anywhere in app/admin.
   - P3.1 PRESENT: 7 stat cards (schedules, announcements, yahrzeits, sponsors, members, styles, screens) from `loadDashboardStats` counts.
   - P3.2 PRESENT: quick-action nav buttons to section routes (excludes dashboard/theme).
   - P3.3 PRESENT: Live Display open-screen target (F-NAV1).
   - P3.4 PRESENT: plan/usage indicator — screens/styles/members vs `planLimits` caps; status shown when non-active.
   - P3.5 PRESENT: org switcher in shell.
   - P3.6 PRESENT: 4 quick-add modals (event/announcement/yahrzeit/sponsor) → `POST /api/org/[orgId]/dashboard/quick-add`; server validates + inserts; `onCreated` reloads stats.
   - P3.7 PRESENT: `DashboardBoardPreview` reuses `BoardSurface` + `ScaleToFit` (same render path as `/show` = F-NAV2), screen + breakpoint selectors, Edit in Editor, Open Full Screen; polls `/api/display` every 15s.
   - P12 PRESENT: `ThemePickerAdmin` + `AdminThemeProvider` — light/dark/mono-light/mono-dark/custom with 9 CSS-var slots, persisted in localStorage via `AdminThemeProvider`; shell exposes a theme select too.
2. **Running app** — N/A. Static snapshot (no node_modules). Verification evidence taken from STATUS.md's 9-step walk (307→/admin/demo, 200s on dashboard/theme/schedules shell, dashboard counts, quick-add count increment, /show 200, typecheck clean, build green). Cannot re-run; trusting contestant log.
3. **No stubs** — No dead buttons. Quick-add buttons open real forms hitting a real insert API. Later-section shells are explicit and labelled with their phase — not marked done. Theme picker writes real CSS vars. Preview renders real `BoardSurface` (not a placeholder). No "coming soon" marked complete.
4. **Rule: ponytail** — Good. Reused `BoardSurface`, `ScaleToFit`, `adminNav`, `requireOrgBySlug/Role`. One shared `LaterSectionPage` serves 6 shells (dedup, not abstraction-for-later). `plan-limits.ts` local table justified (plans.ts absent) and flagged reversible. No new deps. Shortest working diff per concern.
5. **Rule: clean-code** — Naming descriptive (`switchOrg`, `loadDashboardStats`, `planLimits`). One error pattern (`AuthError` + try/catch → status). One styling approach (CSS-var theme + inline styles — matches project pattern). No god files (Dashboard 153 lines, AdminShell 162). `QuickForm` is a small reusable form over a fields array — Rule of 2 satisfied (4 call sites).
6. **Rule: workflow** — Expectation/verify discipline visible: STATUS walks 9 observable items with evidence (routes, counts, API responses). DECISION-LOG logs 5 reversible decisions with rationale. No speculative product inventing; open calls (none new this phase) avoided. Spec gate N/A (continuation phase).
7. **Rule: codegraph** — N/A. No `.codegraph/` index in this workspace; DECISION-LOG explicitly logs the skip (read-only reference trees). Allowed fallback.
8. **Rule: git-discipline** — Contestant must NOT git. No evidence of git operations in STATUS/DECISION-LOG; snapshot is a tree copy. Pass.
9. **Todos / PHASE-PLAN fidelity** — Did what Phase 4 plan said. Later sections are shells exactly as the plan + DECISION-LOG promise. Minor scope note: quick-add yahrzeit form includes `relationship` (F5), which PHASE-PLAN assigns to Phase 6 — harmless forward-use of an existing schema field, not a claim of F5 done.
10. **Context retention** — Consistent with Phases 1–3: reuses `getActor`, `requireOrgBySlug/Role`, `BoardSurface`, `/api/display`, seed. No contradictions or dropped prior work. New `/api/org/by-slug/[orgSlug]/dashboard` GET and `/api/org/[orgId]/dashboard/quick-add` POST sit alongside existing org-scoped API family.
11. **Security** — `requireOrgRole(orgId, "editor")` on quick-add writes; `requireOrgBySlug(slug, "viewer")` on dashboard read; `orgId` comes from URL params, membership verified server-side (never body-trusted). Super-admin bypass in `checkOrgRole`. Inputs trimmed + validated before insert; drizzle parameterizes. Session auth (HMAC cookie, Phase 3). No secrets in code; `.env.example` present. Dashboard counts visible to any member (viewer+) — acceptable, all members of an org. No injection surface.
12. **Code quality** — 8/10. Clean, readable, consistent theming, honest shells, real wiring end-to-end. Inline styles are the project convention (F-I18N3 cleanup is Phase 11). No admin-side tests added (testing-protocol not in the six applicable rules this run, so not a hard fail, but a gap). `npm test 16/154` reported in STATUS — see finding 1.
13. **Findings**
   1. **Test suite mostly red (16/154)** per STATUS. Phase 4 added no tests for the new admin/dashboard code. Not a phase-done blocker under the contestant's stated bar (typecheck/build green), and the failing tests likely pre-date this phase (harvested core/integration), but a 16/154 pass rate is a health flag for later aggregation. Recommend the orchestrator note it; not a Phase-4 regression per se.
   2. **Preview poll interval mismatch (minor):** DECISION-LOG says `/show`'s `LiveBoard` polls `/api/display` ~10s; `DashboardBoardPreview` polls ~15s. Both are reasonable; just inconsistent across the two surfaces. Cosmetic.
   3. **`app/admin/page.tsx` prefers `demo` slug server-side** unconditionally (line 13) rather than the `menez-last-org` hint, which is client-only. F2 client switch still works after first load, but a returning user's last org is not honored on the initial `/admin` redirect. Minor UX gap vs. F2 intent (last-org hint is stored but not read on the server redirect).

## Scores (1–10)
- inventory_coverage: 9
- rule_adherence: 9
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 8
