// Margin engine (UR-003, G-006). Quote every eligible ground-comparable
// carrier, charge the customer the HIGHEST carrier's best price, buy the
// label on the CHEAPER carrier, keep the spread. Pure functions — unit
// tested in scripts/test-p8.mts.

export const GROUND_SERVICE_TOKENS: Record<string, string[]> = {
  fedex: ["fedex_ground", "ground_home_delivery"],
  ups: ["ups_ground", "ground"],
  usps: ["usps_ground_advantage", "usps_priority", "priority"],
};

export type RateOption = {
  rateId: string;
  amountCents: number;
  currency: string;
  carrier: string;
  serviceToken: string;
  serviceName: string;
  estimatedDays: number | null;
};

export type MarginResolution = {
  charge: RateOption;
  buy: RateOption;
  marginCents: number;
  eligible: RateOption[];
};

type RawRate = {
  object_id: string;
  amount: string;
  currency?: string;
  provider: string;
  servicelevel?: { token?: string; name?: string } | null;
  estimated_days?: number | null;
};

export function normalizeRates(raw: RawRate[]): RateOption[] {
  const options: RateOption[] = [];
  for (const rate of raw) {
    const amount = Number(rate.amount);
    if (!Number.isFinite(amount)) continue;
    options.push({
      rateId: rate.object_id,
      amountCents: Math.round(amount * 100),
      currency: rate.currency ?? "USD",
      carrier: rate.provider.trim().toLowerCase(),
      serviceToken: (rate.servicelevel?.token ?? "").trim().toLowerCase(),
      serviceName: rate.servicelevel?.name ?? "",
      estimatedDays: rate.estimated_days ?? null,
    });
  }
  return options;
}

function tokensForCarrier(
  carrier: string,
  override?: Record<string, string[]> | null,
): string[] {
  const key = carrier.toLowerCase();
  if (override) {
    const match = Object.entries(override).find(([name]) => name.toLowerCase() === key);
    return (match?.[1] ?? []).map((token) => token.toLowerCase());
  }
  const defaults = Object.entries(GROUND_SERVICE_TOKENS).find(([name]) => name === key);
  return (defaults?.[1] ?? []).map((token) => token.toLowerCase());
}

/** Ground-comparable rates only; cheapest quote per carrier; USPS opt-in. */
export function eligibleRates(
  rates: RateOption[],
  includeUsps: boolean,
  groundTokens?: Record<string, string[]> | null,
): RateOption[] {
  const bestByCarrier = new Map<string, RateOption>();
  for (const rate of rates) {
    if (rate.carrier === "usps" && !includeUsps) continue;
    const allowed = tokensForCarrier(rate.carrier, groundTokens ?? null);
    if (allowed.length === 0) continue;
    if (!allowed.includes(rate.serviceToken)) continue;
    const current = bestByCarrier.get(rate.carrier);
    if (!current || rate.amountCents < current.amountCents) {
      bestByCarrier.set(rate.carrier, rate);
    }
  }
  return [...bestByCarrier.values()].sort((a, b) => a.amountCents - b.amountCents);
}

export function resolveMargin(
  rates: RateOption[],
  includeUsps: boolean,
  groundTokens?: Record<string, string[]> | null,
): MarginResolution | null {
  const eligible = eligibleRates(rates, includeUsps, groundTokens);
  if (eligible.length === 0) return null;
  const buy = eligible[0];
  const charge = eligible[eligible.length - 1];
  return {
    charge,
    buy,
    marginCents: charge.amountCents - buy.amountCents,
    eligible,
  };
}
