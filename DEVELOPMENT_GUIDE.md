<!-- AP9-CURRENT -->
# Entwicklungshinweise V99.4.10

Neue fachliche UI-Aktionen sind als DOM-freie Operation in einem zuständigen Anwendungsmodul zu implementieren, über `application-actions.js` zu registrieren und in `ui-bindings.js` zu präsentieren. Direkte Speicherung, Rendering, Dialoge oder Navigation sind in Anwendungsmodulen unzulässig. Schreibaktionen verwenden `NKProStateAccess.transact()` und höchstens einen zentralen Commit.

# NK-Pro – Entwicklungsleitfaden

**Aktueller Umsetzungsstand:** V99.4.9, Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandard 1, Snapshot 2, Architektur 2

## 1. Quellenhierarchie

Maßgeblich sind ausschließlich die freigegebene Versions-ZIP, der darin enthaltene Quellcode, die Projektdokumente und automatisierten Tests.

## 2. Leitplanken

- HTML, CSS und JavaScript ohne Framework oder Buildsystem,
- DOM-Ereignisse ausschließlich über deklarative `data-ui-*`-Aktionen und `ui-events.js`,
- Controlleraktionen ausschließlich über `ui-controller.js`/`ui-bindings.js`,
- Fachdatenspeicherung ausschließlich über `persistence.js`,
- UI-Präferenzen ausschließlich über `ui-preferences.js`,
- keine stillschweigende Schema-, Vertrags- oder Standardänderung,
- keine historische Umschreibung gespeicherter Snapshots,
- unbekannte Felder bei Normalisierung und Migration bewahren,
- keine Fachberechnung in UI-, Druck- oder Exportfunktionen duplizieren.

## 3. AP6-Modulregeln

- zentrale Kostenverteilung nur in `billing-calculation.js`,
- fachliche Briefdaten nur in `document-data.js`,
- Brief-/Druck-HTML nur in `document-renderer.js`,
- Serialisierung und Download nur in `export-service.js`,
- Tabellenfilter und Sortierung nur in `ui-table-tools.js`,
- Startreihenfolge nur über `app-bootstrap.js`,
- globale Legacy-Namen nur als Einzeilen-Wrapper,
- neue Module exportieren eine eingefrorene API.

## 4. Daten- und Snapshotregeln

Vor jeder datenverändernden Migration ist eine Vor-Migrationssicherung zu erzeugen. Änderungen laufen auf Kopien und werden vor Übernahme validiert. Snapshot 1 bleibt unverändert lesbar; Snapshot 2 wird nicht nachträglich verändert. `electricity-dummy` darf niemals abrechenbare Verbräuche erzeugen.

## 5. Pflichtprüfung

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

## 6. Definition of Done

Quellcode, Modulgrenzen, Tests, Dokumentation, Versionsangaben, App-Shell und Prüfsummenliste sind konsistent; alle verfügbaren Prüfungen bestehen; die finale ZIP wird frisch entpackt und erneut validiert.
