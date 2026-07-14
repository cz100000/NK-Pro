# AP20 – Korrekturstand 2: Live-Zählerberechnung und robuste Dezimaleingabe

## Anlass

In der Tabelle „Zählerstände erfassen“ wurden geänderte Endstände zwar im Eingabefeld sichtbar, der berechnete Verbrauch und die Summenzeile blieben jedoch bis zu einem vollständigen Fokuswechsel auf dem vorherigen Wert. Eine Bestätigung mit Enter löste keinen sicheren Commit aus. Dadurch konnten alte Werte wie `0` oder `55` neben bereits neu eingegebenen Zählerständen stehen.

Zusätzlich behandelte die allgemeine Zahlenumwandlung einen eingegebenen Dezimalpunkt als Tausendertrennzeichen. Zählerstände mit `128.06` konnten deshalb bei einer neuen Eingabe falsch interpretiert werden.

## Korrektur

- Kaltwasser-, Warmwasser- und Gesamtverbrauch werden während der Eingabe sofort in der betroffenen Tabellenzeile aktualisiert.
- Die Summenzeile wird gleichzeitig live neu berechnet.
- Statuswerte wie „OK“, „Endstand fehlt“ und „Zählerstand prüfen“ reagieren unmittelbar auf die sichtbaren Eingaben.
- Sonstige Verbrauchszähler verwenden dieselbe Live-Vorschau.
- Enter bestätigt und speichert den aktuellen Zählerwert zuverlässig.
- Der normale Fokuswechsel speichert weiterhin über das bestehende `change`-Ereignis.
- Dezimalkomma und Dezimalpunkt werden für Zählerwerte gleichwertig unterstützt.
- Gemischte Formate wie `1.234,56` und `1,234.56` werden korrekt normalisiert.
- Die Live-Vorschau verändert vor dem Commit weder den gespeicherten Zustand noch die Messwertrevisionen. Erst Enter oder Fokuswechsel führt die bestehende zentrale Speicherung und Zählersynchronisierung aus.
- Der PWA-Cache wurde auf `nk-pro-v99-4-23-ap20-corr2` angehoben.

## Referenzfälle

| Anfang | Endeingabe | Erwarteter Verbrauch |
|---:|---:|---:|
| 266 | 297,24 | 31,24 m³ |
| 117 | 128.06 | 11,06 m³ |
| 100 | 90 | 0 m³ und „Zählerstand prüfen“ |

## Daten- und Versionsvertrag

- Anwendungsversion: V99.4.23
- Datenschema: 5
- Datenebenenvertrag: 1
- Abrechnungs- und Umlageformeln: unverändert
- AP20-Regel-Registry: unverändert
- Gespeicherte Bestandsdaten: keine automatische fachliche Änderung

## Regression

Die neue Node- und Chromium-Regression bestätigt:

1. Live-Verbrauch vor Fokuswechsel.
2. Live-Aktualisierung der Summenzeile.
3. Keine Zustandsänderung allein durch die Vorschau.
4. Commit mit Enter.
5. korrekte Verarbeitung von Dezimalkomma und Dezimalpunkt.
6. korrekte Speicherung im Local Storage.
7. korrekte Wiederherstellung der Werte und Verbräuche nach einem Browserneustart.
