# NK-Pro – Roadmap

**Basis:** V99.4.3 vom 12. Juli 2026  
**Datenschema:** 5  
**Datenebenenvertrag:** 1

## Statuslegende

- **Abgeschlossen:** umgesetzt und automatisiert geprüft.
- **Nächster Schritt:** technisch vorbereitet und als nächstes Arbeitspaket empfohlen.
- **Entscheidung erforderlich:** Datenmodell, Migration oder Produktentscheidung muss vor Umsetzung freigegeben werden.
- **Später:** sinnvoll, aber nicht vor den priorisierten Schutzmaßnahmen.

## Phase 0 – Development Baseline

**Status: Abgeschlossen**

- verbindliche Quellenhierarchie,
- Stop-Regel für Datenmodell, Migration, Archiv und Fachlogik,
- Referenzfälle und Browserregression,
- aktive Architektur-, Test- und Risikodokumentation.

## Phase 1 – UX-Grundgerüst ohne Datenmodelländerung

**Status: Abgeschlossen in V99.4.0**

- Landingpage mit zwei Einstiegen,
- vier Navigationsgruppen,
- sichtbarer Abrechnungskontext nur bei geöffneter Abrechnung,
- bestehende Funktionen vollständig weiterverwendet.

## Phase 2 – Verbindliche Datenebenen und Snapshot-Grenzen

**Status: Abgeschlossen in V99.4.2**

- Arbeitsstand, Stammdaten, globale Historie, Snapshot, Archiv, Gesamtbackup und Recovery abgegrenzt,
- feste Snapshot-Feldmenge,
- keine rekursiven Archive oder globalen Vollkopien in Archivsnapshots,
- idempotente Altarchivbegrenzung,
- Wiederbearbeitung mit Erhalt aktueller Objekt- und Archivdaten.

## Phase 3 – Erste technische Modularisierung

**Status: Abgeschlossen in V99.4.3**

- Persistenz und Integrität nach `js/persistence.js` ausgelagert,
- Schemamigration und Altarchivübernahme nach `js/migration.js` ausgelagert,
- Snapshot- und Archivgrenzen nach `js/archive.js` ausgelagert,
- kleine globale Kompatibilitätsschicht erhalten,
- direkter Browser-Speicherzugriff ausschließlich im Persistenzmodul,
- Skriptreihenfolge und PWA-App-Shell automatisiert geschützt.

## Phase 4 – Migrations- und Sicherungsfundament

**Status: Nächster technischer Schritt**

Vor Datenschema 6 erforderlich:

- unveränderliches externes Vor-Migrationsbackup,
- formalisierte Migrationsregistry,
- Vor- und Nachvalidierung je Schritt,
- Abbruch ohne Teilpersistenz bei Fehlern,
- allgemeiner Rollback über mehrere Migrationsschritte,
- Restore-Test für Arbeitsstand und sämtliche Archive.

V99.4.3 besitzt weiterhin nur einen getrennten, integritätsgeschützten Ein-Schritt-Recovery-Stand. Dieser ersetzt kein externes Vor-Migrationsbackup.

## Phase 5 – Zählerverwaltung und Zählerstände trennen

**Status: Entscheidung erforderlich**

Zielmodell:

- dauerhafte Zähler-ID,
- getrennte Zählerstammdaten und periodische Messwerte,
- eindeutige Zuordnung bei Zähler- und Mieterwechsel,
- Migration der historischen Referenzen,
- Archiv- und Restore-Tests.

Diese Phase darf erst nach dem Migrations- und Sicherungsfundament umgesetzt werden.

## Phase 6 – Weitere schrittweise Modularisierung

**Status: Später**

Mögliche Reihenfolge:

1. Import-/Export-Orchestrierung,
2. Berechnungsdienste je Fachbereich,
3. Brief- und Drucklogik,
4. Render- und UI-Helfer,
5. schrittweise Reduktion globaler HTML-Ereignisnamen.

Jede Auslagerung bleibt ein eigenes Arbeitspaket. Keine gleichzeitige Fach-, Schema- und UI-Änderung.

## Phase 7 – CSS- und Druckkonsolidierung

**Status: Später**

- Komponenteninventar,
- visuelle Regression,
- Spezifität und `!important` schrittweise reduzieren,
- Druck- und Fensterbriefregeln separat schützen.

## Phase 8 – Datenschutzgerechte Verteilung

**Status: Entscheidung erforderlich**

- produktive persönliche Daten von veröffentlichbarer Anwendung trennen,
- neutrale oder anonymisierte Auslieferungsdaten,
- private und öffentliche Paketvarianten klar abgrenzen,
- Repository- und Pages-Freigabe nur nach Datenklassifizierung.

## Nächster empfohlener Schritt

Externes Vor-Migrationsbackup und allgemeiner Rollback vor Datenschema 6. Das Arbeitspaket muss die neue Modulstruktur verwenden, darf aber Datenschema 5 und bestehende Austauschformate nur nach gesonderter Freigabe verändern.
