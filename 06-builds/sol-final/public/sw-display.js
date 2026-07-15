/* SH.6 — kiosk/offline cache for public display snapshots and show pages. */
const CACHE = "menez-display-v1";
const MATCH = [/\/api\/display\//, /\/show\//];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (!MATCH.some((re) => re.test(url.pathname))) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(event.request);
        if (fresh.ok) await cache.put(event.request, fresh.clone());
        return fresh;
      } catch {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        throw new Error("offline and uncached");
      }
    })(),
  );
});
