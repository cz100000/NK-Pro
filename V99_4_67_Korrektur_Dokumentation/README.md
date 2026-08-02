# NK-Pro V99.4.67 – Korrektur Archivierung und Wasserzählerhistorie

V99.4.67 ist eine Korrekturversion auf Basis von V99.4.66. Sie beseitigt den Fehler, durch den eine erneut geöffnete historische Abrechnung beim Archivieren wegen fehlender Messperioden blockiert werden konnte.

Die Korrektur verändert keine Abrechnungsbeträge. Vorhandene historische Wasseruhrenstände werden in den operativen Zählerstandard übernommen. Das Datenschema bleibt Version 5.

## Kernkorrekturen

- Leere Mieterplatzhalter erzeugen keine Kalt- oder Warmwasserzähler mehr.
- Bereits erzeugte Platzhalterzähler ohne Wohnung werden bei der Migration entfernt.
- Fehlende operative Messwerte werden aus der vorhandenen `waterMeterHistory` des jeweiligen Abrechnungsjahres ergänzt.
- DG-Links und DG-Rechts erhalten damit ihre belegten historischen Messwerte und Messperioden.
- Hauswasserzähler bleiben als nicht abrechnungsrelevante Kontrollzähler erhalten.
- Zähler werden nur geprüft und in Snapshots aufgenommen, wenn ihre Einbau-/Ausbauzeit den Abrechnungszeitraum berührt.
- Gleichartige Validierungsfehler werden kompakt zusammengefasst.
- Die Reparatur wird unter `meta.standardMigrations` mit `metering-repair-v99.4.67` dokumentiert.

## Verwendung

Vor dem Versionswechsel ist ein aktuelles Gesamt-JSON zu sichern. Bei Bereitstellung unter derselben GitHub-Pages-Adresse migriert V99.4.67 den vorhandenen lokalen Datenstand beim Laden beziehungsweise Import automatisch.
