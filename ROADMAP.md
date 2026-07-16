# Roadmap

## Abgeschlossen

- AP13: Brief-, Druck-, PDF- und Vorschaukonsistenz
- AP14–AP18: Navigation, visuelles System, Bereichsstruktur und UX-Feinschliff
- AP19: Produktive Bereichsübersichten und kontrollierter Abrechnungskontext
- **AP20: Zentrales Prüf-, Plausibilitäts- und Freigabesystem**

## Offen ab AP21

- fachlich zu definierende nächste Arbeitspakete,
- produktive Zählerverwaltung nur nach gesonderter fachlicher Freigabe,
- optional erweiterte Vergleichsmodelle erst bei sicherer, zeitlich versionierter Datenbasis,
- Mehrprojekt-/Mehrgebäudefähigkeit als eigenständige Architekturentscheidung,
- native Geräte-, Narrow-Viewport- und Druckerabnahmen in den Zielumgebungen,
- nach Abschluss aller Arbeitspakete: lokale vollständige Codex-/Playwright-/Chromium-End-to-End- und Regressionprüfung.

Der Zählerbereich bleibt bis zu einem ausdrücklich freigegebenen Arbeitspaket DUMMY.

## V99.4.29 – AP22A UI-Bibliothek
AP22A führt den zentralen Namensraum `nk-ui-*`, kanonische `--nk-ui-*`-Design-Tokens, eine JavaScript-Metadaten-Schnittstelle sowie Katalog und Migrationsmatrix ein. Bestehende Fachseiten und Altvarianten bleiben unverändert; die kontrollierte Migration folgt in separaten AP22-Paketen.

## V99.4.30 – AP22B UI-Grundkomponenten

AP22B migriert Buttons, Formularfelder, Karten, Klappboxen, Status und Hinweise kontrolliert auf die zentrale UI-Bibliothek.

## V99.4.31 – AP22C Tabellen und Listen

AP22C migriert produktive Anwendungstabellen, Tabellencontainer, strukturierte Listen und unmittelbar tabellenbezogene Werkzeugleisten. Brief-, Druck- und PDF-Dokumenttabellen bleiben unverändert. Nächstes Paket ist AP22D – Dialoge und Leerzustände.


## V99.4.32 – AP22D Dialoge und Leerzustände

AP22D migriert fünf fachlich geeignete Dialoge auf das zentrale Dialogsystem und stellt sieben standardisierte Inhaltszustände bereit. Zwei produktive Filter-Leerzustände sind angebunden; Dokument- und Druckbereiche bleiben geschützt. Nächstes Paket ist AP22E – Seitenschale, Layout und Komponenten-Sonderformen.
