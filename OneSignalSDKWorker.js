importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Register message listener on the top-level scope to satisfy Chrome's initial evaluation check
self.addEventListener('message', function(event) {
  // Handled by OneSignalSDK.sw.js
});
