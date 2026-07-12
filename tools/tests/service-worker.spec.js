"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { root } = require("./test-helpers.cjs");

test("Service Worker installiert den V99.4.2-App-Shell und entfernt Alt-Caches", async ({ page }) => {
  const source = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  const result = await page.evaluate(async workerSource => {
    const listeners = {};
    const log = { added: [], deleted: [], skipWaiting: 0, claimed: 0 };
    const cacheNames = new Set(["nk-pro-v99-2-7", "nk-pro-v99-3-0", "nk-pro-v99-4-0", "nk-pro-v99-4-1", "nk-pro-v99-4-2", "fremder-cache"]);
    const cacheApi = {
      async addAll(items) { log.added.push(...items); },
      async put() {}
    };
    const caches = {
      async open(name) { cacheNames.add(name); return cacheApi; },
      async keys() { return [...cacheNames]; },
      async delete(name) { log.deleted.push(name); return cacheNames.delete(name); },
      async match() { return null; }
    };
    const self = {
      addEventListener(name, handler) { listeners[name] = handler; },
      async skipWaiting() { log.skipWaiting += 1; },
      clients: { async claim() { log.claimed += 1; } }
    };
    const fakeFetch = async () => ({ clone() { return this; } });
    new Function("self", "caches", "fetch", workerSource)(self, caches, fakeFetch);

    let installPromise;
    listeners.install({ waitUntil(promise) { installPromise = promise; } });
    await installPromise;
    let activatePromise;
    listeners.activate({ waitUntil(promise) { activatePromise = promise; } });
    await activatePromise;
    return { log, remaining: [...cacheNames], events: Object.keys(listeners).sort() };
  }, source);

  expect(result.events).toEqual(["activate", "fetch", "install"]);
  expect(result.log.added).toEqual(expect.arrayContaining([
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
  ]));
  expect(result.log.skipWaiting).toBe(1);
  expect(result.log.claimed).toBe(1);
  expect(result.remaining).toEqual(["nk-pro-v99-4-2"]);
  expect(result.log.deleted).toEqual(expect.arrayContaining(["nk-pro-v99-2-7", "nk-pro-v99-4-0", "fremder-cache"]));
});
