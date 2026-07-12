# NK-Pro – Migrations-, Sicherungs-, Restore- und Rollback-Fundament

**Ausgangsversion:** V99.4.3  
**Zielversion:** V99.4.4  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1, unverändert  
**Stand:** 12. Juli 2026

## 1. Geprüfter Ist-Zustand

V99.4.3 besaß bereits getrennte Module für Browser-Persistenz, Schemamigration und Archivprojektion. Die vorhandene Migration war jedoch als feste Folge von Versionsvergleichen implementiert. Es gab keine zentrale Registry, keinen formalen Migrationsplan, keine transaktionale Ausführung auf einer isolierten Kopie und keine Vor-/Nachvalidierung je Schritt.

Vor einer automatischen Migration wurde kein eigener Vor-Migrationsstand erzeugt. Der getrennte Recovery-Schlüssel enthielt nur den vorherigen gültigen Arbeitsstand beim normalen Speichern. Er war weder migrationsspezifisch identifiziert noch als extern exportierbare Sicherungshülle mit unveränderlichen Metadaten ausgelegt.

Restore erfolgte ausschließlich über den allgemeinen JSON-Import. Ein definierter Restore-Checkpoint und eine Rücknahme eines Restore-Vorgangs fehlten.

## 2. Risiken des Ausgangszustands

- Ein Fehler in einem späteren Migrationsschritt hätte bereits veränderte Teilstrukturen zurücklassen können.
- Unterstützte Migrationswege waren nicht zentral inventarisiert oder automatisiert auf Lücken prüfbar.
- Quell- und Zielversion, Migrationspfad und Sicherungsidentität waren nicht unveränderlich miteinander verknüpft.
- Eine beschädigte oder nachträglich veränderte Sicherungshülle war nicht als solche erkennbar.
- Der Archiv-JSON-Import konnte vor der abschließenden Benutzerbestätigung bereits den Laufzeitzustand verändern.
- Vor Datenschema 6 fehlte ein belastbares Fundament für sichere Datenmodelländerungen.

## 3. Umgesetzte Modulgrenzen

### 3.1 `js/persistence.js`

Das Persistenzmodul bleibt der einzige direkte Browser-Speicheradapter. Ergänzt wurde ein kontrollierter Rohdaten-Schreibweg für validierte Sicherungshüllen und Restore-Vorgänge. Migration, Backup/Restore und Archiv greifen weiterhin nicht direkt auf `localStorage` zu.

### 3.2 `js/migration.js`

Das Migrationsmodul enthält jetzt:

- eine eingefrorene zentrale `MIGRATION_REGISTRY`,
- die unterstützten Pfade `1→2`, `2→4`, `3→4` und `4→5`,
- eine Pfadsuche für Quell- und Zielversion,
- eine rekursive Ermittlung migrationsbedürftiger Arbeits- und Archivdaten,
- Vorprüfung, Schrittprüfung und Nachprüfung,
- transaktionale Ausführung ausschließlich auf einer Datenkopie,
- eindeutige Migrations-IDs in der Historie,
- einen definierten Fehlerstatus ohne Übernahme von Teiländerungen,
- die bestehende globale Kompatibilitätsfunktion `migrateDataSchema`.

Die Kompatibilitätsfunktion ersetzt den übergebenen Datensatz erst nach vollständig erfolgreicher Transaktion. Bei einem Fehler bleibt er unverändert.

### 3.3 `js/backup-recovery.js`

Das neue Modul kapselt:

- Erzeugung eindeutig identifizierter Sicherungshüllen,
- eingefrorene Metadaten und Nutzdaten im laufenden Prozess,
- Prüfsummen für Nutzdaten, Metadaten und Gesamthülle,
- Serialisierung und getrennte Persistenz,
- vollständige Validierung vor Restore,
- Wiederherstellung einer geprüften Nutzdatenkopie,
- kontrolliertes Schreiben eines validierten Restore-Stands.

Eine Sicherungshülle enthält insbesondere Sicherungs-ID, Typ, Erstellungszeit, Quell-Appversion, Quell- und Zielschema, Datenebenenvertrag, Quell-Speicherschlüssel, Anlass, Migrationspfad und Prüfsummen.

### 3.4 `js/app.js`

Die Anwendungsorchestrierung:

- erkennt vor der Normalisierung einen migrationsbedürftigen Arbeitsstand; historische Archivstände bleiben im normalen Startpfad unverändert,
- erzeugt vor der ersten datenverändernden Migration eine vollständige Vor-Migrationssicherung im getrennten Speicherbereich,
- stellt diese im bestehenden Sicherungsbereich zum externen JSON-Download bereit,
- migriert anschließend transaktional,
- zeigt einen validierten Restore-Pfad an,
- erzeugt vor Restore einen getrennten Restore-Checkpoint,
- ermöglicht die Rücknahme des letzten Restore-Vorgangs,
- behält bestehende globale Kompatibilitätsaufrufe bei.

Der allgemeine JSON-Import arbeitet für Prüfung und Vorschau auf Kopien. Er erkennt zusätzlich das neue Sicherungshüllenformat, validiert alle Prüfsummen, erzeugt vor dem Restore einen Checkpoint und migriert die wiederhergestellten Nutzdaten kontrolliert auf Schema 5. Der Archiv-JSON-Import sammelt und validiert neue Archivstände zunächst, bevor nach Bestätigung eine Zustandsänderung erfolgt.

## 4. Migrationsablauf

1. Rohdaten lesen, ohne sie zu verändern.
2. Den tatsächlich zu normalisierenden Arbeitsstand auf eine abweichende Schemaversion prüfen. Optionale explizite Archivmigrationen verwenden dieselbe transaktionale Modulroutine.
3. Vollständige Vor-Migrationssicherung mit eindeutiger ID und Prüfsummen erzeugen.
4. Sicherung unter dem getrennten Vor-Migrationsschlüssel persistieren.
5. Unterstützten Migrationspfad aus der Registry ermitteln.
6. Eingangsdaten validieren.
7. Jeden Schritt auf einer isolierten Kopie ausführen und danach validieren.
8. Gesamtergebnis gegen Zielversion und NK-Pro-Kernstruktur validieren.
9. Nur bei vollständigem Erfolg den migrierten Zustand übernehmen.
10. Bei Fehlern den unveränderten Ausgangszustand zurückgeben; die Vor-Migrationssicherung bleibt erhalten.

## 5. Restore- und Rollback-Pfade

### Restore in V99.4.4

- Vor-Migrationssicherung lesen und vollständig validieren.
- Aktuellen Arbeitsstand als getrennten Restore-Checkpoint sichern.
- Sicherungsnutzdaten wiederherstellen.
- Falls erforderlich, erneut über die Registry auf Datenschema 5 migrieren.
- Datenvertrag anwenden und den validierten Stand speichern.

### Rücknahme des letzten Restore

- Restore-Checkpoint lesen und validieren.
- Vorherigen Arbeitsstand wiederherstellen.
- Datenschema und Datenvertrag prüfen.
- Arbeitsstand erneut geschützt speichern.

### Rückkehr zu einer früheren Anwendungsversion

Die extern heruntergeladene Vor-Migrationssicherung enthält den unveränderten Quelldatensatz. Für einen exakten Rückweg zu einem älteren Schema ist diese Datei mit der dazugehörigen früheren NK-Pro-Version zu verwenden. V99.4.4 selbst normalisiert wiederhergestellte Betriebsdaten weiterhin auf das unterstützte Datenschema 5.

## 6. Unveränderte Verträge

- Datenschema bleibt 5.
- Datenebenenvertrag bleibt 1.
- Snapshot-Rolle bleibt `billingSnapshot`.
- Arbeitsstand, Stammdaten, globale Historie, Jahresarchiv und Recovery behalten ihre Grenzen.
- Bestehende Gesamt-JSON-, Abrechnungs- und Archivdateien bleiben importierbar.
- Berechnungs-, Umlage-, Brief- und allgemeine UI-Logik wurden nicht geändert.

## 7. Prüfungen

Automatisiert geprüft werden zusätzlich:

- Registry und vollständiger Pfad von Schema 1 auf 5,
- transaktionale Migration und unveränderter Quelldatensatz,
- Abbruch eines absichtlich fehlerhaften Migrationsschritts ohne Teiländerung,
- eingefrorene Sicherungshülle,
- Erkennung manipulierter Metadaten,
- identischer Restore der Sicherungsnutzdaten,
- automatische Vor-Migrationssicherung beim Start mit Schema-4-Daten,
- externe Download-Aktion im bestehenden Sicherungsbereich,
- Restore einer externen Sicherungshülle über den vorhandenen JSON-Import mit Rollback-Checkpoint,
- optionale atomare Archivmigration bei bereits aktuellem Arbeitsstand,
- neue Modulreihenfolge und PWA-App-Shell,
- bestehende Persistenz-, Archiv-, Referenz- und Import-/Export-Regression.

## 8. Verbleibende Grenzen

- Browser dürfen ohne Benutzeraktion keinen stillen Dateidownload erzwingen. Deshalb wird die Sicherung automatisch vor der Migration intern erzeugt und anschließend über eine sichtbare Aktion extern exportierbar gemacht.
- Die Prüfsummen schützen gegen unbeabsichtigte Veränderung und Inkonsistenz, sind aber kein kryptografischer Echtheitsnachweis.
- Es wird jeweils der aktuelle Vor-Migrationsstand und der aktuelle Restore-Checkpoint getrennt gehalten, keine unbegrenzte Sicherungskette.
- Datenschema 6 ist nicht Bestandteil dieses Arbeitspakets.
