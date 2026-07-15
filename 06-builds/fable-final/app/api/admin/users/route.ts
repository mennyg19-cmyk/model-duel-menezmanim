import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireSuperAdmin } from "@/auth/guards";
import { hashPassword } from "@/auth/passwords";
import { db } from "@/db/client";
import { orgMemberships, orgs, users } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E21 + F12 — list users with memberships. */
export async function GET() {
  try {
    await requireSuperAdmin();
    const allUsers = await db.select().from(users);
    const memberships = await db.select().from(orgMemberships);
    const allOrgs = await db.select({ id: orgs.id, slug: orgs.slug, name: orgs.name }).from(orgs);
    const orgById = new Map(allOrgs.map((o) => [o.id, o]));

    const out = allUsers
      .map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        isSuperAdmin: u.isSuperAdmin,
        createdAt: u.createdAt.toISOString(),
        memberships: memberships
          .filter((m) => m.userId === u.id)
          .map((m) => ({
            id: m.id,
            orgId: m.orgId,
            role: m.role,
            orgSlug: orgById.get(m.orgId)?.slug ?? null,
            orgName: orgById.get(m.orgId)?.name ?? null,
          })),
      }))
      .sort((a, b) => a.email.localeCompare(b.email));

    return NextResponse.json({ users: out, orgs: allOrgs });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

/**
 * F12 — real user actions (not stubs):
 * - setSuperAdmin: { userId, isSuperAdmin }
 * - setMembership: { userId, orgId, role } (upsert)
 * - removeMembership: { membershipId }
 * - resetPassword: { userId, password? } (default demo-pass)
 */
export async function PATCH(request: Request) {
  try {
    const actor = await requireSuperAdmin();
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      userId?: string;
      isSuperAdmin?: boolean;
      orgId?: string;
      role?: string;
      membershipId?: string;
      password?: string;
    } | null;

    if (!body?.action) return NextResponse.json({ error: "action required." }, { status: 400 });

    if (body.action === "setSuperAdmin") {
      if (!body.userId || typeof body.isSuperAdmin !== "boolean") {
        return NextResponse.json({ error: "userId + isSuperAdmin required." }, { status: 400 });
      }
      if (body.userId === actor.userId && body.isSuperAdmin === false) {
        return NextResponse.json({ error: "Cannot remove your own super-admin flag." }, { status: 400 });
      }
      await db.update(users).set({ isSuperAdmin: body.isSuperAdmin }).where(eq(users.id, body.userId));
      return NextResponse.json({ ok: true, userId: body.userId, isSuperAdmin: body.isSuperAdmin });
    }

    if (body.action === "setMembership") {
      if (!body.userId || !body.orgId || !body.role) {
        return NextResponse.json({ error: "userId, orgId, role required." }, { status: 400 });
      }
      if (!["owner", "admin", "editor", "viewer"].includes(body.role)) {
        return NextResponse.json({ error: "Invalid role." }, { status: 400 });
      }
      const existing = await db
        .select()
        .from(orgMemberships)
        .where(and(eq(orgMemberships.userId, body.userId), eq(orgMemberships.orgId, body.orgId)))
        .limit(1);
      if (existing[0]) {
        await db.update(orgMemberships).set({ role: body.role }).where(eq(orgMemberships.id, existing[0].id));
        return NextResponse.json({ ok: true, membershipId: existing[0].id, role: body.role });
      }
      const [row] = await db
        .insert(orgMemberships)
        .values({ userId: body.userId, orgId: body.orgId, role: body.role })
        .returning();
      return NextResponse.json({ ok: true, membership: row }, { status: 201 });
    }

    if (body.action === "removeMembership") {
      if (!body.membershipId) return NextResponse.json({ error: "membershipId required." }, { status: 400 });
      await db.delete(orgMemberships).where(eq(orgMemberships.id, body.membershipId));
      return NextResponse.json({ ok: true });
    }

    if (body.action === "resetPassword") {
      if (!body.userId) return NextResponse.json({ error: "userId required." }, { status: 400 });
      const password = body.password?.trim() || "demo-pass";
      await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, body.userId));
      return NextResponse.json({ ok: true, userId: body.userId, passwordReset: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
