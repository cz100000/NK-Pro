# AP22F12A/B – Bekannte Restpunkte

## Produktiver Funktionsumfang

Keine bewusst vereinfachte oder isolierte Demofunktion verbleibt. Die Seite, Datenhaltung, Migration, Prüfarchitektur, Statusintegration und Exporte sind produktiv integriert.

## Testumgebung

Die vollständige automatisierte Browser-/E2E-Suite konnte nicht ausgeführt werden, weil die benötigte lokale Playwright-Installation fehlte und in der Ausführungsumgebung nicht aus der internen Paketquelle installiert werden konnte. Dieser Punkt ist im Testbericht offen dokumentiert.

## Empfohlene Freigabeprüfung

Vor der verbindlichen produktiven Freigabe sollte die Release-ZIP in einer Umgebung mit den projektgemäß installierten Browserabhängigkeiten ausgeführt werden. Dabei sind insbesondere Dialogbedienung, Responsive-Ansichten, Druckvorschau und tatsächliches Öffnen der SpreadsheetML-Datei in Excel 2019 visuell zu bestätigen.
