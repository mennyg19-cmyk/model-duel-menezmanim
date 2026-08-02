import { env } from "@/lib/env";

// UR-004: a visual map of a route's stops. Same honesty class as the geocode
// and route-optimizer Mapbox seams (lib/customers/geocode.ts,
// lib/routes/optimize.ts) — with MAPBOX_ACCESS_TOKEN set this returns a real
// Mapbox Static Images URL; without it, or when no stop has coordinates yet,
// it returns null and the caller renders nothing rather than a fake map.
const MAX_MARKERS = 60; // Static Images API URLs get unwieldy well before this.

export function buildRouteStaticMapUrl(
  stops: { lat: number | null; lng: number | null; delivered: boolean }[],
): string | null {
  if (!env.MAPBOX_ACCESS_TOKEN) return null;
  const located = stops.filter(
    (stop): stop is { lat: number; lng: number; delivered: boolean } => stop.lat !== null && stop.lng !== null,
  );
  if (located.length === 0) return null;

  const markers = located
    .slice(0, MAX_MARKERS)
    .map((stop) => `pin-s+${stop.delivered ? "16a34a" : "1d4ed8"}(${stop.lng},${stop.lat})`)
    .join(",");

  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers}/auto/640x360@2x` +
    `?padding=40&access_token=${encodeURIComponent(env.MAPBOX_ACCESS_TOKEN)}`
  );
}
