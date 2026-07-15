Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 2 | Reaudit: true

# Phase review — rebuild-b Phase 2 (Identity, tenancy, onboarding)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 2
- Diff / files touched this phase: `b-p02.patch` is empty (points at snapshot tree `86fa14e`); reviewed the full snapshot tree under `audit/snapshots/b/p02` — `middleware.ts`, `app/{login,register,onboarding,admin}/**`, `app/api/{auth,me,onboarding,invites,webhooks}/**`, `prisma/{schema.prisma,seed.ts}`, `src/{auth/session.ts,domain/identity.ts,content/default-groups.ts,db/client.ts}`.

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, glm-5.2-high for all reviews, labels are rebuild-a/b only, never guess the contestant. Phase review uses the rubric; running-app verification optional, N/A OK for static snapshots.
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist (meta, proof-of-read, inventory coverage, running app, no stubs, ponytail, clean-code, workflow, codegraph, git-discipline, plan fidelity, context retention, security, code quality, findings) plus six 1–10 scores.
- `FEATURE-INVENTORY.md`: canonical truth — 10 routes, 17 Prisma models, 12 core caps, 17 widgets, 22 API groups. Phase 2 IDs are R2–R4, P2/P4o family, D1/D3–D5, E1/E2/E6/E7, F-ME-SHAPE, F-DB-DRIFT. Notes middleware must return a response on public routes, `/api/me` must be flat with top-level `isSuperAdmin`, new orgs pending, onboarding seeds defaults.
- `snapshots/b/p02/PHASE-PLAN.md`: Phase 2 is identity/tenancy/onboarding only; later phases untouched; done = runnable auth + onboarding with seeded data and live evidence.
- `snapshots/b/p02/STATUS.md`: claims Phase 2 complete; lists seeded logins, invite token, verification evidence (typecheck, build, HTTP 200s, 401 unauth, flat `/api/me`, pending create-org, invite accept, webhook upsert), server stopped, DB reseeded.
- `snapshots/b/p02/DECISION-LOG.md`: logs local session auth default (no Clerk keys), flat `/api/me` contract, full D1–D17 schema now (F-DB-DRIFT), new orgs start pending, 35 default groups seeded, FIDS finish in Phase 6, desktop modes in Phase 12.
- `diffs/b-p02.patch`: contains only "PHASE 1 - no previous phase; see snapshot tree at 86fa14e" — no line diff supplied; review is whole-tree static.

## Checklist

1. **Inventory coverage**
   - R2 `/login` catch-all (`app/login/[[...login]]/page.tsx`) PRESENT.
   - R3 `/register` catch-all (`app/register/[[...register]]/page.tsx`) PRESENT.
   - R4 `/onboarding` (`app/onboarding/page.tsx`) PRESENT.
   - P2.1 sign-in PRESENT; P2.2 sign-up PRESENT; P2.3 OAuth — `/login/sso-callback` and `/register/sso-callback` routes exist as static placeholders; Clerk cloud inactive by logged decision (no keys). PARTIAL (documented).
   - P4o.1 create org: name + auto-suggested editable slug + live uniqueness check (`GET /api/onboarding?slug=`) PRESENT.
   - P4o.2 location: form takes raw lat/lng/elevation/timezone + inIsrael. Inventory spec is "address → lat/lng/elevation/timezone"; there is no address→geocode step. PARTIAL.
   - P4o.3 minhag/dialect + candle-lighting + shabbat-end PRESENT.
   - P4o.4 Create → `POST /api/onboarding` action `create-org`, seeds default style + main screen + 35 groups PRESENT.
   - P4o.5 accept invite tokens + show pending invitations PRESENT (`/api/invites/[token]`, `/api/invites/pending`, onboarding UI list + `?invite=` auto-accept).
   - P4o.6 new org `status = "pending"`, user-visible pending screen PRESENT.
   - D1 Organization, D3 User, D4 OrgMembership, D5 OrgInvite PRESENT in schema and exercised.
   - E1 `/api/me` flat with top-level `isSuperAdmin` PRESENT.
   - E2 `/api/onboarding` PRESENT (GET slug check + POST create-org/accept-invite).
   - E6 `/api/webhooks/clerk` PRESENT (Svix verify when `CLERK_WEBHOOK_SECRET`, else `DEV_WEBHOOK_SECRET` header gate).
   - E7 `/api/invites/[token]` + `/api/invites/pending` PRESENT.
   - F-ME-SHAPE: flat contract locked in `MeResponse` type and route; PRESENT.
   - F-DB-DRIFT: full 17-model Prisma schema committed as single source, pushed to SQLite, seeded; PRESENT (D2/D6–D17 carried forward unused this phase but schema-complete).
   - Middleware returns `NextResponse.next()` for public paths (inventory middleware-bug fix) PRESENT.

2. **Running app** — N/A. Static snapshot, no `node_modules`/DB. Relied on `STATUS.md` evidence: typecheck pass, build pass, HTTP 200 on `/login|/register|/sso-callback`, 401 on `/api/me` unauth, owner login → flat me → `/admin`, newcomer create-org → pending, invitee accept `seed-invite-token` → editor, webhook upsert. Evidence is credible and matches the code paths.

3. **No stubs** — No dead buttons or "coming soon" marked done. SSO callback pages are explicit static placeholders stating Clerk is unconfigured (logged decision), not fake completions. Admin page is minimal but honestly labels later-phase sections.

4. **Rule: ponytail** — Local signed-cookie session via Node `crypto` HMAC + Web Crypto in middleware; no new auth package (svix already needed for E6). Full schema committed now is justified by F-DB-DRIFT and logged. `default-groups.ts` is the 35-row seed source, reused by both `seed.ts` and `identity.ts`. No speculative abstractions. One duplication noted in findings.

5. **Rule: clean-code** — `session.ts` (auth/cookie), `identity.ts` (domain queries/mutations), `default-groups.ts` (seed content) split by concern. Names are intent-bearing (`acceptInviteToken`, `createOrganizationForOwner`, `slugAvailable`). Errors carry expected-state messages. One pattern per concern for auth and data access. No god files (largest is `onboarding/page.tsx` ~376 lines, cohesive single-screen form). Minor: `seedOrgDefaults` in `seed.ts` duplicates `seedOrganizationDefaults` in `identity.ts`.

6. **Rule: workflow** — PHASE-PLAN and STATUS carry proof-of-read + observable done-when + running-app evidence. Business judgment (local auth, flat me, full schema, pending default) recorded in DECISION-LOG, not hidden. No speculative product inventing; the location geocode gap is an under-build, not an invention.

7. **Rule: codegraph** — Snapshot ships `.codegraph/`. Structural surface is tiny this phase; no evidence of forbidden symbol-grep. N/A to score.

8. **Rule: git-discipline** — Contestant must not git. No git operations in snapshot/STATUS. Compliant.

9. **Todos / PHASE-PLAN fidelity** — Plan's done-when: new user signs up, creates/joins org, sees pending approval, reaches authenticated area with server-derived membership. STATUS evidence maps one-to-one: register → onboarding, create-org → pending, accept-invite → editor membership, `/admin` gated on active membership derived server-side from session user id. Fidelity high.

10. **Context retention** — Phase 1 landing retained (`app/page.tsx`, `app/globals.css`, `src/content/landing.ts`). Full schema preserves all 17 models so later phases inherit one shape. No prior work dropped. No contradictions with earlier decisions.

11. **Security** — Session token HMAC-signed with `SESSION_SECRET` (default `"rebuild-b-dev-secret"` when unset; `.env.example` flags `change-me`). `session.ts` uses `timingSafeEqual`; middleware compare is plain `!==` (non-constant-time) — minor. Login endpoint accepts email only, no password — any seeded email logs in; acceptable as the logged Clerk stand-in for this experiment arm but is a real trust-boundary shortcut. Webhook uses Svix verify in prod, dev-secret header gate otherwise. `acceptInviteToken` checks used/expired/email-match before upserting membership. Org ownership is server-derived from `session.id` (never client-supplied). Slug normalized. No secrets committed.

12. **Code quality** — 8/10. Clean typed TS, clear separation, honest error messages, seeded data exercises the real flow. Deductions for the seed/identity default-seed duplication, middleware non-constant-time compare, and the manual-entry location form.

13. **Findings**
   1. P4o.2 location is manual lat/lng/elevation/timezone entry; inventory spec calls for address→geocode. PARTIAL, not a stub.
   2. Local login has no password/credential verification — email-only login. Justified by the no-Clerk-keys decision and logged, but is a trust-boundary shortcut worth a flag.
   3. `seedOrgDefaults` (`prisma/seed.ts`) duplicates `seedOrganizationDefaults` (`src/domain/identity.ts`) — same style/screen/group creation logic in two places.
   4. Middleware session-signature compare uses non-constant-time `!==` while `session.ts` uses `timingSafeEqual`; one auth-verify pattern should be shared.
   5. SSO callback pages are static placeholders (documented; Clerk inactive) — fine for the phase, must be wired when keys exist.

## Scores
- inventory_coverage: 8
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 7
- code_quality: 8
