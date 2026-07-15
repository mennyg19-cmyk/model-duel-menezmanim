# Test 3 Verdict — Vague bug fix

**Date:** 2026-07-15  
**Orchestrator:** cursor-grok-4.5-high  
**Setup:** Identical bugged winner trees; 9 vague symptoms; fresh agents (Fable→rebuild-a, Sol→rebuild-b).

## Phone summary

**Both fixed all 9 seeded root causes.** Sol edged on minimality/rule adherence (Fable deleted unrelated `.cursor/rules` and added cookie `secure` beyond the HMAC fix; Sol expanded session lifetime/middleware for symptom 6 but stayed on-task). Running-app verification claimed by both.

## Per-bug root-cause check

| ID | Correct fix | Fable (A) | Sol (B) |
|---|---|---|---|
| L1 offset sign | `+` not `-` in snapshot | hit | hit |
| L2 server-wins | strategy check `"server-wins"` | hit | hit |
| L3 nearest round | `Math.round` | hit | hit |
| S1 members PATCH | `{ admin: true }` | hit | hit |
| S2 screen org bind | `payload.orgId !== org.id` | hit | hit |
| S3 timing-safe | `timingSafeEqual` | hit (+ secure cookie extras) | hit (+ expiry/middleware extras) |
| D1 weekEnd | `days: 6` | hit | hit |
| D2 mapColumns | `out[target]=row[source]` | hit | hit |
| D3 pull cursor | `gt` not `lt` | hit | hit |

## Scores (/30)

| Criterion | Max | Fable (A) | Sol (B) |
|---|---:|---:|---:|
| Root cause found | 12 | 12 | 12 |
| Fix quality / minimality | 8 | 6 | 7 |
| Rule adherence | 5 | 3 | 5 |
| No regressions | 5 | 5 | 5 |
| **Total** | **30** | **26** | **29** |

Minimality notes: Fable removed six always-on rule files from `.cursor/rules` (unrelated to symptoms). Sol’s symptom-6 fix also added seven-day token lifetime + middleware parity — related but broader than the seeded HMAC fault alone.

**Test 3 winner: rebuild-b fixer (Sol)**

## Sources

- `results/fixes/rebuild-a.md`
- `results/fixes/rebuild-b.md`
