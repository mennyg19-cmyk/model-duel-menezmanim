# Batch 03 — Admin Operations & Catalog/Inventory

Scoring for the 6-way AI coding agent duel rebuild of the Tomche Shabbos mishloach manos delivery site. Each score is 0-10, composite across presence/completeness/correctness/clean-code/testedness. See JSON sibling file for full per-arm notes and evidence paths.

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| R-049 | Permission-aware admin dashboard + KPIs + recent orders | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 2 (STUB, THEATER) | 9 | arm-06 | arm-01 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB/THEATER |
| R-050 | Daily operations "Today" work queue | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 3 (STUB) | 9 | arm-06 | arm-01 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB |
| R-051 | Role + per-user permission enforcement | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 3 (STUB, BROKEN) | 9 | arm-06 | arm-01 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB/BROKEN |
| R-052 | Searchable filterable order list | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 4 (STUB) | 9 | arm-06 | arm-01 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB |
| R-053 | Full admin order detail + money actions | 9 | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 2 (STUB, MISSING) | 9 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB/MISSING |
| R-054 | Refunds (incl. Stripe refund path) | 9 | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 3 (STUB, THEATER) | 8 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB/THEATER |
| R-055 | Carrier label creation + voiding | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 8 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-056 | Printable order packing slips | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 7 | 8 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-057 | Staff single-order repeat workflow | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 5 | 9 | arm-06 | arm-01 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-058 | Bulk repeat of customer history | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 5 | 9 | arm-06 | arm-01 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-059 | Staff point of sale | 9 | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 3 (STUB) | 9 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB |
| R-060 | POS customer lookup + preselection + find-or-create | 9 | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 2 (STUB, MISSING) | 9 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB/MISSING |
| R-061 | POS checkout | 9 | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 9 (CLONE-TIE) | 5 | 9 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-062 | Customer directory + search + add | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 3 (STUB, MISSING) | 8 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: STUB/MISSING |
| R-063 | CSV customer/product import (staged atomic) | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 6 | 8 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-064 | Customer detail + history | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 0 (MISSING) | 8 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: MISSING |
| R-065 | Product catalog management (list/create/edit/detail/season) | 6 | 6 (CLONE-TIE) | 6 (CLONE-TIE) | 6 (CLONE-TIE) | 5 | 8 | arm-06 | arm-01 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-066 | Add-on catalog management | 6 | 6 (CLONE-TIE) | 6 (CLONE-TIE) | 6 (CLONE-TIE) | 5 | 6 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-067 | Media library + photo assignment (Vercel Blob) | 8 | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 8 (CLONE-TIE) | 4 | 8 | arm-01 | arm-06 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE |
| R-068 | Inventory overview dashboard | 1 (MISSING) | 1 (MISSING, CLONE-TIE) | 1 (MISSING, CLONE-TIE) | 1 (MISSING, CLONE-TIE) | 1 (MISSING) | 1 (MISSING) | none | none | arm-01: MISSING; arm-02: MISSING/CLONE-TIE; arm-03: MISSING/CLONE-TIE; arm-04: MISSING/CLONE-TIE; arm-05: MISSING; arm-06: MISSING |
| R-069 | Production batch planning + history | 0 (MISSING) | 0 (MISSING, CLONE-TIE) | 0 (MISSING, CLONE-TIE) | 0 (MISSING, CLONE-TIE) | 0 (MISSING) | 0 (MISSING) | none | none | arm-01: MISSING; arm-02: MISSING/CLONE-TIE; arm-03: MISSING/CLONE-TIE; arm-04: MISSING/CLONE-TIE; arm-05: MISSING; arm-06: MISSING |
| R-070 | Inventory adjustments + write-offs + shortfall | 0 (MISSING) | 0 (MISSING, CLONE-TIE) | 0 (MISSING, CLONE-TIE) | 0 (MISSING, CLONE-TIE) | 0 (MISSING) | 0 (MISSING) | none | none | arm-01: MISSING; arm-02: MISSING/CLONE-TIE; arm-03: MISSING/CLONE-TIE; arm-04: MISSING/CLONE-TIE; arm-05: MISSING; arm-06: MISSING |
| R-071 | Stock reserve/allocate/release engine | 6 | 6 (CLONE-TIE) | 6 (CLONE-TIE) | 6 (CLONE-TIE) | 4 (BROKEN) | 8 | arm-06 | arm-01 | arm-02: CLONE-TIE; arm-03: CLONE-TIE; arm-04: CLONE-TIE; arm-05: BROKEN |

## Per-item detail

### R-049 — Permission-aware admin dashboard + KPIs + recent orders

**Winner:** arm-06 · **Runner-up:** arm-01

- **arm-01** — 8/10: Real dashboard: finalized/revenue/collected/awaiting-payment KPIs, package-stage breakdown, recent-orders table, all gated behind orders.view/audit.view permission checks with graceful degraded view for staff without those permissions.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 2/10 [STUB, THEATER]: app/admin/page.tsx is a static marketing-style shell with 7 link cards ('Order operations', 'Walk-in POS', etc.) — zero KPIs, zero DB queries, zero permission gating. All real dashboard-ish data (order/customer counts, paid total) lives instead in the unrelated /admin/operations page.
- **arm-06** — 9/10: requireStaff() + hasPermission() gate KPI cards (orders today, revenue today, awaiting collection, in-flight checkouts) and queues; only renders full dashboard for payments.manage; adds a customers.manage-gated link. Clean lib/admin/dashboard.ts with bounded parallel queries.

*Evidence:* arm-01: `app/(admin)/admin/page.tsx`; arm-05: `app/admin/page.tsx`; arm-06: `app/(admin)/admin/page.tsx; lib/admin/dashboard.ts`

### R-050 — Daily operations "Today" work queue

**Winner:** arm-06 · **Runner-up:** arm-01

- **arm-01** — 8/10: Two real queues on the dashboard: 'Finalized, not fully paid' (oldest first) and 'Stale checkout drafts (>1h)', each with a 'view all' deep link and a payments-posted-today counter.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 3/10 [STUB]: Operations page shows only a single number ('drafts waiting for follow-up' count, >24h stale) with no actual list/queue to work from — no order-level detail, no click-through triage, no distinction between payment-owed vs. abandoned-draft cases.
- **arm-06** — 9/10: 'Collect payment' queue (FINALIZED + unpaid, oldest first) and 'In-flight checkouts' queue (submitted DRAFT with stock reserved), each a real clickable order list, bounded query, permission-gated.

*Evidence:* arm-01: `app/(admin)/admin/page.tsx`; arm-05: `app/admin/operations/page.tsx`; arm-06: `lib/admin/dashboard.ts`

### R-051 — Role + per-user permission enforcement

**Winner:** arm-06 · **Runner-up:** arm-01

- **arm-01** — 8/10: requirePermissionPage/requirePermissionApi gate every admin page and API route; admin layout redirects unauthenticated to /login, blocks DRIVER role from admin entirely, and filters nav to permitted items. Full per-user GRANT/DENY override editor (OverrideEditor in staff-manager.tsx) backed by /api/staff/[id]/overrides.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for these files.
- **arm-05** — 3/10 [STUB, BROKEN]: API layer is genuinely solid (authorize()/hasStaffPermission() with role defaults + GRANT/DENY overrides, checked on every route), but there is NO middleware and NO page-level guard anywhere under app/admin/** — /admin/layout.tsx and every admin page render unconditionally for anyone who requests the URL (data calls then fail client-side). The staff page also has no UI to edit per-permission overrides despite the API (PATCH /api/staff/[id]) fully supporting it — role change, revoke, impersonate only.
- **arm-06** — 9/10: requireStaff()+hasPermission('admin.access') with forbidden() at the layout; sidebar built conditionally per permission; full StaffEditor UI with per-permission inherit/grant/deny selects, role change (blocked for self), impersonate, revoke — the most complete override UX of the three examined.

*Evidence:* arm-01: `app/(admin)/admin/layout.tsx; components/staff-manager.tsx`; arm-05: `lib/route-auth.ts; app/admin/layout.tsx (no guard)`; arm-06: `app/(admin)/admin/layout.tsx; app/(admin)/admin/staff/[id]/staff-editor.tsx`

### R-052 — Searchable filterable order list

**Winner:** arm-06 · **Runner-up:** arm-01

- **arm-01** — 8/10: Dedicated /admin/orders page: text search (order#/ref/name/email), status filter, payment filter, pagination, bulk-select actions, all URL-driven and permission-gated.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 4/10 [STUB]: No dedicated order-list route exists at all. listOrders() (real: text search + status filter + pagination) is buried as one section of the client-side /admin/operations page with a single shared search box for both orders and customers, no status/payment dropdowns, no page-level permission gate.
- **arm-06** — 9/10: Dedicated /admin/orders page: search, status dropdown (full enum), payment dropdown (full enum), page-size selector, URL-as-source-of-truth pagination, bounded queries for scale.

*Evidence:* arm-01: `app/(admin)/admin/orders/page.tsx`; arm-05: `app/admin/operations/page.tsx; lib/admin-operations.ts#listOrders`; arm-06: `app/(admin)/admin/orders/page.tsx`

### R-053 — Full admin order detail + money actions

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 9/10: Comprehensive: line items with options/add-ons/recipient/method, fee breakdown, donation, balance, payments table with post/void, shipping-label controls per package, repeat button, packing-slip link, per-order audit trail, customer card.
- **arm-02** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 9/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 2/10 [STUB, MISSING]: The entire order-detail page is shipping-label controls only ('Manage shipping labels without marking a package sent') — no line items, no customer info, no payment table, no refund button, no audit trail, no packing-slip link. Money actions exist only as an orphaned API route never surfaced here.
- **arm-06** — 9/10: Lines with add-on rollup, recipients, packages/labels card, full OrderActions panel (post/void/refund with per-payment history), audit trail scoped to order+its payments, customer link. On par with arm-01/06 cluster.

*Evidence:* arm-01: `app/(admin)/admin/orders/[id]/page.tsx`; arm-05: `app/admin/orders/[orderId]/page.tsx`; arm-06: `app/(admin)/admin/orders/[orderId]/page.tsx; order-actions.tsx`

### R-054 — Refunds (incl. Stripe refund path)

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 9/10: Manager-gated (payments.refund), DB-first money-loss guard (negative payment row + audit commits BEFORE the Stripe call), stable idempotency key derived from intent+amount+prior-refund-state, partial-refund support, rollback on Stripe failure. Wired to a real button on the order page.
- **arm-02** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 9/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 3/10 [STUB, THEATER]: Backend (refundStripePayment) is real — Stripe REST call with idempotency key, DB status update + audit — but only full refunds (no partial amount), Stripe is called BEFORE the DB update (opposite of the safer DB-first pattern), and critically there is NO UI anywhere that calls this endpoint — grep across the whole app/ tree found zero references outside the route itself and the webhook. Unreachable feature for a real admin user.
- **arm-06** — 8/10: Real Stripe refund via lib/payments/refund, keyless-host guard (422 with operator instructions instead of faking success), local status only flips on Stripe evidence. Wired to a working 'Refund' button per payment row in OrderActions with busy/error state. No partial-refund amount option (full only) — modest gap vs. arm-01.

*Evidence:* arm-01: `app/api/admin/orders/[id]/refund/route.ts; lib/payments/post-payment.ts`; arm-05: `lib/checkout.ts#refundStripePayment (orphaned)`; arm-06: `app/api/admin/payments/[paymentId]/refund/route.ts; lib/payments/refund.ts`

### R-055 — Carrier label creation + voiding

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 8/10: ShipmentActions component: buy label, void label (blocked once shipped), refresh tracking, shows carrier/service/tracking/margin. Backed by real API routes per package/shipment.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 7/10: Real, wired-up shipping action buttons on the order page (validate address, buy cheapest label, void label unless SENT, refresh tracking), one unified /shipping route dispatching to lib/shipping.ts. Solid, though this is the ONE genuinely functional slice of arm-05's otherwise-thin order-detail page.
- **arm-06** — 8/10: Label purchase/void/tracking present on the order-packages-card, consistent with the same pattern as arm-01.

*Evidence:* arm-01: `components/admin/shipment-actions.tsx`; arm-05: `app/admin/orders/[orderId]/page.tsx; app/api/admin/packages/[packageId]/shipping/route.ts`; arm-06: `app/(admin)/admin/orders/[orderId]/order-packages-card.tsx`

### R-056 — Printable order packing slips

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 8/10: Live packing-slip PDF endpoint (buildOrderPackingSlip + renderArtifactPdf) linked directly from the order-detail page header for finalized orders.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 7/10: Real PDF generation (createPdf/orderPackingSlipDocument) with per-package 'Packing slip' links AND a nightly batch-print workflow with reprint tracking on the packages page — actually more built-out as a batch feature than arm-01, but the individual order-detail page itself doesn't link it (only the packages board does).
- **arm-06** — 8/10: PDF rendering via lib/print/pdf.ts, referenced from the order-packages-card; consistent with the cluster's approach.

*Evidence:* arm-01: `app/api/admin/orders/[id]/packing-slip/route.ts; lib/print/batches.ts`; arm-05: `app/api/admin/print/route.ts; app/admin/packages/page.tsx`; arm-06: `lib/print/pdf.ts`

### R-057 — Staff single-order repeat workflow

**Winner:** arm-06 · **Runner-up:** arm-01

- **arm-01** — 8/10: RepeatOrderButton on the finalized order page deep-links into POS with the customer preselected (lib/repeat.ts resolves replacement chains); orders.manage-gated.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 5/10: Real backend (createRepeatDraft, /api/repeat) exists and is reachable from the Seasons page, but the trigger UI requires manually pasting a sourceOrderId/targetSeasonId rather than a real per-order 'Repeat' action on the order or customer page — functional but not integrated where a staffer would naturally look.
- **arm-06** — 9/10: Dedicated /admin/orders/[id]/repeat review page: replacement-chain resolution, recipient confirmation step, lands as a draft on the customer's account — the most complete, reviewable repeat flow of the three.

*Evidence:* arm-01: `components/admin/repeat-order-button.tsx; lib/repeat.ts`; arm-05: `app/admin/seasons/page.tsx; app/api/admin/repeat/route.ts`; arm-06: `app/(admin)/admin/orders/[orderId]/repeat/page.tsx; lib/repeat/plan.ts`

### R-058 — Bulk repeat of customer history

**Winner:** arm-06 · **Runner-up:** arm-01

- **arm-01** — 8/10: BulkRepeat control on the customers page: pick a prior season, copies each customer's latest finalized order into a POS draft in the open season, skips customers with in-progress drafts, per-customer failure isolation, full audit summary.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 5/10: Real bulk backend (concurrency-capped Promise.allSettled batches, per-customer outcome/error reporting, audit rows) but the UI is a raw comma-separated customer-ID textarea on the Seasons page — no customer picker, no search, crude UX compared to the other two.
- **arm-06** — 9/10: Dedicated /admin/repeat-bulk page with a season picker and a candidate-row picker (listBulkHistoryCandidates), idempotent re-runs (already-repeated rows skipped), replacement-chain resolution reported per row.

*Evidence:* arm-01: `components/admin/bulk-repeat.tsx; app/api/admin/repeat/bulk/route.ts`; arm-05: `app/admin/seasons/page.tsx; app/api/admin/repeat/route.ts`; arm-06: `app/(admin)/admin/repeat-bulk/page.tsx; lib/repeat/bulk-history.ts`

### R-059 — Staff point of sale

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 9/10: Full POS shell: customer step, multi-line cart via the same builder catalog as the storefront, draft persistence, deep-linkable from repeat, orders.manage-gated.
- **arm-02** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 9/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 3/10 [STUB]: 'POS' is a single form: one product dropdown, one quantity field, first/last/email text inputs, cash/check select. No cart (can't sell 2 different items in one order), no add-ons, no multi-recipient support, reuses the checkout pricing path but the counter experience itself is a toy compared to a real register.
- **arm-06** — 9/10: PosShell: customer search/find-or-create step then the shared order-builder cart for multi-line/add-on orders, cash/check only (card explicitly blocked server-side), payments.manage-gated.

*Evidence:* arm-01: `app/(admin)/admin/pos/page.tsx; components/admin/pos-client.tsx`; arm-05: `app/admin/pos/page.tsx`; arm-06: `app/(admin)/admin/pos/pos-shell.tsx`

### R-060 — POS customer lookup + preselection + find-or-create

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 9/10: CustomerPicker: name/email/phone search against /api/admin/customers, inline create-and-start-order form, plus deep-link preselection from staff-repeat (?customerId=).
- **arm-02** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 9/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 2/10 [STUB, MISSING]: No lookup at all — the POS form just takes first/last/email as free text and blindly upserts by email (customer.upsert) on submit. No search-existing UI, no preselection, no 'is this the right person' confirmation step.
- **arm-06** — 9/10: Debounced directory search with cancel-stale-request handling, inline find-or-create form when no hits, matches the arm-01 cluster's completeness.

*Evidence:* arm-01: `components/admin/pos-customer-picker.tsx`; arm-05: `lib/admin-operations.ts#createWalkInPosOrder`; arm-06: `app/(admin)/admin/pos/pos-shell.tsx`

### R-061 — POS checkout

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 9/10: Converts the POS draft through the same createOrderFromCart path as web checkout (price/stock/conflict re-derivation), finalizes and posts the audited cash/check payment inside one transaction so a stock conflict rolls the payment back too. Stripe explicitly excluded from POS.
- **arm-02** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 9/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 9/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 5/10: createWalkInPosOrder does share checkout's createPosOrder path and posts a real cash/check payment, but it is single-line-item only (one product × one quantity) — a real, if severely narrowed, checkout.
- **arm-06** — 9/10: checkoutPosOrder: submit + finalize + post payment in one call, card explicitly rejected (422) with a clear message, conflict/in-flight-session errors mapped to 409.

*Evidence:* arm-01: `app/api/admin/pos/checkout/route.ts`; arm-05: `lib/admin-operations.ts#createWalkInPosOrder`; arm-06: `app/api/admin/pos/checkout/route.ts; lib/payments/pos.ts`

### R-062 — Customer directory + search + add

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 8/10: Dedicated /admin/customers page: name/email/phone search, pagination, order/address counts, plus 'add' via the POS find-or-create form and its backing /api/admin/customers POST (with audit on new-customer creation).
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 3/10 [STUB, MISSING]: No dedicated /admin/customers route exists — the 'directory' is a read-only list embedded in the Operations page (name/email/order-count, no links, no detail navigation). No /api/admin/customers routes exist at all; the only way to create a customer is the blind POS upsert or CSV import.
- **arm-06** — 8/10: Dedicated /admin/customers page: search, pagination, order counts, links to detail pages; 'add' happens through the POS find-or-create flow, matching the arm-01 cluster's pattern.

*Evidence:* arm-01: `app/(admin)/admin/customers/page.tsx; app/api/admin/customers/route.ts`; arm-05: `app/admin/operations/page.tsx`; arm-06: `app/(admin)/admin/customers/page.tsx`

### R-063 — CSV customer/product import (staged atomic)

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 8/10: Dedicated /admin/import page: stage → review-every-row → all-or-nothing commit, duplicates skipped and reported, every commit audited; plus a separate legacy-migration pipeline with stage tracking and an address-review queue.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 6/10: Real staged/atomic import (stageImport writes a batch row + validation errors, commitImport runs one $transaction that errors out on any remaining invalid row and requires the staging actor to commit), but it's a raw CSV textarea buried in the Operations page with no dedicated import UI/preview grid.
- **arm-06** — 8/10: Dedicated /admin/imports flow: file upload, a preview page per batch (import-preview.tsx) before commit, matching the arm-01 cluster's staged-review pattern.

*Evidence:* arm-01: `app/(admin)/admin/import/page.tsx`; arm-05: `lib/admin-operations.ts#stageImport,#commitImport`; arm-06: `app/(admin)/admin/imports/page.tsx; [batchId]/import-preview.tsx`

### R-064 — Customer detail + history

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 8/10: Full customer detail page: order history table (season/placed/lines/total/status/payment, linked to order detail) + address book with last-greeting notes.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 0/10 [MISSING]: No customer detail route exists anywhere in the app (no /admin/customers/[id], no equivalent). The flat operations-page customer list has no click-through at all — there is no way to view one customer's order history in the admin UI.
- **arm-06** — 8/10: Customer detail page with order history and an inline customer-editor + book-cleanup component; on par with the arm-01 cluster.

*Evidence:* arm-01: `app/(admin)/admin/customers/[id]/page.tsx`; arm-05: `MISSING`; arm-06: `app/(admin)/admin/customers/[customerId]/page.tsx`

### R-065 — Product catalog management (list/create/edit/detail/season)

**Winner:** arm-06 · **Runner-up:** arm-01

- **arm-01** — 6/10: Season-scoped list+create work well and the PATCH API supports full edits (name/price/description/image/replacement), but the UI itself only exposes activate/deactivate, replacement-link change, and delete on existing products — no edit form for name/price/description, and no dedicated product detail page (everything is one inline table).
- **arm-02** — 6/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 6/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 6/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 5/10: Single-page CRUD: real inline edit form for name/sku/price/kind/photo/active/add-on-restrictions (better field coverage than arm-01's UI), but no dedicated detail page, and the 'Replacement links' section is an admitted, explicitly disabled placeholder ('Use this shell to identify... before that workflow opens') — literal UI theater for a real requirement.
- **arm-06** — 8/10: Season-scoped list page + a real dedicated /admin/products/[id] detail/edit page: full ProductForm, options/pricing manager, replacement-chain preview (shows where a repeat would resolve), photo assignment section. Most complete of the three.

*Evidence:* arm-01: `app/(admin)/admin/catalog/page.tsx; components/admin/catalog-manager.tsx`; arm-05: `app/admin/catalog/page.tsx`; arm-06: `app/(admin)/admin/products/[id]/page.tsx; product-form.tsx`

### R-066 — Add-on catalog management

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 6/10: Create + activate/deactivate + delete + per-product restriction display in the same catalog-manager component as products; no post-create edit of name/price.
- **arm-02** — 6/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 6/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 6/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 5/10: Add-ons are just Products with kind=ADD_ON in the same combined catalog form — same real inline-edit capability as products (name/price/photo/active), but no add-on-specific UX (e.g. restriction editing is folded awkwardly into the product form's 'restricted add-ons' multiselect).
- **arm-06** — 6/10: Dedicated /admin/addons page with its own AddonManager: create + activate/deactivate + usage count ('N products'); like arm-01, no post-create name/price edit — same-tier gap.

*Evidence:* arm-01: `components/admin/catalog-manager.tsx`; arm-05: `app/admin/catalog/page.tsx`; arm-06: `app/(admin)/admin/addons/addon-manager.tsx`

### R-067 — Media library + photo assignment (Vercel Blob)

**Winner:** arm-01 · **Runner-up:** arm-06

- **arm-01** — 8/10: Dedicated /admin/media page; lib/media.ts does real magic-byte image-type verification, uploads to Vercel Blob when configured and transparently falls back to local disk + a /media/[id] serving route otherwise, with delete cleaning up both the DB row and the backing bytes.
- **arm-02** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 8/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 8/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 4/10: Upload widget embedded in the catalog page (not a dedicated library), real magic-byte validation, but no local-disk fallback (503s without BLOB_READ_WRITE_TOKEN) and no delete endpoint at all — uploaded assets can never be removed. Assignment works via the product form's photo dropdown.
- **arm-06** — 8/10: Dedicated /admin/media page: shows active storage driver (Blob vs. local .uploads with a nudge to configure Blob), 'needs photos' product list, assignment and delete via MediaManager. On par with arm-01.

*Evidence:* arm-01: `app/(admin)/admin/media/page.tsx; lib/media.ts`; arm-05: `app/api/admin/media/route.ts (POST only)`; arm-06: `app/(admin)/admin/media/page.tsx; media-manager.tsx`

### R-068 — Inventory overview dashboard

**Winner:** none · **Runner-up:** none

- **arm-01** — 1/10 [MISSING]: No admin page or component anywhere references quantityOnHand/InventoryItem for display — grep across the whole app/ tree returns zero hits outside two unrelated API routes. There is no season-goal/sold/produced/remaining view of any kind.
- **arm-02** — 1/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 — same absence.
- **arm-03** — 1/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 — same absence.
- **arm-04** — 1/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 for these files — same absence.
- **arm-05** — 1/10 [MISSING]: Same absence, independently verified — quantityOnHand/quantityReserved are read only inside storefront availability logic (order-builder.tsx, catalog-grid.tsx), never surfaced in any admin view.
- **arm-06** — 1/10 [MISSING]: Same absence in the independent codebase too — onHand/InventoryItem have zero references anywhere under app/, despite the field existing in the schema and being used by the reserve/commit engine.

*Evidence:* arm-01: `MISSING (grep: 0 admin-UI hits for InventoryItem/quantityOnHand)`; arm-05: `MISSING (lib/inventory.ts has no dashboard consumer)`; arm-06: `MISSING (lib/inventory/reserve.ts has no dashboard consumer)`

### R-069 — Production batch planning + history

**Winner:** none · **Runner-up:** none

- **arm-01** — 0/10 [MISSING]: No ProductionBatch (or equivalent) model, route, or UI anywhere in the tree. quantityOnHand is set once (or never) and there is no mechanism to record received/produced stock, so the reserve engine's ceiling can never move.
- **arm-02** — 0/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 — same absence.
- **arm-03** — 0/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 — same absence.
- **arm-04** — 0/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 for these files — same absence.
- **arm-05** — 0/10 [MISSING]: No batch/production model or route found anywhere in prisma/schema.prisma or lib/ — the (unrelated) print-batches.ts is nightly print artifacts, not stock production.
- **arm-06** — 0/10 [MISSING]: Same absence — no production-batch concept exists in this independent codebase either.

*Evidence:* arm-01: `MISSING (no ProductionBatch model/route/UI in schema, lib, or app)`; arm-05: `MISSING`; arm-06: `MISSING`

### R-070 — Inventory adjustments + write-offs + shortfall

**Winner:** none · **Runner-up:** none

- **arm-01** — 0/10 [MISSING]: No adjustment/write-off model, API, or UI anywhere; staff cannot correct a stock count or record damaged/lost units through the app at all.
- **arm-02** — 0/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 — same absence.
- **arm-03** — 0/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 — same absence.
- **arm-04** — 0/10 [MISSING, CLONE-TIE]: Byte-identical to arm-01 for these files — same absence.
- **arm-05** — 0/10 [MISSING]: No adjustment/write-off concept found anywhere in schema, lib, or app.
- **arm-06** — 0/10 [MISSING]: Same absence in this independent codebase — no write-off/adjustment path exists.

*Evidence:* arm-01: `MISSING`; arm-05: `MISSING`; arm-06: `MISSING`

### R-071 — Stock reserve/allocate/release engine

**Winner:** arm-06 · **Runner-up:** arm-01

- **arm-01** — 6/10: reserveInventory is a correct single conditional UPDATE (WHERE onHand-reserved >= qty) called from finalizeOrder, race-safe. releaseReservation exists with the same conditional-UPDATE safety but is never invoked anywhere in the codebase (discard only applies to pre-reservation DRAFT orders) — a real 'allocate' half without an exercised 'release' half, and reserved stock is never converted into a permanent onHand decrement (no commit step), so onHand acts as a static ceiling rather than a true depleting count.
- **arm-02** — 6/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-03** — 6/10 [CLONE-TIE]: Byte-identical to arm-01.
- **arm-04** — 6/10 [CLONE-TIE]: Byte-identical to arm-01 for this file.
- **arm-05** — 4/10 [BROKEN]: reserveInventory is a correct conditional UPDATE + writes an audit-trail InventoryReservation row (a nice touch arm-01 lacks), invoked at Stripe-webhook-confirm time. But there is zero 'release' logic anywhere in lib/ (grep for 'release' case-insensitive returns nothing) and zero 'commit' step either — reserved only ever grows, onHand only ever holds constant. Worse than arm-01: no release function even exists as dead code.
- **arm-06** — 8/10: Full three-stage engine — reserveStockTx/releaseStockTx/commitStockTx, all using SELECT...FOR UPDATE row locks, and all three are genuinely wired into the checkout lifecycle (submit reserves, finalize commits — decrementing onHand for real, releaseOrderReservation frees stock on cancellation). The only one of the three with a working end-to-end reserve→consume→release cycle.

*Evidence:* arm-01: `lib/domain/inventory.ts (release dead code)`; arm-05: `lib/inventory.ts (no release/commit)`; arm-06: `lib/inventory/reserve.ts; lib/checkout/reservations.ts`

