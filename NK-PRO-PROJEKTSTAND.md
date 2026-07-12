# NK-Pro – verbindlicher Projektstand

**Stand:** 12. Juli 2026  
**Anwendung:** V99.4.4  
**Versionsname:** Migrations-, Sicherungs-, Restore- und Rollback-Fundament  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1, unverändert  
**Ausgangsversion:** V99.4.3

## 1. Technische Grundlage

NK-Pro ist eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright dienen nur der Prüfung.

Die jeweils neueste ausdrücklich als verbindlich bezeichnete ZIP ist die alleinige technische Grundlage. Frühere Chats, Erinnerungen und ältere ZIPs dürfen keine technischen Annahmen liefern.

## 2. Produktive Module und Ladefolge

1. `js/persistence.js`: Browser-Speicheradapter, Prüfsumme und Integritätsmetadaten,
2. `js/migration.js`: Registry, Migrationspfade, Validierung und transaktionale Ausführung,
3. `js/backup-recovery.js`: Sicherungshüllen, Prüfsummen, Restore und Checkpoint-Grundlage,
4. `js/archive.js`: Snapshot-Projektion, Archivnormalisierung und Datenebenenvertrag,
5. `js/default-seed.js`: Ausgangsdaten,
6. `js/app.js`: zentraler Zustand, Fachlogik, UI- und Ablaufsteuerung.

`index.html` lädt alle vier Kernmodule zwingend vor `default-seed.js` und `app.js`. `app.js` prüft die vollständige Modulladung beim Start. Bestehende globale Funktionen bleiben als kleine Kompatibilitätsschicht erhalten.

Nur `js/persistence.js` greift direkt auf `localStorage` zu. Migration, Backup/Restore und Archiv erhalten Speicher- und Fachabhängigkeiten ausschließlich über klar definierte Optionen.

## 3. Verbindliche Datenebenen

1. **Aktueller Arbeitsstand:** einzige schreibbare Laufzeitinstanz im Hauptspeicherschlüssel.
2. **Objektstammdaten:** `stammdaten` ausschließlich im aktuellen Arbeitsstand und im Gesamtbackup.
3. **Globale Historie:** `waterMeterHistory` ausschließlich im aktuellen Arbeitsstand und im Gesamtbackup.
4. **Abrechnungssnapshot:** begrenzte fachliche Projektion einer Abrechnungsperiode.
5. **Jahresarchiv:** Sammlung aus Archivhülle, Zusammenfassung und genau einem begrenzten Abrechnungssnapshot.
6. **Gesamtsicherung:** vollständiger Arbeitsstand einschließlich Stammdaten, globaler Historie und begrenztem Jahresarchiv.
7. **Recovery:** genau ein getrennt gespeicherter vorheriger gültiger Arbeitsstand.
8. **Vor-Migrationssicherung:** vollständige unveränderte Quelle vor einer erforderlichen Migration, getrennt vom Arbeits- und Recovery-Stand.
9. **Restore-Checkpoint:** letzter gültiger Arbeitsstand unmittelbar vor einem Restore.

## 4. Verbindliche Snapshot-Grenzen

Abrechnungs- und Archivsnapshots enthalten ausschließlich abrechnungsbezogene Fachfelder. Ausgeschlossen sind insbesondere `jahresArchiv`, `stammdaten`, `waterMeterHistory` sowie Speicherintegritäts-, Backup-, Migrations-, Restore-, Recovery- und Viewer-Metadaten.

Archivansichten erhalten erforderliche Objektstammdaten und globale Zählerhistorie nur zur Laufzeit. Beim Wiederöffnen zur Bearbeitung bleiben aktuelle Stammdaten, globale Historie und vollständiges Jahresarchiv erhalten.

## 5. Migration, Sicherung und Kompatibilität

- Datenschema 5 bleibt unverändert.
- Datenebenenvertrag 1 und Snapshot-Rolle `billingSnapshot` bleiben unverändert.
- Registry-Pfade: `1→2`, `2→4`, `3→4`, `4→5`.
- Vor jeder im Ladepfad erforderlichen Datenmigration wird der vollständige Quelldatensatz als Sicherungshülle erzeugt.
- Migrationen laufen ausschließlich auf einer Kopie und werden nur vollständig übernommen.
- Vor-, Schritt- und Nachvalidierung verhindern unvollständige Übernahmen.
- Fehlgeschlagene Migrationen verändern weder die Quelle noch den gespeicherten Hauptstand.
- Vor-Migrationssicherung und Restore-Checkpoint besitzen getrennte Speicherbereiche.
- Sicherungshüllen enthalten eindeutige IDs und Prüfsummen für Nutzdaten, Metadaten und Gesamthülle.
- Bestehende Gesamt-JSON-Dateien, Abrechnungsdateien, Archivhüllen und Produktivdaten bleiben importierbar.

## 6. Unveränderte Bereiche

- keine Änderung der Berechnungslogik,
- keine Änderung der sechs fachlichen Referenzfälle,
- keine neue Schemaversion,
- keine Änderung des Datenebenenvertrags,
- keine optischen oder allgemeinen UI-Änderungen,
- keine Framework-, TypeScript- oder Buildsystem-Einführung.

Funktional ergänzt wurden ausschließlich Sicherungs-, Migrations-, Restore- und Rollback-Aktionen im bereits vorhandenen Sicherungsbereich.

## 7. Aktive Freigabenachweise

- JavaScript-Syntax einschließlich neuem Backup-/Restore-Modul,
- sechs kanonische Referenzfälle,
- Release-, Modul-, Registry-, Datenvertrag-, Manifest- und PWA-Konsistenz,
- Browserregression für Start, Navigation, Fachlogik, Persistenz, Archive und Exporte,
- Registry-Pfad und transaktionale Migration,
- Fehlersimulation ohne Teiländerung,
- Sicherungshüllenvalidierung und Manipulationserkennung,
- Vor-Migrationssicherung beim Start mit Schema-4-Daten,
- atomare optionale Archivmigration bei bereits aktuellem Arbeitsstand,
- externer Restore über den JSON-Import mit Rollback-Checkpoint,
- 10/10 JavaScript-Einheiten, 6/6 Referenzfälle und 28/28 Playwright-/Chromium-Tests.

## 8. Nächstes Arbeitspaket

**Zählerverwaltung und periodische Zählerstände mit dauerhafter Zähler-ID trennen.**

Weiterhin offen bleiben insbesondere Datenschutztrennung für veröffentlichbare Pakete, weitere schrittweise Modularisierung und CSS-/Druckkonsolidierung.
