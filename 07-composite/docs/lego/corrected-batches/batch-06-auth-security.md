# Batch 06 — Auth & Security — Corrected Pass A Scorecard

**Correction scope:** arm-01, arm-03, and arm-04 were re-graded from their true, recovered
codebases (`/tmp/tomchei-work/true-arms/arm-01`, `arm-03`, `arm-04`). arm-02, arm-05, and
arm-06 scores/flags/notes are copied through byte-for-byte unchanged from the original
(uncorrected) `batch-06-auth-security.json` and verified programmatically to match. Winner
and runner_up were recomputed fresh for every item across all six (now-correct) scores.

## Changes vs original Pass A

**19 of the 30 items (63%) had their winner change.** The `CLONE-TIE` flags that had been
applied to arm-01/03/04 across this batch were removed everywhere, since all three are
genuinely independent, non-clone implementations once graded on their real code.

| Item | Old winner | New winner | Why |
|---|---|---|---|
| R-107 | arm-01 (mislabeled) | **arm-03** | True arm-03 is the only one of the three with a fail-closed `clerkMiddleware()+auth.protect()` AND a mounted `ClerkProvider`. |
| R-108 | arm-01 (mislabeled) | **arm-02** | True arm-01/03 have *no* sign-in page at all; arm-02 (unchanged) still has the only fully working page. arm-04 moves into 2nd with a real (dev-only) local sign-in flow. |
| R-113 | arm-06 | **arm-01** | True arm-01 has a real SHA-256-hashed, TTL'd invite-token flow — better than the mislabeled version credited before. |
| R-115 | arm-01 (mislabeled) | **arm-04** | True arm-03's admin layout checks permissions but doesn't actually block rendering on failure; true arm-04's layout is a hardened, comment-documented hard gate. |
| R-117 | arm-01 (mislabeled) | **arm-04** | Same finding as R-115. |
| R-118 | arm-01 (mislabeled) | **arm-04** | True arm-03 and arm-04 both ship a real named `driver.access`/`routes.drive` permission for the DRIVER role — a direct match for the item, unlike the magic-link-only design the rest of the batch converges on. |
| R-120 | arm-01 (mislabeled) | **arm-04** | True arm-04 has a dedicated `StaffLoginSession` table capturing ip/userAgent on every login, the most complete "session login stamp" in the batch. |
| R-121 | arm-01 (mislabeled) | **arm-04** | True arm-04's `DraftOwner` discriminated union is explicitly commented as the R-121 defense; arm-02 (unchanged) ties at the top. |
| R-122 | arm-04 (mislabeled) | **arm-03** | True arm-03's `withPublicGuard()` is the most carefully reasoned proxy-trust design (session-identity-preferred rate limiting, TRUST_PROXY-gated fallback). |
| R-123 | arm-05 | **arm-03** | Recomputed: arm-05's rotating-secret feature was scored 8, below several 9s (arm-01/02/03/04/06); true arm-03's token-never-leaves-via-HTTP design is the cleanest of the 9s. |
| R-124 | arm-01 (mislabeled) | **arm-06** | True arm-01 scores 8, not 9 — it fails closed but lacks the SHA-256-pre-hash refinement; arm-06 (unchanged, score 9) is the highest of the real scores, with true arm-04 independently converging on the same trick as the new runner-up. |
| R-127 | arm-01 (mislabeled) | **arm-03** | True arm-03's offline-payment route is explicitly commented "R-127. Public callers must be rejected" — the clearest self-documented implementation. |
| R-128 | arm-01 (mislabeled) | **arm-04** | True arm-04 requires extension + declared-type + magic-byte sniffing to all agree; true arm-01 only checks the client-declared MIME type. |
| R-129 | arm-01 (mislabeled) | **arm-02** | arm-02 (unchanged, score 9) remains highest; true arm-01's real wipe function is narrowly scoped to scale-test fixtures only, not season-wide. |
| R-130 | arm-06 | **arm-04** | True arm-04's bootstrap is transaction + unique-key-lock + P2002 fallback, and is the only arm with a dedicated `bootstrap.test.ts`. |
| R-131 | arm-01 (mislabeled) | **arm-04** | True arm-01's env module has no schema-validation library at all (only `DATABASE_URL` enforced); true arm-04's declarative `env-spec.ts` + top-level `loadEnv()` is the most complete design in the batch. |
| R-132 | arm-01 (mislabeled) | **arm-04** | True arm-01's client-error route doesn't even capture a message field and has no rate limit; true arm-04 has same-origin + rate limit + Zod bounds with explicit reasoning. |
| R-134 | arm-01 (mislabeled) | **arm-04** | True arm-04 is the only arm whose admin-mutation surface spans both API routes and 30 `'use server'` actions, all sharing one `requirePermission()` gate. |
| R-136 | arm-06 | **arm-04** | True arm-04 is the *only* arm of the six that actually uses Server Actions extensively — the item's literal subject applies to it uniquely, backed by a bounded `FormState` pattern and a dedicated error-truncation utility. |

## Full scorecard

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up |
|---|---|---|---|---|---|---|---|---|---|
| R-107 | Clerk identity integration + middleware | 5 | 6 | 7 | 5 | 4 (MISSING) | 2 (MISSING,THEATER) | **arm-03** | arm-02 |
| R-108 | Sign-in / sign-up pages | 2 (MISSING) | 8 | 3 (MISSING) | 6 | 1 (MISSING) | 2 (MISSING,BROKEN) | **arm-02** | arm-04 |
| R-109 | Role model: RBAC + linear rank + carve-outs | 6 | 6 | 7 | 6 | 5 | 9 | **arm-06** | arm-03 |
| R-110 | Per-user permission grants/denies + override editor | 7 | 8 | 8 | 8 | 6 | 9 | **arm-06** | arm-04 |
| R-111 | Server-side authorization gate (requirePermission) | 9 | 9 | 8 | 9 | 8 | 9 | **arm-01** | arm-06 |
| R-112 | Staff confirmation + revocation gate | 9 | 6 | 5 | 8 | 6 | 9 | **arm-06** | arm-01 |
| R-113 | Staff invitation identity linking | 9 | 3 (MISSING) | 6 | 6 | 4 | 9 | **arm-01** | arm-06 |
| R-114 | Customer identity linking + owned profile updates | 8 | 8 | 8 | 8 | 3 (MISSING) | 7 | **arm-01** | arm-06 |
| R-115 | Admin + messenger application gates | 8 | 8 | 5 | 9 | 3 | 8 | **arm-04** | arm-02 |
| R-116 | Driver route ownership scoping | 9 | 9 | 8 | 9 | 8 | 9 | **arm-01** | arm-06 |
| R-117 | "Must be staff" hard guard + storefront staff check | 8 | 8 | 5 | 9 | 2 (MISSING) | 8 | **arm-04** | arm-02 |
| R-118 | canDrive carve-out for driver-route permissions | 4 (MISSING) | 4 (MISSING) | 8 | 9 | 4 (MISSING) | 4 (MISSING) | **arm-04** | arm-03 |
| R-119 | Staff-management mutation hardening (self-target blocks) | 8 | 9 | 8 | 9 | 8 | 9 | **arm-06** | arm-04 |
| R-120 | Security-relevant audit trail + session login stamp | 7 | 8 | 8 | 9 | 6 | 8 | **arm-04** | arm-03 |
| R-121 | Draft-order ownership + anti-enumeration gate | 8 | 9 | 7 | 9 | 7 | 8 | **arm-04** | arm-02 |
| R-122 | Guarded public JSON endpoints | 7 | 8 | 9 | 8 | 7 | 8 | **arm-03** | arm-04 |
| R-123 | Signed email-preference changes (HMAC, timing-safe) | 9 | 9 | 9 | 8 | 8 | 9 | **arm-03** | arm-01 |
| R-124 | Cron endpoint authentication (bearer secret) | 8 | 9 | 9 | 9 | 8 | 9 | **arm-06** | arm-04 |
| R-125 | Stripe webhook authenticity + idempotency | 9 | 9 | 9 | 9 | 8 | 9 | **arm-06** | arm-01 |
| R-126 | Charged-amount + fulfillment safety checks | 9 | 9 | 9 | 9 | 7 | 9 | **arm-01** | arm-04 |
| R-127 | Server-enforced offline payment policy | 6 | 6 | 7 | 7 | 5 | 6 | **arm-03** | arm-04 |
| R-128 | Restricted + validated media uploads | 5 | 8 | 6 | 9 | 7 | 8 | **arm-04** | arm-02 |
| R-129 | Test-only destructive operations (reset/wipe/seed) | 7 | 9 | 8 | 8 | 6 | 8 | **arm-02** | arm-04 |
| R-130 | Empty-database bootstrap lockout | 8 | 9 | 8 | 9 | 5 | 9 | **arm-04** | arm-06 |
| R-131 | Startup secret + environment validation | 4 | 8 | 6 | 9 | 2 (THEATER) | 7 | **arm-04** | arm-02 |
| R-132 | Bounded, redacted client error ingestion | 4 | 8 | 5 | 8 | 5 | 7 | **arm-04** | arm-02 |
| R-133 | Automated repository security guardrails (CI) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 0 (MISSING) | 4 | 0 (MISSING) | **arm-05** | arm-01 |
| R-134 | Guarded staff-only API routes | 8 | 8 | 8 | 9 | 7 | 8 | **arm-04** | arm-02 |
| R-135 | Permission unit tests | 6 | 8 | 7 | 8 | 7 | 8 | **arm-06** | arm-04 |
| R-136 | Production error masking for server actions | 4 | 5 | 7 | 7 | 4 | 7 | **arm-04** | arm-06 |

## Notes on methodology

- All three re-graded arms had their `CLONE-TIE` disqualify flags removed: once graded on
  real code, none of them are byte-identical to arm-02 anywhere in this batch.
- Two structural findings recur across multiple items and are worth flagging explicitly:
  - **True arm-01 and arm-03 both have real Clerk backend calls (`auth()`/`currentUser()`)
    but no mounted `ClerkProvider`/rendered Clerk UI anywhere**, so in a real (non-dev)
    deployment there is no page through which anyone can actually complete a Clerk
    sign-in. This depresses arm-01's and arm-03's scores on R-107/R-108 relative to what
    a superficial "Clerk imports exist" check would suggest.
  - **True arm-03's admin layout checks permissions but does not block rendering on
    failure** (R-115/R-117) — it degrades to a chrome-less render of the child page rather
    than a hard 403, a real (if partial, since API routes remain independently gated)
    defense-in-depth gap.
- True arm-04 turned out to be the standout of this batch: it wins or ties for the win on
  10 of 30 items, largely on the strength of a consistently more defensive design
  (magic-byte media validation, a declarative env-spec that can't drift from
  `.env.example`, a dedicated login-session table, transaction-plus-unique-key bootstrap
  locking, and — uniquely among all six arms — genuine, widespread use of Next.js Server
  Actions for admin mutations, which makes it the only arm for which R-136's literal
  subject (masking errors from `'use server'` actions) actually applies).
