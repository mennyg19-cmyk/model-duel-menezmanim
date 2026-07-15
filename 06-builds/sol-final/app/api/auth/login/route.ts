import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/db/client";
import { SESSION_COOKIE, signSession } from "../../../../src/auth/session";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string };
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: `No user found for ${email}. Register first or use a seeded account.` },
      { status: 404 },
    );
  }

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
