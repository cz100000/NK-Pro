"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("Qualitäts- und Diagnoseorchestrierung bleibt vollständig seiteneffektfrei", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    const before = JSON.stringify(state);
    const storageBefore = JSON.stringify(localStorage.__entries());
    const rendersBefore = renderCount;
    const quality = window.NKProQualityAssurance.inspect({ scope:"full" });
    const cases = window.NKProQualityAssurance.specialCases();
    const readiness = window.NKProQualityAssurance.finalBillingReadiness(quality);
    const release = window.NKProDiagnostics.releaseAuditReport();
    const self = window.NKProDiagnostics.appSelfTestReport();
    return {
      stateSame:before === JSON.stringify(state),
      storageSame:storageBefore === JSON.stringify(localStorage.__entries()),
      renderDelta:renderCount - rendersBefore,
      qualityCodes:quality.issues.every(issue => typeof issue.code === "string" && issue.code.startsWith("NKP-")),
      releaseErrors:release.summary.errors,
      selfErrors:self.rows.filter(row => row.severity === "Fehler" && row.area !== "Qualität").length,
      hasCases:Array.isArray(cases.rows),
      readiness:!!readiness.label
    };
  });
  expect(result).toEqual({ stateSame:true, storageSame:true, renderDelta:0, qualityCodes:true, releaseErrors:0, selfErrors:0, hasCases:true, readiness:true });
  runtime.assertClean();
});

test("Archivierung nutzt genau einen Commit und rendert nicht aus dem Anwendungsmodul", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    state.meta.currentBillingCreatedByUser = true;
    state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
    const originalCommit = commitStateChange;
    let commits = 0;
    commitStateChange = options => { commits += 1; return originalCommit(options); };
    const rendersBefore = renderCount;
    try {
      const action = window.NKProArchiveActions.archiveCurrent({ confirmed:true });
      return {
        changed:action.changed,
        commits,
        renderDelta:renderCount - rendersBefore,
        archiveCount:state.jahresArchiv.length,
        active:window.NKProArchiveActions.hasActiveCurrentBilling(state),
        closed:window.NKProArchiveActions.isClosedAfterArchive(state)
      };
    } finally {
      commitStateChange = originalCommit;
    }
  });
  expect(result.changed).toBe(true);
  expect(result.commits).toBe(1);
  expect(result.renderDelta).toBe(0);
  expect(result.archiveCount).toBeGreaterThan(0);
  expect(result.active).toBe(false);
  expect(result.closed).toBe(true);
  runtime.assertClean();
});

test("Fehlgeschlagener Archivimport rollt alle Teiländerungen ohne Commit zurück", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    const before = JSON.stringify(state);
    const storageBefore = JSON.stringify(localStorage.__entries());
    const originalCommit = commitStateChange;
    let commits = 0;
    commitStateChange = options => { commits += 1; return originalCommit(options); };
    let error = "";
    try {
      const valid = JSON.parse(JSON.stringify(state.jahresArchiv[0]));
      window.NKProArchiveActions.importItems([valid, { year:"", data:null }]);
    } catch (caught) {
      error = String(caught && caught.message || caught);
    } finally {
      commitStateChange = originalCommit;
    }
    return {
      error,
      commits,
      stateSame:before === JSON.stringify(state),
      storageSame:storageBefore === JSON.stringify(localStorage.__entries())
    };
  });
  expect(result.error).not.toBe("");
  expect(result.commits).toBe(0);
  expect(result.stateSame).toBe(true);
  expect(result.storageSame).toBe(true);
  runtime.assertClean();
});

test("Jahreswechsel ist atomar, erhält unbekannte Felder und den Stromzähler-Dummy", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    state.meta.currentBillingCreatedByUser = false;
    state.meta.ap10UnknownMeta = { keep:true };
    state.ap10UnknownRoot = { keep:"root" };
    window.NKProMeterMaster.addElectricityDummyMeter(state, { meterId:"Z-AP10-STROM", bezeichnung:"AP10 Stromzähler-Dummy" }, { now:() => "2026-07-13T00:00:00.000Z" });
    const historical = Object.fromEntries(state.jahresArchiv.map(item => [window.NKProArchiveActions.periodId(item), JSON.stringify(item)]));
    const originalCommit = commitStateChange;
    let commits = 0;
    commitStateChange = options => { commits += 1; return originalCommit(options); };
    const rendersBefore = renderCount;
    try {
      const action = window.NKProYearTransitionActions.createBilling("2099", "2099-01-01", "2099-12-31", { confirmed:true });
      const dummy = ((state.zaehlerDaten && state.zaehlerDaten.zaehler) || []).find(item => window.NKProMeterMaster.isElectricityDummyMeter(item) && item.billingRole === "excluded" && item.abrechnungsrelevant === false);
      return {
        changed:action.changed,
        commits,
        renderDelta:renderCount - rendersBefore,
        year:String(state.meta.abrechnungsjahr),
        unknownMeta:state.meta.ap10UnknownMeta,
        unknownRoot:state.ap10UnknownRoot,
        historySame:Object.entries(historical).every(([id, serialized]) => {
          const item = state.jahresArchiv.find(entry => window.NKProArchiveActions.periodId(entry) === id);
          return !!item && JSON.stringify(item) === serialized;
        }),
        dummy:!!dummy
      };
    } finally {
      commitStateChange = originalCommit;
    }
  });
  expect(result).toEqual({ changed:true, commits:1, renderDelta:0, year:"2099", unknownMeta:{ keep:true }, unknownRoot:{ keep:"root" }, historySame:true, dummy:true });
  runtime.assertClean();
});

test("Fehlgeschlagener Jahreswechsel stellt den vollständigen Ausgangszustand wieder her", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    state.meta.currentBillingCreatedByUser = false;
    state.kostenarten = null;
    const before = JSON.stringify(state);
    const storageBefore = JSON.stringify(localStorage.__entries());
    const originalCommit = commitStateChange;
    let commits = 0;
    commitStateChange = options => { commits += 1; return originalCommit(options); };
    let error = "";
    try {
      window.NKProYearTransitionActions.createBilling("2098", "2098-01-01", "2098-12-31", { confirmed:true });
    } catch (caught) {
      error = String(caught && caught.message || caught);
    } finally {
      commitStateChange = originalCommit;
    }
    return { error, commits, stateSame:before === JSON.stringify(state), storageSame:storageBefore === JSON.stringify(localStorage.__entries()) };
  });
  expect(result.error).not.toBe("");
  expect(result.commits).toBe(0);
  expect(result.stateSame).toBe(true);
  expect(result.storageSame).toBe(true);
  runtime.assertClean();
});
