# NK-Pro – verbindlicher Projektstand

**Stand:** 12. Juli 2026  
**Anwendung:** V99.4.2  
**Versionsname:** Verbindliche Datenebenen und Snapshot-Grenzen  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1  
**Ausgangsversion:** V99.4.1

## 1. Technische Grundlage

NK-Pro ist eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright dienen nur der Prüfung.

Die jeweils neueste ausdrücklich als verbindlich bezeichnete ZIP ist die alleinige technische Grundlage. Frühere Chats, Erinnerungen und ältere ZIPs dürfen keine technischen Annahmen liefern.

## 2. Verbindliche Datenebenen

1. **Aktueller Arbeitsstand:** einzige schreibbare Laufzeitinstanz im Hauptspeicherschlüssel.
2. **Objektstammdaten:** `stammdaten` ausschließlich im aktuellen Arbeitsstand und im Gesamtbackup.
3. **Globale Historie:** `waterMeterHistory` ausschließlich im aktuellen Arbeitsstand und im Gesamtbackup.
4. **Abrechnungssnapshot:** begrenzte fachliche Projektion einer Abrechnungsperiode.
5. **Jahresarchiv:** Sammlung aus Archivhülle, Zusammenfassung und genau einem begrenzten Abrechnungssnapshot.
6. **Gesamtsicherung:** vollständiger Arbeitsstand einschließlich Stammdaten, globaler Historie und begrenztem Jahresarchiv.
7. **Recovery:** genau ein getrennt gespeicherter vorheriger gültiger Arbeitsstand; keine Recovery-Kette im Nutzdatenbestand.

## 3. Verbindliche Snapshot-Grenzen

Abrechnungs- und Archivsnapshots enthalten ausschließlich abrechnungsbezogene Fachfelder. Ausgeschlossen sind insbesondere:

- `jahresArchiv`,
- `stammdaten`,
- `waterMeterHistory`,
- Speicherintegritäts-, Backup-, Recovery- und Viewer-Metadaten.

Archivansichten erhalten erforderliche Objektstammdaten und globale Zählerhistorie nur zur Laufzeit. Beim Wiederöffnen zur Bearbeitung bleiben die aktuellen Stammdaten, die globale Historie und das vollständige Jahresarchiv erhalten.

## 4. Migration und Kompatibilität

- Datenschema 5 bleibt unverändert.
- Bestehende Gesamt-JSON-Dateien und Archivhüllen bleiben importierbar.
- Vorhandene Archive werden beim Laden und vor dem Speichern idempotent auf die neue Grenze projiziert.
- Verschachtelte Archive, Stammdatenkopien, globale Historienkopien und technische Metadaten werden aus Archivsnapshots entfernt.
- Fach- und Periodendaten bleiben erhalten.
- Fehlende globale Zählerhistorie kann einmalig aus einem vorhandenen Altarchiv in den Arbeitsstand übernommen werden, bevor Altarchive begrenzt werden.

## 5. Unveränderte Bereiche

- keine Änderung der Berechnungslogik,
- keine Änderung der sechs fachlichen Referenzfälle,
- keine neue Schemaversion,
- keine optischen oder allgemeinen UI-Änderungen,
- keine Framework-, TypeScript- oder Buildsystem-Einführung.

Die einzige zusätzliche technische Korrektur beseitigt eine bestehende Ladeabhängigkeit: `js/default-seed.js` verwendet den bereits fachlich identischen Literalwert statt einer erst später geladenen Konstante.

## 6. Aktive Freigabenachweise

- JavaScript-Syntax: 6/6 produktive Einheiten bestanden,
- Referenzdaten: 6/6 logische Fälle semantisch unverändert,
- Release-, Datenvertrag-, Manifest- und PWA-Konsistenz: bestanden,
- Playwright-Browserregression: 21/21 Tests bestanden,
- darin Persistenz, Snapshot-Grenzen, Altarchivbegrenzung, Recovery, Wiederbearbeitung und Import-/Export-Rundlauf,
- vollständige Paketprüfsummen in `SHA256SUMS.txt`.

## 7. Nächstes Arbeitspaket

**Schrittweise Modularisierung von Persistenz, Migration und Archiv auf Grundlage des Datenebenenvertrags.**

Weiterhin offen bleiben ein explizites externes Vor-Migrationsbackup für zukünftige Schemaversionen und ein formalisierter allgemeiner Rollback über mehrere Migrationsschritte.
