import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import type { Role } from "@/auth/model";
import { db } from "@/db/client";
import { orgMemberships, users } from "@/db/schema";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["owner", "admin", "editor", "viewer"];

/** E16 — change role or remove membership (owner/admin). */
export async function PATCH(request: Request, { params }: { params: Promise<{ orgId: string; membershipId: string }> }) {
  try {
    const { orgId, membershipId } = await params;
    const { actor, role: actorRole } = await requireOrgRole(orgId, "admin");
    const body = (await request.json().catch(() => null)) as { role?: string } | null;
    if (!body?.role || !ROLES.includes(body.role as Role)) {
      return NextResponse.json({ error: "Valid role required." }, { status: 400 });
    }
    const nextRole = body.role as Role;
    if (nextRole === "owner" && actorRole !== "owner" && !actor.isSuperAdmin) {
      return NextResponse.json({ error: "Only an owner can assign the owner role." }, { status: 403 });
    }

    const [row] = await db
      .select()
      .from(orgMemberships)
      .where(and(eq(orgMemberships.id, membershipId), eq(orgMemberships.orgId, orgId)))
      .limit(1);
    if (!row) return NextResponse.json({ error: "Membership not found." }, { status: 404 });
    if (row.role === "owner" && nextRole !== "owner") {
      const owners = await db
        .select({ id: orgMemberships.id })
        .from(orgMemberships)
        .where(and(eq(orgMemberships.orgId, orgId), eq(orgMemberships.role, "owner")));
      if (owners.length <= 1) {
        return NextResponse.json({ error: "Cannot demote the last owner." }, { status: 400 });
      }
    }

    await db.update(orgMemberships).set({ role: nextRole }).where(eq(orgMemberships.id, membershipId));
    const [user] = await db.select().from(users).where(eq(users.id, row.userId)).limit(1);
    return NextResponse.json({
      member: {
        id: row.id,
        userId: row.userId,
        role: nextRole,
        email: user?.email ?? "",
        name: user?.name ?? null,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ orgId: string; membershipId: string }> }) {
  try {
    const { orgId, membershipId } = await params;
    const { actor } = await requireOrgRole(orgId, "admin");
    const [row] = await db
      .select()
      .from(orgMemberships)
      .where(and(eq(orgMemberships.id, membershipId), eq(orgMemberships.orgId, orgId)))
      .limit(1);
    if (!row) return NextResponse.json({ error: "Membership not found." }, { status: 404 });
    if (row.userId === actor.userId) {
      return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 });
    }
    if (row.role === "owner") {
      const owners = await db
        .select({ id: orgMemberships.id })
        .from(orgMemberships)
        .where(and(eq(orgMemberships.orgId, orgId), eq(orgMemberships.role, "owner")));
      if (owners.length <= 1) {
        return NextResponse.json({ error: "Cannot remove the last owner." }, { status: 400 });
      }
    }
    await db.delete(orgMemberships).where(eq(orgMemberships.id, membershipId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
