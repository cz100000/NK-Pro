# NK-Pro – Technical Debt Register

**Stand:** 12. Juli 2026  
**Bewertung:** kritisch, hoch, mittel, niedrig

## Register

| ID | Thema | Bewertung | Status | Kernaussage |
|---|---|---:|---|---|
| TD-001 | Monolithisches `js/app.js` | hoch | offen | Fast alle Fach-, Persistenz- und UI-Verantwortlichkeiten liegen in einer Datei. |
| TD-002 | Eingebetteter großer SEED | mittel | abgeschlossen V99.4.1 | Ausgangsdaten liegen getrennt in `js/default-seed.js`. |
| TD-003 | Rekursive Archivsnapshots | kritisch | abgeschlossen V99.4.2 | Archivsnapshots werden auf eine feste fachliche Feldmenge begrenzt. |
| TD-004 | Kein explizites externes Vor-Migrationsbackup | kritisch | offen | Recovery existiert, aber keine garantierte exportierte Sicherung direkt vor jeder zukünftigen Schemamigration. |
| TD-005 | Kein allgemeiner Rollback | kritisch | offen | Es gibt Ein-Schritt-Recovery, aber keinen formalisierten Rückwärtsweg über mehrere Migrationen. |
| TD-006 | Historischer Hauptspeicherkey | mittel | offen | Aktuelle Version speichert weiterhin unter einem V85-benannten Schlüssel. |
| TD-007 | Viele Legacy-Speicherkeys | mittel | offen | Kompatibilität ist breit, aber Pflege und Testaufwand steigen. |
| TD-008 | Globaler Namensraum | hoch | offen | Dateien und HTML hängen an globalen Variablen und Funktionsnamen. |
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
| TD-019 | Dokumentationsdrift | mittel | reduziert | Releaseprüfung und aktive Dokumente schützen die aktuelle Baseline. |
| TD-020 | Tests nutzen teilweise gemockten LocalStorage | mittel | reduziert V99.4.2 | Persistenzgrenzen laufen zusätzlich im echten Chromium-Kontext; dauerhaftes Browserprofil bleibt ungetestet. |

## Detailmaßnahmen

### TD-001 – Monolithisches `js/app.js`

**Risiko:** Änderungen an einem Bereich können unbemerkt andere Bereiche beeinflussen.  
**Maßnahme:** Persistenz, Normalisierung/Migration und Archiv zuerst entlang des V99.4.2-Datenvertrags ausgliedern. Keine gleichzeitige Fach- oder UI-Änderung.  
**Abschlusskriterium:** klare Dateigrenzen, identische globale Schnittstellen oder dokumentierte Migration, vollständige Regression.

### TD-003 / TD-013 / TD-016 – Archiv und Snapshot-Grenzen

**Status:** fachliche Kernmaßnahme in V99.4.2 abgeschlossen.  
**Nachweis:** feste Snapshot-Feldmenge, keine verschachtelten Archive, keine Stammdaten- oder globale Historienkopie, idempotente Altarchivbegrenzung, Tests für Export, Recovery und Wiederbearbeitung.  
**Rest:** Speicherentwicklung mit realen Langzeitständen weiter beobachten.

### TD-004 / TD-005 – zukünftige Schemamigrationen

**Risiko:** Eine spätere Schemamigration könnte mehrere Datenebenen verändern, ohne exportierten unveränderlichen Vorzustand und allgemeinen Rückweg.  
**Maßnahme:** vor Schema 6 ein externes Vor-Migrationsbackup, Migrationsregistry, Vor-/Nachvalidierung und Restore-Test implementieren.  
**Abschlusskriterium:** automatische Sicherung, idempotente Migration, getesteter Restore und Archivvergleich.

### TD-010 / TD-011 – Ziel-UX

**Status:** abgeschlossen in V99.4.0.  
**Nachweis:** genau zwei Landingpage-Einstiege, vier Accordion-Gruppen, alle bestehenden Funktionen erreichbar, kein Kontext ohne offene Abrechnung sowie automatisierte Tastatur-/ARIA-Prüfung.

### TD-012 – Zähler-ID

**Risiko:** Zählerwechsel, Mieterwechsel und historische Messwerte können langfristig nicht eindeutig einer physischen Messeinrichtung zugeordnet werden.  
**Maßnahme:** eigenes Zählerobjekt und separate Messwertentität entwerfen.  
**Abschlusskriterium:** stabile Zähler-ID, migrierte Historie, Tests für Wechsel und Archiv.

### TD-014 – CSS

**Risiko:** globale Regeländerungen beeinflussen Tabs und Drucklayout.  
**Maßnahme:** Komponenteninventar, visuelle Regression und schrittweise Spezifitätsreduktion.  
**Abschlusskriterium:** weniger globale Überschreibungen bei identischer Bildschirm- und Druckdarstellung.

### TD-018 – Vertrauliche Daten

**Risiko:** ZIP, GitHub-Repository oder GitHub Pages können persönliche und finanzielle Informationen veröffentlichen.  
**Maßnahme:** vor öffentlicher Bereitstellung Datenklassifizierung und Trennung von Anwendung, Produktivdaten und anonymisierten Testdaten.  
**Abschlusskriterium:** veröffentlichbares Paket enthält keine realen personenbezogenen oder finanziellen Daten.

## Priorität

1. technische Modularisierung von Persistenz, Migration und Archiv,
2. externes Vor-Migrationsbackup und allgemeiner Rollback vor Schema 6,
3. Zähler-ID und historische Zuordnung,
4. Datenschutz der Auslieferung,
5. CSS-Konsolidierung.
