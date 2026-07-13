"use strict";

const fs = require("node:fs");
const { defineConfig } = require("@playwright/test");

function chromiumExecutablePath() {
  const explicit = process.env.CHROMIUM_EXECUTABLE_PATH;
  return explicit && fs.existsSync(explicit) ? explicit : undefined;
}

const executablePath = chromiumExecutablePath();

module.exports = defineConfig({
  webServer: {
    command: "node tools/static-server.cjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 15_000
  },
  testDir: "./tests",
  outputDir: "./test-results/artifacts",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/playwright-results.json" }],
    ["html", { outputFolder: "test-results/html", open: "never" }]
  ],
  projects: [
    { name:"app-smoke", testMatch:"app-smoke.spec.js" },
    { name:"document-export", testMatch:"document-export.spec.js" },
    { name:"migration-restore", testMatch:"migration-restore-foundation.spec.js" },
    { name:"module-boundaries", testMatch:"module-boundaries.spec.js" },
    { name:"ui-controller-events", testMatch:"ui-controller-events.spec.js" },
    { name:"object-snapshot", testMatch:"object-standard-snapshot.spec.js" },
    { name:"persistence-backup", testMatch:"persistence-backup.spec.js" },
    { name:"reference-cases", testMatch:"reference-cases.spec.js" },
    { name:"service-worker", testMatch:"service-worker.spec.js" },
    { name:"ap10-orchestration", testMatch:"ap10-orchestration.spec.js" },
    { name:"ap11-navigation", testMatch:"ap11-navigation.spec.js" },
    { name:"ap12-orchestration", testMatch:"ap12-orchestration.spec.js" },
    { name:"ap13-letter-layout", testMatch:"ap13-letter-layout.spec.js" },
    { name:"ap14-ui-navigation", testMatch:"ap14-ui-navigation.spec.js" },
    { name:"ap15-integration-release", testMatch:"ap15-integration-release.spec.js" }
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    acceptDownloads: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
    }
  }
});
