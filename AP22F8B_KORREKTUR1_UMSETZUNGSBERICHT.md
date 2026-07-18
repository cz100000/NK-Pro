# AP22F8B Korrektur 1 – Umsetzungsbericht

## Ausgangsbasis

`NK-Pro_V99_4_43_AP22F8B_Vorauszahlungen.zip`

SHA-256: `78edb9c17e6e7a6195550ee9e4610d59c863d4506af126ceb60be76dc5d148d9`

## Umgesetzte Korrekturen

- Vier kompakte Kacheln für Gesamtbestand, NK-Vorauszahlungen nach Korrektur, Kaltmieteinnahmen nach Korrektur sowie Korrekturen/Gutschriften ergänzt.
- Sämtliche Fallspalten der NK-Vorauszahlungsmatrix auf dieselbe feste Breite von 150 px vereinheitlicht. Die Basisspalten Kostenart und Summe bleiben fachlich abweichend bemessen.
- `vorjahresKorrektur` eindeutig als NK-Korrektur/Gutschrift fortgeführt.
- Neue optionale Eigenschaft `kaltmietKorrektur` für die getrennte Kaltmietkorrektur ergänzt; vorhandene Daten werden automatisch mit `0` normalisiert.
- NK- und Kaltmietkorrekturen in Tabelle, Zeilenwerten, Summen, Kacheln, Export und Brief getrennt ausgewiesen.
- Live-Aktualisierung der Nach-Korrektur-Werte bei jeder Eingabe umgesetzt.
- Positive Korrekturwerte bleiben Gutschriften zugunsten des Mieters; negative Werte bleiben Nachbelastungen.
- Nur NK-Korrekturen beeinflussen den Saldo der Nebenkostenabrechnung. Kaltmietkorrekturen werden im Brief separat erläutert und verändern den NK-Saldo nicht.
- Sichtbaren Bereich „Prüfung und Hinweise“ mit den zentralen Regeln NKP-FACH-015, NKP-PLAU-009 und der neuen Regel NKP-FACH-020 ergänzt.
- Nicht abrechenbare Eigentümer-/Privatfälle und Leerstände bleiben sichtbar, gesperrt und aus allen Betragsberechnungen und Summen ausgeschlossen.

## Versionsstand

- Produktversion: `V99.4.43`
- Paketbezeichnung: `AP22F8B-Vorauszahlungen-Korrektur1`
- Build-ID: `99.4.43-ap22f8b-k1`
- PWA-Cache: `nk-pro-v99-4-43-ap22f8b-k1`
- Datenschema: `5`
