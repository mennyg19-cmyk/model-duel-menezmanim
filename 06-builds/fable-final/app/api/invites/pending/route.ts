import { NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { AuthError, requireActor } from "@/auth/guards";
import { db } from "@/db/client";
import { orgInvites, orgs } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E7 — pending invites for the signed-in user's email (P4o.5). */
export async function GET() {
  let actor;
  try {
    actor = await requireActor();
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }

  const rows = await db
    .select({
      id: orgInvites.id,
      token: orgInvites.token,
      role: orgInvites.role,
      expiresAt: orgInvites.expiresAt,
      orgName: orgs.name,
      orgSlug: orgs.slug,
    })
    .from(orgInvites)
    .innerJoin(orgs, eq(orgs.id, orgInvites.orgId))
    .where(
      and(
        eq(orgInvites.email, actor.email),
        isNull(orgInvites.usedAt),
        gt(orgInvites.expiresAt, new Date()),
      ),
    );

  return NextResponse.json({
    invites: rows.map((r) => ({
      id: r.id,
      token: r.token,
      role: r.role,
      expiresAt: r.expiresAt.toISOString(),
      orgName: r.orgName,
      orgSlug: r.orgSlug,
    })),
  });
}
