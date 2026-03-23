// Service Worker for offline PWA functionality
const CACHE_NAME = 'budget-tool-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './css/mobile.css',
  './js/storage.js',
  './js/ai.js',
  './js/receipt-parser.js',
  './js/app.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
  'https://unpkg.com/vue@3/dist/vue.global.prod.js',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Silently continue even if some resources fail to cache
        console.log('Some resources failed to cache, but SW is still active');
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API calls (LLM endpoints, etc) - always go to network
  if (event.request.url.includes('/v1/') ||
      event.request.url.includes('/api/') ||
      event.request.url.includes('api.anthropic.com') ||
      event.request.url.includes('api.openai.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('Network error', { status: 503 })));
    return;
  }

  // For everything else, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-200 responses
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback - return cached version or a generic error
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return a minimal offline page
            return new Response('Offline - app data cached locally', {
              headers: { 'Content-Type': 'text/plain' },
            });
          });
        });
    })
  );
});

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
