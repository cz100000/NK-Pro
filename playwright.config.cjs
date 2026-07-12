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
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/playwright-results.json" }],
    ["html", { outputFolder: "test-results/html", open: "never" }]
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
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    }
  }
});
