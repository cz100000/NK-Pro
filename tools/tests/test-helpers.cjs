"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { expect } = require("@playwright/test");
const { loadFixtureData } = require("./fixture-loader.cjs");

const root = path.resolve(__dirname, "..");
const appHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const testOrigin = "http://nkpro.test";

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({ ".css":"text/css", ".js":"text/javascript", ".json":"application/json", ".webmanifest":"application/manifest+json", ".png":"image/png" })[ext] || "text/plain";
}

async function installAppRoutes(page) {
  await page.route(`${testOrigin}/**`, async route => {
    const url = new URL(route.request().url());
    const relative = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "");
    const filePath = path.resolve(root, relative);
    if (!(filePath === root || filePath.startsWith(root + path.sep)) || !fs.existsSync(filePath)) {
      await route.fulfill({ status: 404, body: "Not found" });
      return;
    }
    await route.fulfill({ status: 200, contentType: contentType(filePath), body: fs.readFileSync(filePath) });
  });
}

function attachRuntimeGuards(page) {
  const errors = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push({ type: "console.error", text: message.text() });
  });
  page.on("pageerror", error => errors.push({ type: "pageerror", text: error.message }));
  page.on("requestfailed", request => {
    const failure = request.failure();
    errors.push({ type: "requestfailed", text: `${request.method()} ${request.url()} ${failure ? failure.errorText : ""}`.trim() });
  });
  return {
    errors,
    assertClean() {
      expect(errors, JSON.stringify(errors, null, 2)).toEqual([]);
    }
  };
}

async function installStorageMock(page, initialEntries = {}) {
  await page.addInitScript(entries => {
    const store = new Map(Object.entries(entries || {}).map(([key, value]) => [String(key), String(value)]));
    const mock = {
      get length() { return store.size; },
      key(index) { return [...store.keys()][Number(index)] ?? null; },
      getItem(key) { key = String(key); return store.has(key) ? store.get(key) : null; },
      setItem(key, value) { store.set(String(key), String(value)); },
      removeItem(key) { store.delete(String(key)); },
      clear() { store.clear(); },
      __entries() { return Object.fromEntries(store.entries()); }
    };
    Object.defineProperty(window, "localStorage", { value: mock, configurable: true });
    window.alert = () => {};
    window.confirm = () => true;
  }, initialEntries);
}

async function openFreshApp(page, initialEntries = {}) {
  await installStorageMock(page, initialEntries);
  await page.evaluate(entries => {
    const store = new Map(Object.entries(entries || {}).map(([key, value]) => [String(key), String(value)]));
    const mock = {
      get length() { return store.size; },
      key(index) { return [...store.keys()][Number(index)] ?? null; },
      getItem(key) { key = String(key); return store.has(key) ? store.get(key) : null; },
      setItem(key, value) { store.set(String(key), String(value)); },
      removeItem(key) { store.delete(String(key)); },
      clear() { store.clear(); },
      __entries() { return Object.fromEntries(store.entries()); }
    };
    Object.defineProperty(window, "localStorage", { value: mock, configurable: true });
    window.alert = () => {};
    window.confirm = () => true;
  }, initialEntries);
  await installAppRoutes(page);
  const html = appHtml.replace(/<head>/i, `<head><base href="${testOrigin}/">`);
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForFunction(() => document.documentElement.dataset.v992Audit === "passed");
  await expect(page.locator("#landing")).toHaveClass(/active/);
}

async function loadFixture(page, fixtureName) {
  const fixture = loadFixtureData(fixtureName);
  await page.evaluate(data => {
    state = normalizeLoadedData(JSON.parse(JSON.stringify(data)));
    prepareStateForPersistence("Playwright-Referenzfall");
    renderAll({ forceAll: true, reason: "playwright-fixture" });
    switchToTab("start");
  }, fixture);
  await page.waitForFunction(() => document.documentElement.dataset.v992Audit === "passed");
  return fixture;
}

async function stableStateSnapshot(page) {
  return page.evaluate(() => {
    const copy = JSON.parse(JSON.stringify(state));
    if (copy.meta) {
      [
        "lastSavedAt",
        "lastSavedWithAppVersion",
        "lastSaveReason",
        "storageIntegrityAlgorithm",
        "storageIntegrityChecksum",
        "storageIntegrityProtectedAt",
        "storageIntegrityProtectedWithAppVersion",
        "normalizedAt",
        "normalizedWithAppVersion"
      ].forEach(key => delete copy.meta[key]);
    }
    return copy;
  });
}

module.exports = { root, appHtml, attachRuntimeGuards, openFreshApp, loadFixture, loadFixtureData, stableStateSnapshot };
