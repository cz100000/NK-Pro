# NK-Pro – Technische Schulden

**Basis:** V99.4.7

| ID | Thema | Priorität | Stand |
|---|---|---:|---|
| TD-001 | Umfang und Verantwortungsdichte von `app.js` | hoch | von 10.248 auf 9.030 Zeilen reduziert; 534 Implementierungsfunktionen verbleiben |
| TD-002 | globaler Laufzeitkontext und 71 Top-Level-Bindungen | hoch | inventarisiert; schrittweiser Controller-/Dependency-Injection-Umbau ausstehend |
| TD-003 | 112 globale Kompatibilitätswrapper | mittel | rein und registriert; Entfernung erst nach Ablösung von Inline- und Legacy-Aufrufen |
| TD-004 | parallele Legacy-Erfassungsfelder und `zaehlerDaten` | hoch | kompatibler Eingabeadapter; native UI ausstehend |
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
