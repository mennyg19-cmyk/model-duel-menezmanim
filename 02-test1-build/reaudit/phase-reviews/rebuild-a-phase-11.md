# Phase review — rebuild-a, Phase 11 (i18n + tutorial)

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 11 | Reaudit: true

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 11
- Diff / files touched this phase: `audit/diffs/a-p11.patch` is a one-line stub (`PHASE 1 - no previous phase; see snapshot tree at dbc775f`) — no usable diff. Review is from the `snapshots/a/p11` tree spot-checked against PHASE-PLAN claims. New/changed files this phase: `src/i18n/**` (index.ts, get-locale.ts, LocaleToggle.tsx, messages/{en,he}.json, index.test.ts), `src/admin/tutorial/**` (TutorialProvider.tsx, TutorialLauncher.tsx, TutorialPageClient.tsx, chapters.ts), `app/admin/[orgSlug]/tutorial/page.tsx`, `app/api/locale/route.ts`, plus `t()`/locale wiring in `app/layout.tsx`, `app/page.tsx`, `app/admin/[orgSlug]/layout.tsx`, `src/admin/AdminShell.tsx`, `src/admin/nav.ts`.

## Proof-of-read
- **REAUDIT-INSTRUCTIONS.md** — single third-party reviewer; use PHASE-REVIEW-RUBRIC; this phase only; static evidence preferred; running-app N/A OK; never guess the contestant model.
- **PHASE-REVIEW-RUBRIC.md** — 13-item checklist + 6 scores (1–10); fill every item with evidence or N/A+why.
- **FEATURE-INVENTORY.md** — P11 = react-joyride-style chapter system: chapter picker, guided overlays across dashboard/styles/screens/groups/events/editor/widgets/settings, `data-tutorial` hooks, completed-chapter storage, fixed-position tooltips in scroll regions. F-I18N1 landing i18n; F-I18N2 distinct UI vs board vs object locale + RTL; F-I18N3 chrome via `t()` + design tokens, no inline hex / ~700 inline styles bypass.
- **PHASE-PLAN.md (p11)** — Phase 11 claims P11, F-I18N1, F-I18N2, F-I18N3. Coverage check maps P11→11, F items listed.
- **STATUS.md (p11)** — claims `/admin/[orgSlug]/tutorial` + `TutorialProvider`, `data-tutorial` on shell/nav/live display, completed-chapter localStorage, auto-open once, fixed-position tooltip; landing EN/HE via `t()` + `LocaleToggle` + `/api/locale` cookie; three named locale types; chrome via `t()`, landing colors via CSS vars. Evidence: typecheck clean, 181 tests, build green; walked 2026-07-15.
- **DECISION-LOG.md (p11)** — no react-joyride (dependency-free overlay); UI locale cookie via `POST /api/locale`; F-I18N3 scoped to landing + admin shell/nav chrome (not every admin form string); three locale types documented in `src/i18n/index.ts`. Logged reversible.
- **a-p11.patch** — stub, no diff content (see Meta).
- **snapshots/a/p11** — spot-checked i18n + tutorial trees, AdminShell, Dashboard, layout, settings Display tab.

## Checklist

1. **Inventory coverage**
   - **P11 — PARTIAL.** Chapter picker (`TutorialPageClient` renders chapters from `TUTORIAL_STEPS`, per-chapter "Start chapter" + "Start the walkthrough"), `TutorialProvider` guided overlay with spotlight + card, `data-tutorial` hooks present (`admin-sidebar`, `org-switcher`, `nav-{section}`, `live-display`, `tutorial-page`), completed-chapter localStorage (`saveCompletedChapter`/`loadCompletedChapters`, key `menez-tutorial-chapters`), auto-open once (`TUTORIAL_SEEN_KEY`, 700ms delay), fixed-position scroll-safe card (`cardPosition` clamps to viewport, re-measures on resize/scroll). Gaps vs inventory: chapters cover only 4 areas (Getting around / Schedules / Content / Display / Setup) — the inventory's "across dashboard, styles, screens, groups, events, editor, widgets, settings" is represented only as nav hooks, not as in-page overlays on those surfaces; no editor/widget/group/event in-canvas steps. Dependency-free overlay is a logged, reversible decision (acceptable). `TutorialLauncher` "?" button in sidebar.
   - **F-I18N1 — PRESENT.** Landing renders EN/HE via `t(locale, …)`; `LocaleToggle` posts to `/api/locale` which sets `ui-locale` cookie (validated by `isUiLocale`, 1y, sameSite=lax); `getUiLocale` reads it server-side; `app/layout.tsx` sets `<html lang dir>`.
   - **F-I18N2 — PRESENT (documented) / PARTIAL (UI).** Three types named in `src/i18n/index.ts` (`UiLocale`, `BoardDefaultLocale`, `ObjectTextLocale`); RTL derived from UI locale; Settings Display tab has a clarifying note distinguishing the three. But the Settings note text is hardcoded English (not via `t()`), and no `BoardDefaultLocale`/`ObjectTextLocale` RTL/selection UX lives here beyond the existing settings select.
   - **F-I18N3 — PARTIAL.** Landing fully through `t()` and colors via CSS variables (no raw hex in component markup — hex lives only as CSS-var definitions on the root div). Admin shell/nav chrome through `t()` (nav items, org label, super, theme, logout). **But `Dashboard.tsx:144` calls `t("en", item.labelKey)` — hardcoded `"en"`, so dashboard quick-action labels never localize** even though the decision scoped F-I18N3 to "admin shell/nav chrome." Settings Display-tab strings are also hardcoded English. Scope was explicitly narrowed in DECISION-LOG (not every admin form string), but dashboard chrome falls inside the claimed scope and is broken.

2. **Running app** — N/A. Snapshot tree only (no `node_modules`); not run. Static evidence + STATUS claims (typecheck clean, 181 tests, build green) accepted unverified.

3. **No stubs** — No dead buttons / "coming soon." Tutorial cards have working Back/Next/Skip/Done; chapter storage writes; launcher starts tour. The only soft spot: tutorial steps that point at `nav-editor`/`nav-screens` highlight nav links, not the surfaces themselves — functional but shallow (see coverage).

4. **Rule: ponytail** — Good. No `react-joyride` dependency (dependency-free overlay, ladder rung 3/4). `t()` is a 3-line fallback map. No speculative abstractions. `chapters.ts` is plain data. Locale cookie route is minimal. CSS-var color tokens on landing are the right call. One mild bloat: `TutorialProvider` re-derives `chapters` grouping in `TutorialPageClient` instead of a shared `chapters()` helper — minor.

5. **Rule: clean-code** — Mostly good. Naming clear (`dirForLocale`, `isUiLocale`, `saveCompletedChapter`); one pattern per concern (cookie locale, single `t()`). `cardPosition` clamping is readable. Tics: `TutorialProvider` `useLayoutEffect` uses `step!` non-null assertion inside a closure after an early return (safe but noisy); `TutorialPageClient` builds `chapters` with a mutable accumulator loop (fine, small). No god files; tutorial split into 4 small files + chapters data.

6. **Rule: workflow** — Expectation/verify discipline visible in STATUS (walked checklist with routes/cookie evidence, test count, build). Open call (react-joyride vs dependency-free) resolved as reversible DECIDED, not invented product direction. Scope narrowing of F-I18N3 logged honestly. No speculative inventing.

7. **Rule: codegraph** — N/A. No index in the experiment workspace (DECISION-LOG: codegraph skipped, reference trees read-only). Literal/non-structural spot-checks via Read/Grep only — consistent with the rule.

8. **Rule: git-discipline** — Contestant must NOT git. Snapshot is a plain tree (no `.git`); no evidence of git operations. DECISION-LOG notes "git N/A." Clean.

9. **Todos / PHASE-PLAN fidelity** — Phase 11 plan = P11, F-I18N1, F-I18N2, F-I18N3. All four addressed (see coverage). Deviation: P11 breadth (inventory names overlays across 8 surfaces; delivered nav-hook steps across 4 chapters) and F-I18N3 dashboard hardcode. Otherwise faithful.

10. **Context retention** — No regressions visible. Prior phases' `AdminShell`, `nav.ts`, layout, settings all extended in place; tutorial wired into existing `[orgSlug]/layout.tsx` alongside `AdminThemeProvider`. No earlier work dropped. `AdminShell` gained `uiLocale` prop cleanly.

11. **Security** — `/api/locale` POST validates body with `isUiLocale` (rejects unknown → 400), sets a non-sensitive UI-pref cookie (not httpOnly, intentional — read client-side is not required, but no secret). No auth needed (public pref). No injection surface (`t()` key lookup against a static map; missing key returns the key). Admin layout still gates on `getActor`/`requireOrgBySlug`. No issues.

12. **Code quality** — 7/10. Clean, small, dependency-free, CSS-var tokens, honest scope logging. Loses points for the `t("en", …)` hardcode in Dashboard (claimed-chrome not actually localized), shallow tutorial breadth vs inventory, and Settings Display strings not routed through the `t()` keys that were already defined for them.

13. **Findings**
   1. **F-I18N3 regression — Dashboard chrome hardcoded English.** `src/admin/Dashboard.tsx:144` uses `t("en", item.labelKey)`; `Dashboard` receives no `uiLocale` prop, so quick-action labels never follow the UI locale. Falls inside the logged F-I18N3 scope ("admin shell/nav chrome"). Fix: thread `uiLocale` from the dashboard server page (as `AdminShell` does) and pass to `t()`.
   2. **F-I18N2/F-I18N3 — Settings Display tab strings bypass `t()`.** `settings.boardDefaultLocale`/`settings.uiLocaleNote`/`settings.objectLocaleNote` keys exist in `messages/{en,he}.json` but `SettingsPage.tsx:444/457/461` use hardcoded English. The DECISION-LOG narrowed scope to "not every admin form string," but the keys were already authored — either wire them or drop the dead keys.
   3. **P11 breadth short of inventory.** Inventory calls for guided overlays across dashboard/styles/screens/groups/events/editor/widgets/settings; delivered steps are nav-link spotlights across 4 chapters with no in-surface (editor canvas, widget panel, schedule rows, screen manager) steps. Functional but not the full chapter system described.
   4. **No tutorial automated test.** `src/i18n/index.test.ts` covers `t()`/`dirForLocale`/`isUiLocale`; no test for `chapters.ts` grouping/storage helpers or `cardPosition` clamping (pure, easily unit-testable). Minor.

## Scores (1–10)
- inventory_coverage: 6
- rule_adherence: 8
- plan_fidelity: 7
- context_retention: 9
- security: 9
- code_quality: 7
