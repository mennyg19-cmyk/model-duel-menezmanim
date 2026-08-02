import { checkoutRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/client-ip";

// Public endpoint guard (R-122): state-changing routes reachable without a
// staff session get same-origin + IP rate limit here; Zod stays at each
// route's own boundary. Webhooks are exempt — Stripe posts cross-origin by
// design and is authenticated by signature instead.
//
// Allowed origin is derived from the request URL (this deployment), not a
// separate APP_URL env — avoids a second source of truth that drifts.

/** Same-origin check via Origin (fall back to Referer).
 * Missing both headers passes: browsers always send Origin on cross-origin
 * fetches, so absence means curl / same-site form / non-browser caller.
 * Cross-site CSRF is still blocked when Origin/Referer is present and wrong. */
export function isSameOrigin(request: Request): boolean {
  const allowed = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).origin === allowed;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === allowed;
    } catch {
      return false;
    }
  }
  return true;
}

/** Returns a Response when blocked, null when the request may proceed. */
export function assertSameOrigin(request: Request): Response | null {
  if (isSameOrigin(request)) return null;
  return Response.json({ error: "Cross-origin requests are not allowed" }, { status: 403 });
}

/** Checkout/pay mutations: same-origin + checkout IP rate limit. */
export function guardPublicCheckoutMutation(request: Request): Response | null {
  const originBlock = assertSameOrigin(request);
  if (originBlock) return originBlock;
  const ip = clientIp(request.headers) ?? "unknown";
  if (!checkoutRateLimit(ip)) {
    return Response.json({ error: "Too many requests — try again in a minute" }, { status: 429 });
  }
  return null;
}

/** Generic public mutation guard with a caller-chosen rate bucket. */
export function guardPublicEndpoint(
  request: Request,
  allowed: (ip: string) => boolean,
): Response | null {
  const originBlock = assertSameOrigin(request);
  if (originBlock) return originBlock;
  const ip = clientIp(request.headers) ?? "unknown";
  if (!allowed(ip)) {
    return Response.json({ error: "Too many requests — try again in a minute" }, { status: 429 });
  }
  return null;
}
