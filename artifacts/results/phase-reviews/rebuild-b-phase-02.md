# Phase review — rebuild-b / Phase 2: Identity, tenancy, and onboarding

Model: claude-sonnet-5-thinking-high
Runner: spawn
Arm: rebuild-b
Phase: 2
Review date: 2026-07-15

## Meta

- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Arm reviewed: rebuild-b
- Phase number: 2
- Diff / files touched this phase: `prisma/schema.prisma`, `prisma/seed.ts`, `src/auth/session.ts`, `src/domain/identity.ts`, `src/db/client.ts`, `src/content/default-groups.ts`, `middleware.ts`, `app/login/**`, `app/register/**`, `app/onboarding/page.tsx`, `app/admin/page.tsx` + `logout-button.tsx`, `app/api/auth/**`, `app/api/me/route.ts`, `app/api/onboarding/route.ts`, `app/api/invites/**`, `app/api/webhooks/clerk/route.ts`. This reviewer only wrote this report; ran `npm install`/`db:setup`/`dev`, hit live endpoints, then reseeded and killed the server.

## Proof-of-read

### `results/PHASE-REVIEW-RUBRIC.md`
Thirteen checklist items plus six 1-10 scores, every item needs evidence or `N/A`+why, full report goes to the given path.

### `rebuild-b/PHASE-PLAN.md` (Phase 2)
Scope is identity/tenancy/onboarding only: R2-R4, P2/P4o family, D1/D3-D5, E1/E2/E6/E7, F-ME-SHAPE, F-DB-DRIFT. Done = a new user can sign up, create/join an org, see pending approval, and reach the authed area with server-derived membership.

### `rebuild-b/STATUS.md`
Phase 1 done on 3102; Phase 2 claims the full ID list above, lists completed work (schema, local auth, flat `/api/me`, onboarding, invites, webhook, minimal `/admin`), start commands, and a verification log ending in "server stopped, DB reseeded clean."

### `rebuild-b/DECISION-LOG.md`
Six Phase-2-relevant decisions: local session auth (no Clerk keys available), flat `/api/me` contract, full D1-D17 schema pushed now, new orgs start pending. Each has a stated reason tied to the inventory or the phase gate.

### Inventory (`FEATURE-INVENTORY.md`) for the claimed IDs
R2/R3 are Clerk catch-alls needing an `sso-callback` sibling; R4 is create-org/invite-accept/pending. D1/D3-D5 are Organization/User/OrgMembership/OrgInvite with the fields listed. E1 must be flat with top-level `isSuperAdmin` (a named "break-the-app" bug if nested). E6/E7 are the Clerk webhook and invite accept/list. F-DB-DRIFT wants schema as single source on a fresh DB.

### Rules in `rebuild-b/.cursor/rules/`
Same six always-on files as the DECISION-LOG proof-of-read summarizes: workflow (expectation files + running-app evidence), vocabulary (scope words, no invented protocols), git-discipline (orchestrator owns git, contestant doesn't run it), codegraph (MCP/CLI before grep, N/A if uninitialized), ponytail (ladder, no speculative abstractions), clean-code (naming, one pattern per concern, no swallowed errors).

### Phase 2 code
Read all of `app/login`, `app/register`, `app/onboarding`, `app/admin`, `app/api/{me,onboarding,invites,auth,webhooks}`, `prisma/`, `src/auth`, `src/domain`, `middleware.ts`.

## Checklist

### 1. Inventory coverage

| Claimed IDs | Status | Evidence |
|---|---|---|
| R2, R3 | PRESENT | `app/login/[[...login]]/page.tsx`, `app/register/[[...register]]/page.tsx` catch-alls; both live-verified 200. |
| R4 | PRESENT | `app/onboarding/page.tsx` handles create/accept/pending in one page, live-verified. |
| P2.1, P2.2 | PRESENT | Sign-in/sign-up forms post to `/api/auth/login|register`, live-verified. |
| P2.3 | PARTIAL | `sso-callback` paths exist for both catch-alls (satisfies the routing requirement) but OAuth itself does not complete — an explicit placeholder pointing at "configure Clerk keys." Matches the logged decision (no Clerk keys this arm) but OAuth sign-in is not functional. |
| P4o.1 | PRESENT | Name + auto-slug + live uniqueness check; verified `demo` returns taken, a new slug returns available. |
| P4o.2 | PARTIAL | Inventory wants "address → lat/lng/elevation/timezone"; the form takes lat/lng/elevation as raw numeric inputs with no geocoding, and timezone is browser-autodetected, not derived from the address. Functionally captures the same fields but skips the address-to-coordinates step. Not logged as a scope decision. |
| P4o.3 | PRESENT | Dialect select, candle-lighting minutes, shabbat-end type/value all present and posted. |
| P4o.4 | PRESENT | `POST /api/onboarding` (create-org) seeds a Style, a Screen, and 34 ScheduleGroups; live-verified end to end. |
| P4o.5 | PRESENT | Pending-invite list + accept-by-token; live-verified (invitee saw the seeded invite and accepted it into an editor membership). |
| P4o.6 | PRESENT | New orgs default to `status: "pending"`; onboarding UI and `/admin` both surface pending state; live-verified. |
| D1, D3, D4, D5 | PRESENT | `schema.prisma` matches the inventory's field lists for Organization/User/OrgMembership/OrgInvite. |
| E1 | PRESENT | `/api/me` returns the flat shape with top-level `isSuperAdmin`; live-verified. |
| E2 | PRESENT | create-org + accept-invite actions in one handler; live-verified. |
| E6 | PRESENT | Svix path when `CLERK_WEBHOOK_SECRET` is set, dev-secret path otherwise; a request with neither is rejected (returns 500, see Security). |
| E7 | PRESENT | `[token]` GET/POST and `pending` GET; live-verified. |
| F-ME-SHAPE | PRESENT | Locked flat contract, tested live. |
| F-DB-DRIFT | PRESENT | All 17 D1-D17 models exist in one `schema.prisma`, pushed to a fresh SQLite DB. |

Two PARTIALs, both minor and one undocumented; everything else claimed for this phase is present and live-verified.

### 2. Running app

Verified. Ran `npm install` (already present), `npm run db:setup` (schema push + seed succeeded), `npm run dev` on port 3102 (Next 16.2.10 Turbopack, ready in under a second). Exercised live:
- `GET /`, `/login`, `/register`, `/login/sso-callback`, `/register/sso-callback` → 200.
- `GET /api/me` unauthenticated → 401. `GET /admin` unauthenticated → 307 to `/login`.
- Login as `owner@demo.local` → flat `/api/me` with `isSuperAdmin: false` and active `demo` membership → `/admin` renders "Demo Synagogue."
- Login as `newcomer@demo.local` → `/api/onboarding?slug=demo` reports taken → `create-org` returns `status: "pending"`.
- Login as `invitee@demo.local` → sees the seeded pending invite → accepts `seed-invite-token` → membership becomes active editor on `demo`.
- Webhook POST with no matching secret is rejected (500, not the intended 401 — see Security).
- Found via live test, not code reading alone: `POST /api/auth/register` with an **existing** user's email (`owner@demo.local`) returns 200 and silently takes over that account (details in Security).
Server killed after (port 3102 confirmed closed), DB reseeded back to the clean seed state.

### 3. No stubs

PASS. `sso-callback` pages are honest, labeled placeholders explaining Clerk isn't configured — not claimed as working OAuth. `/admin` explicitly says "Full dashboard sections arrive in later phases" rather than faking completeness. No dead buttons found; every control wired to a handler that does something real.

### 4. Rule: ponytail

PARTIAL. No new dependency for a problem stdlib/`crypto` already solves (HMAC session signing via Node's `crypto` server-side and Web Crypto in the edge middleware — appropriately two implementations for two runtimes, not duplication). One real ladder miss: the org-defaults seeding (create a Style + Screen + 34 ScheduleGroups) is written twice, nearly identically, in `prisma/seed.ts` (`seedOrgDefaults`) and `src/domain/identity.ts` (`seedOrganizationDefaults`). That's exactly the "copy-paste with minor variations" pattern ponytail and clean-code both ban.

### 5. Rule: clean-code

PARTIAL. Naming is good throughout (`isSuperAdmin`, `slugAvailable`, `isPublicPath` all read as yes/no questions). Error messages are specific and state the expected condition (`` `Invite was issued for ${invite.email}, not ${user.email}` ``, `` `Slug "${slug}" is already taken` ``). No swallowed catches — the two `catch { return null }` blocks in session verification are deliberate "invalid token → no session" logic, not error suppression. The duplicated seed-defaults function from #4 is the one violation of "one pattern per concern."

### 6. Rule: workflow

PARTIAL. `STATUS.md` records concrete running-app evidence (typecheck, build, live login/onboarding/invite/webhook checks, server stopped, DB reseeded) — the tiered verification bar is met. No `.scratch/phase-plan.md` exists in the working tree now; `.scratch/` is gitignored so this can't be confirmed as "never written" vs. "written and later cleaned up," but the required per-todo EXPECTED-block artifact isn't available for this review either way.

### 7. Rule: codegraph

N/A. No `.codegraph/` directory in `rebuild-b`; index was never initialized for this arm, so the CLI/MCP-first rule doesn't bind. Reading files directly was the only option, consistent with the rule's own fallback clause.

### 8. Rule: git-discipline

N/A / PASS. `git log` in the experiment repo shows orchestrator-authored commits ("Experiment arm B: Phase 1 bilingual landing complete.", "Experiment: both arms Phase 2 complete."); nothing suggests the contestant ran git directly. This reviewer made no git changes.

### 9. Todos / PHASE-PLAN fidelity

PARTIAL. Everything the "Done when" line in `PHASE-PLAN.md` asks for is live-verified (signup → create/join org → pending state → authed area with server-derived membership). The two inventory PARTIALs above (OAuth not functional, address-to-coordinates step skipped) are small deviations from the full IDs claimed; the OAuth one is logged as a decision, the geocoding one is not.

### 10. Context retention

PRESENT. Phase 1's landing page, locale switch, and login/register links are untouched and still work (`/` still renders bilingually, still links to `/login` and `/register`). Nothing from Phase 1 was contradicted or dropped to build Phase 2.

### 11. Security

FAIL on the primary boundary. Live-confirmed: `POST /api/auth/register` with an email that already belongs to another seeded user (`owner@demo.local`) returns `200 OK` and logs the caller in as that user — `upsertUserFromIdentity` finds the existing row by email and overwrites its `clerkUserId`, `name`, and issues the caller a valid session cookie for that account. There is no password, no email verification, and no possession check anywhere in `login` or `register`; knowing (or guessing) any user's email is full account takeover, including the org owner. This is the phase's core trust boundary and it does not hold.

Secondary items: `SESSION_SECRET` falls back to a hardcoded `"rebuild-b-dev-secret"` in both `session.ts` and `middleware.ts` if the env var is unset — `.env.example` does say `change-me`, so this is a documented dev default, not a hidden one, but the fallback existing at all in code shipped toward later phases is worth tightening. The webhook returns `500` instead of `401`/`403` when no secret matches — functionally blocks the write, wrong status code. Org-scoped write authorization elsewhere in this phase (create-org assigns the creator as owner; accept-invite checks the invite's email against the session's email) is correct.

### 12. Code quality

Score: **5/10**. The schema, contract discipline (flat `/api/me`), and onboarding/invite flows are clean and match the plan closely, with real live evidence behind every claim in `STATUS.md`. The account-takeover bug is a severe, live-confirmed flaw in exactly the area this phase exists to build (identity), and it caps the score regardless of how clean the rest of the code is.

### 13. Findings

1. **Critical — no password/possession check anywhere in local auth.** `POST /api/auth/register` upserts by email and immediately issues a session; `POST /api/auth/login` only checks the email exists. Registering with someone else's seeded email overwrites their user row and hands the attacker a valid session for that account (verified live against `owner@demo.local`). Add a password (or magic-link/verification step) before any further phase builds on this identity layer, or gate `register`/`login` so an email match alone can never grant a session for an account the caller doesn't already control.
2. **Medium — `P4o.2` skips address → coordinates.** Inventory asks for an address-driven lookup; the build takes raw lat/lng/elevation numbers instead. Not flagged in DECISION-LOG. Either log it as an accepted simplification or add the lookup before Phase 3 needs real org locations.
3. **Low — duplicated org-defaults seeding.** `prisma/seed.ts` and `src/domain/identity.ts` each implement the same Style+Screen+34-ScheduleGroups creation. Should be one shared function.
4. **Low — webhook rejection returns 500 instead of 401.** Blocks the write correctly but the status code misrepresents an auth failure as a server error.
5. **Low — hardcoded dev fallback for `SESSION_SECRET`.** Matches `.env.example`'s documented default, but the literal fallback living in two source files (`session.ts`, `middleware.ts`) is worth centralizing and removing once Phase 2 stabilizes.
6. **Process — no `.scratch/phase-plan.md` in the tree.** Can't confirm the required pre-build expectation checklist was produced; `STATUS.md`'s post-hoc evidence is solid but isn't a substitute for the artifact the rule requires.

## Scores

- inventory_coverage: 8
- rule_adherence: 6
- plan_fidelity: 7
- context_retention: 9
- security: 3
- code_quality: 5
