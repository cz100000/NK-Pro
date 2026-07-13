# NK-Pro – Anwendungsaktionsübersicht V99.4.15


AP13 ändert keine Aktionskennungen. Dokumentaktionen rufen weiterhin die bestehenden UI-Bindings auf; nur Renderer, Vorschau und Drucklayout wurden vereinheitlicht.

`NKProApplicationActions` bleibt das eingefrorene zentrale Register zwischen UI-Controllern und fachlichen Aktions-/Workflowmodulen. AP12 verdrahtet das Register in `app.js`, implementiert dort aber keine Fachaktion.

| Bereich | Zielmodule |
|---|---|
| Anwendung/Zustand | Persistenz- und kontrollierter State-Pfad |
| Objekt/Stammdaten | `master-data-actions.js` |
| Kosten | `cost-actions.js` |
| Abrechnung | `billing-workflow.js` |
| Archiv | `archive-actions.js` |
| Jahreswechsel | `year-transition-actions.js` |
| Qualität | `quality-assurance.js` |
| Zähler | Zähler- und `ui-metering.js`-Aktionspfade |

Alle 99 UI-Aktionskennungen bleiben unverändert erreichbar.
