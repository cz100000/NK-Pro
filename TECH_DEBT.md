# NK-Pro – Technische Schulden

**Basis:** V99.4.10

| ID | Thema | Priorität | Stand nach AP9 |
|---|---|---:|---|
| TD-001 | Umfang von `app.js` | hoch | 8.287 Zeilen; Kernorchestrierung reduziert; Archiv/Qualität/Diagnose/Rendering verbleiben |
| TD-002 | klassischer globaler Laufzeitkontext | hoch | 596 Top-Level-Funktionen und 67 Bindungen verbleiben |
| TD-003 | 112 AP6-Kompatibilitätswrapper | mittel | weiterhin rein und registriert; konkrete Alt-/Testabhängigkeiten verbleiben |
| TD-004 | direkte Zustandszugriffe in Altbereichen | hoch | 503 Referenzen, 195 Schreibstellen; AP9-Bereiche gekapselt |
| TD-005 | Archiv-/Jahreswechselorchestrierung | hoch | für AP10 vorgesehen |
| TD-006 | Qualitäts-/Diagnoseorchestrierung | hoch | für AP10 vorgesehen |
| TD-007 | Renderer- und Dokument-UI-Verantwortungsdichte | mittel | Darstellungsmodule getrennt; UI-Orchestrierung teilweise noch in `app.js` |
| TD-008 | Legacy-Archive ohne vollständig rekonstruierbare Messwertbezüge | mittel | unverändert als `legacy-partial` gekennzeichnet |
| TD-009 | tagesanteilige Verbrauchsschätzung ohne Zwischenablesung | mittel | als `estimated` markiert; fachliche UI-Freigabe ausstehend |
| TD-010 | browserabhängige lokale Persistenz | mittel | durch Backup-/Recovery-Fundament abgesichert |

## In AP9 erledigt

- 32 implementierungstragende Kernfunktionen physisch entfernt.
- 28 überflüssige Übergangsweiterleitungen entfernt.
- drei DOM-/speicherfreie Anwendungsmodulgrenzen.
- strukturierte UI-Ergebnisse statt Dialogen in Anwendungslogik.
- atomare Transaktion mit Einzelcommit und Rollback.
- versehentliche Zustandsersetzung durch Aktionsresultate ausgeschlossen.
- direkte Zustandsreferenzen um 135 und Schreibstellen um 51 reduziert.
