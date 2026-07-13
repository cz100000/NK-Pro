# NK-Pro – Technische Schulden

**Basis:** V99.4.11

| ID | Thema | Priorität | Stand nach AP10 |
|---|---|---:|---|
| TD-001 | Umfang von `app.js` | hoch | 6.292 Zeilen; Archiv/Jahreswechsel/Qualität/Diagnose extrahiert; UI-/Renderer-Orchestrierung verbleibt |
| TD-002 | klassischer globaler Laufzeitkontext | hoch | 518 Top-Level-Funktionen und 67 Bindungen |
| TD-003 | 112 AP6-Kompatibilitätswrapper | mittel | unverändert rein/registriert; konkrete Alt-/Testabhängigkeiten verbleiben |
| TD-004 | direkte Zustandszugriffe in Altbereichen | hoch | 306 Referenzen, 96 Schreibstellen |
| TD-005 | Archiv-/Jahreswechselorchestrierung | erledigt | atomare Module, Einzelcommit und Rollback |
| TD-006 | Qualitäts-/Diagnoseorchestrierung | erledigt | isoliert lesend, stabile Codes, keine Persistenz/Renderer |
| TD-007 | Renderer- und Dokument-UI-Verantwortungsdichte | mittel | für Folgepakete offen |
| TD-008 | Legacy-Archive ohne vollständig rekonstruierbare Messwertbezüge | mittel | weiterhin unverändert als `legacy-partial` gekennzeichnet |
| TD-009 | tagesanteilige Verbrauchsschätzung ohne Zwischenablesung | mittel | weiterhin `estimated`; fachliche UI-Freigabe offen |
| TD-010 | browserabhängige lokale Persistenz | mittel | Backup-/Recovery-Fundament unverändert |
| TD-011 | paralleler Playwright-Teardown in Containerumgebung | niedrig | Tests fachlich erfolgreich; finale Freigabe seriell mit `--workers=1` |
