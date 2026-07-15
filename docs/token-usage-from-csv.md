# Token usage from Cursor CSV (aligned to experiment)

**Source:** Cursor dashboard export `usage-events-2026-07-15.csv`  
**Method:** Match each row’s UTC timestamp to git committer times on the MenEZmanim experiment branch (Israel = UTC+3).  
**Contestant builder slugs:** `claude-fable-5-thinking-high`, `gpt-5.6-sol-high`

## Phone summary

| Role | Window | Total tokens\* | Output tokens | Billing events |
|---|---|---:|---:|---:|
| **Fable build** | scaffold → blind start | **7.7M** | 76k | **1** |
| **Sol build** | scaffold → blind start | **73.4M** | 179k | **6** |
| Fable detect (Test 2) | 13:19–13:26 UTC | 1.9M | 17k | 1 |
| Sol detect (Test 2) | 13:19–13:26 UTC | 2.0M | 12k | 1 |
| Fable fix (Test 3) | 13:26–13:40 UTC | 4.1M | 30k | 1 |
| Sol fix (Test 3) | 13:26–13:40 UTC | 6.7M | 14k | 1 |

\*Cursor **Total Tokens** includes huge **Cache Read** counts. Treat Total as “billable/context volume,” not “words the model wrote.” **Output** is the cleaner “generation” signal.

**Sol’s Test 1 build is ~9.5× Fable on Total** and **~2.3× on Output**, in a window that matches the rebuild (Sol also ran longer — Phase 12 finished ~70 minutes after Fable, plus a mid–Phase 7 resume after `resource_exhausted`).

## Dollar cost (Cursor `Cost` column)

Sol is **cheaper per token** on API list rates (about **$5 / $30** per MTok input/output vs Fable’s about **$10 / $50**). On this run that did **not** make Sol the cheaper build — volume won.

| Window | Fable (Cursor $) | Sol (Cursor $) |
|---|---:|---:|
| **Test 1 build** (scaffold → blind) | **~$14** (`$13.65` one row) | **~$49** (six rows summed) |
| Test 2 detect | $2.52 | $2.50 |
| Test 3 fix | $6.84 | $4.62 |
| All contestant-high rows that day (incl. blind) | ~$42 | ~$61 |

Source: same CSV `Kind=On-Demand` / `Cost` fields on the `*-thinking-high` / `sol-high` rows listed in the event log below. Pre-scaffold Fable `$2.29` is **not** in the Test 1 build total.

**Takeaway:** cheaper unit price ≠ cheaper job. Sol’s rebuild still cost ~**3.5×** Fable in Cursor dollars.

---

## Timeline anchors (git)

| Event | Israel (UTC+3) | UTC |
|---|---|---|
| Experiment scaffold | 09:39 | 06:39 |
| Fable Phase 12 + review | 14:24–14:27 | 11:24–11:27 |
| Sol Phase 12 complete | 15:31 | 12:31 |
| Blind finals start | 15:55 | 12:55 |
| Test 1 verdict + clone + seed | 16:19 | 13:19 |
| Test 2 verdict | 16:26 | 13:26 |
| Original experiment complete | 16:40 | 13:40 |
| GLM reaudit | 18:36–18:47 | 15:36–15:47 |
| Kimi tie-break row | 18:54 | 15:54 |

CSV event times for Fable/Sol **line up with these windows** (see event log below). GLM and Kimi clusters also land on the reaudit/tie-break hour.

---

## Alignment notes (read these)

1. **Fable’s entire multi-hour build appears as a single CSV row** at `06:39:55Z` (7.7M total). Cursor is aggregating Claude usage coarsely here. Sol shows six separate rows across the morning/afternoon. Event count is **not** “number of phases.”
2. **Total ≫ Output** because of cache reads (often >95% of Total). Comparing models on Total alone overstates absolute spend; ratios still show Sol heavier.
3. **Orchestrator Grok** burned **~116M Total** during the build window alone — not attributed to either contestant.
4. **Reviewers during build window:** Terra-high **18.3M**, Sonnet-high **65.9M**. Sonnet (reviewing Sol’s arm) was itself very expensive — another reason not to treat “day total for Claude” as Fable-only.
5. **Excluded from contestant builds:** `claude-opus-4-8-*` (other work), `*-medium` tiers, one `fable-medium` during publish/reaudit era, pre-scaffold noise.

---

## Contestant event log (every high-tier row)

### `claude-fable-5-thinking-high`

| UTC | Israel | Phase (inferred) | Total | Output | Cursor $ |
|---|---|---|---:|---:|---:|
| 06:22:11 | 09:22 | Pre-scaffold (excluded from build total) | 0.62M | 9k | $2.29 |
| 06:39:55 | 09:39 | **Test 1 build (whole arm, one line)** | **7.71M** | **76k** | **$13.65** |
| 12:55:51 | 15:55 | Blind final | 2.31M | 9k | $4.71 |
| 13:00:47 | 16:00 | Blind final (2nd) | 10.07M | 26k | $12.03 |
| 13:19:29 | 16:19 | Test 2 detect | 1.86M | 17k | $2.52 |
| 13:26:10 | 16:26 | Test 3 fix | 4.06M | 30k | $6.84 |

### `gpt-5.6-sol-high`

| UTC | Israel | Phase (inferred) | Total | Output | Cursor $ |
|---|---|---|---:|---:|---:|
| 06:39:50 | 09:39 | Test 1 build | 7.40M | 34k | $6.02 |
| 10:10:35 | 13:10 | Test 1 build | 21.78M | 52k | $13.83 |
| 11:32:14 | 14:32 | Test 1 build | 7.85M | 29k | $5.56 |
| 11:48:06 | 14:48 | Test 1 build (editor / P7 era) | 18.84M | 40k | $12.29 |
| 12:11:44 | 15:11 | Test 1 build | 16.39M | 13k | $10.11 |
| 12:29:38 | 15:29 | Test 1 build (near P12) | 1.16M | 9k | $1.60 |
| 12:55:39 | 15:55 | Blind final | 2.57M | 8k | $2.63 |
| 13:00:33 | 16:00 | Blind final (2nd) | 3.80M | 9k | $2.28 |
| 13:19:28 | 16:19 | Test 2 detect | 2.00M | 12k | $2.50 |
| 13:26:10 | 16:26 | Test 3 fix | 6.74M | 14k | $4.62 |

---

## Windows × roles

| Window (UTC) | Fable-high | Sol-high | Terra | Sonnet | Grok | GLM | Kimi |
|---|---:|---:|---:|---:|---:|---:|---:|
| Build 06:39–12:55 | 7.7M | **73.4M** | 18.3M | 65.9M | 115.7M | — | — |
| Blind 12:55–13:19 | 12.4M | 6.4M | — | — | 2.1M | — | — |
| Detect 13:19–13:26 | 1.9M | 2.0M | — | — | 0.8M | — | — |
| Fix 13:26–13:40 | 4.1M | 6.7M | — | — | 0.9M | — | — |
| GLM reaudit 15:36–15:47 | — | — | 1.9M\* | — | 7.3M | **31.6M** | — |
| After reaudit | — | — | — | — | 5.7M | — | **3.0M** |

\*Terra rows during reaudit window are incidental/orchestrator-adjacent, not the original A-phase reviewer pass.

---

## What we’d claim in a friend write-up

> On Cursor’s 2026-07-15 usage export, restricted to the Test 1 rebuild window (git scaffold → blind finals), **Sol-high used ~73M total tokens / ~179k output / ~$49** across 6 billed events, while **Fable-high used ~7.7M total / ~76k output / ~$14** on a single aggregated event. Sol is cheaper per token on list price; volume still made Sol the more expensive rebuild (~3.5× in Cursor dollars). Detection was similar (~$2.50 each). Vague-fix: Fable $6.84 vs Sol $4.62. Cache reads dominate Total; Output is the fairer generation metric. Billing granularity for Fable is coarse — do not read “1 event” as “1 phase.”

---

## Raw CSV

Not committed (personal billing export). Derived numbers above are what the public repo keeps.
