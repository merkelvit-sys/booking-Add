importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

self.addEventListener('message', (event) => {
  if (event.data && (event.data === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

const CACHE_VER = 'v80';
const CACHE_NAME = 'service-schedule-v80';
const ASSETS = [
  './',
  './index.html',
  './index_ua.html',
  './index_de.html',
  './app.js?v=80',
  './trolley.js',
  './app-sync.js?v=79',
  './app-sync.css?v=79',
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
});

self.addEventListener('activate', (event) => {
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
  if (e.request.method !== 'GET') return;

  const url = e.request.url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;

  if (url.includes('script.google.com') || url.includes('nominatim.openstreetmap.org') || url.includes('onesignal.com') || url.includes('cdn.onesignal.com')) {
    return;
  }

  const isHtmlNavigation = e.request.mode === 'navigate' ||
    (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html'));

  if (isHtmlNavigation) {
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