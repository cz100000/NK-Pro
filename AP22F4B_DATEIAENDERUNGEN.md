# AP22F4B – Dateiänderungsliste

| Datei | Änderung |
|---|---|
| `UI_KOMPONENTENKATALOG.md` | Tabellenkomponente Wohnungen und Zustände in Referenz 1.0 verankert. |
| `UI_MIGRATIONSMATRIX.md` | Migration der Seite `wohnungsverwaltung` mit Release V99.4.39 dokumentiert. |
| `UI_UX_ABNAHMEKATALOG.md` | Abnahmeregeln für Wohnungsbestand, Suche, Status, Aktionen und Responsive ergänzt. |
| `UI_UX_DESIGNVERTRAG.md` | NK-Pro UI Referenz 1.0 für die Wohnungsseite verbindlich fortgeschrieben. |
| `UI_UX_KOMPONENTENREGELN.md` | Zentrale Tabellen-, Hinweis- und Aktionsregeln für die Migration ergänzt. |
| `assets/app.css` | Seitenbezogene Styles ergänzt; Korrektur 1 ergänzt den weißen 8-px-Innenabstand und die vollbreite Desktoptabelle. |
| `index.html` | Struktur der Seite `wohnungsverwaltung` auf Tabellenkarte, Hinweis-Hosts und Ergebnisfuß migriert; Release-Assets fortgeschrieben. |
| `js/app-runtime-config.js` | Releasekennung, Name, Datum und Änderungsprotokoll auf V99.4.39 aktualisiert. |
| `js/service-worker-register.js` | Buildkennung auf `99.4.39-ap22f4b` aktualisiert. |
| `js/ui-navigation-pages.js` | Wohnungstabelle mit vorhandenen Feldern, bestehender Objektstandardprüfung, Suche, Statusfilter, Aktionsspalte und Schreibschutz gerendert. |
| `js/ui-page-controller.js` | Seitenkonfiguration und Deaktivierung der Speicheraktion im Nur-Ansehen-Modus ergänzt. |
| `manifest.webmanifest` | Version und Releasebeschreibung aktualisiert. |
| `nk-pro-project.json` | Releasemetadaten und Migrationsstand der Wohnungsseite aktualisiert. |
| `package-lock.json` | Ausschließlich Paketname und Version auf 99.4.39 angeglichen. |
| `package.json` | Ausschließlich Paketname und Version auf 99.4.39 angeglichen. |
| `service-worker.js` | Cache- und Buildkennung auf V99.4.39 aktualisiert. |
| `ui-reference/index.html` | Nicht produktive Referenz um die verbindliche Wohnungsseiten-Komponente ergänzt. |
| `ui-reference/reference.css` | Referenzdarstellung einschließlich weißem Tabelleninnenrand und vollbreiter Desktoptabelle ergänzt. |
| `screenshots/AP22F4B/01_desktop_vollstaendig.png` | Zielzustand Desktop vollständig. |
| `screenshots/AP22F4B/02_desktop_handlungsbedarf.png` | Zielzustand Desktop mit wohnungsbezogenem Handlungsbedarf. |
| `screenshots/AP22F4B/03_nur_ansehen.png` | Zielzustand Nur ansehen. |
| `screenshots/AP22F4B/04_schmale_ansicht.png` | Zielzustand 390 px mit intern scrollbar bleibender Tabelle. |
| `screenshots/AP22F4B/05_desktop_weisser_innenrand.png` | Korrekturregression: vollbreite Tabelle mit weißem Innenabstand bei 1648 px. |
| `tests/ap22f4b-housing-management.test.cjs` | Statische AP22F4B-Prüfung einschließlich weißem Tabelleninnenrand und vollbreiter Tabelle. |
| `tests/ap22f4b-housing-management-browser.test.cjs` | Browserprüfung aller Zielzustände sowie eigener 1648-px-Regressionsfall für den weißen Tabelleninnenrand. |
| `tests/ap22f4b-protected-areas.test.cjs` | Hashprüfung der 13 Schutzdateien und 74 bestehenden Regressionstestdateien. |
| `AP22F4B_UMSETZUNGSBERICHT.md` | Abschlussbericht. |
| `AP22F4B_DATEIAENDERUNGEN.md` | Menschenlesbare Dateiänderungsliste. |
| `AP22F4B_DATEIAENDERUNGEN.json` | Maschinenlesbare Dateiänderungsliste. |
| `AP22F4B_POSITIVLISTENABGLEICH.md` | Abgleich mit ursprünglicher und ausdrücklich erweiterter Positivliste. |
| `AP22F4B_SCHUTZ_HASH_BERICHT.md` | Schutz-Hash-Bericht. |
| `AP22F4B_TESTBERICHT.md` | Testbericht. |
| `AP22F4B_TEST_RESULTS.json` | Maschinenlesbares Testergebnis. |
| `AP22F4B_ABNAHMEKATALOG.md` | Ausgefüllter Abnahmekatalog. |
| `AP22F4B_UI_REFERENZ.md` | Nachweis der aktualisierten UI-Referenz. |
| `AP22F4B_README.md` | Release-README und Nutzungshinweise. |
| `AP22F4B_KORREKTUR_1.md` | Befund, Ursache, technische Korrektur und Regressionstest der visuellen Nachkorrektur. |
| `SHA256SUMS.txt` | Nach Abschluss vollständig neu erzeugte interne Datei-Prüfsummen. |

Gesamt: **38** geänderte oder neu ergänzte Dateien einschließlich Korrekturartefakt, fünf Screenshots und interner Prüfsummenliste.
