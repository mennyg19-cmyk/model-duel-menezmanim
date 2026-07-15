// Display/mobile service worker (SH.6). Network-first for /show and /api/display;
// offline falls back to last good board. Admin/auth paths are never cached.

const CACHE = "menezmanim-rebuild-a-display-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function isDisplayRequest(url) {
  return (
    url.pathname === "/show" ||
    url.pathname.startsWith("/show/") ||
    url.pathname === "/demo" ||
    url.pathname.startsWith("/demo/") ||
    url.pathname.startsWith("/api/display")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !isDisplayRequest(url)) return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error("offline and no cache");
      }
    })(),
  );
});
