# AP22C – Prüfbericht

## Technische Prüfung

- 55 JavaScript-Einheiten syntaktisch fehlerfrei.
- 6 Referenzfälle semantisch unverändert.
- Zählerstandard, Zählerstartregression und Zählerberechnungsregression bestanden.
- 7 relevante Architektur-, Modul- und Navigationsstrukturprüfungen bestanden.
- AP21C-Struktur- und Kompatibilitätsprüfung bestanden.
- Separater AP22C-Struktur-, Versions- und Build-ID-Test bestanden.
- Release-Inhaltsprüfung bestanden: 278 Dateien geprüft; installierte Abhängigkeiten und generierte Testartefakte sind vom Release ausgeschlossen.

## Browserprüfung AP22C

Der separate AP22C-Chromium-Test startet die vollständige Anwendung und prüft:

- öffentliche UI-Bibliotheks-API in Version 1.2.0,
- produktive Migration von mindestens 20 Tabellen und 20 Tabellencontainern,
- tabellenbezogene Werkzeugleisten und strukturierte Listen,
- dynamisch eingefügte Tabellen, Listen und Suchwerkzeuge über den zentralen DOM-Upgradepfad,
- nachträglich gerenderte Tabellenköpfe mit `scope="col"`,
- Erhalt der zentralen Navigation,
- ausdrücklichen Ausschluss von Brief- und Dokumenttabellen,
- sichtbare Tabellen-, Filter- und Listenkomponenten auf einer produktiven Fachseite,
- keine Konsolen-, Seiten- oder Ladefehler.

Ergebnis: **1 von 1 AP22C-Browsertests bestanden**.

## Zusätzliche gezielte Browserregression

- 2 Dokument-/Exporttests bestanden.
- 6 Referenzfalltests bestanden.
- 8 AP13-Brief-/Drucklayouttests bestanden.
- 3 AP21B2-Navigationszentralisierungstests bestanden.

Insgesamt wurden zusätzlich **19 gezielte Browsertests** erfolgreich ausgeführt.

## Änderungskontrolle

- Produktdateien: 10 und damit innerhalb der verbindlichen Obergrenze.
- Bestehende Regressionstests: unverändert.
- Neue Anforderungen: ausschließlich in separaten AP22C-Tests abgesichert.
- Nicht berührt: Datenmodell, Persistenz, Migration, Berechnung, Zählerfachlogik, Archiv, Briefe, Druck und Export.

## Historische Tests

Der ältere allgemeine `app-smoke`-Test ist kein AP22C-Release-Gate. Er enthält fest verdrahtete Erwartungen an V99.4.24 sowie die vor AP21B2 verwendete Navigationsgruppe „Extras“ und kann deshalb unverändert nicht gegen V99.4.31 bestehen. Diese historische Testdatei wurde entsprechend der Änderungs-Kontrollregel nicht angepasst. Stattdessen wurden aktuelle Architektur-, Navigations-, Dokument-, Referenzfall- und AP22C-Tests verwendet.

## Release-Abnahme

- SHA-256-Prüfung des vollständigen Releasebestands bestanden: 277 erfasste Dateien, keine Abweichung.
- Release-ZIP neu erzeugt und in ein leeres Verzeichnis entpackt.
- Abhängigkeiten aus dem entpackten Stand installiert.
- Vollständige AP22C-Releaseprüfung aus dem entpackten Stand bestanden.
- Vollständiger Anwendungsstart im Chromium-Test aus dem entpackten Release bestanden.
