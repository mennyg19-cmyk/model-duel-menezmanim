# Composite decisions — best-of-six Tomchei rebuild

Source duel: `master-model-duel` run `2026-07-20-1748-tomchei-shabbos-website-model_duel`.

## Contenders

| Arm | Model | Duel total | Residual (T5) | Tree |
|---|---|---:|---|---|
| arm-01 | gpt-5.6-sol-medium | 72.0 | 3B · 14M · 25m | Clone cluster A |
| arm-02 | claude-fable-5-thinking-medium | 74.5 | 1B · 11M · 20m | Clone cluster A |
| arm-03 | cursor-grok-4.5-high | 69.0 | 0B · 5M · 10m | Clone cluster A |
| arm-04 | claude-opus-5-thinking-high | 73.0 | **0B · 3M · 14m** (14/15) | Clone cluster A (+tiny diffs) |
| arm-05 | terra-high (T4+T5 only) | 30.0 | 2B · 12M · 19m | Thin divergent |
| arm-06 | kimi-k3-max | 74.5 | 0B · 5M · 16m (13/15) | **Distinct full tree** |

Arms 01–04 share an **identical Prisma schema** and differ in ~9 files. For feature scoring they are one family; arm-04 is the cleanest residual inside that family.

## Base selection

**Base = arm-06 (kimi-k3-max).**

Why not arm-04 despite better residual score:

1. Item-by-item inventory grading crowns arm-06 on nearly every storefront, admin, fulfillment, package, shipping, pickup, and driver item.
2. arm-06 is a real independent codebase (417 TS files vs ~328 clone-cluster), not a near-fork.
3. Residual has **zero blockers**; remaining majors are fixable without a rewrite.
4. First-party session auth matches the duel’s resolved role model (customers ≠ staff) without Clerk vendor lock for local/test.

What we still take from arm-04:

- CSV formula-injection neutralization on exports (novel B-05, improved).
- Stripe webhook / safety-refund patterns noted as reference (already strong in arm-06).
- Residual discipline as the quality bar for follow-up fixes.

What we reject:

- **arm-05** — payment-void IDOR + dead notification path; incomplete inventory surface.
- Blind frankenstein merges across clone-cluster ↔ arm-06 (incompatible auth + schema).
- Inventory-grade “novel” claims whose files are **absent** from submitted workspaces.

## Hardening applied on top of arm-06

| Residual | Fix |
|---|---|
| MAJ-1 Admin CSRF | Middleware same-origin gate on `/api/admin` mutations |
| MAJ-2 Missing CSP | Baseline `Content-Security-Policy` in `next.config.mjs` |
| MAJ-3 `cancelDraft` race | Conditional `updateMany` with `status: DRAFT` inside the tx |
| MAJ-4 Dup `normalizedAddressKey` | Import shared helper from `lib/routes/geo.ts` |
| Novel B-05 CSV formulas | `csvCell` prefixes `=+-@` (and leading tab/CR/LF) with `'` |

Deferred (documented, not in this commit):

- MAJ-5 staff/customer session scaffolding dedupe (large auth refactor).
- Dedicated inventory overview / write-off UI (R-068…R-070 underbuilt in **all** arms).
- Nexternal migration pipeline (R-165/R-186 absent from submitted trees).

## Inventory target

Build against:

- `docs/duel/RECONCILED-INVENTORY.md` (192 codebase rows)
- `docs/duel/USER-RESOLVED-INVENTORY.md` (grill resolutions UR-001…UR-016 + G-001…G-030)

Full per-item scores: `docs/COMPOSITE-GRADING.md`.
