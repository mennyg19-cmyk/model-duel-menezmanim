import { NextRequest, NextResponse } from "next/server";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import { acquireLock, getActiveLock, lockTtlMs, releaseLock } from "../../../../../src/server/lock-repo";

type Ctx = { params: Promise<{ orgId: string }> };

/** E18 — edit lock acquire / status / release (D6, 5-min TTL). */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const lock = await getActiveLock(access.orgId);
  return NextResponse.json({
    lock: lock
      ? {
          userId: lock.userId,
          lockedAt: lock.lockedAt.toISOString(),
          expiresAt: lock.expiresAt.toISOString(),
          isMine: lock.userId === access.userId,
        }
      : null,
    ttlMs: lockTtlMs(),
  });
}

export async function POST(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const result = await acquireLock(access.orgId, access.userId);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: "Another editor holds the lock.",
        lock: { userId: result.lock.userId, expiresAt: result.lock.expiresAt.toISOString() },
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
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  await releaseLock(access.orgId, access.userId);
  return NextResponse.json({ ok: true });
}
