import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";
import { AuthError, requireActor, requireOrgRole } from "./guards";
import type { Actor, Role } from "./model";

export async function loadOrgBySlug(slug: string) {
  const [org] = await db.select().from(orgs).where(eq(orgs.slug, slug)).limit(1);
  return org ?? null;
}

/** Resolve org by slug and require membership (super-admin always ok). */
export async function requireOrgBySlug(
  slug: string,
  min: Role = "viewer",
): Promise<{ actor: Actor; role: Role; org: NonNullable<Awaited<ReturnType<typeof loadOrgBySlug>>> }> {
  const actor = await requireActor();
  const org = await loadOrgBySlug(slug);
  if (!org) throw new AuthError(403, "Organization not found or you do not have access.");
  const { role } = await requireOrgRole(org.id, min);
  return { actor, role, org };
}
