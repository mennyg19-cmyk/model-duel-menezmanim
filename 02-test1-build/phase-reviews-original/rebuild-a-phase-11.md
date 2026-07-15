# Phase review — rebuild-a Phase 11

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 11

## Meta

- Arm reviewed: rebuild-a
- Phase number: 11 — i18n + tutorial
- Claimed IDs: P11, F-I18N1, F-I18N2, F-I18N3
- Diff / files touched this phase: commit `dbc775f` changed 23 files: locale API and i18n module/messages/tests; landing, root, admin shell/layout/nav/dashboard/settings; tutorial route/provider/page/launcher/chapters; phase documents and experiment state.

## Proof-of-read

**`results/PHASE-REVIEW-RUBRIC.md`**
- Requires evidence or N/A for every checklist item.
- Requires explicit review of inventory coverage, running app, no stubs, rules, plan, context, security, and craft.
- Requires six 1–10 aggregation scores at the end.

**`rebuild-a/PHASE-PLAN.md`**
- Phase 11 claims only P11, F-I18N1, F-I18N2, and F-I18N3.
- The plan assigns i18n/tutorial after import-export and before desktop/sync.
- Its coverage map assigns P11 to Phase 11 and no desktop work to this phase.

**`rebuild-a/STATUS.md`**
- Claims a tutorial route, chapter picker, overlay, hooks, completed-chapter storage, and fixed tooltip positioning.
- Claims EN/HE landing toggling through `/api/locale`, distinct locale types, RTL, and translated landing/admin chrome.
- Records prior typecheck, 181-test, and production-build evidence; Phase 12 is explicitly not started.

**`rebuild-a/DECISION-LOG.md`**
- Records a dependency-free overlay instead of react-joyride.
- Uses a cookie set by `POST /api/locale`, not server actions.
- Narrows F-I18N3 to the landing and admin shell/nav chrome for this phase.

**`inventory/FEATURE-INVENTORY.md`**
- P11 requires a chapter picker, completed chapter storage, `data-tutorial` hooks, and overlays across dashboard, styles, screens, groups, events, editor, widgets, and settings.
- F-I18N1 requires an internationalized landing page.
- F-I18N2 requires distinct UI, board-default, and object-text locale concepts, with RTL from locale.
- F-I18N3 requires applicable strings through `t()`, no inline colors, and one design system.

## Checklist

1. **Inventory coverage**
   - **P11 — PARTIAL.** The route, picker, localStorage completion records, launcher, provider, fixed card positioning, and 11 defined steps are present. Hooks exist only on the shell/nav, org switcher, live-display button, and tutorial heading. There are no hooks on styles, groups, events, widgets, or settings controls, and the tour does not navigate between pages to reach them.
   - **F-I18N1 — PRESENT.** The landing reads its locale from the cookie, renders all landing strings via `t()`, supplies EN/HE messages, and sets `lang`/`dir`.
   - **F-I18N2 — PRESENT.** `UiLocale`, `BoardDefaultLocale`, and `ObjectTextLocale` are distinct types; the display setting and object language field use the latter two concepts; RTL derives from `UiLocale`.
   - **F-I18N3 — PARTIAL.** Landing and primary admin navigation use `t()`, but tutorial, dashboard, settings, theme options, organization roles, and other chrome remain hard-coded. The claimed landing implementation also places raw hex/RGBA values in JSX CSS custom-property assignments, contradicting both the inventory and STATUS claim that raw hex is absent from markup.

2. **Running app**
   - Independent HTTP smoke checks on port 3101 returned connection code `000` for `/`, `/admin/demo/tutorial`, and both locale POST attempts; no server was running.
   - I did not start one because runtime verification was optional and the prior server evidence in STATUS is recorded. Independent static and build checks below passed.

3. **No stubs**
   - No empty handlers or “coming soon” text were found in the Phase 11 implementation.
   - The main functional gap is incomplete tutorial coverage, not a deliberately nonfunctional control.

4. **Rule: ponytail**
   - PASS. The tutorial uses browser APIs and React already in the project; no dependency was added. The direct overlay is proportionate to the stated decision.
   - The 235-line provider is still one focused feature, though it owns both tour state and rendering.

5. **Rule: clean-code**
   - PARTIAL. Locale types, validation, messages, and cookie lookup are clearly separated; the locale API rejects unsupported values.
   - The i18n implementation has a pattern breach: messages were added for tutorial/settings, but their corresponding UI does not consume them. Raw landing colors inside JSX also conflict with the claimed design-system direction.

6. **Rule: workflow**
   - PARTIAL. STATUS contains a claimed checklist and command evidence, and the phase did not enter Phase 12.
   - The completed claim overstates P11/F-I18N3: required tutorial surfaces and “every applicable string” are not covered. No expectation artifact was available for independent verification.

7. **Rule: codegraph**
   - N/A. The experiment DECISION-LOG records that no CodeGraph index exists, so the stated fallback was used. This phase did not rename or refactor structural APIs.

8. **Rule: git-discipline**
   - PASS / not attributable to contestant. The arm has an orchestrator-style Phase 11 commit (`dbc775f`, author Menny Grossman), but the phase instructions reserve git for the orchestrator. Nothing in the diff proves the contestant ran git.

9. **Todos / PHASE-PLAN fidelity**
   - PARTIAL. The change stays within the four Phase 11 IDs and does not begin desktop/sync.
   - F-I18N1 and F-I18N2 meet their planned outcome. P11 and F-I18N3 do not meet the complete inventory wording.

10. **Context retention**
   - PASS. Existing display language settings and per-object language fields are retained and named rather than replaced. The shell is wrapped with the tutorial provider without disturbing previous admin routes.

11. **Security**
   - PASS. The unauthenticated locale endpoint only accepts the two whitelisted locale values and writes a path-scoped, `SameSite=Lax` preference cookie. No secrets, authorization changes, or unsafe interpolation were introduced.

12. **Code quality**
   - **6/10.** The locale boundary is small, typed, and tested; the build and all tests pass. The user-visible tutorial does not match its required surface coverage, and the i18n/theming claim is materially incomplete.

13. **Findings**
   1. **P11 coverage gap:** add working tutorial targets and route progression for styles, groups, events, widgets, and settings. A navigation-only sequence cannot satisfy overlays “across” those surfaces.
   2. **P11 interaction gap:** the full-screen overlay root has default pointer events, so it blocks clicks on highlighted links and controls. Either drive navigation from the tutorial or allow only the intended target to receive input.
   3. **F-I18N3 gap:** route all claimed chrome through `t()` or narrow the inventory claim before marking the fix complete; tutorial/settings message keys currently have no consumers.
   4. **F-I18N3 theming gap:** move raw landing color values out of JSX. `app/page.tsx` assigns `#...` and `rgba(...)` directly to custom properties, so it does not meet the “no inline colors” requirement.

## Verification

- `npm run typecheck` — passed.
- `npm test` — passed: 20 files, 181 tests.
- `npm run build` — passed; `/admin/[orgSlug]/tutorial` and `/api/locale` are included in the production route manifest.
- Port 3101 was not serving an app during this review.

## Scores (1–10 each, for orchestrator aggregation)

- inventory_coverage: 6
- rule_adherence: 6
- plan_fidelity: 7
- context_retention: 9
- security: 9
- code_quality: 6
