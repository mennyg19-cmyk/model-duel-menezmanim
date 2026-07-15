# Phase 6 Review — Content hub

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 6 | Retry: resource_exhausted

## Proof-of-read

### `results/PHASE-REVIEW-RUBRIC.md`
- Requires evidence or `N/A` for all 13 checks.
- Requires inventory, rule, plan, context, security, and quality scores.
- This report applies that checklist without editing rebuild-a code.

### `rebuild-a/PHASE-PLAN.md` — Phase 6
- Claims P5.1–P5.6, E9–E12, E22, F5, and F-DB3.
- Requires the Content hub, relationship UI, and OP6 hybrid notes.
- The next phase is Visual editor; it is outside this review.

### `rebuild-a/STATUS.md`
- Claims content and notes routes, CRUD APIs, seeded baseline notes, and Phase 6 verification.
- Records prior 3101 checks, content POSTs, typecheck, tests, and build.
- States Phase 7 has not started.

### `rebuild-a/DECISION-LOG.md`
- Media is intentionally stored as a data URL or path in this experiment.
- Notes use C6 baseline rows plus org add, override, and hide layers.
- Announcements and media reuse the Phase 5 `ScheduleRuleEditor`.

### `inventory/FEATURE-INVENTORY.md`
- P5 requires all D12–D15 fields and working Content Hub controls.
- P5.5 requires per-item scheduling; P5.6 requires baseline plus org notes.
- E9–E12/E22 must apply server-side membership and super-admin guards.

## Meta

- Diff / files touched: commit `97253b3` adds the two content pages, 13 content/notes API route files, three content modules, navigation, seed data, STATUS, and DECISION-LOG. Its 25-file stat also includes experiment-wide files and the rebuild-b Phase 4 review.
- Independent checks: `npm run typecheck` passed; `npm test` passed 16 files / 154 tests.

## Checklist

1. **Inventory coverage — PARTIAL.**
   - P5.1, P5.4, E9, and E12 have functional UI/API paths for CRUD, ordering, active flags, and schedule-rule persistence.
   - P5.2/F5 and E10 are mostly present, but the memorial form omits D13 `civilDate`.
   - P5.3/E11 supports `recurrenceRule` in schema/API but the sponsor form has no field to create or edit it.
   - P5.5 persists rules but does not apply them in board content loading. P5.6/E22/F-DB3 are present with baseline, add, override, hide, and super-admin APIs.

2. **Running app — N/A for this reviewer.**
   - An existing 3101 dev server showed prior authenticated 200s for both content pages and 201s for all four content POSTs in its terminal log.
   - I did not send another mutation through that shared seeded app or stop a server I did not start.
   - Static checks above passed, but there is no Phase 6 browser/API regression test for the failed paths below.

3. **No stubs — PARTIAL.**
   - No dead `onClick` handlers or “coming soon” text were found in the Content Hub.
   - The visible scheduling control is materially incomplete: it saves data that the display path never evaluates.

4. **Rule: ponytail — PARTIAL.**
   - Reusing `ScheduleRuleEditor` is the right small choice and no new dependency was added.
   - The one 605-line ContentHub component is larger than the workspace’s 500-line split threshold.

5. **Rule: clean-code — PARTIAL.**
   - APIs consistently use `requireOrgRole`, scoped `id + orgId` database operations, and useful errors.
   - `ContentHub.tsx` mixes four models, loading, mutation, forms, and styling behind `Record<string, unknown>` state; it is a god file.

6. **Rule: workflow — PARTIAL.**
   - STATUS and DECISION-LOG provide phase evidence and record product decisions.
   - No Phase 6 expectation checklist was found under `.scratch/`, and the test suite has no content-hub/API coverage.

7. **Rule: codegraph — N/A.**
   - The phase DECISION-LOG records that no index exists; this matches the experiment constraints.

8. **Rule: git-discipline — PASS, attribution limited.**
   - The Phase 6 commit is experiment/orchestrator-facing and also carries unrelated arm-B review output.
   - I found no evidence that the contestant independently ran git; the current uncommitted paths are only under rebuild-b.

9. **Todos / PHASE-PLAN fidelity — PARTIAL.**
   - The claimed routes, APIs, relationship field, and notes model were built.
   - The missing memorial civil date, sponsor recurrence rule UI, and inactive content scheduling leave required controls incomplete.

10. **Context retention — PASS.**
    - F4 reuse, F5 relationship, and the F-DB3 hybrid model follow earlier documented decisions.
    - The board repository does correctly suppress hidden/overridden baseline notes for W14.

11. **Security — PASS with input-validation gap.**
    - Org APIs require viewer/editor membership; row mutations additionally scope by `orgId`; baseline APIs require super-admin.
    - API bodies are manually cast rather than parsed with the existing Zod contracts, so malformed rule/date data is not rejected at the boundary.

12. **Code quality — 5/10.**
    - The CRUD and authorization baseline is solid, but three required UI paths are absent or ineffective and the main component needs decomposition.

13. **Findings**
    1. **High — P5.5 scheduling is not enforced.** `ContentHub` writes `scheduleRules`, but `loadBoardData` filters announcements/media only by `isActive` and maps neither rule set into display data. Visibility rules therefore never affect W9/W12 output.
    2. **High — selected `any` scheduling semantics are discarded.** The editor exposes `all`/`any`, but ContentHub stores only the rule array; the board mapper hardcodes `combineMode: "all"` for display objects and never reads content-item rules.
    3. **Medium — P5.2 is missing the D13 civil-date control.** The memorial API accepts `civilDate`, but the form exposes no field for it.
    4. **Medium — P5.3 is missing recurrence-rule editing.** `recurrenceRule` exists in D14 and the E11 routes but has no Content Hub control.
    5. **Medium — ContentHub exceeds the project’s god-file threshold.** At 605 lines, it combines four distinct forms and their request logic.

## Scores (1–10 each, for orchestrator aggregation)

- inventory_coverage: 6
- rule_adherence: 5
- plan_fidelity: 6
- context_retention: 8
- security: 8
- code_quality: 5
