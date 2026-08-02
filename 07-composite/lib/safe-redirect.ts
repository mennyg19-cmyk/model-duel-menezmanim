// Validates a caller-supplied `next` redirect target for the login/register
// flows. Unlike dev-login (unreachable outside APP_ENV=test, see
// lib/dev-auth.ts), these routes are live in production, so `next` must be
// an allowlisted same-app path, not merely "doesn't start with /admin"
// (residual MIN-3 in the dev-only form took that shortcut deliberately).
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("://")) return fallback;
  return next;
}
