import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { acquireLock, getActiveLock, lockTtlMs, releaseLock } from "@/server/lock-repo";

export const dynamic = "force-dynamic";

/** E18 — edit lock acquire / status / release (D6, 5-min TTL). */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const { actor } = await requireOrgRole(orgId, "viewer");
    const lock = await getActiveLock(orgId);
    return NextResponse.json({
      lock: lock
        ? {
            userId: lock.userId,
            lockedAt: lock.lockedAt.toISOString(),
            expiresAt: lock.expiresAt.toISOString(),
            isMine: lock.userId === actor.userId,
          }
        : null,
      ttlMs: lockTtlMs(),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const { actor } = await requireOrgRole(orgId, "editor");
    const result = await acquireLock(orgId, actor.userId);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "Another editor holds the lock.",
          lock: {
            userId: result.lock.userId,
            expiresAt: result.lock.expiresAt.toISOString(),
          },
        },
        { status: 409 },
      );
    }
    return NextResponse.json({
      lock: {
        userId: result.lock.userId,
        expiresAt: result.lock.expiresAt.toISOString(),
        isMine: true,
      },
      ttlMs: lockTtlMs(),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const { actor } = await requireOrgRole(orgId, "editor");
    await releaseLock(orgId, actor.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
