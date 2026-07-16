# NK-Pro UI-Komponentenkatalog

| Komponente | Basisklasse | Varianten | Zweck | Status |
|---|---|---|---|---|
| Button | `nk-ui-button` | primary, secondary, danger, ghost, icon | Aktionen | Produktiv seit AP22B |
| Formularfeld | `nk-ui-field` | default, invalid, disabled, readonly | Beschriftete Eingaben | Produktiv seit AP22B |
| Karte | `nk-ui-card` | default, muted, interactive | Inhaltliche Gruppierung | Grundmigration AP22B; Sonderformen später |
| Accordion | `nk-ui-accordion` | default | Klappbarer Bereich | Grundmigration AP22B; Sonderformen später |
| Tabelle | `nk-ui-table` | default, compact | Tabellarische Daten | Produktiv seit AP22C |
| Tabellencontainer | `nk-ui-table-wrap` | default | Scrollbarer und begrenzter Tabellenbereich | Produktiv seit AP22C |
| Liste | `nk-ui-list` | default, plain, divided, definition, check | Strukturierte Aufzählungen und Wertepaare | Produktiv seit AP22C |
| Status | `nk-ui-status` | neutral, info, success, warning, danger | Kompakter Zustand | Produktiv seit AP22B |
| Hinweis | `nk-ui-notice` | info, success, warning, danger | Kontextmeldung | Grundmigration AP22B; Sonderformen später |
| Toolbar | `nk-ui-toolbar` | default, compact | Filter und tabellenbezogene Aktionen | Produktiv seit AP22C |
| Dialog | `nk-ui-dialog` | default, danger | Modale Interaktion | Fundament; Migration AP22D |
| Leerzustand | `nk-ui-empty-state` | default | Fehlende Inhalte | Fundament; Migration AP22D |

Die zentrale JavaScript-Schnittstelle `NKProUIDesignSystem` ergänzt kanonische Klassen auch an dynamisch erzeugtem Markup. Bestehende Legacy-Klassen bleiben bis zur vollständigen Restmigration als Kompatibilität erhalten.
