# UI-Architektur NK-Pro V99.2.3

## Ziel

V99.2 ersetzt die gewachsene Kombination aus statischem HTML, tabbezogenen Kartenrenderern, nachträglichen Headerkorrekturen und Laufzeit-DOM-Verschiebungen durch eine einzige gemeinsame Darstellungsarchitektur. Die fachlichen Berechnungs- und Datenwege bleiben bestehen.

## Tatsächliche Tab-Liste

| ID | Titel |
|---|---|
| `start` | Abrechnungsübersicht |
| `mieterverwaltung` | Mieterverwaltung |
| `wohnungsverwaltung` | Wohnungsverwaltung |
| `sicherung` | Datensicherung & System |
| `dashboard` | Abrechnungsstatus |
| `mieter` | Mieter & Wohnungen |
| `einstellungen` | Kostenarten & Einstellungen |
| `einnahmen` | Kaltmiete & NK-Vorauszahlungen |
| `wasser` | Zählerstände |
| `umlage` | Nebenkostenumlage |
| `vorauszahlungsanpassung` | Vorauszahlungsanpassung |
| `qualitaet` | Qualitätsprüfung |
| `briefe` | Abrechnungsbriefe |
| `export` | Abrechnung exportieren |

## Neue zentrale Komponenten

### `TAB_DEFINITIONS`

Zentrale Quelle für Titel, Kicker, fachlichen Renderer, Übersichtsprovider und Prozessnavigation. `renderStepsForTab()` leitet den Fachrenderer aus dieser Registrierung ab.

### Statischer Seitenrahmen

Jeder Tab enthält die endgültige Struktur bereits im HTML. Fachrenderer schreiben ausschließlich in dafür vorgesehene Inhaltscontainer. Es gibt keinen nachgelagerten Schritt mehr, der Überschriften, Karten oder Fachbereiche in eine neue Reihenfolge verschiebt.

### `renderOverviewCards()`

Einziger Renderer der gemeinsamen Übersicht. Er erzeugt immer genau vier direkte Kacheln mit zentralen Klassen:

- `.overview-grid`
- `.overview-card`
- `.overview-card__title`
- `.overview-card__content`
- `.overview-card__actions`
- `.quick-actions`

### `renderOverviewForTab()` und `renderAllOverviewCards()`

Aktualisieren Inhalte und Status der vorhandenen statischen Kacheln, ohne die Seitenarchitektur umzubauen.

### `auditV992Structure()`

Prüft pro Tab Kopfanzahl, Kachelgrid, direkte Karten, Kartentitel, Schnellaktionsbuttons, verschachtelte Altgrids, geschlossene Klappboxen, letzte Prüfbox und Fußnotenposition.

## Entfernte Altstrukturen

Entfernt wurden die parallelen UI-Umbauwege und Upgrade-Schichten, darunter – soweit in V99.1 vorhanden –:

- `upgradeDashboardWorkspace`
- `upgradeIncomeWorkspace`
- `upgradeAllocationWorkspace`
- `upgradeAdjustmentWorkspace`
- `upgradeQualityWorkspace`
- `upgradeLettersWorkspace`
- `upgradeExportWorkspace`
- `upgradeAllWorkflowTabs`
- `groupByHeadings`
- `createWorkspaceOverview`
- `renderUnifiedWorkspaceCards`
- `renderV988OverviewCards`
- `v989AddPeriodToHeaders`
- `v989NormalizeOverviewCards`
- `v989EnsureLastCheckSection`
- `applyV989Structure`
- `v991EnsureStandardHeader`
- `v991ApplyGlobalStandard`
- `v990ApplyReferenceFormat`

Ebenfalls entfernt oder entkoppelt wurden alte Übersichtssysteme wie `.workspace-overview-grid`, `.cost-overview-grid`, `.tenant-overview-grid`, `.meter-overview-grid` sowie deren tabbezogene Karten- und Schnellaktionsvarianten. Fachlich verwendete generische Klassen außerhalb der gemeinsamen Übersicht wurden nicht pauschal gelöscht.

## Erhaltene Fachrenderer

Die bestehenden Renderer für Stammdaten, Einnahmen, Kostenarten, Zählerstände, Umlage, Vorauszahlungsanpassung, Qualitätsprüfung, Briefe, Sicherung und Export bleiben verantwortlich für ihre Tabellen, Formulare, Berechnungsinhalte und Aktionen. Sie erzeugen nicht mehr den gemeinsamen Seitenrahmen.

## Render- und Navigationsfluss

1. `showTab()` aktiviert den Zieltab zentral.
2. Der zugehörige Fachrenderer wird über `TAB_DEFINITIONS` ausgeführt.
3. Kopf und vier Übersichtskacheln werden aus aktuellem Zustand aktualisiert.
4. Die statischen Fachbereiche behalten ihre Position und ihren Öffnungszustand.
5. Navigation, Schnellaktion, „nächster Schritt“, Speichern und Neuberechnung verwenden denselben zentralen Pfad.

## Responsive Regeln

- ab großer Desktopbreite: vier Kacheln in einer Reihe,
- mittlere Breite: zwei Kacheln pro Reihe,
- schmale Ansicht: eine Kachel pro Reihe.

Kacheln einer gemeinsamen Grid-Zeile werden automatisch gleich hoch. Inhalte dürfen die Mindesthöhe überschreiten. Buttons bleiben am unteren Kartenrand ausgerichtet.

## Prüfmethodik

- HTML-Strukturprüfung aller 14 Tabs
- JavaScript-Syntaxprüfung mit Node.js
- Quellcodesuche nach alten Renderer-/Upgrade-Funktionsnamen
- Chromium-Ausführung und Rendering bei 1440, 1180, 900 und 520 Pixel Breite
- programmgesteuerter Wechsel durch alle Tabs
- Interaktionstests für Schnellaktion, nächsten Schritt, Eingabe, Neuberechnung und Speichern
- Vergleich zentraler Ergebnisobjekte zwischen V99.1 und V99.2 im mitgelieferten Arbeitsstand

Die Ausführungsumgebung blockierte eine normale Browsernavigation zu lokalen HTTP- und Datei-URLs. Daher wurde die vollständige tatsächliche HTML-Datei mit Playwright als isoliertes Dokument in Chromium geladen, ausgeführt und gerendert. Das ist eine echte DOM-/Layout-/JavaScript-Prüfung, aber keine vollständige GitHub-Pages-Installation. Der Service-Worker-Lebenszyklus und ein realer Import beliebiger externer Nutzerarchive wurden nicht Ende-zu-Ende getestet.

## Bekannte Einschränkungen

- Das Ergebnisvergleichsszenario verwendet den in der ZIP enthaltenen Arbeitsstand; es ersetzt keine Regression mit sämtlichen historischen Nutzerarchiven.
- Die Platzhalterbox für einmalige Korrekturen/Gutschriften enthält noch keine neue Fachlogik.
- Service Worker und Installationsprompt müssen nach Veröffentlichung unter HTTPS zusätzlich praktisch geprüft werden.

## Vorgehen für neue Tabs

1. Tab-Container mit statischem `app-page`-Rahmen anlegen.
2. Fachbereiche statisch und die Prüfbox zuletzt einfügen.
3. Tab einmal in `TAB_DEFINITIONS` registrieren.
4. Nur Fachinhalte in den vorgesehenen Containern rendern.
5. Übersichtsdaten über den zentralen Provider liefern.
6. `auditV992Structure()` und die responsive Browserprüfung ausführen.


## Ergänzung V99.2.1

Die zentrale V99.2-Architektur bleibt unverändert. Der Praxistest hat drei rein visuelle Restpunkte ergeben:

1. Eine ältere Regel begrenzte aktive Tabs weiterhin auf 1500 px. V99.2.1 setzt auf Ebene `.app-main > .wrap > section.tab` verbindlich `max-width:none` und `width:100%`.
2. Das zentrale Aktionsdesign verwendet wieder die frühere blaue Farbwelt (`#075fc7`, Kontur `#7eace7`) statt der zwischenzeitlich dominanten grünen Primärfarbe.
3. Tabellenrahmen verwenden horizontalen Überlauf und sichtbare Scrollbar-Gestaltung. Normale Tabellenzellen bleiben einzeilig, ausdrücklich gekennzeichnete Langtextzellen dürfen umbrechen.

Diese Änderungen berühren keine Daten-, Berechnungs- oder Rendererlogik.


## Ergänzung V99.2.2

1. Der Bestandsabgleich im Abrechnungstab „Mieter & Wohnungen“ ist nun Teil der technisch markierten letzten Prüfbox. Es existiert dafür keine zusätzliche vorgelagerte Klappbox mehr.
2. Die zentrale Tabdefinition und die Übersichtsschnellaktionen verweisen auf reale verbleibende Klappboxen; es gibt keinen verwaisten Navigationspfad zur entfernten Box.
3. Die typografische Vergrößerung ist mit `#kostenMieterUmlageTable` auf die Mieter-Spalten der Umlagematrix begrenzt.
4. Zählertabellen verwenden weiterhin die gemeinsamen Scrollcontainer, erhalten aber denselben linken und rechten Standardabstand wie die Referenztabellen im Einnahmenbereich.
5. Die Vorjahresübernahme und die tabbezogene Einnahmenprüfung bleiben ausdrücklich fachliche Entwicklungsaufträge im WORKBOOK; V99.2.2 verändert dazu keine Berechnungslogik.


## Ergänzung V99.2.3 – Navigationsarchitektur

Die Navigation ist kein zweiter Renderer für Fachinhalte, sondern eine eigenständige, statische Baumstruktur über den bestehenden Tabs.

### Hauptkomponenten

- `.workflow-nav` enthält drei `nav-tree-group`-Hauptzweige.
- `data-nav-toggle` und `aria-controls` verbinden jeden Umschalter eindeutig mit seinem Bereich.
- `TAB_PATHS` ordnet jeder bestehenden Tab-ID ihren Hauptzweig und gegebenenfalls ihre Workflowphase zu.
- `ensureNavigationPath()` öffnet den Pfad bei jedem Tabwechsel und markiert den aktiven Zweig.
- `updateWorkflowNavigationContext()` aktualisiert Jahr, Bearbeitungsstatus, Sperrstatus und Archivdarstellung.
- Die manuelle Baumstellung wird unter `nkpro.workflowNavigation.v1` in `localStorage` gespeichert.

### Fachliche Abgrenzung

Die Navigation verändert weder `START_NAV_TABS`/`BILLING_NAV_TABS` noch die Tab-IDs, Berechnungsfunktionen oder Datenstrukturen. Sie steuert ausschließlich Sichtbarkeit, Aufklappzustand, Beschriftung und aktive Hervorhebung der Seitenleiste.

### Responsive Verhalten

Auf Desktop bleibt die Seitenleiste sticky und scrollbar. Unter 980 px verwendet sie weiterhin den vorhandenen mobilen Off-Canvas-Mechanismus; das Auf- und Zuklappen der Baumzweige bleibt darin vollständig nutzbar.
