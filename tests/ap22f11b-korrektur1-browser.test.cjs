const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/mnt/data/ap22f11b_workspace/source/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const DATA = '/mnt/data/nk-pro-gesamtbestand-2025-V99.4.58-2026-07-19-16-16-12(3).json';
const ORIGIN = 'http://nkpro-ap22f11b-k1.test';
const SHOT_DIR = path.join(ROOT, 'AP22F11B_Korrektur1_Screenshots');

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:'/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport:{ width:760, height:980 } });
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  await page.route(`${ORIGIN}/**`, async route => {
    const url = new URL(route.request().url());
    const rel = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '').split('?')[0];
    const file = path.resolve(ROOT, rel);
    const types={'.css':'text/css','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
    if (!file.startsWith(ROOT+path.sep) || !fs.existsSync(file)) return route.fulfill({status:404,body:'not found'});
    return route.fulfill({status:200,contentType:types[path.extname(file).toLowerCase()]||'text/html',body:fs.readFileSync(file)});
  });
  await page.evaluate(() => {
    const store=new Map();
    const mock={get length(){return store.size},key(i){return [...store.keys()][i]??null},getItem(k){return store.get(String(k))??null},setItem(k,v){store.set(String(k),String(v))},removeItem(k){store.delete(String(k))},clear(){store.clear()}};
    Object.defineProperty(window,'localStorage',{value:mock,configurable:true});
    window.alert=()=>{}; window.confirm=()=>true;
  });
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8').replace(/<head>/i,`<head><base href="${ORIGIN}/">`);
  await page.setContent(html,{waitUntil:'load'});
  await page.waitForFunction(() => globalThis.NKProBillingReview && typeof state !== 'undefined');
  await page.setInputFiles('#jsonImport',DATA);
  await page.waitForFunction(() => state && state.meta && state.meta.abrechnungsjahr==='2025' && Array.isArray(state.kostenarten) && state.kostenarten.some(k => k && k.id==='K006' && Math.abs(Number(k.gesamtbetrag)-9965.97)<0.001));
  await page.evaluate(() => { openCurrentBillingForEdit(); switchToTab('umlage'); });
  await page.waitForSelector('#umlage.active #billingReviewTable tbody tr');

  const toolbar=await page.evaluate(() => {
    const search=document.querySelector('#umlage .billing-result-search').getBoundingClientRect();
    const select=document.getElementById('billingResultStatusFilter').getBoundingClientRect();
    return {search:{x:search.x,y:search.y,w:search.width,h:search.height},select:{x:select.x,y:select.y,w:select.width,h:select.height}};
  });
  assert.ok(toolbar.search.w > 300, `search width ${toolbar.search.w}`);
  assert.ok(toolbar.select.y >= toolbar.search.y + toolbar.search.h - 1, 'status filter must be below search at narrow width');

  const moneyAlignment=await page.evaluate(() => {
    const tables=['#umlageSummaryTable','#billingReviewTable'];
    return tables.flatMap(selector => [...document.querySelectorAll(`${selector} .billing-result-number`)].map(el => ({text:el.textContent.trim(),align:getComputedStyle(el).textAlign})));
  });
  assert.ok(moneyAlignment.length > 10, 'numeric cells found');
  assert.ok(moneyAlignment.every(row => row.align==='right'), JSON.stringify(moneyAlignment.filter(row => row.align!=='right').slice(0,5)));

  const combinedText=await page.locator('#billingReviewTable').innerText();
  assert.match(combinedText,/Noch zu prüfen/);
  assert.match(combinedText,/Geprüft und dem Vermieter zugeordnet/);
  assert.match(combinedText,/Privatanteil/);
  assert.match(combinedText,/Leerstandskosten/);
  assert.strictEqual(await page.locator('#billingResultLandlordTable').count(),0,'separate landlord table removed');

  const before=await page.evaluate(() => NKProBillingReview.currentModel(state));
  const landlordSummaryBefore=await page.locator('#billingLandlordVerifiedSummary').innerText();
  assert.match(landlordSummaryBefore,/Vom Vermieter nach Prüfung tatsächlich zu tragen/);
  assert.match(landlordSummaryBefore,/Vorläufiger Betrag/);
  assert.match(await page.locator('#billingControlEquation').innerText(),/Abgleich-Saldo/);

  fs.mkdirSync(SHOT_DIR,{recursive:true});
  await page.screenshot({path:path.join(SHOT_DIR,'01_ergebnis_760_zusammengefuehrt.png'),fullPage:true});

  const diff=before.differences[0];
  const row=page.locator(`tr[data-review-id="${diff.id}"]`);
  await row.getByRole('button',{name:/Akzeptieren/}).click();
  await page.selectOption('#billingReviewTreatment','landlord-other');
  await page.fill('#billingReviewReason','Fachlich geprüft und als sonstiger Vermieteranteil bestätigt.');
  await page.fill('#billingReviewAcceptedBy','Korrekturtest');
  await page.check('#billingReviewConfirmed');
  await page.getByRole('button',{name:'Prüfentscheidung speichern'}).click();
  await page.waitForFunction(() => !document.getElementById('billingReviewAcceptDialog').open);

  const after=await page.evaluate(() => NKProBillingReview.currentModel(state));
  assert.ok(after.summary.landlordTotal > before.summary.landlordTotal,'landlord acceptance increases verified landlord total');
  assert.ok(Math.abs((after.summary.landlordTotal-before.summary.landlordTotal)-diff.monetaryAmount)<0.02,'verified landlord total uses accepted landlord amount');
  const landlordSummaryAfter=await page.locator('#billingLandlordVerifiedSummary').innerText();
  assert.match(landlordSummaryAfter,/Sonstige bestätigte Anteile/);

  await page.locator(`tr[data-review-id="${diff.id}"]`).getByRole('button',{name:'Details'}).click();
  await page.waitForFunction(() => document.getElementById('billingReviewDetailDialog').open);
  assert.strictEqual(await page.locator('#billingReviewDetail').count(),0,'no inline detail element');
  const detailText=await page.locator('#billingReviewDetailBody').innerText();
  assert.match(detailText,/Berechneter Wert/);
  assert.match(detailText,/Kontrollwert/);
  assert.match(detailText,/Aktueller Prüfstatus/);
  assert.match(detailText,/Fachlich geprüft und als sonstiger Vermieteranteil bestätigt/);
  assert.strictEqual(await page.getByRole('button',{name:'Prüfentscheidung ändern'}).isVisible(),true);
  await page.screenshot({path:path.join(SHOT_DIR,'02_pruefentscheidung_details_popup.png'),fullPage:true});

  await page.getByRole('button',{name:'Prüfentscheidung ändern'}).click();
  await page.waitForFunction(() => document.getElementById('billingReviewAcceptDialog').open && !document.getElementById('billingReviewDetailDialog').open);
  await page.keyboard.press('Escape');

  assert.deepStrictEqual(errors,[]);
  await browser.close();
  console.log('AP22F11B Korrektur 1 browser checks passed');
})().catch(error => { console.error(error); process.exitCode=1; });
