# NK-Pro V99.4.6 – AP5-Prüfbericht

**Arbeitspaket:** Zählerstammdaten, Zählerstände und Messperioden  
**Ausgang:** NK-Pro V99.4.5  
**Ergebnis:** NK-Pro V99.4.6  
**Datum:** 12. Juli 2026

## 1. Geprüfter Umfang

- tatsächliche Zähler-, Messwert-, Verbrauchs-, Nutzer-, Vertrags- und Snapshot-Strukturen,
- Trennung von Zählerstamm und periodischen Werten,
- stabile IDs und verlustfreie Legacy-Übernahme,
- zeitabhängige Zuordnungen und Zählerwechsel,
- Messperioden- und Verbrauchsbildung,
- Stromzähler-Dummy-Ausschluss,
- Snapshot 2 und Snapshot-1-Kompatibilität,
- Migration, Sicherung, Restore und Rollback,
- bestehende Referenz- und Browserregressionen.

## 2. Ergebnis der Bestandsanalyse

V99.4.5 speicherte Wasser- und sonstige Messwerte in nutzerindexierten Legacy-Arrays und zusätzlich eingebettet in der Objektprojektion. Dauerhafte Zähleridentität und Zeitbezug waren nicht vollständig getrennt. Die neue additive Struktur `zaehlerDaten` beseitigt diese Vermischung, ohne die bisherigen Eingabe- und Austauschfelder zu löschen.

## 3. Architekturprüfung

Bestanden:

- vier neue eingefrorene Fachmodule,
- verbindliche Skript- und PWA-Ladefolge,
- kein direkter `localStorage`-Zugriff aus Fachmodulen,
- zentrale Validierung außerhalb der UI,
- unverändertes Datenschema 5 und unveränderter Datenebenenvertrag 1,
- Snapshot 2 mit unterstütztem historischem Snapshot 1.

## 4. Fachprüfungen

Bestanden:

- idempotente V99.4.5-Standardmigration,
- stabile Zähler-IDs bei Wiederholung,
- Erhalt unbekannter Felder,
- mehrere eigenständige Messwerte je Zähler,
- Korrektur mit Ersetzungsreferenz und Erhalt des Altwerts,
- Messperioden und Verbrauch aus Anfangs-/Endstand,
- Erkennung unplausibler Rückwärtsstände,
- zeitanteilige Nutzer-/Vertragszuordnung,
- Vorgänger-/Nachfolgerbezug bei Zählerwechsel,
- vollständige Speicherung und zentraler Ausschluss des Stromzähler-Dummys,
- Snapshot-Isolation gegen spätere Datenänderung.

## 5. Automatisierte Prüfungen

Alle Freigabeprüfungen bestanden:

| Prüfstufe | Ergebnis |
|---|---:|
| JavaScript-Syntax | 16/16 Einheiten bestanden |
| kanonische Referenz-Fixtures | 6/6 semantisch unverändert |
| Zählerdomänenprüfung | bestanden |
| Release-Konsistenz | bestanden |
| Browserregression | 37/37 Tests bestanden |
| Browser-Testprojekte | 7/7 bestanden |

Die Browserfälle wurden wegen der vollständigen Kontexttrennung nach den Projekten `app-smoke`, `migration-restore`, `module-boundaries`, `object-snapshot`, `persistence-backup`, `reference-cases` und `service-worker` ausgeführt. Abgedeckt sind unter anderem Migration, Rollback, Snapshot-1-Kompatibilität, Snapshot 2, Zählerwechsel, Messperioden, Mieterwechsel, Sicherung, Restore, Archiv und PWA-App-Shell.

Verwendete Prüfreihenfolge:

```text
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test --project=<Projektname>
frische Entpackung und Wiederholung
```

## 6. Bekannte Grenzen

- Die bestehende UI ist weiterhin ein Legacy-Eingabeadapter und noch keine native CRUD-Oberfläche für `zaehlerDaten`.
- Nutzerwechsel ohne Zwischenablesung werden transparent als zeitanteilige Schätzung gekennzeichnet.
- Historische Snapshot-1-Daten werden nicht nachträglich um fehlende Messwertreferenzen ergänzt.
- Ein Zählerüberlauf benötigt ein hinterlegtes Überlaufmaximum.
