const CACHE_NAME = 'ledger-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './styles/main.css',
  './js/app.js',
  './js/state.js',
  './js/storage.js',
  './js/utils.js',
  './js/gcal_oauth.js',
  './js/modules/today.js',
  './js/modules/calendar.js',
  './js/modules/dsa.js',
  './js/modules/challenges.js',
  './js/modules/cv.js',
  './js/modules/week.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME && caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    }).catch(() => caches.match('./index.html'))
  );
});
