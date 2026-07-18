# NK-Pro – Verbindlicher UI-Komponentenkatalog

| Gruppe | Basiskomponente | Erlaubte Varianten | Technischer Stand | Verbindliche Referenz |
|---|---|---|---|---|
| Navigation | bestehende V99.4.32-Navigation | Desktop, bestehendes Overlay, aktiv, inaktiv, deaktiviert, Gruppen offen/geschlossen | geschützt, unverändert | Referenzbibliothek: Navigation |
| Kopf/Werkzeuge | globale Kopf- und Werkzeugleiste | Standard, reduzierte schmale Darstellung | Bestand; spätere Konsolidierung | Seitenschale |
| Abrechnungskontext | `global-billing-context nk-ui-context-bar` | kein Kontext, Bearbeiten, Nur ansehen, geschlossen, Archiv, Korrektur; stets ohne Modusangabe | AP22F1A produktiv migriert; Fachlogik unverändert | Seitenschale |
| Seitenschale | `nk-ui-page-shell` | narrow 760 px, default 1180 px, wide 1440 px | AP22F1A auf allen sichtbaren Seiten produktiv | Seitenschale |
| Seitenkopf | `nk-ui-page-header` | Titel; Titel/Beschreibung; Titel/Aktionen; Titel/Beschreibung/Aktionen | AP22F1A zentral migriert; genau ein sichtbares `h1` je Ansicht | Seitenschale |
| Layout | `nk-ui-stack`, `nk-ui-cluster`, Ziel `nk-ui-grid`, `nk-ui-main-aside` | stack sm/md/lg/xl, Cluster, 1/2 Spalten, Dashboard, Kartenraster, Haupt/Neben | Fundament vorhanden; Ausbau offen | Karten/Responsive |
| Button | `nk-ui-button` | primary, secondary, ghost, danger, icon, disabled | produktiv seit AP22B | Aktionen |
| Formularfeld | `nk-ui-field` | default, invalid, warning, disabled, readonly, group, section | Grundmigration AP22B; Sonderformen offen | Formulare |
| Karte | `nk-ui-card` | standard, metric, status, dashboard, content, interactive, compact, actions | Grundmigration AP22B; Sonderformen offen | Karten |
| Klappbox | `nk-ui-accordion` | standard, compact, status, warning, action | Grundmigration AP22B; Sonderformen offen | Klappboxen |
| Tabelle | `nk-ui-table` | data, compact, status, result, action-column, empty, responsive | produktiv seit AP22C | Tabellen |
| Tabellencontainer | `nk-ui-table-wrap` | default, compact | produktiv seit AP22C | Tabellen |
| Liste | `nk-ui-list` | default, plain, divided, definition, check | produktiv seit AP22C | Tabellen/Listen |
| Toolbar | `nk-ui-toolbar` | default, compact, filter, page-actions, form-actions | Tabellenwerkzeuge produktiv; allgemeine Leisten offen | Aktionen/Tabellen |
| Status | `nk-ui-status` | neutral, info, success, warning, danger | produktiv seit AP22B | Hinweise/Status |
| Hinweis | `nk-ui-notice` | info, success, warning, danger, readonly, action, inline | Grundmigration AP22B; Sonderformen offen | Hinweise/Status |
| Dialog | `nk-ui-dialog` | confirmation, notice, warning, action, danger, protected | fünf produktive Dialoge seit AP22D; Rest offen | Dialoge |
| Inhaltszustand | `nk-ui-empty-state` | no-data, not-created, filtered, loading, error, not-applicable, disabled, unavailable | sieben Zustände AP22D; disabled in Vertrag ergänzt | Zustände |
| Icon | Ziel `nk-ui-icon` | 16, 18, 20, 24 px; dekorativ/funktional | Quellenkonsolidierung offen | UI-Baukasten |

## Auswahlregel

Eine Variante wird nach fachlicher Aufgabe und Zustand gewählt. Seitenname, persönliche Präferenz oder vorhandene lokale Klasse begründen keine neue Variante.

## Dynamische Inhalte

`NKProUIDesignSystem` bleibt die zentrale rein darstellungsbezogene Upgrade-Schnittstelle für dynamisch erzeugtes Markup. Sie darf keine Fachdaten mutieren, speichern oder berechnen.

## Geschützte Bereiche

Brief-, Druck-, PDF- und Dokumentausgaben sind keine App-UI-Komponenten dieses Katalogs. Die Navigation ist als Bestandskomponente dokumentiert, darf aber ohne gesonderte Freigabe nicht umgestaltet werden.

## AP22F1B – Produktiver Seitenkopfstand

Der zentrale Seitenkopf besitzt ab V99.4.35 zwei produktive Aktionsvarianten: Datenseite mit genau einer führenden `application.save`-Aktion und Fachseite ohne allgemeine Speicheraktion. Die frühere statische Statusvariante `[data-page-save-status]` ist entfallen. Lokale `.page-header__period`-Blöcke auf Objekt, Archiv, Mieterverwaltung, Wohnungsverwaltung, Datensicherung und Zähler sind entfernt; daraus entsteht keine neue Komponentensonderform.
## AP22F1C – Geschlossener Dialogzustand und Versionslabel

- `dialog.nk-ui-dialog:not([open])` ist zwingend unsichtbar; die sichtbare Flex-Darstellung gilt ausschließlich für geöffnete Dialoge.
- `[data-app-version]` ist das einzige sichtbare Versionslabel der Navigation und wird aus `APP_VERSION` befüllt.
- Der HTML-Text des Labels ist lediglich ein startfähiger Fallback und muss der aktuellen zentralen Version entsprechen.

## AP22F2B – produktive Varianten

| Komponente | Produktiver Status | Einsatz |
|---|---|---|
| Objektidentitäts-/Nächste-Aktion-Karte | migriert | `objektuebersicht` |
| Aufgaben-/Statuskarte | migriert, vier Instanzen | Objektdaten, Wohnungen, Mietverhältnisse, Zähler-DUMMY |
| Gesamtstatus „x von 3 Bereichen“ | migriert | ausschließlich produktive Objektvorbereitung |
| DUMMY-Statuskarte | migriert | bestehendes Ziel `wasser`, ohne Fachlogik |

Die alten Objekt-Dashboard-Kennzahlen und die Kostenartenstatuskarte sind für `objektuebersicht` entfallen.

## AP22F4B – Ergänzte produktive Tabellenkomponenten

| Komponente | Produktiver Status | Einsatz |
|---|---|---|
| Stammdatentabellenkarte mit Kopf, weißem Tabelleninnenrand und Fuß | migriert | `wohnungsverwaltung` |
| Tabellen-Suchfeld | migriert, zentrale Tabellenwerkzeuge | sichtbare Wohnungszeilen |
| Bestandsbasierter Statusfilter | migriert | „Alle Wohnungen“ / „Mit Handlungsbedarf“ |
| Kompakte Zeilenaktion | migriert | Fokus auf vorhandene Inline-Bearbeitung; im Schreibschutz deaktiviert |
| Ergebnissumme | migriert | sichtbare von gesamten Wohnungen |
| UNIT-Prüfhinweis | migriert | ausschließlich bestehende Objektstandardbefunde |
| Intern horizontal verschiebbare Tabellenhülle | migriert | schmale Viewports ohne Seitenüberlauf |
