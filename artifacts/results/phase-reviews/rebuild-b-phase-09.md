# Phase review — rebuild-b, Phase 9

## Meta
- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Runner: spawn
- Arm reviewed: rebuild-b
- Phase number: 9 — Members, settings, tutorial, and admin themes
- Diff / files touched this phase (per `git log`, commit `24134ce`): `src/admin/members/MembersManager.tsx`, `src/admin/settings/SettingsClient.tsx`, `src/admin/tutorial/{TutorialLauncher.tsx,chapters.ts}`, `src/admin/theme/{ThemePickerAdmin.tsx,admin-themes.ts}`, `src/admin/i18n/admin-strings.ts`, `src/admin/shell/AdminShell.tsx`, `src/domain/org-settings.ts`, `src/domain/org-access.ts`, `app/admin/[orgSlug]/{members,settings}/page.tsx`, `app/api/org/[orgId]/{members,invites,settings}/route.ts`.

## Proof-of-read

**`PHASE-REVIEW-RUBRIC.md`** — 13-item checklist plus 6 aggregation scores; every item needs evidence or an explained `N/A`; full report goes to the path named in the spawn prompt.

**`PHASE-PLAN.md` (Phase 9)** — Claims `P8`/`P8.1–P8.5`, `P9`/`P9.1–P9.7`, `P11`, `P12`, `E16`, `E17`, `F7`, `F8`, `F-I18N3`. Done-when: role guards hold, settings sections don't clobber each other, every tutorial target is reachable, theme/locale survive reload.

**`STATUS.md`** — Claims members list/role-change/remove/invite/resend/revoke; coherent section-merge settings PUT; admin theme picker persisted via CSS variables; tutorial launcher with `data-tutorial` hooks across 7 pages; nav strings via `t()`. Verification evidence cites typecheck/build pass, HTTP 200/201/403 on the relevant routes, and a stopped server.

**`DECISION-LOG.md`** — Two Phase-9-dated decisions: section-merge settings PUT (F7) and `Intl.supportedValuesOf("timeZone")` for real timezones (F8), plus an undated-but-Phase-9 decision to ship a hand-rolled fixed-position tutorial instead of `react-joyride` (ponytail ladder — ship what's needed, ship it reversibly).

**`FEATURE-INVENTORY.md`** (P8/P8.1–5, P9/P9.1–7, P11, P12, E16, E17, F7, F8, F-I18N3) — P8 is member list/role/remove/invite/pending, owner-admin RBAC. P9 is profile/location/halacha(+Rabbeinu Tam type-value pair)/locale/plan/kiosk/display-names, fixed by F7 (one coherent save, not four clobbering saves) and F8 (real tz list, not hardcoded). P11 is the v1 `react-joyride` chapter tutorial (rebuild is free to swap the library, not the behavior). P12 is the admin theme picker (5 slots incl. custom, CSS variables). F-I18N3 demands every applicable string through `t()`, no inline hex bypassing the design system.

**Phase 9 code** (`src/admin/{members,settings,tutorial,theme,i18n}/**`, matching `app/**` routes and API handlers) — read in full; see findings below.

## Checklist

**1. Inventory coverage**

| ID | Status | Evidence |
|---|---|---|
| P8 / P8.1 | PRESENT | `MembersManager.tsx` lists name/email/role. |
| P8.2 | PRESENT | Role `<select>` → `PATCH /members`; server blocks demoting the last owner. |
| P8.3 | PRESENT | `confirm()` + `DELETE /members`; server blocks self-removal and removing the last owner. |
| P8.4 | PRESENT | Invite-by-email form → `POST /invites`; server blocks inviting an existing member. |
| P8.5 | PRESENT | Pending list with resend (rotates token/expiry) and revoke; RBAC owner/admin via `requireOrgMember(..., {admin:true})`. |
| E16 | PRESENT | `app/api/org/[orgId]/members/route.ts` — GET/PATCH/DELETE, admin-gated, org-scoped. |
| E17 | PRESENT | `app/api/org/[orgId]/invites/route.ts` — GET/POST/DELETE, admin-gated, dedupes prior pending invites on resend. |
| P9.1 profile | PRESENT | Name field, independent save. |
| P9.2 location | PRESENT | Lat/lng/elevation/timezone/inIsrael, independent save. |
| P9.3 halacha | PARTIAL | Dialect/candle/shabbat-end/AM-PM/Rabbeinu-Tam-type-value all present; per-zman `ZmanimConfig` overrides UI only exposes `ZMAN_KEYS.slice(0, 12)` of 32 defined types (comment: "Showing first 12... save writes only edited overrides"). Data model and PUT handler support all 32; the UI is the gap. |
| P9.4 locale | PRESENT | uiLocale/boardDefaultLocale/objectTextLocale, independent save. |
| P9.5 plan | PRESENT (read-only by design) | Shows current plan; write correctly deferred to Phase 10 super-admin, matches PHASE-PLAN scope. |
| P9.6 kiosk | PRESENT | Default display language, kiosk mode, hide cursor, auto-start, independent save. |
| P9.7 display names | PARTIAL | Editor exists and persists via section-merge, but only covers `ZMAN_KEYS.slice(0, 8)` + 8 tefilah keys — not "every zman and tefilah item" per inventory. Same gap pattern as P9.3. |
| F7 | PRESENT, verified live | Confirmed below — sequential single-section PUTs do not clobber each other. |
| F8 | PRESENT | `Intl.supportedValuesOf("timeZone")` with a 5-zone fallback if the runtime lacks it. |
| P11 | PRESENT (behavior, not library) | 7 chapters (dashboard, screens, schedules, content, editor, settings, members) with fixed-position spotlight + card, `data-tutorial` hooks matching each chapter's target page, completion persisted to `settings.tutorial.completedChapters`. Inventory's v1 topic list (dashboard, styles, screens, groups, events, editor, widgets, settings) is not a 1:1 match but every admin surface built so far has a reachable chapter; no dead target. |
| P12 | PRESENT | 5 themes (dark/light/mono-dark/mono-light/custom) applied via `document.documentElement` CSS variables, persisted to `settings.adminTheme`, custom color swatches for ink/deep/mint/panel. |
| F-I18N3 | PARTIAL | Nav strings (`nav.*`, a handful of `members.*`/`settings.*`/`tutorial.*` keys) go through `t()` and the shell direction flips RTL for `he`. Page-body copy in `MembersManager.tsx` and `SettingsClient.tsx` ("Team access", "Invite by email", "Organization profile", section headers, button labels, tutorial step bodies) is hardcoded English, not routed through `t()`. This is a real but bounded gap — STATUS.md itself scopes the claim to "shell nav strings," which is honest about what was built, but it's short of the inventory's "every applicable string." No inline hex colors found in the touched files (the one literal `"#72d8ad"` in `ThemePickerAdmin.tsx` is a `<input type="color">` uncontrolled-value fallback matching the dark theme's own mint token, not a bypass of the theme system). |

**2. Running app** — Verified. Started `npm run dev` (port 3102), seeded DB already present. Logged in as `owner@demo.local` via `/api/auth/login`:
- `GET /api/org/demo/members` → 200, correct member list (owner + admin).
- `GET /api/org/demo/invites` → 200, pending invites with `acceptPath`.
- `GET /api/org/demo/settings` → 200, full settings blob.
- `PUT /api/org/demo/settings` with `{locale:{uiLocale:"he"}}` alone → response still contains untouched `kiosk`, `displayNames`, `adminTheme`, `tutorial` keys.
- Follow-up `PUT` with `{adminTheme:{id:"light"}}` alone → `locale.uiLocale` still `"he"` (not reverted).
- Follow-up `PUT` with `{location:{latitude:32}}` alone → `locale` and `adminTheme` both still intact; `org.latitude` changed to 32.
- Restored locale/theme/latitude to seed defaults.
- Logged in as `invitee@demo.local` (a user with a pending invite, not yet a member) → `GET /api/org/demo/members` → **403** (role/membership guard holds for a real "not authorized" case, stronger than the viewer-role case STATUS.md cites).
- `/admin/demo/members` and `/admin/demo/settings` → HTTP 200 as owner.
- `npm run typecheck` → clean, 0 errors.
- Server killed after verification (port 3102 confirmed free).

This directly confirms the F7 claim ("settings do not clobber one another") with live evidence, not just code reading.

**3. No stubs** — None found in the Phase 9 surface. Grepped `src/admin/**` for TODO/FIXME/"coming soon" — zero real hits (two false positives on the substring "Doc" inside `applyThemeToDocument`/`pasteIntoDoc`).

**4. Rule: ponytail** — Section-merge settings design is the minimum needed to satisfy F7 (patch-merge object, no new state library). Tutorial is a plain `useState` + fixed-position `<div>` overlay instead of pulling in `react-joyride` — DECISION-LOG names this explicitly as a ladder call, and it's the right one: existing React covers the required behavior. No unrequested abstractions spotted (no premature "SettingsSection" wrapper component, no theme-provider added when a CSS var + `useEffect` does the job).

**5. Rule: clean-code** — Naming is intention-revealing (`mergeSettingsBlob`, `requireOrgMember`, `orgSettingsDto`). Error messages state the actual and expected condition (`Cannot demote the last owner`, `Cannot remove yourself`). One access-control helper (`org-access.ts`) is reused by both members and invites routes — no duplicated guard logic. One state pattern (local `useState` + `fetch`) across Members/Settings/Theme/Tutorial — consistent with the rest of the admin shell per earlier phases. No god files: largest touched file (`SettingsClient.tsx`) is ~515 lines but is one concern (one settings page, several independently-saved sections) rather than mixed concerns; a split would mostly move code around without reducing it. `ADMIN_ROLES`/`WRITE_ROLES` are separate `Set`s so members/invites (admin-only) are correctly stricter than settings writes (owner/admin/editor) — this distinction isn't stated anywhere in the inventory or decision log, so it's an undocumented judgment call rather than a bug, but it's exactly the kind of business-rule choice `workflow.mdc` asks to be logged. It wasn't.

**6. Rule: workflow** — STATUS.md's verification section lists concrete evidence (status codes, actual merge behavior, role check) rather than "it works." That's the right posture. The gap: STATUS.md doesn't flag the P9.3/P9.7 "first N of 32/40" UI truncation as a known limitation — it reads as complete. That's the one place the phase's self-report is more confident than the code supports.

**7. Rule: codegraph** — N/A for this arm's session; `.codegraph/` exists in `rebuild-b` (per directory listing) but this reviewer used `Read`/`Grep` for a single-phase, ~15-file surface, which the hybrid rule allows for known small file sets. No large-scale symbol/caller lookups were needed.

**8. Rule: git-discipline** — Contestant did not run git. `git log` shows a single squashed commit for this phase (`24134ce Experiment arm B: Phase 9 members, settings, tutorial, themes.`) made by the orchestrator, consistent with "git belongs to the orchestrator" in `CONTESTANT-PROMPT.md`. `git status` is clean on `rebuild-b` (one unrelated untracked file under `rebuild-a`, out of this arm's scope).

**9. Todos / PHASE-PLAN fidelity** — Matches the plan's "Build owner/admin member controls, invitations, coherent settings persistence, real timezone selection, display names, kiosk preferences, guided tutorial chapters, and persisted admin themes" almost completely. The two UI-truncation gaps above (P9.3, P9.7) are the only shortfall against "coherent settings persistence" + "display names" as literally scoped in the inventory.

**10. Context retention** — No contradictions of earlier phases found. Nav still points `Live Display`-style admin deep links at `/admin/[orgSlug]/...` per the Phase 8 decision; settings page reuses the same `AdminShell` locale/theme/tutorial props wired in Phase 8; the members/settings pages both call `requireAdminMe` the same way Phase 8's dashboard does. `F-NAV1`/`F-NAV2` decisions from earlier phases are untouched by this phase's files.

**11. Security** — `requireOrgMember` checks membership by `orgId` (resolved server-side from slug or id) and role, never trusting client-supplied role/orgId pairing beyond that lookup. Members/invites correctly require `admin: true` (owner/admin only, matching inventory RBAC). Settings PUT requires `write: true` (owner/admin/editor) — broader than members/invites, which is defensible (editors plausibly need to set locale/kiosk prefs) but is an unlogged judgment call per point 6. Self-removal and last-owner demotion/removal are both blocked server-side, not just hidden in the UI. No secrets, no client-trusted authorization fields observed in the touched files.

**12. Code quality** — 8/10. Clean, consistent, verified-live section-merge logic; correct RBAC boundaries; no dead code or stubs. Docked for the undocumented UI-truncation on two P9 sub-items and the unlogged write-role choice for settings.

**13. Findings**

1. **P9.3 per-zman overrides UI shows only 12 of 32 `ZmanType`s** (`SettingsClient.tsx:327`, `ZMAN_KEYS.slice(0, 12)`). The API/data model handle all 32; an admin cannot edit overrides for the other 20 without a different UI. Not flagged as a known gap in STATUS.md.
2. **P9.7 display names UI shows only 8 of 32 zman keys** (`SettingsClient.tsx:481`, `ZMAN_KEYS.slice(0, 8)`) plus all 8 tefilah keys. Inventory asks for "every zman and tefilah item." Same undocumented-gap pattern as #1.
3. **F-I18N3 is scoped to shell nav, not page content.** Members/Settings page headers, labels, and button text are hardcoded English strings, not routed through `t()`. STATUS.md's own wording ("Admin shell nav strings via `t(en|he)`") is honest about the narrower scope actually built, but the claimed ID (F-I18N3) implies the broader inventory requirement ("every applicable string through `t()`") which is not fully met.
4. **Settings write-role (owner/admin/editor) vs members write-role (owner/admin) split is undocumented.** Reasonable default, but per `workflow.mdc` ("Never silently choose business logic... log in DECISION-LOG.md") this should have a line in `DECISION-LOG.md`.

## Scores (1–10)
- inventory_coverage: 8
- rule_adherence: 8
- plan_fidelity: 8
- context_retention: 9
- security: 9
- code_quality: 8
