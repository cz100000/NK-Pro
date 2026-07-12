# NK-Pro V99.4.7 – AP6-Prüfbericht

**Prüfdatum:** 12. Juli 2026  
**Ausgangsbasis:** NK-Pro V99.4.6  
**Ergebnis:** NK-Pro V99.4.7 – Weitere fachliche Modularisierung  
**Freigabestatus:** bestanden

## 1. Verifizierter Ausgangsstand

Die Ausgangsversion war konsistent als V99.4.6 gekennzeichnet. Verifiziert wurden:

- Datenschema 5,
- Datenebenenvertrag 1,
- Objektstandard 1,
- Zähler-, Messwert-, Messperioden-, Zuordnungs- und Wechselstandard 1,
- Abrechnungssnapshot 2 mit Lesekompatibilität für Snapshot 1,
- vorhandene Persistenz-, Migrations-, Archiv-, Sicherungs-, Restore- und Rollbackmodule,
- sechs kanonische Referenzfälle.

`js/app.js` besaß vor AP6 10.248 Zeilen und 603.008 Bytes.

## 2. Ergebnis der Bestandsanalyse

Vor AP6 lagen weiterhin Abrechnungsberechnung, Dokumentdaten, Brief-HTML, Exporttechnik, Tabellenhilfen und Startlogik in `app.js`. Zusätzlich griff `navigation.js` direkt auf `localStorage` zu. Die globalen Funktionen und Bindungen wurden per AST inventarisiert.

Ermittelter Stand nach der Modularisierung:

- 646 Top-Level-Funktionen insgesamt,
- 112 reine Kompatibilitätswrapper,
- 534 verbleibende Implementierungen in `app.js`,
- 71 globale lexikalische Bindungen,
- produktive direkte `localStorage`-Zugriffe nur noch in `persistence.js` und `ui-preferences.js`.

## 3. Größenvergleich `app.js`

| Kennzahl | V99.4.6 | V99.4.7 | Änderung |
|---|---:|---:|---:|
| Zeilen | 10.248 | 9.030 | −1.218 / −11,9 % |
| Bytes | 603.008 | 536.536 | −66.472 |

Die ausgelagerte Logik wurde nicht lediglich kopiert: Die bisherigen Implementierungen in `app.js` wurden durch einzeilige Weiterleitungen ersetzt.

## 4. Neue beziehungsweise überarbeitete Module

| Modul | Öffentliche Funktionen | Verantwortung |
|---|---:|---|
| `js/billing-calculation.js` | 48 | Kostenverteilung, Verbrauch, Vorauszahlungen, Salden, Rundung und Vorauszahlungsanpassung |
| `js/document-data.js` | 26 | fachliche Brief-, Prüf-, Freigabe- und Dokumentdaten |
| `js/document-renderer.js` | 14 | Brief-, Druck- und Klartextdarstellung |
| `js/export-service.js` | 18 | JSON-/CSV-Serialisierung, Dateinamen und Downloadabläufe |
| `js/ui-table-tools.js` | 6 | Tabellenfilter, Sortierung und Werkzeugleisten |
| `js/ui-preferences.js` | 3 | nicht fachliche UI-Einstellungen und deren Speicheradapter |
| `js/app-bootstrap.js` | 1 | geordnete Startausführung und Fehlerbehandlung |
| `js/compatibility.js` | 3 | Registry der weiterhin benötigten globalen Weiterleitungen |

Alle Modul-APIs sind mit `Object.freeze` geschützt. Die neuen Module umfassen zusammen 1.734 Zeilen.

## 5. Architektur- und Schnittstellenprüfung

Bestätigt wurden:

- `billing-calculation.js` enthält keine DOM-, `window`-, `localStorage`- oder IndexedDB-Zugriffe,
- `document-data.js` enthält keine DOM- oder Speicherzugriffe,
- Dokumentrenderer und Exportservice verwenden vorhandene Fachwerte statt einer abweichenden Parallelberechnung,
- AP5-Zähler- und Verbrauchsmodule bleiben die verbindliche Quelle,
- der Stromzähler-Dummy bleibt gespeichert und vollständig ausgeschlossen,
- alle 112 Legacy-Namen leiten ausschließlich an ihre Module weiter,
- die produktive Skriptreihenfolge ist eindeutig und geprüft,
- keine neue zirkuläre Modulabhängigkeit wurde eingeführt,
- Start- und Kompatibilitätsstatus sind zur Diagnose verfügbar.

## 6. Berechnungsregression

Alle sechs kanonischen Fälle wurden vor und nach der Modularisierung semantisch verglichen:

1. Standardfall,
2. Mieterwechsel,
3. Leerstand,
4. Eigentümer-/Privatfall M000,
5. alle vier Eingabequellen,
6. Altdatenmigration.

Ergebnis: 6/6 bestanden. Kostenanteile, Verbrauchswerte, Vorauszahlungen, Salden, Rollenabgrenzung, Eingabequellen und Migrationsergebnisse blieben unverändert. Der Stromzähler-Dummy erscheint in keiner Abrechnungsberechnung.

## 7. Dokument-, Druck- und Exportprüfung

Zusätzliche AP6-Browserfälle bestätigen:

- Briefdaten werden aus dem zentralen Abrechnungsergebnis erzeugt,
- Modulaufruf und globaler Kompatibilitätsaufruf liefern identisches Brief-HTML,
- Mieter, Abrechnungsjahr und Fachdaten sind im erzeugten Dokument enthalten,
- Brief- und Klartexterzeugung verändern den Arbeitsstand nicht,
- CSV-Ausgabe ist über Modul- und Kompatibilitätsaufruf identisch,
- CSV-Escaping und Zeilenanzahl sind korrekt,
- Dokument- und Exporterzeugung verändern keine Fach- oder Arbeitsdaten.

## 8. Persistenz, Migration, Backup, Restore und Snapshot

Bestanden haben insbesondere:

- verlustfreies Speichern und erneutes Laden mit Prüfsumme,
- Recovery aus gültigem Rückfallstand bei beschädigten Hauptdaten,
- idempotente und begrenzte Archiv-Snapshots,
- Wiederbearbeitung bei Erhalt aktueller Stammdaten,
- JSON-Export-/Validierungs-/Import-Rundlauf,
- vollständiger Migrationspfad und atomare Migration,
- Abbruch ohne Teiländerung bei Migrationsfehler,
- unveränderliche Vor-Migrationssicherung mit Manipulationserkennung,
- externer Restore und Rollback,
- Snapshot-Integrität und Schutz gegen nachträgliche Stammdatenänderung,
- Restore von Abrechnungssnapshot und Stromzähler-Dummy,
- unveränderte Lesbarkeit historischer Snapshot-Version 1.

## 9. Anwendungsstart, UI und PWA

Der Anwendungsstart läuft über sieben dokumentierte Schritte. Start, Navigation, Arbeitskontext, Archiv-Nur-Ansicht, Tastaturbedienung und bestehende Dialog-/Seitenstruktur wurden im Browser geprüft.

Der Service Worker verwendet `nk-pro-v99-4-7`, enthält alle produktiven Module im App-Shell, aktiviert sich vollständig und entfernt ältere NK-Pro-Caches.

## 10. Durchgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax | 24/24 Einheiten bestanden |
| Referenz-Fixtures | 6/6 bestanden |
| Zählerdomäne | bestanden |
| AP6-Architekturprüfung | bestanden |
| Release-Konsistenz | bestanden |
| Playwright/Chromium | 39/39 bestanden |
| Konsolen-, Seiten- und Requestfehler | keine |
| Frische Entpackung der finalen ZIP | bestanden |
| interne Dateiprüfsummen | bestanden |

Die Browserprüfung wurde mit dem vorhandenen System-Chromium über `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` ausgeführt.

## 11. Unveränderte Verträge

- Datenschema: 5,
- Datenebenenvertrag: 1,
- Objektstandard: 1,
- Zähler-/Messstandard: 1,
- Abrechnungssnapshot: 2; Version 1 bleibt lesbar,
- Storage-Keys und Austauschformate: unverändert,
- historische Abrechnungen, Archive, Snapshots und Sicherungen: unverändert,
- keine neue fachliche Abrechnungsregel,
- keine allgemeine optische UI-Änderung.

## 12. Verbleibende Grenzen und technische Altlasten

- `app.js` bleibt mit 9.030 Zeilen weiterhin groß.
- 534 implementierte Top-Level-Funktionen verbleiben, vor allem UI-Rendering, Dialoge, Stammdaten-/Mietverwaltung, Archivbedienung, Diagnose und Legacy-Import.
- Der globale Laufzeitkontext `state` und weitere globale Bindungen bestehen fort.
- Die neuen Fachmodule greifen in der Übergangsarchitektur noch auf vorhandene globale Hilfsfunktionen und den globalen Zustand zu; vollständige Dependency Injection ist nicht Bestandteil von AP6.
- Druckdialog, Browserdownload und einige UI-Abläufe bleiben browsergebundene Orchestrierung in `app.js`.

Diese Punkte sind dokumentiert und stellen keine Regression gegenüber V99.4.6 dar.
