# AP22F9B Korrektur 1 – Testbericht

## AP22F9B-spezifisch

| Test | Ergebnis |
|---|---|
| `tests/ap22f9b-total-costs.test.cjs` | PASS |
| `tests/ap22f9b-protected-areas.test.cjs` | PASS – 13 Vollhashes und 5 Teilbereiche |
| `tests/ap22f9b-total-costs-browser.test.cjs` | PASS |

Der Browsertest prüft zusätzlich:

- vier Linien-SVG-Symbole ohne Textglyphen;
- hellgraue Tabellenköpfe mit dunkler Schrift in Haupt- und Umlagetabelle;
- keine automatisch ergänzten Sortierklassen;
- weiterhin 15 Spalten in der Haupttabelle;
- Gesamtsumme, Kachelwerte, Suche, Speichern und Neuladen;
- Kostenartenauswahl, Einheitspreisdialog und Umlagezuordnung;
- Nur-Ansehen-Modus;
- 2×2-Kachelraster bei 620 px und 390 px;
- interner Tabellen-Scroll ohne horizontalen Seitenüberlauf.

## Release-Prüfung

`npm run release:check` wurde bestanden:

- 55 JavaScript-Einheiten syntaktisch fehlerfrei;
- 6 Referenzfälle semantisch unverändert;
- Zählerregressionen bestanden;
- Architektur-, Dokument- und Navigationsregressionen bestanden;
- AP21C-Kompatibilitätsprüfung bestanden;
- Inhaltsprüfung bestanden.

## Bekannte Ausgangsabweichung

Der historische Gesamttest `tests/ap20-asset-refresh-regression.test.cjs` erwartet weiterhin einen Versionsparameter für `ui-bindings.js`. Diese bereits vor AP22F9B vorhandene Abweichung wurde nicht durch Änderungen an geschützten zentralen Dateien behoben.
