# AP11 – Prüf- und Freigabebericht

**Version:** NK-Pro V99.4.12 – Navigationsstruktur und visuelles Grundsystem  
**Datum:** 13.07.2026  
**Basis:** V99.4.11

## 1. Ausgangsanalyse

Die Ausgangsversion enthielt 16 produktive Zielseiten in vier Aufklappgruppen. Das Markup verwendete einen generischen `div.tabs`-Container, Text-Chevrons, ein älteres Logo und mehrere historisch überlagerte CSS-Regelblöcke. Die Abrechnungsgruppe führte elf gleichrangige Punkte. Ein allgemeiner Einstellungen-Eintrag im unteren Bereich fehlte.

Die Architekturwerte wurden am Quellcode verifiziert: statisches HTML/CSS/JavaScript, 13 UI-Controller, 99 eindeutige Aktionskennungen, Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandards 1 und Abrechnungssnapshot 2.

## 2. Umgesetzter Zielstand

- genau eine produktive semantische Hauptnavigation,
- vier Gruppen und 16 weiterhin erreichbare Zielseiten,
- Reihenfolge der Objektgruppe: Objekt, Wohnungen, Zähler, Mieter,
- zehn gleichrangige Abrechnungsschritte in fachlicher Ablaufreihenfolge,
- 22 lokale Inline-SVGs mit einheitlichem 24-Pixel-Raster und 1,8-Pixel-Strich,
- aktiver Zustand mit Hintergrund, Text/Icon, 4-Pixel-Seitenmarker und `aria-current=page`,
- sichtbarer, fokussierbarer und aktionsloser Einstellungen-Dummy mit „Noch nicht verfügbar“,
- 316/286 Pixel Desktopbreite, Drawer unter 981 Pixel, kontrolliertes Scrollen bei geringer Höhe,
- zentrale Design-Tokens und sichtbare Tastaturfokussierung,
- keine zweite Navigation, keine neue Fachaktion und keine direkte Fachzustands- oder Speicheränderung im Navigationsmodul.

## 3. Ausgeführte statische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax | 36 Einheiten bestanden |
| Referenz-Fixtures | 6 Fälle bestanden |
| Zählerdomäne | bestanden |
| AP6-Architektur | bestanden |
| AP7-UI-Architektur | 13 Controller, 99 Aktionen, bestanden |
| AP8-Anwendungsaktionen | bestanden |
| AP9-Kernorchestrierung | bestanden |
| AP10-Orchestrierung | 79 Extraktionen, 6.294 Zeilen/382.650 Byte, bestanden |
| AP11-Navigationsarchitektur | 4 Gruppen, 16 Ziele, SVG-/Token-/Dummy-Regeln bestanden |

## 4. Browser- und Regressionstests

Insgesamt wurden 52 logische Playwright-Tests aus elf Projekten erfolgreich ausgeführt. Dazu gehören Start und Navigation, Dokument/Export, Migration/Restore, Modulgrenzen, UI-Ereignisse, Objektstandard/Snapshot, Persistenz/Backup, sechs Referenzabrechnungen, Service Worker, AP10-Orchestrierung und AP11-Navigation.

Ein langer gemeinsamer Chromium-Lauf blieb in der Testumgebung sporadisch vor einem späteren Test beziehungsweise beim Prozessübergang stehen. Entsprechend der ausdrücklich erlaubten Vorgehensweise wurden die betroffenen Tests mit einem Worker in frischen Prozessen getrennt ausgeführt. Jeder der 52 logischen Tests besitzt ein tatsächliches erfolgreiches Ergebnis; kein Test wurde allein aufgrund eines abgebrochenen Sammellaufs als bestanden gewertet.

## 5. Visuelle Browserprüfung

Erzeugt und geprüft wurden:

- `navigation-1920x1080.png`,
- `navigation-1600x900.png`,
- `navigation-1366x768.png`,
- `navigation-1280x720.png`,
- `navigation-schmal-900x720.png`,
- `navigation-zoom-150.png`.

Dabei wurden Navigationsbreite, weiße Panelkante, Gruppenabstände, Iconkonsistenz, aktiver Zustand, Footertrennung, Drawer, geringe Höhe, Textabschneidung und horizontale Seitenverschiebung kontrolliert. Die Bildreferenz wird in Aufbau, Farbwirkung, Wortmarke, Konturicons, Reihenfolge und Footerzone nachvollziehbar umgesetzt.

## 6. Fachliche Regression

Unverändert bestanden haben die sechs Referenzfälle einschließlich Standardfall, Mieterwechsel, Leerstand, Eigentümer M000, aller Eingabequellen und Altdatenmigration. Kostenverteilung, Vorauszahlungen, Nachzahlung/Guthaben, Rundung, Zählerverbrauch, Stromzähler-Dummy-Ausschluss, Archivierung, Jahreswechsel, Qualitätsprüfung, Diagnose, Dokumente, Exporte, Migration, Backup, Restore und Rollback wurden durch bestehende statische und Browserprüfungen abgedeckt.

## 7. PWA und Offline-App-Shell

Manifest, HTML-Titel, Laufzeitversion und Service-Worker-Cache stehen auf V99.4.12. Alle produktiven Skripte, Styles und vorhandenen PNG-App-Icons sind in der App-Shell enthalten. Die neuen Navigationsicons sind Inline-SVGs und benötigen keine zusätzlichen Cachedateien. Der Service-Worker-Installations- und Altcache-Test ist bestanden.

## 8. Nicht ausgeführte Prüfungen

Keine fachlich oder technisch geforderte Prüfung blieb unausgeführt. Der visuelle Freigabelauf wurde explizit mit `AP11_CAPTURE=1` ausgeführt. Der gemeinsame Playwright-Sammelprozess wurde wegen des beschriebenen Umgebungsstillstands nicht als Freigabenachweis verwendet; stattdessen liegen vollständige, erfolgreiche Teilprozesse vor.

## 9. Bekannte Grenzen

- Die Anwendung bleibt Desktop-first; der schmale Zustand ist ein Drawer und keine vollständige mobile Neuentwicklung.
- Formulare, Tabellen und Dialoge besitzen weiterhin ältere Detailstile außerhalb des AP11-Umfangs.
- Der Einstellungen-Eintrag ist bewusst keine produktive Funktion.
- `app.js` bleibt groß und ist Gegenstand von AP12.
- Briefvorschau und Druckausgabe wurden nicht gestalterisch verändert; AP13 bleibt dafür reserviert.

## 10. Releaseverfahren

Nach Abschluss der Dokumentation wird der vollständige Dateibestand in `SHA256SUMS.txt` erfasst, die Release-Konsistenzprüfung ausgeführt, eine Versions-ZIP erstellt und diese in ein leeres Verzeichnis entpackt. Syntax, Fixtures, Zählerdomäne, Architektur, Releasekonsistenz, Browserstart, Navigation, PWA und Dateivollständigkeit werden aus dieser Entpackung erneut geprüft. Die SHA-256-Prüfsumme der ZIP wird außerhalb des Archivs als abschließender Transportnachweis ausgegeben.
