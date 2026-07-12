# NK-Pro – Architektur

**Ist-Stand:** V99.4.5  
**Datenschema:** 5  
**Datenebenenvertrag:** 1  
**Objektstandard:** 1  
**Abrechnungssnapshot:** 1

## 1. Laufzeit

NK-Pro läuft ohne Framework und ohne Buildschritt als lokale HTML/CSS/JavaScript-PWA. Produktive Daten verbleiben im Browser oder in explizit heruntergeladenen JSON-Dateien.

## 2. Modulgrenzen

| Modul | Verantwortung |
|---|---|
| `persistence.js` | Speicherung, Recovery und Speicherintegrität |
| `migration.js` | Registry, Pfadplanung, Vor-/Nachvalidierung, transaktionale Migration |
| `backup-recovery.js` | Sicherungshüllen, unveränderliche Metadaten, Restore und Checkpoint |
| `object-standard.js` | additive Objektprojektion, Typisierung, Zählerstandard, Objektvalidierung |
| `billing-snapshot.js` | Abrechnungsbereitschaft, Snapshot-Hülle, Prüfsumme, Unveränderlichkeit |
| `archive.js` | Datenebenenvertrag, Snapshot-Begrenzung, Archivvorbereitung, Legacy-Status |
| `app.js` | bestehende Fachberechnung, Zustand, UI und Ablaufkoordination |

Abhängigkeiten werden den Modulen über Optionsobjekte übergeben. Globale Wrapper bestehen nur als Kompatibilitätsschicht für bestehende HTML- und Testaufrufe.

## 3. Objektmodell

Die bisherigen Arrays bleiben kompatible Produktivquellen. `objektStandard` ist die versionierte fachliche Projektion. Sie referenziert Entitäten über stabile IDs und trennt Objekt, Gebäude, Einheiten, Partner, Verträge, Kostenarten, Verteilerschlüssel, Vorauszahlungen, Zähler, Verbrauchsstellen und Perioden.

Die Projektion ist additiv, idempotent und bewahrt unbekannte Felder. Ein Objektstandard-Upgrade wird wie eine Datenmigration behandelt und vorab gesichert.

## 4. Snapshot-Pipeline

1. bestehende Periodendaten synchronisieren,
2. Objektstandard normalisieren,
3. bestehende Umlageberechnung ausführen,
4. zentrale Abrechnungsbereitschaft prüfen,
5. begrenzte Abrechnungsdaten erzeugen,
6. Objektstandard, Berechnung und Zusammenfassung aufnehmen,
7. eindeutige Snapshot-ID erzeugen,
8. Prüfsumme bilden,
9. gesamte Hülle rekursiv einfrieren,
10. vor Import oder Archivierung erneut validieren.

Kritische Validierungsfehler stoppen Schritt 5. Stromzähler-Dummys erscheinen nur in der Ausschlussliste.

## 5. Archivstrategie

Neue Snapshots sind vollständig und prüfsummengeschützt. Bestehende Altarchive werden ausschließlich auf die bestehenden Snapshot-Grenzen reduziert; ihre Fachinhalte werden nicht auf Objektstandard 1 umgeschrieben. Sie erhalten den Status `legacy-partial`.

## 6. Persistenz und Recovery

Der Arbeitsstand enthält `objektStandard` und wird wie bisher integritätsgeschützt gespeichert. Gesamtbackup, Vor-Migrationssicherung und Restore-Checkpoint enthalten den vollständigen Stand. Abrechnungssnapshots schließen dagegen globale Stammdatenkopien, globale Historie, Recovery und verschachtelte Archive aus.

## 7. PWA

`service-worker.js` verwendet `nk-pro-v99-4-5` und führt beide neuen Module im App-Shell. Beim Aktivieren werden alte NK-Pro-Caches entfernt.

## 8. Nächste Architekturgrenze

Dauerhafte Zählerstammdaten und periodische Zählerstände sollten in einem getrennten Arbeitspaket physisch voneinander getrennt werden. Objektstandard 1 stellt dafür bereits stabile Zähler- und Zuordnungs-IDs bereit.
