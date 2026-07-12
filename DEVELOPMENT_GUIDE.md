# NK-Pro – Entwicklungsleitfaden

**Aktueller Umsetzungsstand:** V99.4.1, Datenschema 5

## 1. Quellenhierarchie

1. tatsächlich bereitgestellte und ausdrücklich verbindliche ZIP,
2. `NK-PRO-PROJEKTSTAND.md`,
3. `NK-PRO-ARBEITSREGELN.md`,
4. tatsächlicher Quellcode, Tests und Referenzdaten dieser ZIP,
5. aktuelle Architektur-, UX-, Roadmap- und Tech-Debt-Dokumente.

Frühere Chats, Erinnerungen, ältere ZIPs und ausgelagerte historische Dokumente sind keine technische Quelle.

## 2. Technische Leitplanken

NK-Pro bleibt eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright sind ausschließlich Entwicklungs- und Prüfwerkzeuge.

## 3. Prüftiefe

### Vollanalyse

Nur bei unbekannter Ausgangsversion, grundlegender Architekturänderung, beschädigtem Paket oder widersprüchlichen Versionsangaben.

### Bereichsanalyse

Normalfall. Untersucht werden nur betroffene Dateien, Funktionen, Datenfelder, Persistenzpfade und Tests.

### Abschlussprüfung

Syntax, Referenzdaten, Versionskonsistenz, betroffene Browserregressionen, Dokumentation und SHA-256-Summen.

## 4. Änderungsklassen

- **A – Dokumentation:** keine Produktivlogik.
- **B – UI ohne Datenwirkung:** bestehende Funktionen und Datenverträge bleiben unverändert.
- **C – Fachlogik ohne Schemaänderung:** fachliche Regressionen und Referenzwerte erforderlich.
- **D – Datenmodell, Archiv, Migration oder Austauschformat:** Variantenvergleich, ausdrückliche Freigabe, Migration, Rückweg und vollständige Tests erforderlich.

## 5. Stop-Regel

Vor Änderungen an Datenmodell, Archiv, Migration, Berechnung, Zählern, Kostenarten, Umlageschlüsseln, Sicherung oder Import/Export sind zuerst zu dokumentieren:

1. Ist-Zustand,
2. Auswirkungen,
3. mindestens zwei Lösungswege,
4. Vor- und Nachteile,
5. Empfehlung,
6. Migration und Rückweg,
7. Teststrategie.

Ohne ausdrückliche Freigabe keine Schema- oder Austauschformatänderung.

## 6. Technischer Ablauf

1. Ausgangs-ZIP unverändert sichern.
2. Version und Dateiinventar verifizieren.
3. Baseline-Prüfungen ausführen.
4. Änderungsklasse und Stop-Regel bestimmen.
5. kleinsten tragfähigen Patch umsetzen.
6. gezielte Tests ergänzen.
7. relevante Gesamttests ausführen.
8. Projektstand, Changelog und Prüfnachweis aktualisieren.
9. temporäre Dateien entfernen.
10. SHA-256-Summen und neue ZIP erzeugen.

## 7. Datenlastige Dateien

`js/default-seed.js` und `testdaten/basis/standardfall.json` sind große Datenbasen. Sie werden nur bei einem tatsächlich datenbezogenen Auftrag vollständig untersucht. Fachcode liegt in `js/app.js`; Referenzfälle werden ausschließlich über `tests/fixture-loader.cjs` geladen.

## 8. Pflichtbefehle

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

## 9. Definition of Done

- Änderungen entsprechen dem freigegebenen Arbeitspaket,
- keine unbeabsichtigte Daten- oder Formatänderung,
- relevante Tests sind grün oder eine Umgebungsgrenze ist ausdrücklich dokumentiert,
- Versionen und PWA-Cache sind konsistent,
- Projektstand und Restrisiken sind aktuell,
- ZIP enthält keine Abhängigkeiten, Testartefakte oder temporären Dateien.
