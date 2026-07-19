(function() {
  "use strict";

  const BUILD_ID = "99.4.63-ap22f11b-k2";
  const RELOAD_KEY = "nkpro_service_worker_reload_" + BUILD_ID;

  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;

  function showUpdateNotice() {
    if (document.querySelector('[data-nkpro-update-notice="' + BUILD_ID + '"]')) return;
    const box = document.createElement("div");
    box.className = "hint";
    box.dataset.nkproUpdateNotice = BUILD_ID;
    box.style.position = "fixed";
    box.style.right = "16px";
    box.style.bottom = "16px";
    box.style.zIndex = "9999";
    box.style.maxWidth = "360px";
    box.innerHTML = "<strong>Neue NK-Pro-Version wird aktiviert.</strong><br><span class='small'>Die App lädt gleich einmal automatisch neu.</span>";
    document.body.appendChild(box);
  }

  navigator.serviceWorker.addEventListener("controllerchange", function() {
    try {
      if (sessionStorage.getItem(RELOAD_KEY) === "1") return;
      sessionStorage.setItem(RELOAD_KEY, "1");
    } catch (_error) {
      // Ein einmaliger Reload bleibt auch ohne Session Storage zulässig.
    }
    location.reload();
  });

  window.addEventListener("load", async function() {
    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js?v=" + encodeURIComponent(BUILD_ID),
        { updateViaCache:"none" }
      );

      registration.addEventListener("updatefound", function() {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", function() {
          if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdateNotice();
        });
      });

      await registration.update();
      const activeUrl = registration.active && registration.active.scriptURL ? registration.active.scriptURL : "";
      if (activeUrl && !activeUrl.includes(encodeURIComponent(BUILD_ID)) && registration.waiting) {
        registration.waiting.postMessage({ type:"SKIP_WAITING", buildId:BUILD_ID });
      }
    } catch (error) {
      console.warn("PWA-Service-Worker konnte nicht registriert oder aktualisiert werden:", error);
    }
  });
})();
