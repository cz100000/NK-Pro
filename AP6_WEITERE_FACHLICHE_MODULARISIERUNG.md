# NK-Pro V99.4.7 – Weitere fachliche Modularisierung

## 1. Verbindliche Grundlage

Ausgangsbasis ist ausschließlich NK-Pro V99.4.6. Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandard 1 und Abrechnungssnapshot 2 bleiben unverändert. Es wurden keine neuen Abrechnungsregeln und keine allgemeinen optischen Änderungen eingeführt.

## 2. Bestandsanalyse

`js/app.js` umfasste zu Beginn 10.248 Zeilen und 603.008 Byte. Darin lagen neben UI und Orchestrierung weiterhin zentrale Teile der Kostenverteilung, Verbrauchszuordnung, Vorauszahlungsberechnung, Dokumentdaten, Brief-HTML-Erzeugung, Download-/CSV-Technik und Tabellenhilfen.

Weitere Befunde:

- klassische Skripte stellten 646 Top-Level-Funktionen und 71 globale lexikalische Bindungen bereit,
- direkte Fachdatenspeicherung war bereits in `persistence.js` gekapselt,
- `navigation.js` griff jedoch noch direkt auf `localStorage` für reine UI-Einstellungen zu,
- der Anwendungsstart bestand aus einem unbenannten `try/catch`-Block am Ende von `app.js`,
- Briefdaten, Brief-HTML und Druckfenster waren funktional vermischt,
- Exportfunktionen bereiteten Dateien und Downloads innerhalb von `app.js` auf,
- Tabellenfilter und Sortierung waren Teil des monolithischen Anwendungscodes.

Das vollständige Inventar steht in `GLOBALE_SCHNITTSTELLEN_INVENTAR.md`.

## 3. Ergebnis und Größenänderung

`js/app.js` umfasst nach AP6 9.030 Zeilen und 536.536 Byte. Damit wurden 1.218 Zeilen beziehungsweise rund 11,9 Prozent aus dem Monolithen entfernt. Die fachlich ausgelagerten Implementierungen liegen in eigenständigen Modulen; 112 bisherige Funktionsnamen bleiben als einzeilige Kompatibilitätsweiterleitungen bestehen.

Die Gesamtmenge produktiven Codes steigt geringfügig, weil Schnittstellen, Startorchestrierung, UI-Speicheradapter und Kompatibilitätsregistry explizit dokumentiert und geprüft werden. Das ist beabsichtigt: Verantwortlichkeiten werden nicht nur verschoben, sondern mit prüfbaren Grenzen versehen.

## 4. Neue Module

### `js/billing-calculation.js`

Enthält 48 Funktionen der Abrechnungs- und Berechnungsfachlogik:

- Mieter-/Eigentümerabgrenzung,
- aktive Tage, Personen- und Flächengrundlagen,
- Wohneinheitenverteilung,
- Verbrauchs- und Zählerzuordnung,
- manuelle Eingabearten,
- Vorauszahlungen,
- Kostenverteilung und Summen,
- Vorauszahlungsanpassung und Rundung.

Das Modul enthält keine DOM-, `window`-, `localStorage`- oder IndexedDB-Zugriffe. Die bisherigen Rechenwege wurden unverändert übernommen.

### `js/document-data.js`

Enthält 26 Funktionen für fachliche Dokument- und Briefdaten:

- Abrechnungsergebnis und Saldoeinordnung,
- Abnahme- und Freigabedaten,
- Briefvalidierung und Preflight,
- Auswahl abrechenbarer Briefempfänger,
- Sortierung und Gruppierung von Kostenzeilen,
- Perioden-, Betrags- und Einheitenangaben,
- Monatsvorauszahlungszeilen.

Das Modul enthält keine DOM- oder Speicherzugriffe.

### `js/document-renderer.js`

Enthält 14 Funktionen für darstellungsbezogene Dokumenterzeugung:

- Brief- und Druckstyles,
- HTML-Tabellen und Summenblöcke,
- Vorauszahlungsseite,
- Druckhärtungs- und Preflightdarstellung,
- vollständiges Brief-HTML,
- Umwandlung des gerenderten Briefs in Klartext.

Fachwerte werden aus der Berechnungsengine und dem Dokumentdatenmodul bezogen; es gibt keine eigene abweichende Kostenberechnung.

### `js/export-service.js`

Enthält 18 Funktionen für:

- generische Downloads,
- sichere Dateinamen,
- JSON- und CSV-Serialisierung,
- Kosten-, Mieter-, Umlage- und Archivindexexporte,
- vollständige und abrechnungsbezogene Exportpakete,
- HTML-Anwendungskopie.

Das Modul verändert keine Fach- oder Arbeitsdaten.

### `js/ui-table-tools.js`

Enthält sechs DOM-Hilfen für Tabellenfilter, Sortierung und Werkzeugleisten. Es enthält keine Fachberechnung und keine Persistenz.

### `js/ui-preferences.js`

Kapselt ausschließlich kleine, nicht fachliche UI-Einstellungen wie Navigationsgruppe und eingeklappte Seitenleiste. Damit greifen produktiv nur noch `persistence.js` und `ui-preferences.js` direkt auf `localStorage` zu. Fach- und Abrechnungsdaten bleiben ausschließlich in der Persistenzschicht.

### `js/app-bootstrap.js`

Führt benannte Startschritte in fester Reihenfolge aus, protokolliert erfolgreich abgeschlossene Schritte und kapselt Fehler- und Rückfallbehandlung.

### `js/compatibility.js`

Registriert die ausgelagerten öffentlichen Modulmethoden und dokumentiert die weiterhin benötigten globalen Weiterleitungen. Die Registry ist zur Laufzeit über `window.__NKPRO_COMPATIBILITY__` einsehbar.

## 5. Modulgrenzen und Schnittstellen

Alle neuen Module exportieren eine mit `Object.freeze` geschützte Schnittstelle. `app.js` bindet sie über `NK_PRO_MODULES` ein.

Die Abhängigkeitsrichtung lautet:

1. UI und Orchestrierung rufen globale Kompatibilitätsnamen auf.
2. Die Kompatibilitätsnamen leiten ohne Zusatzlogik an das zuständige Modul weiter.
3. Berechnung und Dokumentdaten arbeiten ohne DOM und ohne Speicherzugriffe.
4. Der Dokumentrenderer verwendet vorhandene Fachergebnisse.
5. Der Exportservice serialisiert vorhandene Daten und Ergebnisse, berechnet sie aber nicht neu.
6. Persistenz, Migration, Archiv, Sicherung und Restore bleiben in ihren bestehenden AP1–AP5-Modulen.

## 6. Berechnungsarchitektur

`calculateUmlage()` und `allocationForCost()` liegen nun in `billing-calculation.js`. Die Berechnung verwendet weiterhin:

- den bestehenden Arbeitsstand,
- die vorhandenen Kostenarten und Verteilerschlüssel,
- die AP5-Zähler- und Verbrauchsmodule,
- dieselben Vorauszahlungs- und Rundungsregeln,
- denselben Ausschluss des Stromzähler-Dummys.

UI-, Brief- und Exportfunktionen rufen die zentrale Berechnung auf. Es gibt in den neuen Dokument- und Exportmodulen keine Parallelberechnung.

## 7. Dokument-, Druck- und Exportarchitektur

Die Kette ist jetzt fachlich getrennt:

`Arbeitsstand/Snapshot → billing-calculation → document-data → document-renderer → Druckfenster`

und

`Arbeitsstand/Fachergebnis → export-service → Serialisierung/Download`.

Briefdaten und Kostenzeilen entstehen im Dokumentdatenmodul. HTML und Druckstyles entstehen im Dokumentrenderer. Das Öffnen des Druckfensters und Benutzeraktionen bleiben in `app.js` als UI-Orchestrierung.

## 8. UI- und Renderinganbindung

`app.js` bleibt vorläufig der zentrale UI-Controller. Es erfasst Eingaben, steuert Tabs und Dialoge, aktualisiert Darstellungen und ruft Fachmodule auf. Wiederkehrende Tabellenoperationen liegen in `ui-table-tools.js`. Navigationseinstellungen liegen in `ui-preferences.js`.

Es wurden keine allgemeinen Layout-, CSS- oder Navigationsänderungen vorgenommen.

## 9. Anwendungsstart

Der Start besteht aus sieben benannten Schritten:

1. Arbeitsstand für Persistenz vorbereiten,
2. erste Darstellung erzeugen,
3. Navigation initialisieren,
4. Arbeitsbereiche schließen,
5. Seitenköpfe aktualisieren,
6. Übersichtskarten aktualisieren,
7. Strukturprüfung durchführen.

Das Ergebnis steht zur Diagnose in `window.__NKPRO_STARTUP__`. Fachlogik liegt nicht im Bootstrapmodul; es orchestriert ausschließlich über übergebene Funktionen.

## 10. Persistenzanbindung

AP6 ändert keine Speicherformate, Storage-Keys, Backup-Hüllen, Migrationen, Snapshot-Grenzen oder Restorepfade. Direkte Speicherzugriffe sind auf zwei Adapter begrenzt:

- `persistence.js`: Fach-, Arbeits-, Recovery- und Sicherungsdaten,
- `ui-preferences.js`: nicht fachliche Navigations- und Darstellungspräferenzen.

Alle neuen Fach-, Dokument- und Exportmodule sind speicherfrei.

## 11. Kompatibilitätsschicht

112 globale Funktionsnamen bleiben erhalten. Jeder dieser Namen besteht in `app.js` ausschließlich aus einer Weiterleitung der Form:

```js
function calculateUmlage(...args) {
  return NK_PRO_MODULES.billingCalculation.calculateUmlage(...args);
}
```

Die tatsächliche Fachlogik wird nur im Modul gepflegt. Die Registry `NKProCompatibility` dokumentiert Modul, Methodennamen und Anzahl der Wrapper.

## 12. Unveränderte Verträge

- Datenschema: 5,
- Datenebenenvertrag: 1,
- Objektstandard: 1,
- Zähler-/Messstandard: 1,
- Abrechnungssnapshot: 2; Version 1 bleibt lesbar,
- Stromzähler-Dummy: vollständig gespeichert, `abrechnungsrelevant=false`, `billingRole=excluded`,
- Speicher- und Austauschformate: unverändert,
- historische Archive und Snapshots: unverändert.

## 13. Verbleibende Grenzen

AP6 ist eine weitere, aber keine vollständige Auflösung des Monolithen. In `app.js` verbleiben 534 implementierte Top-Level-Funktionen. Größte Restbereiche sind:

- UI-Rendering, Dialoge, Navigation und Arbeitsabläufe,
- Stammdaten- und Mietverhältnisverwaltung,
- Jahreswechsel und Archivbedienung,
- Qualitäts-, Diagnose- und Selbsttests,
- Legacy-Import und einige technische Hilfen,
- globaler Laufzeitkontext `state` sowie weitere globale Bindungen.

Die neuen Module verwenden während der Übergangsphase noch den gemeinsamen globalen Laufzeitkontext. Eine vollständige Dependency-Injection- oder Controller-Schicht wäre ein eigenes Arbeitspaket und darf nur mit zusätzlichen Referenz- und UI-Regressionstests erfolgen.
