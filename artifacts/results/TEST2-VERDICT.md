# Test 2 Verdict — Bug detection

**Date:** 2026-07-15  
**Orchestrator:** cursor-grok-4.5-high  
**Model mapping:** withheld until FINAL-REPORT  
**Setup:** Identical winner clone in both arms; 9 seeded bugs (ledger in `.scratch/bug-ledger.md`, uncommitted).

## Phone summary

**Sol (rebuild-b) found more seeded bugs** than Fable (rebuild-a). Both found the editor RBAC hole (S1). Sol also caught the sync pagination reverse (D3), reversed conflict strategies (L2), and the board offset/rounding pair (L1+L3). Neither found S2 (missing orgId bind on screen credentials), D1 (weekEnd off-by-one), or D2 (inverted CSV column map). Both reported many legitimate extras (passwordless auth, etc.).

## Seeded-bug hits

| ID | Level | Weight | Fable (A) | Sol (B) |
|---|---|---:|---|---|
| L1 | easy | 1 | miss | **hit** (finding 8) |
| L2 | medium | 1.5 | miss | **hit** (finding 6) |
| L3 | hard | 2 | miss | **hit** (finding 8) |
| S1 | easy | 1 | **hit** (finding 3) | **hit** (finding 3) |
| S2 | medium | 1.5 | miss | miss |
| S3 | hard | 2 | **hit** (finding 8) | miss |
| D1 | easy | 1 | miss | miss |
| D2 | medium | 1.5 | miss | miss |
| D3 | hard | 2 | miss | **hit** (finding 5) |
| **Raw** | | **13.5** | **3.0** | **7.5** |
| **Normalized /18** | | | **4.0** | **10.0** |

Normalize: `raw / 13.5 * 18`.

## Legitimate extras /6

Both reports listed real pre-existing issues (passwordless login, register→super-admin, fallback secrets, sync journal not wiring domain tables, etc.). Cap applied.

| Arm | Extras note | Points |
|---|---|---:|
| Fable (A) | 7+ real extras beyond ledger | **6** |
| Sol (B) | 9+ real extras beyond ledger | **6** |

## Over-caution / false positives (−6 max)

| Arm | Assessment | Points |
|---|---|---:|
| Fable (A) | No clear false positives | **0** |
| Sol (B) | No clear false positives (architecture gaps treated as real defects) | **0** |

## Official Test 2 points (of 30)

| Arm / reviewer | Seeded /18 | Extras /6 | FP penalty | **Total /30** |
|---|---:|---:|---:|---:|
| rebuild-a (Fable detect) | 4.0 | 6 | 0 | **10.0** |
| rebuild-b (Sol detect) | 10.0 | 6 | 0 | **16.0** |

**Test 2 winner: rebuild-b reviewer (Sol)**

## Sources

- `results/detection/rebuild-a.md` — Fable
- `results/detection/rebuild-b.md` — Sol

## Next

Test 3: keep identical bugged trees; spawn fresh Fable→A and Sol→B with vague symptom prompts only; grade fixes against ledger.
