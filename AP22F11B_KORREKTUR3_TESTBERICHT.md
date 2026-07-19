# AP22F11B Korrektur 3 – Testbericht

## Ergebnis

**Bestanden.** Die neue Abschlussseite und das Regelinventar sind releasefähig.

## Durchgeführte Prüfungen

### Struktur und Version

- Produktversion V99.4.64 konsistent
- Datenschema weiterhin 5
- Navigationsreihenfolge geprüft
- `Prüfen und abschließen` vorhanden
- `Analyse → Auswertungen → Regelinventar` vorhanden
- Regelinventar von der Abschlussseite getrennt
- Cache- und Buildkennung `99.4.64-ap22f11b-k3`

### JavaScript und Referenzfälle

- 56 JavaScript-Einheiten syntaktisch fehlerfrei
- 6 von 6 Referenzdatenfällen semantisch unverändert
- Zählerdomänenprüfung bestanden
- Zählerstartregression bestanden
- Zählerberechnungsregression bestanden

### AP22F11B-Fachregression

- ursprüngliche Ergebnis- und Differenzprüfung: 14 von 14 Browser-Prüfgruppen bestanden
- Korrigieren führt weiterhin zur Ursprungsseite
- Akzeptanz, Persistenz und Ungültigwerden nach Datenänderung weiterhin bestanden
- Archiv-/Nur-Ansehen-Verhalten weiterhin bestanden
- keine Browser-Laufzeitfehler

### Korrektur-3-Browserprüfung

Geprüft wurden:

- vier Abschlusskennzahlen,
- offene und erledigte Prüfpunkte,
- Regel-Detaildialog,
- Hinweisfilter,
- deaktivierte Abschlussaktion,
- vollständiges Regelinventar mit 44 Regeln,
- Suche und Status-/Bereichsfilter,
- Desktop 1440 px,
- schmale Ansicht 760 px,
- kein Dokumentüberlauf,
- Tabellenüberlauf ausschließlich in der internen Tabellenhülle.

### Datenroundtrip

- Import des getesteten V99.4.63-Gesamtbestands
- Export mit V99.4.64
- Import in einen leeren Browserzustand
- vollständiger Vergleich geschützter Geschäftsdaten
- 769 Messwerte unverändert
- 4 Jahresarchive unverändert
- keine zusätzlichen Prüfentscheidungen
- keine Änderung von Wohnungen, Mietverhältnissen, Kostenarten, Vorauszahlungen, Wasserständen, manuellen Werten oder Archiven

## Ausgeführte Testprogramme

- `tools/check-js-syntax.cjs`
- `tools/check-fixtures.cjs`
- `tests/metering-domain.test.cjs`
- `tests/ap20-meter-start-regression.test.cjs`
- `tests/ap20-meter-calculation-regression.test.cjs`
- `tests/ap22f11b-billing-result.test.cjs`
- `tests/ap22f11b-billing-result-browser.test.cjs`
- `tests/ap22f11b-korrektur3.test.cjs`
- `tests/ap22f11b-korrektur3-browser.test.cjs`
- `tests/ap22f11b-korrektur3-data-roundtrip.test.cjs`
