# AP22F10F Korrektur 4 – Dezimalwerte und Live-Summen

## Ursache
Die Sammelerfassung ersetzte das deutsche Komma zunächst durch einen Punkt und übergab den Wert anschließend an die globale Zahlenfunktion. Diese globale Funktion deutete Punkte als Tausendertrennzeichen. Dadurch wurde `297,74` zu `29774`. Zusätzlich wurden Zwischensummen nur aus dem gespeicherten Zustand und nicht aus den sichtbaren Eingaben berechnet.

## Korrektur
- lokaler, eindeutiger Parser für deutsche und internationale Dezimalwerte
- `297,74`, `297.74`, `1.297,74` und `1,297.74` werden korrekt interpretiert
- Speicherung erhält bereits normalisierte Zahlenwerte
- Verbrauchsvorschau und Speicherung verwenden dieselbe Zahl
- Zeilenstatus aktualisiert sich live
- wohnungsbezogene Summenzeilen aktualisieren sich live
- negative Verbräuche bleiben als Fehler markiert und werden nicht in Summen eingerechnet

## Erwartete Regression aus dem Nutzer-Screenshot
- UG KW: 564,00 − 490,00 = 74,00 m³
- UG WW: 312,42 − 280,00 = 32,42 m³
- UG Summe: 106,42 m³
- EG-Links KW: 297,74 − 266,00 = 31,74 m³
- EG-Links WW: 119,28 − 108,00 = 11,28 m³
- EG-Links Summe: 43,02 m³
