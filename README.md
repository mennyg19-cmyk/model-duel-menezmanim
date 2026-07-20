# Model duel: Claude Fable 5 high vs GPT-5.6 Sol high

**A controlled rebuild contest on a real product inventory — with bug detection and vague-fix rounds.**

**Date:** 2026-07-15  
**Overall winner:** GPT-5.6 Sol high — **82 / 100** (reaudit) vs Claude Fable 5 high — **72.5 / 100**  
**Domain:** MenEZmanim (synagogue display / zmanim / admin / desktop kiosk stack)

**Next run (not started):** use the reusable harness → https://github.com/mennyg19-cmyk/agent-duel-harness (`start testing`). Historical v2 notes also in [`EXPERIMENT-PLAN-v2.md`](EXPERIMENT-PLAN-v2.md).

This repo is the **public write-up, scored artifacts, and both finished Test 1 source trees** for the v1 duel. What matters for replication and critique is here: prompts, rubrics, inventories, review reports, the score trail, and the actual apps each model shipped.

---

## Phone summary

Two flagship coding models each rebuilt the same product from a frozen feature inventory under identical rules. A third model (Grok) orchestrated and never built either arm.

| Test | Weight | What it measured | Fable | Sol |
|---|---:|---|---:|---:|
| 1 — Build | 40 | Inventory coverage, rules, phased delivery, craft | 36.5 | **37** |
| 2 — Detection | 30 | Find 9 seeded bugs on identical code | 10 | **16** |
| 3 — Vague fix | 30 | Symptom → root cause → minimal fix | 26 | **29** |
| **Total** | **100** | | **72.5** | **82** |

Sol won. The interesting part is *where*: the builds were nearly tied once we fixed a reviewer bias, but Sol pulled ahead hard on finding seeded bugs in the same codebase.

**Cost:** Sol is cheaper per token on list price, but this rebuild still cost more in Cursor dollars (~**$49** Sol vs ~**$14** Fable for Test 1 build). Details: [`docs/token-usage-from-csv.md`](docs/token-usage-from-csv.md).

---

## Why run this

Cursor and friends ship several “high” coding models. Marketing and vibe checks do not tell you:

1. Who follows a large inventory without inventing product direction?
2. Who finds real bugs when the tree is identical?
3. Who fixes from vague symptoms without thrashing unrelated files?

We wanted those three questions answered on one product, same day, same prompt, same rules.

**We did not** measure greenfield invention from a blank page. The contestant prompt told both models to harvest behavior from older MenEZmanim apps. Treat Test 1 as “inventory + reference harvest,” not “build from nothing.” That limitation is intentional honesty — see [Caveats](#caveats).

---

## Contenders and roles

| Role | Model (Cursor slug) |
|---|---|
| Arm A builder / detect / fix | `claude-fable-5-thinking-high` |
| Arm B builder / detect / fix | `gpt-5.6-sol-high` |
| Orchestrator (no building) | `cursor-grok-4.5-high` |
| Original mid-build reviewers | Terra → A, Sonnet → B *(later treated as unfair)* |
| Official Test 1 reaudit | `glm-5.2-high` (all 24 phase gates + both finals) |
| Tie-break full finals | `cursor-grok-4.5-high` + `kimi-k2.7-code` *(see results)* |

Mapping stayed hidden until the final report so blind reviewers could not score “their” brand.

---

## Design (locked before kickoff)

### Workspace layout

```
_experiment/
  inventory/          # frozen FEATURE + EDITOR inventories
  rebuild-a/          # Fable only
  rebuild-b/          # Sol only
  results/            # prompts, rubrics, reviews, verdicts
```

Contestants never ran `git`. The orchestrator committed and pushed.

### Rules for builders

Each arm got the same six always-on project rules (ponytail, clean-code, workflow, etc.) and **no** rebuild/review/subagent ceremony. They wrote their own `PHASE-PLAN.md`, built one phase at a time, stopped at each gate with running-app evidence in `STATUS.md`.

Identical prompt: [`00-design/contestant-prompt.md`](00-design/contestant-prompt.md).

### Scorecard (100 points)

Locked before anyone built: [`00-design/scorecard.md`](00-design/scorecard.md).

| Test | Weight |
|---|---:|
| Build quality vs inventory | 40 |
| Bug detection on identical seeded tree | 30 |
| Vague-symptom fixes | 30 |

Tie-break rule: fewer verified regressions across all three tests.

---

## The story, in order

### Act 1 — Both finish a 12-phase rebuild

Both arms completed all twelve phases. Mid-build, a reviewer scored each phase gate:

- rebuild-a reviewed by GPT Terra  
- rebuild-b reviewed by Claude Sonnet  

Then both contestant models (blind to mapping) rated **both** finished trees.

| Blind reviewer | Arm A (Fable) | Arm B (Sol) |
|---|---:|---:|
| Sol | 25 | 30 |
| Fable | 28 | 32 |
| **Mean** | **26.5** | **31** |

Both preferred B. Sol’s tree won on inventory depth (especially desktop/LAN/BeeZee). Fable’s tree kept real password auth and a larger test suite. Sol shipped a severe passwordless-login hole that never got fixed during Test 1.

Winner clone for later tests: **rebuild-b** copied over rebuild-a so detection/fix rounds used the same code.

Original write-up: [`02-test1-build/verdict-original.md`](02-test1-build/verdict-original.md).

### Act 2 — “Your reviewers were unfair”

After the first report, three methodological problems stood out:

1. **Split reviewers** — Terra graded A, Sonnet graded B. If one family is a harsher grader, the trail is biased.  
2. **Loser deleted before a single full-inventory pass** on both finals under one frozen rubric.  
3. **Not greenfield** — the prompt invited reference-app harvest; Sol’s own decision log admits using v1/v2/prior rebuild.

We could not un-ring the greenfield bell without a full locked re-run. We *could* fix (1) and (2).

### Act 3 — GLM reaudit of Test 1

We restored every phase-complete commit into audit snapshots (24 trees: A×12 + B×12). One third-party model — **GLM 5.2** — reviewed every gate and both P12 finals with the same rubric.

| | rebuild-a | rebuild-b |
|---|---:|---:|
| Full final /40 | **37** | **37** |
| Phase-gate mean (1–10 dims) | 8.51 | **8.65** |
| **Official revised Test 1** | **36.5** | **37** |

The 4.5-point original gap collapsed to half a point. The builds were much closer than the split-reviewer + contestant-blind pass suggested. Phase trail (especially late i18n / desktop completeness) broke the full-audit tie toward B.

Details: [`02-test1-build/verdict-reaudit.md`](02-test1-build/verdict-reaudit.md).

### Act 4 — Second neutrals on the two finals

GLM’s full finals tied at 37–37. We ran **Grok 4.5** and **Kimi K2.7** on the same two P12 snapshots (no reading GLM’s full reports).

| Reviewer | Arm A | Arm B | Call |
|---|---:|---:|---|
| GLM | 37 | 37 | tie (phase trail → B) |
| Grok | 32 | **37** | **B** (desktop depth vs A overclaim) |
| Kimi | **33** | 29 | **A** (tests + trust boundary) |

They disagreed. Official Test 1 stays on the GLM reaudit (36.5 / 37). Even under Kimi’s A preference, Sol still wins the overall 100-point card on Tests 2–3. Full write-up: [`02-test1-build/tiebreak-summary.md`](02-test1-build/tiebreak-summary.md).

### Act 5 — Test 2: find the bugs

Nine seeded bugs (logic / security / data × easy / medium / hard) injected into **identical** trees. Ledger stayed out of the contestant context. Each model reviewed one arm and wrote findings.

| | Fable | Sol |
|---|---:|---:|
| Seeded weighted (/18) | 4 | **10** |
| Legitimate extras (/6) | 6 | 6 |
| False-positive penalty | 0 | 0 |
| **Total /30** | **10** | **16** |

Sol hit the board offset/rounding pair, reversed conflict strategies, sync pagination reverse, and the editor RBAC hole. Fable hit the RBAC hole and a timing-safe compare miss. Neither found three of the nine (org bind on screen credentials, weekEnd off-by-one, inverted CSV column map).

This is the cleanest separation in the experiment: **same code, different eyes.**

[`03-test2-detection/VERDICT.md`](03-test2-detection/VERDICT.md)

### Act 6 — Test 3: vague symptoms only

Fresh agents. Nine symptom descriptions, no ledger. Grade: did they hit the seeded root cause, stay minimal, keep rules, avoid regressions?

| | Fable | Sol |
|---|---:|---:|
| Root causes (/12) | 12 | 12 |
| Minimality (/8) | 6 | 7 |
| Rules (/5) | 3 | 5 |
| No regressions (/5) | 5 | 5 |
| **Total /30** | **26** | **29** |

Both fixed all nine root causes. Fable lost points for deleting unrelated `.cursor/rules` files. Sol stayed closer to the fault surface (with one slightly broad session/middleware expansion).

[`04-test3-fix/VERDICT.md`](04-test3-fix/VERDICT.md)

---

## Official scorecard

| Test | Fable | Sol |
|---|---:|---:|
| 1 — Build (GLM reaudit + phase trail) | 36.5 | **37** |
| 2 — Detection | 10 | **16** |
| 3 — Vague fix | 26 | **29** |
| **Total /100** | **72.5** | **82** |

Original totals before reaudit: Fable 62.5, Sol 76. Reaudit raised both Test 1 scores and narrowed the build gap; Sol still wins on detection and fix discipline.

Full narrative report: [`05-final/FINAL-REPORT.md`](05-final/FINAL-REPORT.md).

---

## What we think this shows

1. **Reviewer identity moves build scores a lot.** Split Terra/Sonnet + contestant-as-judge produced a wide Test 1 gap; one GLM pass made the same trees nearly tied; Grok and Kimi then disagreed with each other (B vs A). If you publish “Model X builds better,” say who scored it — and prefer a multi-family panel.
2. **Detection separates models that look similar on delivery.** On identical seeded code, Sol found more logic/sync bugs. That skill is separate from shipping inventory IDs.
3. **Vague-fix quality is high on both, with different failure modes.** Both found every seeded root cause. Scope control (don’t delete the rulebook) still mattered.
4. **Auth debt can hide in a “winning” build.** Sol won Test 1 originally while shipping passwordless login. Winning a rebuild contest is not a release sign-off.
5. **Reference harvest contaminates “greenfield” claims.** Sol logged using prior apps. Fair for “rebuild MenEZmanim with help from the old tree”; unfair for “who invents better from an inventory alone.”
6. **Cheaper per token ≠ cheaper rebuild.** Sol’s list price is lower, but Cursor billed ~$49 vs ~$14 for the Test 1 builds — Sol still cost more because of volume.

---

## Caveats

| Caveat | Impact |
|---|---|
| Prompt allowed reference-app harvest | Test 1 ≠ pure greenfield |
| Mid-build reviewers originally differed by arm | Mitigated by GLM reaudit; originals kept as appendix |
| Loser tree was briefly deleted | Restored from git phase commits for reaudit |
| Sol hit `resource_exhausted` mid Phase 7 | Fresh Sol spawn resumed from WIP (logged) |
| Running-app evidence for reaudit snapshots | Static trees; STATUS/live claims trusted + code-checked |
| Seeded bug ledger not published | Prevents spoiling future runs; methodology described |
| N=1 product, N=1 day | Do not over-generalize to all coding tasks |

Deviations log: [`05-final/DEVIATIONS.md`](05-final/DEVIATIONS.md).

---

## Repo map (read in order)

```
README.md                 ← you are here (the story)
docs/methodology.md       ← blinding + scoring math
docs/token-usage.md       ← short answer + link to CSV analysis
docs/token-usage-from-csv.md ← windowed tokens aligned to git timeline
00-design/                ← scorecard, prompt, rubrics
01-inventory/             ← frozen feature lists
02-test1-build/           ← rebuild contest + reaudit + tie-break
03-test2-detection/       ← seeded bug hunt
04-test3-fix/            ← vague-symptom fixes
05-final/                 ← FINAL-REPORT, deviations, decision log
06-builds/                ← full P12 source trees (Fable + Sol finals)
```

Each numbered folder has its own short `README.md`.

**Published builds:** [`06-builds/fable-final/`](06-builds/fable-final/) and [`06-builds/sol-final/`](06-builds/sol-final/) are the Test 1 Phase-12 trees **before** the winner clone used for Tests 2–3. No `node_modules`.

**Not in this public repo:** Test 2/3 cloned/bugged trees, DB dumps, the seeded bug ledger, or secrets.

---

## How you could replicate

1. Freeze an inventory (or reuse ours under [`01-inventory/`](01-inventory/)).  
2. Lock a scorecard and contestant prompt before spawning builders ([`00-design/`](00-design/)).  
3. Give each model an isolated workspace; forbid git from contestants.  
4. Use **one** third-party reviewer family for all phase gates *or* accept bias and document it.  
5. Keep both finals until a single full-inventory pass exists.  
6. For detection/fix: clone the winner, seed bugs from a ledger the agents never see, score against the ledger.  
7. Publish mapping only after blind scores are written.

---

## Credits

- Orchestration and experiment design: Menny G + Cursor agent (`cursor-grok-4.5-high`)  
- Contestants: Anthropic Claude Fable 5 high, OpenAI GPT-5.6 Sol high (via Cursor)  
- Reaudit: GLM 5.2  
- Tie-break finals: Grok 4.5, Kimi K2.7  
- Product under test: MenEZmanim  

License for this documentation and artifact pack: MIT (see [`LICENSE`](LICENSE)). MenEZmanim application code remains under its own license and is not redistributed here.
