import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "../../../../src/auth/session";
import { acceptInviteToken } from "../../../../src/domain/identity";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  return NextResponse.json({
    token,
    acceptPath: `/api/invites/${token}`,
    onboardingPath: `/onboarding?invite=${token}`,
  });
}

export async function POST(_request: NextRequest, ctx: Ctx) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token } = await ctx.params;
    const result = await acceptInviteToken(token, session.clerkUserId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
