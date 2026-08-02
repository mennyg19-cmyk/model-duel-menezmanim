# Batch 09 — UR Requirements (Corrected Re-grade)

**Context:** arm-01, arm-03, and arm-04 were re-graded from their true, recovered codebases (`/tmp/tomchei-work/true-arms/{arm-01,arm-03,arm-04}/`) after discovering the original grading pass had accidentally graded arm-02's code under all three names. arm-02, arm-05, and arm-06 scores are copied through byte-for-byte unchanged from the original Pass A file.

## Changes vs original Pass A

**6 of 16 items had their winner change** as a result of grading the true codebases:

| Item | Name | Old winner | New winner | Why |
|---|---|---|---|---|
| UR-003 | Rate margin | arm-01 | arm-06 | Real arm-01's `selectShippingMargin()` takes a direct min/max across eligible carrier rates without first grouping to each carrier's best quote — functionally fine for single-quote-per-carrier inputs but less rigorous than arm-03/04's explicit per-carrier-best grouping, dropping it from 9 to 8. |
| UR-008 | Seasons | arm-01 | arm-04 | Real arm-04's `applyScheduledSeasonFlips()` is the only one of the three with explicit wall-clock→UTC timezone conversion, a single atomic transaction for the whole sweep, and documented overdue-vs-promised disambiguation logic — a genuine cut above the other two at 9 vs 8. |
| UR-009 | Delivery rules | arm-01 | arm-06 | Real arm-01 hard-blocks delivery ZIPs correctly but never validates the submitted Purim-week `deliveryDay` against an allowed-days list server-side — a real gap dropping it to 7, while arm-03/04 both validate it server-side. |
| UR-010 | Pickup | arm-01 | arm-06 | Real arm-01's pickup lifecycle is solid (inventory-gated readiness, same-transaction notify, expiry sweep) but arm-03/04's implementations are somewhat more complete (bulk operations, policy-driven door-list/unclaimed thresholds, explicit all-seasons sweep reasoning), edging arm-01 down to 8 vs their 9s. |
| UR-013 | Greeting cards | arm-01 | arm-06 | Real arm-01's `renderArtifactPdf()` hardcodes `LETTER` page size for every artifact kind including greeting cards — the same "separate file, not a separate physical format" gap originally flagged for arm-05 — while arm-03/04 both render cards at a dedicated card-stock page size. |
| UR-015 | Driver UX | arm-01 | arm-04 | Real arm-04's magic-link security is the most rigorously engineered of any arm graded: scrypt+per-link-salt PIN hashing (vs arm-01's plain SHA-256) and an exponential lockout backoff (10min→20min→...→12hr cap) vs arm-01's flat 15-minute lockout, plus automatic revocation-with-audit-trail when a link is reissued. |

All other 10 items kept their original winner, though several (UR-002, UR-004, UR-006, UR-007, UR-011, UR-012, UR-014) had scores or evidence for arm-01/03/04 rewritten to reflect their real, independent implementations rather than the mislabeled arm-02 code — notably **UR-004 (Map reroute)**, where the real arm-01 turned out to have a genuinely *better* implementation than what was previously credited: an actual Mapbox Static Images API map with per-stop pins (not a placeholder), scoring 9 instead of the original mislabeled 6.

## Full results (16 items, all 6 arms)

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up |
|---|---|---|---|---|---|---|---|---|---|
| UR-001 | Package entity | 9 | 9 | 9 | 9 | 7 | 9 | arm-06 | arm-03 |
| UR-002 | Method switch w/ charge preservation | 7 | 8 | 8 | 9 | 7 | 9 | arm-06 | arm-04 |
| UR-003 | Rate margin | 8 | 9 | 9 | 9 | 8 | 9 | arm-06 | arm-04 |
| UR-004 | Map reroute | 9 | 6 | 5 | 6 | 3 (MISSING/STUB) | 5 | arm-01 | arm-04 |
| UR-005 | Nightly print batch | 7 | 9 | 9 | 9 | 7 | 9 | arm-06 | arm-03 |
| UR-006 | Cart-first order entry | 9 | 9 | 9 | 9 | 5 | 9 | arm-01 | arm-04 |
| UR-007 | Repeat order | 9 | 8 | 9 | 9 | 7 | 9 | arm-06 | arm-01 |
| UR-008 | Seasons | 8 | 8 | 8 | 9 | 7 | 8 | arm-04 | arm-01 |
| UR-009 | Delivery rules | 7 | 9 | 9 | 9 | 8 | 9 | arm-06 | arm-04 |
| UR-010 | Pickup | 8 | 9 | 9 | 9 | 7 | 9 | arm-06 | arm-04 |
| UR-011 | Payments | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-06 |
| UR-012 | Roles | 7 | 8 | 8 | 8 | 8 | 8 | arm-05 | arm-04 |
| UR-013 | Greeting cards | 6 | 9 | 9 | 9 | 6 | 9 | arm-06 | arm-03 |
| UR-014 | Address book | 9 | 9 | 9 | 9 | 6 | 9 | arm-01 | arm-04 |
| UR-015 | Driver UX | 8 | 8 | 8 | 9 | 7 | 7 | arm-04 | arm-01 |
| UR-016 | Production | 7 (MISSING) | 7 | 7 (MISSING) | 7 (MISSING) | 7 | 7 | arm-05 | arm-01 |

## Per-item detail

### UR-001 — Package entity
- **arm-01** (9): `domain/package-grouping.ts` + `domain/package-operations.ts` (FOR-UPDATE-locked split/regroup) + `domain/package-stage.ts` (version-guarded forward-only transitions, full audit trail).
- **arm-03** (9): `lib/ops/packages.ts` — season-scoped row locking, dual audit trail (per-package + global), Result-typed errors.
- **arm-04** (9): `lib/fulfillment/package-edit.ts` — explicit money-preservation invariant on split/merge, deadlock-avoiding sorted claims.
- Winner: **arm-06** (tie at 9; stable pick). Runner-up: **arm-03**.

### UR-002 — Method switch with charge preservation
- **arm-01** (7): `domain/delivery.ts switchFulfillmentMethod()` — no active-route-stop guard at all.
- **arm-03** (8): `lib/routes/method-switch.ts` — blocks switching to ship while on a route stop, void inside tx.
- **arm-04** (9): `lib/fulfillment/method-switch.ts` — void outside tx (documented rationale), removes route stop on switch-away, version-guarded.
- Winner: **arm-06** (unchanged). Runner-up changes to **arm-04**.

### UR-003 — Rate margin
- **arm-01** (8): `domain/shipping.ts` — direct min/max, no explicit per-carrier grouping step.
- **arm-03** (9): `lib/shipping/margin.ts` — explicit per-carrier-best grouping before margin selection.
- **arm-04** (9): `lib/shipping/margin.ts` — multi-parcel eligibility handling, most rigorous.
- Winner: **arm-06** (changed from arm-01). Runner-up: **arm-04**.

### UR-004 — Map reroute
- **arm-01** (9): real Mapbox Static Images API map with per-stop pins, plus full suggest/confirm reroute flow.
- **arm-03** (5): no visual map, text-based reroute suggestions.
- **arm-04** (6): no visual map, server-validated suggestions with transaction management.
- Winner: **arm-01** (unchanged, now for the right reasons). Runner-up: **arm-04**.

### UR-005 — Nightly print batch
- **arm-01** (7): idempotent, real Unicode/Hebrew support, but hardcodes LETTER size for every artifact kind.
- **arm-03** (9): distinct LETTER/LABEL_4X6/CARD_5X7 page sizes.
- **arm-04** (9): Postgres advisory lock, distinct LETTER/CARD_STOCK/LABEL_STOCK sizes.
- Winner: **arm-06** (unchanged). Runner-up: **arm-03**.

### UR-006 — Cart-first order entry
- **arm-01** (9), **arm-03** (9), **arm-04** (9): all three implement a genuine three-way recipient picker and true component reuse between storefront and POS.
- Winner: **arm-01** (unchanged). Runner-up: **arm-04**.

### UR-007 — Repeat order
- **arm-01** (9), **arm-03** (9), **arm-04** (9): all three have cycle-safe replacement chains, price-smart defaults, customer review pages, and staff bulk-repeat with double-repeat guards.
- Winner: **arm-06** (unchanged). Runner-up: **arm-01**.

### UR-008 — Seasons
- **arm-01** (8), **arm-03** (8): solid single-open-season enforcement and scheduled flips.
- **arm-04** (9): timezone-aware conversion, atomic sweep transaction, documented overdue/promised disambiguation.
- Winner: **arm-04** (changed from arm-01). Runner-up: **arm-01**.

### UR-009 — Delivery rules
- **arm-01** (7): ZIP hard-block correct, but no server-side validation of the Purim-week delivery day.
- **arm-03** (9), **arm-04** (9): both validate the delivery day against an allowed-days list server-side.
- Winner: **arm-06** (changed from arm-01). Runner-up: **arm-04**.

### UR-010 — Pickup
- **arm-01** (8): full lifecycle present, solid but slightly thinner surface than the others.
- **arm-03** (9), **arm-04** (9): bulk operations, policy-driven thresholds, explicit all-seasons sweep reasoning.
- Winner: **arm-06** (changed from arm-01). Runner-up: **arm-04**.

### UR-011 — Payments
- **arm-01** (9), **arm-03** (9), **arm-04** (9): all three implement Stripe hosted checkout with explicit immediate capture, plus audited POS cash/check and refund flows.
- Winner: **arm-01** (unchanged). Runner-up: **arm-06**.

### UR-012 — Roles
- **arm-01** (7): grant/deny via plain `String[]` arrays on `StaffUser`, no dedicated override model.
- **arm-03** (8), **arm-04** (8): dedicated `PermissionOverride` model with a `PermissionEffect` enum; arm-04 additionally has an optional `reason` field.
- Winner: **arm-05** (unchanged). Runner-up: **arm-04**.

### UR-013 — Greeting cards
- **arm-01** (6): greeting memory field present, but every artifact (including cards) renders at the same LETTER page size — no card-stock format.
- **arm-03** (9), **arm-04** (9): both render greeting cards at a dedicated card-stock page size.
- Winner: **arm-06** (changed from arm-01). Runner-up: **arm-03**.

### UR-014 — Address book
- **arm-01** (9), **arm-03** (9), **arm-04** (9): all three have a Zod/CSV-validated legacy import pipeline with dry-run/commit separation; arm-04's is the most decomposed with a dedicated entity-map doc.
- Winner: **arm-01** (unchanged). Runner-up: **arm-04**.

### UR-015 — Driver UX
- **arm-01** (8): SHA-256 PIN hash, flat 5-attempt/15-minute lockout.
- **arm-03** (8): SHA-256 PIN hash, flat 3-attempt/60-second lockout, PIN also required on printed fallback.
- **arm-04** (9): scrypt+per-link-salt PIN hashing, exponential backoff lockout, automatic link revocation with audit trail on reissue.
- Winner: **arm-04** (changed from arm-01). Runner-up: **arm-01**.

### UR-016 — Production
- **arm-01** (7), **arm-03** (7), **arm-04** (7): all three have well-formed `InventoryItem`/`Ingredient`/BOM schema with confirmed zero UI references anywhere in the app — schema-only, exactly as originally scoped.
- Winner: **arm-05** (unchanged). Runner-up: **arm-01**.
