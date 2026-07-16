const CACHE_NAME = "nk-pro-v99-4-31-ap22c";
const BUILD_ID = "99.4.31-ap22c";
const CACHE_PREFIX = "nk-pro-";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/app.css?v=" + BUILD_ID,
  "./assets/brand/nk-pro-logo.png",
  "./assets/brand/nk-pro-icon-master.png",
  "./assets/brand/nk-pro-mark-64.png",
  "./assets/brand/nk-pro-mark-96.png",
  "./assets/brand/nk-pro-mark-128.png",
  "./js/ui-preferences.js",
  "./js/billing-context.js",
  "./js/state-access.js",
  "./js/application-actions.js",
  "./js/master-data-actions.js",
  "./js/cost-actions.js",
  "./js/billing-workflow.js",
  "./js/ui-controller.js",
  "./js/ui-bindings.js",
  "./js/ui-bindings.js?v=" + BUILD_ID,
  "./js/ui-events.js",
  "./js/ui-events.js?v=" + BUILD_ID,
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
  "./js/archive-actions.js",
  "./js/year-transition-actions.js",
  "./js/quality-rules.js",
  "./js/quality-assurance.js",
  "./js/diagnostics.js",
  "./js/billing-calculation.js",
  "./js/document-data.js",
  "./js/document-renderer.js",
  "./js/export-service.js",
  "./js/ui-table-tools.js",
  "./js/ui-design-system.js",
  "./js/ui-design-system.js?v=" + BUILD_ID,
  "./js/app-bootstrap.js",
  "./js/compatibility.js",
  "./js/default-seed.js",
  "./js/runtime-diagnostics.js",
  "./js/app-runtime-config.js",
  "./js/app-state-persistence.js",
  "./js/ui-master-data.js",
  "./js/ui-quality.js",
  "./js/ui-costs.js",
  "./js/ui-navigation-pages.js",
  "./js/ui-archive-pages.js",
  "./js/browser-io.js",
  "./js/ui-metering.js",
  "./js/ui-metering.js?v=" + BUILD_ID,
  "./js/ui-billing-allocation.js",
  "./js/ui-individual-values.js",
  "./js/ui-documents.js",
  "./js/ui-table-actions.js",
  "./js/ui-diagnostics.js",
  "./js/ui-page-controller.js",
  "./js/app.js",
  "./js/service-worker-register.js",
  "./js/service-worker-register.js?v=" + BUILD_ID,
  "./icons/icon-16.png",
  "./icons/icon-32.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];


self.addEventListener("message", event => {
  if (event && event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

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
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      })
  );
});
