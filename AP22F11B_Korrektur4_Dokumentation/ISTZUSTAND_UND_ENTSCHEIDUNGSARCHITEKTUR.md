# Istzustand und Entscheidungsarchitektur

**Stand:** 20.07.2026  
**Ausgangsbasis:** V99.4.64 AP22F11B Korrektur 3

## Vor Korrektur 4

- Die produktiven Fachregeln lagen überwiegend in `js/quality-rules.js`; Zählerdaten wurden zusätzlich über die Issue-Codes aus `js/meter-validation.js` validiert.
- Die Seite „Prüfen und abschließen“ zeigte vor allem verdichtete Auffälligkeiten und verwendete noch die alte Statussprache.
- Finanzielle Differenzen und deren Entscheidungen wurden bereits in `state.abrechnungsPruefungen.records` durch `js/billing-review.js` geführt.
- Allgemeine Regelbestätigungen wurden getrennt in `state.meta.qualityRuleConfirmationsV2` gespeichert.
- Der bestehende Differenzdatensatz besitzt stabile Differenz-IDs sowie Daten- und Berechnungssignaturen. `decisionStatus()` erklärt eine Entscheidung bei nicht mehr passender Signatur für ungültig.
- Abschluss, Schreibschutz und Briefstatus wurden bereits über `js/billing-workflow.js`, `js/quality-assurance.js`, `js/document-data.js`, Billing-Snapshot und Billing-Kontext gesteuert.

## Konsolidierter Zustand in Korrektur 4

- Finanzielle Differenzen bleiben die **führende Entscheidungsquelle**. Es wurde kein zweiter Akzeptanzspeicher geschaffen.
- Allgemeine Regelentscheidungen werden nur verwendet, wenn keine finanzielle Differenzentscheidung existiert.
- „Prüfen und abschließen“ projiziert beide vorhandenen Entscheidungsarten in ein gemeinsames Ergebnisbild.
- Eine Datenänderung invalidiert finanzielle Entscheidungen weiterhin über die bestehende Daten-/Berechnungssignatur. Allgemeine Bestätigungen bleiben an den bestehenden Regel-Fingerprint gebunden.
- Die zentrale Navigationsdefinition `NKProNavigation.navigationDefinition()` bestimmt Gruppen, Seitennamen und Sortierung für Ergebnis- und Inventarseite. Es existiert keine zweite manuelle Navigationsreihenfolge.
- Der fachliche Abschluss nutzt die nachweisbare Readiness-, Brief-Preflight-, Finalisierungs- und Schreibschutzlogik. Der Versand ist keine Abschlussvoraussetzung.
- Datenschema und Datenlayer-Vertrag bleiben unverändert bei Version 5 beziehungsweise Vertrag 1.

## Entscheidungsmatrix

| Sachverhalt | Führende Datenquelle | Änderbar auf | Invalidierung |
|---|---|---|---|
| Finanzielle Differenz | `abrechnungsPruefungen.records` | Abrechnungsergebnis und Prüfen/Abschließen | Daten- oder Berechnungssignatur passt nicht mehr |
| Allgemeine akzeptierbare Regelabweichung | `meta.qualityRuleConfirmationsV2` | Prüfen/Abschließen | Regel-Fingerprint passt nicht mehr |
| Kritischer Abrechnungsmangel | keine Akzeptanz | ausschließlich Korrektur | entfällt |

## Schutzgrenzen

- Keine Schemaänderung.
- Keine Parallelquelle für Navigation, Regeln oder finanzielle Entscheidungen.
- UI mutiert keine Fachdaten außerhalb der bestehenden Controller-/Workflowgrenzen.
- Archiv, Snapshot, Export, Import und Schreibschutz bleiben über die bestehenden Module angebunden.
