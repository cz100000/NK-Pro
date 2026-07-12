# NK-Pro – Technical Debt Register

**Stand:** 12. Juli 2026  
**Basis:** V99.4.3  
**Bewertung:** kritisch, hoch, mittel, niedrig

## Register

| ID | Thema | Bewertung | Status | Kernaussage |
|---|---|---:|---|---|
| TD-001 | Monolithisches `js/app.js` | hoch | reduziert V99.4.3 | Persistenz, Migration und Archivgrenzen sind ausgelagert; Fach- und UI-Orchestrierung bleibt groß. |
| TD-002 | Eingebetteter großer SEED | mittel | abgeschlossen V99.4.1 | Ausgangsdaten liegen getrennt in `js/default-seed.js`. |
| TD-003 | Rekursive Archivsnapshots | kritisch | abgeschlossen V99.4.2 | Archivsnapshots werden auf eine feste fachliche Feldmenge begrenzt. |
| TD-004 | Kein explizites externes Vor-Migrationsbackup | kritisch | offen | Recovery existiert, aber keine garantierte exportierte Sicherung direkt vor jeder zukünftigen Schemamigration. |
| TD-005 | Kein allgemeiner Rollback | kritisch | offen | Es gibt Ein-Schritt-Recovery, aber keinen formalisierten Rückwärtsweg über mehrere Migrationen. |
| TD-006 | Historischer Hauptspeicherkey | mittel | offen | Aktuelle Version speichert weiterhin unter einem V85-benannten Schlüssel. |
| TD-007 | Viele Legacy-Speicherkeys | mittel | offen | Kompatibilität ist breit, aber Pflege und Testaufwand steigen. |
| TD-008 | Globaler Namensraum | hoch | reduziert V99.4.3 | Drei eingefrorene Modulnamespaces bestehen; globale Kompatibilitätsfunktionen bleiben wegen HTML und Tests. |
| TD-009 | Inline-Ereignisattribute | hoch | offen | HTML ist direkt an globale JavaScript-Namen gekoppelt. |
| TD-010 | Navigation weicht vom Zielbild ab | hoch | abgeschlossen V99.4.0 | Landingpage und vier Gruppen sind umgesetzt. |
| TD-011 | Abrechnungskontext mit Platzhalter | hoch | abgeschlossen V99.4.0 | Kontext erscheint nur bei geöffneter Abrechnung. |
| TD-012 | Keine durchgängige Zähler-ID | hoch | offen | Verwaltung und periodische Stände sind noch nicht formal getrennt. |
| TD-013 | Stammdaten-/Snapshot-Isolation | kritisch | abgeschlossen V99.4.2 | Datenvertrag, Projektion, Migration und Regression erzwingen die Grenze. |
| TD-014 | CSS-Spezifität und Historie | hoch | offen | Rund 3.100 Zeilen, viele ID-Selektoren und `!important`-Regeln. |
| TD-015 | Service-Worker nur teilweise integriert getestet | mittel | offen | Cachelogik wird simuliert und im Browser geprüft, aber kein vollständiger Offline-End-to-End-Test. |
| TD-016 | LocalStorage-Wachstum durch Archive | hoch | reduziert V99.4.2 | Rekursive und globale Vollkopien sind entfernt; Langzeitgrößen bleiben zu beobachten. |
| TD-017 | FNV-Prüfsumme nicht kryptografisch | mittel | akzeptiert | Geeignet gegen Zufallsbeschädigung, nicht als Manipulationsschutz. |
| TD-018 | Reale Daten in Auslieferung/Testdaten | hoch | offen | Veröffentlichung oder Repository-Nutzung kann vertrauliche Daten offenlegen. |
| TD-019 | Dokumentationsdrift | mittel | reduziert V99.4.3 | Releaseprüfung schützt Version, Module, Skriptreihenfolge, Datenvertrag und Pflichtdokumente. |
| TD-020 | Tests nutzen teilweise gemockten LocalStorage | mittel | reduziert V99.4.2 | Persistenzgrenzen laufen zusätzlich im echten Chromium-Kontext; dauerhaftes Browserprofil bleibt ungetestet. |
| TD-021 | Unklare Modul-Ladereihenfolge | hoch | abgeschlossen V99.4.3 | `index.html`, App-Start, Releaseprüfung und Service Worker sichern dieselbe Reihenfolge. |

## Detailmaßnahmen

### TD-001 / TD-008 – verbleibender Anwendungskern und globale Schnittstellen

**Erreicht in V99.4.3:**

- klare Dateien für Persistenz, Migration und Archiv,
- direkte `localStorage`-Zugriffe nur im Persistenzmodul,
- eingefrorene Namespaces,
- bestehende globale Aufrufe als kleine Kompatibilitätsschicht,
- vollständige Regression.

**Rest:** `js/app.js` enthält weiterhin Fachnormalisierung, Berechnung, UI, Briefe, Export und Orchestrierung. Weitere Auslagerungen müssen einzeln erfolgen. Globale HTML-Aufrufe werden erst nach einer eigenen Ereignisarchitektur reduziert.

### TD-003 / TD-013 / TD-016 – Archiv und Snapshot-Grenzen

**Status:** fachliche Kernmaßnahme in V99.4.2 abgeschlossen und in V99.4.3 unverändert in `js/archive.js` überführt.  
**Nachweis:** feste Snapshot-Feldmenge, keine verschachtelten Archive, keine Stammdaten- oder globale Historienkopie, idempotente Altarchivbegrenzung, Tests für Export, Recovery und Wiederbearbeitung.

### TD-004 / TD-005 – zukünftige Schemamigrationen

**Risiko:** Eine spätere Schemamigration könnte mehrere Datenebenen verändern, ohne exportierten unveränderlichen Vorzustand und allgemeinen Rückweg.  
**Nächste Maßnahme:** externes Vor-Migrationsbackup, Migrationsregistry, Vor-/Nachvalidierung und Restore-Test vor Schema 6.  
**Abschlusskriterium:** automatische Sicherung, idempotente Migration, getesteter Restore und Archivvergleich.

### TD-012 – Zähler-ID

**Risiko:** Zählerwechsel, Mieterwechsel und historische Messwerte können langfristig nicht eindeutig einer physischen Messeinrichtung zugeordnet werden.  
**Voraussetzung:** erst nach Abschluss von TD-004 und TD-005 umsetzen.

### TD-018 – Vertrauliche Daten

**Risiko:** ZIP, Repository oder GitHub Pages können persönliche und finanzielle Informationen veröffentlichen.  
**Maßnahme:** Anwendung, Produktivdaten und anonymisierte Testdaten vor öffentlicher Bereitstellung trennen.

## Priorität

1. externes Vor-Migrationsbackup und allgemeiner Rollback,
2. Zähler-ID und historische Zuordnung,
3. Datenschutz der Auslieferung,
4. weitere schrittweise Modularisierung,
5. CSS- und Druckkonsolidierung.
