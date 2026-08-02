# AP22F12A/B – Datenmodelländerungen

## 1. Schemaentscheidung

Das globale Datenschema bleibt Version 5. Die Erweiterung ist additiv und verwendet den Top-Level-Container `kostenUmlagenAbgleich`. Es wird kein paralleles Gesamtdatenmodell eingeführt.

## 2. Container

```text
kostenUmlagenAbgleich
├─ version: 1
├─ payments[]
├─ costOverrides[]
├─ allocations[]
├─ release
├─ updatedAt
└─ updatedWithAppVersion
```

## 3. Tatsächliche Zahlungsflüsse `payments[]`

Wesentliche Felder:

- `id`
- `paymentType`: `prepayment`, `additional-payment`, `refund`, `correction`
- `amount`
- `paymentDate`
- `paymentYear`
- `billingYear`
- `tenantId`
- `unitId`
- `source`
- `origin`
- `status`
- `note`
- `createdAt`, `updatedAt`, `updatedBy`

Schutzregeln:

- Erstattungen werden negativ normiert.
- Zahlungsjahr und Abrechnungsjahr sind beide Pflicht.
- Soll-Vorauszahlungen werden nicht automatisch kopiert.

## 4. Kostenübersteuerungen `costOverrides[]`

Wesentliche Felder:

- `id`, `year`, `costId`
- `actualTotal`
- `billingAmount`
- `analysisAmount`
- `analysisCategory`
- `source`
- `evidenceStatus`
- `note`
- `updatedAt`, `updatedBy`

Leere Betragsfelder bedeuten: vorhandenen Kostenwert verwenden. Die Migration erzeugt keine fiktiven Beträge.

## 5. Differenzzuordnungen `allocations[]`

Wesentliche Felder:

- `id`, `category`, `year`, `amount`
- `costId`, `tenantId`, `unitId`
- `allocationKey`
- `source`
- `evidenceStatus`, `evidenceReference`
- `reason`
- `status`
- `decisionId`
- `createdAt`, `updatedAt`, `updatedBy`

Zulässige Schlüssel: Verbrauch, Wohnfläche, Einheiten, Personenzahl, Zeitanteil, direkter Betrag, manuelle Zuordnung.

## 6. Prüf-/Freigabestatus `release`

- `status`: `draft`, `checked`, `released`
- `checkedAt`, `checkedBy`
- `releasedAt`, `releasedBy`
- `note`

Fachliche Datenänderungen invalidieren den bisherigen Status.

## 7. Bestehende Prüfentscheidungen

Geprüfte Zuordnungen werden unter `abrechnungsPruefungen.records` mit `decisionScope: "cost-reconciliation"` gespeichert. Bestehende Abrechnungsdifferenzentscheidungen erhalten beziehungsweise behalten den Scope `billing-difference`; die vorhandene Abstimmungslogik verarbeitet nur ihren eigenen Scope.

## 8. Berechnete, nicht persistierte Werte

Nicht als redundante UI-Zwischenspeicher gespeichert werden:

- Jahressummen,
- Einnahmensaldo,
- Kostensummen,
- zu erklärende Differenz,
- Erklärungssumme,
- Kontrolldifferenz,
- automatischer Privat-/Leerstands-/Eigentümeranteil,
- fachlicher Anzeigestatus.

Diese Werte werden bei jedem Modellaufruf aus dem aktuellen Datenbestand abgeleitet.
