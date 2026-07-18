# AP22F8B Korrektur 1 – Testbericht

## Korrekturspezifische Prüfungen

- statische Struktur- und Vertragsprüfung: bestanden
- Chromium-Browsertest: bestanden
- vier Kacheln und Kachelwerte: bestanden
- sieben gleich breite Fallspalten im Standardfall: bestanden
- getrennte NK- und Kaltmietkorrektur je Mietverhältnis: bestanden
- getrennte Summen: bestanden
- sofortige Aktualisierung ohne Seitenwechsel: bestanden
- Speicherung im Arbeitsstand und erneutes Rendern: bestanden
- nicht abrechenbare Fälle zeigen weiterhin `—` und besitzen keine Korrektureingaben: bestanden
- sichtbare zentrale Vorauszahlungsprüfungen: bestanden
- Briefausgabe mit getrennten Korrekturarten: bestanden
- Kaltmietkorrektur ohne Wirkung auf den NK-Saldo: bestanden
- Nur-Ansehen-Modus: bestanden
- Desktop, 620 px und 390 px ohne horizontalen Seitenüberlauf: bestanden

## Vollständiger Release-Check

- 55 JavaScript-Einheiten syntaxfehlerfrei
- 6 Referenzdatenfälle semantisch unverändert
- Zählerregressionen bestanden
- Architektur- und Navigationsstrukturprüfungen bestanden
- AP21C-Kompatibilitätsprüfung bestanden
- strenge Release-Inhaltsprüfung bestanden

## Regression

- ursprünglicher AP22F8B-Browsertest: bestanden
- AP22F7B Mietverhältnisse: bestanden
- AP22F6B Korrektur 1: bestanden
- AP22F5B Zähler und Objekt-Mietverhältnisse: bestanden
- Dokument- und CSV-Export: 2/2 bestanden
- Migration, Restore und Rollback: 6/6 bestanden
- Persistenz, Backup und Wiederbearbeitung: 5/5 bestanden
- Brief und Druck: 8/8 bestanden
- zentrale Navigation: 3/3 bestanden

Lange kombinierte Playwright-Läufe erreichten teilweise das Laufzeitlimit der Umgebung. Die betroffenen Gruppen wurden anschließend getrennt beziehungsweise der noch ausstehende Einzeltest separat ausgeführt und bestanden.
