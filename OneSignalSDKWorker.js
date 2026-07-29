// Register message listener first (before importScripts) to handle PWA SKIP_WAITING updates
self.addEventListener('message', (event) => {
  if (event.data && (event.data === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
