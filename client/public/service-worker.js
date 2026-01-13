self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal SW: just passes requests through
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
