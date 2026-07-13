# AP10 – Extraktionsinventar

| Gruppe | physisch entfernte Funktionen | Zielmodul | produktive Aktionen |
|---|---:|---|---|
| allgemeines Archiv | 29 | `archive-actions.js` | `archiveCurrent`, `deleteAt`, `importItems`, `reopenForRework` |
| Jahreswechsel | 26 | `year-transition-actions.js` | `createBilling`, `prepareNextYear` |
| Qualität | 14 | `quality-assurance.js` | `inspect`, `specialCases`, `finalBillingReadiness` |
| Diagnose | 10 | `diagnostics.js` | `releaseAuditReport`, `appSelfTestReport`, `developerSnapshot` |
| **Summe** | **79** | vier Module | keine AP10-Kompatibilitätswrapper |

Alle produktiven, UI-, Dokument-, Export- und testseitigen Aufrufer wurden auf die neuen Modul-APIs umgestellt. Alte Implementierungen sind nicht mehr in `app.js` enthalten. Details stehen im vollständigen JSON-/Markdown-Funktionsinventar.
