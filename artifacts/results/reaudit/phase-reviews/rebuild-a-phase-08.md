Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 8 | Reaudit: true

# Phase 8 review — rebuild-a (Screens, Members, Settings)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 8
- Diff / files touched this phase: `a-p08.patch` is empty (Phase 1 baseline note only — no inter-phase diff kept). Evidence taken from the snapshot tree at `snapshots/a/p08`: `src/admin/screens/ScreensManager.tsx`, `src/admin/members/MembersManager.tsx`, `src/admin/settings/SettingsPage.tsx`, `app/api/org/[orgId]/{screens,members,invites,settings}/route.ts` (+ `[screenId]`, `[membershipId]`), `app/admin/[orgSlug]/{screens,members,settings}/page.tsx`, `src/db/seed.ts`, `src/auth/guards.ts`.

## Proof-of-read
- REAUDIT-INSTRUCTIONS.md — single third-party reviewer; GLM for all reviews; do NOT guess contestant model; phase-only scope; running-app optional, static evidence preferred, N/A allowed.
- PHASE-REVIEW-RUBRIC.md — fill every checklist item with evidence or N/A+why; six numeric scores 1–10 for orchestrator aggregation.
- FEATURE-INVENTORY.md — P7 (Screens & Styles, P7.1–P7.9 + F6), P8 (Members P8.1–P8.5), P9 (Settings P9.1–P9.7 + F7/F8); APIs E13/E16/E17; trust boundary = orgId+role server-derived (F-API5).
- snapshots/a/p08/PHASE-PLAN.md — Phase 8 claims P7(+F6)/E13, P8/E16/E17, P9(+F7/F8); every inventory ID maps to exactly one phase.
- snapshots/a/p08/STATUS.md — claims P7.1–P7.9, E13, F6, P8.1–P8.5, E16/E17, P9.1–P9.7, F7, F8; verification walked 2026-07-15 with HTTP 200/201/PUT evidence, typecheck clean, 171 tests, build green; stopped before Phase 9.
- snapshots/a/p08/DECISION-LOG.md — Phase 8 decisions logged: P9.3 Rabbeinu Tam type/value in settings JSON, F7 one Save all, F8 Intl timezones, invite links via `/onboarding?invite=`. Earlier-phase decisions (F-CORE3 seed writes styleSchedules, F2 demo-b, F-FIDS finish, session auth) respected.
- a-p08.patch — empty (Phase 1 marker only); reviewed via snapshot tree spot-check instead.

## Checklist

1. **Inventory coverage** — P7.1 list, P7.2 add/edit, P7.3 breakpoint-aware ScreenStyleSchedule editor (breakpoint + priority + 5 rule types), P7.4 copy URL, P7.5 preview→`/show/{slug}/{id}`, P7.6 activate/delete/last-seen, P7.7 StyleListPanel (thumbnails, create/rename/dup/delete, "Open in Editor"), P7.8 resolution-mismatch warning (`mismatchWarning`), P7.9 today's active style per breakpoint (`todayPreview` over mobile/tablet/full) — all PRESENT in `ScreensManager.tsx`. F6 custom W×H PRESENT (preset dropdown + custom checkbox pair). P8.1 list, P8.2 role change, P8.3 remove w/ confirm, P8.4 invite email+role, P8.5 pending resend/revoke — PRESENT in `MembersManager.tsx`. P9.1 profile, P9.2 location, P9.3 halacha + Rabbeinu Tam type/value + per-zman D10 overrides, P9.4 display/locale, P9.5 plan, P9.6 kiosk prefs, P9.7 zman+tefilah display-names editor — PRESENT in `SettingsPage.tsx`. E13/E16/E17 routes PRESENT and wired to the three admin pages. F7 single "Save all" PUT, F8 `Intl.supportedValuesOf("timeZone")` + fallback — PRESENT. No STUBs.

2. **Running app** — N/A. Snapshot has no `node_modules`; could not run `npm install`/`dev`/`test`/`build`. Relied on STATUS.md's walked evidence (200/201/PUT responses, typecheck clean, 171 tests, build green) cross-checked against static source. The claimed routes, handlers, and UI bindings are all present in the tree and consistent with that evidence.

3. **No stubs** — No dead buttons, empty handlers, or "coming soon" in the Phase 8 surfaces. Every control hits a real API. `FidsBoard` (W16) "coming soon" was a Phase 2 item and was DECIDED-finished, not in scope here.

4. **Rule: ponytail** — Shortest-diff posture held: the three managers reuse `@/admin/formStyles` (`btn`, `card`, `field`, `input`), `@/core/style-engine` resolvers, and `requireOrgRole` rather than reinventing. No new deps added for Phase 8. No unrequested abstractions. One `ponytail:`-style shortcut worth noting: `SettingsPage.tsx` is ~577 lines with seven tab branches in one component — single concern (settings), but at the edge of god-file territory; splitting per-tab would be defensible but not required.

5. **Rule: clean-code** — Naming is descriptive (`mismatchWarning`, `todayPreview`, `resolveScreenStyleSchedules`). One pattern per concern: all org writes go through `requireOrgRole`, all forms share `formStyles`. Error handling surfaces server messages. Minor: `MembersManager` `invitePath` is not used (UI builds `/onboarding?invite=` itself) — the `ser` field `invitePath: /invite/${token}` is dead/misleading and contradicts the DECISION-LOG invite-link decision.

6. **Rule: workflow** — Expectation/verify discipline visible: STATUS walks six evidence items with HTTP codes and the seeded demo org. Open product calls (P9.3 RT storage, F7 shape, F8 source, invite-link shape) were resolved as reversible DECIDED entries, not invented silently. No speculative product direction.

7. **Rule: codegraph** — N/A. No `.codegraph/` index in the experiment workspace; DECISION-LOG logs "codegraph skipped" with the read-only-reference rationale. Allowed fallback per the experiment prompt.

8. **Rule: git-discipline** — N/A / no violation. The contestant prompt forbids git (orchestrator commits). Snapshot is a tree only; no evidence the contestant ran git. Nothing to flag.

9. **Todos / PHASE-PLAN fidelity** — Phase 8 plan was P7(+F6)/E13, P8/E16/E17, P9(+F7/F8). Every claimed ID is implemented and wired to a route + UI. STATUS "Next: Phase 9 — Not started" matches the stop-before-Phase-9 instruction. No scope creep into Phase 9 (mobile/super-admin) or Phase 10 (import/export).

10. **Context retention** — Built cleanly on prior phases: reuses Phase 1 `style-engine` resolvers + `db/schema`, Phase 3 `requireOrgRole`/`loadOrgBySlug`, Phase 4 `formStyles`/`AdminShell` nav, Phase 7 `styles` repo + editor route. Seed already wrote `styleSchedules` (F-CORE3) and `demo-b` (F2) before Phase 8, so screens render without migration fallback. No contradictions with earlier-phase decisions.

11. **Security** — Trust boundary solid: every `/api/org/[orgId]/*` handler calls `requireOrgRole(orgId, min)`; `orgId` comes from the route param, never the body. `[membershipId]` and `[screenId]` queries are additionally scoped `and(eq(...orgId, orgId))`, so a foreign-org id 404s. Role escalation guarded (only owner/superAdmin can assign owner; last-owner cannot be demoted/removed; self-removal blocked). Invites require admin; role validated server-side against `["admin","editor","viewer"]`. Settings PUT requires admin. Two minor gaps: (a) `POST /api/org/[orgId]/screens` does not validate that `body.assignedStyleId` belongs to the org (PATCH does via `getStyleWithObjects`) — a client could store a foreign style id reference; low impact since reads resolve by org anyway. (b) Settings PUT does `update(orgs)` then `delete+insert(zmanimConfigs)` non-transactionally — a failure mid-sequence leaves partial state. No secrets in the tree; `.env.example` carries placeholders only.

12. **Code quality** — 8/10. Consistent, readable, well-structured managers; good server-side guards; reuses shared helpers. Deductions for the dead `invitePath` field, the non-transactional settings save, the unvalidated `assignedStyleId` on screen create, and `SettingsPage.tsx` size.

13. **Findings**
1. Dead/misleading field: `invites` serializer returns `invitePath: /invite/${token}` but the UI (and DECISION-LOG) uses `/onboarding?invite=${token}`. Drop the field or align it.
2. `POST .../screens` does not validate `assignedStyleId` belongs to the org (PATCH does). Add the same `getStyleWithObjects(orgId, id)` check.
3. Settings PUT is non-transactional: `orgs.update` + `zmanimConfigs` delete/insert run as separate statements — a mid-sequence failure leaves partial state. Wrap in a Drizzle transaction.
4. `SettingsPage.tsx` is ~577 lines with seven inline tab branches; approaching god-file. Acceptable for now, but a per-tab split would help if Phase 11 i18n adds more surface.
5. Screen `resolution` is not parsed/validated server-side (F6 allows custom W×H); arbitrary strings are accepted. Minor, but a malformed value would break `/show` scaling.

## Scores
- inventory_coverage: 9
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 8
- code_quality: 8
