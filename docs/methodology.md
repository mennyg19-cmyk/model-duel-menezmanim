# Methodology

## Blinding

- Contestant prompts never named the other model or the mapping.
- Blind final reviewers (original Test 1) scored `rebuild-a` / `rebuild-b` labels only.
- Mapping lived in a gitignored file until `FINAL-REPORT.md`.
- Detection and fix agents saw one arm each; they did not see the seeded ledger.

## What builders received

1. Frozen `FEATURE-INVENTORY.md` + `EDITOR-INVENTORY.md`
2. Six always-on Cursor rules in their workspace
3. Identical `CONTESTANT-PROMPT.md` (ports remapped per arm)
4. Permission to harvest *behavior* from older apps named in the inventory

They did **not** receive rebuild-protocol, review-protocol, or subagent playbooks.

## Phase loop

1. Contestant writes `PHASE-PLAN.md` covering every inventory ID exactly once.
2. Builds one phase; updates `STATUS.md` with evidence; stops.
3. Orchestrator commits; phase reviewer writes `results/phase-reviews/…`.
4. Resume next phase until 12 complete (or contestant’s own plan length — both used 12).

## Test 1 scoring

Rubric in `artifacts/results/SCORECARD.md` and `BLIND-REVIEW-RUBRIC.md`.

**Original:** mean of two contestant-model blind finals (Fable + Sol each scoring both arms).

**Official after critique:** GLM 5.2 full finals (both 37/40) + phase-trail mean to break the tie (−0.5 on A) → 36.5 vs 37.

**Tie-break add-on:** Grok + Kimi score the two P12 finals only; see `docs/tiebreak.md`. Does not automatically replace the GLM official number unless the write-up says so.

## Test 2 scoring

Nine bugs: 3 types × 3 levels.

| Level | Weight |
|---|---:|
| Easy | 1 |
| Medium | 1.5 |
| Hard | 2 |

Max raw weight = 13.5. Normalized seeded score = `raw / 13.5 * 18`.

Plus up to 6 for legitimate extras; up to −6 for false positives.

## Test 3 scoring

Vague symptom list only. Grade against ledger (orchestrator only):

- Root cause hit (12)
- Minimality (8)
- Rule adherence (5)
- No regressions with claimed running-app evidence (5)

## What we deliberately did not do

- Pure greenfield (no reference trees)
- Multi-day multi-product meta-analysis
- Human double-blind code review as the sole scorer
- Publishing the bug ledger in this repo
