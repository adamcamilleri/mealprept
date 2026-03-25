// NoChef Service Worker - enables "Add to Home Screen"
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests - no offline caching for now
  event.respondWith(fetch(event.request));
});
