# Testbericht

**Stand:** 20.07.2026

## Erfolgreiche Prüfungen

- JavaScript-Syntax: 58 Einheiten fehlerfrei.
- Referenzdaten: 6 semantische Fälle unverändert.
- Zählerdomäne und Zählerregressionen bestanden.
- Gepflegte Architekturprüfungen bestanden.
- K4-Statikprüfung bestanden.
- K4-Browserprüfung bestanden: 12 Prüfgruppen, 87 Inventarregeln, keine Browser-Laufzeitfehler.
- Import/Export/Reimport des getesteten Gesamtbestands bestanden; Schema 5 und geschützte Fachdaten unverändert.
- Desktop 1440 px, Desktop 1640 px, 125-%-Äquivalent und schmale Ansicht geprüft.
- Interner Tabellen-Scroll auf schmalen Ansichten; kein horizontaler Dokumentüberlauf.

## Browser-Prüfgruppen

- Alle fallbezogenen Ergebnisse einschließlich Bestanden, Nicht anwendbar und Entscheidungen sichtbar
- Gruppierung folgt exakt der zentralen Navigationsdefinition
- Kennzahlenkarten und Statuschips filtern dezent und konsistent
- Ergebnis- und Regeldetails enthalten die geforderten fachlichen Angaben
- Qualitätsseite bei 1440, 1640 und 125-%-Äquivalent ohne Dokumentüberlauf
- Regelinventar mit 87 ausschließlich produktiven Regeln und vollständigen Metadaten geprüft
- Beide Seiten schmal ohne Dokumentüberlauf und mit internem Tabellen-Scroll
- Korrigieren führt zur verursachenden Eingabeseite und fokussiert den Bereich
- Dieselbe finanzielle Entscheidung ist auf Abrechnungsergebnis und Prüfen/Abschließen konsistent
- Änderung der Ursprungsdaten invalidiert die Entscheidung über die bestehende Signatur
- Fachlicher Abschluss erst nach erledigten Prüfungen; geprüfter Stand wird eingefroren
- Kritischer Abrechnungsmangel kann nicht akzeptiert werden und verhindert den Abschluss

## Screenshot- und Laufstabilität

Die sieben Vollseiten-Screenshots wurden in einem erfolgreichen Browserlauf erzeugt und anschließend technisch geöffnet und auf Abmessungen geprüft. Der wiederholbare Abnahmelauf prüft dieselben Layoutzustände standardmäßig ohne erneute Vollseitenaufnahme, um Chromium-Ressourcenverbrauch bei sehr langen Inventarseiten zu begrenzen. Dies betrifft ausschließlich die Testausführung, nicht die Produktlogik oder Darstellung.

## Historische Testpflege

Mehrere ältere Tests enthielten fest verdrahtete frühere Statusbezeichnungen, Controllerzahlen oder Buildversionen. Die weiterhin fachlich gültigen Prüfungen wurden auf die aktuelle zentrale Status- und Navigationslogik angepasst. Releasegebundene historische Snapshotprüfungen bleiben historische Nachweise und sind nicht Teil der aktuellen K4-Abnahme.

## Protokolle

- `browser-test-result.json`
- externes `K4_BROWSER_FINAL_SUCCESS.log`
- externes `RELEASE_CHECK_FINAL.log`
- externes `K4_DATEN_ROUNDTRIP_FINAL.log`
