# AP18 – Dateiänderungen

## Produktivcode

- `index.html`: NK-PRO-Marke, Favicon-/iOS-Verweise, aufgewerteter Start-Eintrag und in drei Gruppen strukturierte Briefwerkzeugleiste.
- `assets/app.css`: zentrale Steuerungsvariablen, acht Aktionsvarianten, Fokus-/Hoverzustände, Navigation, Kontextleiste, Seitenköpfe, Briefviewport, Dialog-/Tabellen-/Formular- und Responsive-Regeln.
- `js/ui-documents.js`: sitzungsbezogener Zoomzustand, 40–200-Prozent-Grenzen, Seite/Breite/Benutzerzoom, Resize-Logik, statische Schwarzweißsynchronisierung und Clipboard-CSS-Klasse.
- `js/ui-bindings.js`: fünf zusätzliche deklarative Briefvorschauaktionen.
- `manifest.webmanifest`, `service-worker.js`, `js/app-runtime-config.js`, `nk-pro-project.json`, `package.json`, `package-lock.json`: V99.4.21-, AP18-, Icon- und Cachemetadaten.

## Assets

- neun neue lokale Marken-/Iconvarianten ergänzt,
- drei vorhandene PWA-/iOS-Icons kontrolliert durch das neue Motiv ersetzt,
- keine Altdatei gelöscht, weil keine weitere Assetkopie durch Referenzsuche und Tests eindeutig als ungenutzt bestätigt werden konnte.

## Bereinigung

- 24 CSS-Regeln oder Blöcke entfernt beziehungsweise zusammengeführt, darunter acht leere Media Queries,
- zwei Inline-Darstellungszuweisungen durch `.clipboard-fallback-input` ersetzt,
- vier UI-JavaScript-Strukturen für Briefansicht und Interaktion zentralisiert,
- fünf AP18-Responsive-Breakpoints konsolidiert.

## Tests und Dokumentation

- neue AP18-Struktur- und Browsertests,
- bestehende AP7/AP12-Aktionszählung auf 104 deklarative Aktionen aktualisiert,
- AP13-Schwarzweiß- und Sticky-Regressionsprüfung an die statische Werkzeugleiste angepasst,
- Release-, PWA-, Projektstands-, UX- und Testdokumentation auf V99.4.21 fortgeschrieben.
