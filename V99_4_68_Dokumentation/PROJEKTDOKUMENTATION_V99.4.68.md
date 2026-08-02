# NK-Pro V99.4.68 – Projektdokumentation

## Fachvertrag

Ein Abrechnungsteilnehmer wird durch Identität, Wohnungsbezug und zeitliche Relevanz bestimmt. Nutzungsart und Rollenbezeichnung entscheiden nicht über die Teilnahme.

## Öffentliche Fachfunktionen

- `isSettlementParticipant(record)` – zentrale Teilnahmeentscheidung
- `isPrivateUse(record)` – reine Nutzungsartkennung
- `isBillableTenant(record)` – vorübergehender Kompatibilitätsalias

## Ergebnisvertrag

`tenantResults` enthält sämtliche Teilnehmer. Jede Zeile besitzt Kostenanteil, Vorauszahlungen, NK-Korrektur, Kaltmietkorrektur, Saldo und Teilnehmerdaten. `privateResults` verweist auf dieselben Ergebnisobjekte und darf nur für informative Filter oder Kennzahlen verwendet werden.

## Datenmigration

Die Migration ist idempotent und arbeitet auf stabilen IDs. Rollen werden normalisiert, ohne Datensätze zu duplizieren. M000 erhält das aktive Einzugsdatum 2010-01-01. Archiv-Snapshots werden nicht automatisch verändert.

## Archivvertrag

Ein neu erzeugter Snapshot enthält alle Teilnehmerdaten und die gemeinsame Ergebnisstruktur. Beim Öffnen zur Ansicht werden gespeicherte Werte wiedergegeben. Beim kontrollierten Öffnen zur Korrektur gilt die aktuelle Teilnehmerlogik; eine erneute Archivierung wird über die vorhandenen Archivmetadaten protokolliert.

## Testvertrag

Jede künftige Änderung an Berechnung, Dokumenten, Prüfungen, Archiv oder Jahreswechsel muss mindestens M000 und einen generischen Teilnehmer mit anderer ID und privater Nutzungsart abdecken. Alte Erwartungen, die einen Ausschluss verlangen, sind unzulässig.
