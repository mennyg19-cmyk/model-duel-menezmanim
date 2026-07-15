import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import type { Role } from "@/auth/model";
import { db } from "@/db/client";
import { orgInvites } from "@/db/schema";

export const dynamic = "force-dynamic";

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const ROLES: Role[] = ["admin", "editor", "viewer"];

function ser(row: typeof orgInvites.$inferSelect) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    token: row.token,
    expiresAt: row.expiresAt.toISOString(),
    usedAt: row.usedAt ? row.usedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    invitePath: `/invite/${row.token}`,
  };
}

/** E17 — list pending invites / create invite. */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "admin");
    const rows = await db
      .select()
      .from(orgInvites)
      .where(and(eq(orgInvites.orgId, orgId), isNull(orgInvites.usedAt)));
    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return NextResponse.json({ invites: rows.map(ser) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "admin");
    const body = (await request.json().catch(() => null)) as { email?: string; role?: string } | null;
    const email = body?.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    const role = (body?.role as Role) || "editor";
    if (!ROLES.includes(role)) return NextResponse.json({ error: "Role must be admin, editor, or viewer." }, { status: 400 });

    const [row] = await db
      .insert(orgInvites)
      .values({
        orgId,
        email,
        role,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      })
      .returning();
    return NextResponse.json({ invite: row ? ser(row) : null }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "admin");
    const url = new URL(request.url);
    const inviteId = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    if (!inviteId) return NextResponse.json({ error: "id query required." }, { status: 400 });

    const [row] = await db
      .select()
      .from(orgInvites)
      .where(and(eq(orgInvites.id, inviteId), eq(orgInvites.orgId, orgId)))
      .limit(1);
    if (!row) return NextResponse.json({ error: "Invite not found." }, { status: 404 });

    if (action === "resend") {
      const [updated] = await db
        .update(orgInvites)
        .set({
          token: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + INVITE_TTL_MS),
          usedAt: null,
        })
        .where(eq(orgInvites.id, inviteId))
        .returning();
      return NextResponse.json({ invite: updated ? ser(updated) : null });
    }

    await db.delete(orgInvites).where(eq(orgInvites.id, inviteId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
