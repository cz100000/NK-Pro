"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { root } = require("./test-helpers.cjs");

test("Service Worker installiert den V99.4.23-App-Shell, begrenzt Cachebereinigung und härtet Offline-Fallbacks", async ({ page }) => {
  const source = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  const result = await page.evaluate(async workerSource => {
    const listeners = {};
    const log = { added:[], deleted:[], put:[], skipWaiting:0, claimed:0, fetchCalls:0 };
    const cacheNames = new Set([
      "nk-pro-v99-2-7",
      "nk-pro-v99-4-17-ap14",
      "nk-pro-v99-4-19-ap16",
      "nk-pro-v99-4-23-ap20-corr2",
      "fremder-cache"
    ]);
    const cacheEntries = new Map([["http://nkpro.test/index.html", { source:"cached-index" }]]);
    const cacheApi = {
      async addAll(items) { log.added.push(...items); },
      async put(request, response) { log.put.push(request.url || String(request)); cacheEntries.set(request.url || String(request), response); }
    };
    const caches = {
      async open(name) { cacheNames.add(name); return cacheApi; },
      async keys() { return [...cacheNames]; },
      async delete(name) { log.deleted.push(name); return cacheNames.delete(name); },
      async match(request) {
        const key = typeof request === "string" ? request : request.url;
        if (key === "./index.html") return { source:"app-shell-index" };
        return cacheEntries.get(key) || null;
      }
    };
    const self = {
      location:{ origin:"http://nkpro.test" },
      addEventListener(name, handler) { listeners[name] = handler; },
      async skipWaiting() { log.skipWaiting += 1; },
      clients:{ async claim() { log.claimed += 1; } }
    };
    let offline = false;
    const fakeFetch = async request => {
      log.fetchCalls += 1;
      if (offline) throw new Error("offline");
      return { ok:true, status:200, request, clone() { return this; } };
    };
    const Response = { error() { return { source:"response-error" }; } };
    new Function("self", "caches", "fetch", "Response", "URL", workerSource)(self, caches, fakeFetch, Response, URL);

    let installPromise;
    listeners.install({ waitUntil(promise) { installPromise = promise; } });
    await installPromise;
    let activatePromise;
    listeners.activate({ waitUntil(promise) { activatePromise = promise; } });
    await activatePromise;

    let networkPromise;
    const sameOriginRequest = { method:"GET", url:"http://nkpro.test/index.html", mode:"navigate" };
    listeners.fetch({ request:sameOriginRequest, respondWith(promise) { networkPromise = promise; } });
    const networkResponse = await networkPromise;
    await new Promise(resolve => setTimeout(resolve, 0));

    let crossOriginHandled = false;
    listeners.fetch({
      request:{ method:"GET", url:"https://example.org/asset.js", mode:"cors" },
      respondWith() { crossOriginHandled = true; }
    });

    offline = true;
    let offlineNavigationPromise;
    listeners.fetch({ request:{ method:"GET", url:"http://nkpro.test/missing", mode:"navigate" }, respondWith(promise) { offlineNavigationPromise = promise; } });
    const offlineNavigation = await offlineNavigationPromise;

    let offlineAssetPromise;
    listeners.fetch({ request:{ method:"GET", url:"http://nkpro.test/missing.js", mode:"no-cors" }, respondWith(promise) { offlineAssetPromise = promise; } });
    const offlineAsset = await offlineAssetPromise;

    return {
      log,
      remaining:[...cacheNames].sort(),
      events:Object.keys(listeners).sort(),
      networkOk:networkResponse.ok,
      crossOriginHandled,
      offlineNavigation:offlineNavigation.source,
      offlineAsset:offlineAsset.source
    };
  }, source);

  expect(result.events).toEqual(["activate", "fetch", "install"]);
  expect(result.log.added).toEqual(expect.arrayContaining([
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./assets/app.css",
    "./js/state-access.js",
    "./js/ui-controller.js",
    "./js/app-state-persistence.js",
    "./js/ui-page-controller.js",
    "./icons/icon-180.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
  ]));
  expect(result.log.skipWaiting).toBe(1);
  expect(result.log.claimed).toBe(1);
  expect(result.remaining).toEqual(["fremder-cache", "nk-pro-v99-4-23-ap20-corr2"]);
  expect(result.log.deleted).toEqual(expect.arrayContaining(["nk-pro-v99-2-7", "nk-pro-v99-4-17-ap14", "nk-pro-v99-4-19-ap16"]));
  expect(result.log.deleted).not.toContain("fremder-cache");
  expect(result.networkOk).toBe(true);
  expect(result.log.put).toContain("http://nkpro.test/index.html");
  expect(result.crossOriginHandled).toBe(false);
  expect(result.offlineNavigation).toBe("app-shell-index");
  expect(result.offlineAsset).toBe("response-error");
});
