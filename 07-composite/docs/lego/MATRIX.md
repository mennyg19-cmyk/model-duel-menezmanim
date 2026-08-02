# LEGO Pass A -- CORRECTED full score matrix

Total items scored: **238** / 238

**This supersedes the original MATRIX.md.** arm-01, arm-03, arm-04 were re-graded
from their true, independently-recovered Test-4 codebases after discovering the
on-disk clone-cluster workspace had overwritten their real builds with arm-02's code
(see CORRECTION-REPORT.md). arm-02/05/06 scores are numerically unchanged from Pass A;
arm-02's note/evidence text was re-attributed from the old (mislabeled) arm-01 entries,
since that text was always describing arm-02's real code.

## Winner tally (winner field, ties broken)

| Arm | Model | Items won |
|---|---|---:|
| arm-01 | gpt-5.6-sol-medium | 55 |
| arm-02 | claude-fable-5-thinking-medium | 7 |
| arm-03 | cursor-grok-4.5-high | 19 |
| arm-04 | claude-opus-5-thinking-high | 75 |
| arm-05 | terra-high | 4 |
| arm-06 | kimi-k3-max | 75 |

## Full matrix

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up |
|---|---|---|---|---|---|---|---|---|---|
| R-001 | Mission-led storefront homepage | 7 | 8 | 7 | 7 | 6 | 8 | arm-06 | arm-02 |
| R-002 | Store-open-aware homepage CTAs + closure enforcement | 8 | 9 | 8 | 8 | 7 | 9 | arm-06 | arm-01 |
| R-003 | Current-season package catalog | 7 | 8 | 7 | 8 | 6 | 8 | arm-04 | arm-06 |
| R-004 | Package detail and option pricing | 6 | 8 | 6 | 7 | 2 (MISSING) | 8 | arm-06 | arm-04 |
| R-005 | Public past-collections archive | 7 | 7 | 8 | 8 | 6 | 8 | arm-06 | arm-03 |
| R-006 | Product quick-view dialog | 9 | 9 | 6 | 5 | 5 | 9 | arm-01 | arm-06 |
| R-007 | Homepage impact-stats bar | 6 | 6 | 6 | 6 | 3 (STUB) | 8 | arm-06 | arm-01 |
| R-008 | Homepage How It Works / mission / testimonials / final CTA | 6 | 8 | 6 | 6 | 5 | 8 | arm-06 | arm-01 |
| R-009 | Newsletter subscribe + preferences + tokenized unsubscribe | 7 | 8 | 9 | 8 | 8 | 8 | arm-03 | arm-05 |
| R-010 | First-run setup page (empty-staff bootstrap) | 8 | 7 | 7 | 8 | 6 | 7 | arm-01 | arm-04 |
| R-011 | Storefront shell: sticky header, desktop nav, mobile menu, user menu, footer | 6 | 8 | 6 | 8 | 6 | 8 | arm-04 | arm-06 |
| R-012 | Storewide closed-order banner | 5 | 8 | 6 | 9 | 6 | 7 | arm-04 | arm-02 |
| R-013 | Footer email signup | 8 | 8 | 8 | 8 | 7 | 8 | arm-01 | arm-06 |
| R-014 | Test-mode banner on storefront | 1 (MISSING) | 8 | 1 (MISSING) | 9 | 1 (MISSING) | 8 | arm-04 | arm-06 |
| R-015 | Package category filters | 8 | 8 | 7 | 8 | 4 | 8 | arm-01 | arm-06 |
| R-016 | Package price sorting | 8 | 8 | 7 | 8 | 7 | 8 | arm-01 | arm-06 |
| R-017 | Catalog sold-out handling | 7 | 8 | 7 | 8 | 7 | 8 | arm-06 | arm-04 |
| R-018 | Token-verified email preference states + 3 unsubscribe prefs | 7 | 7 | 9 | 8 | 8 | 8 | arm-03 | arm-05 |
| R-019 | Multi-recipient order builder (shared storefront/POS shell) | 8 | 9 | 8 | 9 | 4 | 9 | arm-04 | arm-06 |
| R-020 | Inventory-aware / live-stock package selection | 5 | 8 | 5 | 5 | 6 | 6 | arm-02 | arm-06 |
| R-021 | Product options + restricted add-ons | 8 | 8 | 7 | 8 | 7 | 8 | arm-06 | arm-01 |
| R-022 | Save and resume web drafts (autosave + guest clear on success) | 8 | 9 | 7 | 7 | 6 | 8 | arm-02 | arm-06 |
| R-023 | Guest checkout access tokens | 8 | 9 | 9 | 8 | 5 | 8 | arm-03 | arm-02 |
| R-024 | Saved-address reuse in ordering | 8 | 8 | 8 | 8 | 7 | 8 | arm-01 | arm-06 |
| R-025 | Address autocomplete + server-side validation | 3 (MISSING) | 8 | 8 | 6 | 3 (MISSING) | 7 | arm-03 | arm-06 |
| R-026 | Builder product panel + cards + in-builder quick view | 6 | 8 | 8 | 8 | 5 | 8 | arm-03 | arm-06 |
| R-027 | Assign products to recipients | 8 | 8 | 8 | 9 | 7 | 8 | arm-04 | arm-01 |
| R-028 | Add recipient from saved address / new address | 8 | 8 | 8 | 8 | 7 | 8 | arm-01 | arm-06 |
| R-029 | Edit saved address while ordering | 7 | 8 | 8 | 8 | 2 (STUB) | 8 | arm-03 | arm-06 |
| R-030 | Desktop order sidebar + mobile cart FAB | 8 | 8 | 8 | 8 | 7 | 8 | arm-01 | arm-06 |
| R-031 | Shared storefront/POS builder shell | 9 | 9 | 8 | 9 | 1 (MISSING) | 9 | arm-01 | arm-06 |
| R-032 | Fulfillment/shipping selection + rate resolution + rules | 9 | 9 | 9 | 9 | 6 | 9 | arm-01 | arm-06 |
| R-033 | Card + offline checkout | 9 | 9 | 9 | 9 | 7 | 9 | arm-06 | arm-01 |
| R-034 | Checkout stock + price validation | 9 | 9 | 9 | 10 | 7 | 9 | arm-04 | arm-01 |
| R-035 | Checkout success experience | 9 | 9 | 7 | 9 | 2 (BROKEN,STUB) | 9 | arm-01 | arm-06 |
| R-036 | Payment recalculation on order changes | 8 | 8 | 9 | 9 | 5 | 9 | arm-06 | arm-04 |
| R-037 | Checkout recipient/donation summary + per-recipient delivery + bulk + live shipping + guest email + conflict/price UI | 9 | 9 | 6 | 9 | 4 | 9 | arm-01 | arm-06 |
| R-038 | Account dashboard + auth-gated nav | 9 | 9 | 4 | 9 | 4 | 9 | arm-01 | arm-06 |
| R-039 | Customer order history + detail | 9 | 9 | 9 | 9 | 3 (MISSING) | 9 | arm-01 | arm-06 |
| R-040 | Continue/pay/cancel a draft | 9 | 9 | 6 (STUB) | 9 | 3 (MISSING,STUB) | 9 | arm-01 | arm-06 |
| R-041 | Repeat a prior customer order | 9 | 9 | 7 | 9 | 7 | 9 | arm-01 | arm-06 |
| R-042 | Customer profile management (ownership-enforced) | 9 | 9 | 9 | 9 | 1 (MISSING) | 9 | arm-01 | arm-06 |
| R-043 | Saved-address account view | 6 | 8 | 7 | 8 | 6 | 8 | arm-04 | arm-06 |
| R-044 | Order status state machine + transitions | 7 | 9 | 9 | 9 | 6 | 9 | arm-04 | arm-03 |
| R-045 | Order finalization (draft → placed, claims number) | 7 | 9 | 9 | 9 | 7 | 9 | arm-04 | arm-03 |
| R-046 | Draft discard | 9 | 9 | 7 | 9 | 2 (STUB,MISSING) | 9 | arm-01 | arm-06 |
| R-047 | Draft reference numbers + wire format | 7 | 8 | 6 | 10 | 4 | 8 | arm-04 | arm-02 |
| R-048 | Cross-season product replacement chain | 9 | 9 | 7 | 9 | 7 | 9 | arm-01 | arm-06 |
| R-049 | Permission-aware admin dashboard + KPIs + recent orders | 8 | 8 | 7 | 9 | 2 (STUB,THEATER) | 9 | arm-06 | arm-04 |
| R-050 | Daily operations "Today" work queue | 7 | 8 | 8 | 8 | 3 (STUB) | 9 | arm-06 | arm-04 |
| R-051 | Role + per-user permission enforcement | 8 | 8 | 6 | 9 | 3 (STUB,BROKEN) | 9 | arm-06 | arm-04 |
| R-052 | Searchable filterable order list | 8 | 8 | 7 | 9 | 4 (STUB) | 9 | arm-06 | arm-04 |
| R-053 | Full admin order detail + money actions | 9 | 9 | 7 | 8 | 2 (STUB,MISSING) | 9 | arm-01 | arm-06 |
| R-054 | Refunds (incl. Stripe refund path) | 9 | 9 | 6 | 8 | 3 (STUB,THEATER) | 8 | arm-01 | arm-06 |
| R-055 | Carrier label creation + voiding | 8 | 8 | 7 | 9 | 7 | 8 | arm-04 | arm-06 |
| R-056 | Printable order packing slips | 8 | 8 | 7 | 7 | 7 | 8 | arm-01 | arm-06 |
| R-057 | Staff single-order repeat workflow | 8 | 8 | 8 | 7 | 5 | 9 | arm-06 | arm-01 |
| R-058 | Bulk repeat of customer history | 6 | 8 | 6 | 9 | 5 | 9 | arm-06 | arm-04 |
| R-059 | Staff point of sale | 9 | 9 | 9 | 9 | 3 (STUB) | 9 | arm-01 | arm-06 |
| R-060 | POS customer lookup + preselection + find-or-create | 9 | 9 | 8 | 9 | 2 (STUB,MISSING) | 9 | arm-01 | arm-06 |
| R-061 | POS checkout | 9 | 9 | 8 | 9 | 5 | 9 | arm-01 | arm-06 |
| R-062 | Customer directory + search + add | 8 | 8 | 6 | 9 | 3 (STUB,MISSING) | 8 | arm-04 | arm-01 |
| R-063 | CSV customer/product import (staged atomic) | 8 | 8 | 6 | 8 | 6 | 8 | arm-01 | arm-06 |
| R-064 | Customer detail + history | 8 | 8 | 7 | 8 | 0 (MISSING) | 8 | arm-01 | arm-04 |
| R-065 | Product catalog management (list/create/edit/detail/season) | 6 | 6 | 7 | 8 | 5 | 8 | arm-06 | arm-04 |
| R-066 | Add-on catalog management | 5 | 6 | 6 | 9 | 5 | 6 | arm-04 | arm-06 |
| R-067 | Media library + photo assignment (Vercel Blob) | 6 | 8 | 7 | 8 | 4 | 8 | arm-06 | arm-04 |
| R-068 | Inventory overview dashboard | 1 (MISSING) | 1 (MISSING) | 1 (MISSING) | 1 (MISSING) | 1 (MISSING) | 1 (MISSING) | none | none |
| R-069 | Production batch planning + history | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | none | none |
| R-070 | Inventory adjustments + write-offs + shortfall | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | none | none |
| R-071 | Stock reserve/allocate/release engine | 5 (BROKEN) | 6 | 6 | 7 | 4 (BROKEN) | 8 | arm-06 | arm-04 |
| R-072 | Fulfillment channel dashboard + bulk status actions | 7 | 8 | 8 | 9 | 6 | 9 | arm-06 | arm-04 |
| R-073 | Fulfillment production + savings summaries | 6 | 7 | 5 | 9 | 6 | 9 | arm-06 | arm-04 |
| R-074 | Delivery route builder (Mapbox) | 6 | 7 | 4 | 8 | 5 | 8 | arm-06 | arm-04 |
| R-075 | Route administration (list/detail/reassign/print) | 7 | 8 | 5 | 9 | 4 | 9 | arm-06 | arm-04 |
| R-076 | Greeting cards print view per route | 4 (STUB) | 8 | 5 (STUB) | 9 | 5 | 8 | arm-04 | arm-06 |
| R-077 | Driver route list (messenger portal) | 7 | 8 | 6 | 9 | 7 | 9 | arm-06 | arm-04 |
| R-078 | Driver stop cards + route start/delivery completion | 8 | 8 | 8 | 8 | 7 | 9 | arm-06 | arm-01 |
| R-079 | Follow-up call center | 6 | 8 | 2 (STUB) | 9 | 1 (MISSING) | 7 | arm-04 | arm-02 |
| R-080 | Automated payment + pickup follow-up (cron) | 8 | 8 | 8 | 8 | 4 | 9 | arm-06 | arm-01 |
| R-081 | Shipment planning + bin packing | 9 | 8 | 9 | 3 (THEATER) | 3 (THEATER) | 8 | arm-01 | arm-03 |
| R-082 | Email hub (5-tab management) | 3 (STUB) | 6 | 8 | 8 | 2 (MISSING,STUB) | 9 | arm-06 | arm-04 |
| R-083 | Campaign builder + send | 6 | 8 | 8 | 9 | 6 | 9 | arm-06 | arm-04 |
| R-084 | Subscriber + mailing-list management | 2 (STUB) | 7 | 5 | 8 | 2 (STUB) | 9 | arm-06 | arm-04 |
| R-085 | Email templates + branding | 4 | 8 | 2 (STUB) | 9 | 2 (STUB) | 7 | arm-04 | arm-02 |
| R-086 | Triggered/transactional emails + overrides + idempotency | 6 | 8 | 5 | 9 | 6 | 9 | arm-06 | arm-04 |
| R-087 | Order lifecycle emails (confirmation/payment link/refund) | 7 | 8 | 8 | 9 | 7 | 8 | arm-04 | arm-03 |
| R-088 | Transactional outbox + retrying sweeper | 8 | 8 | 9 | 9 | 7 | 9 | arm-06 | arm-03 |
| R-089 | Email campaign lifecycle UI (draft/sent lists) | 5 | 8 | 7 | 8 | 5 | 9 | arm-06 | arm-04 |
| R-090 | Email test sender | 6 | 8 | 8 | 8 | 7 | 9 | arm-06 | arm-04 |
| R-091 | Multi-season performance reports + drill-downs | 5 | 8 | 6 | 9 | 4 (MISSING) | 9 | arm-04 | arm-06 |
| R-092 | CSV export center + audit history | 6 | 8 | 8 | 9 | 5 | 9 | arm-04 | arm-06 |
| R-093 | Stripe payment reconciliation | 7 | 8 | 6 | 8 | 4 | 9 | arm-06 | arm-04 |
| R-094 | Settings hub + Orders tab (store status, package types, pickup, follow-up) | 4 (STUB) | 8 | 3 (STUB,MISSING) | 9 | 3 (MISSING) | 8 | arm-04 | arm-06 |
| R-095 | Settings Shipping tab (rates, rules, delivery ZIPs) | 3 (MISSING) | 8 | 7 | 9 | 4 | 7 | arm-04 | arm-02 |
| R-096 | Settings Email + Developer tabs | 5 | 7 | 6 | 9 | 6 | 8 | arm-04 | arm-06 |
| R-097 | New-season setup wizard | 6 | 7 | 5 (PARTIAL) | 10 | 5 | 8 | arm-04 | arm-06 |
| R-098 | Staff account + permission management | 8 | 8 | 9 | 10 | 5 (STUB) | 8 | arm-04 | arm-03 |
| R-099 | Staff impersonation | 8 | 8 | 9 | 9 | 5 | 8 | arm-03 | arm-04 |
| R-100 | Administrative activity log | 6 | 7 | 6 | 7 | 6 | 8 | arm-06 | arm-04 |
| R-101 | Test-environment operations console | 5 | 8 | 7 | 10 | 7 | 8 | arm-04 | arm-06 |
| R-102 | Staff help center + guided tours | 2 (STUB) | 7 | 7 | 9 | 0 (MISSING) | 8 | arm-04 | arm-06 |
| R-103 | Test/live environment switch | 6 | 6 | 6 | 7 | 6 | 8 | arm-06 | arm-04 |
| R-104 | Admin shell + permission-gated sidebar + mobile nav | 7 | 6 | 8 | 9 | 3 (STUB) | 8 | arm-04 | arm-03 |
| R-105 | Shared admin list controls (search/pagination/sort/badges) | 6 | 8 | 8 | 9 | 3 (STUB) | 9 | arm-04 | arm-06 |
| R-106 | Admin chrome links (visit-store, alert banner, back link) | 6 | 7 | 8 | 9 | 6 | 8 | arm-04 | arm-06 |
| R-188 | shadcn-style UI kit | 2 (STUB) | 5 | 4 (PARTIAL) | 7 | 1 (MISSING) | 6 | arm-04 | arm-06 |
| R-189 | Custom UI primitives (confirm/empty/FAB/info-hint/page-header/pill/price-tag/smart-select/callout) | 1 (MISSING) | 1 (MISSING) | 1 (MISSING) | 1 (MISSING) | 0 (MISSING) | 2 (MISSING) | arm-06 | arm-01 |
| R-190 | Design tokens + global styles + brand constants | 7 | 7 | 6 | 9 | 5 | 8 | arm-04 | arm-06 |
| R-191 | Global error page + root layout (client error reporting) | 2 (THEATER,BROKEN) | 8 | 3 (THEATER) | 10 | 2 (THEATER,BROKEN) | 9 | arm-04 | arm-06 |
| R-192 | Marketing imagery assets | 4 (PARTIAL) | 1 (MISSING) | 2 (STUB) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | arm-01 | arm-03 |
| R-107 | Clerk identity integration + middleware | 5 | 6 | 7 | 5 | 4 (MISSING) | 2 (MISSING,THEATER) | arm-03 | arm-02 |
| R-108 | Sign-in / sign-up pages | 2 (MISSING) | 8 | 3 (MISSING) | 6 | 1 (MISSING) | 2 (MISSING,BROKEN) | arm-02 | arm-04 |
| R-109 | Role model: RBAC + linear rank + allow-list carve-outs (customers are NOT staff) | 6 | 6 | 7 | 6 | 5 | 9 | arm-06 | arm-03 |
| R-110 | Per-user permission grants/denies + override editor | 7 | 8 | 8 | 8 | 6 | 9 | arm-06 | arm-04 |
| R-111 | Server-side authorization gate (requirePermission) | 9 | 9 | 8 | 9 | 8 | 9 | arm-01 | arm-06 |
| R-112 | Staff confirmation + revocation gate | 9 | 6 | 5 | 8 | 6 | 9 | arm-06 | arm-01 |
| R-113 | Staff invitation identity linking | 9 | 3 (MISSING) | 6 | 6 | 4 | 9 | arm-01 | arm-06 |
| R-114 | Customer identity linking + owned profile updates | 8 | 8 | 8 | 8 | 3 (MISSING) | 7 | arm-01 | arm-06 |
| R-115 | Admin + messenger application gates | 8 | 8 | 5 | 9 | 3 | 8 | arm-04 | arm-02 |
| R-116 | Driver route ownership scoping | 9 | 9 | 8 | 9 | 8 | 9 | arm-01 | arm-06 |
| R-117 | "Must be staff" hard guard + storefront staff check | 8 | 8 | 5 | 9 | 2 (MISSING) | 8 | arm-04 | arm-02 |
| R-118 | canDrive carve-out for driver-route permissions | 4 (MISSING) | 4 (MISSING) | 8 | 9 | 4 (MISSING) | 4 (MISSING) | arm-04 | arm-03 |
| R-119 | Staff-management mutation hardening (self-target blocks) | 8 | 9 | 8 | 9 | 8 | 9 | arm-06 | arm-04 |
| R-120 | Security-relevant audit trail + session login stamp | 7 | 8 | 8 | 9 | 6 | 8 | arm-04 | arm-03 |
| R-121 | Draft-order ownership + anti-enumeration gate | 8 | 9 | 7 | 9 | 7 | 8 | arm-04 | arm-02 |
| R-122 | Guarded public JSON endpoints (same-origin + IP rate limit + Zod) | 7 | 8 | 9 | 8 | 7 | 8 | arm-03 | arm-04 |
| R-123 | Signed email-preference changes (HMAC, timing-safe) | 9 | 9 | 9 | 8 | 8 | 9 | arm-03 | arm-01 |
| R-124 | Cron endpoint authentication (bearer secret) | 8 | 9 | 9 | 9 | 8 | 9 | arm-06 | arm-04 |
| R-125 | Stripe webhook authenticity + idempotency | 9 | 9 | 9 | 9 | 8 | 9 | arm-06 | arm-01 |
| R-126 | Charged-amount + fulfillment safety checks (auto-refund stale/failed) | 9 | 9 | 9 | 9 | 7 | 9 | arm-01 | arm-04 |
| R-127 | Server-enforced offline payment policy | 6 | 6 | 7 | 7 | 5 | 6 | arm-03 | arm-04 |
| R-128 | Restricted + validated media uploads | 5 | 8 | 6 | 9 | 7 | 8 | arm-04 | arm-02 |
| R-129 | Test-only destructive operations (reset/wipe/seed) | 7 | 9 | 8 | 8 | 6 | 8 | arm-02 | arm-04 |
| R-130 | Empty-database bootstrap lockout | 8 | 9 | 8 | 9 | 5 | 9 | arm-04 | arm-06 |
| R-131 | Startup secret + environment validation | 4 | 8 | 6 | 9 | 2 (THEATER) | 7 | arm-04 | arm-02 |
| R-132 | Bounded, redacted client error ingestion | 4 | 8 | 5 | 8 | 5 | 7 | arm-04 | arm-02 |
| R-133 | Automated repository security guardrails (CI) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 4 | 0 (MISSING) | arm-05 | arm-01 |
| R-134 | Guarded staff-only API routes (media/exports/route-builder) | 8 | 8 | 8 | 9 | 7 | 8 | arm-04 | arm-02 |
| R-135 | Permission unit tests | 6 | 8 | 7 | 8 | 7 | 8 | arm-06 | arm-04 |
| R-136 | Production error masking for server actions | 4 | 5 | 7 | 7 | 4 | 7 | arm-04 | arm-06 |
| R-137 | Normalized relational app schema (Postgres/Prisma) | 7 | 8 | 8 | 8 | 7 | 9 | arm-06 | arm-04 |
| R-138 | DB-enforced lifecycle + category enums | 7 | 8 | 9 | 9 | 7 | 9 | arm-06 | arm-04 |
| R-139 | Inventory-target integrity (XOR CHECK) constraints | 8 | 8 | 8 | 10 | 8 | 9 | arm-04 | arm-06 |
| R-140 | Ordered migrations + schema-change guard (CI) | 7 | 6 | 3 (STUB) | 9 | 5 (BROKEN) | 7 | arm-04 | arm-06 |
| R-141 | Disposable migration verification harness | 4 (MISSING) | 6 | 4 | 8 | 7 | 8 | arm-06 | arm-04 |
| R-142 | Repeatable baseline seed | 7 | 7 | 8 | 8 | 7 | 8 | arm-06 | arm-04 |
| R-143 | Auditable staged import pipeline + atomic commits | 7 | 8 | 7 | 9 | 4 (THEATER) | 9 | arm-06 | arm-04 |
| R-144 | Customer records (normalized phone/email + dedupe) | 3 (BROKEN) | 8 | 6 (MISSING) | 8 | 7 | 8 | arm-06 | arm-04 |
| R-145 | Saved addresses with geocoding fields | 8 | 7 | 8 | 8 | 7 | 8 | arm-06 | arm-01 |
| R-146 | Season model gating catalog per year | 8 | 8 | 8 | 8 | 7 | 8 | arm-01 | arm-06 |
| R-147 | Product catalog schema (dims, inventory flags, kinds) | 6 | 8 | 8 | 9 | 6 | 9 | arm-06 | arm-04 |
| R-148 | Product options with price adjustments | 6 | 8 | 7 | 8 | 7 | 8 | arm-06 | arm-04 |
| R-149 | Normalized order tree (Order -> OrderLine -> add-ons) | 6 | 8 | 7 | 7 | 7 | 7 | arm-02 | arm-06 |
| R-150 | Price snapshots on order lines | 7 | 8 | 6 | 9 | 8 | 8 | arm-04 | arm-05 |
| R-151 | Sequential order numbers per season | 7 | 8 | 7 | 8 | 7 | 8 | arm-06 | arm-04 |
| R-152 | Cached derived payment status on orders | 7 | 8 | 9 | 8 | 5 | 8 | arm-03 | arm-06 |
| R-153 | Fulfillment groups (multi-destination) + snapshots | 7 | 8 | 8 | 9 | 5 | 8 | arm-04 | arm-03 |
| R-154 | Data-driven fulfillment methods | 7 | 8 | 6 | 9 | 7 | 8 | arm-04 | arm-06 |
| R-155 | Shipping quotes with selectable expiring options | 6 | 9 | 6 | 9 | 6 | 7 | arm-04 | arm-02 |
| R-156 | Pickup locations | 8 | 6 | 6 | 9 | 8 | 6 | arm-04 | arm-01 |
| R-157 | Package types + shipment boxes | 8 | 6 | 6 | 9 | 8 | 6 | arm-04 | arm-01 |
| R-158 | Unified inventory (products + add-ons, versioned) | 8 | 8 | 8 | 6 (MISSING) | 8 | 8 | arm-05 | arm-01 |
| R-159 | Stripe PaymentIntent modeling | 7 | 8 | 8 | 7 | 7 | 6 | arm-02 | arm-03 |
| R-160 | Payments (stripe/cash/check/comp) with posted/voided states | 7 | 8 | 7 | 9 | 6 | 8 | arm-04 | arm-06 |
| R-161 | Key-value settings store with typed registry | 4 (STUB) | 9 | 6 | 8 | 3 (BROKEN) | 9 | arm-02 | arm-06 |
| R-162 | Geocode cache with success/failure TTLs | 5 | 6 | 6 | 9 | 6 | 5 | arm-04 | arm-03 |
| R-163 | Cron/job run log | 7 | 7 | 8 | 8 | 7 | 7 | arm-03 | arm-04 |
| R-164 | Data-layer helper libraries (money/normalize/phone/ids/season/dates/result) | 6 | 5 | 7 | 9 | 5 | 8 | arm-04 | arm-06 |
| R-165 | Legacy→new data migration plan (documented entity map) | 5 | 5 | 4 | 10 | 1 (MISSING) | 9 | arm-04 | arm-06 |
| R-166 | Stripe hosted checkout session | 9 | 9 | 7 | 9 | 6 | 9 | arm-04 | arm-01 |
| R-167 | Stripe payment webhook processing | 9 | 9 | 9 | 9 | 7 | 9 | arm-04 | arm-06 |
| R-168 | Stripe refund synchronization | 9 | 9 | 9 | 9 | 6 | 8 | arm-04 | arm-03 |
| R-169 | Stripe automatic safety refunds | 9 | 9 | 8 | 9 | 7 | 9 | arm-06 | arm-04 |
| R-170 | Shared Stripe server client (lazy singleton) | 7 | 9 | 8 | 9 | 3 (STUB) | 9 | arm-04 | arm-06 |
| R-171 | Resend email sender (SDK isolated) | 8 | 9 | 8 | 9 | 8 | 9 | arm-06 | arm-04 |
| R-172 | Email log purge cron | 8 | 8 | 7 | 9 | 7 | 9 | arm-06 | arm-04 |
| R-173 | Shippo SDK wrapper (rate/buy/void/track/validate) | 9 | 9 | 9 | 9 | 8 | 5 (BROKEN) | arm-04 | arm-03 |
| R-174 | Shippo rate lookup + cheapest-rate selection | 9 | 9 | 9 | 9 | 8 | 1 (BROKEN) | arm-04 | arm-01 |
| R-175 | Shippo label failure compensation | 9 | 9 | 9 | 9 | 8 | 2 (BROKEN) | arm-04 | arm-01 |
| R-176 | Shippo tracking refresh | 8 | 8 | 8 | 9 | 7 | 2 (BROKEN) | arm-04 | arm-01 |
| R-177 | Shippo address validation | 8 | 8 | 8 | 9 | 7 | 3 (BROKEN) | arm-04 | arm-03 |
| R-178 | Idempotent email sending + test capture | 9 | 9 | 9 | 9 | 8 | 9 | arm-06 | arm-04 |
| R-179 | Mapbox geocoding with cache | 9 | 8 | 3 (MISSING) | 9 | 6 | 5 | arm-04 | arm-01 |
| R-180 | Vercel Blob media storage | 9 | 9 | 3 (MISSING) | 9 | 7 | 9 | arm-06 | arm-04 |
| R-181 | Secured outbox integration sweep | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-06 |
| R-182 | Secured pickup-expiry operation | 9 | 9 | 9 | 9 | 8 | 9 | arm-06 | arm-04 |
| R-183 | Typed optional-provider handling (Shippo/Mapbox) | 6 | 9 | 3 (STUB) | 9 | 3 (STUB) | 9 | arm-06 | arm-04 |
| R-184 | UPS direct credentials declared, not implemented | 5 | 8 | 10 | 7 | 5 | 10 | arm-06 | arm-03 |
| R-185 | Vercel Cron jobs (5) with secret auth | 8 | 8 | 8 | 8 | 8 | 8 | arm-06 | arm-01 |
| R-186 | Nexternal legacy import pipeline + order-number repair | 8 | 9 | 8 | 9 | 1 (MISSING) | 9 | arm-06 | arm-04 |
| R-187 | Health check (DB + env validation) | 6 | 6 | 8 | 7 | 5 | 7 | arm-03 | arm-04 |
| UR-001 | Package entity | 9 | 9 | 9 | 9 | 7 | 9 | arm-06 | arm-03 |
| UR-002 | Method switch with charge preservation | 7 | 8 | 8 | 9 | 7 | 9 | arm-06 | arm-04 |
| UR-003 | Rate margin | 8 | 9 | 9 | 9 | 8 | 9 | arm-06 | arm-04 |
| UR-004 | Map reroute | 9 | 6 | 5 | 6 | 3 (MISSING,STUB) | 5 | arm-01 | arm-04 |
| UR-005 | Nightly print batch | 7 | 9 | 9 | 9 | 7 | 9 | arm-06 | arm-03 |
| UR-006 | Cart-first order entry | 9 | 9 | 9 | 9 | 5 | 9 | arm-01 | arm-04 |
| UR-007 | Repeat order | 9 | 8 | 9 | 9 | 7 | 9 | arm-06 | arm-01 |
| UR-008 | Seasons | 8 | 8 | 8 | 9 | 7 | 8 | arm-04 | arm-01 |
| UR-009 | Delivery rules | 7 | 9 | 9 | 9 | 8 | 9 | arm-06 | arm-04 |
| UR-010 | Pickup | 8 | 9 | 9 | 9 | 7 | 9 | arm-06 | arm-04 |
| UR-011 | Payments | 9 | 9 | 9 | 9 | 8 | 9 (CLONE-TIE) | arm-01 | arm-06 |
| UR-012 | Roles | 7 | 8 | 8 | 8 | 8 | 8 | arm-05 | arm-04 |
| UR-013 | Greeting cards | 6 | 9 | 9 | 9 | 6 | 9 | arm-06 | arm-03 |
| UR-014 | Address book | 9 | 9 | 9 | 9 | 6 | 9 | arm-01 | arm-04 |
| UR-015 | Driver UX | 8 | 8 | 8 | 9 | 7 | 7 | arm-04 | arm-01 |
| UR-016 | Production | 7 (MISSING) | 7 | 7 (MISSING) | 7 (MISSING) | 7 | 7 | arm-05 | arm-01 |
| G-001 | Hybrid fulfillment (print-first + optional digital stages) | 8 | 8 | 9 | 9 | 7 | 9 | arm-03 | arm-04 |
| G-002 | Print slips/labels/cards without marking shipped | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-03 |
| G-003 | Default package grouping + staff split | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-03 |
| G-004 | Package-level status and printing | 7 | 9 | 9 | 9 | 8 | 9 | arm-03 | arm-04 |
| G-005 | Staff method switch; preserve paid charge | 7 | 9 | 7 | 9 | 7 | 9 | arm-04 | arm-06 |
| G-006 | Shipping rate-shop + margin + Shippo labels | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-03 |
| G-007 | Stripe hosted checkout, immediate capture | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-03 |
| G-008 | Finished-package inventory (v1 primary) | 9 | 9 | 9 | 9 | 9 | 8 | arm-01 | arm-03 |
| G-009 | BOM/ingredients — schema yes, UI hidden; manager enables later | 7 | 9 | 7 | 9 | 7 | 9 | arm-04 | arm-06 |
| G-010 | Assembly batches consume supplies → finished stock | 2 (MISSING,STUB) | 1 (MISSING,STUB) | 1 (MISSING,STUB) | 2 (MISSING,STUB) | 2 (MISSING,STUB) | 2 (MISSING,STUB) | arm-01 | arm-04 |
| G-011 | Repeat-order draft + review page | 9 | 9 | 9 | 9 | 7 | 9 | arm-01 | arm-03 |
| G-012 | Unmapped items: must pick or remove; price-smart suggestions | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-03 |
| G-013 | Admin replacement mappings per catalog item | 9 | 9 | 8 | 9 | 7 | 9 | arm-01 | arm-04 |
| G-014 | Per-package delivery zip hard-block | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-03 |
| G-015 | Bulk fee per destination; per-package fee per recipient | 9 | 9 | 9 | 9 | 8 | 9 | arm-01 | arm-03 |
| G-016 | Staff/Manager roles + per-person permission toggles | 6 | 8 | 7 | 8 | 7 | 9 | arm-06 | arm-04 |
| G-017 | Staff-scheduled bulk delivery + notify customer | 5 | 8 | 9 | 9 | 7 | 9 | arm-03 | arm-04 |
| G-018 | Cart-first order entry + three-way recipient picker | 8 | 8 | 8 | 8 | 7 | 8 | arm-01 | arm-03 |
| G-019 | Auto-save new recipients to address book; staff edit with audit | 8 | 8 | 8 | 7 | 8 | 9 | arm-06 | arm-01 |
| G-020 | Per-recipient greeting memory | 8 | 8 | 9 | 9 | 7 | 8 | arm-03 | arm-04 |
| G-021 | Greeting cards: order default + overrides; separate card PDF | 8 | 8 | 8 | 9 | 7 | 9 | arm-04 | arm-06 |
| G-022 | Off-season + full catalog archive | 8 | 8 | 8 | 8 | 7 | 8 | arm-01 | arm-03 |
| G-023 | Map suggest + confirm reroute; void label | 8 | 8 | 8 | 9 | 8 | 9 | arm-04 | arm-06 |
| G-024 | Large-scale ops (1k orders / 5k packages / 10+ staff) | 2 (MISSING,STUB) | 7 | 7 | 9 | 5 | 9 | arm-04 | arm-06 |
| G-025 | Driver mobile web + print fallback; magic-link auth | 8 | 9 | 8 | 9 | 8 | 9 | arm-04 | arm-06 |
| G-026 | Pickup when inventory available; ready notify; door list | 8 | 9 | 8 | 8 | 8 | 9 | arm-06 | arm-02 |
| G-027 | Per-package delivery: staff-routed days; day-of notification | 8 | 9 | 9 | 9 | 8 | 9 | arm-03 | arm-04 |
| G-028 | POS check/cash payments | 9 | 9 | 8 | 9 | 8 | 9 | arm-01 | arm-04 |
| G-029 | Historical data migration (messy export + cleanup) | 8 | 9 | 8 | 9 | 8 | 9 | arm-04 | arm-06 |
| G-030 | Mapbox admin map; Google Maps deep links for drivers | 8 | 7 | 3 (STUB) | 6 | 7 | 8 | arm-01 | arm-06 |
