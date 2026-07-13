# AP9 – Vorher-/Nachher-Inventar von `app.js`

## Reproduzierbare Messung

Die Messung erfolgt mit `node tools/analyze-app-js.cjs`. Die Regeln sind in `AP9_BASELINE_INVENTORY.json` festgehalten. Direkte Zustandszugriffe werden als syntaktische Pfadreferenzen `state.<pfad>` beziehungsweise `state[<pfad>]` erfasst. Schreibstellen werden getrennt nach Property-Mutation und Root-Ersetzung gezählt.

| Kennzahl | V99.4.9 | V99.4.10 | Änderung |
|---|---:|---:|---:|
| Größe `js/app.js` | 539.972 Byte | 510.210 Byte | -29.762 Byte |
| Zeilen `js/app.js` | 9.026 | 8.287 | -739 |
| Top-Level-Funktionsdeklarationen | 655 | 596 | -59 netto |
| Top-Level-Bindungen | 68 | 67 | -1 |
| direkte `state`-Pfadreferenzen | 640 | 503 | -137 |
| direkte Property-Schreibstellen | 233 | 182 | -51 |
| Root-Ersetzungen `state = …` | 13 | 13 | 0 |
| gesamte direkte Schreibstellen | 246 | 195 | -51 |

## Einordnung

- **32** eigentliche Implementierungen wurden physisch in neue Module verschoben.
- **28** nach der Aufrufumstellung überflüssige Einzeilenweiterleitungen wurden entfernt.
- **60** frühere Top-Level-Funktionen sind damit entfernt.
- **1** neue Konfigurationsfunktion (`configureCoreOrchestrationModules`) wurde ergänzt.
- Netto sinkt der Bestand von **655 auf 596** Top-Level-Funktionsdeklarationen.
- Die Reduktion betrifft ausführbare Orchestrierung; Kommentare, Leerzeilen und Dokumentation wurden nicht als Modularisierung angerechnet.

## Verbleibende direkte Zustandszugriffe

Die verbleibenden 503 Pfadreferenzen und 195 Schreibstellen liegen überwiegend in noch nicht extrahierten Import-/Restore-, Archiv-/Jahreswechsel-, Rendering-, Dokument-UI-, Qualitäts-, Diagnose- und älteren Erfassungsabläufen. Sie sind im maschinenlesbaren Inventar mit Zeilenpositionen dokumentiert und bilden die Ausgangsbasis für AP10.
