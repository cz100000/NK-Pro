# NK-Pro – Entwicklungsleitfaden

**Aktueller Umsetzungsstand:** V99.4.5, Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Snapshot 1

## 1. Quellenhierarchie

Maßgeblich sind ausschließlich die ausdrücklich freigegebene Versions-ZIP, der darin enthaltene Quellcode, die Projektdokumente und automatisierten Tests.

## 2. Leitplanken

- HTML, CSS und JavaScript ohne Framework oder Buildsystem,
- keine direkte Speicherung außerhalb `js/persistence.js`,
- keine stillschweigende Schema-, Vertrags-, Objektstandard- oder Snapshotänderung,
- keine historische Umschreibung ohne fachlichen Nachweis,
- unbekannte Felder bei Normalisierung und Migration bewahren.

## 3. Modulgrenzen V99.4.5

Objektmodell, Abrechnungsbereitschaft, Snapshot, Archiv, Migration, Sicherung und Persistenz bleiben getrennt. `app.js` darf diese Module orchestrieren, ihre Fachverantwortung aber nicht duplizieren.

## 4. Datenänderungen

Vor jeder datenverändernden Migration ist über das bestehende Fundament eine Vor-Migrationssicherung zu erzeugen. Änderungen laufen auf Kopien, werden vor und nach Ausführung validiert und nur vollständig übernommen.

Eine Änderung von Objektstandard 1 oder Snapshot 1 benötigt eine eigene Versionsnummer, Kompatibilitätsanalyse und Tests. Datenschema 5 und Datenebenenvertrag 1 dürfen nur bei technischer Notwendigkeit geändert werden.

## 5. Snapshotregeln

- Snapshot nur nach gültiger zentraler Abrechnungsbereitschaft,
- keine globalen Archive, Stammdatenkopien, Historien oder Recovery-Daten im begrenzten Snapshot,
- Berechnungsergebnis und verwendete Grundlagen gemeinsam speichern,
- Prüfsumme vor Import/Archivierung validieren,
- `electricity-dummy` niemals in `meterSelection.included` aufnehmen,
- historische Altarchive nur als `legacy-partial` kennzeichnen.

## 6. Pflichtprüfung

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

## 7. Definition of Done

Quellcode, Tests, Dokumentation, Versionsangaben, App-Shell und Prüfsummenliste sind konsistent; alle Prüfungen bestehen; die finale ZIP wird frisch entpackt und erneut validiert.
