# UI-Architektur V99.4.24 / AP21A

Die gemeinsame Seite `manuellewerte` wird durch `js/ui-individual-values.js` gerendert; der historische Schlüssel `verbraeuche` bleibt als kompatible Weiterleitung bestehen.

# NK-Pro – UI-Architektur V99.4.23

## Visuelles System

Die App verwendet zentral `"Segoe UI", Arial, sans-serif`; Briefvorschau, Druck und PDF bleiben durch AP13 isoliert und verwenden Arial. Das AP18-System für Steuerungshöhen, Abstände, Rundungen, Rahmen, Fokus, Übergänge, Icons und Buttons bleibt verbindlich.

## Navigation und Abrechnungskontext

Der AP19-Kontext besitzt weiterhin `closed`, `edit` und `view`. Zehn Abrechnungs-Unterpunkte sind ohne geöffneten Kontext sichtbar, aber nicht aufrufbar. Die gelbe Kontextleiste bleibt die zentrale Status- und Modusanzeige.

## AP20-Prüfoberflächen

`quality-rules.js` erzeugt das zentrale Ergebnis. `ui-quality.js` rendert vier Statuskarten, acht Bereichsgruppen, Statusfilter, Detaildialog, Bestätigungsnachweise, Regelübersicht, kontextbezogene Fachseitenhinweise und Systemdiagnose. Dashboard und Dokumentmodule lesen dieselben Ergebnisse.

15 vorhandene Validierungsbereiche erhalten kompakte Seitensummen. 36 fachliche Regelinstanzen besitzen Zielseiten. Direkteinstiege öffnen den fachlichen Bereich, scrollen zum Ziel und setzen Fokus beziehungsweise zeitliche Hervorhebung. Technische Regeln erscheinen ausschließlich in der Systemdiagnose.

## Schreibschutz

54 schreibende Aktionskennungen sind zentral abgesichert; darunter AP20-Bestätigen und Nicht-anwendbar. Der Ansichtsmodus sperrt UI, Ereignisdelegation und direkte Aufrufe. Lesen, Filtern, Aufklappen, Vorschau, Druck und Export bleiben möglich.

## Barrierefreiheit und Responsivität

Status werden mit Text statt nur Farbe kommuniziert. Fokuszustände sind sichtbar. Aufklappgruppen und Dialoge besitzen nachvollziehbare Beschriftungen. AP20 ergänzt Breakpoints bei 900 und 620 Pixeln sowie Regeln für geringe Höhe, Kartenstapel, Aktionsumbruch und kontrollierte Langtexte. Eine vollständige mobile Neuentwicklung bleibt außerhalb AP20.
