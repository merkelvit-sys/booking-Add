// Synchronously register top-level message listener for SW lifecycle
self.addEventListener('message', (event) => {
  if (event.data && (event.data === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (e) {
  console.warn('[SW] OneSignal import skipped/failed:', e);
}

const CACHE_NAME = 'service-schedule-v64';
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
  self.skipWaiting();
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
  // Только GET-запросы; сторонние API — всегда по сети
  if (e.request.method !== 'GET') return;

  const url = e.request.url;
  // Игнорируем ненужные схемы (chrome-extension://, moz-extension://, file://)
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;

  if (url.includes('script.google.com') || url.includes('nominatim.openstreetmap.org') || url.includes('onesignal.com') || url.includes('cdn.onesignal.com')) {
    return; // Network-only для API
  }

  const isHtmlNavigation = e.request.mode === 'navigate' || 
    (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html'));

  if (isHtmlNavigation) {
    // Strategy: Network-First с откатом на кэш для HTML-страниц
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok && e.request.url.startsWith('http')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(e.request).then((cachedRes) => {
            if (cachedRes) return cachedRes;
            return caches.match('./index.html');
          });
        })
    );
  } else {
    // Strategy: Stale-While-Revalidate для JS, CSS, картинок
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok && e.request.url.startsWith('http')) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone)).catch(() => {});
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

