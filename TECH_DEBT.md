# NK-Pro – Technical Debt Register

**Stand:** 12. Juli 2026  
**Bewertung:** kritisch, hoch, mittel, niedrig

## Register

| ID | Thema | Bewertung | Status | Kernaussage |
|---|---|---:|---|---|
| TD-001 | Monolithisches `js/app.js` | hoch | offen | Fast alle Fach- und UI-Verantwortlichkeiten liegen in einer Datei. |
| TD-002 | Eingebetteter großer SEED | mittel | offen | Ausgangs-, Arbeits- und Archivdaten sind als großes Literal im JavaScript gebunden. |
| TD-003 | Rekursive Archivsnapshots | kritisch | offen | Archive enthalten vollständige Daten und werden bei Migration rekursiv normalisiert. |
| TD-004 | Kein explizites Vor-Migrationsbackup | kritisch | offen | Recovery existiert, aber keine garantierte Sicherung direkt vor jeder Migration. |
| TD-005 | Kein allgemeiner Rollback | kritisch | offen | Migrationen haben keinen formalisierten Rückwärtsweg. |
| TD-006 | Historischer Hauptspeicherkey | mittel | offen | Aktuelle Version speichert weiterhin unter einem V85-benannten Schlüssel. |
| TD-007 | Viele Legacy-Speicherkeys | mittel | offen | Kompatibilität ist breit, aber Pflege und Testaufwand steigen. |
| TD-008 | Globaler Namensraum | hoch | offen | Dateien und HTML hängen an globalen Variablen und Funktionsnamen. |
| TD-009 | Inline-Ereignisattribute | hoch | offen | HTML ist direkt an globale JavaScript-Namen gekoppelt. |
| TD-010 | Navigation weicht vom Zielbild ab | hoch | abgeschlossen V99.4.0 | Landingpage und vier Gruppen sind umgesetzt. |
| TD-011 | Abrechnungskontext mit Platzhalter | hoch | abgeschlossen V99.4.0 | Kontext erscheint nur bei geöffneter Abrechnung. |
| TD-012 | Keine durchgängige Zähler-ID | hoch | offen | Verwaltung und periodische Stände sind noch nicht formal getrennt. |
| TD-013 | Stammdaten-/Snapshot-Isolation nicht formal garantiert | kritisch | offen | Merge- und Übernahmewege benötigen stärkere Grenzen und Tests. |
| TD-014 | CSS-Spezifität und Historie | hoch | offen | Rund 3.100 Zeilen, viele ID-Selektoren und `!important`-Regeln. |
| TD-015 | Service-Worker nur teilweise integriert getestet | mittel | offen | Cachelogik wird simuliert, kein vollständiger echter Offline-End-to-End-Test. |
| TD-016 | LocalStorage-Wachstum durch Archive | hoch | offen | Vollständige Snapshots können Browsergrenzen erreichen. |
| TD-017 | FNV-Prüfsumme nicht kryptografisch | mittel | akzeptiert | Geeignet gegen Zufallsbeschädigung, nicht als Manipulationsschutz. |
| TD-018 | Reale Daten in Auslieferung/Testdaten | hoch | offen | Veröffentlichung oder Repository-Nutzung kann vertrauliche Daten offenlegen. |
| TD-019 | Dokumentationsdrift | mittel | reduziert | Baseline korrigiert veraltete Verweise und führt Pflegepflicht ein. |
| TD-020 | Tests nutzen gemockten LocalStorage | mittel | offen | Persistenzlogik wird isoliert geprüft, nicht vollständig im echten Browserprofil. |

## Detailmaßnahmen

### TD-001 – Monolithisches `js/app.js`

**Risiko:** Änderungen an einem Bereich können unbemerkt andere Bereiche beeinflussen.  
**Maßnahme:** Erst nach UX-Stabilisierung schrittweise nach vorhandenen Verantwortlichkeiten aufteilen. Keine gleichzeitige Fachänderung.  
**Abschlusskriterium:** klare Dateigrenzen, identische globale Schnittstellen oder dokumentierte Migration, vollständige Regression.

### TD-003 / TD-004 / TD-005 – Archiv und Migration

**Risiko:** Historische Daten können bei einer neuen Normalisierung verändert werden, ohne dass ein exportierter Vorzustand existiert.  
**Maßnahme:** Vor jeder neuen Schemaversion zuerst Sicherungs- und Rollbackstandard implementieren.  
**Abschlusskriterium:** automatische Sicherung, idempotente Migration, Restore-Test, Archivvergleich.

### TD-010 / TD-011 – Ziel-UX

**Status:** abgeschlossen in V99.4.0.  
**Nachweis:** genau zwei Landingpage-Einstiege, vier Accordion-Gruppen, alle bestehenden Funktionen erreichbar, kein Kontext ohne offene Abrechnung sowie automatisierte Tastatur-/ARIA-Prüfung.

### TD-012 – Zähler-ID

**Risiko:** Zählerwechsel, Mieterwechsel und historische Messwerte können langfristig nicht eindeutig einer physischen Messeinrichtung zugeordnet werden.  
**Maßnahme:** eigenes Zählerobjekt und separate Messwertentität entwerfen.  
**Abschlusskriterium:** stabile Zähler-ID, migrierte Historie, Tests für Wechsel und Archiv.

### TD-013 – Objektstandard

**Risiko:** spätere Änderungen an zentralen Daten könnten bestehende Abrechnungen beeinflussen.  
**Maßnahme:** Snapshot-Vertrag definieren und technisch erzwingen.  
**Abschlusskriterium:** automatisierter Nachweis, dass Standardänderungen bestehende und archivierte Abrechnungen nicht verändern.

### TD-014 – CSS

**Risiko:** globale Regeländerungen beeinflussen Tabs und Drucklayout.  
**Maßnahme:** Komponenteninventar, visuelle Regression und schrittweise Spezifitätsreduktion.  
**Abschlusskriterium:** weniger globale Überschreibungen bei identischer Bildschirm- und Druckdarstellung.

### TD-016 – Speicherwachstum

**Risiko:** Browser-Speicher wird mit vollständigen Archiven zu groß.  
**Maßnahme:** zunächst Größenmessung über reale Langzeitstände; danach zwei sichere Archivstrategien bewerten.  
**Abschlusskriterium:** getesteter Umgang mit großen Archiven ohne Verlust der Offline-Fähigkeit.

### TD-018 – Vertrauliche Daten

**Risiko:** ZIP, GitHub-Repository oder GitHub Pages können persönliche und finanzielle Informationen veröffentlichen.  
**Maßnahme:** vor öffentlicher Bereitstellung Datenklassifizierung und Trennung von Anwendung, Produktivdaten und anonymisierten Testdaten.  
**Abschlusskriterium:** veröffentlichbares Paket enthält keine realen personenbezogenen oder finanziellen Daten.

## Priorität

1. Migration/Backup/Rollback,
2. Objektstandard-/Snapshot-Sicherheit,
3. Zähler-ID und historische Zuordnung,
4. Datenschutz der Auslieferung,
5. technische Modularisierung,
6. CSS-Konsolidierung.
