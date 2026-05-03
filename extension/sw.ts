/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */

const CACHE_NAME = 'images';

self.addEventListener('install', () => {
    (self as any).skipWaiting();
});

self.addEventListener('activate', (event: any) => {
    event.waitUntil((self as any).clients.claim());
});

self.addEventListener('fetch', (event: any) => {
    const request = event.request;
    
    // Only intercept image requests
    if (request.destination === 'image') {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) return cached;

                try {
                    const response = await fetch(request);
                    
                    // Cache successful responses (200) OR opaque responses (0)
                    // Opaque responses are common for cross-origin images without CORS
                    if (response && (response.status === 200 || response.status === 0)) {
                        cache.put(request, response.clone());
                    }
                    
                    return response;
                } catch (error) {
                    return fetch(request);
                }
            })
        );
    }
});
