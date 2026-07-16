"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

test("zentrale UI-Bibliothek ist verfügbar und visuell belastbar", async ({ page }) => {
  const root=path.resolve(__dirname,"..");
  await page.setContent("<!doctype html><html><head></head><body></body></html>");
  await page.addStyleTag({content:fs.readFileSync(path.join(root,"assets/app.css"),"utf8")});
  await page.addScriptTag({content:fs.readFileSync(path.join(root,"js/ui-design-system.js"),"utf8")});
  await expect.poll(() => page.evaluate(() => Boolean(window.NKProUIDesignSystem))).toBe(true);
  const metadata=await page.evaluate(() => ({version:NKProUIDesignSystem.version,names:Object.keys(NKProUIDesignSystem.components),variant:NKProUIDesignSystem.statusVariant("fehler")}));
  expect(metadata.version).toBe("1.0.0");
  expect(metadata.names).toEqual(expect.arrayContaining(["button","field","card","accordion","table","status","notice","toolbar","dialog","emptyState"]));
  expect(metadata.variant).toBe("danger");

  await page.evaluate(() => {
    const host=document.createElement("section");
    host.id="ap22aCatalogHarness";
    host.className="nk-ui-stack";
    host.style.cssText="position:fixed;inset:24px 24px auto 280px;z-index:99999;background:white;padding:24px;max-height:900px;overflow:auto";
    host.innerHTML=`<div class="nk-ui-toolbar"><strong>NK-Pro UI-Bibliothek</strong><div class="nk-ui-cluster"><button class="nk-ui-button nk-ui-button--primary">Primär</button><button class="nk-ui-button nk-ui-button--secondary">Sekundär</button></div></div>
      <div class="nk-ui-card"><div class="nk-ui-card__header"><strong>Komponentenfundament</strong></div><div class="nk-ui-card__body nk-ui-stack"><label class="nk-ui-field"><span class="nk-ui-field__label">Beispielwert</span><input value="V99.4.29"><span class="nk-ui-field__hint">Einheitliche Feldstruktur</span></label><div class="nk-ui-cluster"><span class="nk-ui-status nk-ui-status--success">Vollständig</span><span class="nk-ui-status nk-ui-status--warning">Offen</span><span class="nk-ui-status nk-ui-status--danger">Fehler</span></div><div class="nk-ui-notice nk-ui-notice--info">Zentrale Hinweise verwenden semantische Varianten.</div></div></div>
      <details class="nk-ui-accordion" open><summary>Tabellen und Listen</summary><div class="nk-ui-accordion__body"><div class="nk-ui-table-wrap"><table class="nk-ui-table"><thead><tr><th>Komponente</th><th>Status</th></tr></thead><tbody><tr><td>Button</td><td>Fundament</td></tr><tr><td>Tabelle</td><td>Fundament</td></tr></tbody></table></div></div></details>`;
    document.body.appendChild(host);
  });
  const host=page.locator("#ap22aCatalogHarness");
  await expect(host).toBeVisible();
  await expect(host.locator(".nk-ui-button--primary")).toHaveCSS("min-height","40px");
  await host.screenshot({path:"test-results/artifacts/ap22a-ui-library-foundation.png"});
});
