# AP10 – Vorher-/Nachher-Inventar

| Kennzahl `js/app.js` | V99.4.10 | V99.4.11 | Änderung |
|---|---:|---:|---:|
| Dateigröße | 510.210 Byte | 382.309 Byte | −127.901 (25,1 %) |
| Zeilen | 8.287 | 6.292 | −1.995 (24,1 %) |
| Top-Level-Funktionen | 596 | 518 | netto −78 |
| physisch entfernte Implementierungen | – | 79 | 79 entfernt; 1 Infrastrukturhelfer ergänzt |
| Top-Level-Bindungen | 67 | 67 | unverändert |
| direkte `state`-Pfadreferenzen | 503 | 306 | −197 |
| direkte Schreibstellen | 195 | 96 | −99 |
| Root-Ersetzungen | 13 | 10 | −3 |
| Commit-Aufrufe | 22 | 18 | −4 |
| Speicheraufrufe | 10 | 7 | −3 |
| Renderingaufrufe | 138 | 128 | −10 |
| dynamische Globalzugriffe | 1 | 0 | entfernt |

79 Funktionen wurden tatsächlich aus `app.js` entfernt. Der Nettoabbau beträgt 78, weil `withIsolatedState()` als einzige neue Infrastrukturgrenze ergänzt wurde. Die 112 AP6-Weiterleitungen bleiben unverändert; AP10 ergänzt keine neue Weiterleitung.
