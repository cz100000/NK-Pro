"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const assert=(value,message)=>{if(!value)throw new Error(message);};
const html=read("index.html"),navigation=read("js/navigation.js"),diagnostics=read("js/diagnostics.js");
assert(html.includes('data-navigation-render-root=""'),"Neutrales Render-Ziel der Navigation fehlt.");
assert(!html.includes('class="tab-btn nav-group-item"'),"Sichtbare Navigation ist weiterhin statisch in index.html dupliziert.");
assert(navigation.includes("const NAVIGATION_GROUPS = Object.freeze("),"Zentrale Navigationsdefinition fehlt.");
assert(navigation.includes("function renderNavigationMarkup()"),"Zentraler Navigationsrenderer fehlt.");
assert(navigation.includes("navigationDefinition")&&navigation.includes("visibleTabIds"),"Lesende Navigationsschnittstelle fehlt.");
assert(navigation.includes("COMPATIBILITY_TAB_PATHS"),"Kompatible Direkteinstiege sind nicht zentral abgebildet.");
assert(diagnostics.includes('navigation.navigationDefinition()')&&diagnostics.includes('navigation.visibleTabIds()'),"Diagnose nutzt nicht die zentrale Navigationsdefinition.");
assert(!diagnostics.includes('const expected = ["objekt","wohnungsverwaltung"'),"Diagnose enthält weiterhin eine zweite Menüdefinition.");
const labels=[...navigation.matchAll(/"label":\s*"([^"]+)"/g)].map(match=>match[1]);
assert(JSON.stringify(labels)===JSON.stringify([
  "Objekt vorbereiten","Objektdaten","Wohnungen","Zähler","Mietverhältnisse",
  "Nebenkosten abrechnen","Übersicht","Mietverhältnisse","Vorauszahlungen","Gesamtkosten",
  "Individuelle Werte","Abrechnungsergebnis","Vorauszahlungen anpassen","Prüfen und abschließen","Briefe",
  "Analyse","Auswertungen","Regelinventar","Archiv","Archivübersicht"
]),"Zentrale Gruppen- und Eintragsreihenfolge ist falsch.");
process.stdout.write("AP21B2-Strukturprüfung bestanden: Navigation, Reihenfolge, Direkteinstiege und Diagnose besitzen eine zentrale Quelle.\n");
