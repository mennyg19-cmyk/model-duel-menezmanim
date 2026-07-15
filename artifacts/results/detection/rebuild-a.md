# Detection review — rebuild-a
Model: claude-fable-5-thinking-high | Runner: spawn

## Proof-of-read
- `STATUS.md`: Phase 12 complete (desktop/LAN/self-host). Claims durable sync, "scoped screen credentials", four conflict strategies, Docker isolation. Note: this is labeled rebuild-a but `package.json`, `.env`, and default secrets all say `rebuild-b` — this tree is a clone of arm B.
- Inspected auth surface (`middleware.ts`, `src/auth/session.ts`, `src/domain/org-access.ts`, `src/domain/super-admin.ts`, `src/server/sync-auth.ts`), every `app/api/**` route (auth, org CRUD, admin/super, sync pull/push, invites, webhooks, display, mobile), `prisma/schema.prisma`, `prisma/seed.ts`, `RichText.tsx`, `src/server/board-repo.ts`, `.env`/`.env.example`.
- App not run: no `node_modules` and no `prisma/dev.db` present (fresh clone). Findings are from source; each cites concrete file/line evidence and is reproducible after `npm i && npm run db:setup`.

## Findings

1. **CRITICAL — Passwordless login = full account takeover (incl. super-admin)**
   `app/api/auth/login/route.ts:5-37`
   POST accepts only `{ email }`, looks the user up, and immediately sets a valid session cookie — no password, no OTP, no proof of ownership. `middleware.ts:10` lists `/api/auth` as public, so the endpoint is unauthenticated. Seed creates super-admin `admin@menezmanim.local` (`prisma/seed.ts:569-571`). Anyone can `POST /api/auth/login {"email":"admin@menezmanim.local"}` and receive a super-admin session. The route never checks `authMode`, so this bypass stays live even in Clerk deployments.
   Why it matters: complete authentication bypass and privilege takeover of every account with only a known/guessable email.

2. **CRITICAL — Public registration grants super-admin by email match**
   `app/api/auth/register/route.ts:5-32` → `src/domain/identity.ts:56-88`
   Register is public and takes only `{ email, name }`. `upsertUserFromIdentity` sets `isSuperAdmin: isSuperAdminEmail(email)` on create/update. Registering with any address in `SUPER_ADMIN_EMAILS` (default `admin@menezmanim.local`) mints a super-admin, and if that user already exists the email branch (`identity.ts:63-72`) rebinds `clerkUserId` and returns that account — takeover either way.
   Why it matters: self-service super-admin from an unauthenticated endpoint.

3. **HIGH — Editor can self-promote to owner (broken RBAC on role change)**
   `app/api/org/[orgId]/members/route.ts:37-40`
   `PATCH` (role change) guards with `requireOrgMember(orgId, { write: true })`, but `WRITE_ROLES` includes `editor` (`src/domain/org-access.ts:5`). `GET`/`DELETE` on the same resource correctly use `{ admin: true }`. An editor can `PATCH {membershipId:<self>, role:"owner"}` and escalate to owner. The "last owner" guard (`:55-60`) only blocks demotion, not promotion.
   Why it matters: vertical privilege escalation inside any org by its lowest write role.

4. **HIGH — Hardcoded fallback secrets forge sessions/screen tokens**
   `src/auth/session.ts:15-17` and `middleware.ts:34` (`"rebuild-b-dev-secret"`), `src/server/sync-auth.ts:21-23` (`"rebuild-b-sync-dev-secret"`).
   If `SESSION_SECRET`/`SYNC_DEVICE_SECRET` are unset, signing falls back to a constant baked into source. `signSession` payload is just `{userId,issuedAt}` with no server-side session store, so anyone who knows the fallback can forge a cookie for any `userId` (or any screen credential) — no email needed. `.env.example` ships `SESSION_SECRET="change-me"`, inviting the misconfiguration.
   Why it matters: silent auth bypass whenever the secret env var is missing or left at the shipped placeholder.

5. **MEDIUM — Regex HTML sanitizer is bypassable → stored XSS on public displays**
   `src/widgets/text/RichText.tsx:31-57`
   `sanitizeHtml` is regex-based and rendered via `dangerouslySetInnerHTML` on public `/show` and `/mobile`. Bypasses: attribute handlers without a leading space (`<svg/onload=alert(1)>` — the `\son\w+` patterns require whitespace), tags it never strips (`<iframe srcdoc="<script>...">`, `<object>`, `<embed>`, `<form>`), and non-recursive stripping (`<scr<script></script>ipt>` collapses to `<script>`). Rich-text content is writable by any editor and by the sync push path.
   Why it matters: persistent XSS executing on lobby TVs and every congregant's mobile view.

6. **MEDIUM — "Scoped screen credentials" are unreachable (dead auth path)**
   `src/server/sync-auth.ts:25-40`, `createScreenCredential`
   The screen-actor branch in `authorizeSyncRequest` (`:71-93`) verifies a Bearer credential, but `createScreenCredential` is never called anywhere in the tree (only its own definition matches). No endpoint mints a credential, so no screen can ever authenticate to `/api/sync/*`. This directly contradicts STATUS.md's "scoped screen credentials" and Phase-11 "scoped screen credentials" claims.
   Why it matters: a claimed, security-relevant feature is non-functional; screen sync silently falls back to requiring a full user session.

7. **MEDIUM — Dev webhook bypass can provision users/super-admins in prod**
   `app/api/webhooks/clerk/route.ts:20-46`
   When `CLERK_WEBHOOK_SECRET` is unset, the route accepts unsigned JSON if header `x-dev-webhook-secret` matches `DEV_WEBHOOK_SECRET`, then upserts a user from attacker-controlled `email`/`id`. `.env` here ships `DEV_WEBHOOK_SECRET="rebuild-b-dev-webhook"`. If that env leaks/ships, an attacker can create or rebind accounts (and hit `isSuperAdminEmail`) with a single unsigned POST.
   Why it matters: a debug-only identity injection path guarded by a shipped constant.

8. **LOW — Non-constant-time session signature compare**
   `src/auth/session.ts:25-31`
   `timingSafeEqual` is imported but the comparison uses `signature !== expected` after a length check; `middleware.ts:44` likewise uses `!==` on base64url strings. `sync-auth.ts:48` does it correctly with `timingSafeEqual`. Minor timing side-channel on the session HMAC.

9. **LOW/INFO — Real secrets committed in `.env`**
   `.env:2,9` contain `SESSION_SECRET` and `DEV_WEBHOOK_SECRET` values in-tree. For an experiment clone this is low impact, but these are live signing keys for findings 1/4/7.

## Summary counts
- Critical: 2
- High: 2
- Medium: 3
- Low: 2
- Total: 9
