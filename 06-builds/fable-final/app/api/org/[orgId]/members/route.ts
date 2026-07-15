import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import { orgMemberships, users } from "@/db/schema";

export const dynamic = "force-dynamic";

function ser(row: {
  id: string;
  role: string;
  userId: string;
  email: string;
  name: string | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    userId: row.userId,
    role: row.role,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
  };
}

/** E16 — list members (owner/admin for management; viewers can see names). */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const rows = await db
      .select({
        id: orgMemberships.id,
        role: orgMemberships.role,
        userId: orgMemberships.userId,
        createdAt: orgMemberships.createdAt,
        email: users.email,
        name: users.name,
      })
      .from(orgMemberships)
      .innerJoin(users, eq(users.id, orgMemberships.userId))
      .where(eq(orgMemberships.orgId, orgId));
    rows.sort((a, b) => a.email.localeCompare(b.email));
    return NextResponse.json({ members: rows.map(ser) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
