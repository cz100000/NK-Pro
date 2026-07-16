"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { root, appHtml, attachRuntimeGuards, loadFixture } = require("./test-helpers.cjs");

function inlineApplicationHtml() {
  let html = appHtml;
  const css = fs.readFileSync(path.join(root, "assets", "app.css"), "utf8");
  html = html.replace(/<link[^>]+href=["\']\.\/assets\/app\.css[^"\']*["\'][^>]*>/i, `<style>${css}</style>`);
  html = html.replace(/<link[^>]+rel=["\'](?:preload|manifest|icon|apple-touch-icon)["\'][^>]*>/gi, "");
  html = html.replace(/\s(?:src|href)=["\']\.\/assets\/brand\/[^"\']+["\']/gi, "");
  html = html.replace(/<script([^>]*?)src=["\']\.\/js\/([^"\'?]+)(?:\?[^"\']*)?["\']([^>]*)><\/script>/gi, (_match, before, fileName, after) => {
    if (fileName === "service-worker-register.js") return "";
    const source = fs.readFileSync(path.join(root, "js", fileName), "utf8");
    return `<script${before}${after}>\n${source}\n</script>`;
  });
  const storageMock = `<script>
  (() => {
    const store = new Map();
    const mock = {
      get length(){ return store.size; },
      key(index){ return [...store.keys()][Number(index)] ?? null; },
      getItem(key){ key=String(key); return store.has(key) ? store.get(key) : null; },
      setItem(key,value){ store.set(String(key),String(value)); },
      removeItem(key){ store.delete(String(key)); },
      clear(){ store.clear(); },
      __entries(){ return Object.fromEntries(store.entries()); }
    };
    Object.defineProperty(window,"localStorage",{value:mock,configurable:true});
    window.alert=()=>{}; window.confirm=()=>true; window.prompt=()=>"FINALISIERUNG AUFHEBEN";
  })();
  </script>`;
  return html.replace(/<head>/i, `<head>${storageMock}`);
}

async function openInlineApp(page) {
  await page.setContent(inlineApplicationHtml(), { waitUntil:"load", timeout:30_000 });
  await page.waitForFunction(() => document.documentElement.dataset.v992Audit === "passed", null, { timeout:15_000 });
  await expect(page.locator("#landing")).toHaveClass(/active/);
}

async function openCurrentBilling(page, mode = "edit") {
  await page.evaluate(({ requestedMode }) => {
    state.meta = state.meta || {};
    state.meta.currentBillingCreatedByUser = true;
    state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
    renderAll({ forceAll:true, reason:"ap21a-browser-setup" });
    switchToTab("start");
    if (requestedMode === "view") openCurrentBillingForView();
    else openCurrentBillingForEdit();
    switchToTab("manuellewerte");
  }, { requestedMode:mode });
  await expect(page.locator("#manuellewerte")).toHaveClass(/active/);
}

test("AP21A lädt den Release und die vereinfachte Navigation ohne Laufzeitfehler", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openInlineApp(page);

  await expect(page).toHaveTitle("NK-Pro V99.4.24 – AP21A UI-Konsolidierung, Navigation und individuelle Werte");
  const result = await page.evaluate(() => ({
    version:APP_VERSION,
    versionName:APP_VERSION_NAME,
    schema:DATA_SCHEMA_VERSION,
    audit:document.documentElement.dataset.v992Audit,
    nav:[...document.querySelectorAll('#nav-group-billing .tab-btn[data-tab]')].map(button => button.textContent.trim()),
    navTabs:[...document.querySelectorAll('#nav-group-billing .tab-btn[data-tab]')].map(button => button.dataset.tab),
    ruleCount:window.NKProQualityRules.describe().ruleCount,
    rule001:window.NKProQualityRules.REGISTRY.find(rule => rule.id === "NKP-FACH-001")?.id || null
  }));

  expect(result).toMatchObject({
    version:"V99.4.24",
    versionName:"AP21A-UI-Konsolidierung, Navigation und individuelle Werte",
    schema:5,
    audit:"passed",
    nav:["Übersicht","Mietverhältnisse","Vorauszahlungen","Gesamtkosten","Individuelle Werte","Abrechnungsergebnis","Prüfung","Vorauszahlungsanpassung","Briefe","Export","Archiv"]
  });
  expect(result.navTabs).not.toContain("verbraeuche");
  expect(result.ruleCount).toBe(42);
  expect(result.rule001).toBe("NKP-FACH-001");
  runtime.assertClean();
});

test("Individuelle Werte erzeugt dynamische Klappboxen, Filter und Quellenansichten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openInlineApp(page);
  await loadFixture(page, "alle-eingabequellen.json");
  await openCurrentBilling(page, "edit");

  await expect(page.locator('[data-page-header="manuellewerte"] .page-header__title')).toHaveText("Individuelle Werte und Verbräuche erfassen");
  const activeCosts = await page.evaluate(() => state.kostenarten.filter(cost => cost.inNK === "Ja").length);
  await expect(page.locator("#individualValuesList .individual-cost-card")).toHaveCount(activeCosts);
  await expect(page.locator('[data-individual-summary="active"]')).toHaveText(String(activeCosts));
  await expect(page.locator("#individualValuesList svg").first()).toBeVisible();

  const sourceTypes = await page.locator("#individualValuesList .individual-cost-card").evaluateAll(cards => cards.map(card => card.dataset.individualSource));
  expect(sourceTypes).toContain("automatic");
  expect(sourceTypes).toContain("manual");
  expect(sourceTypes).toContain("external");

  await page.locator('[data-individual-filter="open"]').click();
  await expect(page.locator('[data-individual-filter="open"]')).toHaveAttribute("aria-pressed", "true");
  const visibleCards = await page.locator("#individualValuesList .individual-cost-card:visible").count();
  const openSummary = Number(await page.locator('[data-individual-summary="open"]').textContent());
  expect(visibleCards).toBe(openSummary);

  await page.locator('[data-individual-filter="all"]').click();
  const meterButton = page.locator("[data-individual-open-meter-source]").first();
  const automaticCard = meterButton.locator("xpath=ancestor::details[contains(@class,'individual-cost-card')]");
  if (!(await automaticCard.getAttribute("open"))) await automaticCard.locator(":scope > summary").click();
  await expect(meterButton).toBeVisible();
  await meterButton.click();
  await expect(page.locator("#individualValuesMeterSource")).toHaveAttribute("open", "");
  await expect(page.locator("#individualValuesMeterSource")).toContainText("Führende Datenquelle");
  runtime.assertClean();
});

test("Alte Direkteinstiege werden kompatibel auf Individuelle Werte umgeleitet", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openInlineApp(page);
  await openCurrentBilling(page, "edit");

  const result = await page.evaluate(() => {
    switchToTab("verbraeuche");
    return {
      active:document.querySelector("section.tab.active")?.id,
      navActive:document.querySelector(".tab-btn.active")?.dataset.tab,
      description:window.NKProIndividualValues.describe()
    };
  });
  expect(result.active).toBe("manuellewerte");
  expect(result.navActive).toBe("manuellewerte");
  expect(result.description.activeCosts).toBeGreaterThan(0);
  runtime.assertClean();
});

test("Ansichtsmodus zeigt genau die vereinheitlichte Schreibschutzinformation", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openInlineApp(page);
  await openCurrentBilling(page, "view");

  await expect(page.locator('[data-global-billing-mode]')).toContainText("Nur ansehen");
  const notice = page.locator("#manuellewerte .billing-readonly-notice");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("Diese Abrechnung ist schreibgeschützt.");
  await expect(notice).toContainText("Änderungen sind erst nach dem Öffnen zur Bearbeitung möglich.");
  await expect(notice.locator('[data-ui-action="billing.switchToEdit"]')).toHaveText("Zur Bearbeitung öffnen");
  await expect(page.locator('#manuellewerte [data-page-readonly]')).toHaveCount(0);
  await expect(page.locator('#manuellewerte .individual-source-control select').first()).toBeDisabled();

  const protectedResult = await page.evaluate(() => {
    try {
      window.NKProBillingWorkflow.setManualExternalValue("K002", 0, 123);
      return { blocked:false };
    } catch (error) {
      return { blocked:error && error.code === "NKPRO_BILLING_READONLY", message:error.message };
    }
  });
  expect(protectedResult.blocked).toBe(true);
  expect(protectedResult.message).toContain("Ansichtsmodus");
  runtime.assertClean();
});

test("Deaktivierung löscht vorhandene individuelle Werte nicht", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openInlineApp(page);
  await loadFixture(page, "alle-eingabequellen.json");
  await openCurrentBilling(page, "edit");

  const result = await page.evaluate(() => {
    const candidate = state.kostenarten.find(cost => cost.inNK === "Ja" && state.umlageInputs?.[cost.id]);
    if (!candidate) return null;
    const before = JSON.stringify(state.umlageInputs[candidate.id]);
    candidate.inNK = "Nein";
    renderIndividualValues();
    const afterDeactivate = JSON.stringify(state.umlageInputs[candidate.id]);
    const hidden = !document.querySelector(`[data-individual-cost="${candidate.id}"]`);
    candidate.inNK = "Ja";
    renderIndividualValues();
    const afterReactivate = JSON.stringify(state.umlageInputs[candidate.id]);
    const restored = !!document.querySelector(`[data-individual-cost="${candidate.id}"]`);
    return { before, afterDeactivate, afterReactivate, hidden, restored };
  });

  expect(result).not.toBeNull();
  expect(result.afterDeactivate).toBe(result.before);
  expect(result.afterReactivate).toBe(result.before);
  expect(result.hidden).toBe(true);
  expect(result.restored).toBe(true);
  runtime.assertClean();
});
