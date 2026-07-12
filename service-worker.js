const CACHE_NAME = "nk-pro-v99-4-9";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/app.css",
  "./js/ui-preferences.js",
  "./js/state-access.js",
  "./js/application-actions.js",
  "./js/ui-controller.js",
  "./js/ui-bindings.js",
  "./js/ui-events.js",
  "./js/navigation.js",
  "./js/modal-events.js",
  "./js/persistence.js",
  "./js/migration.js",
  "./js/backup-recovery.js",
  "./js/meter-master.js",
  "./js/meter-readings.js",
  "./js/meter-periods.js",
  "./js/meter-validation.js",
  "./js/object-standard.js",
  "./js/billing-snapshot.js",
  "./js/archive.js",
  "./js/billing-calculation.js",
  "./js/document-data.js",
  "./js/document-renderer.js",
  "./js/export-service.js",
  "./js/ui-table-tools.js",
  "./js/app-bootstrap.js",
  "./js/compatibility.js",
  "./js/default-seed.js",
  "./js/app.js",
  "./js/service-worker-register.js",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
