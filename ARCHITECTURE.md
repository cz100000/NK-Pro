# NK-Pro – Architektur

**Ist-Stand:** V99.4.6  
**Datenschema:** 5  
**Datenebenenvertrag:** 1  
**Objektstandard:** 1  
**Zähler-/Messstandard:** 1  
**Abrechnungssnapshot:** 2, kompatibel zu 1

## 1. Laufzeit

NK-Pro läuft ohne Framework und ohne Buildschritt als lokale HTML/CSS/JavaScript-PWA. Produktive Daten verbleiben im Browser oder in explizit heruntergeladenen JSON-Dateien.

## 2. Modulgrenzen

| Modul | Verantwortung |
|---|---|
| `persistence.js` | Speicherung, Recovery und Speicherintegrität |
| `migration.js` | Registry, Pfadplanung, Vor-/Nachvalidierung, transaktionale Schemamigration |
| `backup-recovery.js` | Sicherungshüllen, unveränderliche Metadaten, Restore und Checkpoint |
| `meter-master.js` | kanonische Zählerstammdaten, stabile IDs, Dummy-Ausschluss |
| `meter-readings.js` | Messwertidentität, Zeitbezug, Herkunft, Revisionen und Storno |
| `meter-periods.js` | Zuordnungen, Periodenbildung, Wechsel und Verbrauchsermittlung |
| `meter-validation.js` | Standardmigration, zentrale Validierung und Snapshot-Projektion |
| `object-standard.js` | additive Objektprojektion ohne eingebettete Messwertduplikate |
| `billing-snapshot.js` | Abrechnungsbereitschaft, Snapshot-Hülle, Prüfsumme, Unveränderlichkeit |
| `archive.js` | Datenebenenvertrag, Snapshot-Begrenzung, Archivvorbereitung, Legacy-Status |
| `app.js` | bestehende Fachberechnung, Zustand, UI und Ablaufkoordination |

Die Fachmodule sind eingefrorene Namensräume. Abhängigkeiten werden über Optionsobjekte übergeben. Globale Wrapper in `app.js` bleiben nur als Kompatibilitätsschicht bestehen.

## 3. Kanonisches Zählermodell

`zaehlerDaten` ist die primäre fachliche Struktur für Zähler:

- `zaehler`: dauerhafte Stammdaten,
- `messwerte`: eigenständige, revisionsfähige Zeitdatensätze,
- `messperioden`: abgeleitete Anfangs-/Endstandspaare und Verbräuche,
- `zuordnungen`: zeitabhängige Objekt-, Gebäude-, Einheiten-, Nutzer- und Vertragsbezüge,
- `zaehlerwechsel`: Vorgänger-/Nachfolgerbeziehungen mit Wechselständen.

Legacy-Felder `waterMeters`, `meterReadings` und eingebettete V99.4.5-Zählerstände bleiben kompatible Eingabequellen. Sie werden idempotent in die kanonischen Strukturen synchronisiert, aber nicht als alleinige technische Identität verwendet.

## 4. Berechnungs- und Snapshot-Pipeline

1. Zählerstammdaten und Messwerte synchronisieren,
2. zeitabhängige Zuordnungen und Zählerwechsel normalisieren,
3. fachlich gültige Messperioden erzeugen,
4. zentrale Zähler- und Objektvalidierung ausführen,
5. bestehende Umlageberechnung ausführen,
6. begrenzte Snapshot-Daten und Zählerprojektion erzeugen,
7. eindeutige Snapshot-ID und Prüfsumme bilden,
8. gesamte Snapshot-Hülle rekursiv einfrieren.

Kritische Zähler-, Messwert-, Zuordnungs- oder Periodenfehler stoppen Verbrauchsberechnung beziehungsweise Snapshot-Erstellung. Nicht abrechnungsrelevante Zähler bleiben dokumentiert, sind aber aus der Verbrauchsermittlung ausgeschlossen.

## 5. Snapshot- und Archivstrategie

Snapshot 2 enthält Zählerstammdaten, relevante Messwerte, Messperioden, Zuordnungen, Wechsel und Ausschlussgründe. Die Projektion ist eine tiefe Kopie; spätere Änderungen am Arbeitsstand verändern den Snapshot nicht.

Bestehende vollständige V99.4.5-Snapshots der Version 1 werden unverändert validiert und archiviert. Ältere unvollständig rekonstruierbare Archive werden weiterhin als `legacy-partial` gekennzeichnet, ohne ihre Fachinhalte umzuschreiben.

## 6. Persistenz, Migration und Recovery

Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert. Die additive Standardmigration `metering-standard-v1` nutzt das bestehende Vor-Migrationssicherungs-, Restore- und Rollback-Fundament. Sie arbeitet auf einer Kopie, validiert vor Übernahme und ist idempotent.

## 7. PWA

`service-worker.js` verwendet `nk-pro-v99-4-6` und enthält alle Fachmodule in verbindlicher Ladefolge. Beim Aktivieren werden alte Caches entfernt.

## 8. Verbleibende Grenze

Die vorhandenen Erfassungsformulare schreiben aus Kompatibilitätsgründen weiterhin in Legacy-Felder und werden anschließend zentral synchronisiert. Eine vollständig native CRUD-Oberfläche für `zaehlerDaten` ist ein eigenes Folgearbeitspaket.
