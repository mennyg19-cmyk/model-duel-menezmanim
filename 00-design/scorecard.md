# Experiment Scorecard (locked before kickoff)

**Experiment:** Fable high vs Sol high on MenEZmanim inventory rebuild
**Orchestrator:** cursor-grok-4.5-high (third party — does not build either arm)
**Date locked:** 2026-07-15

## Weights (100 points)

| Test | Weight | What it measures |
|---|---|---|
| Test 1 — Build | 40 | Prompt/direction adherence: inventory coverage, rule adherence, phased delivery, running-app verification |
| Test 2 — Bug detection | 30 | Finding 9 seeded bugs (3 types × 3 levels) + legitimate extras − false-positive/over-caution penalty |
| Test 3 — Vague bug fix | 30 | Finding root cause from vague symptoms, fix minimality, rule adherence, no regressions |

**Tie-break:** fewer verified regressions across all three tests.

## Test 1 rubric (40 pts)

| Criterion | Max | Notes |
|---|---|---|
| Inventory coverage (IDs PRESENT in running app) | 12 | Route/ID ledger vs frozen inventory |
| Rule adherence (six always-on rules) | 8 | Ponytail, clean-code, workflow verify-in-app, etc. |
| Phase discipline / todos followed | 6 | Own PHASE-PLAN executed; stops at phase gates |
| Code quality (reviewer checklists) | 6 | Aggregated from phase reviews |
| Context retention across phases | 4 | Didn't drop earlier work / contradict own plan |
| Security / stubs / dead buttons | 4 | No stubs as done; no obvious trust issues |

Blind final reviews (fresh Fable + fresh Sol rating both A and B) feed the inventory and quality scores. Phase-review history feeds discipline/context/security.

## Test 2 rubric (30 pts)

| Criterion | Max | Notes |
|---|---|---|
| Seeded bugs found (weighted by subtlety) | 18 | Easy=1, medium=1.5, hard=2 per bug; normalize to 18 |
| Legitimate extra bugs found | 6 | Real issues not in ledger |
| Over-caution / false positives | −6 max | Deduct for noise that isn't a bug |

## Test 3 rubric (30 pts)

| Criterion | Max | Notes |
|---|---|---|
| Root cause found (per bug) | 12 | Found the actual seeded bug, not a symptom workaround |
| Fix quality / minimality | 8 | Over-fixing penalized |
| Rule adherence during fix | 5 | Six always-on rules |
| No regressions (running app) | 5 | Verified |

## Arms

- `rebuild-a/` and `rebuild-b/` — model mapping withheld until FINAL-REPORT (blind review).
- Mapping file: `.scratch/experiment-mapping.md` (gitignored).
