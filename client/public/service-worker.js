self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Safe service worker:
 * - Does NOT cache aggressively
 * - Prevents "site stuck on old version" issues
 * - Works well for Auth-based apps
 */
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
