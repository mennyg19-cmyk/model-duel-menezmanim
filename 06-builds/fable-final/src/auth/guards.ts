import { getActor } from "./actor";
import type { Actor, Role } from "./model";

export class AuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const ROLE_RANK: Record<Role, number> = { viewer: 0, editor: 1, admin: 2, owner: 3 };

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) throw new AuthError(401, "You must be signed in.");
  return actor;
}

export async function requireSuperAdmin(): Promise<Actor> {
  const actor = await requireActor();
  if (!actor.isSuperAdmin) throw new AuthError(403, "This area is for super-admins only.");
  return actor;
}

function checkOrgRole(actor: Actor, match: (m: Actor["memberships"][number]) => boolean, min: Role): Role {
  if (actor.isSuperAdmin) return "owner";
  const membership = actor.memberships.find(match);
  if (!membership || ROLE_RANK[membership.role] < ROLE_RANK[min]) {
    throw new AuthError(403, `You need at least the "${min}" role on this organization.`);
  }
  return membership.role;
}

export async function requireOrgRole(orgId: string, min: Role): Promise<{ actor: Actor; role: Role }> {
  const actor = await requireActor();
  const role = checkOrgRole(actor, (m) => m.orgId === orgId, min);
  return { actor, role };
}
