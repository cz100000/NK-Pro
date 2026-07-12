"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixture, loadFixtureData } = require("./test-helpers.cjs");

test("Referenzfall Standard bleibt vollständig und berechenbar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");
  const result = await page.evaluate(() => {
    const calc = calculateUmlage();
    return {
      schema: currentDataSchemaVersion(state),
      counts: [state.wohnungen.length, state.mieter.length, state.kostenarten.length],
      privateTenant: state.mieter.find(m => m.id === "M000")?.abrechnungRolle,
      tenantResults: calc.tenantResults.length,
      privateResults: calc.privateResults.length,
      allCalculationTenants: calc.tenants.length,
      audit: releaseAuditReport().summary
    };
  });
  expect(result.schema).toBe(5);
  expect(result.counts).toEqual([7, 20, 41]);
  expect(result.privateTenant).toBe("Eigentümer/Privat");
  expect(result.tenantResults).toBe(4);
  expect(result.privateResults).toBe(1);
  expect(result.allCalculationTenants).toBe(5);
  expect(result.audit.errors).toBe(0);
  runtime.assertClean();
});

test("Referenzfall Mieterwechsel erhält zwei Perioden auf derselben Wohnung", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "mieterwechsel.json");
  const result = await page.evaluate(() => state.mieter
    .filter(m => m.wohnung === "W001.EG-L" && m.name)
    .map(m => ({ id: m.id, einzug: m.einzug, auszug: m.auszug, tage: tenantDays(m) })));
  expect(result).toHaveLength(2);
  expect(result.map(x => x.id)).toEqual(["M001", "M006"]);
  expect(result.map(x => x.tage).sort((a, b) => a - b)).toEqual([181, 184]);
  expect(result.reduce((sum, row) => sum + row.tage, 0)).toBe(365);
  runtime.assertClean();
});

test("Referenzfall Leerstand erkennt eine aktive Wohnung ohne Mietverhältnis", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "leerstand.json");
  const result = await page.evaluate(() => {
    const activeIds = activeWohnungen().map(w => w.id);
    const occupiedIds = new Set(state.mieter.filter(tenantRelevantForCurrentBilling).map(m => m.wohnung).filter(Boolean));
    const vacantIds = activeIds.filter(id => !occupiedIds.has(id));
    return { activeIds, vacantIds, specialCases: specialCaseWatchReport().rows.map(row => row.type) };
  });
  expect(result.activeIds).toContain("W005.DG-L");
  expect(result.vacantIds).toContain("W005.DG-L");
  expect(result.specialCases.some(type => /Leerstand/i.test(type))).toBe(true);
  runtime.assertClean();
});

test("Referenzfall M000 bleibt in der Umlage und außerhalb der Mieterbriefe", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "eigentuemer-m000.json");
  const result = await page.evaluate(() => {
    const calc = calculateUmlage();
    const allIds = calc.tenants.map(row => row.id);
    const privateIds = calc.privateResults.map(row => row.tenant.id);
    const letterIds = briefResultRows(calc).map(row => row.tenant.id);
    return {
      role: state.mieter.find(m => m.id === "M000")?.abrechnungRolle,
      inCalculation: allIds.includes("M000"),
      inPrivateResults: privateIds.includes("M000"),
      inLetters: letterIds.includes("M000")
    };
  });
  expect(result).toEqual({ role: "Eigentümer/Privat", inCalculation: true, inPrivateResults: true, inLetters: false });
  runtime.assertClean();
});

test("Referenzfall trennt alle vier Eingabequellen eindeutig", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "alle-eingabequellen.json");
  const result = await page.evaluate(() => {
    const ids = ["K002", "K009", "K006", "K013"];
    const modes = Object.fromEntries(ids.map(id => {
      const cost = state.kostenarten.find(k => k.id === id);
      return [id, manualInputModeForCost(cost)];
    }));
    const calc = calculateUmlage();
    const costs = Object.fromEntries(ids.map(id => {
      const row = calc.costResults.find(item => item.cost.id === id);
      return [id, { inputSum: row.inputSum, ownerShare: row.ownerShare, status: row.status }];
    }));
    return { modes, costs };
  });
  expect(result.modes).toEqual({
    K002: "Zählerstände",
    K009: "Verbrauchsmenge",
    K006: "Direkter Eurobetrag",
    K013: "Externe Einzelabrechnung"
  });
  expect(result.costs.K006.inputSum).toBe(100);
  expect(result.costs.K013.inputSum).toBe(75);
  expect(Math.abs(result.costs.K006.ownerShare)).toBeLessThanOrEqual(0.01);
  expect(Math.abs(result.costs.K013.ownerShare)).toBeLessThanOrEqual(0.01);
  runtime.assertClean();
});

test("Referenzfall Altdaten wird kontrolliert auf Schema 5 migriert", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const legacy = loadFixtureData("altdaten-migration.json");
  const result = await page.evaluate(data => {
    const migrated = normalizeLoadedData(JSON.parse(JSON.stringify(data)));
    return {
      schema: currentDataSchemaVersion(migrated),
      hasM000: migrated.mieter.some(m => m.id === "M000"),
      hasLegacyM005: migrated.mieter.some(m => m.id === "M005"),
      masterHasStatus: migrated.stammdaten.wohnungen.some(w => Object.prototype.hasOwnProperty.call(w, "status")),
      billingStatus: migrated.wohnungen[0].status,
      k006Mode: migrated.umlageInputs.K006 && migrated.umlageInputs.K006.mode,
      migrationTargets: (migrated.meta.migrationHistory || []).map(item => item.to)
    };
  }, legacy);
  expect(result.schema).toBe(5);
  expect(result.hasM000).toBe(true);
  expect(result.hasLegacyM005).toBe(false);
  expect(result.masterHasStatus).toBe(false);
  expect(result.billingStatus).toBe("aktiv");
  expect(result.k006Mode).toBe("Direkter Eurobetrag");
  expect(result.migrationTargets).toContain(5);
  runtime.assertClean();
});
