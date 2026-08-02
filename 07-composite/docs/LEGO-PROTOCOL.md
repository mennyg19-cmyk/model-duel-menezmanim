# LEGO assembly protocol

Not phase grading. Not “pick one base tree.”

## Goal

For every inventory item, score how **each of the six arms** implemented it.
Take the best piece. Snap pieces together. If a winner doesn’t fit the
assembled whole, use the **next-best** score for that item.

## Arms

| Arm | Model |
|---|---|
| arm-01 | gpt-5.6-sol-medium |
| arm-02 | claude-fable-5-thinking-medium |
| arm-03 | cursor-grok-4.5-high |
| arm-04 | claude-opus-5-thinking-high |
| arm-05 | terra-high |
| arm-06 | kimi-k3-max |

Workspace roots (read-only source):

`/tmp/tomchei-work/duel/runs/2026-07-20-1748-tomchei-shabbos-website-model_duel/arms/arm-0N/workspace`

**CORRECTION (found after initial Pass A):** the on-disk workspace above is only
the arm's own build for **arm-02, arm-05, arm-06**. For **arm-01, arm-03, arm-04**
that path was overwritten during the Test 6 "clone winner, seed bugs, detect/fix"
exercise and now holds arm-02's code with a different name on it (confirmed via
git history: diffing each arm's own `P12 gated — Test 4 complete` commit against
the current on-disk tree shows 567/657/818 files of difference for arm-01/03/04
respectively, vs. 15–20 files for arm-02/05/06). The duel harness repo
(`/tmp/tomchei-work/duel`) was a shallow clone; `git fetch --unshallow` recovered
310 commits of full history. Each arm's **true, independent** Test-4-complete
build has been extracted from that history into:

`/tmp/tomchei-work/true-arms/arm-0N/` (arm-01 @ commit `efee323`, arm-02 @ `6b9b9b6`,
arm-03 @ `15dcf3f`, arm-04 @ `f23da8d`, arm-05 @ `8cb984a`, arm-06 @ `3d2a1d3`)

All Pass A grading for arm-01, arm-03, arm-04 must use `/tmp/tomchei-work/true-arms/`,
not the `arms/arm-0N/workspace` clone-cluster path. arm-02/arm-05/arm-06 scores from
the original Pass A pass remain valid as-is (their on-disk workspace already was
their own build).

## Inventory universe

| Set | Count | Source |
|---|---:|---|
| R-001 … R-192 | 192 | reconciled codebase inventory |
| UR-001 … UR-016 | 16 | user-resolved grill wins |
| G-001 … G-030 | 30 | merged grill checklist |
| **Total** | **238** | |

## Pass A — item alone (score × 6)

For each inventory ID, independently inspect each arm’s implementation.

Score **0–10** per arm on:

1. **Present** — real code path exists (not README theater)
2. **Complete** — covers the inventory requirement end-to-end
3. **Correct / safe** — auth, validation, money, concurrency where relevant
4. **Clean-code** — Rule of 2, naming, one pattern, no god-file sludge in *this* slice
5. **Tested / evidenced** — tests or runnable proof for this slice

Record per arm:

- score
- primary evidence paths
- 1-line note (stub / partial / solid / best)
- disqualify flags if any (`STUB`, `THEATER`, `BROKEN`, `MISSING`)

**Important:** even if arms 01–04 share a tree, still emit six scores. If code
is byte-identical, scores may tie — say so explicitly (`CLONE-TIE`).

Winner for Pass A = highest score. Ties broken by: cleaner evidence path →
fewer disqualify flags → prefer the arm that already won neighboring items
in the same module (LEGO cohesion hint only; does not override a clear score gap).

Also record **#2** (next-best) for Pass B fallback.

## Pass B — item in assembled context

After Pass A winners are chosen, attempt to assemble.

For each winner piece:

- Does it share the composite’s auth model?
- Does it share the composite’s schema / domain types?
- Does it follow the composite’s one-pattern-per-concern choices?
- Can it be imported without dragging a conflicting mini-framework?

If **NO** → reject this winner for assembly, take **#2**, re-check fit.
If #2 also fails, continue down the ranked list. If none fit, mark
`UNASSEMBLED` with reason (needs rewrite / adapter).

## Outputs

| File | Contents |
|---|---|
| `docs/lego/SCORES.json` | machine-readable matrix |
| `docs/lego/MATRIX.md` | human table: ID × 6 scores × winner × #2 × fit |
| `docs/lego/ASSEMBLY.md` | what was taken from whom; fallbacks; gaps |
| `docs/lego/batches/*.json` | per-batch grader outputs |

## What this is not

- Not reusing duel P1–P12 phase gate scores as item scores
- Not declaring one arm “overall winner” and copying its tree
- Not inventing scores without opening the code for that item
