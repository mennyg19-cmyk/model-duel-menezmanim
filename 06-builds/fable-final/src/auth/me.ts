import type { Actor, ActorMembership } from "./model";

/** Flat /api/me shape — isSuperAdmin MUST be top-level (F-ME-SHAPE). */
export interface MeResponse {
  authenticated: true;
  userId: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  memberships: ActorMembership[];
}

export function meResponse(actor: Actor): MeResponse {
  return {
    authenticated: true,
    userId: actor.userId,
    email: actor.email,
    name: actor.name,
    isSuperAdmin: actor.isSuperAdmin,
    memberships: actor.memberships,
  };
}
