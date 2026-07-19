# AP22F11B – Vorbedingungen und Datenbaseline

**Status:** abgeschlossen; technische Produktänderungen wurden bis zum Abschluss dieses Berichts nicht vorgenommen.  
**Technische Ausgangsbasis:** `NK-Pro_V99_4_60_AP22F10G_B_Individuelle_Werte_Korrektur2(1).zip`  
**Echtdatenbestand:** `nk-pro-gesamtbestand-2025-V99.4.58-2026-07-19-16-16-12(3).json`  
**Visuelles Zielbild:** `AP22F11A_Mockup_Abrechnungsergebnis(1).png`

## 1. Integritätsprüfung

- ZIP-SHA256: `bada7719c1761ab19d0f95366d60f1fb0a9a9cf5b0c02ca6b7fe73a09c371444`
- 692 Dateien vollständig lesbar und extrahierbar.
- Keine absoluten Pfade oder `..`-Pfadsegmente im ZIP.
- `SHA256SUMS.txt`: 691 von 691 Prüfeinträgen stimmen.
- Frisch extrahierte technische Arbeitsbasis stimmt bytegenau mit allen 692 ZIP-Dateien überein.
- Auffälligkeit: `RELEASE_INHALTSMANIFEST_SHA256.txt` ist nicht auf dem Stand des ZIP-Inhalts; 24 von 679 Einträgen weichen ab. Betroffen sind überwiegend AP22F10G-B-Dokumentation/Testartefakte sowie zentrale Release-/Assetdateien. Das ZIP selbst und das maßgebliche `SHA256SUMS.txt` sind konsistent. Das interne Inhaltsmanifest muss im neuen Release neu erzeugt werden.

Detailnachweis: `baseline/integrity-report.json`.

## 2. Dokumentenlektüre

348 Dokumentationsdateien (`.md`, `.txt`, `.json`) wurden vollständig eingelesen und inventarisiert:

- 75 Projekt-/Fachdokumente
- 108 Release-/Änderungsdokumente
- 93 Qualitäts-/Testdokumente
- 22 UI-/UX-Dokumente
- 38 Schutz-/Schreibschutzdokumente
- 12 Architektur-/Datendokumente

Gesamtumfang: 1.296.875 Bytes, 24.797 Zeilen. Alle eingelesenen JSON-Dokumente sind syntaktisch gültig. Der unveränderte Lesekorpus besitzt SHA256 `87b106881edd57912698c4f85c83b36d90486baa087f486c1443b11b0b809361`.

Wesentliche verbindliche Grundlagen:

- statische HTML/CSS/JS-Anwendung ohne Buildsystem
- Fachlogik in Modulen, UI ohne verdeckte Fachdatenmutation
- Persistenz mit Integritätsschutz, Recovery und Readback
- Abrechnungs-/Archivkontext mit Schreibschutz
- Datenschema 5 und Datenebenenvertrag 1
- projektweite AP22F-Tabellen-, Seitenschalen-, Navigations- und Kachelstandards
- AP22F10G-B Korrektur 2 als aktuelle technische Ausgangsbasis

Nachweise: `analysis/DOCUMENT_INVENTORY.csv`, `analysis/DOCUMENT_READING_CORPUS.txt`, `analysis/DOCUMENT_READING_SUMMARY.json`.

## 3. Unveränderte technische Ausgangsbasis

### Erfolgreiche Prüfungen

- `npm ci --ignore-scripts`: erfolgreich, 3 Pakete, 0 bekannte Schwachstellen.
- `npm run release:check`: vollständig bestanden.
  - 55 JavaScript-Syntaxeinheiten
  - 6 Fixture-Fälle
  - AP22F10G, Korrektur 1 und Korrektur 2 statisch bestanden
  - strenge Release-Inhaltsprüfung: 692 Dateien
- AP22F10G-B Korrektur 2 Browserprüfung mit dem verbindlichen Echtdatenbestand: 9 von 9 Prüfungen bestanden.
- Echtdatenimport über den realen Datei-Importdialog, Persistenz, Readback und Neuladen: erfolgreich.
- Keine Browser-Laufzeitfehler im Echtdaten-Baselineharness.

### Vorhandene Testschulden der Ausgangsbasis

- Der AP22F10G-K2-Fallbacktest mit `standardfall.json` scheitert an einem im Fallbackbestand fehlenden bestätigten Anfangsstand; derselbe Test besteht mit dem verbindlichen Echtdatenbestand 9/9.
- `ap20-asset-refresh-regression.test.cjs` erwartet fest den historischen Build `99.4.24-ap21a` und ist für V99.4.60 veraltet.
- `ap6-modularization.test.cjs` verwendet eine veraltete Speicherzugriffs-Positivliste und beanstandet den inzwischen produktiven `app-state-persistence.js`.
- Der ältere AP22F9B-Browserharness erreicht im unveränderten Release seinen Audit-Wartepunkt nicht innerhalb von 30 Sekunden.
- Ausgewählte ältere Playwright-Projekte blieben im bestehenden Runner hängen; die reale Import-/Persistenzbaseline wurde deshalb zusätzlich durch einen eigenständigen Browserharness geprüft.

Diese Punkte sind bereits im unveränderten Release vorhanden und wurden nicht durch AP22F11B verursacht.

## 4. Echtdatenbaseline

### Grundbestand

- Abrechnungsjahr: 2025
- Zeitraum: 01.01.2025–31.12.2025
- Datenschema: 5
- Datenebenenvertrag: 1
- Quelle exportiert mit: V99.4.58
- JSON-SHA256: `b02a04881a45e8dbf7d190bc6d31a1ad788d44d8db3e04fd8654cd4ab9f36b09`
- 7 Wohnungen: 5 aktiv, 2 inaktiv
- 5 Abrechnungsrollen: 4 Mieter, 1 Eigentümer/Privat
- 41 Kostenarten, davon 3 aktiv
- 36 Vorauszahlungszeilen, davon 3 aktiv
- 4 Jahresarchive: 2024, 2023, 2022 und 2021/2022

### Aktive Kostenarten

| Kostenart | Umlageschlüssel | Gesamtbetrag |
|---|---|---:|
| Wasserversorgung | Verbrauch | 1.642,31 € |
| Heiz- und Warmwasserkosten | Manuelle Eingabe je Mieter/Wohneinheit | 9.965,97 € |
| Müllbeseitigung | Verteilung nur auf aktive Wohneinheiten | 1.503,00 € |
| **Gesamt** |  | **13.111,28 €** |

### Vorauszahlungen und Korrekturen

- Vorauszahlungen gesamt: 6.285,00 €
  - Heiz-/Warmwasser: 4.461,00 €
  - Wasser: 960,00 €
  - Müll: 864,00 €
- NK-Korrekturen/Gutschriften: 246,00 €
- Kaltmietkorrekturen: 0,00 €

### Manuelle Heiz- und Warmwasserkosten

- Summe aller sieben Abrechnungsfälle: 9.962,09 €
- Gesamtkosten: 9.965,97 €
- offene Differenz: 3,88 €
- enthalten: 4 Mieterfälle, 1 Privatfall und 2 Leerstandsfälle
- dokumentierter Leerstand: 575,49 € + 488,08 € = 1.063,57 €
- Privatanteil: 2.732,43 €

### Wasser

- Summe der eingegebenen Kalt-/Warmwasserverbräuche: 255,18 m³
- Kontrollwert aus Gesamtkosten: 275,00 m³
- offene Differenz: 19,82 m³
- daraus entstehender derzeit nicht zugeordneter Kostenanteil: 118,37504 €
- 10 von 14 Wasserzählern mit vollständigen Periodenwerten; 4 Zähler der beiden inaktiven Leerstandswohnungen ohne Werte

### Ergebniswerte der bestehenden Berechnung

| Abrechnungsfall | Kostenanteil | Vorauszahlungen | NK-Korrektur | Nachzahlung |
|---|---:|---:|---:|---:|
| Cynthia Melzig / EG-Links | 2.810,33 € | 1.677,00 € | 123,00 € | 1.010,33 € |
| Jutta Schneider / EG-Rechts | 1.339,12 € | 1.296,00 € | 0,00 € | 43,12 € |
| Inna Gärtner / 1OG-Links | 2.039,15 € | 2.016,00 € | 0,00 € | 23,15 € |
| Hatixe Bonesta / 1OG-Rechts | 2.065,90 € | 1.296,00 € | 123,00 € | 646,90 € |
| **Summe echte Mieter** | **8.254,50 €** | **6.285,00 €** | **246,00 €** | **1.723,50 €** |

Weitere Baselinewerte:

- Eigentümer-/Privatanteil: 3.670,96 €
- dokumentierter Leerstand: 1.063,57 €
- ungeklärter Rest: 122,25504 €
- davon Wasser: 118,37504 €
- davon Heiz-/Warmwasser: 3,88 €
- rechnerische Kontrolle: 13.111,28 € = 8.254,50 € + 3.670,96 € + 1.063,57 € + 122,26 €

## 5. Import-, Persistenz- und Erhaltungsbaseline

Der JSON-Bestand wurde über den tatsächlichen Importdialog importiert. Bestätigungsdialog, Speicherung, Integritätschecksumme, Readback und erneutes Laden waren erfolgreich.

Byte-/Strukturidentisch nach Import und Neuladen blieben insbesondere:

- Wohnungen
- Mietverhältnisse
- Kostenarten
- Vorauszahlungen
- Wasserwerte
- generische Messwerte
- manuelle/externe Umlagewerte
- Jahresarchive
- Wasserhistorie
- Kostenarten-Mieter-Umlage
- Abrechnungseinzelwerte
- Stammdaten

Zwei technische Spiegel-/Zählerstrukturen wurden bereits durch die unveränderte V99.4.60-Normalisierung verändert:

1. `objektStandard`: veraltete Spiegelwerte der Umlageeingaben werden auf den aktuellen Stand synchronisiert; technische Versionsmetadaten werden auf V99.4.60 gesetzt.
2. `zaehlerDaten`: die bestehende Synchronisierung erzeugt bei wiederholter Aufbereitung zusätzliche Korrektur-Messwerte für denselben unveränderten Zählerstand.

### Kritischer vorbestehender Zählerbefund

Der Eingangsbestand enthält bereits 701 Messwertversionen mit demselben `sourceKey` für den Kaltwasser-Endstand der Privatwohnung; 699 davon sind als korrigiert, eine als storniert und eine als aktiv gekennzeichnet. Jeder erneute Aufruf von `synchronizeMeteringData` erzeugt trotz unverändertem Wert 564,4 m³ eine weitere Korrekturversion. Im Baseline-Import stieg `zaehlerDaten.messwerte` deshalb von 769 auf 778 Einträge.

Ursache in der bestehenden V99.4.60-Logik: Die Äquivalenzprüfung vergleicht `ableseart`, bevor die neue Quelle bei vorhandener Vorgängerversion wieder auf `Korrekturablesung` gesetzt wird. Dadurch wird ein unveränderter aktiver Korrekturwert bei jedem Synchronisieren als abweichend erkannt.

Dieser Befund muss vor dem finalen AP22F11B-Echtdaten-Erhaltungstest behoben werden, weil sonst bei Import, Seitenwechsel oder Speicherung zusätzliche Messwertversionen entstehen. Eine Bereinigung vorhandener historischer Versionen darf nicht stillschweigend erfolgen; zunächst ist nur die weitere Duplizierung zu stoppen.

Zusätzlich enthält `meta.individualValuesPriorTransfers` 27 Einträge, aber nur 10 eindeutige Übernahmekombinationen; 17 Dubletten sind bereits im Eingangsbestand vorhanden.

Nachweise: `baseline/imported-export-baseline.json`, `baseline/meter-sync-reproduction.json`, `baseline/zip-working-copy-comparison.json`.

## 6. Bestehende Seite `umlage`

### Struktur

Die aktuelle Seite besteht aus vier aufklappbaren Bereichen:

1. Ergebnis je Mietverhältnis/Wohnung
2. Umlage-Kontrolle nach Kostenart
3. Berechnungsnachweis je Wohnung
4. Prüfung und Plausibilität als Platzhalter

Es gibt derzeit keine vier Kennzahlenkacheln, keinen eigenen Vermieterbereich, keine vollständige Differenzliste und kein Akzeptanz-/Begründungsmodell.

### Technische Wege

- HTML-Struktur: `index.html`, Abschnitt `#umlage`
- UI-Renderer: `js/ui-billing-allocation.js::renderUmlage()`
- Fachberechnung: `js/billing-calculation.js::calculateUmlage()` und `umlageTotals()`
- Qualitätsregeln: `js/quality-rules.js`
- Speicherung mit Readback: `js/ui-master-data.js::saveData()`
- JSON-Import: `js/browser-io.js::importJsonFile()`
- Archiv-/Ansichtsschutz: Billing-Context und Archivviewer

### Fachliche Lücken zum Zielbild

- Eigentümer/Privat wird derzeit zusätzlich in derselben Ergebnistabelle wie normale Mieter angezeigt.
- Leerstand wird nur als zusammengefasster dokumentierter Eigentümeranteil geführt, nicht als nachvollziehbare Vermieterposition.
- Offene Differenzen besitzen keine stabile fachliche Kennung und keine persistierte Prüfentscheidung.
- Es gibt keine Behandlung, Begründung, Bestätigung, Daten-/Berechnungssignatur oder Ungültigkeitslogik.
- Die Ergebnis-Seite besitzt aktuell einen allgemeinen Speichern-Button, obwohl Ursprungsdaten dort nicht verändert werden sollen.
- Die Kostenartenkontrolle hat 21+ Spalten und benötigt selbst bei 1640 px internen Horizontal-Scroll.
- Die bestehende Regel `NKP-FACH-013` meldet bei Heiz-/Warmwasser irreführend nur die Summe echter Mieter (6.166,09 €) gegen die Gesamtkosten, obwohl der vollständige Satz aus Mieter-, Privat- und Leerstandsfällen 9.962,09 € beträgt.
- In bestehenden Modulen sind noch einzelne ID-Sonderfälle (`K002`, `K006`, `K009`) vorhanden. AP22F11B muss seine neue Differenz- und Ergebnislogik ausschließlich aus aktiven Kostenarten, Umlageschlüsseln, Berechnungsarten, Rollen und Datenquellen ableiten.

## 7. Visuelle Baseline

- Zielmockup: 1024 × 1536 px, SHA256 `55d6f99ceeb599bf0809a8635802c13378fdbfcd8cc966acaaba5812411402a5`.
- 1440-px-Baseline-Screenshot und 760-px-Screenshot wurden erzeugt.
- Kein globaler horizontaler Dokument-Scroll in den geprüften Ansichten.
- Die bestehende Kostenartenkontrolle hat auf 1640 px einen internen Scrollbereich von 2.836 px bei 1.269 px sichtbarer Breite.
- Auf 760 px bleiben Tabellen innerhalb interner Scrollcontainer; kein globaler horizontaler Scroll.

## 8. Ergebnis der Vorbedingungen

Die technische Basis, Dokumentation, bestehende Seite, Berechnungswege, Persistenz, Archive und der Echtdatenbestand sind analysiert und dokumentiert. Eine unveränderte, bytegenaue technische Arbeitsbasis liegt unter `technical-base` bereit.

Vor Beginn der AP22F11B-Produktänderungen sind folgende Ausgangsbefunde verbindlich zu berücksichtigen:

1. keine weitere Zähler-Messwertduplizierung bei Normalisierung/Persistenz,
2. keine automatische Akzeptanz oder Vermieterzuordnung offener Differenzen,
3. vollständige Fallmenge für manuelle Kostenabgleiche,
4. Rollen- und Datenquellensteuerung statt Kostenart-ID-Sonderlogik,
5. eigenständiges persistentes Prüfentscheidungsmodell mit Signatur und Ungültigkeitslogik,
6. Erhalt sämtlicher Echtdaten und Archive,
7. Neugenerierung aller Release-Manifeste und aktueller Testnachweise.
