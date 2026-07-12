if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", async function () {
    try {
      const registration = await navigator.serviceWorker.register("./service-worker.js");
      registration.addEventListener("updatefound", function () {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", function () {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            const box = document.createElement("div");
            box.className = "hint";
            box.style.position = "fixed";
            box.style.right = "16px";
            box.style.bottom = "16px";
            box.style.zIndex = "9999";
            box.style.maxWidth = "360px";
            box.innerHTML = "<strong>Neue NK-Pro-Version verfügbar.</strong><br><span class='small'>Bitte die App einmal neu laden.</span>";
            document.body.appendChild(box);
          }
        });
      });
    } catch (error) {
      console.warn("PWA-Service-Worker konnte nicht registriert werden:", error);
    }
  });
}
