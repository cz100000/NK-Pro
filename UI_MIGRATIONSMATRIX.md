# NK-Pro UI-Migrationsmatrix

| Bereich | Gefundene Altvarianten | Zielkomponente | Status | Paket |
|---|---:|---|---|---|
| Buttons/Aktionsgruppen | mehrere globale und fachbezogene Varianten | `nk-ui-button` | Grundmigration abgeschlossen | AP22B |
| Formularfelder/Validierung | globale Felder plus fachbezogene Sonderregeln | `nk-ui-field` | Grundmigration abgeschlossen | AP22B |
| Karten | Dashboard-, Status- und Fachkarten | `nk-ui-card` | Grundmigration abgeschlossen; Sonderformen offen | AP22B/AP22E |
| Klappboxen | `page-section`, Kostenarten- und Zählervarianten | `nk-ui-accordion` | Grundmigration abgeschlossen; Sonderformen offen | AP22B/AP22E |
| Tabellen/Tabellencontainer | `table-wrap` plus fachbezogene Tabellen | `nk-ui-table`, `nk-ui-table-wrap` | Produktiv migriert | AP22C |
| Strukturierte Listen | Prüf-, Werte-, Hinweis- und Faktenlisten | `nk-ui-list` | Produktiv migriert | AP22C |
| Status/Badges | mehrere Statusklassen und Texte | `nk-ui-status` | Grundmigration abgeschlossen | AP22B |
| Hinweise | Hint-, Warn-, Fehler- und Schreibschutzboxen | `nk-ui-notice` | Grundmigration abgeschlossen; Sonderformen offen | AP22B/AP22D |
| Tabellenwerkzeuge/Filter | Tabellenfilter, Kosten- und Einzelwertewerkzeuge | `nk-ui-toolbar` | Produktiv migriert | AP22C |
| Allgemeine Aktionsleisten | fachbezogene, nicht tabellengebundene Werkzeugleisten | `nk-ui-toolbar` | offen | AP22E/AP22F |
| Dialoge | native und fachbezogene Dialogvarianten | `nk-ui-dialog` | offen | AP22D |
| Leer-/Ladezustände | uneinheitliche Einzelzustände | `nk-ui-empty-state` | offen | AP22D |

Brief-, Druck- und PDF-Dokumenttabellen sind keine App-UI-Komponenten und bleiben ausdrücklich außerhalb der Migration.
