# Batch 10 (G-checklist) — Corrected Pass A Grades

This is a corrective re-grade of the G-001..G-030 inventory batch. arm-01, arm-03, and arm-04 were previously graded against the wrong codebase (a workspace mix-up silently substituted arm-02's code for all three). This file re-grades arm-01/03/04 against their true, recovered codebases at `/tmp/tomchei-work/true-arms/{arm-01,arm-03,arm-04}/`. Scores for arm-02, arm-05, and arm-06 are carried through unchanged from the original batch file.

## Changes vs original Pass A

**16 of 30 items changed winner** as a result of grading arm-01/03/04's true codebases instead of the mis-substituted arm-02 code.

| Item | Name | Old winner | New winner | Why |
|---|---|---|---|---|
| G-001 | Hybrid fulfillment (print-first + optional digital stages) | arm-06 | arm-03 | arm-03's true build scores 9 (row-lock+version transitionPackage with an explicit stage-unchanged proof helper); arm-01's true build is a real but slightly less airtight 8, no longer a CLONE-TIE with arm-06. |
| G-002 | Print slips/labels/cards without marking shipped | arm-06 | arm-01 | Once graded on its own real code, arm-01 ties the field at 9 (idempotent runKey-guarded print batches with zero package writes); arm-01 wins the arbitrary tie-break over arm-03/04/06 at the same score. |
| G-004 | Package-level status and printing | arm-06 | arm-03 | arm-01's true board is hard-capped at take:200 with no real pagination/filter (drops to 7), while arm-03's true build has genuine page/pageSize/stage/method filters (9) and wins the tie-break over arm-04/06. |
| G-005 | Staff method switch; preserve paid charge | arm-06 | arm-04 | arm-04's true method-switch is version-guarded AND cleans up the route stop on switch-away (9); arm-01/03's true builds lack a version guard on the switch itself (7 each), so arm-04 now wins over arm-06. |
| G-008 | Finished-package inventory (v1 primary) | arm-05 | arm-01 | arm-01's true inventory reservation code is a strong 9 (guarded atomic SQL UPDATE); it now wins the tie over arm-03/04 at the same score, displacing arm-05 which was previously winning by default. |
| G-009 | BOM/ingredients — schema yes, UI hidden; manager enables later | arm-01 | arm-04 | arm-04's schema has the clearest documented 'schema-only, UI hidden' intent (explicit doc comment tied to G-009); arm-01/03's true schemas lack that documentation (7 each), so arm-04 now wins over arm-06. |
| G-010 | Assembly batches consume supplies → finished stock | arm-05 | arm-01 | All six arms are near-total misses on this item (no arm ever wires assembly-batch consumption into inventory); arm-01's true AssemblyBatchUse schema shape is marginally the best-designed of the low scores (2, tied with arm-04/05/06), winning the arbitrary tie-break. |
| G-017 | Staff-scheduled bulk delivery + notify customer | arm-06 | arm-03 | arm-03's true bulk-delivery sweep is a real season-wide, per-customer-deduped implementation (9); arm-01's true version is scoped to one package per call despite the name (5), so arm-03 now wins over arm-06. |
| G-020 | Per-recipient greeting memory | arm-01 | arm-03 | arm-03's true build has a dedicated RecipientGreetingMemory model keyed by a hashed recipient identity (survives address edits, 9); arm-01's true build is a plainer address-field version (8), so arm-03 now wins over arm-01. |
| G-021 | Greeting cards: order default + overrides; separate card PDF | arm-06 | arm-04 | arm-04's true greeting-card pipeline explicitly skips blank cards rather than printing them (9), edging out arm-01/03's true builds (8 each) and arm-06 in the tie-break. |
| G-023 | Map suggest + confirm reroute; void label | arm-06 | arm-04 | arm-04's true reroute logic row-locks the route before appending a stop, avoiding a sequence collision on simultaneous reroutes (9); arm-01/03's true builds lack that guard (8 each), so arm-04 now wins over arm-06. |
| G-024 | Large-scale ops (1k orders / 5k packages / 10+ staff) | arm-06 | arm-04 | arm-04's true fixtures-scale.ts seeds 1,000 orders/5,000 packages and runs ANALYZE afterward (9); arm-01's true build has NO scale-seed script at all, only an unrelated single-row concurrency probe (2, MISSING/STUB) -- arm-04 now wins over arm-06. |
| G-025 | Driver mobile web + print fallback; magic-link auth | arm-01 | arm-04 | arm-04's true magic-link auth uses a salted PIN hash with exponential lockout backoff and TTL expiry (9), the most hardened of the three; arm-01's true build (8) is solid but plainer, so arm-04 now wins over arm-01. |
| G-027 | Per-package delivery: staff-routed days; day-of notification | arm-01 | arm-03 | arm-03's true route-start logic has an explicit crash-recovery path for a day-of notify that fails mid-send (9); arm-01's true build (8) lacks that recovery path, so arm-03 now wins over arm-01. |
| G-029 | Historical data migration (messy export + cleanup) | arm-06 | arm-04 | arm-04's true legacy-import pipeline is the most modularized of the three (5 dedicated files with named verdict categories, 9); arm-01's true build (8) is solid but a single-module design, so arm-04 now wins over arm-06. |
| G-030 | Mapbox admin map; Google Maps deep links for drivers | arm-06 | arm-01 | arm-01's true build has a REAL Mapbox Static Images map with pin markers (8); arm-03's true 'Mapbox-style' admin map turns out to be a fully offline fake geocoder that never calls Mapbox at all (3, STUB), so arm-01 now wins over arm-06. |

Root cause pattern: most changes stem from arm-01/03/04 turning out to be genuinely independent, high-quality implementations (not clones), so real per-item strengths/weaknesses now surface instead of the flat "CLONE-TIE" scores the mix-up produced. A few changes (G-009, G-010, G-024, G-030) reflect real gaps that the old mislabeled grading had hidden or misattributed — e.g. arm-01's true build has no scale-seed script at all (G-024) and arm-03's true "Mapbox-style" admin map is actually a fully offline fake geocoder (G-030), findings that could never have surfaced while all three arms were silently being graded as arm-02's code.

## Full item-by-item results

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up | Winner changed? |
|---|---|---|---|---|---|---|---|---|---|---|
| G-001 | Hybrid fulfillment (print-first + optional digital stages) | 8 | 8 [CLONE-TIE] | 9 | 9 | 7 | 9 | arm-03 | arm-04 | YES (arm-06→arm-03) |
| G-002 | Print slips/labels/cards without marking shipped | 9 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-01 | arm-03 | YES (arm-06→arm-01) |
| G-003 | Default package grouping + staff split | 9 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-01 | arm-03 | no |
| G-004 | Package-level status and printing | 7 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-03 | arm-04 | YES (arm-06→arm-03) |
| G-005 | Staff method switch; preserve paid charge | 7 | 9 [CLONE-TIE] | 7 | 9 | 7 | 9 | arm-04 | arm-06 | YES (arm-06→arm-04) |
| G-006 | Shipping rate-shop + margin + Shippo labels | 9 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-01 | arm-03 | no |
| G-007 | Stripe hosted checkout, immediate capture | 9 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-01 | arm-03 | no |
| G-008 | Finished-package inventory (v1 primary) | 9 | 9 [CLONE-TIE] | 9 | 9 | 9 | 8 | arm-01 | arm-03 | YES (arm-05→arm-01) |
| G-009 | BOM/ingredients — schema yes, UI hidden; manager enables later | 7 | 9 [CLONE-TIE] | 7 | 9 | 7 | 9 | arm-04 | arm-06 | YES (arm-01→arm-04) |
| G-010 | Assembly batches consume supplies → finished stock | 2 [MISSING,STUB] | 1 [MISSING,STUB] | 1 [MISSING,STUB] | 2 [MISSING,STUB] | 2 [MISSING,STUB] | 2 [MISSING,STUB] | arm-01 | arm-04 | YES (arm-05→arm-01) |
| G-011 | Repeat-order draft + review page | 9 | 9 [CLONE-TIE] | 9 | 9 | 7 | 9 | arm-01 | arm-03 | no |
| G-012 | Unmapped items: must pick or remove; price-smart suggestions | 9 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-01 | arm-03 | no |
| G-013 | Admin replacement mappings per catalog item | 9 | 9 [CLONE-TIE] | 8 | 9 | 7 | 9 | arm-01 | arm-04 | no |
| G-014 | Per-package delivery zip hard-block | 9 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-01 | arm-03 | no |
| G-015 | Bulk fee per destination; per-package fee per recipient | 9 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-01 | arm-03 | no |
| G-016 | Staff/Manager roles + per-person permission toggles | 6 | 8 [CLONE-TIE] | 7 | 8 | 7 | 9 | arm-06 | arm-04 | no |
| G-017 | Staff-scheduled bulk delivery + notify customer | 5 | 8 [CLONE-TIE] | 9 | 9 | 7 | 9 | arm-03 | arm-04 | YES (arm-06→arm-03) |
| G-018 | Cart-first order entry + three-way recipient picker | 8 | 8 [CLONE-TIE] | 8 | 8 | 7 | 8 | arm-01 | arm-03 | no |
| G-019 | Auto-save new recipients to address book; staff edit with audit | 8 | 8 [CLONE-TIE] | 8 | 7 | 8 | 9 | arm-06 | arm-01 | no |
| G-020 | Per-recipient greeting memory | 8 | 8 [CLONE-TIE] | 9 | 9 | 7 | 8 | arm-03 | arm-04 | YES (arm-01→arm-03) |
| G-021 | Greeting cards: order default + overrides; separate card PDF | 8 | 8 [CLONE-TIE] | 8 | 9 | 7 | 9 | arm-04 | arm-06 | YES (arm-06→arm-04) |
| G-022 | Off-season + full catalog archive | 8 | 8 [CLONE-TIE] | 8 | 8 | 7 | 8 | arm-01 | arm-03 | no |
| G-023 | Map suggest + confirm reroute; void label | 8 | 8 [CLONE-TIE] | 8 | 9 | 8 | 9 | arm-04 | arm-06 | YES (arm-06→arm-04) |
| G-024 | Large-scale ops (1k orders / 5k packages / 10+ staff) | 2 [MISSING,STUB] | 7 [CLONE-TIE] | 7 | 9 | 5 | 9 | arm-04 | arm-06 | YES (arm-06→arm-04) |
| G-025 | Driver mobile web + print fallback; magic-link auth | 8 | 9 [CLONE-TIE] | 8 | 9 | 8 | 9 | arm-04 | arm-06 | YES (arm-01→arm-04) |
| G-026 | Pickup when inventory available; ready notify; door list | 8 | 9 [CLONE-TIE] | 8 | 8 | 8 | 9 | arm-06 | arm-02 | no |
| G-027 | Per-package delivery: staff-routed days; day-of notification | 8 | 9 [CLONE-TIE] | 9 | 9 | 8 | 9 | arm-03 | arm-04 | YES (arm-01→arm-03) |
| G-028 | POS check/cash payments | 9 | 9 [CLONE-TIE] | 8 | 9 | 8 | 9 | arm-01 | arm-04 | no |
| G-029 | Historical data migration (messy export + cleanup) | 8 | 9 [CLONE-TIE] | 8 | 9 | 8 | 9 | arm-04 | arm-06 | YES (arm-06→arm-04) |
| G-030 | Mapbox admin map; Google Maps deep links for drivers | 8 | 7 [CLONE-TIE] | 3 [STUB] | 6 | 7 | 8 | arm-01 | arm-06 | YES (arm-06→arm-01) |

## Detailed notes (arm-01, arm-03, arm-04 only — freshly re-graded)

The table above is compact; full notes and evidence paths for every arm-01/03/04 score are below, grouped by item. arm-02/05/06 notes are unchanged from the original batch file and are omitted here for brevity (see the original `batches/batch-10-g-checklist.json`).

### G-001 — Hybrid fulfillment (print-first + optional digital stages)

**Winner: arm-03** · Runner-up: arm-04

- **arm-01** (score 8): domain/package-stage.ts ALLOWED_PACKAGE_TRANSITIONS enum-based print-first spine; domain/print-batches.ts creates PrintArtifact rows only (zero package writes); domain/delivery-notifications.ts + messaging-outbox.ts is a fully separate opt-in digital layer via captureCustomerNotification/enqueueMessage. Real, complete, independently-built spine.
- **arm-03** (score 9): lib/orders/package-stages.ts ALLOWED map + row-lock+version transitionPackage(); lib/ops/print-batch.ts only creates PrintBatch/PrintArtifact rows (measureStagesUnchanged() proof helper); lib/notify/outbox.ts is a fully separate outbox-pattern digital layer. Cleanest of the three true builds, with an explicit stage-unchanged verification step.
- **arm-04** (score 9): lib/fulfillment/package-stages.ts explicitly allows stage-skipping (NEW->PACKED) via rank-based check, documented G-001/G-004 rationale; lib/print/print-batch-service.ts print-only (zero package writes); lib/notifications/{dispatch,outbox}.ts is a separate outbox sweep layer.

### G-002 — Print slips/labels/cards without marking shipped

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): domain/print-batches.ts createNightlyPrintBatch/reprintFilingGroup/reprintOrder: zero package.update calls anywhere, idempotent via runKey unique constraint + P2002 replay. Stage advance is the fully separate advancePackageStage().
- **arm-03** (score 9): lib/ops/print-batch.ts: zero Package writes, explicit measureStagesUnchanged() helper proves stages didn't move across the batch, PDFs rendered outside the DB transaction to avoid holding locks. Most rigorously self-verifying of the three.
- **arm-04** (score 9): lib/print/print-batch-service.ts + print-filing.ts: print-only, no Package writes; PRINT_ARTIFACTS=['slips','labels','cards'] cleanly separated; explicit doc comment about reprints not reprinting other kinds.

### G-003 — Default package grouping + staff split

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): domain/package-grouping.ts createPackageGroupingKey() (recipient/address/method/greeting); domain/package-operations.ts splitPackage()/regroupPackages() use row-level FOR UPDATE locks + full PackageAudit trail on both sides inside one transaction.
- **arm-03** (score 9): lib/orders/grouping.ts computes the same 4-field key; lib/ops/packages.ts split/merge with row locks, feeds the paginated board (see G-004).
- **arm-04** (score 9): lib/orders/grouping.ts + lib/fulfillment/packages.ts move/split with version-guarded updateMany (STALE_VERSION) and audit.

### G-004 — Package-level status and printing

**Winner: arm-03** · Runner-up: arm-04

- **arm-01** (score 7): domain/package-stage.ts advancePackageStage() version-guarded + audit; app/(admin)/admin/fulfillment/page.tsx is a real board with channel rollups, BUT hard-capped at take:200 with no true pagination or server-side stage/method filter (client-side only).
- **arm-03** (score 9): lib/orders/package-stages.ts transitionPackage() row-lock+version-guarded+audit; lib/ops/packages.ts packageBoard() has real page/pageSize/stage/fulfillmentMethodCode filters plus a groupBy-based channel-summary rollup.
- **arm-04** (score 9): lib/fulfillment/package-stages.ts (rank-based, skip-allowed) + packages.ts version-guarded updateMany; lib/fulfillment/package-board.ts has real skip/take pagination with an explicit tie-break comment to prevent page-swap races, plus channel-summary.ts rollups.

### G-005 — Staff method switch; preserve paid charge

**Winner: arm-04** · Runner-up: arm-06

- **arm-01** (score 7): domain/delivery.ts switchFulfillmentMethod(): voids purchased label before the transaction, blocks switch once SENT/PICKED_UP, fee explicitly untouched + audited as paidChargePreserved:true. Missing: no optimistic version-guard on the package.update itself, and no route-stop cleanup/guard when switching away from a delivery method.
- **arm-03** (score 7): lib/routes/method-switch.ts: blocks switch on active route stop ('Remove from route before switching to shipping'), voids label inside the transaction, explicit balancePreserved audit. Missing: no version-guard on the update (plain update by id, not updateMany+version).
- **arm-04** (score 9): lib/fulfillment/method-switch.ts: version-guarded updateMany (STALE_VERSION), voids label outside the transaction (avoids holding a DB tx across a carrier call), deletes an existing routeStop when switching off delivery, extensive commented rationale. Most complete and safest of the three.

### G-006 — Shipping rate-shop + margin + Shippo labels

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): domain/shipping.ts selectShippingMargin(): per-eligible-rate reduce to cheapest (purchase) and highest (charge); quotePackage/buyPackageLabel/quoteDraftShipping all route through it consistently.
- **arm-03** (score 9): lib/shipping/margin.ts selectMargin(): ground-equivalent filter, charge=max/buy=min, documented UR-003/G-006; quoteMargin() wraps live Shippo quotes.
- **arm-04** (score 9): lib/shipping/margin.ts planMargin()/combineParcelRates(): identical charge-highest/buy-cheapest logic across multi-parcel shipments, ties broken on faster service then carrier name; quote-service.ts wires it into checkout.

### G-007 — Stripe hosted checkout, immediate capture

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): app/api/checkout/stripe/route.ts: stripe.checkout.sessions.create() with mode:'payment' + explicit payment_intent_data.capture_method:'automatic'; domain/checkout.ts finalizes on checkout.session.completed webhook with a dedup StripeWebhookEvent guard.
- **arm-03** (score 9): lib/checkout/session.ts createHostedCheckoutSession(): relies on Checkout's automatic-capture default with an explicit 'Immediate capture (UR-011)' comment; lib/payments/webhook.ts finalizes.
- **arm-04** (score 9): lib/payments/stripe-api.ts createCheckoutSession(): mode:'payment' + explicit 'payment_intent_data[capture_method]':'automatic'; provider-abstracted (local-gateway.ts mock for dev) behind a shared gateway.ts interface; webhook-service.ts finalizes.

### G-008 — Finished-package inventory (v1 primary)

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): domain/inventory.ts reserveInventory(): single guarded conditional raw SQL UPDATE (onHand-reserved>=qty) inside a transaction with ReadCommitted isolation -- two racing checkouts for the last unit cannot both succeed.
- **arm-03** (score 9): lib/inventory/reserve.ts reserveInTx(): identical guarded-UPDATE concurrency pattern, plus an INVENTORY_RESERVED AuditLog row per reservation.
- **arm-04** (score 9): lib/inventory/reserve.ts reserveUnits()/releaseUnits(): same guarded-UPDATE pattern; explainMiss() distinguishes 'sold out' from 'never configured' for a clearer error.

### G-009 — BOM/ingredients — schema yes, UI hidden; manager enables later

**Winner: arm-04** · Runner-up: arm-06

- **arm-01** (score 7): schema.prisma Ingredient/ProductIngredient/AssemblyBatch/AssemblyBatchUse models exist with a per-ingredient consumption shape ready; zero non-schema/migration code references found anywhere. No comment documents this as a deliberate 'schema-only, UI hidden' decision, so intent reads as accidental rather than planned.
- **arm-03** (score 7): schema.prisma Ingredient/BomLine/AssemblyBatch models exist (bare-log-row AssemblyBatch shape); zero non-schema code references. No explicit doc comment documenting the deliberate schema-only/UI-hidden decision.
- **arm-04** (score 9): schema/inventory.prisma has an explicit doc comment directly above the models: 'Ingredient tracking ships as schema only... nothing here has a UI at launch (UR-016, G-009)'; smoke-p2.ts P2-6 explicitly asserts the 4 BOM tables exist with zero business-logic wiring. Best-documented intent of the three.

### G-010 — Assembly batches consume supplies → finished stock

**Winner: arm-01** · Runner-up: arm-04

- **arm-01** (score 2 `MISSING,STUB`): AssemblyBatch/AssemblyBatchUse has a real per-ingredient consumption shape (assemblyBatchId+ingredientId+status lifecycle) ready to wire up, but zero service/API/UI code anywhere creates a batch, debits an ingredient, or credits InventoryItem.onHand. Same universal gap as every other arm -- schema ready, zero behavior.
- **arm-03** (score 1 `MISSING,STUB`): AssemblyBatch is a bare log row {id, productId, quantity, note} with no relation to Ingredient/BomLine at all -- structurally cannot represent 'consumed X of ingredient Y'. Zero non-schema code references anywhere.
- **arm-04** (score 2 `MISSING,STUB`): AssemblyBatchConsumption{assemblyBatchId, ingredientId, quantityUsed} is the best-designed per-ingredient consumption schema of the three; still zero service/API/UI code anywhere creates a batch or credits inventory (smoke-p2.ts only asserts the tables exist).

### G-011 — Repeat-order draft + review page

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): domain/repeat-orders.ts getRepeatReview()/createRepeatDraft() builds a full per-line plan (mapped replacement chain + price-smart suggestions) reviewed via components/repeat-review.tsx + app/(storefront)/account/orders/[orderId]/repeat before committing; admin bulk-repeat exists too (reviewOrdersInBulk/repeatOrdersInBulk).
- **arm-03** (score 9): lib/ops/repeat.ts previewRepeatOrder()/confirmRepeatOrder() (710 lines) with components/account/repeat-review.tsx as the customer review UI plus bulkRepeatOrders() for staff.
- **arm-04** (score 9): lib/orders/repeat-plan.ts buildRepeatPlan() (add-on drop tracking, recipient-state validation, chain-following viaNames) reviewed via app/(storefront)/account/orders/[orderId]/repeat before lib/orders/repeat-apply.ts commits. Most complete of the three (only arm to track dropped add-ons explicitly).

### G-012 — Unmapped items: must pick or remove; price-smart suggestions

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): domain/repeat-orders.ts: suggestions sorted by Math.abs(price-diff) ascending; createRepeatDraft() hard-throws 'Confirm a replacement or removal for every source line' if any line lacks an explicit decision.
- **arm-03** (score 9): lib/catalog/replacements.ts priceSmartProductId (closest-price sort); lib/ops/repeat.ts confirmRepeatOrder() hard-errs 'Choose a replacement or remove' for any line.requiresPick without an explicit choice, before committing.
- **arm-04** (score 9): lib/catalog/replacements.ts closestPricedProduct(); lib/orders/repeat-plan.ts marks resolution:'needs_choice' and needsChoiceCount surfaces it; lib/orders/repeat-apply.ts enforces a decision per line before commit.

### G-013 — Admin replacement mappings per catalog item

**Winner: arm-01** · Runner-up: arm-04

- **arm-01** (score 9): Product.replacementProductId self-relation; per-product admin editor sets it; domain/repeat-orders.ts resolveReplacementChain()/assertReplacementMapping() both do explicit cycle detection via a visited Set (throws on cycle).
- **arm-03** (score 8): Separate ProductReplacement join table (fromProductId/toProductId) set from the same catalog-admin route/component as the rest of the product editor (app/api/admin/catalog/route.ts); lib/catalog/replacements.ts resolveReplacementChain() uses a visited-Set BFS to skip cycles (silent skip rather than a hard throw).
- **arm-04** (score 9): Product.replacedByProductId self-relation editable in lib/catalog/admin.ts's per-product update function; lib/catalog/replacements.ts documents an explicit loop/seen-set guard plus a hop cap so a mapping loop can't hang a page load.

### G-014 — Per-package delivery zip hard-block

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): domain/checkout.ts: PACKAGE_DELIVERY branch throws a CheckoutConflictError if !allowedDeliveryZips.includes(zip) -- server-side hard reject, no override path.
- **arm-03** (score 9): lib/checkout/delivery.ts assertPerPackageZipsAllowed() throws ZipBlockedError with an explicit 'No manager override' message baked into the error text -- the clearest 'hard block, no escape hatch' documentation of the three.
- **arm-04** (score 9): lib/delivery-area.ts checkDeliveryArea(): deliverable check gates checkout server-side with no override; distinguishes malformed vs out-of-area vs not-configured reasons for the customer message.

### G-015 — Bulk fee per destination; per-package fee per recipient

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 9): domain/fulfillment-fees.ts calculateFulfillmentFees(): groups BULK_DELIVERY by (code,addressId) so the fee is charged once per distinct destination address; groups PACKAGE_DELIVERY by (code,orderLineId) so it's charged per recipient with no collapsing.
- **arm-03** (score 9): lib/checkout/delivery.ts: bulkDestinationFeeCents applied once per distinct address, perPackageFeeCents applied per recipient -- same two-tier structure with a documented DeliveryFeeBreakdown output type.
- **arm-04** (score 9): lib/checkout/fees.ts + fee-subjects.ts: same bulk-per-destination / per-package-per-recipient split, independently converged.

### G-016 — Staff/Manager roles + per-person permission toggles

**Winner: arm-06** · Runner-up: arm-04

- **arm-01** (score 6): lib/permissions.ts: only 7 named permissions, MANAGER gets all, STAFF gets only 'admin:view', DRIVER gets none; grant/deny arrays per staff row; toggle UI exists. Thin permission surface relative to the size of the admin app, and DRIVER having zero explicit permissions looks like a real gap.
- **arm-03** (score 7): lib/permissions.ts: 7 named permissions, GRANT/DENY resolved via a Set (grant adds, deny removes) with an isActive/revokedAt safety check baked into hasPermission(); admin/staff page toggles overrides. Same thinness as arm-01 but with an extra revoked-staff safety net.
- **arm-04** (score 8): lib/auth/permissions.ts: 18 named permissions (dashboard/orders/fulfillment/customers/imports/catalog/media/staff/audit/settings/seasons/routes/email/reports/migration), explicit DENY>GRANT>role-default priority function, extensively commented role rationale. Most granular of the three, though no self-escalation/impersonation-rank guard was found.

### G-017 — Staff-scheduled bulk delivery + notify customer

**Winner: arm-03** · Runner-up: arm-04

- **arm-01** (score 5): domain/delivery.ts scheduleBulkDelivery(prisma, packageId, start, end) is scoped to ONE package per call, with no season-wide sweep and a per-package (not per-customer) notification dedupe key -- a customer with multiple boxes scheduled in separate calls would get one email per box. Functionally works but is not a true bulk operation despite the name.
- **arm-03** (score 9): lib/pickup/bulk.ts scheduleBulkDelivery(): sweeps an arbitrary set of packageIds in one transactional BulkDeliveryWindow, sends exactly one notification per distinct customer via a dedupe Set, plus a followUpQueue() for unpaid/unclaimed/bulk_pending call-center filtering.
- **arm-04** (score 9): lib/scheduling/bulk-delivery.ts scheduleBulkDelivery(): sweeps a list of packageIds, groups by customer, sends exactly one email+SMS per customer regardless of box count with an explicit design comment, dedupe keyed on (customer, day, window).

### G-018 — Cart-first order entry + three-way recipient picker

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 8): components/order-builder.tsx: recipientSource: 'ON_ORDER'|'ADDRESS_BOOK'|'NEW_RECIPIENT' per line, assigned after adding items ('Pick gifts first. Choose recipients second.').
- **arm-03** (score 8): components/order/builder-shell.tsx: mode 'on_order'|'address_book'|'new_recipient', explicit 'Cart-first order... Add packages and quantities first, then assign each line to a recipient.' copy.
- **arm-04** (score 8): lib/orders/assignment.ts resolveRecipient(): target 'saved'|'self'|else-new branch, wired from components/builder/{cart-panel,assignment-panel}.tsx after items are added to the draft.

### G-019 — Auto-save new recipients to address book; staff edit with audit

**Winner: arm-06** · Runner-up: arm-01

- **arm-01** (score 8): New recipients on drafts auto-save into the address book; app/api/admin/customer-addresses/[addressId]/route.ts PATCH is a staff-only (settings:manage) version-guarded endpoint with an AuditLog row (impersonator tracked) on every edit.
- **arm-03** (score 8): app/api/admin/addresses/[id]/route.ts PATCH: explicit 'Staff edit of any customer address — audited (UR-014/G-019)' comment, delegates to lib/address/book.ts updateOwnedAddress() with bypassOwnership:true + actorStaffId audit.
- **arm-04** (score 7): lib/addresses/address-book.ts saveCustomerAddress() is a single shared function for both self-service and staff edits (actor param optional) with a recordAudit() call logging 'customer.address_saved' -- correct and real, but no staff-specific endpoint/permission gate distinct from the self-service path was found, and the audit detail has no before/after diff.

### G-020 — Per-recipient greeting memory

**Winner: arm-03** · Runner-up: arm-04

- **arm-01** (score 8): CustomerAddress.rememberedGreeting field, written in domain/checkout.ts after checkout, read as the default on both storefront (checkout-form.tsx) and POS (pos-checkout-form.tsx) flows. No explicit G-020 doc comment.
- **arm-03** (score 9): Dedicated RecipientGreetingMemory model with explicit 'UR-013/G-020' doc comment, keyed by a hashed (customer, normalized-recipient) key rather than an address FK (survives address edits); lib/checkout/greetings.ts remember/lookup + resolveLineGreeting() precedence wired into checkout/session.ts.
- **arm-04** (score 9): Address.lastGreeting field with an explicit 'UR-013, G-020' doc comment describing the exact UX intent; wired into lib/checkout/greetings.ts and checkout-summary.ts, plus reused by lib/orders/repeat-recipients.ts for repeat-order defaults.

### G-021 — Greeting cards: order default + overrides; separate card PDF

**Winner: arm-04** · Runner-up: arm-06

- **arm-01** (score 8): Order.greetingDefault + per-line override; domain/print-batches.ts createArtifacts() emits a separate PrintArtifactKind.GREETING_CARDS artifact per filing group alongside SLIPS/LABELS.
- **arm-03** (score 8): lib/ops/print-batch.ts cardLines()/GREETING_CARDS artifact rendered at a dedicated 5x7 card-stock page size (CARD_5X7), separate from the LETTER-size slip/label PDFs.
- **arm-04** (score 9): lib/print/documents.ts PRINT_ARTIFACTS includes a dedicated 'cards' kind rendered at CARD_STOCK size; cardPages() explicitly skips a card entirely for boxes with no greeting message rather than printing a blank card. Most thoughtful design of the three.

### G-022 — Off-season + full catalog archive

**Winner: arm-01** · Runner-up: arm-03

- **arm-01** (score 8): app/(storefront)/collections/page.tsx: getArchivedSeasons() renders every past season's full product catalog inline with an explicit 'Browse only' badge and 'cannot be ordered' copy. Single flat page (no per-season detail route) but shows the complete catalog directly.
- **arm-03** (score 8): app/(storefront)/archive/page.tsx + archive/[slug]/page.tsx + archive/[slug]/[productSlug]/page.tsx -- list plus per-season and per-product drill-down.
- **arm-04** (score 8): app/(storefront)/archive/page.tsx + archive/[year]/page.tsx + archive/[year]/[slug]/page.tsx -- same list+detail+product drill-down structure, plus a separate 'collection' route for the current open season.

### G-023 — Map suggest + confirm reroute; void label

**Winner: arm-04** · Runner-up: arm-06

- **arm-01** (score 8): domain/delivery.ts findNearbyShippingPackages() (radius + same-street heuristic) + confirmRouteReroute() re-validates the chosen package is still in the suggested set server-side before calling switchFulfillmentMethod() (which handles the label void). Admin route page renders a real Mapbox Static Images map of the route's stops, though the suggestion overlay itself is a plain list, not markers on that map.
- **arm-03** (score 8): lib/routes/service.ts suggestReroutes()/confirmReroute(): manager-confirmation gate, re-validates distance server-side, voids the label via the shared method-switch path; components/admin/route-detail.tsx has a 'Print fallback' button but no map visualization for suggestions.
- **arm-04** (score 9): lib/routing/reroute.ts rerouteOntoRoute(): explicit confirmed:true gate, re-validates the suggestion server-side, row-locks the route (FOR UPDATE) before appending the stop to avoid a sequence collision from two simultaneous reroutes, reuses fulfillment/method-switch.ts for the label void. Most concurrency-hardened of the three.

### G-024 — Large-scale ops (1k orders / 5k packages / 10+ staff)

**Winner: arm-04** · Runner-up: arm-06

- **arm-01** (score 2 `MISSING,STUB`): No scale-seed or load-test script exists anywhere in the codebase (grep for 1000/scale/load across every .ts file found nothing relevant); the only concurrency probe is concurrency-smoke.ts, a synthetic 10-way race on a SINGLE staffUser row unrelated to order/package volume. The admin fulfillment board is hard-capped at take:200 with no true pagination (see G-004). The 1k-order/5k-package/10-staff claim is unevidenced.
- **arm-03** (score 7): seed-scale-p6.ts seeds exactly 1,000 orders x 5 packages = 5,000 packages in batched transactions; lib/ops/packages.ts packageBoard() is genuinely paginated/filtered/indexed (see G-004). No dedicated 10-concurrent-staff probe was found alongside the seed script.
- **arm-04** (score 9): fixtures-scale.ts seeds 1,000 orders x 5 packages = 5,000 packages, runs a post-load ANALYZE so query-planner stats aren't stale, is idempotent/clearable, and is explicitly tagged '(G-024)' in its header comment; smoke-p10.ts includes a concurrent-staff probe. Best-evidenced of the three true builds.

### G-025 — Driver mobile web + print fallback; magic-link auth

**Winner: arm-04** · Runner-up: arm-06

- **arm-01** (score 8): domain/delivery.ts accessDriverRoute(): token-hash lookup, PIN check with a 5-strikes lockout, per-stop googleMapsUrl(); admin route page has a print-mode toggle (?print=1 hides the map) as the print fallback.
- **arm-03** (score 8): app/api/driver/[token]/route.ts + lib/routes/service.ts: token/PIN gate, components/admin/route-detail.tsx has an explicit 'Print fallback' button generating printable text.
- **arm-04** (score 9): lib/routing/route-links.ts: salted PIN hash, exponential lockout backoff (lockoutMs(lockouts)), TTL expiry, revocation; app/(admin)/admin/routes/[routeId]/print is a dedicated print-fallback route. Most hardened auth of the three.

### G-026 — Pickup when inventory available; ready notify; door list

**Winner: arm-06** · Runner-up: arm-02

- **arm-01** (score 8): domain/delivery.ts markPickupReady(): checks onHand-reserved>=quantity across all lines BEFORE opening the transaction that stamps pickupReadyAt and sends the ready email; components/delivery-operations.tsx renders a 'Pickup door list' UI. Inventory check happens outside the transaction, leaving a narrow TOCTOU window.
- **arm-03** (score 8): lib/pickup/service.ts orderInventoryAvailable() + markPickupReadyIfEligible(): same outside-transaction inventory check, but reuses the shared availableUnits() helper from the inventory-reservation module; enqueueEmailAndSms() covers both channels.
- **arm-04** (score 8): lib/pickup/pickup-service.ts blockers()/sendPickupReady(): checks stage+stock shortfall before stamping, dedupe-keyed outbox message, lib/pickup/pickup-print.ts renderPickupDoorList(). Same outside-transaction check as the other two true arms.

### G-027 — Per-package delivery: staff-routed days; day-of notification

**Winner: arm-03** · Runner-up: arm-04

- **arm-01** (score 8): domain/delivery.ts startDeliveryRoute(): flips route to IN_PROGRESS and sends a DAY_OF_DELIVERY email to every stop's customer inside the same transaction, keyed by (route,package) for retry-safety.
- **arm-03** (score 9): lib/routes/service.ts startRouteViaMagicLink(): explicit recovery path ('Recover day-of notify if a prior start committed IN_PROGRESS then failed mid-notify') so a crash between the status flip and the notify send can't silently skip customers on retry.
- **arm-04** (score 9): lib/scheduling/day-of-notice.ts is a dedicated module for the route-start notification dispatch, wired from the route lifecycle actions.

### G-028 — POS check/cash payments

**Winner: arm-01** · Runner-up: arm-04

- **arm-01** (score 9): app/api/admin/orders/[orderId]/payments/route.ts POST/PATCH: version-guarded transactional post + void of CASH/CHECK payments, audited, recalculates cached payment status; auto-finalizes a DRAFT POS order on first payment.
- **arm-03** (score 8): lib/payments/offline.ts covers CASH/CHECK posting/void for the app/(admin)/admin/pos flow; app/api/admin/pos exists for the counter-sale UI/API.
- **arm-04** (score 9): lib/payments/offline-payments.ts: explicit 'UR-011, G-028, R-127' doc comment, zod-validated CASH/CHECK schema, voidPayment() keeps the row with a reason rather than deleting, re-checks the permission rather than trusting the caller.

### G-029 — Historical data migration (messy export + cleanup)

**Winner: arm-04** · Runner-up: arm-06

- **arm-01** (score 8): domain/legacy-import.ts: strict zod-schema JSON intake (not raw CSV) with size caps, inspectLegacyDocument() flags BLOCKING vs REVIEW issues (missing email/phone, missing city/postal, dangling FKs) before a staged dry-run/commit. No spelled-out-state-name normalization ceiling was found.
- **arm-03** (score 8): lib/ops/import.ts: real messy-CSV parser (quoted-field aware), email/phone-normalized customer matching, staged dry-run then commitImport(). Note: lib/ops/prior-year-stub.ts is NOT this feature -- it's an unrelated P10 smoke-test fixture seeder, not a cleanup/migration path.
- **arm-04** (score 9): lib/migration/{legacy-rows,address-cleanup,legacy-import,legacy-verdicts,legacy-commit}.ts is a 5-file dedicated pipeline with named verdict categories (e.g. UNUSABLE_ADDRESS) and explicit money/date/order-reference repair helpers for messy legacy exports. Most modularized of the three true builds.

### G-030 — Mapbox admin map; Google Maps deep links for drivers

**Winner: arm-01** · Runner-up: arm-06

- **arm-01** (score 8): app/(admin)/admin/delivery/routes/[routeId]/page.tsx renders a REAL Mapbox Static Images API map (pin markers per stop) when MAPBOX_ACCESS_TOKEN is set, with a graceful text fallback when it isn't -- a genuine tile map, not a placeholder. domain/delivery.ts googleMapsUrl() covers the driver deep-link half.
- **arm-03** (score 3 `STUB`): lib/address/geocode.ts is a purely deterministic offline fake geocoder -- MAPBOX_ACCESS_TOKEN is never referenced anywhere in the codebase, and the admin UI's 'Mapbox-style builder' label is misleading copy over a feature that was never wired to Mapbox at all. Google Maps deep links for drivers (lib/routes/geo.ts) work correctly.
- **arm-04** (score 6): lib/routing/geocode.ts calls the real Mapbox Geocoding v6 API (with a documented cache to control per-lookup billing) for address lookups, but no visual admin map/tile component was found anywhere in the app tree -- Mapbox here is geocoding-only, not a map you can look at. lib/routing/maps.ts covers the Google Maps driver deep-link half.
