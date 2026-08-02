# Correction report: arm-01/03/04 were graded against the wrong code

## The bug

The original Pass A grading (`docs/lego/batches/*.json`, aggregated into the
first `SCORES.json`/`MATRIX.md`) read each arm's code from:

```
/tmp/tomchei-work/duel/runs/2026-07-20-1748-tomchei-shabbos-website-model_duel/arms/arm-0N/workspace
```

That path is correct for **arm-02, arm-05, arm-06**. For **arm-01, arm-03, arm-04**
it is not: during the Test 6 "clone the leading arm, seed bugs, detect + fix"
exercise, those three arms' `workspace/` directories were overwritten with a copy
of arm-02's code (bugs seeded, then fixed back to clean) and were never restored
to their own Test-4 build afterward. The grading correctly noticed the four trees
were byte-identical and flagged them `CLONE-TIE` — but concluded they were identical
because the *models* converged, when actually only the *directory* was shared.
arm-01, arm-03, and arm-04's real, independent work was simply never read.

## How this was found and fixed

1. The duel harness repo (`/tmp/tomchei-work/duel`) turned out to be a shallow
   (`--depth 1`) git clone. Running `git fetch --unshallow` recovered the full
   310-commit history — one commit per build phase, per arm.
2. Diffing each arm's own `P12 gated — Test 4 complete` commit against the
   current on-disk workspace confirmed the damage precisely:

   | Arm | Own Test-4 commit vs. current on-disk workspace |
   |---|---|
   | arm-01 | 567 files, +29,401 / −24,819 lines — **overwritten** |
   | arm-02 | 20 files, +603 / −309 — intact |
   | arm-03 | 657 files, +31,152 / −39,845 lines — **overwritten** |
   | arm-04 | 818 files, +29,582 / −61,569 lines — **overwritten** |
   | arm-05 | 15 files, +188 / −40 — intact |
   | arm-06 | 17 files, +746 / −143 — intact |

3. Each arm's true, independent Test-4-complete build was extracted from git
   history into `/tmp/tomchei-work/true-arms/arm-0N/` (arm-01 @ commit `efee323`,
   arm-02 @ `6b9b9b6`, arm-03 @ `15dcf3f`, arm-04 @ `f23da8d`, arm-05 @ `8cb984a`,
   arm-06 @ `3d2a1d3`). All six now have distinct SHA-256 tree fingerprints and
   file counts (142–473 files) — genuinely six different codebases.
4. All 238 inventory items were re-graded for arm-01, arm-03, arm-04 against
   their true code (10 parallel subagent batches, same rubric as the original
   Pass A — see `LEGO-PROTOCOL.md`). arm-02/05/06 scores were left untouched
   (their on-disk workspace was never corrupted). arm-02's note/evidence text
   was re-attributed from the old (mislabeled) arm-01 entries, since that text
   was always describing arm-02's real code, just under the wrong arm's name.

## Impact

- **115 of 238 items (48%) changed winner** once arm-01/03/04 were graded
  against real code instead of a copy of arm-02.
- Outright (non-tied) wins per arm, on the corrected data:

  | Arm | Model | Outright wins | Win-field tally |
  |---|---|---:|---:|
  | arm-01 | gpt-5.6-sol-medium | 2 | 55 |
  | arm-02 | claude-fable-5-thinking-medium | 5 | 7 |
  | arm-03 | cursor-grok-4.5-high | 6 | 19 |
  | arm-04 | claude-opus-5-thinking-high | **46** | **75** |
  | arm-05 | terra-high | 1 | 4 |
  | arm-06 | kimi-k3-max | 19 | 75 |

  (159 of 238 items are genuine numeric ties across multiple arms at the max
  score — common with a 0–10 rubric and 6 independent implementations of the
  same spec. "Outright wins" counts only items where one arm strictly beat
  every other arm; "win-field tally" is the `winner` field after tie-breaking.)

- **arm-04 (claude-opus-5-thinking-high) is the true standout**, not arm-01 or
  the arm-02/06 tie reported earlier from the phase-gate `SCOREBOARD.md`. It was
  completely invisible to the original LEGO grading because its workspace had
  been silently replaced before we ever looked at it.

See `docs/lego/corrected-batches/*.md` for the itemized "what changed and why"
rationale per batch, and the updated `SCORES.json` / `MATRIX.md` for the full
corrected matrix.

## What this does NOT change

- arm-02, arm-05, arm-06 scores and analysis are unaffected — their on-disk
  workspace already was their own build.
- The bonus-item integration already merged into `07-composite` (Mapbox
  geocoding, CI workflow, password-based staff/customer sign-in, next/image
  remote patterns, etc.) remains valid; those were sourced from arm-06/arm-04's
  bonus-item write-ups and the composite's own architecture, not from the
  corrupted clone-cluster comparison.

## What's still open

Pass B (fit-check against the composite's actual base architecture) has not
yet been re-run against the corrected winners. Given the composite is currently
built primarily on arm-06's architecture, pulling in arm-04's now-winning
implementations for ~75 items is a real integration effort, not a drop-in —
each winning piece still needs the Pass B check (shared auth model? shared
schema? importable without a conflicting mini-framework?) before it can be
assembled in. That fit-check and the resulting code changes are the next step.
