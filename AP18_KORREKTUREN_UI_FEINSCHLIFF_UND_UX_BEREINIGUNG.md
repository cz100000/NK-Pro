# AP18 – Korrekturen, UI-Feinschliff und UX-Bereinigung

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| Anwendung | NK-Pro V99.4.21 |
| Technische Basis | NK-Pro V99.4.20 – AP17 |
| Datenschema | 5, unverändert |
| Datenebenenvertrag | 1, unverändert |
| Dokumentlayout | AP13 / Version 4, unverändert |
| Frameworks/Produktionsabhängigkeiten | keine neuen |
| PWA-Cache | `nk-pro-v99-4-21-ap18` |

## Marken- und PWA-System

Das freigegebene Mehrfamilienhaus-/Dokumentmotiv wurde als lokale NK-PRO-Marke aufbereitet. Die Sidebar verwendet eine für kleine Größen optimierte 96-Pixel-Marke. Favicon, iOS-Icon, reguläre PWA-Icons und getrennte maskierbare Varianten werden lokal ausgeliefert und durch Manifest sowie Service Worker referenziert.

Enthaltene Varianten:

- vollständiges Logo mit Schriftzug,
- quadratisches Master-Icon,
- Navigationsmarken 64, 96 und 128 Pixel,
- Favicons 16 und 32 Pixel,
- App-Icons 180, 192 und 512 Pixel,
- maskierbare App-Icons 192 und 512 Pixel mit Sicherheitsabstand.

## Navigation und globaler Start

„Start“ ist oberhalb der Fachgruppen dauerhaft sichtbar, besitzt ein lokales Home-Linienicon, einen leicht abgesetzten Hintergrund sowie eindeutige Normal-, Hover-, Fokus- und Aktivzustände. Die vier Fachgruppen bleiben unabhängig klappbar; Chevron und Navigation lösen getrennte Aktionen aus. Direkteinstiege öffnen weiterhin automatisch den zugehörigen Navigationspfad.

## Appweites Aktionssystem

AP18 führt zentrale Designvariablen und acht Varianten ein:

1. Primäraktion,
2. Sekundäraktion,
3. dezente Aktion,
4. Gefahrenaktion,
5. Warnaktion,
6. Iconbutton,
7. kompakte Aktion,
8. Umschalter einschließlich deaktiviertem Zustand.

Gemeinsam vereinheitlicht sind Steuerungshöhe, Typografie, Innenabstände, Rundungen, Rahmen, Iconabstände, Fokusmarkierung, gedrückter Zustand und Übergangszeit. Hoverzustände verwenden keine Translation und verursachen keine Layoutsprünge. Navigation, Karten, Tabellenzeilen und Klappboxen behalten ihre eigene Semantik.

## Briefvorschau

Die Briefvorschau startet im Modus **Ganze Seite**. Die erste DIN-A4-Seite wird anhand verfügbarer Breite und Höhe vollständig eingepasst. Weitere Seiten bleiben scrollbar erreichbar. Die Bildschirmdarstellung besitzt folgende Modi:

- Verkleinern und Vergrößern in 10-Prozent-Schritten,
- 40 bis 200 Prozent,
- Ganze Seite,
- Seitenbreite,
- benutzerdefinierter Zoom mit Sitzungsspeicherung.

Im Modus „Ganze Seite“ und „Seitenbreite“ wird bei Größenänderungen automatisch neu gerechnet. Manuelle Zoomänderungen wechseln in den benutzerdefinierten Modus. Druckgröße, DIN-A4-Abmessungen, Seitenumbrüche, Schriftgrößen, Tabellen, PDF- und Schwarzweißausgabe bleiben unverändert.

Die Werkzeugleiste ist in **Ansicht**, **Darstellung** und **Ausgabe** gegliedert. Gruppen brechen bei schmalen Fenstern kontrolliert als Einheit um. Die Vorschau bleibt bei breiten Ansichten sticky sichtbar, während die lange Einstellungsspalte normal mit der Seite scrollt.

## Kontextleiste, Seitenköpfe und Responsive-Verhalten

Kontextleiste und vergleichbare Seitenköpfe wurden verdichtet. Lange Objektbezeichnungen bleiben lesbar, Aktionspositionen sind stabil und schmale Ansichten verwenden kontrollierte Rasterwechsel. Tabellencontainer, Dialoge, Formularfelder, Statusanzeigen, Klappboxen und Werkzeugleisten erhalten konsistente Maximalbreiten, Viewportgrenzen und Fokuszustände.

Geprüfte Breiten-/Höhengruppen:

- große Desktopansicht,
- Laptopansicht,
- 1280, 1100, 900 und 680 Pixel,
- geringe Fensterhöhe bis 720 Pixel,
- schmale Ansicht ohne vollständige mobile Neuentwicklung.

## Kontrollierte Bereinigung

- 24 veraltete, doppelte oder leere CSS-Regeln beziehungsweise Media-Query-Blöcke entfernt,
- 8 leere Media Queries entfernt,
- veraltete globale Hover-Translation entfernt,
- nicht mehr verwendete Regeln des dynamischen Schwarzweißschalters entfernt,
- zwei Inline-Darstellungszuweisungen des Clipboard-Fallbacks durch eine CSS-Klasse ersetzt,
- Briefzoom, Resize-Beobachtung, Werkzeugaktionen und Schwarzweißsynchronisierung zentralisiert,
- keine fachliche Funktion und kein Datenfeld entfernt.

Im Ausgangsbestand waren keine eindeutig unreferenzierten Alt-Assets vorhanden, die gefahrlos gelöscht werden konnten. Deshalb wurden **0 Assets gelöscht**. Drei bestehende App-Icondateien wurden kontrolliert ersetzt und neun zusätzliche Marken-/Iconvarianten ergänzt.

## Fachliche Abgrenzung

Unverändert bleiben insbesondere:

- Arbeitsweiche und beide AP17-Bereichsübersichten,
- sämtliche Fach-, Abrechnungs-, Verbrauchs-, Speicher- und Datenregeln,
- Zählerbereich als reiner DUMMY,
- AP13-Briefinhalt, Drucklayout, PDF, Seitenumbrüche und Schwarzweißlogik,
- Datenschema 5 und Datenebenenvertrag 1.

Produktive Dashboardlogik, Fortschrittsberechnung, Empfehlungen, neue Fachprüfungen und produktive Zählerverwaltung sind nicht Bestandteil von AP18.

## Testanleitung

```bash
npm ci
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run release:check
```

Alternativ kann Playwright seinen eigenen Chromium-Browser verwenden. Die Projekte laufen seriell. Details und die umgebungsspezifische Offline-Einschränkung stehen in `AP18_PRUEFBERICHT.md` und `AP18_TEST_RESULTS.json`.
