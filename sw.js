const CACHE_NAME = 'drinking-diary-v1';
const BASE_PATH = '/drinking-diary/';

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        BASE_PATH,
        BASE_PATH + 'index.html',
        BASE_PATH + 'manifest.json',
        BASE_PATH + 'icon-192.png',
        BASE_PATH + 'icon-512.png'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network first, then cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(response => {
          if (response) return response;
          if (event.request.mode === 'navigate') {
            return caches.match(BASE_PATH + 'index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
