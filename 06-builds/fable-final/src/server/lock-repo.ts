import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { editLocks } from "@/db/schema";

const LOCK_TTL_MS = 5 * 60 * 1000;

export function lockTtlMs() {
  return LOCK_TTL_MS;
}

export async function getActiveLock(orgId: string) {
  await db.delete(editLocks).where(lte(editLocks.expiresAt, new Date()));
  const [row] = await db.select().from(editLocks).where(eq(editLocks.orgId, orgId)).limit(1);
  return row ?? null;
}

/** Acquire or refresh lock for this user. Returns ok:false if held by someone else. */
export async function acquireLock(orgId: string, userId: string) {
  const existing = await getActiveLock(orgId);
  const expiresAt = new Date(Date.now() + LOCK_TTL_MS);
  if (existing && existing.userId !== userId) return { ok: false as const, lock: existing };
  if (existing) {
    await db.update(editLocks).set({ expiresAt }).where(eq(editLocks.id, existing.id));
    return { ok: true as const, lock: { ...existing, expiresAt } };
  }
  const [lock] = await db.insert(editLocks).values({ orgId, userId, expiresAt }).returning();
  return { ok: true as const, lock: lock! };
}

export async function releaseLock(orgId: string, userId: string) {
  await db.delete(editLocks).where(and(eq(editLocks.orgId, orgId), eq(editLocks.userId, userId)));
}
