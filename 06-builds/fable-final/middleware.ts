import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public routes always get a real next() response (old bug: middleware 404'd publics).
 * Session mode does not block here — route handlers call requireActor. Clerk mode
 * will add protect() when keys are wired.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
