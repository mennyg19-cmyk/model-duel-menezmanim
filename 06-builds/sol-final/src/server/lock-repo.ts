import { prisma } from "../db/client";

const LOCK_TTL_MS = 5 * 60 * 1000;

export function lockTtlMs() {
  return LOCK_TTL_MS;
}

export async function getActiveLock(orgId: string) {
  await prisma.editLock.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  return prisma.editLock.findUnique({ where: { orgId } });
}

/** Acquire or refresh lock for this user. Returns ok:false if held by someone else. */
export async function acquireLock(orgId: string, userId: string) {
  const existing = await getActiveLock(orgId);
  const expiresAt = new Date(Date.now() + LOCK_TTL_MS);
  if (existing && existing.userId !== userId) return { ok: false as const, lock: existing };
  if (existing) {
    const lock = await prisma.editLock.update({
      where: { id: existing.id },
      data: { expiresAt },
    });
    return { ok: true as const, lock };
  }
  const lock = await prisma.editLock.create({
    data: { orgId, userId, expiresAt },
  });
  return { ok: true as const, lock };
}

export async function releaseLock(orgId: string, userId: string) {
  await prisma.editLock.deleteMany({ where: { orgId, userId } });
}
