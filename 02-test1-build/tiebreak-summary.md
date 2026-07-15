# Tie-break: second neutrals on P12 finals

**Date:** 2026-07-15  
**Why:** GLM 5.2 scored both full finals **37/40** (identical category table). We asked two more families to score the same two P12 snapshots without reading GLM’s full reports.

| Reviewer | rebuild-a /40 | rebuild-b /40 | Call |
|---|---:|---:|---|
| GLM 5.2 (full finals) | 37 | 37 | Tie on full table; phase trail → B (−0.5 on A) |
| Grok 4.5 | 32 | **37** | **rebuild-b** — desktop BeeZee/LAN/EW depth; A overclaims preview-only DK |
| Kimi K2.7 | **33** | 29 | **rebuild-a** — test suite + safer trust boundary; B hardcodes demo-owner login |

**Sources:** [`reaudit/TIEBREAK-GROK.md`](reaudit/TIEBREAK-GROK.md), [`reaudit/TIEBREAK-KIMI.md`](reaudit/TIEBREAK-KIMI.md).

## What they disagreed about

| Theme | Grok | Kimi |
|---|---|---|
| Desktop BeeZee | B wins (real apply + nine families); A is preview-only | A’s preview-only is *safer*; B’s apply path hardcodes `owner@demo.local` |
| Tests | Quality even (both 5/6) | A’s 21 test files vs B’s zero is decisive |
| Inventory | B closer to DK/G/EW | A slightly ahead (device pairing UI) |
| Auth / stubs | B cleaner on stub claims | A cleaner on trust boundary |

## Effect on the official scorecard

**None for the published totals.** Test 1 stays on the GLM reaudit (**36.5 / 37**). Tests 2–3 already favor Sol. Even if we swapped Test 1 to Kimi’s preference (A), Sol would still win overall on detection + fix:

| Hypothetical Test 1 | Fable total | Sol total |
|---|---:|---:|
| GLM official (36.5 / 37) | 72.5 | **82** |
| Grok-style (32 / 37) | 68 | **82** |
| Kimi-style (33 / 29) | 69 | **74** |

Sol remains ahead in every reasonable reading of Test 1. The tie-break’s real lesson: **full-audit scores are reviewer-dependent**, even among neutrals looking at the same frozen trees.

## Interpretation

1. GLM compressed differences (identical category integers).  
2. Grok re-opened a B lead on desktop completeness vs overclaim.  
3. Kimi weighted tests + trust-boundary harder and flipped the call.  
4. Do not treat any single LLM full-audit as ground truth. Prefer multi-family panels, or human review, for release decisions.
