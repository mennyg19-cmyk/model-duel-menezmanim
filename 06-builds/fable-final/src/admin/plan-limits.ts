/** Plan usage caps for dashboard indicator (P3.4). Reversible if plans.ts lands later. */
export const PLAN_LIMITS: Record<string, { screens: number; styles: number; members: number; label: string }> = {
  free: { screens: 1, styles: 2, members: 3, label: "Free" },
  basic: { screens: 3, styles: 5, members: 10, label: "Basic" },
  pro: { screens: 20, styles: 50, members: 50, label: "Pro" },
  enterprise: { screens: 999, styles: 999, members: 999, label: "Enterprise" },
};

export function planLimits(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
