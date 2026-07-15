# FINAL REPORT — Fable high vs Sol high on MenEZmanim

**Date:** 2026-07-15  
**Orchestrator:** cursor-grok-4.5-high (third party; did not build either arm)  
**Target:** MenEZmanim inventory rebuild under `_experiment/`

## Phone summary

**Overall winner: GPT-5.6 Sol high** — **82 / 100** (reaudit) vs Fable’s **72.5 / 100**.

Original published total was 76 vs 62.5. After a **GLM 5.2 single-reviewer reaudit** of every phase gate + both finals, Test 1 became nearly a tie (37 vs 36.5). Sol still wins overall on Tests 2 and 3.

Sol won detection (Test 2) clearly; both nailed all nine vague-fix root causes (Test 3), with Sol slightly cleaner on scope. Fable’s original arm had better password auth and a real test suite. Contestant prompt allowed reference-app harvest — Test 1 was not pure greenfield.

## Model mapping (revealed)

| Slot | Model |
|---|---|
| rebuild-a (Test 1 builder) | `claude-fable-5-thinking-high` |
| rebuild-b (Test 1 builder) | `gpt-5.6-sol-high` |
| Phase reviews for A (original) | `gpt-5.6-terra-high` |
| Phase reviews for B (original) | `claude-sonnet-5-thinking-high` |
| **Reaudit reviewer (all gates + both finals)** | **`glm-5.2-high`** |
| Tie-break finals (second neutrals) | `cursor-grok-4.5-high`, `kimi-k2.7-code` |
| Test 2 detect A / Test 3 fix A | Fable high |
| Test 2 detect B / Test 3 fix B | Sol high |
| Orchestrator | `cursor-grok-4.5-high` |

## Scorecard totals (official after reaudit)

| Test | Weight | Fable | Sol |
|---|---:|---:|---:|
| 1 — Build (GLM reaudit) | 40 | 36.5 | **37** |
| 2 — Bug detection | 30 | 10.0 | **16.0** |
| 3 — Vague bug fix | 30 | 26.0 | **29.0** |
| **Total** | **100** | **72.5** | **82.0** |

Original Test 1 (split reviewers + Fable/Sol blind finals): 26.5 vs 31 — kept in `TEST1-VERDICT.md` as appendix. Reaudit details: `TEST1-REAUDIT.md`.

Tie-break (regressions): not needed; Sol ahead on Tests 2–3 and micro-edge on Test 1.

## Test 1 — Build (detail)

### Original pass (appendix)

Blind finals (each contestant model rated both arms):

| Blind reviewer | rebuild-a (Fable) | rebuild-b (Sol) |
|---|---:|---:|
| Sol | 25 | 30 |
| Fable | 28 | 32 |
| Mean | **26.5** | **31** |

Mid-build reviews used Terra→A and Sonnet→B (fairness concern → reaudit).

### GLM 5.2 reaudit (official)

Single third-party model reviewed all 24 phase gates + both P12 finals from git-restored snapshots.

| | rebuild-a | rebuild-b |
|---|---:|---:|
| Full final /40 | 37 | 37 |
| Phase mean (1–10 dims) | 8.51 | **8.65** |
| **Official Test 1** | **36.5** | **37** |

See `results/TEST1-REAUDIT.md` and `results/reaudit/`.

- **Sol strengths (reaudit):** slightly stronger phase-trail inventory/plan fidelity; desktop Phase 12 more complete.
- **Fable strengths:** password auth + tests in original build; full audit still scored inventory 11/12.
- **Shared:** full audits compressed to identical category scores — phase trail carries the discrimination.
- **Greenfield caveat:** prompt allowed harvesting old apps; not a pure green-plate.

### Tie-break neutrals (appendix; does not change official Test 1)

Same P12 snapshots; reviewers barred from GLM FULL reports:

| Reviewer | rebuild-a | rebuild-b | Call |
|---|---:|---:|---|
| Grok 4.5 | 32 | **37** | B |
| Kimi K2.7 | **33** | 29 | A |

Disagreement on desktop BeeZee (completeness vs trust-boundary) and on zero-tests in B. Official points stay GLM. Details: `reaudit/TIEBREAK-GROK.md`, `TIEBREAK-KIMI.md`.

Winner clone for Tests 2–3: rebuild-b (unchanged).

## Test 2 — Detection (detail)

Nine seeded bugs (logic/security/data × easy/medium/hard). Ledger stayed in `.scratch/` only.

| | Fable | Sol |
|---|---:|---:|
| Seeded weighted (of 18) | 4.0 | **10.0** |
| Legitimate extras (of 6) | 6 | 6 |
| FP penalty | 0 | 0 |
| **Total /30** | **10** | **16** |

Sol hit L1, L2, L3, S1, D3. Fable hit S1, S3. Neither hit S2, D1, D2.

## Test 3 — Vague fix (detail)

Both restored correct root causes for all nine symptoms with live verification claimed.

| | Fable | Sol |
|---|---:|---:|
| Root causes (of 12) | 12 | 12 |
| Minimality (of 8) | 6 | 7 |
| Rules (of 5) | 3 | 5 |
| No regressions (of 5) | 5 | 5 |
| **Total /30** | **26** | **29** |

## Qualitative observations

1. **Reviewer design matters:** Split Terra/Sonnet mid-build reviews + contestant-model blind finals produced a 4.5-pt Test 1 gap; one GLM reviewer on restored gates made the builds nearly tied; Grok and Kimi then disagreed (B vs A) on the same finals.
2. **Detection still separates them:** On identical code, Sol found more seeded logic/sync bugs (Test 2).
3. **Vague fix:** Both excellent at symptom → root cause; Fable’s unrelated `.cursor/rules` deletion cost points.
4. **Auth debt:** Sol’s passwordless login remains a release blocker and was not one of the nine seeded bugs.
5. **Not greenfield:** Prompt invited reference harvest; any “who builds better from inventory alone” claim needs a locked no-reference re-run.

## Artifacts

| Artifact | Path |
|---|---|
| Scorecard | `results/SCORECARD.md` |
| Test 1 (original) | `results/TEST1-VERDICT.md`, `results/blind-reviews/` |
| Test 1 (reaudit, official) | `results/TEST1-REAUDIT.md`, `results/reaudit/` |
| Test 2 | `results/TEST2-VERDICT.md`, `results/detection/` |
| Test 3 | `results/TEST3-VERDICT.md`, `results/fixes/` |
| Phase reviews (original) | `results/phase-reviews/` |
| Arms | `rebuild-a/`, `rebuild-b/` (post-Test-3 fixed states) |

## Deviations

See `results/DEVIATIONS.md` (reviewer write access, resource_exhausted retries, fresh Sol agent mid-build, GLM reaudit).
