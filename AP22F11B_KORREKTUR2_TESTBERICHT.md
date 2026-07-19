# AP22F11B Korrektur 2 – Testbericht

## Gesamtergebnis

Alle für den Korrekturumfang abschließend ausgeführten Prüfungen wurden bestanden.

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax, 56 Einheiten | bestanden |
| Referenzdaten/Fixures, 6 Fälle | bestanden |
| AP22F11B statische Prüfung | bestanden |
| AP22F11B Korrektur 1 statische Prüfung | bestanden |
| AP22F11B Korrektur 2 statische Prüfung | bestanden |
| zentrale Navigationsstruktur AP21B2 | bestanden |
| Brief-/Dokumentstruktur AP13 | bestanden |
| AP22F11B vollständige Browserprüfung, 14 Gruppen | bestanden |
| AP22F11B Korrektur 1 Browserregression | bestanden |
| AP22F11B Korrektur 2 Browserprüfung | bestanden |
| vollständiger Export-/Reimport-Test | bestanden |
| Browser-Laufzeitfehler in Korrektur-2-Prüfungen | 0 |

## Navigation

Geprüft wurden:

- sichtbarer Eintrag „Vorauszahlungen anpassen“,
- Position nach „Abrechnungsergebnis“ und vor „Prüfung & Freigabe“,
- neuer Block „Analyse“ mit „Auswertungen“,
- Position des Analyseblocks vor „Archiv“,
- Wechsel in beide neuen beziehungsweise wieder sichtbaren Arbeitsbereiche.

## Vorauszahlungsanpassung

Geprüft wurden:

- vier Kennzahlenkarten,
- drei aktive vorauszahlungsrelevante Kostenarten im Echtdatenbestand,
- vier abrechenbare Mietverhältnisse,
- vollständige Anzeige der Bereiche Basisanpassung, Preisprognose und Briefausgabe,
- bestehende Rundungs-, Mindeständerungs-, Hochrechnungs- und Änderungsregeln,
- getrennte Preisprognose,
- allgemeiner Prozentsatz und kostenartbezogene Überschreibung,
- Begründung/Quelle und Gültigkeit je Kostenart,
- unmittelbare Neuberechnung nach Regeländerung,
- Persistenz nach Seitenwechsel,
- rechtsbündige Zahlen- und Eurospalten,
- neutrale Tabellenköpfe ohne nicht freigegebene Sortiermarkierungen.

## Ansichten und Responsivität

Geprüft wurden:

- Desktop 1440 px,
- Desktop 1640 px,
- 125-%-Äquivalent bei 1152 CSS-Pixeln,
- schmale Ansicht mit 760 px,
- kein horizontaler Dokument-Scroll,
- vollständige Tabellenbreite auf Desktop,
- interner Tabellen-Scroll in schmaler Ansicht.

## Analyse

Geprüft wurden:

- vier Kennzahlen,
- konsistente Gesamtkosten von `13.111,28 €`,
- konsistenter Vermieterbetrag von `4.734,53 €` im unveränderten Testbestand,
- vier Mieterzeilen,
- rechtsbündige Beträge,
- rein lesende Darstellung ohne Schreibaktion.

## Daten und Regression

Der vollständige V99.4.62-Testbestand wurde importiert, mit V99.4.63 exportiert, in einen leeren Browserzustand reimportiert und erneut geprüft. Erhalten blieben unter anderem:

- 7 Wohnungen,
- 5 Mietverhältnisse,
- 41 Kostenarten,
- 4 Jahresarchive,
- 44 Zähler,
- 769 Messwerte,
- 10 Messperioden,
- sämtliche Wasserstände und manuellen Umlagewerte,
- 0 unbeabsichtigt erzeugte Prüfentscheidungen.

Das Datenschema bleibt Version 5.

## Historischer Architekturtest

Der historische Test `ap12-app-decoupling.test.cjs` ist bereits in der unveränderten V99.4.62-Basis nicht grün: Sein fest verdrahtetes Renderer-Inventar und ältere Versionsannahmen entsprechen nicht mehr dem aktuellen Produktstand; außerdem meldet er die bereits bestehende globale Bindung `NKProMeteringDraft`. Dieser Altbefund wurde durch Korrektur 2 nicht verursacht und nicht als bestandene Prüfung gewertet.
