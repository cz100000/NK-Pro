# AP22F3B – Paketvollständigkeitsprüfung

## Enthalten

- vollständige NK-Pro-Produktbasis V99.4.38,
- alle zehn freigegebenen Produkt-/Referenzänderungen,
- AP22F3B-Testintegration und drei neue Testdateien,
- aktualisierte browserfähige UI-Referenz,
- vier Produkt-Screenshots,
- Umsetzungs-, Datei-, Positivlisten-, Schutz-, Test-, Abnahme- und Releaseberichte,
- Installations-/Prüf-README,
- Inhaltsprüfsummen in `SHA256SUMS.txt`.

## Ausgeschlossen

- `node_modules`,
- `test-results`, `playwright-report` und andere generierte Browserartefakte,
- Laufzeitlogs und Traces,
- Eingangs-ZIPs und Planungspaket,
- temporäre Arbeits- oder Baselineverzeichnisse.

## Ergebnis

Die strikte Release-Inhaltsprüfung meldet keine unzulässigen Releaseinhalte. Die installierten Arbeitsabhängigkeiten werden vor der ZIP-Erstellung ausgeschlossen.
