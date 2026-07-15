import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { orgMemberships, orgs, users } from "@/db/schema";
import type { Actor, Role } from "./model";
import { SESSION_COOKIE, verifySession } from "./session";

export type { Actor, ActorMembership, Role } from "./model";

/** session = email/password cookie (experiment default). local = keyless super-admin. clerk = reserved when keys land. */
export type AuthMode = "session" | "local" | "clerk";

export function authMode(): AuthMode {
  const explicit = process.env.AUTH_MODE;
  if (explicit === "session" || explicit === "local" || explicit === "clerk") return explicit;
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return "clerk";
  return "session";
}

function authSecret(): string {
  return process.env.AUTH_SECRET?.trim() || "rebuild-a-dev-secret-change-me";
}

async function actorFromUserId(userId: string): Promise<Actor | null> {
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!row) return null;

  const membershipRows = await db
    .select({
      orgId: orgMemberships.orgId,
      role: orgMemberships.role,
      orgSlug: orgs.slug,
    })
    .from(orgMemberships)
    .innerJoin(orgs, eq(orgs.id, orgMemberships.orgId))
    .where(eq(orgMemberships.userId, row.id));

  return {
    userId: row.id,
    clerkUserId: row.clerkUserId,
    email: row.email,
    name: row.name,
    isSuperAdmin: row.isSuperAdmin,
    memberships: membershipRows.map((m) => ({
      orgId: m.orgId,
      orgSlug: m.orgSlug,
      role: m.role as Role,
    })),
  };
}

async function getLocalActor(): Promise<Actor | null> {
  if (process.env.VERCEL && process.env.AUTH_MODE !== "local") return null;
  const LOCAL_EMAIL = "local@menezmanim.local";
  let row = (await db.select().from(users).where(eq(users.email, LOCAL_EMAIL)).limit(1))[0];
  if (!row) {
    await db
      .insert(users)
      .values({
        clerkUserId: `local:${crypto.randomUUID()}`,
        email: LOCAL_EMAIL,
        name: "Local User",
        isSuperAdmin: true,
      })
      .onConflictDoNothing({ target: users.email });
    row = (await db.select().from(users).where(eq(users.email, LOCAL_EMAIL)).limit(1))[0];
  }
  if (!row) return null;
  const allOrgs = await db.select({ id: orgs.id, slug: orgs.slug }).from(orgs);
  return {
    userId: row.id,
    clerkUserId: row.clerkUserId,
    email: row.email,
    name: row.name,
    isSuperAdmin: true,
    memberships: allOrgs.map((org) => ({ orgId: org.id, orgSlug: org.slug, role: "owner" as const })),
  };
}

export async function getActor(): Promise<Actor | null> {
  switch (authMode()) {
    case "local":
      return getLocalActor();
    case "clerk":
      // Clerk provider lands when keys are wired; until then fail closed.
      return null;
    case "session":
    default: {
      const jar = await cookies();
      const token = jar.get(SESSION_COOKIE)?.value;
      const payload = verifySession(token, authSecret());
      if (!payload) return null;
      return actorFromUserId(payload.userId);
    }
  }
}

export { authSecret };
