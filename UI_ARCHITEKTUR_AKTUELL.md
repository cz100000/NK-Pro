# NK-Pro – UI-Architektur V99.4.22

## Visuelles System

Die Anwendungsoberfläche verwendet zentral `"Segoe UI", Arial, sans-serif`. Das AP18-System für Steuerungshöhen, Abstände, Rundungen, Rahmen, Fokus, Übergänge, Icons und Buttons bleibt verbindlich. Briefvorschau, Druck und PDF bleiben durch AP13 isoliert und verwenden Arial.

## Navigation und Abrechnungskontext

Der globale Start-Eintrag steht oberhalb der vier unabhängig klappbaren Fachgruppen. Chevron-Bedienung und Navigation sind getrennt.

AP19 ergänzt `NKProBillingContext` als zentrale transiente UI-/Anwendungsgrenze. Die Zustände sind `closed`, `edit` und `view`. Zehn Abrechnungs-Unterpunkte besitzen `data-requires-billing="true"`; ohne Kontext bleiben sie sichtbar und lesbar, sind aber mit `aria-disabled` und Ereignisschutz nicht aufrufbar.

Die gelbe Kontextleiste zeigt je nach Zustand:

- keine Abrechnung geöffnet,
- Objekt, Kurzcode, Jahr und fachlichen Status,
- getrennten Bedienmodus Bearbeiten oder Nur ansehen,
- Abrechnung schließen und gegebenenfalls Zur Bearbeitung öffnen.

## Schreibschutz

52 schreibende Aktionskennungen sind in einem zentralen Register erfasst. UI-Ereignisse, Anwendungsmodule, State-Commit und Tastaturkürzel prüfen den Kontext. Der Ansichtsmodus ist daher nicht nur über CSS oder deaktivierte Felder abgesichert.

## Bereichsübersichten

`ui-page-controller.js` leitet die produktiven Angaben aus dem bestehenden State und der Qualitätsdiagnose ab. Die Abrechnungsübersicht verbindet Dashboard, Workflow-Direkteinstiege und eine gemeinsame Liste für aktuelle und archivierte Abrechnungen. Direkteinstiege öffnen keine Abrechnung automatisch.

## Responsivität

Die AP18-Breakpoints bleiben bestehen. AP19 ergänzt eine responsive Abrechnungsliste, umbrechende Kontextaktionen und kompakte Schreibschutzhinweise. Unter 760 Pixeln werden Tabellenzeilen als beschriftete Datensätze dargestellt. Der Zählerbereich bleibt als einziger DUMMY gekennzeichnet.
