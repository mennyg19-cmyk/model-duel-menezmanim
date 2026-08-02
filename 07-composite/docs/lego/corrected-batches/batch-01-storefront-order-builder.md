# Batch 01 — Storefront & Order Builder — CORRECTED Pass A scores

This is a corrective re-grade of `docs/lego/batches/batch-01-storefront-order-builder.json`.

**Root cause of the correction:** for arm-01, arm-03, and arm-04, the on-disk workspace used for
the original Pass A grading pass had been silently overwritten during a later "Test 6" exercise
to contain arm-02's code under arm-01/03/04's name. Every score previously on record for those
three arms was therefore actually re-grading **arm-02's code, three times, under the wrong names**.
arm-02, arm-05, and arm-06's original scores were unaffected (their on-disk workspace already was
their own build) and are copied through unchanged below. arm-01, arm-03, and arm-04 have been
re-graded from each arm's real, git-recovered `P12 gated — Test 4 complete` codebase at
`/tmp/tomchei-work/true-arms/arm-0N/`.

## Changes vs original Pass A

**17 of 31 items had their winner change** as a direct result of grading arm-01/03/04's real code instead of arm-02's mislabeled code:

| ID | Name | Old winner | New winner | Why |
|---|---|---|---|---|
| R-002 | Store-open-aware homepage CTAs + closure enforcement | arm-01 | **arm-06** | true arm-01's real closure gate is solid (8) but no longer the standout; arm-06's dedicated closed render ties/exceeds it, and arm-02 (the real code previously mislabeled as arm-01) is also strong but loses the flag tiebreak. |
| R-003 | Current-season package catalog | arm-01 | **arm-04** | arm-01's true catalog query is decent (7) but not exceptional; arm-04's currentSeasonCatalog cleanly reuses one source of truth across catalog + builder and edges out on a tiebreak. |
| R-004 | Package detail and option pricing | arm-01 | **arm-06** | arm-01's true detail page has static (non-live) option pricing, dropping it to 6; arm-06 (real, unaffected by relabeling) already had the strongest live-ish option widget. |
| R-008 | Homepage How It Works / mission / testimonials / final CTA | arm-01 | **arm-06** | arm-01's true homepage has only 1 testimonial and no distinct final-CTA section (6), well below the wrongly-credited 8; arm-06's homepage (unaffected) still has the fuller structure. |
| R-009 | Newsletter subscribe + preferences + tokenized unsubscribe | arm-05 | **arm-03** | arm-01's true newsletter is solid but has no double-opt-in (7); arm-03's true build turns out to have the best token design of all six arms (per-change token-version rotation defeats replay), leapfrogging arm-05. |
| R-011 | Storefront shell: sticky header, desktop nav, mobile menu, user menu, footer | arm-01 | **arm-04** | arm-01's true shell is a plain sticky header with a flat Account link (6), much thinner than credited; arm-04's true shell has a real differentiated UserMenu (staff/customer/guest) and a no-JS <details> mobile menu. |
| R-012 | Storewide closed-order banner | arm-01 | **arm-04** | arm-01's true closed banner is a hardcoded string with no admin path (5); arm-04's true build is genuinely admin-configurable via two real settings (store.open switch + brand.announcement text) — the best implementation of this feature across all six arms. |
| R-014 | Test-mode banner on storefront | arm-01 | **arm-04** | arm-01's true build has NO test-mode banner on the storefront at all (1, MISSING) — the opposite of what was credited; arm-04's true build has a real, well-designed, non-dismissible banner. |
| R-018 | Token-verified email preference states + 3 unsubscribe prefs | arm-05 | **arm-03** | same root cause as R-009 — arm-03's true token-versioning design is the best of the six, surfacing here as well. |
| R-019 | Multi-recipient order builder (shared storefront/POS shell) | arm-01 | **arm-04** | arm-01's true builder shares code with POS (8, genuinely good) but arm-04's true builder shares an even richer set of components with a richer per-line assignment model (method + pickup + greeting), edging ahead. |
| R-020 | Inventory-aware / live-stock package selection | arm-01 | **arm-02** | none of arm-01/03/04's true builds have a live stock-polling loop (all 5); arm-02 (the real code that was mislabeled as arm-01 in the old grading) is the only arm with a real STOCK_REFRESH_MS polling loop, so once correctly attributed it becomes the outright winner. |
| R-022 | Save and resume web drafts (autosave + guest clear on success) | arm-01 | **arm-02** | same pattern as R-020 — the debounced-autosave-plus-guest-cookie-clear-on-success behavior that was credited to arm-01 was actually arm-02's own code; arm-02 rightfully wins now that it's correctly labeled. |
| R-023 | Guest checkout access tokens | arm-01 | **arm-03** | arm-01's true guest-token design is solid (8) but arm-03's true design (per-token version rotation, uniform 404s, secret+version salted hash) is the most rigorous of all six arms. |
| R-025 | Address autocomplete + server-side validation | arm-01 | **arm-03** | arm-01's true build has NO address autocomplete at all (3, MISSING); arm-03's true build has a real debounced suggestion API plus server-side validation before acceptance. |
| R-026 | Builder product panel + cards + in-builder quick view | arm-01 | **arm-03** | arm-01's true in-builder quick view lacks options/add-ons entirely (6); arm-03's true quick view includes option + add-on + quantity selection before adding, matching the requirement precisely. |
| R-027 | Assign products to recipients | arm-01 | **arm-04** | arm-01's true per-line assignment is solid (8) but arm-04's true model bundles recipient + fulfillment method + pickup location + greeting message per line, the richest of the three. |
| R-029 | Edit saved address while ordering | arm-01 | **arm-03** | arm-01's true edit-in-place flow works but doesn't propagate to other on-order lines referencing the same address (7); arm-03's true implementation refreshes book state cleanly and arm-04 explicitly documents cross-line propagation, both edging ahead. |

All other 14 items kept the same winner (in a few cases — R-006, R-010, R-013, R-015, R-016, R-017,
R-021, R-024, R-028, R-030, R-031 — this is because the true arm-01/03/04 build genuinely also scored
at or near the top independently of the mix-up; in others — R-001, R-005, R-007 — arm-06 or arm-02
was already the correct original winner and stayed there).

---

## Full scored table (all 31 items, all 6 arms)

Flags shown in `[brackets]` after a score. Scores for arm-02/arm-05/arm-06 are unchanged from the
original Pass A file. Scores for arm-01/arm-03/arm-04 are fresh grades of each arm's real,
git-recovered codebase.

### R-001 — Mission-led storefront homepage

**Winner:** arm-06 (unchanged) · **Runner-up:** arm-02

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 7 | — | Real hero/mission/CTA (isOpen-aware)/impact-bar/how-it-works (3 steps)/1 testimonial, but the numbers are hardcoded JSX strings and there's no dedicated homepage newsletter-CTA section (footer substitutes). |
| arm-02 *(runner-up)* | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | Hero/tagline/isOpen-aware CTA; impact bar and testimonials are pulled from a settings table (marketing.impactStats/testimonials) rather than literal JSX strings, but no admin UI writes those settings, so in practice it always renders the coded defaults. |
| arm-04 | 7 | — | Hero/MISSION const/isOpen-aware CTA/impact stats (explicit code comment says these are intentionally-not-live editorial figures)/how-it-works (3 steps)/2 testimonials; well structured but no distinct homepage newsletter-CTA section. |
| arm-05 | 6 | — | Real hero/mission/CTA/impact-bar/3-cards/1-testimonial in a single terse file; functional but noticeably thinner copy and structure than the other arms. |
| arm-06 **(winner)** | 8 | — | Hero with org tagline/mission, store-open-aware CTAs, how-it-works, testimonials, newsletter CTA. Impact stats pulled from live Prisma counts (packageCount/orderCount/customerCount) rather than hardcoded copy — more real than arm-01's version. |

### R-002 — Store-open-aware homepage CTAs + closure enforcement

**Winner:** arm-06 *(CHANGED from arm-01)* · **Runner-up:** arm-01

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 *(runner-up)* | 8 | — | Homepage/header CTAs branch on season.status==='OPEN'; /order re-checks server-side and renders a dedicated 'Ordering is closed' page with no OrderBuilder mounted when closed. /catalog still lists products when closed (browse-only, no order affordance) — intended, not a leak. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 8 | — | CTAs branch on isStoreOpen(season) on home/header; /order re-checks storeOpen server-side and renders a dedicated blocked page (data-testid=order-blocked) with zero builder markup when closed. |
| arm-04 | 8 | — | CTAs branch on readStoreState().isOpen (season status AND a manager kill-switch combined); /order calls requireOpenStore() server-side before any builder markup renders. |
| arm-05 | 7 | — | CTA swap present on homepage/catalog; /order redirects server-side to /catalog when no season is open. Enforcement exists but is coarser (a redirect vs. a dedicated closed-state render). |
| arm-06 **(winner)** | 9 | — | CTAs branch on openSeason on homepage; /packages checks openSeason server-side and renders closed notice with no product data leaked when closed. |

### R-003 — Current-season package catalog

**Winner:** arm-04 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 7 | — | getCurrentSeason() returns the pointer-selected season's active PACKAGE products with options/inventory/add-ons included; separate getArchivedSeasons() for CLOSED seasons. Real and clean, slightly looser than 'open-only' since 'current' can itself be a closed season. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | listCatalogProducts({seasonId}) + listCategories() scoped to getCurrentSeason(); clean helper split, real DB-backed catalog. |
| arm-04 **(winner)** | 8 | — | currentSeasonCatalog(seasonId) pulls only the actual current season (open-or-most-recent per readStoreState), a well-commented single source of truth shared by catalog and order builder. |
| arm-05 | 6 | — | getStorefront() pulls the OPEN season's active non-add-on products with options/add-ons/inventory. Works but the catalog vs archive split is looser (single query fn returning both). |
| arm-06 *(runner-up)* | 8 | — | PackagesPage queries active products of the open season only, with options/inventory/media joined cleanly via catalogProductInclude helper. |

### R-004 — Package detail and option pricing

**Winner:** arm-06 *(CHANGED from arm-01)* · **Runner-up:** arm-04

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 6 | — | Real /catalog/[productId] detail page: image, description, price, sold-out/closed messaging. Options are static radio inputs with price deltas shown per option, but there's no live JS recompute of a running total. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 6 | — | Real /catalog/[slug] detail page with an options list (data-testid=option-pricing) showing price-with-adjustment per row, but again no live interactive price widget — an informational list, not a picker with a live total. |
| arm-04 *(runner-up)* | 7 | — | Dedicated ProductDetail component (shared with the archive view via a canOrder flag) lists each option group with its resulting price; same static-list pattern as the other two arms but with cleaner single-component reuse across live/archive. |
| arm-05 | 2 | MISSING | No /catalog/[slug] or equivalent detail route exists at all — only an inline 'quick view' panel on the catalog grid substitutes for a detail page. Option pricing shown only inside that inline panel. |
| arm-06 **(winner)** | 8 | — | Dedicated /packages/[slug] detail page exists (confirmed present) alongside the quick-view dialog; option pricing shown via priceLabel()/lowestPriceCents() helpers with per-option deltas. |

### R-005 — Public past-collections archive

**Winner:** arm-06 (unchanged) · **Runner-up:** arm-03

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 7 | — | Single flat /collections page lists every CLOSED season's products inline with a 'Browse only' badge; no nested per-season route. |
| arm-02 | 7 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 *(runner-up)* | 8 | — | /archive index + dynamic /archive/[slug] detail route; explicit copy 'Checkout is never available from the archive.' |
| arm-04 | 8 | — | /archive index + /archive/[year] + /archive/[year]/[slug] — the deepest archive route nesting of the three, reusing the same ProductDetail component with canOrder=false. |
| arm-05 | 6 | — | /collections renders every CLOSED season's products inline with an explicit 'Archived collection · not available to buy' label and no buy CTA — simple but correct and complete for the requirement. |
| arm-06 **(winner)** | 8 | — | /past-collections lists CLOSED seasons that actually ran (has orders), browse-only with no price CTA; deliberately excludes never-opened season shells — a sharper real-world rule than the clone cluster's version. |

### R-006 — Product quick-view dialog

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 9 | — | Quick view inside CatalogExplorer is a true modal: role=dialog, aria-modal, Tab-cycle focus trap, Escape-to-close, body scroll lock, focus restored to the trigger on close. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 6 | — | Quick view in CatalogBrowser has role=dialog/aria-modal and shows options+price, but no focus trap, no Escape handling, and no scroll lock — a real dialog shell without the accessibility mechanics. |
| arm-04 | 5 | — | Quick view is deliberately NOT a JS modal — it's a `?quick=slug` URL-addressable inline <section> (explicit code comment explains the progressive-enhancement rationale). Accessible and complete as content, but doesn't meet the literal 'dialog' bar. |
| arm-05 | 5 | — | Quick view is an inline <section> toggled by state, not a real dialog: no role=dialog/aria-modal, no focus trap, no Escape handling, no scroll lock. Shows description/price/options correctly though. |
| arm-06 *(runner-up)* | 9 | — | True modal dialog with focus management, Escape close, and Tab-cycling focus trap; shows category/description/sold-out badge/options with price deltas/CTA. |

### R-007 — Homepage impact-stats bar

**Winner:** arm-06 (unchanged) · **Runner-up:** arm-01

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 *(runner-up)* | 6 | — | 3-stat bar present and well-styled, but the numbers ('650+', '1,800', '140', '26') are hardcoded JSX strings, not DB-derived. |
| arm-02 | 6 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 6 | — | 3-stat bar backed by a getSetting() lookup with a hardcoded DEFAULT_IMPACT fallback, but no admin UI was found that ever writes marketing.impactStats — in practice it always renders the coded defaults. |
| arm-04 | 6 | — | 3-stat bar backed by a dedicated marketing-content.ts module with an explicit comment stating these are intentionally-not-live editorial figures the office publishes, not DB counts — honest, but still hardcoded. |
| arm-05 | 3 | STUB | Single hardcoded inline string of 3 numbers embedded in JSX text, no component, no real data behind it at all. |
| arm-06 **(winner)** | 8 | — | 3-stat bar backed by live Prisma counts (packageCount, orders FINALIZED count, customer count) with an explicit code comment acknowledging what the labels actually mean vs. imply — real and honestly caveated. |

### R-008 — Homepage How It Works / mission / testimonials / final CTA

**Winner:** arm-06 *(CHANGED from arm-01)* · **Runner-up:** arm-01

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 *(runner-up)* | 6 | — | How-it-works (3 steps) and mission copy present, but only 1 testimonial (not 3) and no distinct final-CTA section beyond the hero buttons — footer newsletter substitutes. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 6 | — | How-it-works (3 steps) and 2 testimonials (settings-backed defaults) present; no distinct final-CTA section. |
| arm-04 | 6 | — | How-it-works (3 steps, well-titled) and 2 testimonials present; no distinct final-CTA section beyond the footer newsletter form. |
| arm-05 | 5 | — | 3 how-it-works cards and 1 testimonial present but terse/minimal; no distinct final CTA section beyond the hero buttons (newsletter footer substitutes). |
| arm-06 **(winner)** | 8 | — | Numbered how-it-works (3 steps), 3 testimonials, and a dedicated final CTA section ("Never miss a deadline" / newsletter) all present and well-structured. |

### R-009 — Newsletter subscribe + preferences + tokenized unsubscribe

**Winner:** arm-03 *(CHANGED from arm-05)* · **Runner-up:** arm-05

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 7 | — | Subscribe (rate-limited) + preferences (3 named toggles: productUpdates/volunteerStories/communityImpact) + unsubscribe (via PATCH isSubscribed:false) all HMAC-token-gated with expiry and timing-safe compare. No double opt-in flow. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 **(winner)** | 9 | — | Subscribe/preferences/dedicated-unsubscribe all HMAC-token-gated; every preference update or unsubscribe increments a per-subscriber tokenVersion that invalidates all older links — the strongest anti-replay design of any arm, plus zod validation and audit logging. |
| arm-04 | 8 | — | Subscribe/preferences (3 named toggles)/dedicated unsubscribe route, HMAC token signed with a purpose string + expiry + timing-safe compare in a clean dedicated tokens module. |
| arm-05 *(runner-up)* | 8 | — | Full double opt-in confirmation flow (confirmationToken hashed+expiring), HMAC-signed preference/unsubscribe tokens with key rotation support, timing-safe comparison. More rigorous token design than the clone cluster. |
| arm-06 | 8 | — | Subscribe/unsubscribe/preferences all present with HMAC-signed tokens; 3 independent preference toggles plus full unsubscribe, all posted with the token. |

### R-010 — First-run setup page (empty-staff bootstrap)

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-04

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 8 | — | GET/POST /api/setup: a BootstrapState unique-key row inside a transaction makes the lock race-safe; requires a Clerk identity + a SETUP_TOKEN secret; page polls locked state before showing the form. |
| arm-02 | 7 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | isSetupComplete() gate renders a locked message when a manager already exists, otherwise SetupForm; real but no extra layered secret token was found alongside it. |
| arm-04 *(runner-up)* | 8 | — | isSetupLocked() check answers a hard 403 (forbidden()) rather than a soft render once staff exist — 'permanently locked' by design per the page's own comment. |
| arm-05 | 6 | — | API has a real canBootstrap()/createFirstManager() guard (staff count = 0), and setup requires an authenticated identity to promote to Manager; page itself doesn't render a locked state, relying entirely on the API 409 to block re-use. |
| arm-06 | 7 | — | Page checks staffCount server-side, shows locked message when staff exist, otherwise the setup form; bootstrap presumably self-locks after first manager is created. |

### R-011 — Storefront shell: sticky header, desktop nav, mobile menu, user menu, footer

**Winner:** arm-04 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 6 | — | Sticky header, desktop nav, simple mobile-menu toggle (no click-outside/Escape dismissal), flat 'Account' link (no dropdown), footer with newsletter. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 6 | — | Sticky header, desktop nav, simple mobile-menu toggle, flat 'Account' link, footer with newsletter — same shape as arm-01's true build. |
| arm-04 **(winner)** | 8 | — | Sticky header with a native <details> mobile menu (keyboard-accessible with zero JS) and a dedicated UserMenu component that genuinely differentiates staff/customer/signed-out states — the most complete header of the three. |
| arm-05 | 6 | — | Sticky header (confirmed via CSS position:sticky), toggleable mobile nav, links to account/staff, footer with newsletter form. No dedicated user-menu dropdown (just a flat 'My account' link) — simpler than the other arms. |
| arm-06 *(runner-up)* | 8 | — | Sticky header, desktop nav, separate MobileMenu and UserMenu components, footer with newsletter — same shape as the clone cluster, cleanly split into its own component files. |

### R-012 — Storewide closed-order banner

**Winner:** arm-04 *(CHANGED from arm-01)* · **Runner-up:** arm-02

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 5 | — | Closed-state message is a hardcoded string inside StorefrontHeader (not admin-editable, no role=status), shown sitewide via the layout mounting the header. |
| arm-02 *(runner-up)* | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 6 | — | Closed-state banner (data-testid=store-closed-banner) is hardcoded text inside StorefrontShell, sitewide but not admin-editable. |
| arm-04 **(winner)** | 9 | — | Closed state is driven by two real admin-editable settings — a 'store.open' kill-switch AND a free-text 'brand.announcement' — read by readStoreState() and rendered sitewide in the layout with a dynamic closedStoreMessage(); genuinely admin-configurable, unlike the other two arms' hardcoded banners. |
| arm-05 | 6 | — | StorefrontShell renders a fixed '<aside class=closed-banner>' sitewide whenever isOpen is false, with a static message (not admin-configurable). |
| arm-06 | 7 | — | Storefront layout renders a sitewide role=status banner when no season is open, with copy that varies based on whether any closed seasons exist yet — but message text is hardcoded, not admin-settable like arm-01's. |

### R-013 — Footer email signup

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 8 | — | SiteFooter/layout footer mounts NewsletterForm(compact) wired to the real subscribe API. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 8 | — | StorefrontShell footer mounts NewsletterForm(compact) wired to the real subscribe API. |
| arm-04 | 8 | — | SiteFooter mounts a dedicated NewsletterSignupForm wired to the real subscribe API. |
| arm-05 | 7 | — | Footer has a real inline newsletter form (email input + submit) wired to POST /api/newsletter with success/error messaging. |
| arm-06 *(runner-up)* | 8 | — | Footer mounts a SubscribeForm component wired to the real subscribe API, same pattern as the clone cluster. |

### R-014 — Test-mode banner on storefront

**Winner:** arm-04 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 1 | MISSING | No test-mode banner exists anywhere in the storefront (confirmed via grep across the whole tree) — shoppers never see a test-mode indicator. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 1 | MISSING | A TEST MODE indicator exists only inside the admin layout's alert banner; the storefront layout/shell has no test-mode banner at all. |
| arm-04 **(winner)** | 9 | — | Dedicated, non-dismissible TestModeBanner (role=status) mounted at the top of the storefront layout, gated by isTestMode(), with an explicit design comment about why it can't be dismissed. |
| arm-05 | 1 | MISSING | A TEST/LIVE mode string exists only inside the admin layout header — the storefront layout/shell has no test-mode banner at all; storefront shoppers never see it. |
| arm-06 *(runner-up)* | 8 | — | TestModeBanner mounted in the storefront layout, gated on env.APP_ENV, with an explicit env-switch link back to the live site when configured — same coverage as the clone cluster plus a nice reverse-switch companion for admin. |

### R-015 — Package category filters

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 8 | — | Category chips derived from actual product.category values, URL-driven (?category=). |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | Category <select> populated from real distinct categories, client-state driven (not URL-driven). |
| arm-04 | 8 | — | Category filter is a real URL searchParam (?category=), validated server-side against categoriesOf(products), fully SSR — no client JS required. |
| arm-05 | 4 | — | Filter dropdown only offers a hardcoded 3-way product KIND filter (All/Mishloach manos/Donations), not a data-driven category taxonomy — a materially different, coarser feature than 'package category filters'. |
| arm-06 *(runner-up)* | 8 | — | Category chips derived from distinct product.category values, client-side filtered, same UX pattern as the clone cluster's URL-param version (state-driven instead of URL-driven). |

### R-016 — Package price sorting

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 8 | — | Name / price-asc / price-desc sort, URL-driven, correctly re-sorts the (already category-filtered) product list. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | Name / price-asc / price-desc sort <select>, client-state driven. |
| arm-04 | 8 | — | Name / price-asc / price-desc sort via a validated URL searchParam (isCatalogSort), fully SSR. |
| arm-05 | 7 | — | Featured/price-low/price-high sort select, client-state driven, correctly re-sorts the filtered product list. |
| arm-06 *(runner-up)* | 8 | — | Name / price-asc / price-desc sort using lowestPriceCents() (accounts for option deltas), same coverage as the clone cluster. |

### R-017 — Catalog sold-out handling

**Winner:** arm-06 (unchanged) · **Runner-up:** arm-04

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 7 | — | getAvailableQuantity()-derived sold-out state shown on grid/detail/quick-view and disables the order-builder Add button. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | isSoldOut() helper used consistently across catalog grid, quick-view, detail, and the builder product panel. |
| arm-04 *(runner-up)* | 8 | — | isSoldOut flag plus availableUnits() (onHand−reserved) used consistently across ProductCard/QuickView/ProductDetail/BuilderProductPanel, with an honest 'reserved when you pay' stock-line caveat. |
| arm-05 | 7 | — | isProductAvailable() checked in catalog grid (sold-out label, no CTA) and order builder (Add disabled, 'Sold out' label) — real logic, consistently applied in both surfaces. |
| arm-06 **(winner)** | 8 | — | isSoldOut()-derived badge shown on grid/quick-view/detail; low-stock warning ("Only N left") at <=10 units is a nice extra touch beyond the binary sold-out flag. |

### R-018 — Token-verified email preference states + 3 unsubscribe prefs

**Winner:** arm-03 *(CHANGED from arm-05)* · **Runner-up:** arm-05

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 7 | — | Token-gated preferences with 3 named toggles (productUpdates/volunteerStories/communityImpact) plus an overall subscribed/unsubscribed status — literally matches the '3 prefs' requirement. |
| arm-02 | 7 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 **(winner)** | 9 | — | 3 named toggles (seasons/updates/promotions) plus a dedicated unsubscribe endpoint, both gated by a token whose version increments (and is checked) on every state change — best-in-class anti-replay for this feature. |
| arm-04 | 8 | — | 3 named toggles (wantsSeasonAnnouncements/wantsOrderReminders/wantsImpactStories) plus a dedicated unsubscribe route, HMAC-signed token with purpose string + expiry. |
| arm-05 *(runner-up)* | 8 | — | 3 named preference toggles (marketing/updates/reminders) plus a full unsubscribe, all token-gated (JWT-like HMAC token with keyId rotation and timing-safe compare) — matches the '3 prefs' requirement literally and with strong token hygiene. |
| arm-06 | 8 | — | 3 named preference toggles (prefNewProducts/prefReminders/prefCommunity) plus a full unsubscribe/resubscribe flow, all posted with an HMAC token — matches the requirement literally. |

### R-019 — Multi-recipient order builder (shared storefront/POS shell)

**Winner:** arm-04 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 8 | — | components/order-builder.tsx accepts mode='storefront'|'pos' and is mounted directly by both /order/page.tsx and admin/pos/page.tsx (confirmed by import) — real sharing. Multi-recipient via per-line recipientSource/recipientAddressId. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 8 | — | components/order/builder-shell.tsx (OrderBuilderShell) accepts mode='storefront'|'pos' and is mounted by both /order/page.tsx and components/admin/pos-page-client.tsx (confirmed by import) — real sharing. Per-line assignment via AssignDialog. |
| arm-04 **(winner)** | 9 | — | BuilderProductPanel/CartPanel/AssignmentPanel/AddRecipientPanel/SavedAddressEditor are all genuinely shared between /order and admin/pos/[customerId], with an explicit code comment confirming the intentional sharing. Per-line assignment via a real recipient/method/pickup/greeting model — the richest of the three. |
| arm-05 | 4 | — | Storefront order builder is real (multi-recipient per line), but POS (/admin/pos) is a completely separate, single-item quick-sale form that does NOT reuse the OrderBuilder component at all — the 'shared shell' half of this requirement is not met. |
| arm-06 *(runner-up)* | 9 | — | components/order-builder/order-builder-shell.tsx takes a `pos` prop and is mounted identically by both the storefront /order page and admin/pos/pos-shell.tsx — confirmed real sharing. Multi-recipient via per-line recipient assignment + reducer. |

### R-020 — Inventory-aware / live-stock package selection

**Winner:** arm-02 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 5 | — | Availability is a page-load snapshot (getAvailableQuantity at render time); no periodic client refresh/poll was found in the builder — stock can go stale during a long session. |
| arm-02 **(winner)** | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 5 | — | stockAvailable is fetched once via /api/builder/catalog at builder mount; no polling loop found — same staleness gap. |
| arm-04 | 5 | — | unitsLeft is read once per page render via readProductAvailability(); the whole builder is server-actions/SSR-based with no client polling loop, though the stock line is honestly labeled as a snapshot ('reserved when you pay'). |
| arm-05 | 6 | — | isProductAvailable() computed from the server-rendered snapshot and re-checked at add-time; Add disabled when sold out. No periodic client refresh, so stock can go stale during a long session. |
| arm-06 *(runner-up)* | 6 | — | Stock computed server-side at page load (product.stock, soldOut) and shown per product card with a low-stock warning; no client-side polling/refresh loop was found, so availability can also go stale during a long session — same gap as arm-05. |

### R-021 — Product options + restricted add-ons

**Winner:** arm-06 (unchanged) · **Runner-up:** arm-01

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 *(runner-up)* | 8 | — | Options + allowedAddOns-restricted add-ons wired into the cart line UI; the draft PATCH endpoint independently re-validates every option/add-on against the product's real allowed set and current inventory server-side. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | Options + an isRestricted flag on add-ons shown in the quick-view UI; restriction is surfaced to the shopper but a full server-side re-validation of the restriction wasn't confirmed in the reviewed slice. |
| arm-04 | 8 | — | addOnsFor() computes each product's allowed add-ons from an AddOn.restrictions join table and both the UI and the add-to-cart server action read from that same real restriction set. |
| arm-05 | 7 | — | product.options (single-select dropdown) and product.restrictedAddons both real and wired into line editing with live total recompute; option model is single-select vs. arm-01's multi-select checkboxes but functionally complete. |
| arm-06 **(winner)** | 8 | — | ProductOptionValue options and ProductAddOn restriction enforced not just in the UI but re-validated server-side in resolveDraftLines (rejects an add-on not allowed on its parent product, rejects an option value that doesn't belong to the product) — stronger correctness than the UI-only enforcement in the other arms. |

### R-022 — Save and resume web drafts (autosave + guest clear on success)

**Winner:** arm-02 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 8 | — | 500ms-debounced autosave to a server draft plus a localStorage mirror; a dedicated success route explicitly clears the guest cookie/token hash on successful checkout only, and this exact behavior is covered by p4-smoke.ts. |
| arm-02 **(winner)** | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | No separate 'autosave' step — each cart mutation is a direct server-action write, so there's nothing to debounce or lose; a guestClearedAt field exists to support clearing on success. |
| arm-04 | 7 | — | Same direct-persistence-per-action model as arm-03; clearGuestToken() is called when a guest's draft is claimed at sign-in during checkout, not exactly gated on 'checkout success' but functionally close. |
| arm-05 | 6 | — | 700ms-debounced autosave to a server draft keyed by an access token stored in sessionStorage (not httpOnly cookie — more exposed to XSS than the other arms' approach); resumes on reload via sessionStorage id. Guest-clear-on-success behavior not directly verified in the reviewed slice. |
| arm-06 *(runner-up)* | 8 | — | Explicit design comment: signed-in customers autosave to a server draft; guests autosave to localStorage and only get a server draft + httpOnly-cookie access token at checkout identity capture; guest copy clears ONLY on success/explicit cancel, never on refresh — matches the spec intent, though guest state living in localStorage before checkout is a smaller attack surface than a cookie-backed draft from the first keystroke. |

### R-023 — Guest checkout access tokens

**Winner:** arm-03 *(CHANGED from arm-01)* · **Runner-up:** arm-02

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 8 | — | 32-byte random token, SHA-256 hashed at rest, httpOnly/sameSite=lax cookie; findAccessibleDraft() never accepts a client-supplied draft id without a matching token/session. |
| arm-02 *(runner-up)* | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 **(winner)** | 9 | — | 24-byte token hashed with a secret+version salt, per-draft tokenVersion supports rotation, timing-safe compare, uniform 404s so a wrong-principal request can't tell a draft exists — the most rigorous guest-token design of the six. |
| arm-04 | 8 | — | 32-byte token, SHA-256 hashed, httpOnly cookie via shared BROWSER_COOKIE_OPTIONS, clean DraftOwner union type keeps guest/customer/POS ownership from ever being conflated. |
| arm-05 | 5 | — | Guest token exists and is sent via a custom x-draft-access-token header, but the raw token is kept in sessionStorage on the client rather than an httpOnly cookie — more exposed to XSS/theft than the clone cluster or arm-06's cookie-based approach. |
| arm-06 | 8 | — | generateGuestToken/hashGuestToken/verifyGuestToken with url-safe random tokens, hashed storage, httpOnly cookie delivery, and dedicated unit checks (scripts/test-p4.mts) covering uniqueness, determinism, and rejection of wrong/null tokens. |

### R-024 — Saved-address reuse in ordering

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 8 | — | AddressPicker lists the signed-in customer's saved addresses by reference (no duplication); an 'Edit this address' action opens the same dialog in place. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 8 | — | AssignDialog's address_book mode lists saved addresses by reference with inline edit. |
| arm-04 | 8 | — | AssignmentPanel's saved-recipients <select> reuses CustomerAddress rows by id, with a per-address 'Edit' link. |
| arm-05 | 7 | — | Per-line recipient select offers 'self/saved address' and 'someone in my address book', backed by draft.addresses — real reuse, though selection UX is a plain <select> rather than a dedicated picker. |
| arm-06 *(runner-up)* | 8 | — | RecipientAssignDialog lists bookAddresses for reuse by reference; add-recipient autocomplete also fills from and can point at existing book entries — same coverage as the clone cluster. |

### R-025 — Address autocomplete + server-side validation

**Winner:** arm-03 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 3 | MISSING | No autocomplete/suggestion feature exists anywhere in the true build (confirmed via grep) — only a plain <select> of already-saved addresses. No dedicated server-side address-validation endpoint was found either. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 **(winner)** | 8 | — | A real debounced (200ms) /api/addresses/autocomplete suggestion list while typing a new recipient, plus a separate POST to the same endpoint that validates the address server-side before the assignment is accepted. |
| arm-04 | 6 | — | Autocomplete is deliberately native-only: browser autofill via autoComplete attributes plus a <datalist> of the customer's own known recipient names — a real, working, if more modest, alternative to a typed-suggestion API; the same AddressFields component is reused everywhere addresses are entered. |
| arm-05 | 3 | MISSING | No autocomplete/suggestion feature exists anywhere in the codebase (confirmed via grep — zero matches). Server-side validation is real (zod addressSchema in the address PATCH route) but that's only half the requirement. |
| arm-06 *(runner-up)* | 7 | — | Add-recipient dialog suggests from the customer's own address book as they type (client-side filter, capped list), matching the clone cluster's scope; server-side validation + deliverability check via POST /api/addresses/validate before a recipient is accepted. |

### R-026 — Builder product panel + cards + in-builder quick view

**Winner:** arm-03 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 6 | — | ProductPanel + BuilderProductCard grid, and a dedicated ProductQuickView dialog — but that dialog only shows name/description/Add; there are no options or add-ons inside it, so customization still happens after the item lands in the cart, not in the quick view itself. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 **(winner)** | 8 | — | ProductPanel + cards, with a genuine in-card quick-view dialog that includes option selection, add-on checkboxes, and a quantity input before the item is added — matches the requirement's intent precisely. |
| arm-04 | 8 | — | BuilderProductCard puts option selects, add-on checkboxes, and quantity directly on the card itself (no modal needed to customize before adding); the 'Quick view' link instead opens the full read-only product page for more detail — a different but complete packaging of the same requirement. |
| arm-05 | 5 | — | Product panel + cards exist in the builder, but there is no dedicated in-builder quick-view dialog — options/add-ons are only editable after a line is already added (inline in the cart section), not via a pre-add quick view like the other two arms. |
| arm-06 *(runner-up)* | 8 | — | Dedicated ProductPanel/ProductCard/ProductQuickView files; quick view is a real modal with options/add-ons and an Add action, mirroring the clone cluster's approach with cleaner component separation. |

### R-027 — Assign products to recipients

**Winner:** arm-04 *(CHANGED from arm-01)* · **Runner-up:** arm-01

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 *(runner-up)* | 8 | — | Each cart line carries recipientSource/recipientAddressId, editable per-line via a <select> plus AddressPicker. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 8 | — | Each line is independently assignable via AssignDialog (on_order/address_book/new_recipient). |
| arm-04 **(winner)** | 9 | — | Each line's assignment bundles recipient AND fulfillment method AND pickup location AND a greeting message, independently per line — the richest per-line assignment model of the three. |
| arm-05 | 7 | — | Each cart line carries its own `recipient` (self/saved/new), editable per line via a select + conditional fields — real per-line assignment, just plainer UI. |
| arm-06 | 8 | — | Each cart line has recipientClientId; RecipientAssignDialog assigns per line to an existing draft recipient, book address, or a newly-created one — server-side resolveDraftLines re-validates the recipient reference too. |

### R-028 — Add recipient from saved address / new address

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 8 | — | 3-source picker (on order / address book / new recipient); a new recipient is POSTed to /api/account/addresses and so lands in the customer's book automatically. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 8 | — | AssignDialog's new_recipient mode collects a full address, validates it server-side via /api/addresses/autocomplete (POST), and saves it to the book. |
| arm-04 | 8 | — | AddRecipientPanel collects a full address (with datalist-assisted recipient name) and saves it via the same AddressFields-backed server action used by the account address book. |
| arm-05 | 7 | — | Recipient select offers saved-address or brand-new-recipient (with full address fields); new recipients are just embedded in the line, not necessarily persisted to a reusable book entry in this component. |
| arm-06 *(runner-up)* | 8 | — | AddRecipientDialog supports picking from bookAddresses via autocomplete-fill or entering a fully new address, with an explicit 'Save to my address book' checkbox for signed-in customers and server deliverability validation before acceptance. |

### R-029 — Edit saved address while ordering

**Winner:** arm-03 *(CHANGED from arm-01)* · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 7 | — | AddressPicker's 'Edit this address' button opens the address dialog in place and PATCHes the saved address without leaving the builder, but doesn't warn about other on-order lines that reference the same address. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 **(winner)** | 8 | — | AssignDialog's inline 'Edit address' form PATCHes /api/addresses/[id] in place and refreshes the local book state without leaving the builder. |
| arm-04 | 8 | — | SavedAddressEditor opens per-line via an editAddress URL param and PATCHes the address in place; an explicit code comment notes the change follows every draft line that quotes the address, not just the one being edited. |
| arm-05 | 2 | STUB | A PATCH /api/addresses/[id] endpoint exists and is real, but the order builder UI never calls it — no edit affordance for a saved address is wired into the ordering flow at all, so the requirement's 'while ordering' half is not met. |
| arm-06 *(runner-up)* | 8 | — | RecipientAssignDialog exposes onEditAddress which opens a dedicated EditSavedAddressDialog in-place, updates the local book state on save, without leaving the builder. |

### R-030 — Desktop order sidebar + mobile cart FAB

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 8 | — | Sticky desktop aside (lg:block) holds the cart; a fixed mobile FAB with item count + running total opens the same cart markup as a full-screen overlay. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 8 | — | Sticky desktop CartSidebar; a fixed mobile FAB with count + subtotal opens a bottom drawer mounting the same CartSidebar. |
| arm-04 | 8 | — | Sticky desktop CartPanel; a fixed mobile FAB is a plain #cart-sheet anchor link that scrolls to the same CartPanel rendered again below — no JS drawer needed, consistent with the app's no-JS-required philosophy. |
| arm-05 | 7 | — | CSS-confirmed: .cart-sidebar is sticky on desktop and hidden below 700px; .cart-fab is a real fixed-position button shown only on mobile that scrolls to the cart section — simpler (scroll vs. modal) but functionally real. |
| arm-06 *(runner-up)* | 8 | — | OrderSidebar (desktop) and MobileCartFab (mobile, opens the same CartPanel) are dedicated components mounted side-by-side in OrderBuilderShell — same coverage as the clone cluster with cleaner separation. |

### R-031 — Shared storefront/POS builder shell

**Winner:** arm-01 (unchanged) · **Runner-up:** arm-06

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 **(winner)** | 9 | — | Confirmed by direct import: admin/pos/page.tsx imports and mounts the exact same components/order-builder.tsx used by /order, passing mode='pos' plus a posCustomerId/checkoutBasePath override. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 8 | — | Confirmed by direct import: components/admin/pos-page-client.tsx imports and mounts OrderBuilderShell with mode='pos' — the same real sharing pattern. |
| arm-04 | 9 | — | Confirmed by direct import and an explicit code comment: admin/pos/[customerId]/page.tsx mounts the same BuilderProductPanel/CartPanel/AssignmentPanel components as /order, bound to counter-specific server actions instead of duplicating any of the builder UI. |
| arm-05 | 1 | MISSING | Confirmed by direct inspection: admin/pos/page.tsx is a standalone single-item form (name/gift/qty/payment method) with its own hand-rolled fetch to /api/admin/operations — it does not import or reuse app/components/order-builder.tsx in any way. The 'shared shell' requirement is not met. |
| arm-06 *(runner-up)* | 9 | — | Confirmed by direct import: app/(admin)/admin/pos/pos-shell.tsx imports and mounts components/order-builder/order-builder-shell.tsx with a `pos` config object — same real sharing pattern as arm-01. |
