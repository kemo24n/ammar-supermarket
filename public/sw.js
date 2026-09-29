// Minimal service worker: makes the store installable and shows a friendly page when offline.
const OFFLINE = "/offline.html";
self.addEventListener("install", (e) => { e.waitUntil(caches.open("ammar-v1").then((c) => c.addAll([OFFLINE, "/brand/mark.svg"]))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
});
