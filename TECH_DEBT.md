# NK-Pro – Technical Debt Register

**Stand:** 12. Juli 2026  
**Basis:** V99.4.4  
**Bewertung:** kritisch, hoch, mittel, niedrig

## Register

| ID | Thema | Bewertung | Status | Kernaussage |
|---|---|---:|---|---|
| TD-001 | Monolithisches `js/app.js` | hoch | reduziert V99.4.4 | Persistenz, Migration, Backup/Restore und Archivgrenzen sind ausgelagert; Fach- und UI-Orchestrierung bleibt groß. |
| TD-002 | Eingebetteter großer SEED | mittel | abgeschlossen V99.4.1 | Ausgangsdaten liegen getrennt in `js/default-seed.js`. |
| TD-003 | Rekursive Archivsnapshots | kritisch | abgeschlossen V99.4.2 | Archivsnapshots sind auf eine feste fachliche Feldmenge begrenzt. |
| TD-004 | Kein explizites externes Vor-Migrationsbackup | kritisch | abgeschlossen V99.4.4 | Vor erforderlichen Migrationen entsteht eine eindeutig identifizierte, prüfsummengeschützte und downloadbare Sicherungshülle. |
| TD-005 | Kein definierter Restore/Rollback | kritisch | abgeschlossen V99.4.4 | Interner und externer Restore, vorheriger Checkpoint und Rücknahme des letzten Restore sind implementiert und getestet. |
| TD-006 | Historischer Hauptspeicherkey | mittel | offen | Aktuelle Version speichert weiterhin unter einem V85-benannten Schlüssel. |
| TD-007 | Viele Legacy-Speicherkeys | mittel | offen | Kompatibilität ist breit, Pflege und Testaufwand steigen. |
| TD-008 | Globaler Namensraum | hoch | reduziert V99.4.4 | Vier eingefrorene Modulnamespaces bestehen; globale Kompatibilitätsfunktionen bleiben wegen HTML und Tests. |
| TD-009 | Inline-Ereignisattribute | hoch | offen | HTML ist teilweise direkt an globale JavaScript-Namen gekoppelt. |
| TD-010 | Navigation weicht vom Zielbild ab | hoch | abgeschlossen V99.4.0 | Landingpage und vier Gruppen sind umgesetzt. |
| TD-011 | Abrechnungskontext mit Platzhalter | hoch | abgeschlossen V99.4.0 | Kontext erscheint nur bei geöffneter Abrechnung. |
| TD-012 | Keine durchgängige Zähler-ID | hoch | offen | Verwaltung und periodische Stände sind noch nicht formal getrennt. |
| TD-013 | Stammdaten-/Snapshot-Isolation | kritisch | abgeschlossen V99.4.2 | Datenvertrag, Projektion und Regression erzwingen die Grenze. |
| TD-014 | CSS-Spezifität und Historie | hoch | offen | Viele ID-Selektoren und `!important`-Regeln erschweren Änderungen. |
| TD-015 | Kein vollständiger Offline-End-to-End-Test | mittel | offen | Cachelogik wird simuliert und im Browser geprüft, aber nicht mit komplett getrenntem Netzprofil. |
| TD-016 | LocalStorage-Wachstum durch Archive | hoch | reduziert V99.4.2 | Rekursive und globale Vollkopien sind entfernt; Langzeitgrößen bleiben zu beobachten. |
| TD-017 | FNV-Prüfsumme nicht kryptografisch | mittel | akzeptiert | Geeignet zur Integritäts- und Konsistenzprüfung, nicht als Echtheitsnachweis gegen gezielte Manipulation. |
| TD-018 | Reale Daten in Auslieferung/Testdaten | hoch | offen | Veröffentlichung kann persönliche und finanzielle Informationen offenlegen. |
| TD-019 | Dokumentationsdrift | mittel | reduziert V99.4.4 | Releaseprüfung schützt Version, Module, Registry, Skriptreihenfolge, Datenvertrag und Pflichtdokumente. |
| TD-020 | Kein dauerhaftes Browserprofil im Test | mittel | offen | Echte Chromium-Persistenz wird getestet, aber nicht über langfristige Profil- und Versionsfolgen. |
| TD-021 | Unklare Modul-Ladereihenfolge | hoch | abgeschlossen V99.4.3 | HTML, App-Start, Releaseprüfung und Service Worker sichern dieselbe Reihenfolge. |
| TD-022 | Nur je ein Vor-Migrationsbackup und Restore-Checkpoint | mittel | akzeptiert V99.4.4 | Keine unbegrenzte lokale Sicherungskette; externe Downloads bleiben für langfristige Aufbewahrung erforderlich. |

## Erreichte Schutzmaßnahmen V99.4.4

- zentrale, eingefrorene Migrationsregistry,
- transaktionale Migration auf Kopien,
- Vor-, Schritt- und Nachvalidierung,
- getrennte Vor-Migrationssicherung mit eindeutiger ID und Prüfsummen,
- externer Download und validierter Reimport,
- Restore-Checkpoint und Rücknahme,
- Fehlerabbruch ohne Teiländerung,
- 28 Browserregressionen einschließlich externem Restore.

## Nächste Priorität

1. dauerhafte Zähler-ID und Trennung von Zählerstammdaten und periodischen Messwerten,
2. Datenschutz der Auslieferung,
3. weitere schrittweise Modularisierung,
4. Offline-End-to-End-Test,
5. CSS- und Druckkonsolidierung.
