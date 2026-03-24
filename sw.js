// Service Worker for offline PWA functionality
const CACHE_VERSION = 'night-ledger-v4';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL_URLS = [
  './',
  './index.html',
  './css/style.css',
  './css/mobile.css',
  './css/phase7-mobile.css',
  './css/phase12-category-customizer.css',
  './js/storage.js',
  './js/ai.js',
  './js/receipt-parser.js',
  './js/category-customizer.js',
  './js/ui-shell.js',
  './js/seed-data.js',
  './js/app.js',
];

function isHttpRequest(request) {
  return request.url.startsWith('http://') || request.url.startsWith('https://');
}

function isApiRequest(url) {
  return url.includes('/v1/') ||
    url.includes('/api/') ||
    url.includes('api.anthropic.com') ||
    url.includes('api.openai.com');
}

function isAppAsset(url) {
  return url.pathname === '/' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('manifest.json');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(name))
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  throw new Error('Network unavailable and no cached response');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !isHttpRequest(request)) {
    return;
  }

  const url = new URL(request.url);

  if (isApiRequest(request.url)) {
    event.respondWith(fetch(request).catch(() => new Response('Network error', { status: 503 })));
    return;
  }

  if (request.mode === 'navigate' || isAppAsset(url)) {
    event.respondWith(
      networkFirst(request, APP_SHELL_CACHE).catch(async () => {
        const fallback = await caches.match('./index.html');
        return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      })
    );
    return;
  }

  event.respondWith(
    staleWhileRevalidate(request, RUNTIME_CACHE).catch(() => new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
