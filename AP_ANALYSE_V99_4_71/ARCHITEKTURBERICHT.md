# Architekturbericht – V99.4.71

## Zielarchitektur

V99.4.71 verwendet weiterhin keine zweite Analyse-Datenbank. Der kanonische produktive Datenbestand, Archive, Zähler-/Messdaten, Vorauszahlungen sowie Qualitäts-/Prüfinformationen werden read-only durch `js/analytics-engine.js` ausgewertet.

Die Analysepipeline lautet:

`kanonische Datenquelle → Periodenmodell → Vergleichbarkeit → zentrale Analyseengine → Perspektive → UI / Tabelle / Drill-down / Export`.

## Zentrale Komponenten

- `js/analytics-engine.js`: Periodenmodell, Kennzahlenmodell, Vergleichbarkeit, Kosten-, Wasser-, Teilnehmer-, Wohnungs-, Finanz- und Steuerableitungen sowie Insights.
- `js/ui-analytics.js`: reine Darstellungs-/Interaktionsschicht für die drei Perspektiven; keine konkurrierende Fachberechnung.
- `js/ui-bindings.js`: zentrale deklarative Aktionen für Filter, Ansichtswechsel, Drill-down und Tabellensteuerung.
- `assets/app.css`: gemeinsames responsives Analyse-UI-System.
- `js/export-service.js`: bestehender Exportdienst; Analyseexporte werden aus denselben View-/Engine-Werten aufgebaut.

## Read-only und Cache

Die Analyseengine arbeitet auf geklonten/abgeleiteten Modellen und mutiert produktive Abrechnungs- oder Archivdaten nicht. Ableitungen werden nur im Arbeitsspeicher gecacht. `invalidate()` leert den Cache; es wird kein dauerhafter paralleler Analysebestand persistiert.

## Archiv-/Kontextschutz

Die Korrektur-2-Architektur bleibt erhalten. Analysezentrum, Kosten- und Umlagenabgleich sowie Regelinventar sind ohne geöffnete Abrechnung erreichbar. Abrechnungsgebundene Seiten bleiben geschützt. Bei einem nach Archivierung geschlossenen Arbeitsstand gewinnt der Archiv-Snapshot als Periodenquelle. Die direkte Browserverifikation bestätigt diese Priorität.

## Eine Wahrheit

Kennzahl, Vergleich, Tabelle, Drill-down und Export greifen auf dieselben Engine-Modelle zurück. Dadurch entstehen keine View-spezifischen Konkurrenzberechnungen.
