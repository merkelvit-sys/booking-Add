importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Handle PWA SKIP_WAITING updates
self.addEventListener('message', (event) => {
  if (event.data && (event.data === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

const CACHE_NAME = 'service-schedule-v55';
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) => {
          const isRemote = url.startsWith('http') && !url.includes(self.location.hostname);
          const options = isRemote ? { mode: 'cors' } : { credentials: 'same-origin' };
          return fetch(url, options).then((res) => {
            if (res.ok) {
              return cache.put(url, res);
            }
            throw new Error('Fetch failed: ' + url);
          });
        })
      );
    })
  );
  // Автоматически пропускаем ожидание при установке
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Мгновенно забираем контроль над всеми клиентами/вкладками
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
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
        return cachedResponse;
      }

      return fetch(e.request).catch(() => {
        if (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
