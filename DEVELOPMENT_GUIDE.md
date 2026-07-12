# NK-Pro – Entwicklungsleitfaden

**Aktueller Umsetzungsstand:** V99.4.6, Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandard 1, Snapshot 2

## 1. Quellenhierarchie

Maßgeblich sind ausschließlich die ausdrücklich freigegebene Versions-ZIP, der darin enthaltene Quellcode, die Projektdokumente und automatisierten Tests.

## 2. Leitplanken

- HTML, CSS und JavaScript ohne Framework oder Buildsystem,
- keine direkte Speicherung außerhalb `js/persistence.js`,
- keine stillschweigende Schema-, Vertrags- oder Standardänderung,
- keine historische Umschreibung bereits gespeicherter Snapshots,
- unbekannte Felder bei Normalisierung und Migration bewahren,
- Zählernummer, Bezeichnung, Arrayposition oder aktuelle Einheit niemals als alleinige technische Zähleridentität verwenden.

## 3. Fachgrenzen V99.4.6

Zählerstamm, Messwert, Messperiode, Wechsel, zeitabhängige Zuordnung, Validierung, Verbrauch, Objektstandard, Snapshot, Archiv, Migration, Sicherung und Persistenz besitzen getrennte Verantwortlichkeiten. `app.js` orchestriert, dupliziert aber nicht die Fachlogik der Module.

## 4. Datenänderungen

Vor jeder datenverändernden Migration ist eine Vor-Migrationssicherung zu erzeugen. Änderungen laufen auf Kopien, werden vor und nach Ausführung validiert und nur vollständig übernommen.

Korrekturen bereits gespeicherter Messwerte werden als neue Messwertdatensätze mit Ersetzungsreferenz gespeichert. Ein alter Wert wird nicht stillschweigend überschrieben. Manuelle Messperioden dürfen nicht dieselbe Messwertfolge doppelt abrechnen.

## 5. Snapshotregeln

- Snapshot nur nach gültiger zentraler Abrechnungsbereitschaft,
- `zaehlerDaten` vor Snapshot-Erstellung synchronisieren,
- relevante Stammdaten, Messwerte, Perioden, Zuordnungen und Wechsel gemeinsam erfassen,
- keine globalen Archive, Stammdatenkopien, Historien oder Recovery-Daten im begrenzten Snapshot,
- Prüfsumme vor Import oder Archivierung validieren,
- `electricity-dummy` niemals in abrechnungsrelevante Verbräuche aufnehmen,
- Snapshot 1 nicht nachträglich auf Snapshot 2 umschreiben.

## 6. Pflichtprüfung

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

## 7. Definition of Done

Quellcode, Tests, Dokumentation, Versionsangaben, App-Shell und Prüfsummenliste sind konsistent; alle verfügbaren Prüfungen bestehen; die finale ZIP wird frisch entpackt und erneut validiert.
