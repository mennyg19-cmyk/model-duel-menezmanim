# Batch 10 — G Checklist (Grill Requirements)

Scoring pass over 30 G-items x 6 arms (180 scores). See `batch-10-g-checklist.json` for full evidence and per-arm notes.

| ID | Feature | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| G-001 | Hybrid fulfillment (print-first + optional digital stages) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 9 | arm-06 | arm-01 | lib/packages/stages.ts, lib/packages/print-batches.ts, lib/notify/outbox.ts |
| G-002 | Print slips/labels/cards without marking shipped | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-06 | arm-01 | lib/packages/print-batches.ts |
| G-003 | Default package grouping + staff split | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/domain/grouping.ts, lib/packages/actions.ts (splitPackage/regroupPackages) |
| G-004 | Package-level status and printing | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-06 | arm-01 | lib/packages/stages.ts |
| G-005 | Staff method switch; preserve paid charge | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 7 | 9 | arm-06 | arm-01 | app/(admin)/admin/packages/[packageId]/method-switch.tsx, app/api/admin/packages/[id]/switch |
| G-006 | Shipping rate-shop + margin + Shippo labels | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/shipping/margin.ts resolveMargin(), lib/shipping/shippo.ts |
| G-007 | Stripe hosted checkout, immediate capture | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/payments/stripe.ts (checkout session create, comment on capture_method) |
| G-008 | Finished-package inventory (v1 primary) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 | 8 | arm-05 | arm-01 | prisma/schema.prisma InventoryItem + InventoryReservation |
| G-009 | BOM/ingredients — schema yes, UI hidden; manager enables later | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 7 | 9 | arm-01 | arm-06 | prisma/schema.prisma lines ~709 (comment + Ingredient/BomLine models) |
| G-010 | Assembly batches consume supplies → finished stock | 1 (MISSING, STUB) | 1 (MISSING, STUB) | 1 (MISSING, STUB) | 1 (MISSING, STUB) | 2 (MISSING, STUB) | 2 (MISSING, STUB) | arm-05 | arm-06 | prisma/schema.prisma AssemblyBatch/AssemblyBatchItem (no code references found anywhere else) |
| G-011 | Repeat-order draft + review page | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 7 | 9 | arm-01 | arm-06 | lib/repeat.ts (buildRepeatPlan/buildRepeatCartLines), components/account/repeat-review.tsx |
| G-012 | Unmapped items: must pick or remove; price-smart suggestions | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/repeat.ts closestPricedProduct(), buildRepeatCartLines() |
| G-013 | Admin replacement mappings per catalog item | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 7 | 9 | arm-01 | arm-06 | prisma Product.replacementId, app/api/admin/products/[id]/route.ts, lib/repeat.ts |
| G-014 | Per-package delivery zip hard-block | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/checkout/fees.ts computeFees() PER_PACKAGE_DELIVERY case |
| G-015 | Bulk fee per destination; per-package fee per recipient | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/checkout/fees.ts computeFees() BULK_DELIVERY/PER_PACKAGE_DELIVERY branches |
| G-016 | Staff/Manager roles + per-person permission toggles | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 9 | arm-06 | arm-01 | lib/permissions.ts (canTargetStaff/canImpersonate/canManageStaffRole) |
| G-017 | Staff-scheduled bulk delivery + notify customer | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 9 | arm-06 | arm-01 | lib/bulk/schedule.ts scheduleBulkDelivery() |
| G-018 | Cart-first order entry + three-way recipient picker | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 8 | arm-01 | arm-06 | lib/order-builder/cart.ts (recipient union), components/builder/{cart-panel,assignment-dialog}.tsx |
| G-019 | Auto-save new recipients to address book; staff edit with audit | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 | 9 | arm-06 | arm-01 | app/api/admin/customers/[customerId]/addresses/[addressId]/route.ts, lib/orders/drafts.ts writeRecipients() |
| G-020 | Per-recipient greeting memory | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 8 | arm-01 | arm-06 | prisma/schema.prisma CustomerAddress.lastGreeting |
| G-021 | Greeting cards: order default + overrides; separate card PDF | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 9 | arm-06 | arm-01 | app/api/admin/routes/[routeId]/cards.pdf/route.ts, lib/print/pdf.ts |
| G-022 | Off-season + full catalog archive | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 8 | arm-01 | arm-06 | app/(storefront)/collections/page.tsx, collections/[seasonId]/page.tsx, lib/season.ts getArchiveSeasons() |
| G-023 | Map suggest + confirm reroute; void label | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 | 9 | arm-06 | arm-01 | lib/routes/reroute.ts, app/api/admin/routes/[routeId]/reroute/route.ts |
| G-024 | Large-scale ops (1k orders / 5k packages / 10+ staff) | 7 (CLONE-TIE) | 7 (CLONE-TIE) | 7 (CLONE-TIE) | 7 (CLONE-TIE) | 5 | 9 | arm-06 | arm-01 | scripts/seed-scale.mts (seed + timeProbe performance probes incl. 10 concurrent staff advances) |
| G-025 | Driver mobile web + print fallback; magic-link auth | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/routes/driver-access.ts, lib/routes/print.ts, components/driver/route-client.tsx |
| G-026 | Pickup when inventory available; ready notify; door list | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-06 | arm-01 | lib/pickup/readiness.ts hasAvailableInventory()/syncPickupReadiness()/loadDoorList() |
| G-027 | Per-package delivery: staff-routed days; day-of notification | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/routes/service.ts startRoute(), app/api/admin/routes/[id]/start/route.ts |
| G-028 | POS check/cash payments | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-01 | arm-06 | lib/payments/post-payment.ts, app/(admin)/admin/pos, api/admin/pos |
| G-029 | Historical data migration (messy export + cleanup) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 8 | 9 | arm-06 | arm-01 | lib/imports/legacy/{normalize,cleanup,orders,resolve-customer}.ts |
| G-030 | Mapbox admin map; Google Maps deep links for drivers | 7 (CLONE-TIE) | 7 (CLONE-TIE) | 7 (CLONE-TIE) | 7 (CLONE-TIE) | 7 | 8 | arm-06 | arm-01 | lib/routes/optimize.ts (real Mapbox Optimization API call), lib/routes/geo.ts googleMapsDirectionsUrl() |
