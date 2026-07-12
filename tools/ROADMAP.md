# NK-Pro – Roadmap

**Basis:** V99.4.2 vom 12. Juli 2026  
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
- vollständige Regression.

## Phase 1 – UX-Grundgerüst ohne Datenmodelländerung

**Status: Abgeschlossen in V99.4.0**

- Landingpage mit genau zwei Einstiegen,
- Navigation in die Gruppen „Objekt vorbereiten“, „Nebenkosten abrechnen“, „Archiv“, „Extras“,
- vorhandene Tabs und Funktionen wiederverwendet,
- Bereich „Aktive Abrechnung“ nur bei tatsächlich geöffneter Abrechnung,
- Statuswerte vereinheitlicht,
- Berechnung und Datenschema unverändert.

## Phase 2 – Verbindliche Datenebenen und Snapshot-Grenzen

**Status: Abgeschlossen in V99.4.2**

Umgesetzt wurde der kompatible Weg innerhalb von Datenschema 5:

- aktueller Arbeitsstand als einzige schreibbare Laufzeitinstanz,
- Objektstammdaten und globale Zählerhistorie ausschließlich auf Arbeitsstandsebene,
- explizite Feldprojektion für Abrechnungs- und Archivsnapshots,
- keine rekursiven Archive, Stammdatenkopien, globalen Historienkopien oder technischen Speicher-/Recovery-Metadaten in Snapshots,
- idempotente Begrenzung bestehender Archive,
- getrennte Rollen für Gesamtbackup, Abrechnungs-JSON und Recovery,
- Wiederbearbeitung mit Erhalt aktueller Stammdaten, globaler Historie und des vollständigen Archivs,
- Fachberechnung, Referenzfälle und Datenschema unverändert.

Der verbindliche Vertrag steht in `DATENEBENEN_UND_SNAPSHOT_GRENZEN.md`.

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

V99.4.2 besitzt einen getrennten, integritätsgeschützten Ein-Schritt-Recovery-Stand und idempotente Archivbegrenzung. Für zukünftige Schemaversionen fehlen weiterhin:

- automatisches externes Vor-Migrationsbackup mit eigener ID,
- unveränderliche Sicherungsmetadaten,
- Migrationsplan-Registry,
- Validierung vor und nach jedem Schritt,
- allgemeiner Restore-/Rollback-Pfad,
- automatische Testmatrix über alle unterstützten Schemastände.

Diese Phase ist vor jeder neuen Schemaversion auszuführen.

## Phase 5 – Schrittweise technische Modularisierung

**Status: Nächster technischer Schritt**

Ziel: Risiken des monolithischen `js/app.js` reduzieren, ohne Framework oder Buildsystem und auf Grundlage des Datenebenenvertrags.

### Reihenfolge

1. Persistenz und Integrität,
2. Normalisierung und Migration,
3. Archiv und Snapshot-Projektion,
4. reine Hilfsfunktionen,
5. Zähler,
6. Briefe und Druck,
7. Rendering.

Jeder Schritt muss die bestehenden globalen Schnittstellen erhalten oder kontrolliert migrieren. Keine gleichzeitige Fach- oder UI-Änderung.

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

Persistenz, Normalisierung/Migration und Archivprojektion werden als erste stabile Module aus `js/app.js` herausgelöst. Der in V99.4.2 eingeführte Datenebenenvertrag bleibt dabei unverändert und wird durch dieselben Browser- und Referenztests geschützt.
