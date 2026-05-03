/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */const CACHE_NAME = "images";
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  // Only intercept image requests
  if (request.destination === "image") {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          // Only cache successful external/local images
          // Avoid caching things that are not 200 (like 404s)
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          // Fallback or just return error
          return fetch(request);
        }
      })
    );
  }
});
