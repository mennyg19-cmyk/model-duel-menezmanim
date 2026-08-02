import { NextRequest, NextResponse } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/session-codec";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Edge-safe same-origin check (reads raw APP_URL — no zod env import).
function isAdminSameOrigin(request: NextRequest): boolean {
  // Prefer APP_URL when set (canonical public origin); else this request's host.
  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;
  let allowed: string;
  try {
    allowed = new URL(appUrl).origin;
  } catch {
    return false;
  }
  const origin = request.headers.get("origin");
  if (origin) return origin === allowed;
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === allowed;
  } catch {
    return false;
  }
}

// Presence + signature check only on page routes. Role/permission gates run
// in the admin layout and API handlers where a DB read is available.
// Admin API mutations get same-origin defense-in-depth here (MAJ-1).
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin") && MUTATING.has(request.method)) {
    if (!isAdminSameOrigin(request)) {
      return NextResponse.json(
        { error: "Cross-origin requests are not allowed" },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  const session = raw && secret ? await decodeSession(raw, secret) : null;
  if (!session) {
    // Dev-login only exists while the bypass is on (same shared predicate
    // lib/env exposes — off any Vercel deploy, and only under APP_ENV=test);
    // otherwise unauthenticated visitors land on the real staff sign-in
    // page (/login), matching requireStaff's redirect.
    const bypassOn = isDevAuthBypassEnabled();
    const loginUrl = new URL(bypassOn ? "/dev-login" : "/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/driver/:path*", "/api/admin/:path*"],
};
