"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function load(relative, context = {}) {
  const sandbox = { console, ...context };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read(relative), sandbox, { filename:relative });
  return sandbox;
}

function main() {
  const html = read("index.html");
  const app = read("js/app.js");
  const controller = read("js/ui-controller.js");
  const bindings = read("js/ui-bindings.js");
  const events = read("js/ui-events.js");
  const stateAccess = read("js/state-access.js");
  const navigation = read("js/navigation.js");
  const modal = read("js/modal-events.js");

  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html + "\n" + app), "Inline-Event-Handler sind noch vorhanden.");
  assert(!/data-app-action/.test(html + "\n" + app), "Veraltete data-app-action-Bindungen sind noch vorhanden.");
  assert((html.match(/data-ui-(?:action|change|input|submit|keydown)=/g) || []).length >= 50, "Statische UI-Aktionen sind nicht vollständig deklarativ gebunden.");
  assert(!/\b(document|localStorage|indexedDB)\b/.test(controller), "UI-Controller-Registry enthält DOM- oder Speicherzugriffe.");
  assert(!/\b(document|window|localStorage|indexedDB)\b/.test(stateAccess), "State-Access-Modul enthält DOM- oder Speicherzugriffe.");
  assert(!/calculateUmlage|allocationForCost|prepaymentAdjustmentData/.test(bindings), "UI-Bindings enthalten parallele Abrechnungslogik.");
  assert(events.includes("data-ui-action") && events.includes("data-ui-change") && events.includes("data-ui-keydown"), "Zentraler Ereignisvertrag ist unvollständig.");
  assert(!/window\.(?:refreshWorkspaceChrome|ensureNavigationPath|updateWorkflowNavigationContext|applyNavTreeState|setOpenNavigationGroup)\s*=/.test(navigation), "Entfernte globale Navigationswrapper sind wieder vorhanden.");
  assert(modal.includes('dispatch("cost.closeSelectionDialog"'), "Modalereignisse verwenden den Controller nicht.");
  assert(!/addEventListener\s*\(/.test(app), "app.js registriert weiterhin eigene DOM-Ereignisse.");

  const uiContext = load("js/ui-controller.js");
  vm.runInContext(read("js/application-actions.js"), uiContext, { filename:"js/application-actions.js" });
  vm.runInContext(read("js/ui-bindings.js"), uiContext, { filename:"js/ui-bindings.js" });
  const noop = () => undefined;
  const handlerNames = [...bindings.matchAll(/call\(handlers,\s*"([^"]+)"\)|requireHandler\(handlers,\s*"([^"]+)"\)/g)].map(match => match[1] || match[2]);
  const handlers = Object.fromEntries([...new Set(handlerNames)].map(name => [name, noop]));
  uiContext.location = { reload:noop };
  uiContext.print = noop;
  uiContext.NKProApplicationActions.configure({ application:{save:noop,reset:noop}, state:{setNested:noop}, object:{addMasterTenancy:noop,applyMasterDataToBilling:noop,archiveMasterTenancy:noop,restoreMasterTenancy:noop,setBillingUnitStatus:noop,setMasterNested:noop}, billing:{finalize:noop,unlock:noop,setYear:noop,setPeriod:noop,resetAllocationInputs:noop,setManualInputMode:noop,setManualExternalValue:noop,setPrepaymentValue:noop,setPrepaymentAdjustmentSetting:noop}, meter:{setWaterValue:noop,setGenericValue:noop,setWaterSetting:noop} });
  uiContext.NKProUiBindings.register({ handlers, modules:{ exportService:new Proxy({}, { get:() => noop }), applicationActions:uiContext.NKProApplicationActions } });
  const definitions = uiContext.NKProUiController.describe();
  const actionNames = definitions.flatMap(definition => definition.actionNames);
  assert(definitions.length === 13, `Erwartet wurden 13 Controller, gefunden ${definitions.length}.`);
  assert(actionNames.length === 104 && new Set(actionNames).size === 104, `UI-Aktionsregister ist unvollständig oder doppelt (${actionNames.length}).`);
  ["meter.setWaterValue", "billing.setPrepaymentValue", "document.printCurrentBrief", "export.downloadBillingPackage", "recovery.restorePreMigration"].forEach(action => assert(uiContext.NKProUiController.hasAction(action), `Pflichtaktion fehlt: ${action}`));

  const scripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  const appIndex = scripts.indexOf("./js/app.js");
  ["./js/state-access.js", "./js/ui-controller.js", "./js/ui-bindings.js", "./js/ui-events.js", "./js/navigation.js", "./js/modal-events.js"].forEach(script => {
    assert(scripts.includes(script) && scripts.indexOf(script) < appIndex, `UI-Modul fehlt oder wird zu spät geladen: ${script}`);
  });

  process.stdout.write(`AP7-UI-Architekturprüfung abgeschlossen: 130 Inline-Handler entfernt, 13 Controller, 104 eindeutige Aktionen, zentraler 5-Ereignis-Vertrag und keine DOM-Ereignisregistrierung in app.js.\n`);
}

try { main(); } catch(error) { process.stderr.write(`FEHLER: ${error.message}\n`); process.exit(1); }
