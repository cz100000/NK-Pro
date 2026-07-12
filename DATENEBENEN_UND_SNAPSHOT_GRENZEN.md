# NK-Pro – Verbindliche Datenebenen und Snapshot-Grenzen

**Arbeitspaket:** 1  
**Ausgangsversion:** V99.4.1  
**Zielversion:** V99.4.2  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1  
**Stand:** 12. Juli 2026

## 1. Ist-Zustand vor der Änderung

Der zentrale Laufzeitzustand `state` enthielt gleichzeitig:

- aktuelle Arbeits- und Abrechnungsdaten,
- objektweite Stammdaten unter `stammdaten`,
- historische Zählerreferenzen unter `waterMeterHistory`,
- Jahresarchive unter `jahresArchiv`,
- Backup-Ereignisse und Speicherintegritätsdaten in `meta`.

Die Hauptdaten lagen geschützt im `localStorage` unter `STORAGE_KEY`. Der unmittelbar vorherige gültige Gesamtstand lag getrennt unter `STORAGE_RECOVERY_KEY`. Externe Gesamt-JSON-Sicherungen enthielten den vollständigen Arbeitsstand einschließlich Jahresarchiv; Abrechnungs-JSON und Archivexporte sollten nur den jeweiligen Abrechnungsstand enthalten.

Die bisherige Archivnormalisierung verwendete jedoch dieselbe Vollzustandsnormalisierung wie der Arbeitsstand. Dadurch konnten in ältere oder importierte Archivdatensätze erneut `jahresArchiv`, `stammdaten`, globale Historien und Speicher-/Backup-Metadaten gelangen. Besonders `mergePreloadedV41Archives` konnte bei einer Archivnormalisierung das vollständige vorbelegte Archiv erneut in einen Archivdatensatz einsetzen. Das erzeugte rekursive oder unnötig vollständige Kopien und unnötiges `localStorage`-Wachstum.

## 2. Auswirkungen

Ohne Abgrenzung bestanden folgende Risiken:

- ein Archivdatensatz konnte weitere Archivdatensätze enthalten,
- objektweite Stammdaten und globale Zählerhistorie wurden je Abrechnungsjahr dupliziert,
- Backup- und Recovery-Metadaten wurden Bestandteil fachlicher Archivstände,
- Archivgröße und Speicherbedarf wuchsen überproportional,
- Migration und Validierung liefen rekursiv über fachlich irrelevante Kopien,
- Wiederbearbeitung konnte veraltete Stammdaten aus einem Archiv in den aktuellen Objektstandard zurückschreiben.

Fachberechnung, Mieter-, Wohnungs-, Kosten-, Vorauszahlungs-, Umlage-, Zähler-, Brief- und historische Einzelabrechnungsdaten durften dabei nicht verloren gehen.

## 3. Bewertete Lösungswege

### Weg A – neues Datenschema mit vollständig getrennten Containern

Ein neues Schema hätte `masterData`, `currentBilling`, `history`, `archives` und `persistence` als getrennte Top-Level-Container eingeführt.

**Vorteile**

- stärkste formale Trennung,
- langfristig gut modularisierbar,
- Austauschformate könnten eindeutig typisiert werden.

**Nachteile**

- große Migration sämtlicher produktiver Zugriffe,
- hohes Regressionsrisiko in der monolithischen `app.js`,
- Änderung aller Import-/Exportformate,
- Rückweg und Altdateikompatibilität deutlich aufwendiger,
- überschreitet den kleinsten tragfähigen Patch.

### Weg B – kompatible Datenverträge und begrenzte Snapshot-Projektion

Der bestehende Arbeitszustand bleibt erhalten. Für Archiv- und Abrechnungssnapshots wird eine explizite Projektion mit erlaubten fachlichen Feldern verwendet. Verboten sind insbesondere verschachtelte Archive, objektweite Stammdaten, globale Historienkopien sowie Speicher-, Backup-, Recovery- und Viewer-Metadaten. Archivnormalisierung erhält einen eigenen Modus und darf keine vorbelegten Archive nachladen.

**Vorteile**

- Datenschema 5 und bestehende Importstruktur bleiben kompatibel,
- kleiner, kontrollierbarer Patch,
- rekursive Archive werden unmittelbar verhindert,
- historische abrechnungsbezogene Fachfelder bleiben erhalten,
- Stammdaten und globale Historie bleiben beim Wiederöffnen im aktuellen Arbeitsstand,
- bestehende Archive können idempotent migriert werden.

**Nachteile**

- der zentrale Arbeitszustand bleibt vorerst monolithisch,
- die Trennung ist ein Datenvertrag und noch keine Dateimodularisierung,
- alte Vollkopien werden beim ersten Laden intern bereinigt.

## 4. Empfehlung und verbindlicher Vertrag

Weg B wurde umgesetzt.

### 4.1 Aktueller Arbeitsstand

Der Arbeitsstand ist die einzige schreibbare Laufzeitinstanz. Er darf enthalten:

- aktuelle Abrechnung,
- `stammdaten` als objektweiten Standard,
- `waterMeterHistory` als globale Historienreferenz,
- `jahresArchiv` als Sammlung begrenzter Abrechnungssnapshots,
- Backup- und Speicherstatus in `meta`.

### 4.2 Stammdaten

`stammdaten` gehören ausschließlich zum aktuellen Objektstandard. Sie werden nicht in neuen Archivständen gespeichert. In einer Archivansicht werden erforderliche Stammdaten nur zur Laufzeit aus dem archivierten Abrechnungsstand abgeleitet. Bei Wiederbearbeitung eines Archivs bleiben die aktuellen Stammdaten des Arbeitsstands erhalten.

### 4.3 Globale Historie

`waterMeterHistory` ist eine objektweite historische Referenz. Sie gehört ausschließlich in den aktuellen Arbeitsstand und in eine vollständige Gesamtsicherung. Sie wird nicht je Archivjahr dupliziert. Archivansichten verwenden zur Laufzeit die globale Historie des aktuellen Arbeitsstands.

### 4.4 Abrechnungssnapshot

Ein Abrechnungssnapshot darf nur folgende fachliche Bereiche enthalten:

- `meta` mit Perioden-, Herkunfts- und Finalisierungsdaten,
- `wohnungen`,
- `mieter`,
- `kostenarten`,
- `kostenartenMieterUmlage`,
- `vorauszahlungen`,
- `umlageInputs`,
- `waterMeters`,
- `meterReadings`,
- `briefSettings`,
- `abrechnungsEinzelwerte`,
- `legacyEinzelabrechnungen`,
- `prepaymentAdjustmentSettings`.

Ausgeschlossen sind `jahresArchiv`, `stammdaten`, `waterMeterHistory` sowie rein technische Speicher-, Backup-, Recovery-, Importlauf- und Archivviewer-Metadaten.

### 4.5 Jahresarchiv

`jahresArchiv` enthält ausschließlich Archivhüllen mit Metadaten, Zusammenfassung und genau einem begrenzten Abrechnungssnapshot. Ein Archivsnapshot darf niemals selbst ein `jahresArchiv` enthalten.

### 4.6 Sicherung und Recovery

- **Gesamt-JSON:** vollständiger Arbeitsstand einschließlich Stammdaten, globaler Historie und begrenztem Jahresarchiv; kein Recovery-Stand.
- **Abrechnungs-JSON:** genau ein begrenzter Abrechnungssnapshot; kein Jahresarchiv, keine Stammdaten und keine globale Historie.
- **Jahresarchivexport:** nur begrenzte Archivdatensätze.
- **Recovery:** genau ein vorheriger gültiger vollständiger Arbeitsstand in einem separaten `localStorage`-Schlüssel; keine Recovery-Kette.

## 5. Implementierte Migration und Rückweg

Die Migration erfolgt idempotent beim Normalisieren und vor dem Speichern:

1. falls im Arbeitsstand keine globale Zählerhistorie vorhanden ist, kann sie einmalig aus einem vorhandenen Altarchiv übernommen werden,
2. vorhandene Archivdaten werden im Snapshot-Modus normalisiert,
3. verschachtelte `jahresArchiv`-Felder werden entfernt,
4. archivierte `stammdaten`- und `waterMeterHistory`-Vollkopien werden entfernt,
5. technische Metadaten werden aus Snapshot-Metadaten entfernt,
6. Snapshot-Grenze und Vertragsversion werden als additive Metadaten gekennzeichnet,
7. Fachfelder und Archivhülle bleiben erhalten.

Das Datenschema bleibt 5. Alte Gesamt-JSON-Dateien und alte Archivhüllen bleiben importierbar. Ein Rückweg ist über eine vor der Änderung erstellte Gesamt-JSON-Sicherung oder den getrennten letzten gültigen Recovery-Stand möglich. Die Anwendung schreibt keine Recovery-Kette in den Zustand.

## 6. Implementierte Prüfungen

- Syntax aller produktiven JavaScript-Dateien,
- Referenzfälle und feste fachliche Prüfsummen unverändert,
- neue Archivstände enthalten weder `jahresArchiv`, `stammdaten` noch `waterMeterHistory`,
- importierte Altarchive werden idempotent begrenzt,
- abrechnungsbezogene Fachfelder älterer Archive bleiben erhalten,
- Archivansicht bleibt funktionsfähig und schreibgeschützt,
- Wiederbearbeitung übernimmt Archiv-Abrechnungsdaten, behält aber aktuelle Stammdaten, globale Historie und das vollständige Archiv,
- Hauptspeicher und Recovery bleiben getrennt und integritätsgeschützt,
- aktuelle Abrechnung durchläuft Export-, Validierungs- und Import-Rundlauf,
- Gesamtbackup enthält alle fachlichen Datenebenen, aber keine Recovery-Kette,
- Release-, Manifest- und Service-Worker-Konsistenz.

## 7. Bewusst verbleibende Grenzen

- Der zentrale Zustand und `js/app.js` bleiben monolithisch.
- Für zukünftige Schemaversionen existiert noch kein allgemeines automatisches externes Vor-Migrationsbackup.
- Ein formalisierter Rollback über mehrere Migrationsschritte ist noch nicht implementiert.


## 8. Ergänzung V99.4.5 – fachlich unveränderlicher Snapshot

Der Datenebenenvertrag bleibt Version 1. `objektStandard` ist als abrechnungsbezogene Projektion in der zulässigen Snapshot-Feldmenge enthalten. Neue Abrechnungssnapshots verwenden die Hülle `nk-pro-billing-snapshot` Version 1 mit eindeutiger ID, Objekt-/Zeitraumbezug, Berechnung, Validierung, Zählerauswahl, Prüfsumme und rekursiver Unveränderlichkeit. Historische Archive werden innerhalb derselben Grenzen fachlich unverändert als `legacy-partial` gekennzeichnet.
