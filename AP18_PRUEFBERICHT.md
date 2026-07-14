# AP18 – Prüfbericht

## Abschlussstatus

**Änderungen umgesetzt – NK-Pro V99.4.21**

Die Ausgangsbasis wurde als NK-Pro V99.4.20 / AP17 bestätigt. Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Abrechnungssnapshot 2 und Dokumentlayout 4 blieben unverändert.

## Ergebnisübersicht

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax | bestanden, 51 Einheiten |
| Referenz-/Fixture-Daten | bestanden, 6 Fälle |
| Zählerdomäne | bestanden |
| Architektur- und statische Regression AP6–AP18 | bestanden |
| Browserregression | 87 Tests erkannt; 84 bestanden; 3 optionale Tests übersprungen; 0 fachliche/technische Fehler |
| Navigation | bestanden; Start und 18 Fachziele funktionieren |
| Tastatur und Fokus | bestanden |
| Briefvorschau und Zoom | bestanden; 40–200 %, Seite, Breite, Benutzerzoom und Resize |
| AP13 Brief/Druck/PDF/Schwarzweiß | bestanden, 8 Regressionsfälle |
| Responsive | bestanden |
| Manifest, Icons und Service Worker | bestanden |
| Reale Loopback-PWA-Ausführung | in der Hostumgebung administrativ blockiert; semantische Offlineprüfung bestanden |
| Release-Inhaltsprüfung | bestanden; `node_modules`, Testreports und Browserartefakte ausgeschlossen |
| Start aus bereinigter Kopie | bestanden durch statische Release-, App-Shell- und Browserprojektprüfungen |

Die Browsermatrix wurde wegen des externen Befehlslaufzeitlimits seriell in reproduzierbaren Projektgruppen ausgeführt. Alle 84 regulär ausführbaren Browserfälle sind bestanden. Die drei vorgesehenen Überspringungen betreffen zwei opt-in-Referenzbildtests und den optionalen realen Loopback-Offline-Test.

## AP18-Kennzahlen

| Kennzahl | Ergebnis |
|---|---:|
| inventarisierte Aktionsflächen | 230 |
| davon Button-Markup | 166 |
| weitere Schalter, Klappköpfe und Dateiflächen | 64 |
| vereinheitlichte Button-/Interaktionsvarianten | 8 |
| explizit überarbeitete Hover-/Fokus-/Aktiv-Regelgruppen | 13 |
| bereinigte oder zusammengeführte CSS-Regeln/Blöcke | 24 |
| ersetzte Inline-Stile | 2 |
| bereinigte/zentralisierte UI-JavaScript-Strukturen | 4 |
| konsolidierte AP18-Responsive-Breakpoints | 5 |
| entfernte veraltete Assets | 0 |
| kontrolliert ersetzte bestehende Icondateien | 3 |
| neu ergänzte Marken-/Iconvarianten | 9 |
| eindeutige deklarative UI-Aktionen | 104 |

Die Aktionsflächeninventur ist eine reproduzierbare Quellinventur aus `index.html` und den produktiven JavaScript-Templates. Sie umfasst Buttons, Checkbox-Schalter, Klappbox-Kopfzeilen und Dateiauswahlflächen.

## Navigation, Tastatur und Fokus

Der neue globale Start-Eintrag führt zuverlässig zur unveränderten Arbeitsweiche. Alle vier Navigationsgruppen bleiben unabhängig geöffnet oder geschlossen. Aktive Seiten, automatische Gruppenöffnung, getrennte Chevron-Bedienung, Maus-, Enter- und Fokuszustände wurden geprüft. Fokus ist nicht ausschließlich farbbasiert.

## Briefvorschau, Druck und PDF

Die erste Briefseite wird standardmäßig vollständig eingepasst. Plus/Minus, Prozentanzeige, Ganze Seite und Seitenbreite funktionieren. Bei Resize werden automatische Modi neu berechnet; benutzerdefinierter Zoom bleibt erhalten. Mehrseitige Briefe bleiben erreichbar. Die vollständigen acht AP13-Regressionsfälle zu DIN A4, Seitenlogik, Tabellen, Abschlussblock, Vorzeichen, Vorauszahlungsanpassung, Schwarzweiß und Langtext sind bestanden.

Die Druck-/PDF-Aktion verwendet weiterhin denselben vorhandenen AP13-Ausgabepfad. AP18 verändert ausschließlich die Bildschirmdarstellung der Vorschau und die Anordnung der Werkzeugflächen.

## Responsive-Prüfung

Geprüft wurden große Desktopansicht, Laptop, 1280/1100/900/680 Pixel sowie geringe Fensterhöhe. Navigation, Kontextleiste, Seitenköpfe, Werkzeuggruppen, Dialoge und Briefviewport bleiben ohne Gesamtseiten-Horizontalscrollen oder zufällig einzeln umbrechende Werkzeugbuttons bedienbar.

## PWA-, Icon- und Offlineprüfung

Manifest, reguläre und maskierbare Icons, Service-Worker-App-Shell, Cachebegrenzung, Same-Origin-Regel, Cachebereinigung und Offline-Navigationsfallback sind bestanden. Der zusätzlich erzwungene reale Chromium-Loopbacktest konnte nicht bis zur Anwendung gelangen, weil die Hostumgebung `127.0.0.1` mit `ERR_BLOCKED_BY_ADMINISTRATOR` blockierte. Das ist eine dokumentierte Einschränkung der Ausführungsumgebung; die regulären Service-Worker-Semantiktests sind grün.

## Bekannte Einschränkungen

1. Die AP17-Vorschauwerte besitzen weiterhin bewusst keine produktive Fachlogik.
2. Das Zählerinventar bleibt ausschließlich DUMMY.
3. Reale Druckergebnisse hängen vom Browser-Druckdialog und Druckertreiber ab.
4. Ein tatsächlicher PWA-Installationsdialog und Offline-Neustart auf einem Endgerät muss außerhalb der administrativ eingeschränkten Hostumgebung gegengeprüft werden.
5. Die vollständige Browsermatrix wird in dieser Umgebung wegen Befehlslaufzeitlimits projektweise statt in einem einzigen Prozess ausgeführt.

## Reproduzierbarkeit

`AP18_TEST_RESULTS.json` enthält den maschinenlesbaren Teststand. `SHA256SUMS.txt` deckt alle Release-Dateien außer sich selbst ab. Die SHA-256-Prüfsumme und Größe der finalen ZIP werden bei der Übergabe angegeben, da eine ZIP ihre eigene Prüfsumme nicht in sich selbst enthalten kann.
