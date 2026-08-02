import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

// Geocode provider seam (R-162/R-179), same honesty class as the route
// optimizer's Mapbox seam (lib/routes/optimize.ts): with MAPBOX_ACCESS_TOKEN
// set, a real Mapbox Geocoding v5 lookup runs; without it — or on ANY
// provider failure — the dev provider derives a STABLE lat/lng from the
// normalized address key (same address always geocodes the same) inside the
// Lakewood NJ service area, so route ordering and reroute rules behave like
// real coordinates in dev/test regardless of which path answered.
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function deriveGeoPoint(addressKey: string): { lat: number; lng: number } {
  const hash = createHash("sha256").update(addressKey).digest();
  const latSeed = hash.readUInt32BE(0) / 0xffffffff;
  const lngSeed = hash.readUInt32BE(4) / 0xffffffff;
  return {
    lat: 39.95 + latSeed * 0.25, // 39.95..40.20
    lng: -74.35 + lngSeed * 0.25, // -74.35..-74.10
  };
}

// addressKey is the pipe-joined addressDedupeKey (lib/customers/addresses.ts):
// line1|line2|city|region|postalCode|country, already lowercased/normalized.
function addressKeyToQuery(addressKey: string): string {
  const [line1, line2, city, region, postalCode, country] = addressKey.split("|");
  return [line1, line2, city, region, postalCode, country].filter(Boolean).join(", ");
}

async function mapboxCoordinates(addressKey: string): Promise<{ lat: number; lng: number } | null> {
  if (!env.MAPBOX_ACCESS_TOKEN) return null;
  const query = encodeURIComponent(addressKeyToQuery(addressKey));
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?limit=1&access_token=${env.MAPBOX_ACCESS_TOKEN}`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!response.ok) return null;
    const body = (await response.json()) as { features?: { center?: [number, number] }[] };
    const center = body.features?.[0]?.center;
    if (!center) return null;
    return { lat: center[1], lng: center[0] };
  } catch {
    return null;
  }
}

export async function geocodeAddress(
  addressKey: string,
  options?: { persist?: boolean },
): Promise<{ lat: number; lng: number }> {
  const cached = await prisma.geocodeCache.findUnique({ where: { addressKey } });
  if (cached && cached.expiresAt > new Date()) {
    return { lat: cached.lat, lng: cached.lng };
  }
  const live = await mapboxCoordinates(addressKey);
  const provider = live ? "mapbox" : "deterministic-dev";
  const point = live ?? deriveGeoPoint(addressKey);
  // Unauthenticated probes (addresses/validate) read the cache but must not
  // grow it — caller-chosen keys would bloat the table unboundedly.
  if (options?.persist === false) return point;
  const expiresAt = new Date(Date.now() + TTL_MS);
  await prisma.geocodeCache.upsert({
    where: { addressKey },
    update: { lat: point.lat, lng: point.lng, provider, fetchedAt: new Date(), expiresAt },
    create: { addressKey, lat: point.lat, lng: point.lng, provider, expiresAt },
  });
  return point;
}
