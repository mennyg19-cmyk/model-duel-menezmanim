import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, signSession, slugify } from "../../../../src/auth/session";
import { upsertUserFromIdentity } from "../../../../src/domain/identity";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; name?: string };
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const name = String(body.name ?? "").trim() || email.split("@")[0] || "User";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const clerkUserId = `local_${slugify(email) || "user"}`;
  const user = await upsertUserFromIdentity({ clerkUserId, email, name });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    },
  });
  response.cookies.set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
