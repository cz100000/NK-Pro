# NK-Pro – Technische Schulden

**Basis:** V99.4.8

| ID | Thema | Priorität | Stand |
|---|---|---:|---|
| TD-001 | Umfang und Verantwortungsdichte von `app.js` | hoch | 9.014 Zeilen; Ereignisse und Controller ausgelagert, Orchestrierungsfunktionen verbleiben |
| TD-002 | klassischer globaler Laufzeitkontext | hoch | HTML-Aufrufe entfernt; 654 Top-Level-Funktionen und 68 lexikalische Bindungen bleiben intern sichtbar |
| TD-003 | 112 globale Kompatibilitätswrapper | mittel | rein und registriert; HTML-Abhängigkeit entfernt, interne/Testabhängigkeiten verbleiben |
| TD-004 | parallele Legacy-Erfassungsfelder und `zaehlerDaten` | hoch | UI nativ über AP5-Controller angebunden; interne Adapter bleiben für Datenkompatibilität |
| TD-005 | UI-, Archiv- und Stammdatenabläufe in `app.js` | hoch | klar dokumentiert; weitere Extraktion benötigt getrennte Regressionpakete |
| TD-006 | alte Archive ohne vollständig rekonstruierbare Messwertbezüge | mittel | unverändert als `legacy-partial` gekennzeichnet |
| TD-007 | tagesanteilige Verbrauchsschätzung ohne Zwischenablesung | mittel | als `estimated` markiert; fachliche UI-Freigabe ausstehend |
| TD-008 | browserabhängige lokale Persistenz | mittel | durch Backup-/Recovery-Fundament abgesichert |

## Erreichte Schutzmaßnahmen V99.4.7

- zentrale Berechnungsengine ohne DOM und Speicherzugriff,
- getrennte Dokumentdaten und Dokumentdarstellung,
- Exportservice ohne Parallelberechnung,
- Tabellenhilfen aus dem Monolithen entfernt,
- direkter Speicherzugriff auf zwei Adapter begrenzt,
- benannte Startorchestrierung,
- registrierte reine Kompatibilitätswrapper,
- vollständiges globales Inventar,
- zusätzliche Architektur- und Regressionstests.
