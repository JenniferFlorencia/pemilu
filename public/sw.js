// Service Worker untuk cache gambar dari Firebase Storage
const CACHE_NAME = 'pemilu-images-v1';
const IMAGE_CACHE_URLS = [
    // Tambahkan URL pattern untuk Firebase Storage
];

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Cache gambar dari Firebase Storage
    if (url.hostname === 'firebasestorage.googleapis.com' && 
        url.pathname.includes('/candidates/')) {
        
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                const response = await fetch(event.request);
                if (response.status === 200) {
                    cache.put(event.request, response.clone());
                }
                return response;
            })
        );
    }
});