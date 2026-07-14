"use strict";

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const html = read("index.html");
const css = read("assets/app.css");
const runtime = read("js/app-runtime-config.js");
const controller = read("js/ui-page-controller.js");
const navigation = read("js/navigation.js");
const worker = read("service-worker.js");
const project = JSON.parse(read("nk-pro-project.json"));
const packageJson = JSON.parse(read("package.json"));

assert(packageJson.version === "99.4.23" && packageJson.name === "nk-pro-v99-4-23", "Aktuelle Paketversion ist inkonsistent.");
assert(project.appVersion === "99.4.23" && project.basedOn === "99.4.22-AP19", "Aktuelle Projektbasis ist inkonsistent.");
assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenschema oder Datenebenenvertrag wurde verändert.");
assert(project.documentLayoutVersion === 4, "AP13-Dokumentlayout wurde verändert.");
assert(project.navigationDesignSystemVersion === 5 && project.uiVisualSystemVersion === 4, "AP17-UI-Metadaten fehlen.");
assert(project.areaDashboardVersion === 2 && project.globalBillingContextVersion === 2 && project.productiveDashboardVersion === 1, "Produktive Dashboard-/Kontextversion fehlt.");
assert(project.pwaCacheName === "nk-pro-v99-4-23-ap20-corr1", "Aktuelle PWA-Cachemetadaten fehlen.");

assert(runtime.includes('const APP_VERSION = "V99.4.23";'), "Aktuelle Laufzeitversion fehlt.");
assert(runtime.includes('const APP_VERSION_NAME = "AP20-Zentrales Prüf-, Plausibilitäts- und Freigabesystem";'), "Aktueller Laufzeitname fehlt.");
assert(html.includes("NK-Pro V99.4.23 – AP20-Zentrales Prüf-, Plausibilitäts- und Freigabesystem"), "Aktueller HTML-Titel fehlt.");
assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-23-ap20-corr1";'), "Aktueller Service-Worker-Cache fehlt.");

const navTabs = [...html.matchAll(/class="tab-btn nav-group-item[^"]*"[^>]*data-tab="([^"]+)"/g)].map(match => match[1]);
const expectedTabs = ["objektuebersicht","objekt","wohnungsverwaltung","wasser","mieterverwaltung","start","mieter","einnahmen","einstellungen","manuellewerte","verbraeuche","umlage","qualitaet","vorauszahlungsanpassung","briefe","export","archiv","sicherung"];
assert(JSON.stringify(navTabs) === JSON.stringify(expectedTabs), `AP17-Navigationsreihenfolge ist falsch: ${navTabs.join(", ")}`);
assert(navTabs.length === 18 && new Set(navTabs).size === 18, "AP17 benötigt 18 eindeutige Navigationsziele.");
assert((html.match(/data-area-dashboard=/g) || []).length === 2, "AP17 benötigt genau zwei Bereichs-Dashboards.");
assert(html.includes('data-area-dashboard="object"') && html.includes('data-area-dashboard="billing"'), "Objekt- oder Abrechnungsdashboard fehlt.");
assert(!html.includes("overview-grid"), "Generische AP16-Kachelraster sind noch vorhanden.");
assert(html.includes("Hinweis zu Vorschauwerten") === false, "Dynamische Dashboardhinweise dürfen nicht als statische Dublette vorliegen.");
assert(!controller.includes("fiktiv"), "Produktive Dashboards enthalten noch fiktive Vorschauwerte.");
assert(controller.includes("productiveDashboardValues") && controller.includes('querySelectorAll(\'[data-value-kind="dummy"]\').length===1'), "Produktiv-/DUMMY-Audit ist nicht auf AP19 festgelegt.");
assert(controller.includes("const rules=[") && controller.includes('groupRule("letters"') && controller.includes("centralGroup"), "Zentrale produktive Prüfregeln fehlen.");
assert(controller.includes("billingWorkflowEntries") && controller.includes("length===11"), "Elf Abrechnungsdirekteinstiege werden nicht geprüft.");
assert(controller.includes("objectDirectEntries") && controller.includes("length===4"), "Vier Objektdirekteinstiege werden nicht geprüft.");

assert(!html.includes("data-nav-billing-context-panel"), "Der alte Navigationsbereich Aktive Abrechnung ist noch vorhanden.");
for (const marker of ["data-global-billing-context", "data-global-billing-object", "data-global-billing-year", "data-global-billing-status"]) {
  assert(html.includes(marker), `Globale Kontextleiste enthält ${marker} nicht.`);
}
assert(html.includes('data-ui-action="billing.closeContext"') && html.includes(">Abrechnung schließen</button>"), "Kontrolliertes Schließen des Abrechnungskontexts fehlt.");

assert(navigation.includes('const NAV_GROUP_STORAGE_KEY = "nkpro.workflowNavigation.v4";'), "AP17-Navigationsspeicher v4 fehlt.");
assert(navigation.includes("let openGroups = loadOpenGroups()"), "Unabhängige Navigationszustände fehlen.");
assert(navigation.includes("openGroups.add(key)") && navigation.includes("openGroups.delete(key)"), "Navigationsgruppen werden nicht unabhängig verwaltet.");
assert(navigation.includes("ensureNavigationPath") && navigation.includes("setGroupExpanded(group, true, false)"), "Aktive Unterseiten öffnen ihre Gruppe nicht automatisch.");
assert(navigation.includes("aria-expanded") && navigation.includes("toggleGroup"), "ARIA- oder Klapplogik fehlt.");

const sectionChevrons = (html.match(/page-section__chevron-svg/g) || []).length;
assert(sectionChevrons >= 20, `Zu wenige lokale Klappbox-Chevrons: ${sectionChevrons}.`);
assert(!html.includes('class="page-section__chevron">▾') && !html.includes('class="page-section__chevron">▶'), "Textpfeile sind noch vorhanden.");
assert(css.includes(".page-section__chevron-svg") && css.includes("transform:rotate(90deg)"), "SVG-Chevron-Animation fehlt.");
assert(css.includes(".global-billing-context") && css.includes(".dashboard-value-card") && css.includes(".billing-context-guidance"), "Kontext-/Dashboardstil fehlt.");
assert(css.includes("padding:2px 2px 10px"), "Inhaltskopfzeilen wurden nicht ausreichend komprimiert.");

const billingStart = html.indexOf('data-nav-group-section="billing"');
const billingEnd = html.indexOf('data-nav-group-section="archive"');
const billingFragment = html.slice(billingStart, billingEnd);
assert((billingFragment.match(/nav-icon-svg/g) || []).length >= 12, "Abrechnungsnavigation verwendet nicht durchgängig lokale SVG-Icons.");
assert(!/[😀-🙏]/u.test(billingFragment), "Emoji in der Abrechnungsnavigation erkannt.");

for (const file of [
  "AP17_BEREICHS_DASHBOARDS_NAVIGATIONSLOGIK_UND_UI_BEREINIGUNG.md",
  "AP17_PRUEFBERICHT.md",
  "AP17_TEST_RESULTS.json",
  "AP17_DATEIAENDERUNGEN.md",
  "AP17_DATEIAENDERUNGEN.json",
  "tests/ap17-area-dashboards.spec.js"
]) assert(fs.existsSync(path.join(root, file)), `${file} fehlt.`);

process.stdout.write("AP17-/AP19-Dashboardprüfung abgeschlossen: zwei produktive Bereichs-Dashboards, genau ein Zähler-DUMMY, zentrale Prüfregeln, globale Kontextleiste, unabhängige Navigation und lokale SVG-Icons sind konsistent.\n");
