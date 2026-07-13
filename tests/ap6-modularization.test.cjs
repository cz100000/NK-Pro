"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const modules = {
  billingCalculation:"js/billing-calculation.js",
  documentData:"js/document-data.js",
  documentRenderer:"js/document-renderer.js",
  exportService:"js/export-service.js",
  uiTableTools:"js/ui-table-tools.js",
  appBootstrap:"js/app-bootstrap.js",
  compatibility:"js/compatibility.js",
  uiPreferences:"js/ui-preferences.js"
};

function loadModule(relative, context = {}) {
  const sandbox = { console, ...context };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read(relative), sandbox, { filename:relative });
  return sandbox;
}

function main() {
  const app = read("js/app.js");
  const html = read("index.html");
  const appLines = app.split(/\r?\n/).length;
  assert(appLines < 300, `app.js ist nicht auf Start und Orchestrierung begrenzt (${appLines} Zeilen).`);

  Object.entries(modules).forEach(([name, relative]) => {
    const source = read(relative);
    assert(source.includes("Object.freeze"), `${name} exportiert keine feste Schnittstelle.`);
  });

  const billing = read(modules.billingCalculation);
  assert(!/\bdocument\b|\bwindow\b|\blocalStorage\b|\bindexedDB\b/.test(billing), "Berechnungsmodul enthält UI- oder Speicherzugriffe.");
  const documentData = read(modules.documentData);
  assert(!/\bdocument\b|\blocalStorage\b|\bindexedDB\b/.test(documentData), "Dokumentdatenmodul enthält DOM- oder Speicherzugriffe.");

  const wrapperChecks = [
    ["calculateUmlage", "billingCalculation", "js/ui-billing-allocation.js"],
    ["prepaymentAdjustmentData", "billingCalculation", "js/ui-documents.js"],
    ["briefCostRows", "documentData", "js/ui-documents.js"],
    ["buildBriefHtml", "documentRenderer", "js/ui-documents.js"],
    ["downloadFullExportPackage", "exportService", "js/browser-io.js"],
    ["enhanceTables", "uiTableTools", "js/ui-table-actions.js"]
  ];
  wrapperChecks.forEach(([fn, moduleName, relative]) => {
    const expected = `function ${fn}(...args) { return NK_PRO_MODULES.${moduleName}.${fn}(...args); }`;
    assert(read(relative).includes(expected), `Kompatibilitätsweiterleitung fehlt oder enthält Parallelfachlogik: ${fn}.`);
    assert(app.includes(`"${fn}"`), `Kompatibilitätsweiterleitung ist nicht explizit registriert: ${fn}.`);
  });
  assert(!app.includes('"allocationForCost"'), "Entfernter Legacy-Wrapper allocationForCost ist noch registriert.");

  const productiveJs = fs.readdirSync(path.join(root, "js")).filter(name => name.endsWith(".js"));
  const storageUsers = productiveJs.filter(name => /\blocalStorage\b/.test(read(`js/${name}`))).sort();
  assert(JSON.stringify(storageUsers) === JSON.stringify(["persistence.js", "ui-preferences.js"]), `Unerlaubte direkte Speicherzugriffe: ${storageUsers.join(", ")}`);

  const scripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  const appIndex = scripts.indexOf("./js/app.js");
  Object.values(modules).forEach(relative => {
    const script = `./${relative}`;
    assert(scripts.includes(script), `${script} fehlt in der produktiven Ladefolge.`);
    assert(scripts.indexOf(script) < appIndex, `${script} wird nicht vor app.js geladen.`);
  });

  const billingContext = loadModule(modules.billingCalculation, {
    num:value => Number(value || 0),
    visibleTenantRows:() => [],
    state:{ wohnungen:[], mieter:[], kostenarten:[] },
    allocationDistributionStatus:value => Math.abs(Number(value || 0)) < 0.01 ? "Vollständig" : "Restbetrag"
  });
  const billingApi = billingContext.NKProBillingCalculation;
  assert(Object.isFrozen(billingApi), "Berechnungs-API ist nicht eingefroren.");
  assert(billingApi.normalizeActiveDayValue("1900-12-30") === 365, "Legacy-Tagekonvertierung wurde verändert.");
  const allocation = billingApi.allocateByWohneinheiten(120, [
    { originalIndex:0, wohnung:"W1", aktiveTage:200 },
    { originalIndex:1, wohnung:"W1", aktiveTage:165 },
    { originalIndex:2, wohnung:"W2", aktiveTage:365 }
  ], [{ id:"W1" }, { id:"W2" }]);
  assert(Math.abs(allocation.allocations[0] - (60 * 200 / 365)) < 1e-9, "Wohneinheitenverteilung wurde verändert.");
  assert(Math.abs(allocation.allocations[2] - 60) < 1e-9, "Wohneinheitenverteilung der zweiten Einheit wurde verändert.");
  assert(billingApi.roundMonthlyPrepayment(42.49, { roundingMode:"1 EUR" }) === 43, "Vorauszahlungsrundung wurde verändert.");

  const prefStorage = new Map();
  const storage = {
    getItem:key => prefStorage.has(key) ? prefStorage.get(key) : null,
    setItem:(key, value) => prefStorage.set(String(key), String(value)),
    removeItem:key => prefStorage.delete(String(key))
  };
  const preferenceContext = loadModule(modules.uiPreferences, { localStorage:storage });
  assert(preferenceContext.NKProUiPreferences.setBoolean("x", true), "UI-Einstellung konnte nicht gespeichert werden.");
  assert(preferenceContext.NKProUiPreferences.getBoolean("x") === true, "UI-Einstellung konnte nicht gelesen werden.");

  const bootstrapContext = loadModule(modules.appBootstrap);
  const sequence = [];
  const startup = bootstrapContext.NKProAppBootstrap.start([
    { name:"eins", run:() => sequence.push(1) },
    { name:"zwei", run:() => sequence.push(2) }
  ]);
  assert(startup.ok && sequence.join(",") === "1,2", "Startorchestrierung hält die Reihenfolge nicht ein.");

  const compatibilityContext = loadModule(modules.compatibility);
  compatibilityContext.NKProCompatibility.registerModule("probe", Object.freeze({ run() {} }), ["run"]);
  assert(compatibilityContext.NKProCompatibility.has("probe", "run"), "Kompatibilitätsregistry ist unvollständig.");

  process.stdout.write(`AP6-Architekturprüfung abgeschlossen: app.js ${appLines} Zeilen, feste Modulschnittstellen, reine Berechnung, zentralisierte Speicherzugriffe und geordneter Start sind konsistent.\n`);
}

try { main(); } catch(error) { process.stderr.write(`FEHLER: ${error.message}\n`); process.exit(1); }
