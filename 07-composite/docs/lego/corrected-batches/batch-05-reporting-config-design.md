# Batch 05 — Reporting, Config & Design — Corrective Re-Grade

Corrective re-grade of arm-01, arm-03, and arm-04 using their true, recovered codebases (the original Pass A had accidentally graded arm-02's code under those three names due to a workspace-overwrite bug). arm-02, arm-05, and arm-06 scores are carried through unchanged from the original file.

## Changes vs original Pass A

**16 of 21 items** had their winner change as a result of using the true codebases. Only 5 items (R-093, R-100, R-103, R-189, R-192) kept the same winner.

| Item | Old winner | New winner | Why |
|---|---|---|---|
| R-091 | arm-06 | arm-04 | arm-04's true build has a dedicated per-season drill-down route with FOUR breakdown axes (product/method/payment/status) — far beyond the mislabeled arm-02 code (single method+product drilldown) it was previously credited with; arm-04 now edges out arm-06's tabbed dual-drilldown. |
| R-092 | arm-06 | arm-04 | arm-04's real exports center is a dedicated page with a season picker and a distinct 'stopped part way' history state, surpassing both the wrongly-graded arm-02 stand-in and arm-06's export center. |
| R-094 | arm-01 | arm-04 | arm-04's true Orders-tab settings has full CRUD (add-forms with dimensions/instructions) for package types AND pickup locations, unlike the arm-02 code it was previously credited with (which was otherwise similar) — but critically, arm-01's OWN true build is only a STUB (read-only lists, no CRUD at all), so the old winner (mislabeled arm-01/arm-02 code) no longer applies to arm-01 once graded honestly. |
| R-095 | arm-01 | arm-04 | Same root cause as R-094: the old winner was arm-01, but that score described arm-02's fully-editable rate/rule tables. arm-01's real Shipping tab is mostly placeholder text ('ready for P8'). arm-04's true build has genuinely structured, editable rates/thresholds/origin/ZIPs/days, making it the new winner. |
| R-096 | arm-06 | arm-04 | arm-04's true Email+Developer tabs include a full letterhead editor, log-retention setting, and genuine deployment facts (runtime/App URL/identity provider) — richer than both the arm-02 stand-in and arm-06's version. |
| R-097 | arm-06 | arm-04 | arm-04's true new-season wizard lets managers pick a source season, see its real catalog, and individually check which products/add-ons to copy — the most complete and usable wizard reviewed across any arm, surpassing arm-06's simpler copy-from-season field. |
| R-098 | arm-01 | arm-04 | The old winner (arm-01) was actually grading arm-02's staff manager. arm-01's real staff UI is solid (score 8) but arm-04's true build adds a dedicated per-staff permission page with a live computed 'effective permission' badge and version-based concurrency on every mutation, edging out both arm-01 and arm-03. |
| R-099 | arm-01 | arm-03 | The old winner (arm-01) was really arm-02's impersonation code. Graded on its own true build, arm-03 uniquely blocks impersonating peers/higher-privileged staff (canImpersonate) — a safety nuance no other arm in this batch implements — making it the new winner over arm-04's still-strong (but not quite as defensive) implementation. |
| R-101 | arm-06 | arm-04 | arm-04's true Testing settings page requires typing the literal word 'WIPE' to confirm the most destructive action — the only arm with typed-confirmation protection — surpassing arm-06's confirm-dialog approach and the arm-02 stand-in previously credited to arm-01. |
| R-102 | arm-06 | arm-04 | arm-04's true help center filters tours to only the screens the signed-in reader can actually open and links directly to them — a permission-aware design not present in arm-06's otherwise-solid 6-tour implementation or the arm-02 code arm-01 was previously credited with. |
| R-104 | arm-06 | arm-04 | arm-04's true admin shell 403s outright for anyone lacking dashboard.view (rather than rendering an empty shell) on top of a shared permission-filtered nav array reused for desktop sidebar and mobile horizontal-scroll nav — a stricter and cleaner implementation than arm-06's. |
| R-105 | arm-06 | arm-04 | arm-04's true list-controls module is explicitly built so a list's entire filter/sort/page state is bookmarkable in the URL, reused across every admin list page with a shared Badge component — matching or exceeding arm-06's otherwise-systematic order-list infrastructure. |
| R-106 | arm-06 | arm-04 | arm-04's true alert banner reasons about *why* the store is closed and links managers directly to the relevant Settings page (rather than just stating a status), plus a reusable BackLink component — a more thoughtful implementation than arm-06's otherwise-solid chrome. |
| R-188 | arm-06 | arm-04 | arm-04's true component library has seven real primitives (badge/button/card/field/figure/flash/tab-nav) sharing one cn() helper and a consistent CSS-variable token system — more systematic than arm-06's nine hand-written primitives when judged on internal consistency and actual usage, and far ahead of the arm-02 stand-in arm-01 was previously credited with. |
| R-190 | arm-06 | arm-04 | arm-04's true globals.css defines a disciplined semantic token set (each color with a '-soft' variant) explicitly commented 'components never hardcode a hex value,' plus a richer lib/brand.ts (organization/productName/tagline/supportEmail/supportPhone) — the most consistently-applied token system reviewed, ahead of arm-06's shaded-scale approach. |
| R-191 | arm-06 | arm-04 | arm-04's true error-reporting pipeline wires BOTH error.tsx and global-error.tsx to a shared reportClientError() helper, with same-origin enforcement, a global rate limit, a 4KB body cap, zod validation, and inline styles on the global fallback (since globals.css may not have loaded) — the most complete and correctly-wired implementation of any arm in this batch, edging out arm-06's otherwise strong dual-boundary reporting. |

## Full item-by-item results

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up | Change rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| R-091 | Multi-season performance reports + drill-downs | 5 | 8 [CLONE-TIE] | 6 | 9 | 4 [MISSING] | 9 | **arm-04** | arm-06 | arm-04's true build has a dedicated per-season drill-down route with FOUR breakdown axes (product/method/payment/status) — far beyond the mislabeled arm-02 code (single method+product drilldown) it was previously credited with; arm-04 now edges out arm-06's tabbed dual-drilldown. |
| R-092 | CSV export center + audit history | 6 | 8 [CLONE-TIE] | 8 | 9 | 5 | 9 | **arm-04** | arm-06 | arm-04's real exports center is a dedicated page with a season picker and a distinct 'stopped part way' history state, surpassing both the wrongly-graded arm-02 stand-in and arm-06's export center. |
| R-093 | Stripe payment reconciliation | 7 | 8 [CLONE-TIE] | 6 | 8 | 4 | 9 | **arm-06** | arm-04 | — |
| R-094 | Settings hub + Orders tab (store status, package types, pickup, follow-up) | 4 [STUB] | 8 [CLONE-TIE] | 3 [STUB,MISSING] | 9 | 3 [MISSING] | 8 | **arm-04** | arm-06 | arm-04's true Orders-tab settings has full CRUD (add-forms with dimensions/instructions) for package types AND pickup locations, unlike the arm-02 code it was previously credited with (which was otherwise similar) — but critically, arm-01's OWN true build is only a STUB (read-only lists, no CRUD at all), so the old winner (mislabeled arm-01/arm-02 code) no longer applies to arm-01 once graded honestly. |
| R-095 | Settings Shipping tab (rates, rules, delivery ZIPs) | 3 [MISSING] | 8 [CLONE-TIE] | 7 | 9 | 4 | 7 | **arm-04** | arm-02 | Same root cause as R-094: the old winner was arm-01, but that score described arm-02's fully-editable rate/rule tables. arm-01's real Shipping tab is mostly placeholder text ('ready for P8'). arm-04's true build has genuinely structured, editable rates/thresholds/origin/ZIPs/days, making it the new winner. |
| R-096 | Settings Email + Developer tabs | 5 | 7 [CLONE-TIE] | 6 | 9 | 6 | 8 | **arm-04** | arm-06 | arm-04's true Email+Developer tabs include a full letterhead editor, log-retention setting, and genuine deployment facts (runtime/App URL/identity provider) — richer than both the arm-02 stand-in and arm-06's version. |
| R-097 | New-season setup wizard | 6 | 7 [CLONE-TIE] | 5 [PARTIAL] | 10 | 5 | 8 | **arm-04** | arm-06 | arm-04's true new-season wizard lets managers pick a source season, see its real catalog, and individually check which products/add-ons to copy — the most complete and usable wizard reviewed across any arm, surpassing arm-06's simpler copy-from-season field. |
| R-098 | Staff account + permission management | 8 | 8 [CLONE-TIE] | 9 | 10 | 5 [STUB] | 8 | **arm-04** | arm-03 | The old winner (arm-01) was actually grading arm-02's staff manager. arm-01's real staff UI is solid (score 8) but arm-04's true build adds a dedicated per-staff permission page with a live computed 'effective permission' badge and version-based concurrency on every mutation, edging out both arm-01 and arm-03. |
| R-099 | Staff impersonation | 8 | 8 [CLONE-TIE] | 9 | 9 | 5 | 8 | **arm-03** | arm-04 | The old winner (arm-01) was really arm-02's impersonation code. Graded on its own true build, arm-03 uniquely blocks impersonating peers/higher-privileged staff (canImpersonate) — a safety nuance no other arm in this batch implements — making it the new winner over arm-04's still-strong (but not quite as defensive) implementation. |
| R-100 | Administrative activity log | 6 | 7 [CLONE-TIE] | 6 | 7 | 6 | 8 | **arm-06** | arm-04 | — |
| R-101 | Test-environment operations console | 5 | 8 [CLONE-TIE] | 7 | 10 | 7 | 8 | **arm-04** | arm-06 | arm-04's true Testing settings page requires typing the literal word 'WIPE' to confirm the most destructive action — the only arm with typed-confirmation protection — surpassing arm-06's confirm-dialog approach and the arm-02 stand-in previously credited to arm-01. |
| R-102 | Staff help center + guided tours | 2 [STUB] | 7 [CLONE-TIE] | 7 | 9 | 0 [MISSING] | 8 | **arm-04** | arm-06 | arm-04's true help center filters tours to only the screens the signed-in reader can actually open and links directly to them — a permission-aware design not present in arm-06's otherwise-solid 6-tour implementation or the arm-02 code arm-01 was previously credited with. |
| R-103 | Test/live environment switch | 6 | 6 [CLONE-TIE] | 6 | 7 | 6 | 8 | **arm-06** | arm-04 | — |
| R-104 | Admin shell + permission-gated sidebar + mobile nav | 7 | 6 [CLONE-TIE] | 8 | 9 | 3 [STUB] | 8 | **arm-04** | arm-03 | arm-04's true admin shell 403s outright for anyone lacking dashboard.view (rather than rendering an empty shell) on top of a shared permission-filtered nav array reused for desktop sidebar and mobile horizontal-scroll nav — a stricter and cleaner implementation than arm-06's. |
| R-105 | Shared admin list controls (search/pagination/sort/badges) | 6 | 8 [CLONE-TIE] | 8 | 9 | 3 [STUB] | 9 | **arm-04** | arm-06 | arm-04's true list-controls module is explicitly built so a list's entire filter/sort/page state is bookmarkable in the URL, reused across every admin list page with a shared Badge component — matching or exceeding arm-06's otherwise-systematic order-list infrastructure. |
| R-106 | Admin chrome links (visit-store, alert banner, back link) | 6 | 7 [CLONE-TIE] | 8 | 9 | 6 | 8 | **arm-04** | arm-06 | arm-04's true alert banner reasons about *why* the store is closed and links managers directly to the relevant Settings page (rather than just stating a status), plus a reusable BackLink component — a more thoughtful implementation than arm-06's otherwise-solid chrome. |
| R-188 | shadcn-style UI kit | 2 [STUB] | 5 [CLONE-TIE] | 4 [PARTIAL] | 7 | 1 [MISSING] | 6 | **arm-04** | arm-06 | arm-04's true component library has seven real primitives (badge/button/card/field/figure/flash/tab-nav) sharing one cn() helper and a consistent CSS-variable token system — more systematic than arm-06's nine hand-written primitives when judged on internal consistency and actual usage, and far ahead of the arm-02 stand-in arm-01 was previously credited with. |
| R-189 | Custom UI primitives (confirm/empty/FAB/info-hint/page-header/pill/price-tag/smart-select/callout) | 1 [MISSING] | 1 [MISSING,CLONE-TIE] | 1 [MISSING] | 1 [MISSING] | 0 [MISSING] | 2 [MISSING] | **arm-06** | arm-01 | — |
| R-190 | Design tokens + global styles + brand constants | 7 | 7 [CLONE-TIE] | 6 | 9 | 5 | 8 | **arm-04** | arm-06 | arm-04's true globals.css defines a disciplined semantic token set (each color with a '-soft' variant) explicitly commented 'components never hardcode a hex value,' plus a richer lib/brand.ts (organization/productName/tagline/supportEmail/supportPhone) — the most consistently-applied token system reviewed, ahead of arm-06's shaded-scale approach. |
| R-191 | Global error page + root layout (client error reporting) | 2 [THEATER,BROKEN] | 8 [CLONE-TIE] | 3 [THEATER] | 10 | 2 [THEATER,BROKEN] | 9 | **arm-04** | arm-06 | arm-04's true error-reporting pipeline wires BOTH error.tsx and global-error.tsx to a shared reportClientError() helper, with same-origin enforcement, a global rate limit, a 4KB body cap, zod validation, and inline styles on the global fallback (since globals.css may not have loaded) — the most complete and correctly-wired implementation of any arm in this batch, edging out arm-06's otherwise strong dual-boundary reporting. |
| R-192 | Marketing imagery assets | 4 [PARTIAL] | 1 [MISSING,CLONE-TIE] | 2 [STUB] | 0 [MISSING] | 0 [MISSING] | 0 [MISSING] | **arm-01** | arm-03 | — |

## Per-item detail (notes + evidence)

### R-091 — Multi-season performance reports + drill-downs

**Winner changed:** arm-06 → **arm-04**. arm-04's true build has a dedicated per-season drill-down route with FOUR breakdown axes (product/method/payment/status) — far beyond the mislabeled arm-02 code (single method+product drilldown) it was previously credited with; arm-04 now edges out arm-06's tabbed dual-drilldown.

- **arm-01** — 5/10: domain/launch-reporting.ts computes real per-season revenue/orders/customers/donations/fulfillment aggregates AND per-product itemSales, but the Reports page (app/(admin)/admin/reports/page.tsx) never renders itemSales and has no drill-down link/view of any kind for method or product — the data exists, the drill-down feature does not.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical to arm-01 for this file set (verified ground truth); same lib/reports.ts and reports/page.tsx.
- **arm-03** — 6/10: lib/ops/reports.ts performanceReport() returns a byMethod breakdown per season, rendered as an inline sub-list on the one Reports page (components/admin/reports-client.tsx) — a real but shallow 'drill-down by method'; there is no by-product breakdown anywhere and no separate navigable drill-down route.
- **arm-04** — 9/10 🏆: app/(admin)/admin/reports/page.tsx lists every season linking to a dedicated app/(admin)/admin/reports/[seasonId]/page.tsx that shows FOUR real grouped breakdowns (by product, by fulfillment method, by payment method, by order status) via lib/reports/season-performance.ts readSeasonDrilldown() — the most complete multi-axis drill-down of all six arms, true builds included.
- **arm-05** — 4/10 `MISSING`: app/admin/reports/page.tsx + lib/reporting.ts performanceReport() gives one flat per-season row (orders, gross, fulfillment, paid) with NO drill-down by method or product anywhere in the API or UI — a real capability gap vs the spec's 'drill-downs'.
- **arm-06** — 9/10 🥈: app/(admin)/admin/reports/page.tsx: tabbed Performance/Margin UI, season table with channel-mix column, and explicit 'By method' / 'By product' drill-down links (lib/reports/seasons.ts getMethodDrilldown/getProductDrilldown) rendered inline with data-testid hooks — most complete of all six.

*Evidence:* arm-04: `app/(admin)/admin/reports/[seasonId]/page.tsx:1-100; lib/reports/season-performance.ts`; arm-06: `app/(admin)/admin/reports/page.tsx:22-171; lib/reports/seasons.ts`; arm-01: `domain/launch-reporting.ts:63-104 (itemSales computed, never rendered)`

### R-092 — CSV export center + audit history

**Winner changed:** arm-06 → **arm-04**. arm-04's real exports center is a dedicated page with a season picker and a distinct 'stopped part way' history state, surpassing both the wrongly-graded arm-02 stand-in and arm-06's export center.

- **arm-01** — 6/10: domain/launch-exports.ts provides a real 5-dataset streaming CSV export (deliveries/year-end/year-metrics/item-sales/lapsed-customers) with spreadsheet-injection protection and export.completed audit logging, but it is a sub-section of a multi-concern 'LaunchReadinessConsole' component rather than a dedicated export page, and there is no distinct export-history UI — only the generic 200-row Audit page.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical exports page/lib to arm-01.
- **arm-03** — 8/10: Dedicated app/(admin)/admin/exports/page.tsx + components/admin/exports-client.tsx: 6 datasets (incl. SHIPPING_MARGIN), sha256-checksummed CSVs, and a real ExportAudit history list (dataset/rows/bytes/staff/time); the UI never exposes the season-scoping that the backend runCsvExport() already supports.
- **arm-04** — 9/10 🏆: Dedicated app/(admin)/admin/reports/exports/page.tsx with a season picker, 5 downloadable datasets, and a full export-history table (when/file/season/who/rows/size, including a distinct 'stopped part way' state) sourced from a real audit trail — the most complete export center of the three true arms.
- **arm-05** — 5/10: No dedicated export center — 3 CSV export links (year_metrics/item_sales/shipping_margin) folded inline into the Reports page (lib/reporting.ts exportCsv). Audit history for exports IS shown (auditEvent rows), but far fewer datasets and no season-scoped export selector for most datasets.
- **arm-06** — 9/10 🥈: Dedicated app/(admin)/admin/export/page.tsx: permission-filtered EXPORT_DATASET_LIST cards, season selector, streamed downloads, and a rich export-history table (actor, rows, filename) sourced from AuditLog action=export_csv.

*Evidence:* arm-04: `app/(admin)/admin/reports/exports/page.tsx:1-116; lib/reports/export-service.ts`; arm-06: `app/(admin)/admin/export/page.tsx:1-117`; arm-01: `domain/launch-exports.ts; components/launch-readiness-console.tsx:147-181`

### R-093 — Stripe payment reconciliation

**Winner unchanged:** **arm-06** (runner-up: arm-04).

- **arm-01** — 7/10: domain/stripe-reconciliation.ts reconcileStripePayments() checks succeeded-without-payment, amount-mismatch, and orphan-provider-intent, idempotent via runKey/identityKey, cron-triggered and audited — but the only UI surface is a toast message with a finding count on the Reports page; there is no findings table.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical lib/payments/reconcile.ts and recon-panel.tsx.
- **arm-03** — 6/10: Dedicated app/(admin)/admin/reconcile/page.tsx + run history, but lib/ops/reconcile.ts's matcher only detects one finding type (ORPHANED_PAYMENT_INTENT) — no amount-mismatch or ledger-only-payment detection despite the module comment implying broader coverage.
- **arm-04** — 8/10 🥈: Dedicated app/(admin)/admin/reports/payments/page.tsx with a findings table across 3 kinds (ORPHANED_INTENT/AMOUNT_MISMATCH/MISSING_INTENT), status badges, a manual re-run server action, and run history — solid two-directional coverage, though one fewer finding kind than arm-06's five.
- **arm-05** — 4/10: runStripeReconciliation() in lib/reporting.ts only checks one direction — orphaned StripePaymentIntent rows with paymentId===null — and writes an AuditEvent; no amount-mismatch, ledger-only-payment, or refund-failure detection. Triggered by a button on the Reports page, no dedicated UI/history table beyond the generic audit list.
- **arm-06** — 9/10 🏆: Dedicated app/(admin)/admin/reconciliation/page.tsx backed by a ReconciliationRun/finding model with 5 finding kinds (ORPHANED_INTENT/MISSING_PAYMENT/AMOUNT_MISMATCH/STALE_MIRROR/STATUS_DRIFT), run history table, checked/matched/flagged counters, and a driver-mode badge. Most thorough implementation.

*Evidence:* arm-06: `app/(admin)/admin/reconciliation/page.tsx:1-140`; arm-04: `app/(admin)/admin/reports/payments/page.tsx:1-113; lib/payments/reconciliation.ts:120-165`; arm-01: `domain/stripe-reconciliation.ts:32-150`

### R-094 — Settings hub + Orders tab (store status, package types, pickup, follow-up)

**Winner changed:** arm-01 → **arm-04**. arm-04's true Orders-tab settings has full CRUD (add-forms with dimensions/instructions) for package types AND pickup locations, unlike the arm-02 code it was previously credited with (which was otherwise similar) — but critically, arm-01's OWN true build is only a STUB (read-only lists, no CRUD at all), so the old winner (mislabeled arm-01/arm-02 code) no longer applies to arm-01 once graded honestly.

- **arm-01** — 4/10 `STUB`: components/settings-hub.tsx Orders tab: store-status open/closed + schedule and a follow-up-days field are real and editable, but package types and pickup locations are rendered as read-only lists — no add/edit/deactivate route exists anywhere in the codebase for either.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical orders-tab.tsx.
- **arm-03** — 3/10 `STUB,MISSING`: components/admin/settings-hub.tsx Orders tab shows package types and pickup locations as read-only lists with no CRUD anywhere; store status is delegated entirely to the Seasons page (not present in Settings at all); and the settings key for follow-up (store.pickupFollowUp) is defined but never read or exposed in any UI — a dead setting.
- **arm-04** — 9/10 🏆: app/(admin)/admin/settings/page.tsx: a real store open/closed toggle, a genuine follow-up-days editor, and full add-forms for both package types (with L×W×H/weight) and pickup locations (full street address + instructions) — the only true arm where every Orders-tab sub-feature is actually editable end-to-end.
- **arm-05** — 3/10 `MISSING`: app/admin/settings/page.tsx Orders section has only a store-status OPEN/CLOSED select; the UI text literally admits 'Package types, pickup locations, and follow-up rules will be connected in later operations phases' — those admin controls do not exist anywhere in the app despite the underlying Prisma models existing.
- **arm-06** — 8/10 🥈: settings-tabs.tsx Orders tab: store-status display, package-type add/deactivate list (with L×W×H/weight), pickup-location add/deactivate list. Follow-up is implemented as its own full admin page/work-queue (app/(admin)/admin/follow-ups) rather than a Settings toggle — functionally present but organizationally different from the Settings-tab spec.

*Evidence:* arm-04: `app/(admin)/admin/settings/page.tsx:1-173`; arm-06: `app/(admin)/admin/settings/settings-tabs.tsx:193-271; lib/admin/follow-ups.ts`; arm-03: `components/admin/settings-hub.tsx:129-156; lib/storefront/settings-keys.ts:4 (dead pickupFollowUp key)`

### R-095 — Settings Shipping tab (rates, rules, delivery ZIPs)

**Winner changed:** arm-01 → **arm-04**. Same root cause as R-094: the old winner was arm-01, but that score described arm-02's fully-editable rate/rule tables. arm-01's real Shipping tab is mostly placeholder text ('ready for P8'). arm-04's true build has genuinely structured, editable rates/thresholds/origin/ZIPs/days, making it the new winner.

- **arm-01** — 3/10 `MISSING`: components/settings-hub.tsx Shipping tab: only the delivery-ZIP allowlist is really editable; the 'Rates' and 'Delivery rules' cards are literal placeholder text ('Rate rules are ready for live carrier pricing in P8' / 'Fee rules arrive with checkout') — no editable rate table, fee rules, or delivery-day picker exist anywhere.
- **arm-02** — 8/10 `CLONE-TIE` 🥈: Byte-identical shipping-tab.tsx.
- **arm-03** — 7/10: components/admin/settings-hub.tsx Shipping tab: editable delivery-ZIP list with a live ZIP-checker hitting the real storefront API, plus editable shipping-rates and shipping-rules persisted as raw JSON text areas — genuinely saved and read live, though unstructured and with no Purim delivery-day picker.
- **arm-04** — 9/10 🏆: app/(admin)/admin/settings/shipping/page.tsx: editable base shipping rate + free-shipping threshold, a full ship-from origin address actually used for carrier quoting and label printing, an editable delivery-ZIP list, and an editable delivery-day list — the most complete and genuinely structured shipping settings of the three true arms.
- **arm-05** — 4/10: Settings page Shipping section has only editable delivery-ZIP textarea and delivery-dates textarea; no rate table and no fee-rule editor anywhere — text even says 'Live carrier rates arrive in P8.'
- **arm-06** — 7/10: settings-tabs.tsx Shipping tab: editable ZIP allowlist, editable bulk/per-package delivery fees, editable delivery days — all live-persisted. The 'Shipping rules' section is present but read-only/display-only (no add/edit form), slightly thinner than the clone cluster's fully editable rate+rule tables.

*Evidence:* arm-04: `app/(admin)/admin/settings/shipping/page.tsx:1-149`; arm-02: `components/admin/settings/shipping-tab.tsx:1-128`; arm-01: `components/settings-hub.tsx:250-286 (placeholder rate/rule text)`

### R-096 — Settings Email + Developer tabs

**Winner changed:** arm-06 → **arm-04**. arm-04's true Email+Developer tabs include a full letterhead editor, log-retention setting, and genuine deployment facts (runtime/App URL/identity provider) — richer than both the arm-02 stand-in and arm-06's version.

- **arm-01** — 5/10: components/settings-hub.tsx Email tab: sender-name field plus a test-send that only reports 'queued' (no sent/captured distinction); Developer tab is a single webhook-label field plus two static info cards. A fuller campaign platform exists as a separate Email Hub page, but the Settings tabs themselves are thin.
- **arm-02** — 7/10 `CLONE-TIE`: Byte-identical email-tab.tsx / developer-tab.tsx.
- **arm-03** — 6/10: components/admin/settings-hub.tsx Email tab: from/reply-to fields plus a test-send that distinguishes 'captured' vs 'sent' outcomes; Developer tab is a single free-text notes field with a placeholder note ('Test mode / launch readiness land in P12') — no real deployment facts or dev tooling.
- **arm-04** — 9/10 🏆: app/(admin)/admin/settings/email/page.tsx: from/reply-to, a full letterhead editor (logo/accent-colour/footer text), a log-retention-days setting, and a real outcome-reporting test-send; app/(admin)/admin/settings/developer/page.tsx shows genuine deployment facts (runtime/App URL/identity provider/media storage/proxy trust) plus recent cron-run history — the richest of the three true arms.
- **arm-05** — 6/10: Email section is comparatively rich (campaign drafts, send/test-send, transactional-template + branding viewer, outbox count) but lives inline on the general Settings page rather than a distinct tab; Developer section is a single sentence with zero real controls.
- **arm-06** — 8/10 🥈: settings-tabs.tsx Email tab shows live delivery-mode badges for email (live Resend / fixture / capture) and SMS (live Twilio / capture) plus a real test-send that reports provider id, and links out to the fuller /admin/email campaign platform. Developer tab reports the actual storage driver and notes API-key scope. More informative than the clone cluster's static text, still no real API-key management.

*Evidence:* arm-04: `app/(admin)/admin/settings/email/page.tsx:1-165; app/(admin)/admin/settings/developer/page.tsx:1-81`; arm-06: `app/(admin)/admin/settings/settings-tabs.tsx:359-436`; arm-01: `components/settings-hub.tsx:288-328`

### R-097 — New-season setup wizard

**Winner changed:** arm-06 → **arm-04**. arm-04's true new-season wizard lets managers pick a source season, see its real catalog, and individually check which products/add-ons to copy — the most complete and usable wizard reviewed across any arm, surpassing arm-06's simpler copy-from-season field.

- **arm-01** — 6/10: components/settings-hub.tsx has a single-step form (name/year/source-season dropdown) whose API (domain/seasons.ts createSeasonFromTemplate) genuinely copies fulfillment methods, package types, pickup locations, products+options and add-on links, and sets replacementProductId — functionally solid but no per-product picking and no explicit 'wizard' UI.
- **arm-02** — 7/10 `CLONE-TIE`: Byte-identical season-management.tsx and seasons API route.
- **arm-03** — 5/10 `PARTIAL`: components/admin/seasons-admin.tsx season-creation form (name/year/slug/scheduled-open) never sends copyFromSeasonId even though lib/seasons/manage.ts createSeason()/copyCatalogShell() fully supports catalog copying server-side — that parameter is only ever exercised by a smoke test, so every season created through the real UI starts with an empty catalog.
- **arm-04** — 10/10 🏆: app/(admin)/admin/seasons/new/page.tsx is a genuine one-screen wizard: pick a season to copy from, the page reloads showing that season's real catalogue with each product individually checkable, independently toggle add-on copying and replacement-mapping linking, then create — the most complete and actually usable new-season wizard of any arm reviewed, true builds included.
- **arm-05** — 5/10: app/admin/seasons/page.tsx 'New-season setup' section: name/year/scheduled-opening form only — no catalog-copy option in the UI or the POST handler (grep confirms no copyFrom/copyCatalog field in the seasons API), so next season starts with an empty catalog every time. Still has useful replacement-mapping and staff-repeat sections alongside it.
- **arm-06** — 8/10 🥈: app/(admin)/admin/seasons/season-manager.tsx explicit wizard fields (name, copy-from-season, scheduled open/close) calling a server-side createSeasonWizard() (app/api/admin/seasons/route.ts) that performs the catalog copy — same completeness as the clone cluster plus explicitly named 'wizard' semantics.

*Evidence:* arm-04: `app/(admin)/admin/seasons/new/page.tsx:1-162`; arm-06: `app/(admin)/admin/seasons/season-manager.tsx:33-84; app/api/admin/seasons/route.ts:39-58`; arm-03: `components/admin/seasons-admin.tsx:34-57 (copyFromSeasonId never sent by the UI)`

### R-098 — Staff account + permission management

**Winner changed:** arm-01 → **arm-04**. The old winner (arm-01) was actually grading arm-02's staff manager. arm-01's real staff UI is solid (score 8) but arm-04's true build adds a dedicated per-staff permission page with a live computed 'effective permission' badge and version-based concurrency on every mutation, edging out both arm-01 and arm-03.

- **arm-01** — 8/10: app/(admin)/admin/staff/staff-manager.tsx: invite with a one-time token, role change, revoke, and a full grant/deny-per-permission checkbox grid; self-edit is blocked server-side (app/api/admin/staff/route.ts) with optimistic concurrency via a version field.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical staff-manager.tsx.
- **arm-03** — 9/10 🥈: components/admin/staff-manager.tsx: invite/role/revoke/impersonate plus per-permission grant-deny selects; app/api/staff/route.ts explicitly blocks self role/override/revoke changes and returns a distinct 409 on version conflicts; impersonation is additionally blocked against peers/higher-privileged staff (canImpersonate).
- **arm-04** — 10/10 🏆: app/(admin)/admin/staff/page.tsx + staff/[staffUserId]/page.tsx: invite/role/status/impersonate all self-protected at both UI and server level, a dedicated per-staff permission-override page with INHERIT/GRANT/DENY selects and a live computed 'effective' badge, version-based concurrency on every mutation — the most complete and safest of the three true arms.
- **arm-05** — 5/10 `STUB`: app/admin/staff/page.tsx supports invite (with a manual Clerk-user-ID field), revoke, and impersonate, and the PATCH API (lib/staff-store.ts) accepts a partial permission-overrides record server-side — but the staff list UI never renders an override editor, so per-permission grant/deny is unreachable from the admin screen despite being modeled.
- **arm-06** — 8/10: app/(admin)/admin/staff/[id]/staff-editor.tsx: role select, full PERMISSIONS grid with INHERIT/GRANT/DENY per permission, optimistic-concurrency version field, revoke — on par with the clone cluster, split across a list page + dedicated edit page instead of one page.

*Evidence:* arm-04: `app/(admin)/admin/staff/page.tsx:1-160; app/(admin)/admin/staff/[staffUserId]/page.tsx:1-109`; arm-03: `components/admin/staff-manager.tsx:1-187; app/api/staff/route.ts:80-186`; arm-01: `app/(admin)/admin/staff/staff-manager.tsx:90-202`

### R-099 — Staff impersonation

**Winner changed:** arm-01 → **arm-03**. The old winner (arm-01) was really arm-02's impersonation code. Graded on its own true build, arm-03 uniquely blocks impersonating peers/higher-privileged staff (canImpersonate) — a safety nuance no other arm in this batch implements — making it the new winner over arm-04's still-strong (but not quite as defensive) implementation.

- **arm-01** — 8/10: app/api/admin/impersonation/route.ts: permission-gated start/stop, blocks self-impersonation, requires target ACTIVE, cookie-based session, audits both start and stop; app/(admin)/admin/layout.tsx shows a persistent banner with a stop button while active.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical impersonate route and banner.
- **arm-03** — 9/10 🏆: app/api/impersonate/route.ts blocks self-impersonation AND blocks impersonating a peer or higher-privileged staff member via canImpersonate() — a nuance no other arm in this batch implements — audited on both start and stop, with a persistent banner + stop button in components/admin/shell.tsx.
- **arm-04** — 9/10 🥈: Permission-gated 'Sign in as' per staff row (hidden for self and for inactive targets), a persistent banner naming both the real actor and the acting identity with a one-click stop, and every action taken while impersonating is recorded under both names in the audit log.
- **arm-05** — 5/10: app/api/staff/[staffId]/route.ts action=impersonate calls startImpersonation() with active-status and self-impersonation checks, but there's no visible on-screen banner/indicator anywhere else confirming an active impersonation session or a one-click stop control outside the staff page itself.
- **arm-06** — 8/10: app/api/admin/staff/[id]/impersonate + .../impersonation/stop routes, plus components/admin/impersonation-banner.tsx rendered in the admin layout whenever ctx.impersonator is set — same completeness as the clone cluster.

*Evidence:* arm-03: `app/api/impersonate/route.ts:1-80; components/admin/shell.tsx:52-57`; arm-04: `app/(admin)/admin/staff/page.tsx:140-148; app/(admin)/admin/impersonation-banner.tsx:1-26`; arm-01: `app/api/admin/impersonation/route.ts:1-108`

### R-100 — Administrative activity log

**Winner unchanged:** **arm-06** (runner-up: arm-04).

- **arm-01** — 6/10: app/(admin)/admin/audit/page.tsx: permission-gated (audit:view) 200-row AuditLog list (action/target/actor/time); no search/filter/pagination, and metadata/detail is never rendered at all — safe from leakage but incomplete for real investigation.
- **arm-02** — 7/10 `CLONE-TIE`: Byte-identical audit page.
- **arm-03** — 6/10: app/(admin)/admin/audit/page.tsx: permission-gated (audit.read), 50-row list showing action/actor/target/time; no filter/pagination, no metadata rendered.
- **arm-04** — 7/10 🥈: app/(admin)/admin/audit/page.tsx: permission-gated (audit.view), 100-row table that additionally shows impersonation context ('actor (as target)') — a genuine plus — but the 'Detail' column dumps raw JSON.stringify(event.detail) unredacted, the same PII-exposure pattern as the other true arms.
- **arm-05** — 6/10: app/admin/audit/page.tsx renders AuditEvent rows (action/details/createdAt) via /api/audit — functional but no permission-gate check visible in the page itself (relies on the API), no filtering, and details are dumped as raw key:value strings, no redaction.
- **arm-06** — 8/10 🏆: app/(admin)/admin/audit/page.tsx adds real PII redaction (SENSITIVE_METADATA_KEYS hidden unless the viewer holds customers.manage) and color-coded action badges (bootstrap/staff_create/role_change/impersonation/client_error) — a genuine safety improvement over the other arms' raw-JSON dumps.

*Evidence:* arm-06: `app/(admin)/admin/audit/page.tsx:1-40`; arm-04: `app/(admin)/admin/audit/page.tsx:1-59`; arm-01: `app/(admin)/admin/audit/page.tsx:1-38`

### R-101 — Test-environment operations console

**Winner changed:** arm-06 → **arm-04**. arm-04's true Testing settings page requires typing the literal word 'WIPE' to confirm the most destructive action — the only arm with typed-confirmation protection — surpassing arm-06's confirm-dialog approach and the arm-02 stand-in previously credited to arm-01.

- **arm-01** — 5/10: No dedicated console route — a panel embedded in the Reports page (components/launch-readiness-console.tsx), double-gated (client env flag + server-side assertTestConsoleEnabled 404), and safely scoped wipe/seed to a fixture-prefixed subset, but zero confirm dialogs before destructive clicks.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical test-console page.
- **arm-03** — 7/10: Dedicated app/(admin)/admin/test-ops/page.tsx + components/admin/test-ops-client.tsx: a live test-mode toggle, dress-rehearsal, scale-print-probe and wipe actions, gated on settings.write; no confirm dialog before the wipe action.
- **arm-04** — 10/10 🏆: app/(admin)/admin/settings/testing/page.tsx: a master test-mode toggle disables every destructive button until turned on, season-scoped seed/reset actions, and a full wipe that requires literally typing 'WIPE' into a field to submit — the only true arm with typed-confirmation protection on its most dangerous action.
- **arm-05** — 7/10: app/admin/test-console/page.tsx checks /api/admin/test-console for testMode and only renders seed/wipe/reset buttons when enabled, with window.confirm() gates on destructive actions — functionally solid though less descriptive of what each action preserves.
- **arm-06** — 8/10 🥈: app/(admin)/admin/test-ops/page.tsx explicitly disables (not 404s) with a clear message when APP_ENV!=='test'; TestOpsConsole lists 4 explicit actions (seed/clear/wipe/reset) each with its own confirm text describing exactly what survives — the clearest UX of the three.

*Evidence:* arm-04: `app/(admin)/admin/settings/testing/page.tsx:1-138`; arm-06: `app/(admin)/admin/test-ops/test-ops-console.tsx:1-50`; arm-01: `components/launch-readiness-console.tsx:204-218; domain/test-console.ts:12-19`

### R-102 — Staff help center + guided tours

**Winner changed:** arm-06 → **arm-04**. arm-04's true help center filters tours to only the screens the signed-in reader can actually open and links directly to them — a permission-aware design not present in arm-06's otherwise-solid 6-tour implementation or the arm-02 code arm-01 was previously credited with.

- **arm-01** — 2/10 `STUB`: The 'help center' is 4 buttons inside components/launch-readiness-console.tsx that POST a tour-completion timestamp to the database (app/api/admin/help/route.ts) — there is no actual step-by-step content or walkthrough text shown anywhere; clicking a button teaches nothing.
- **arm-02** — 7/10 `CLONE-TIE`: Byte-identical help page.
- **arm-03** — 7/10: app/(admin)/admin/help/page.tsx: 4 real tours with genuine, screen-specific step content (season-open checklist, nightly print batch, shipping margin, legacy import) — fewer tours than the other arms but every one is substantive.
- **arm-04** — 9/10 🏆: app/(admin)/admin/help/page.tsx + lib/help/tours.ts: tours are filtered to only the screens the signed-in reader can actually open, each with a 'when', numbered steps, and a direct link to open that real screen — the most thoughtful and permission-aware help implementation of the three true arms.
- **arm-05** — 0/10 `MISSING`: No help/tour page, component, or route exists anywhere in the tree (grep for help/tour/guided returns nothing) — the feature was never built.
- **arm-06** — 8/10 🥈: app/(admin)/admin/help/page.tsx: 6 tours each with an intro line plus numbered steps that reference real screen names and behaviors (e.g. reconciliation rerun semantics, legacy import staging) — slightly more detailed/accurate to the rest of the codebase than the clone cluster's version.

*Evidence:* arm-04: `app/(admin)/admin/help/page.tsx:1-74; lib/help/tours.ts`; arm-06: `app/(admin)/admin/help/page.tsx:1-104`; arm-01: `components/launch-readiness-console.tsx:220-235 (completion tracker, no content)`

### R-103 — Test/live environment switch

**Winner unchanged:** **arm-06** (runner-up: arm-04).

- **arm-01** — 6/10: environment-mode is a real persisted AppSetting (not just derived from env vars), toggled by two buttons inside the (env-gated) test console and shown as a TEST MODE layout banner; no cross-deployment link to a live/test counterpart URL.
- **arm-02** — 6/10 `CLONE-TIE`: Byte-identical test-mode.ts.
- **arm-03** — 6/10: lib/ops/test-ops.ts setTestMode()/getTestMode() persists a real {enabled, env} setting toggled from the dedicated Test-ops console and gates all destructive actions on it; no cross-deployment URL link either.
- **arm-04** — 7/10 🥈: A persisted, permission-gated test-mode toggle (Settings → Testing) drives an undismissable banner shown on every admin AND storefront page (components/test-mode-banner.tsx); still no click-through link to a separate live/test deployment URL.
- **arm-05** — 6/10: Admin layout shows a static TEST MODE / LIVE MODE text banner driven by process.env.TEST_MODE — informative but, like the clone cluster, offers no cross-deployment link.
- **arm-06** — 8/10 🏆: components/test-mode-banner.tsx implements the switch in both directions: on the test deployment a fuchsia banner includes a 'Go to live ↗' link (env.LIVE_BASE_URL); on the live deployment the header renders a 'Test env ↗' link (env.TEST_BASE_URL) via TestEnvSwitch(). This is the only arm that actually implements a clickable environment switch rather than just a status indicator.

*Evidence:* arm-06: `components/test-mode-banner.tsx:1-37`; arm-04: `app/(admin)/admin/settings/testing/page.tsx:49-65; components/test-mode-banner.tsx:1-25`; arm-01: `app/api/admin/test-console/route.ts:31-36`

### R-104 — Admin shell + permission-gated sidebar + mobile nav

**Winner changed:** arm-06 → **arm-04**. arm-04's true admin shell 403s outright for anyone lacking dashboard.view (rather than rendering an empty shell) on top of a shared permission-filtered nav array reused for desktop sidebar and mobile horizontal-scroll nav — a stricter and cleaner implementation than arm-06's.

- **arm-01** — 7/10: app/(admin)/admin/layout.tsx: genuinely permission-gated nav (per-link hasPermission checks) with a responsive 'overflow-x-auto md:flex-col' pattern that turns into a horizontal-scroll row on mobile — better mobile behaviour than the byte-identical arm-02 baseline it was previously conflated with.
- **arm-02** — 6/10 `CLONE-TIE`: Byte-identical admin layout.
- **arm-03** — 8/10 🥈: components/admin/shell.tsx: a NAV array filtered by a permission Set, with a genuinely distinct desktop sidebar ('hidden ... md:block') and a separate horizontal-pill mobile nav ('md:hidden') — the cleanest desktop/mobile split of the three true arms.
- **arm-04** — 9/10 🏆: app/(admin)/admin/layout.tsx: a single ADMIN_NAV source filtered by permission and reused for both the desktop sidebar and a horizontal-scroll mobile nav, plus the whole admin shell itself 403s for anyone lacking dashboard.view rather than rendering an empty shell around a 403.
- **arm-05** — 3/10 `STUB`: app/admin/layout.tsx sidebar is a fully static, unconditional list of every admin link regardless of the signed-in staff member's role or permissions — there is no permission filtering in the layout at all (a DRIVER or low-privilege STAFF sees every nav entry, though the underlying pages/APIs presumably still gate access). Mobile: sidebar collapses to a horizontal inline-link row below 700px via CSS, no hamburger.
- **arm-06** — 8/10: app/(admin)/admin/layout.tsx builds the nav array conditionally per hasPermission() check (payments/customers/email/fulfillment/catalog/settings/staff/audit each gate their own section) plus a forbidden() redirect for non-admin roles. Sidebar component uses 'overflow-x-auto ... md:w-52 md:flex-col' — a horizontal-scroll nav on mobile, vertical sidebar on desktop — the most complete mobile-responsive + permission-gated combo of the six.

*Evidence:* arm-04: `app/(admin)/admin/layout.tsx:14-78; components/admin/nav-items.ts`; arm-03: `components/admin/shell.tsx:46-123`; arm-06: `app/(admin)/admin/layout.tsx:13-68; components/admin/sidebar.tsx:12-34`

### R-105 — Shared admin list controls (search/pagination/sort/badges)

**Winner changed:** arm-06 → **arm-04**. arm-04's true list-controls module is explicitly built so a list's entire filter/sort/page state is bookmarkable in the URL, reused across every admin list page with a shared Badge component — matching or exceeding arm-06's otherwise-systematic order-list infrastructure.

- **arm-01** — 6/10: app/(admin)/admin/orders/page.tsx: real search (order#/reference/customer/email) + status/payment filters + prev/next pagination; status/payment are rendered as raw enum text — no shared Badge/pill component exists anywhere in the codebase.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical lib/orders/list.ts and order-badges.tsx.
- **arm-03** — 8/10: components/admin/orders-list.tsx: real search + status/paymentStatus filters + server-side page/pageSize/total pagination, plus bulk selection with per-row expected-version optimistic concurrency and a window.confirm() before bulk-repeat.
- **arm-04** — 9/10 🏆: components/admin/list-controls.tsx: genuinely shared, URL-driven ListSearch + Pagination + BackLink components (lib/admin/list-query.ts) explicitly built so a list's whole state is bookmarkable in its URL, reused across admin list pages together with a real Badge component for status.
- **arm-05** — 3/10 `STUB`: No dedicated orders list page exists at all (only app/admin/orders/[orderId] detail); the Operations page hard-caps to 'orders.filter(...).slice(0, 100)' with no search box, no sort control, and no pagination UI anywhere in the admin surface. No shared badge/pagination component exists in the tree.
- **arm-06** — 9/10 🥈: lib/admin/order-list.ts (parseOrderListParams/buildOrderWhere/buildListHref/clampPage/pageCount/LIST_PAGE_SIZES) + components/admin/pagination-nav.tsx (explicitly commented 'Shared Prev/Next for the admin list pages (R-105)') + components/admin/order-badges.tsx — genuinely reusable, URL-driven search/filter/sort/pagination infrastructure, the most systematic of the six.

*Evidence:* arm-04: `components/admin/list-controls.tsx:1-127`; arm-06: `components/admin/pagination-nav.tsx:1-39; lib/admin/order-list.ts`; arm-03: `components/admin/orders-list.tsx:20-80`

### R-106 — Admin chrome links (visit-store, alert banner, back link)

**Winner changed:** arm-06 → **arm-04**. arm-04's true alert banner reasons about *why* the store is closed and links managers directly to the relevant Settings page (rather than just stating a status), plus a reusable BackLink component — a more thoughtful implementation than arm-06's otherwise-solid chrome.

- **arm-01** — 6/10: app/(admin)/admin/layout.tsx: 'Visit store ↗' link, a persistent impersonation banner with a stop button, and a genuinely reusable BackLink (window.history.back()) used on 3 detail pages; the 'alert banner' is a static admin-editable message, not a dynamic season-closed indicator.
- **arm-02** — 7/10 `CLONE-TIE`: Byte-identical layout chrome.
- **arm-03** — 8/10: components/admin/shell.tsx: 'Visit store →' link, a dynamic alert banner tied to a real admin-editable {message, active} setting (data-testid=admin-alert-banner), an impersonation banner + stop button, and a static '← Admin home' link.
- **arm-04** — 9/10 🏆: 'Visit store' + Help header links, a dynamic 'no season open' alert banner (components/admin/alert-banner.tsx, explicitly commented R-106) that reasons about *why* the store is closed and offers managers a direct Settings link, an impersonation banner + stop, and a reusable BackLink component used on detail pages.
- **arm-05** — 6/10: app/admin/layout.tsx: 'Visit store' link and a static '← Back to admin overview' link on every page (less useful than a contextual back-link, but present everywhere) plus a TEST/LIVE MODE alert line; no closed-season alert banner distinct from the mode banner.
- **arm-06** — 8/10 🥈: app/(admin)/admin/layout.tsx: 'Visit store ↗' header link, a closed-season banner explicitly commented 'R-106', an impersonation banner, plus a dedicated reusable components/admin/back-link.tsx used on detail pages — the only arm with a genuinely shared/reusable back-link component.

*Evidence:* arm-04: `components/admin/alert-banner.tsx:1-45; app/(admin)/admin/layout.tsx:22-31; components/admin/list-controls.tsx:118-127`; arm-06: `app/(admin)/admin/layout.tsx:75-90; components/admin/back-link.tsx`; arm-03: `components/admin/shell.tsx:52-93`

### R-188 — shadcn-style UI kit

**Winner changed:** arm-06 → **arm-04**. arm-04's true component library has seven real primitives (badge/button/card/field/figure/flash/tab-nav) sharing one cn() helper and a consistent CSS-variable token system — more systematic than arm-06's nine hand-written primitives when judged on internal consistency and actual usage, and far ahead of the arm-02 stand-in arm-01 was previously credited with.

- **arm-01** — 2/10 `STUB`: Only one primitive exists in the whole codebase: components/button.tsx (tone=primary/secondary) — no badge, card, input, or modal component anywhere.
- **arm-02** — 5/10 `CLONE-TIE`: Byte-identical components/ui/*.
- **arm-03** — 4/10 `PARTIAL`: components/ui/button.tsx (4 variants) + components/ui/input.tsx sharing a lib/cn.ts helper — a real variant/cn convention but far short of a 'kit' (no badge/card/modal/select anywhere).
- **arm-04** — 7/10 🏆: components/ui/{badge,button,card,field,figure,flash,tab-nav}.tsx — seven real primitives, all sharing one cn() helper and a consistent CSS-variable token system — the most systematic true-arm UI kit, though still hand-written rather than Radix/shadcn-CLI-scaffolded.
- **arm-05** — 1/10 `MISSING`: No components/ui directory exists at all — the app renders plain HTML elements with global CSS classes (className="button"/"card"/"eyebrow") defined in app/styles.css. No component-based UI kit of any kind, shadcn-style or otherwise.
- **arm-06** — 6/10 🥈: components/ui/{badge,button,card,dialog,filter-chip,input,label,select,address-fields}.tsx — 9 primitives including a real Dialog and a FilterChip, plus clsx+tailwind-merge dependencies for a cn() utility, which is the actual shadcn convention (though components are still hand-written, not Radix-backed or CLI-scaffolded).

*Evidence:* arm-04: `components/ui/ (7 files); components/ui/card.tsx:1-21; components/ui/badge.tsx:1-27`; arm-06: `components/ui/ (9 files); package.json clsx/tailwind-merge deps`; arm-03: `components/ui/button.tsx:1-28; components/ui/input.tsx:1-14`

### R-189 — Custom UI primitives (confirm/empty/FAB/info-hint/page-header/pill/price-tag/smart-select/callout)

**Winner unchanged:** **arm-06** (runner-up: arm-01).

- **arm-01** — 1/10 `MISSING` 🥈: None of the nine named primitives exist anywhere in components/ or app/; confirmations use window.confirm().
- **arm-02** — 1/10 `MISSING,CLONE-TIE`: Byte-identical component set — same absence.
- **arm-03** — 1/10 `MISSING`: None of the nine named primitives exist; destructive actions (e.g. bulk-repeat) use window.confirm() rather than a shared Confirm dialog.
- **arm-04** — 1/10 `MISSING`: None of the nine named primitives exist anywhere in the codebase (grep across components/ returns no matches).
- **arm-05** — 0/10 `MISSING`: No matches for any of the nine named primitives; no components/ui directory exists at all in this arm.
- **arm-06** — 2/10 `MISSING` 🏆: Only 2 partial hits: components/order-builder/mobile-cart-fab.tsx (a real FAB, but storefront-only, not a generic admin/app-wide primitive) and app/invite/[token]/confirm-invite-button.tsx (a one-off confirm button, not a shared Confirm dialog primitive). None of empty-state/info-hint/page-header/pill/price-tag/smart-select/callout exist anywhere.

*Evidence:* arm-06: `components/order-builder/mobile-cart-fab.tsx; app/invite/[token]/confirm-invite-button.tsx (only 2 loose hits)`; arm-01: `grep -riE confirm|empty|fab|hint|page-header|pill|price-tag|smart-select|callout components/ app/ → no matches`; arm-04: `grep across components/ → no matches`

### R-190 — Design tokens + global styles + brand constants

**Winner changed:** arm-06 → **arm-04**. arm-04's true globals.css defines a disciplined semantic token set (each color with a '-soft' variant) explicitly commented 'components never hardcode a hex value,' plus a richer lib/brand.ts (organization/productName/tagline/supportEmail/supportPhone) — the most consistently-applied token system reviewed, ahead of arm-06's shaded-scale approach.

- **arm-01** — 7/10: app/globals.css defines a flat CSS-variable palette (ink/muted/surface/border/brand-*/danger/warning) mapped into a Tailwind @theme block, plus lib/brand.ts (name/program/tagline); single-shade tokens, no 50-900 scale.
- **arm-02** — 7/10 `CLONE-TIE`: Byte-identical globals.css and lib/brand.ts.
- **arm-03** — 6/10: app/globals.css defines a small, real CSS-variable palette (forest/leaf/cream/ink/accent/danger) plus radius tokens and two Google-Fonts-loaded display/body fonts, and lib/brand.ts includes a colors sub-object; thinner than arm-04's set but genuinely used throughout components via var(--color-*).
- **arm-04** — 9/10 🏆: app/globals.css defines a disciplined semantic token set (surface/ink/line/brand/danger/success/warning, each with a '-soft' variant), explicitly commented 'components never hardcode a hex value', mapped into @theme, plus lib/brand.ts (organization/productName/tagline/supportEmail/supportPhone) — the richest and most consistently-applied token system of the three true arms.
- **arm-05** — 5/10: app/styles.css defines a small CSS-variable palette (--ink/--paper/--accent/--muted/--line) with real responsive breakpoints for storefront + admin shell, but there is no lib/brand.ts — the org name/tagline are hardcoded inline in individual pages rather than centralized brand constants.
- **arm-06** — 8/10 🥈: app/globals.css defines a fuller Tailwind @theme token scale (brand-50/100/200/600/700/900, accent-100/500/600) plus lib/brand.ts (BRAND.orgName/productName/tagline/supportEmail) — a proper shaded design-token scale, richer than the clone cluster's flat single-shade tokens.

*Evidence:* arm-04: `app/globals.css:1-24; lib/brand.ts:1-9`; arm-06: `app/globals.css:1-21; lib/brand.ts:1-7`; arm-01: `app/globals.css:1-17; lib/brand.ts:1-5`

### R-191 — Global error page + root layout (client error reporting)

**Winner changed:** arm-06 → **arm-04**. arm-04's true error-reporting pipeline wires BOTH error.tsx and global-error.tsx to a shared reportClientError() helper, with same-origin enforcement, a global rate limit, a 4KB body cap, zod validation, and inline styles on the global fallback (since globals.css may not have loaded) — the most complete and correctly-wired implementation of any arm in this batch, edging out arm-06's otherwise strong dual-boundary reporting.

- **arm-01** — 2/10 `THEATER,BROKEN`: There is no app/error.tsx route-level boundary at all — only a static app/global-error.tsx fallback with no reporting call — and app/api/client-errors/route.ts is never invoked from anywhere in the codebase (confirmed by grep): a fully-implemented reporting endpoint that nothing ever calls.
- **arm-02** — 8/10 `CLONE-TIE`: Byte-identical error.tsx/global-error.tsx/client-error route.
- **arm-03** — 3/10 `THEATER`: app/error.tsx exists but never calls the reporting endpoint, there is no app/global-error.tsx at all, and app/api/client-error/route.ts is only referenced as a public-route allowlist entry in middleware.ts — never actually fetched from any client code.
- **arm-04** — 10/10 🏆: Both app/error.tsx and app/global-error.tsx call a shared lib/report-client-error.ts reportClientError() on mount (message/digest/path, truncated); the server route enforces same-origin + a global 60/min rate limit + a 4KB body cap + zod validation; global-error.tsx uses inline styles since globals.css may not have loaded — the most complete and correctly-wired implementation of any arm reviewed in this batch, true or otherwise.
- **arm-05** — 2/10 `THEATER,BROKEN`: app/error.tsx (doubles as GlobalError) claims 'The error was recorded without exposing internal details' but never calls fetch or any reporting function — grep confirms zero callers of /api/client-error anywhere in the codebase despite the route itself existing and being fully implemented. The UI's claim is false; this is dead/disconnected code, not a working feature.
- **arm-06** — 9/10 🥈: Both app/error.tsx AND app/global-error.tsx call /api/client-error (message + url + first stack line) on mount — global-error.tsx even inlines styles since globals.css may not load, a detail the other arms miss. Server route rate-limits (30/min) and caps field lengths. Most complete of the six — reports from both error boundaries, not just one.

*Evidence:* arm-04: `app/error.tsx:1-23; app/global-error.tsx:1-35; lib/report-client-error.ts:1-16; app/api/client-error/route.ts:1-64`; arm-06: `app/error.tsx:1-41; app/global-error.tsx:1-51`; arm-01: `app/global-error.tsx:1-35; app/api/client-errors/route.ts:1-26 (zero callers)`

### R-192 — Marketing imagery assets

**Winner unchanged:** **arm-01** (runner-up: arm-03).

- **arm-01** — 4/10 `PARTIAL` 🏆: Alongside the unmodified create-next-app scaffold SVGs, there is one bespoke themed asset (purim-ribbon.svg) genuinely wired into the storefront homepage as both the hero image and the product-image fallback — modest but real and in active use (location is a repo-root/public-directory extraction quirk shared by every arm's checkout, confirmed by comparing against arm-02's equally-flattened but asset-free baseline).
- **arm-02** — 1/10 `MISSING,CLONE-TIE`: Byte-identical public/ directory — same unmodified scaffold SVGs.
- **arm-03** — 2/10 `STUB` 🥈: One bespoke asset exists (brand-hero.svg) alongside the scaffold defaults, but it is never referenced anywhere in the codebase (grep confirms zero usages) — an orphaned, unused file rather than a working feature.
- **arm-04** — 0/10 `MISSING`: No image assets of any kind exist anywhere in the codebase — not even the default Next.js scaffold SVGs; the only imagery-adjacent content is plain-text marketing copy (lib/marketing-content.ts).
- **arm-05** — 0/10 `MISSING`: No public/ directory exists at all in this workspace — zero static assets of any kind, marketing or otherwise.
- **arm-06** — 0/10 `MISSING`: No public/ directory exists at all in this workspace either — zero static assets, not even the default Next.js scaffold images.

*Evidence:* arm-01: `app/(storefront)/page.tsx:51-56,99-104; purim-ribbon.svg (in active use)`; arm-03: `brand-hero.svg (present, 0 references)`; arm-04: `find . -iname '*.svg' -o -iname '*.png' -o -iname '*.jpg' → no results`
