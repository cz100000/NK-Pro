# AP22F10E – Stabilisierung und Neuverdrahtung der Abrechnungsübersicht

## Ziel

Die Abrechnungsübersicht bleibt auch bei unvollständigen historischen Zählerzuordnungen erreichbar. Aktionen der aktuellen und archivierten Abrechnungen sind eindeutig getrennt.

## Änderungen

- `MEASUREMENT_PERIOD_ASSIGNMENT_MISSING` und `METER_PERIOD_MISSING` blockieren den Anwendungsstart nicht mehr. Die Befunde bleiben in der fachlichen Diagnose erhalten.
- Wiederholte fatale Zählerprüfmeldungen werden dedupliziert.
- Daten-/Migrationsfehler werden nicht mehr pauschal als lokaler Speicherfehler bezeichnet.
- Abrechnungsaktionen: Stift = bearbeiten, Kalender = Zeitraum, Auge = Ansicht, Haken = Abschluss, Archivbox = Archivierung, Papierkorb = Löschen; Archivkorrektur bleibt eine eigene Aktion.
- Herkunft bleibt auf `NK-Pro` und `Importiert` normalisiert.
- Versions-, Build-, Manifest- und Cachekennungen wurden auf V99.4.51 / `99.4.51-ap22f10e` vereinheitlicht.
- Neuer Regressionstest `tests/ap22f10e-stabilization.test.cjs`.

## Prüfung

Bestanden: JavaScript-Syntax, Referenzdaten, Zähler-Domainregressionen, AP22F10E-Regression und ZIP-Integrität. Ein vollständiger Playwright-Browserlauf war in der Ausführungsumgebung nicht möglich, weil `@playwright/test` dort nicht installiert ist.
