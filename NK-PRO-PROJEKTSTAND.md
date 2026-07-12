# NK-Pro – verbindlicher Projektstand

**Stand:** 12. Juli 2026  
**Anwendung:** V99.4.3  
**Versionsname:** Modularisierung von Persistenz, Migration und Archiv  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1, unverändert  
**Ausgangsversion:** V99.4.2

## 1. Technische Grundlage

NK-Pro ist eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright dienen nur der Prüfung.

Die jeweils neueste ausdrücklich als verbindlich bezeichnete ZIP ist die alleinige technische Grundlage. Frühere Chats, Erinnerungen und ältere ZIPs dürfen keine technischen Annahmen liefern.

## 2. Produktive Module und Ladefolge

Die technische Kernlogik ist in folgende Dateien getrennt:

1. `js/persistence.js`: Browser-Speicheradapter, Prüfsumme und Integritätsmetadaten,
2. `js/migration.js`: Datenschemaermittlung, Migration bis Schema 5 und Altarchivübernahme,
3. `js/archive.js`: Snapshot-Projektion, Archivnormalisierung und Datenebenenvertrag,
4. `js/default-seed.js`: Ausgangsdaten,
5. `js/app.js`: zentraler Zustand, Fachlogik, UI-Orchestrierung, Briefe und Export.

`index.html` lädt die drei Kernmodule zwingend vor `default-seed.js` und `app.js`. `app.js` prüft die vollständige Modulladung beim Start. Die bestehenden globalen Funktionen bleiben als kleine Kompatibilitätsschicht erhalten.

Nur `js/persistence.js` greift direkt auf `localStorage` zu. Migration und Archiv sind von DOM und Browser-Speicher getrennt und erhalten benötigte Fachhelfer explizit.

## 3. Verbindliche Datenebenen

1. **Aktueller Arbeitsstand:** einzige schreibbare Laufzeitinstanz im Hauptspeicherschlüssel.
2. **Objektstammdaten:** `stammdaten` ausschließlich im aktuellen Arbeitsstand und im Gesamtbackup.
3. **Globale Historie:** `waterMeterHistory` ausschließlich im aktuellen Arbeitsstand und im Gesamtbackup.
4. **Abrechnungssnapshot:** begrenzte fachliche Projektion einer Abrechnungsperiode.
5. **Jahresarchiv:** Sammlung aus Archivhülle, Zusammenfassung und genau einem begrenzten Abrechnungssnapshot.
6. **Gesamtsicherung:** vollständiger Arbeitsstand einschließlich Stammdaten, globaler Historie und begrenztem Jahresarchiv.
7. **Recovery:** genau ein getrennt gespeicherter vorheriger gültiger Arbeitsstand; keine Recovery-Kette im Nutzdatenbestand.

## 4. Verbindliche Snapshot-Grenzen

Abrechnungs- und Archivsnapshots enthalten ausschließlich abrechnungsbezogene Fachfelder. Ausgeschlossen sind insbesondere:

- `jahresArchiv`,
- `stammdaten`,
- `waterMeterHistory`,
- Speicherintegritäts-, Backup-, Recovery- und Viewer-Metadaten.

Archivansichten erhalten erforderliche Objektstammdaten und globale Zählerhistorie nur zur Laufzeit. Beim Wiederöffnen zur Bearbeitung bleiben die aktuellen Stammdaten, die globale Historie und das vollständige Jahresarchiv erhalten.

## 5. Migration und Kompatibilität

- Datenschema 5 bleibt unverändert.
- Datenebenenvertrag 1 und Snapshot-Rolle `billingSnapshot` bleiben unverändert.
- Bestehende Gesamt-JSON-Dateien, Abrechnungsdateien und Archivhüllen bleiben importierbar.
- Vorhandene Archive werden weiterhin idempotent auf die feste Snapshot-Grenze projiziert.
- Hauptstand und genau ein Recovery-Stand bleiben getrennt und integritätsgeschützt.
- Die Modularisierung erfordert keine Datenmigration und keine Rückmigration.

## 6. Unveränderte Bereiche

- keine Änderung der Berechnungslogik,
- keine Änderung der sechs fachlichen Referenzfälle,
- keine neue Schemaversion,
- keine Änderung des Datenebenenvertrags,
- keine optischen oder allgemeinen UI-Änderungen,
- keine Änderung von Backup-, Recovery- oder Austauschformaten,
- keine Framework-, TypeScript- oder Buildsystem-Einführung,
- kein externes Vor-Migrationsbackup und kein allgemeiner mehrstufiger Rollback.

## 7. Aktive Freigabenachweise

- JavaScript-Syntax: 9/9 produktive Einheiten bestanden,
- Referenzdaten: 6/6 logische Fälle semantisch unverändert,
- Release-, Modul-, Datenvertrag-, Manifest- und PWA-Konsistenz: bestanden,
- Playwright-Browserregression: 22/22 Tests bestanden,
- darin Modulreihenfolge, Kompatibilitätsschicht, Persistenz, Snapshot-Grenzen, Altarchivbegrenzung, Recovery, Wiederbearbeitung und Import-/Export-Rundlauf,
- vollständige Paketprüfsummen in `SHA256SUMS.txt`.

## 8. Nächstes Arbeitspaket

**Externes Vor-Migrationsbackup und allgemeiner Rollback vor Datenschema 6.**

Weiterhin offen bleiben insbesondere eine dauerhafte Zähler-ID, Datenschutztrennung für veröffentlichbare Pakete und die schrittweise weitere Reduktion des verbleibenden `app.js`-Monolithen.
