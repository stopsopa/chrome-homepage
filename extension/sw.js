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
  const url = new URL(request.url);
  // Only intercept HTTP/HTTPS image requests
  if (request.destination === "image" && (url.protocol === "http:" || url.protocol === "https:")) {
    event.respondWith(
      (async () => {
        const clientId = event.clientId;
        const post = async (status, error) => {
          if (clientId) {
            try {
              const client = await self.clients.get(clientId);
              client?.postMessage({
                type: "SW_IMAGE_STATUS",
                url: request.url,
                status,
                error: error ? error.toString() : void 0
              });
            } catch (e) {
              console.error("[SW] Failed to send message to client", e);
            }
          }
        };
        try {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);
          if (cached) {
            await post("HIT");
            console.log(`[SW] Return from CACHE_HIT for: ${request.url}`);
            return cached;
          }
          const response = await fetch(request);
          if (response && (response.status === 200 || response.status === 0)) {
            await cache.put(request, response.clone());
            await post("MISS_CACHED");
            console.log(`[SW] Return from FETCH (and cached) for: ${request.url}`);
          } else {
            await post("MISS_NOT_CACHED");
            console.log(`[SW] Return from FETCH (bypassed cache) for: ${request.url}`);
          }
          return response;
        } catch (error) {
          await post("ERROR_FALLBACK", error);
          const fallbackResponse = await fetch(request);
          console.log(`[SW] Return from FALLBACK_FETCH (Error: ${error}) for: ${request.url}`);
          return fallbackResponse;
        }
      })()
    );
  }
});
