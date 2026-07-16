"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const html = read("index.html");
const worker = read("service-worker.js");
const registration = read("js/service-worker-register.js");
const build = (html.match(/name="nk-pro-build" content="([^"]+)"|content="([^"]+)" name="nk-pro-build"/) || []).slice(1).find(Boolean);
assert.ok(build, "Sichtbare Build-Metadaten fehlen.");

for (const asset of ["ui-bindings.js", "ui-events.js", "ui-metering.js", "service-worker-register.js"]) {
  assert.ok(html.includes(`./js/${asset}?v=${build}`), `Versionsparameter fehlt für ${asset}.`);
  assert.ok(worker.includes(`"./js/${asset}?v=" + BUILD_ID`), `Versionierte Offline-Ressource fehlt für ${asset}.`);
}
assert.ok(worker.includes(`const CACHE_NAME = "nk-pro-v${build.replace(/\./g,"-")}";`), "PWA-Cache ist nicht auf den aktuellen Build angehoben.");
assert.ok(worker.includes(`const BUILD_ID = "${build}";`), "Service-Worker-Build-ID fehlt.");
assert.ok(registration.includes('{ updateViaCache:"none" }'), "Service-Worker-Update darf nicht aus dem HTTP-Cache stammen.");
assert.ok(registration.includes("await registration.update()"), "Explizite Service-Worker-Aktualisierung fehlt.");
assert.ok(registration.includes('navigator.serviceWorker.addEventListener("controllerchange"'), "Automatischer Wechsel auf den neuen Worker fehlt.");
assert.ok(registration.includes('sessionStorage.setItem(RELOAD_KEY, "1")'), "Reload-Schleifenschutz fehlt.");
assert.ok(registration.includes("location.reload()"), "Einmaliger automatischer Reload fehlt.");
assert.ok(worker.includes('event.data.type === "SKIP_WAITING"'), "Explizite Aktivierungsnachricht fehlt.");

process.stdout.write("AP20-Korrekturstand 3: versionierte Zähler-Assets und erzwungene Service-Worker-Aktualisierung sind abgesichert.\n");
