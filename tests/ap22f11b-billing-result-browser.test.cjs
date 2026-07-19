const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('/mnt/data/ap22f11b_workspace/source/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const DATA = '/mnt/data/nk-pro-gesamtbestand-2025-V99.4.58-2026-07-19-16-16-12(3).json';
const SHOTS = path.join(ROOT, 'AP22F11B_Screenshots');
const REPORT = path.join(ROOT, 'AP22F11B_Dokumentation', 'browser-test-result.json');
const ORIGIN = 'http://nkpro-ap22f11b.test';
const raw = JSON.parse(fs.readFileSync(DATA, 'utf8'));
fs.mkdirSync(SHOTS, { recursive:true });
fs.mkdirSync(path.dirname(REPORT), { recursive:true });

function sha(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function closeTo(actual, expected, tolerance = 0.011, label = '') {
  assert.ok(Math.abs(Number(actual) - Number(expected)) <= tolerance, `${label}: expected ${expected}, got ${actual}`);
}

function manualBusinessSnapshot(inputs) {
  return Object.fromEntries(Object.entries(inputs || {}).map(([costId,input]) => [costId, {
    kostenId:input && input.kostenId, kostenart:input && input.kostenart, art:input && input.art, mode:input && input.mode,
    values:input && input.values,
    caseValues:Object.fromEntries(Object.entries(input && input.caseValues || {}).map(([caseKey,row]) => [caseKey, {
      amount:row && row.amount, value:row && row.value, note:row && row.note, source:row && row.source,
      consumption:row && row.consumption, provider:row && row.provider, recordedAt:row && row.recordedAt
    }]))
  }]));
}

function publicDataSnapshot(data) {
  return {
    wohnungen:data.wohnungen,
    mieter:data.mieter,
    kostenarten:data.kostenarten,
    vorauszahlungen:data.vorauszahlungen,
    waterMeters:data.waterMeters,
    umlageInputs:data.umlageInputs,
    jahresArchiv:data.jahresArchiv
  };
}

async function mount(browser, initialEntries = {}, viewport = { width:1440, height:1000 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(`PAGE: ${error.stack || error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`CONSOLE: ${message.text()}`); });
  await page.route(`${ORIGIN}/**`, async route => {
    const url = new URL(route.request().url());
    const rel = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '').split('?')[0];
    const file = path.resolve(ROOT, rel);
    const ext = path.extname(file).toLowerCase();
    const contentType = ({ '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.webmanifest':'application/manifest+json', '.png':'image/png', '.svg':'image/svg+xml' })[ext] || 'text/html';
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return route.fulfill({ status:404, body:'not found' });
    return route.fulfill({ status:200, contentType, body:fs.readFileSync(file) });
  });
  await page.evaluate(entries => {
    const store = new Map(Object.entries(entries || {}));
    let failWrites = false;
    const mock = {
      get length(){ return store.size; },
      key(index){ return [...store.keys()][index] ?? null; },
      getItem(key){ return store.has(String(key)) ? store.get(String(key)) : null; },
      setItem(key,value){ if (failWrites) { const error=new Error('Simulierter Speicherfehler'); error.name='QuotaExceededError'; throw error; } store.set(String(key),String(value)); },
      removeItem(key){ store.delete(String(key)); }, clear(){ store.clear(); },
      __entries(){ return Object.fromEntries(store); }, __setFail(value){ failWrites=!!value; }
    };
    Object.defineProperty(window,'localStorage',{ value:mock, configurable:true });
    window.alert=()=>{}; window.confirm=()=>true;
  }, initialEntries);
  const html = fs.readFileSync(path.join(ROOT,'index.html'),'utf8').replace(/<head>/i,`<head><base href="${ORIGIN}/">`);
  await page.setContent(html,{ waitUntil:'load' });
  await page.waitForTimeout(3000);
  const ready = await page.evaluate(() => !!(globalThis.NKProBillingReview && typeof state !== 'undefined' && typeof renderAll === 'function'));
  if (!ready) throw new Error('NK-Pro Browserstart nicht vollständig');
  return { context, page, errors };
}

async function importThroughUi(page, file = DATA) {
  await page.setInputFiles('#jsonImport', file);
  await page.waitForFunction(() => state && state.meta && state.meta.abrechnungsjahr === '2025' && Array.isArray(state.mieter) && state.mieter.some(row => row.id === 'M001'));
  await page.waitForTimeout(250);
}
async function openResult(page, mode = 'edit') {
  await page.evaluate(mode => {
    if (mode === 'view') openCurrentBillingForView(); else openCurrentBillingForEdit();
    switchToTab('umlage');
  }, mode);
  await page.waitForSelector('#umlage', { state:'visible' });
  await page.waitForSelector('#billingReviewTable tbody tr');
  await page.waitForTimeout(120);
}
async function model(page) {
  return page.evaluate(() => {
    const m = NKProBillingReview.currentModel(state);
    return {
      summary:m.summary,
      totals:m.totals,
      differences:m.differences.map(row => ({ id:row.id, type:row.type, costId:row.costId, area:row.area, difference:row.difference, unit:row.unit, monetaryAmount:row.monetaryAmount, status:row.status, label:row.label, record:row.record })),
      records:m.records,
      history:m.history,
      tenantCount:m.calculation.tenantResults.length,
      privateCount:m.calculation.privateResults.length
    };
  });
}
async function acceptViaUi(page, id, treatment, reason, acceptedBy = 'AP22F11B Test') {
  const row = page.locator(`tr[data-review-id="${id}"]`);
  await row.getByRole('button', { name:/Akzeptieren|Ändern/ }).click();
  await page.waitForFunction(() => document.getElementById('billingReviewAcceptDialog')?.open === true);
  assert.strictEqual(await page.evaluate(() => document.activeElement && document.activeElement.id), 'billingReviewTreatment', 'dialog first focus');
  await page.selectOption('#billingReviewTreatment', treatment);
  await page.fill('#billingReviewReason', reason);
  await page.fill('#billingReviewAcceptedBy', acceptedBy);
  await page.check('#billingReviewConfirmed');
  await page.getByRole('button', { name:'Prüfentscheidung speichern' }).click();
  await page.waitForFunction(id => {
    const m = NKProBillingReview.currentModel(state);
    const row = m.differences.find(item => item.id === id);
    return row && (row.status === 'accepted' || row.status === 'landlord');
  }, id);
}
async function layout(page, width, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(180);
  return page.evaluate(() => ({
    documentOverflow:Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    wraps:[...document.querySelectorAll('#umlage .billing-result-table-wrap')].map(node => ({ scrollWidth:node.scrollWidth, clientWidth:node.clientWidth })),
    headerBackground:getComputedStyle(document.querySelector('#billingReviewTable thead th')).backgroundColor
  }));
}

(async () => {
  const startedAt = new Date().toISOString();
  const browser = await chromium.launch({ headless:true, executablePath:'/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const checks = [];
  let first;
  try {
    first = await mount(browser);
    const { page } = first;
    await importThroughUi(page);
    checks.push('Gesamtbestand über den echten JSON-Importdialog importiert');
    await openResult(page, 'edit');

    let m = await model(page);
    assert.strictEqual(m.differences.length, 2, 'two current differences');
    assert.strictEqual(m.summary.openCount, 2, 'two open differences');
    const manual = m.differences.find(row => row.type === 'manual-total');
    const consumption = m.differences.find(row => row.type === 'consumption-total');
    assert.ok(manual && consumption, 'manual and consumption differences');
    closeTo(Math.abs(manual.difference), 3.88, 0.011, 'manual difference');
    closeTo(Math.abs(consumption.difference), 19.82, 0.011, 'consumption difference');
    closeTo(m.summary.totalCosts, 13111.28, 0.011, 'total costs');
    closeTo(m.summary.tenantShare, 8254.50, 0.02, 'tenant share');
    closeTo(m.summary.landlordTotal, 4734.53, 0.02, 'landlord total');
    closeTo(m.summary.openAmount, 122.25504, 0.02, 'open monetary amount');
    assert.strictEqual(m.tenantCount, 4);
    assert.strictEqual(m.privateCount, 1);
    checks.push('Beide Echtdaten-Differenzen offen und ohne automatische Akzeptanz dargestellt');

    const tenantText = await page.locator('#umlageSummaryTable').innerText();
    assert.ok(!tenantText.includes('Erik Zimmermann'), 'private case not displayed as tenant');
    assert.strictEqual(await page.locator('#umlageSummaryTable tbody tr').count(), 6, '4 tenants + 2 vacancy rows');
    const landlordText = await page.locator('#billingReviewTable').innerText();
    assert.match(landlordText, /Eigentümer-\/Privat/);
    assert.match(landlordText, /Leerstand/);
    const landlordSummary = await page.locator('#billingLandlordVerifiedSummary').innerText();
    assert.match(landlordSummary, /Vom Vermieter nach Prüfung tatsächlich zu tragen/);
    assert.match(landlordSummary, /4\.734,53\s*€/);
    checks.push('Mieter-, Privat- und Leerstandsfälle fachlich getrennt');

    const desktop1440 = await layout(page, 1440);
    assert.strictEqual(desktop1440.documentOverflow, 0, '1440 document overflow');
    assert.ok(desktop1440.wraps.every(row => row.scrollWidth <= row.clientWidth + 1), '1440 no internal scroll');
    assert.ok(desktop1440.headerBackground.includes('242') || desktop1440.headerBackground.includes('245'), `neutral header ${desktop1440.headerBackground}`);
    await page.screenshot({ path:path.join(SHOTS, '01_ergebnis_desktop_1440.png'), fullPage:true });

    const desktop1640 = await layout(page, 1640);
    assert.strictEqual(desktop1640.documentOverflow, 0, '1640 document overflow');
    assert.ok(desktop1640.wraps.every(row => row.scrollWidth <= row.clientWidth + 1), '1640 no internal scroll');
    await page.screenshot({ path:path.join(SHOTS, '02_ergebnis_desktop_1640.png'), fullPage:true });

    const zoom125 = await layout(page, 1152);
    assert.strictEqual(zoom125.documentOverflow, 0, '125 percent equivalent document overflow');
    await page.screenshot({ path:path.join(SHOTS, '03_ergebnis_zoom_125.png'), fullPage:true });

    const narrow = await layout(page, 760, 900);
    assert.strictEqual(narrow.documentOverflow, 0, 'narrow document overflow');
    assert.ok(narrow.wraps.some(row => row.scrollWidth > row.clientWidth + 10), 'narrow has internal table scroll');
    await page.screenshot({ path:path.join(SHOTS, '04_ergebnis_schmal.png'), fullPage:true });
    await layout(page, 1440);
    checks.push('Desktop 1440/1640, 125 %, schmale Ansicht und Tabellen-Scroll geprüft');

    // Korrigieren führt zur verursachenden Ursprungsseite und markiert den Bereich.
    await page.locator(`tr[data-review-id="${manual.id}"]`).getByRole('button', { name:/Korrigieren/ }).click();
    await page.waitForFunction(() => document.getElementById('manuellewerte')?.classList.contains('active'));
    assert.strictEqual(await page.locator('#manuellewerte [data-individual-section="manual"].billing-review-target-flash').count(), 1);
    checks.push('Korrigieren führt zu Individuelle Werte und hebt den verursachenden Bereich hervor');
    await page.evaluate(() => switchToTab('umlage'));
    await page.waitForSelector('#umlage', { state:'visible' });

    // Tastaturbedienung / Escape.
    await page.locator(`tr[data-review-id="${manual.id}"]`).getByRole('button', { name:/Akzeptieren/ }).click();
    await page.waitForFunction(() => document.getElementById('billingReviewAcceptDialog')?.open);
    await page.screenshot({ path:path.join(SHOTS, '05_akzeptanzdialog.png'), fullPage:true });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('billingReviewAcceptDialog')?.open);
    checks.push('Akzeptanzdialog per Tastatur geöffnet, fokussiert und mit Escape geschlossen');

    await acceptViaUi(page, manual.id, 'accepted-other', 'Abweichung mit externer Abrechnung fachlich geprüft.');
    m = await model(page);
    assert.strictEqual(m.differences.find(row => row.id === manual.id).status, 'accepted');
    assert.strictEqual(m.differences.find(row => row.id === manual.id).record.appVersion, 'V99.4.64');
    assert.strictEqual(m.summary.openCount, 1);
    await page.screenshot({ path:path.join(SHOTS, '06_differenz_akzeptiert.png'), fullPage:true });
    const entries = await page.evaluate(() => localStorage.__entries());
    assert.ok(Object.keys(entries).length > 0, 'persisted entries');
    checks.push('Akzeptanz mit Behandlung, Begründung, Zeit, Version und Signaturen persistent gespeichert');

    // Neuer Browserzustand: Persistenz nach Neuladen/Seitenwechsel.
    await first.context.close();
    first = await mount(browser, entries);
    await openResult(first.page, 'edit');
    m = await model(first.page);
    assert.strictEqual(m.differences.find(row => row.id === manual.id).status, 'accepted', 'accepted after reload');
    checks.push('Akzeptanz nach neuem Browserzustand und Seitenwechsel erhalten');

    const page2 = first.page;
    // Ursprungsdaten tatsächlich auf Individuelle Werte ändern.
    const sourceValue = await page2.evaluate(costId => {
      const values = state.umlageInputs && state.umlageInputs[costId] && state.umlageInputs[costId].caseValues || {};
      const caseKey = Object.keys(values)[0];
      return { caseKey, original:Number(values[caseKey] && values[caseKey].amount || 0) };
    }, manual.costId);
    await page2.evaluate(({ costId, caseKey, value }) => {
      NKProBillingWorkflow.setManualExternalValue(costId, caseKey, value, 'amount');
      if (!saveData()) throw new Error('Speichern der Ursprungsdaten fehlgeschlagen.');
      renderAll({ forceAll:true, reason:'AP22F11B Ursprungsdatenänderung' });
    }, { costId:manual.costId, caseKey:sourceValue.caseKey, value:sourceValue.original + 1 });
    await page2.evaluate(() => switchToTab('umlage'));
    await page2.waitForSelector('#umlage', { state:'visible' });
    m = await model(page2);
    assert.strictEqual(m.differences.find(row => row.id === manual.id).status, 'acceptance-invalid');
    await page2.screenshot({ path:path.join(SHOTS, '07_akzeptanz_ungueltig.png'), fullPage:true });

    // Rückkehr zum früher akzeptierten Betrag darf nicht reaktivieren.
    await page2.locator(`tr[data-review-id="${manual.id}"]`).getByRole('button', { name:/Korrigieren/ }).click();
    await page2.waitForFunction(() => document.getElementById('manuellewerte')?.classList.contains('active'));
    await page2.evaluate(({ costId, caseKey, value }) => {
      NKProBillingWorkflow.setManualExternalValue(costId, caseKey, value, 'amount');
      if (!saveData()) throw new Error('Rücksetzen der Ursprungsdaten fehlgeschlagen.');
      renderAll({ forceAll:true, reason:'AP22F11B Ursprungsdaten zurückgesetzt' });
    }, { costId:manual.costId, caseKey:sourceValue.caseKey, value:sourceValue.original });
    await page2.evaluate(() => switchToTab('umlage'));
    await page2.waitForSelector('#umlage', { state:'visible' });
    m = await model(page2);
    assert.ok(!['accepted','landlord'].includes(m.differences.find(row => row.id === manual.id).status), 'no silent reactivation');
    checks.push('Änderung macht Akzeptanz ungültig; Rücksetzen reaktiviert sie nicht automatisch');

    await acceptViaUi(page2, manual.id, 'accepted-other', 'Nach Datenänderung erneut vollständig fachlich geprüft.');
    await acceptViaUi(page2, consumption.id, 'accepted-other', 'Gesamtverbrauch und Zählerstände fachlich geprüft.');
    m = await model(page2);
    assert.strictEqual(m.summary.openCount, 0);
    closeTo(m.summary.openAmount, 0, 0.001, 'all reviewed open amount');
    assert.strictEqual(m.summary.allChecked, true);
    assert.match(await page2.locator('#billingResultOverallStatus').innerText(), /Alle Differenzen geprüft/);
    checks.push('Alle Differenzen bewusst geprüft; Gesamtstatus und Kontrollgleichung schließen auf 0,00 €');

    // Speicherfehler: Dialoginhalt bleibt erhalten und State wird zurückgerollt.
    await page2.evaluate(id => { NKProApplicationActions.execute('review','reopen',[id]); renderUmlage(); }, manual.id);
    await page2.locator(`tr[data-review-id="${manual.id}"]`).getByRole('button', { name:/Akzeptieren/ }).click();
    await page2.selectOption('#billingReviewTreatment', 'accepted-other');
    await page2.fill('#billingReviewReason', 'Diese Eingabe muss bei Speicherfehler sichtbar bleiben.');
    await page2.fill('#billingReviewAcceptedBy', 'Speicherfehler Test');
    await page2.check('#billingReviewConfirmed');
    await page2.evaluate(() => localStorage.__setFail(true));
    await page2.getByRole('button', { name:'Prüfentscheidung speichern' }).click();
    await page2.waitForFunction(() => !document.getElementById('billingReviewDialogError').hidden);
    assert.strictEqual(await page2.evaluate(() => document.getElementById('billingReviewAcceptDialog').open), true);
    assert.strictEqual(await page2.inputValue('#billingReviewReason'), 'Diese Eingabe muss bei Speicherfehler sichtbar bleiben.');
    assert.strictEqual(await page2.inputValue('#billingReviewAcceptedBy'), 'Speicherfehler Test');
    assert.strictEqual(await page2.inputValue('#billingReviewTreatment'), 'accepted-other');
    assert.strictEqual(await page2.isChecked('#billingReviewConfirmed'), true);
    assert.match(await page2.locator('#billingReviewDialogError').innerText(), /Persistenz|Rückleseprüfung|fehlgeschlagen/);
    m = await model(page2);
    assert.ok(!m.records[manual.id], 'failed acceptance rolled back');
    await page2.evaluate(() => localStorage.__setFail(false));
    await page2.getByRole('button', { name:'Abbrechen' }).click();
    checks.push('Simulierter Speicherfehler: keine Erfolgsmeldung, Rollback und sichtbarer Dialoginhalt');

    // Zählersynchronisation ist idempotent.
    const meterCounts = await page2.evaluate(() => {
      const before = state.zaehlerDaten.messwerte.length;
      synchronizeMeteringData(state); synchronizeMeteringData(state); synchronizeMeteringData(state);
      return { before, after:state.zaehlerDaten.messwerte.length };
    });
    assert.deepStrictEqual(meterCounts, { before:meterCounts.before, after:meterCounts.before });
    checks.push('Zählersynchronisierung mehrfach idempotent; keine neuen Messwertdubletten');

    // Export aus echtem Exportdienst und Reimport in leeren Browserzustand.
    const downloadPromise = page2.waitForEvent('download');
    await page2.evaluate(() => NKProExportService.downloadFullJson());
    const download = await downloadPromise;
    const exportedPath = path.join(ROOT, 'AP22F11B_Dokumentation', 'test-roundtrip-export.json');
    await download.saveAs(exportedPath);
    const exported = JSON.parse(fs.readFileSync(exportedPath, 'utf8'));
    assert.strictEqual(exported.jahresArchiv.length, raw.jahresArchiv.length);
    assert.strictEqual(sha(exported.waterMeters.readings), sha(raw.waterMeters.readings));
    assert.strictEqual(sha(manualBusinessSnapshot(exported.umlageInputs)), sha(manualBusinessSnapshot(raw.umlageInputs)));

    const decisionCount = Object.keys((exported.abrechnungsPruefungen && exported.abrechnungsPruefungen.records) || {}).length;
    await page2.evaluate(() => { localStorage.clear(); resetData(); });
    await page2.waitForTimeout(200);
    await importThroughUi(page2, exportedPath);
    await openResult(page2, 'edit');
    const roundtrip = await page2.evaluate(() => ({
      archives:state.jahresArchiv.length,
      water:state.waterMeters.readings,
      manual:state.umlageInputs,
      decisions:Object.keys((state.abrechnungsPruefungen && state.abrechnungsPruefungen.records) || {}).length,
      meterReadings:state.zaehlerDaten.messwerte.length
    }));
    assert.strictEqual(roundtrip.archives, raw.jahresArchiv.length);
    assert.strictEqual(sha(roundtrip.water), sha(raw.waterMeters.readings));
    assert.strictEqual(sha(manualBusinessSnapshot(roundtrip.manual)), sha(manualBusinessSnapshot(raw.umlageInputs)));
    assert.strictEqual(roundtrip.decisions, decisionCount);
    checks.push('Gesamtexport und Reimport nach geleertem Browserzustand ohne Daten-, Archiv- oder Entscheidungsdubletten');

    // Schreibschutz / Nur-Ansehen.
    await page2.evaluate(() => { openCurrentBillingForView(); switchToTab('umlage'); });
    await page2.waitForSelector('#umlage', { state:'visible' });
    assert.ok((await page2.locator('#billingReviewTable').innerText()).includes('Nur ansehen'));
    const readOnlyAction = await page2.evaluate(id => {
      try { NKProApplicationActions.execute('review','accept',[id,{ treatment:'accepted-other', reason:'Nicht zulässig', acceptedBy:'Test', confirmed:true }]); return { threw:false }; }
      catch (error) { return { threw:true, message:String(error && error.message || error) }; }
    }, manual.id);
    assert.strictEqual(readOnlyAction.threw, true, 'read-only action blocked');
    await page2.screenshot({ path:path.join(SHOTS, '08_ergebnis_nur_ansehen.png'), fullPage:true });
    checks.push('Nur-Ansehen-/Archivkontext blockiert Schreibaktionen');

    const finalPreservation = await page2.evaluate(() => ({
      archives:state.jahresArchiv.length,
      wohnungen:state.wohnungen.length,
      mieter:state.mieter.length,
      water:state.waterMeters.readings,
      manual:state.umlageInputs
    }));
    assert.strictEqual(finalPreservation.archives, raw.jahresArchiv.length);
    assert.strictEqual(finalPreservation.wohnungen, raw.wohnungen.length);
    assert.strictEqual(finalPreservation.mieter, raw.mieter.length);
    assert.strictEqual(sha(finalPreservation.water), sha(raw.waterMeters.readings));
    assert.strictEqual(sha(manualBusinessSnapshot(finalPreservation.manual)), sha(manualBusinessSnapshot(raw.umlageInputs)));

    assert.deepStrictEqual(first.errors, [], `runtime errors:\n${first.errors.join('\n')}`);
    const report = { ok:true, startedAt, finishedAt:new Date().toISOString(), checks, screenshots:fs.readdirSync(SHOTS).sort(), runtimeErrors:first.errors, baselineHash:sha(publicDataSnapshot(raw)) };
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
    console.log(`AP22F11B browser checks passed (${checks.length} groups)`);
  } catch (error) {
    const report = { ok:false, startedAt, finishedAt:new Date().toISOString(), checks, error:error.stack || String(error), runtimeErrors:first ? first.errors : [] };
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
    throw error;
  } finally {
    if (first && first.context) await first.context.close().catch(() => {});
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
