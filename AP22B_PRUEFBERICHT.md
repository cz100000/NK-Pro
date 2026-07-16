# AP22B – Prüfbericht

## Technische Prüfung

- 55 JavaScript-Einheiten syntaktisch fehlerfrei.
- 6 Referenzfälle semantisch unverändert.
- Zählerstandard, Zählerstartregression und Zählerberechnungsregression bestanden.
- 7 relevante Architektur- und Kompatibilitätsprüfungen bestanden.
- AP21C-Struktur- und Kompatibilitätsprüfung bestanden.
- Separater AP22B-Struktur-, Versions- und Build-ID-Test bestanden.
- Release-Inhaltsprüfung bestanden: 268 Dateien geprüft, keine generierten Testartefakte im Releasebestand.

## Browserprüfung

Der separate AP22B-Chromium-Test startet die vollständige Anwendung und prüft:

- öffentliche UI-Bibliotheks-API in Version 1.1.0,
- produktive Migration von Buttons, Feldern, Karten, Klappboxen, Status und Hinweisen,
- Erhalt der zentralen Navigation,
- dynamisch eingefügtes Markup über den zentralen DOM-Upgradepfad,
- Fokus- und Layoutregeln einer geöffneten Fachseite,
- visuelle Darstellung der migrierten Grundkomponenten,
- keine Konsolen-, Seiten- oder Ladefehler.

Ergebnis: **1 von 1 Browsertests bestanden**.

## Änderungskontrolle

- Produktdateien: 10 und damit innerhalb der freigegebenen Obergrenze.
- Bestehende Regressionstests: unverändert.
- Neue Anforderungen: ausschließlich in separaten AP22B-Tests abgesichert.
- Nicht berührt: Datenmodell, Persistenz, Migration, Berechnung, Zählerfachlogik, Archiv, Briefe, Druck und Export.

## Historische Tests

Historische AP-Tests mit fest verdrahteten alten Releaseversionen werden nicht auf die neue Versionskennung umgeschrieben. Die für AP22B relevanten unveränderten Fach-, Architektur- und Kompatibilitätstests sowie der neue vollständige Browsertest bilden die Release-Abnahme.
## Release-Abnahme

- SHA-256-Prüfung des vollständigen Releasebestands bestanden.
- Release-ZIP neu erzeugt und in ein leeres Verzeichnis entpackt.
- Abhängigkeiten aus dem entpackten Stand installiert.
- Vollständige AP22B-Releaseprüfung aus diesem entpackten Stand bestanden.
- Vollständiger Anwendungsstart im Chromium-Test aus dem entpackten Release bestanden.

