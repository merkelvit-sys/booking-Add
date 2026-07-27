const CACHE_NAME = 'service-schedule-v36'; // <-- v36: добавлен бесшовный авто-апдейт PWA
const ASSETS = [
  './',
  './index.html',
  './index_ua.html',
  './index_de.html',
  './app.js',
  './trolley.js',
  './app-sync.js',
  './app-sync.css',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  './manifest_ua.json',
  './manifest_de.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll с обработкой ошибок для внешних ресурсов
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Только GET-запросы; API Google/Nominatim — всегда по сети
  if (e.request.method !== 'GET') return;

  const url = e.request.url;
  if (url.includes('script.google.com') || url.includes('nominatim.openstreetmap.org')) {
    return; // Network-only для API
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-While-Revalidate: отдаём кэш, обновляем в фоне
        fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse.clone()));
          }
        }).catch(() => { /* Игнорируем ошибки сети в фоне */ });

        return cachedResponse;
      }

      // Ресурс не в кэше — пробуем сеть
      return fetch(e.request).catch(() => {
        // Если запрашивается HTML-страница — вернуть index.html из кэша
        if (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});