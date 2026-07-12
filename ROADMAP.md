# NK-Pro – Roadmap

**Basis:** Development Baseline vom 12. Juli 2026  
**Prinzip:** konservative Erweiterung, historische Daten zuerst

## Statuslegende

- **Abgeschlossen** – umgesetzt und geprüft
- **Geplant** – fachliches Ziel, noch nicht umgesetzt
- **Entscheidung erforderlich** – Stop-Regel vor Umsetzung
- **Später** – sinnvoll, aber nicht Voraussetzung des nächsten Schritts

## Phase 0 – Development Baseline

**Status: Abgeschlossen**

- vollständige Bestandsanalyse,
- verbindliche Dokumentationsstruktur,
- Entwicklungs- und Stop-Regeln,
- UX-Zielbild,
- Architektur- und Datenmodellbeschreibung,
- Test- und Releaseprozess,
- Risiko- und Tech-Debt-Register,
- keine funktionalen Änderungen,
- vollständige Regression.

## Phase 1 – UX-Grundgerüst ohne Datenmodelländerung

**Status: Abgeschlossen in V99.4.0**

Ziel: Das neue Bedienmodell mit möglichst geringer technischer Wirkung umsetzen.

### Umfang

- Landingpage mit genau zwei Einstiegen,
- Navigation in die Gruppen „Objekt vorbereiten“, „Nebenkosten abrechnen“, „Archiv“, „Extras“ überführen,
- vorhandene Tabs und Funktionen wiederverwenden,
- Bereich „Aktive Abrechnung“ nur bei tatsächlich geöffneter Abrechnung anzeigen,
- Statuswerte auf Bearbeitung, Nur Ansicht und Finalisiert vereinheitlichen,
- alle Funktionen erreichbar halten.

### Nicht Bestandteil

- kein neues Datenschema,
- keine Zähler-ID-Migration,
- keine Änderung der Berechnung,
- keine Änderung von Import-/Exportformaten,
- keine Änderung historischer Archive.

### Freigabekriterien

- neue Navigationstests,
- Tastatur- und ARIA-Prüfung,
- alle bisherigen Tests weiterhin grün und UX-Suite erweitert,
- identische Referenzergebnisse,
- Runtime-Daten unverändert.

## Phase 2 – Objektstandard und Abrechnungssnapshot

**Status: Entscheidung erforderlich**

Ziel: Standards für neue Abrechnungen formal und technisch von bestehenden Abrechnungen trennen.

### Vor Umsetzung zu entscheiden

- bestehendes `stammdaten`-Modell erweitern oder neue explizite `objektStandard`-Struktur einführen,
- vollständiger Snapshot oder referenzierte Definitionen mit Versionierung,
- Behandlung bestehender Abrechnungen,
- Behandlung archivierter Datensätze,
- Import-/Exportkompatibilität.

### Mindestanforderungen

- zwei Lösungswege mit Vor- und Nachteilen,
- automatische Vor-Migrationssicherung,
- Rollback,
- Test „Standardänderung verändert keine bestehende Abrechnung“,
- dokumentierte Nutzerentscheidung im WORKBOOK.

## Phase 3 – Zählerverwaltung und Zählerstände trennen

**Status: Entscheidung erforderlich**

Ziel: dauerhafte Zähleridentität und klare Trennung von Stammdaten und Messwerten.

### Zielmodell

**Zählerverwaltung**

- Zähler-ID,
- Zählernummer,
- Typ,
- Einheit,
- Zuordnung,
- Einbau,
- Ausbau,
- Status.

**Zählerstände**

- Zähler-ID,
- Abrechnungs-/Periodenbezug,
- Anfang,
- Ende,
- Verbrauch,
- Ablesedatum,
- Quelle.

### Kritische Fragen

- Ableitung stabiler IDs für vorhandene Wasser- und generische Zähler,
- Zählerwechsel innerhalb eines Jahres,
- Zuordnung bei Mieterwechsel,
- Erhalt historischer Excel-Werte,
- Umgang mit Hauszählern,
- Migration bestehender `waterMeters`, `meterReadings` und `waterMeterHistory`.

## Phase 4 – Migrations- und Sicherungsfundament

**Status: Entscheidung erforderlich**

Ziel: jede Migration reproduzierbar, rückgängig machbar und automatisch gesichert.

### Geplant

- Vor-Migrationssnapshot mit eigener ID,
- unveränderliche Sicherungsmetadaten,
- Migrationsplan-Registry,
- Validierung vor und nach jedem Schritt,
- definierter Restore-Pfad,
- Archiv-Migrationsstrategie,
- automatische Testmatrix über alle unterstützten Schemastände.

Diese Phase kann vor Phase 2 oder 3 vorgezogen werden, wenn dort eine Schemamigration erforderlich wird.

## Phase 5 – Schrittweise technische Modularisierung

**Status: Später**

Ziel: Risiken des monolithischen `js/app.js` reduzieren, ohne Framework oder Buildsystem.

### Reihenfolge

1. reine Hilfsfunktionen,
2. Speicher und Integrität,
3. Migrationen,
4. Archiv,
5. Zähler,
6. Briefe und Druck,
7. Rendering.

Jeder Schritt muss die bestehenden globalen Schnittstellen erhalten oder kontrolliert migrieren. Keine gleichzeitige Fachänderung.

## Phase 6 – CSS- und Druckkonsolidierung

**Status: Später**

- gemeinsame Komponenten dokumentieren,
- Spezifität schrittweise reduzieren,
- `!important`-Regeln gezielt abbauen,
- visuelle Regressionen ergänzen,
- Druck- und Fensterbriefregeln separat schützen.

## Phase 7 – Datenschutzgerechte Verteilung

**Status: Entscheidung erforderlich**

Ziel: klare Trennung zwischen produktivem persönlichem Datenstand und veröffentlichbarer Anwendung.

Mögliche Wege:

- neutrale leere Auslieferung plus separater Import,
- anonymisierte Demo-Daten,
- privates Repository,
- getrennte Testfixtures ohne reale Personen- oder Bankdaten.

## Nächster empfohlener Schritt

Vor Phase 2 ist die Stop-Regel auszuführen. Zu entscheiden ist, ob der Objektstandard innerhalb der vorhandenen `stammdaten`-Struktur erweitert oder als neue explizite Struktur eingeführt wird. Die Entscheidung muss Snapshot-Grenzen, Archive, Import/Export, Vor-Migrationsbackup und Wiederherstellung gemeinsam behandeln.

Bis zu dieser Entscheidung erfolgen keine funktionalen Änderungen an Objektstandards, Kostenarten, Umlageschlüsseln oder Zählern.
