# AP21B – Lieferung 3

## Umfang

- Zentrale Zählerdaten werden beim Öffnen der Hauptklappbox und aller fünf Unterklappboxen zuverlässig gerendert.
- Direkteinstiege in die zentrale Zählerquelle lösen das Rendering aus und führen den Tastaturfokus auf den ersten Unterbereich.
- Automatisch übernommene Werte bleiben in den Kostenarten schreibgeschützt; Korrekturen erfolgen an der zentralen Zählerquelle.
- Heiz- und Warmwasserkosten verwenden ein rotes SVG-Flammenicon.
- Gemeinschaftsantenne / Verteilanlage verwendet ein SVG-Satellitenschüssel-Icon.
- Der Schreibschutztest prüft alle vorhandenen Speichern-Aktionen statt eine feste Buttonanzahl vorauszusetzen.

## Prüfungen

- JavaScript-Syntax: bestanden, 55 Einheiten.
- AP21B-Strukturprüfung: bestanden.
- Chromium-/Playwright AP21B: 3 von 3 Tests bestanden.
  - Navigation und Abrechnungsübersicht
  - fünf Zähler-Unterklappboxen und Direkteinstieg
  - schreibgeschützter Ansichtsmodus

## Geänderte Dateien

- `js/ui-individual-values.js`
- `tests/ap21b-overview-navigation-metering.spec.js`
- `AP21B_LIEFERUNG_3.md`
