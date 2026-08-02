# Batch 07 — Data Model (R-137 … R-165) — Corrected Pass A

**Corrective re-grade.** The original Pass A grading for `arm-01`, `arm-03`, and `arm-04`
was performed against a workspace directory that had been silently overwritten with
`arm-02`'s code during a later test phase. Every score previously on record for those
three arms actually described `arm-02`'s implementation under the wrong name. This
document re-grades `arm-01`, `arm-03`, `arm-04` using their real, recovered
Test-4-complete codebases (`/tmp/tomchei-work/true-arms/arm-0N/`). Scores for `arm-02`,
`arm-05`, `arm-06` are copied through byte-for-byte unchanged from the original batch
file, since their on-disk workspace was always their own build.

## Changes vs original Pass A

**17 of 29 items (59%) had their winner change** as a direct result of grading the true
codebases instead of the mislabeled clone.

| Item | Old winner | New winner | Why |
|---|---|---|---|
| R-139 | arm-06 | **arm-04** | True arm-04 has 8 hand-written CHECK constraints (vs. ~3 for arm-06), all verified against a live shadow-DB `pg_constraint` query in CI — the most rigorous XOR/CHECK discipline of any arm. |
| R-140 | arm-06 | **arm-04** | True arm-04 has both a real `workflows/ci.yml` *and* a rigorous `migration-guard.ts` (prisma migrate diff + live constraint verification). True arm-03 by contrast has only a weak string-matching guard and no CI wiring at all. |
| R-149 | arm-01 | **arm-02** | The "three distinct join/snapshot tables" description in the old grading was actually arm-02's real code. True arm-01/03/04 all use a less-normalized options path (direct FK or Json snapshot, no dedicated options-join table), so arm-02's own always-correct code is now the genuine winner. |
| R-150 | arm-05 | **arm-04** | True arm-04 snapshots productNameSnapshot + unitPriceCents + optionsSnapshot + a pre-computed lineTotalCents — the most complete snapshot coverage found on this item. |
| R-152 | arm-06 | **arm-03** | True arm-03's `CachedPaymentStatus` enum has 5 values including OVERPAID, the richest order-level payment-status enum found, cleanly separated from the payment-record `PaymentState` enum. |
| R-153 | arm-06 | **arm-04** | True arm-04's `Package` model is a pure, complete field-by-field address snapshot with no FK dependency at all, plus an explicit comment on the immutability rationale. |
| R-154 | arm-06 | **arm-04** | True arm-04's `FulfillmentMethod` adds a `feeBasis` enum (NONE/PER_PACKAGE/PER_DESTINATION), making the fee-calculation *model itself* data-driven, not just method existence — a level of sophistication no other arm reaches. |
| R-155 | arm-01 | **arm-04** | The normalized `ShippingQuote -> ShippingQuoteOption[]` design credited to "arm-01" was really arm-02's code. True arm-01/03 both use a flat/Json structure. True arm-04 independently built an equally-strong normalized parent/child pair plus a LIVE/FALLBACK provenance field. |
| R-156 | arm-05 | **arm-04** | True arm-04 wires `PickupLocation` at *both* `Package.pickupLocationId` and `OrderLine.pickupLocationId` — more completely wired than any other arm, including the previous winner arm-05. |
| R-157 | arm-05 | **arm-04** | True arm-04 wires `PackageType -> ShipmentBox.packageTypeId -> ShipmentBox.packageId` *and* a direct `Package.packageTypeId` — a double-wired chain beating arm-05's single chain. |
| R-159 | arm-01 | **arm-02** | The "two separate dedicated Stripe models" description credited to "arm-01" was really arm-02's code. True arm-01/04 both merge session+intent into one row; true arm-03 also has two separate models and ties arm-02, but arm-02 is picked as the stable/already-verified pick. |
| R-160 | arm-01 | **arm-04** | True arm-04's `PaymentRefund` is a dedicated, separate, well-reasoned model — the most rigorous refund design found, versus true arm-01/03's cumulative `refundedCents` field. |
| R-161 | arm-01 | **arm-02** | The "real Zod-schema-per-key registry" credited to "arm-01" was really arm-02's code. True arm-01's `store-settings.ts` is just two hardcoded getter/setter pairs with no registry at all — a real STUB. arm-02's own code genuinely has the registry. |
| R-162 | arm-01 | **arm-04** | True arm-01's schema has a `failureCode` field but the actual geocode code never writes a failure row (throws instead). True arm-04 fully implements both success AND failure caching with genuinely distinct TTLs (90 days vs. 1 hour), confirmed in both schema comments and `lib/geocode-cache.ts`. |
| R-163 | arm-06 | **arm-03** | True arm-03's `lib/cron/runs.ts` implements real overlap-prevention (claimed-token slots with stale-inflight reaping) — the most operationally sophisticated cron-safety behavior found, edging out arm-06's simpler enum-typed log. |
| R-164 | arm-06 | **arm-04** | True arm-04's `lib/core/` directory has a dedicated file for every single named concern (dates, money, phone, normalize, season, result, etc.) plus a real `Result<T,E>` type — the cleanest, most complete helper-library organization found across all six arms. |
| R-165 | arm-06 | **arm-04** | True arm-04's `LEGACY-ENTITY-MAP.md` is 102 lines (5-9x longer than arm-01/03's true docs) backed by a genuinely separate `LegacyImportRun`/`LegacyImportRow` model system with a `NEEDS_MAPPING` verdict for ambiguous rows — the most complete standalone entity-map deliverable of any arm. |

**Net effect on win counts (this batch only):**

| Arm | Old wins | New wins |
|---|---:|---:|
| arm-01 | 7 | 1 |
| arm-02 | 0 | 3 |
| arm-03 | 0 | 2 |
| arm-04 | 0 | 12 |
| arm-05 | 4 | 1 |
| arm-06 | 18 | 10 |

`arm-04` (claude-opus-5-thinking-high) goes from **zero** correctly-attributed wins to
**12** once graded on its real code — it was previously invisible because every one of
its scores described arm-02's build instead. `arm-01` (gpt-5.6-sol-medium) drops from 7
wins to 1: several of its old "wins" (R-149, R-155, R-159, R-160, R-161) were also really
arm-02's code, and its own true build has a genuine BROKEN customer-dedupe bug (R-144)
and a stub settings implementation (R-161) that the old grading never saw.

## Full scoring table

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up |
|---|---|---|---|---|---|---|---|---|---|
| R-137 | Normalized relational app schema (Postgres/Prisma) | 7 | 8 (CLONE-TIE) | 8 | 8 | 7 | **9** | arm-06 | arm-04 |
| R-138 | DB-enforced lifecycle + category enums | 7 | 8 (CLONE-TIE) | 9 | 9 | 7 | **9** | arm-06 | arm-04 |
| R-139 | Inventory-target integrity (XOR CHECK) constraints | 8 | 8 (CLONE-TIE) | 8 | **10** | 8 | 9 | **arm-04** ⟲ | arm-06 |
| R-140 | Ordered migrations + schema-change guard (CI) | 7 | 6 (CLONE-TIE) | 3 (STUB) | **9** | 5 (BROKEN) | 7 | **arm-04** ⟲ | arm-06 |
| R-141 | Disposable migration verification harness | 4 (MISSING) | 6 (CLONE-TIE) | 4 | 8 | 7 | **8** | arm-06 | arm-04 |
| R-142 | Repeatable baseline seed | 7 | 7 (CLONE-TIE) | 8 | 8 | 7 | **8** | arm-06 | arm-04 |
| R-143 | Auditable staged import pipeline + atomic commits | 7 | 8 (CLONE-TIE) | 7 | 9 | 4 (THEATER) | **9** | arm-06 | arm-04 |
| R-144 | Customer records (normalized phone/email + dedupe) | 3 (BROKEN) | 8 (CLONE-TIE) | 6 (MISSING) | 8 | 7 | **8** | arm-06 | arm-04 |
| R-145 | Saved addresses with geocoding fields | 8 | 7 (CLONE-TIE) | 8 | 8 | 7 | **8** | arm-06 | arm-01 |
| R-146 | Season model gating catalog per year | **8** | 8 (CLONE-TIE) | 8 | 8 | 7 | 8 | arm-01 | arm-06 |
| R-147 | Product catalog schema (dims, inventory flags, kinds) | 6 | 8 (CLONE-TIE) | 8 | 9 | 6 | **9** | arm-06 | arm-04 |
| R-148 | Product options with price adjustments | 6 | 8 (CLONE-TIE) | 7 | 8 | 7 | **8** | arm-06 | arm-04 |
| R-149 | Normalized order tree (Order -> OrderLine -> add-ons) | 6 | **8** (CLONE-TIE) | 7 | 7 | 7 | 7 | **arm-02** ⟲ | arm-06 |
| R-150 | Price snapshots on order lines | 7 | 8 (CLONE-TIE) | 6 | **9** | 8 | 8 | **arm-04** ⟲ | arm-05 |
| R-151 | Sequential order numbers per season | 7 | 8 (CLONE-TIE) | 7 | 8 | 7 | **8** | arm-06 | arm-04 |
| R-152 | Cached derived payment status on orders | 7 | 8 (CLONE-TIE) | **9** | 8 | 5 | 8 | **arm-03** ⟲ | arm-06 |
| R-153 | Fulfillment groups (multi-destination) + snapshots | 7 | 8 (CLONE-TIE) | 8 | **9** | 5 | 8 | **arm-04** ⟲ | arm-03 |
| R-154 | Data-driven fulfillment methods | 7 | 8 (CLONE-TIE) | 6 | **9** | 7 | 8 | **arm-04** ⟲ | arm-06 |
| R-155 | Shipping quotes with selectable expiring options | 6 | **9** (CLONE-TIE) | 6 | 9 | 6 | 7 | **arm-04** ⟲ | arm-02 |
| R-156 | Pickup locations | 8 | 6 (CLONE-TIE) | 6 | **9** | 8 | 6 | **arm-04** ⟲ | arm-01 |
| R-157 | Package types + shipment boxes | 8 | 6 (CLONE-TIE) | 6 | **9** | 8 | 6 | **arm-04** ⟲ | arm-01 |
| R-158 | Unified inventory (products + add-ons, versioned) | 8 | 8 (CLONE-TIE) | 8 | 6 (MISSING) | **8** | 8 | arm-05 | arm-01 |
| R-159 | Stripe PaymentIntent modeling | 7 | **8** (CLONE-TIE) | 8 | 7 | 7 | 6 | **arm-02** ⟲ | arm-03 |
| R-160 | Payments (stripe/cash/check/comp) with posted/voided states | 7 | 8 (CLONE-TIE) | 7 | **9** | 6 | 8 | **arm-04** ⟲ | arm-06 |
| R-161 | Key-value settings store with typed registry | 4 (STUB) | **9** (CLONE-TIE) | 6 | 8 | 3 (BROKEN) | 9 | **arm-02** ⟲ | arm-06 |
| R-162 | Geocode cache with success/failure TTLs | 5 | 6 (CLONE-TIE) | 6 | **9** | 6 | 5 | **arm-04** ⟲ | arm-03 |
| R-163 | Cron/job run log | 7 | 7 (CLONE-TIE) | **8** | 8 | 7 | 7 | **arm-03** ⟲ | arm-04 |
| R-164 | Data-layer helper libraries (money/normalize/phone/ids/season/dates/result) | 6 | 5 (CLONE-TIE) | 7 | **9** | 5 | 8 | **arm-04** ⟲ | arm-06 |
| R-165 | Legacy→new data migration plan (documented entity map) | 5 | 5 (CLONE-TIE) | 4 | **10** | 1 (MISSING) | 9 | **arm-04** ⟲ | arm-06 |

`⟲` marks a winner change vs. the original (mislabeled) Pass A. Bold score = winning score for that item.

## Most impactful findings

- **`arm-04` was invisible in the original grading and is a top-tier data-model implementer.** Once graded on its own true code, arm-04 (claude-opus-5-thinking-high) wins 12 of 29 items outright — CHECK-constraint rigor (R-139), CI/migration tooling (R-140), price/address snapshotting (R-150, R-153), data-driven fee logic (R-154), shipping-quote normalization (R-155), pickup/package-type wiring (R-156, R-157), refund modeling (R-160), geocode TTL correctness (R-162), helper-library organization (R-164), and legacy entity-map documentation (R-165). Its schema is exceptionally well-commented, with nearly every field citing the requirement id it satisfies and the tradeoff considered.
- **`arm-01`'s true code has a real, unhandled bug in guest customer dedupe (R-144).** `app/api/order/drafts/route.ts` always calls `db.customer.create()` for a new guest draft with no email/phone lookup and no handling of the resulting unique-constraint violation — a guest re-entering an email already on file can trigger an unhandled 500. Combined with a settings "registry" that turned out to be two hardcoded getter/setter functions (R-161) and a `ShippingQuote`/`StripePaymentIntent` design that turned out to be flatter than described, several of arm-01's seven original wins in this batch were artifacts of grading arm-02's code under arm-01's name.
- **`arm-03`'s true code shows a genuinely sophisticated cron-overlap-prevention mechanism** (claimed-token slots with stale-inflight reaping in `lib/cron/runs.ts`) and the richest order-level payment-status enum (`CachedPaymentStatus` with 5 values including OVERPAID) — enough to win R-152 and R-163 outright — but its migration guard (`migrate-guard.mjs`) turned out to be pure string-pattern matching with no CI wiring at all, a real weak point on R-140.
- **`arm-02`, `arm-05`, `arm-06` were never mis-graded**, but three of arm-02's own real wins (R-149, R-159, R-161) were previously mislabeled as "arm-01"'s wins because the old grading was unknowingly describing arm-02's code twice under two different names.
