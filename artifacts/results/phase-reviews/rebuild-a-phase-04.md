# Phase review — rebuild-a Phase 4

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 4

## Meta

- Arm reviewed: rebuild-a
- Phase number: 4 — Admin shell + dashboard
- Claimed IDs: R5, F1, F2, F-NAV1, P3.1–P3.7, P12
- Files touched this phase: `app/admin/**`, `src/admin/**`, dashboard API routes, `src/auth/org-access.ts`, and `src/db/seed.ts`, plus the phase status/decision records. The working tree has no Phase 4 commit; the visible Phase 4 work is uncommitted, which matches the experiment's contestant-no-git constraint.

## Proof-of-read

`results/PHASE-REVIEW-RUBRIC.md`
- Requires a full, evidence-backed review of inventory coverage, running behavior, stubs, rules, fidelity, context, security, code quality, and bottom scores.
- Requires every checklist item to contain evidence or an explicit N/A.
- Requires proof-of-read summaries for the required sources.

`rebuild-a/PHASE-PLAN.md` (Phase 4)
- Assigns R5, F1, F2, F-NAV1, P3.1–P3.7, and P12 to this phase.
- Defines Phase 4 as the admin shell and dashboard, with actual deep-link routes, client-side organization switching, and an admin theme picker.
- Moves complete schedules, content, editor, screens, members, settings, and import/export UIs to later phases.

`rebuild-a/STATUS.md`
- Claims Phase 4 complete and lists each claimed ID with a concrete implementation description.
- Records seeded `demo` and `demo-b` organizations, local login credentials, and a claimed verification run on port 3101.
- States that Phase 5 has not started.

`rebuild-a/DECISION-LOG.md`
- Deliberately limits F1's later section pages to real route shells; those pages do not claim later P4–P11 functionality.
- Records the client-side F2 switcher, seeded `demo-b`, correct `/show/{slug}/{screenId}` navigation, browser-local P12 theme storage, and temporary plan-limit table.
- Contains no unresolved BLOCKED entry for Phase 4.

`inventory/FEATURE-INVENTORY.md` (R5, F1, F2, F-NAV1, P3.1–P3.7, P12)
- R5 is the authenticated `/admin` shell containing P3–P12; F1 requires genuine section routes instead of state-swapped sections.
- P3 requires stats, quick actions, a corrected live-display link, plan usage, an organization switcher, quick adds, and a scaled live-board preview.
- P12 requires light, dark, monochrome, and custom admin themes persisted through CSS variables; F2 requires organization switching without a full reload.

`rebuild-a/.cursor/rules/`
- `workflow.mdc` requires a pre-written `.scratch/phase-plan.md` expectation checklist and running-app evidence for phase work.
- `ponytail.mdc` and `clean-code.mdc` require the minimum complete design, real abstractions only, clear names, and consistent patterns.
- `codegraph.mdc` requires initializing CodeGraph when the CLI is present and no index exists; `git-discipline.mdc` governs commits, while the experiment specifically prohibits contestant git use.

`rebuild-a/src/admin` and `rebuild-a/app/admin`
- The authenticated org layout wraps all section routes in one `AdminShell` and `AdminThemeProvider`.
- Dashboard cards, actions, quick-add dialogs, preview, theme picker, route map, and data loading are implemented in separate focused modules.
- Later sections are explicit route shells with their delivery phase displayed, rather than being silently represented as completed section UIs.

## Checklist

### 1. Inventory coverage

| ID | Verdict | Evidence |
|---|---|---|
| R5 | PRESENT | `/admin` redirects signed-in members to `/admin/[orgSlug]`; the org layout requires membership and renders the shared shell. |
| F1 | PRESENT | Each listed admin section has a real `app/admin/[orgSlug]/.../page.tsx` route. The route shell text accurately defers full later-phase UIs. |
| F2 | PRESENT | `AdminShell.switchOrg` stores the selection and calls `router.push` with the equivalent org route; seed data supplies `demo-b`. |
| F-NAV1 | PRESENT | Dashboard Live Display and preview Open Full Screen both build `/show/${slug}/${screenId}`, not `/display`. |
| P3.1 | PRESENT | Seven linked stat cards show schedules, announcements, yahrzeits, sponsors, members, styles, and screens from org-scoped counts. |
| P3.2 | PRESENT | Quick-action links are generated from the shared real-route navigation map. |
| P3.3 | PRESENT | The Live Display control opens the current primary screen in a new tab at the corrected public route. |
| P3.4 | PRESENT | The plan indicator shows screens, styles, and members against named plan caps. The temporary caps table is documented as reversible. |
| P3.5 | PRESENT | The shell organization selector lists memberships and uses client navigation. |
| P3.6 | PARTIAL | All four dialogs POST to a role-guarded quick-add endpoint and refresh stats after success. Field validation is incomplete for Hebrew calendar dates and fixed-time values; see finding 1. |
| P3.7 | PRESENT | The preview selects a screen and breakpoint, fetches the display snapshot, renders the shared `BoardSurface`, and provides editor/full-screen links. |
| P12 | PRESENT | The picker exposes light, dark, mono-light, mono-dark, and custom themes; custom color slots and the selected theme persist in `localStorage` and map to CSS variables. |

### 2. Running app

- I started `npm run dev` on port 3101 and stopped the server after review.
- Unauthenticated checks: `/admin` returned `307` to `/login`; `/admin/demo/theme` returned `307`; `/api/org/by-slug/demo/dashboard` returned `401`. This confirms the admin and dashboard paths are protected.
- Public display smoke check: `/show/demo` returned `200`.
- Authenticated dashboard actions could not be independently replayed in this review shell because its direct JSON login request was not accepted by the local command wrapper. The contestant's STATUS evidence records authenticated route, API, quick-add, and display checks; it is not independently sufficient to close the workflow expectation-file gap.

### 3. No stubs

- No dead button or empty handler was found in the claimed dashboard and theme controls.
- F1's seven later-section route shells are intentionally scoped placeholders, clearly state their future phase, and are not claimed as P4–P11 implementations. They satisfy this phase's deep-link requirement rather than falsely claiming later features.
- The dashboard preview shows a loading/error state and does not label an incomplete feature as done.

### 4. Rule: ponytail

- PASS with a minor concern. The code uses existing Next/React and project board components; no dependency was added.
- The split between shell, dashboard, preview, theme, route map, and quick-add keeps the largest Phase 4 file below 200 lines and avoids a god component.
- `plan-limits.ts` is a small local duplicate of a future core concern, but the decision log documents why the core `plans.ts` was unavailable and gives an upgrade path. This is acceptable for the phase.

### 5. Rule: clean-code

- PARTIAL. Names, component boundaries, typed dashboard data, role checks, and the shared navigation map are clear and consistent.
- Error states are surfaced for dashboard fetches and quick-add failures; server errors are not swallowed.
- `QuickAddModals` accepts structurally valid but semantically invalid date/time strings, allowing invalid persisted schedule or memorial data. See finding 1.

### 6. Rule: workflow

- PARTIAL. STATUS provides a useful final evidence list, and Phase 4 stayed within its planned feature assignment.
- The required `.scratch/phase-plan.md` did not exist. Therefore there is no pre-implementation EXPECTED checklist or item-by-item review evidence for this phase, contrary to `workflow.mdc`.
- The phase's claimed manual validation is stronger than code-only review, but it cannot replace the required expectation artifact.

### 7. Rule: codegraph

- FAIL. `codegraph status` reports `Not initialized`, while the CLI is available. The rule requires `codegraph init` before structural exploration when no index exists.
- The Phase 1 decision log says CodeGraph was skipped because the workspace was empty, but that does not override the always-applied rule for later structural work.

### 8. Rule: git-discipline

- PASS. The recent commit history has Phase 3 as the last rebuild-a contestant phase; no Phase 4 commit is present. The Phase 4 changes remain in the working tree, consistent with the experiment instruction that the contestant must not use git.

### 9. Todos / PHASE-PLAN fidelity

- PASS with evidence gap. All named Phase 4 items are present, while P4–P11 section interfaces remain explicitly deferred to their assigned phases.
- The only fidelity concern is process evidence: the missing required expectation file prevents proving that every control was specified and walked before implementation.

### 10. Context retention

- PASS. The implementation follows Phase 2's shared board path through `BoardSurface`, Phase 3's session/membership model, the seeded demo organization, and all recorded Phase 4 decisions.
- It preserves the inventory's separation between display-board styles and the P12 admin shell theme.

### 11. Security

- PASS with finding. The dashboard loader requires at least viewer membership; quick adds require editor membership against the server-side `orgId`; org layout rejects inaccessible slugs. This is the right trust-boundary direction.
- No secret or credential leak was introduced in Phase 4 code. Seed-only credentials are documented test data.
- Input validation needs semantic bounds so authorized users cannot save malformed Hebrew dates or schedule times.

### 12. Code quality

- **8/10.** The feature is organized, uses shared paths where correctness matters, and accurately scopes F1 route shells. Main deductions are the missing workflow and CodeGraph artifacts, plus validation holes in a write endpoint.

### 13. Findings

1. **Medium — quick-add accepts invalid calendar and time values.** `POST /api/org/[orgId]/dashboard/quick-add` only checks that `hebrewMonth`, `hebrewDay`, and `fixedTime` are present. Values such as month `99`, day `999`, `NaN`, or an arbitrary time string can reach the database. Validate integer Hebrew month/day ranges and `HH:MM` before insertion; ideally use the project's installed Zod rather than duplicating parsing rules.
2. **Medium — Phase 4 lacks the mandatory expectation artifact.** No `.scratch/phase-plan.md` exists, so pre-build expectations and item-by-item running-app evidence are missing. Add this before the next phase gate.
3. **Low — CodeGraph was not initialized despite an available CLI.** The decision-log deferral conflicts with `codegraph.mdc`; initialize and use it before later structural work.
4. **Low — no targeted automated coverage for the new admin code.** The 154 passing tests cover existing core/auth behavior, but there are no tests under `src/admin` or `app/admin`. The documented manual checks reduce immediate risk, but the quick-add validation gap would have been caught by focused endpoint tests.

## Scores

- inventory_coverage: 9
- rule_adherence: 6
- plan_fidelity: 8
- context_retention: 9
- security: 8
- code_quality: 8
