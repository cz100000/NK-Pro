# AP22F6B Korrektur 1 – Testbericht

## Gesamturteil

**BESTANDEN.** Alle drei Korrekturpunkte sowie die maßgeblichen Schutz- und Regressionstests bestehen.

## Erfolgreiche Prüfungen

| Prüfung | Ergebnis | Umfang |
|---|---|---|
| AP22F6B Korrektur 1 statisch | PASS | Kein Zeitraum-`details`, separate Aktion/Dialog, bestehende Zeitraumhandler, leere Meldungszeile, Archivnavigation, V99.4.41/Datenschema 5 |
| AP22F6B Gesamtstatik | PASS | Übersicht, Symbolaktionen, Statuswege und Korrekturmerkmale |
| Schutzbereiche | PASS | 392 vollständig geschützte Dateien und 24 Bereichshashes |
| AP22F6B Zielseiten-Browsertest | PASS | Desktop, 620 px, 390 px, Zoomäquivalent, Suche/Filter, Aktionen, Schreibschutz, Leer-/Fehlerzustände |
| Korrektur-1-Browsertest | PASS | kompakter Seitenbeginn, Zeitraum bearbeiten/anzeigen, bestehender Schreibweg, vollständige Archivnavigation, angrenzende Zähler- und Mietverhältnisseiten |
| Navigation | PASS | 3/3 Playwright-Prüfungen der zentralen Navigation |
| Dokument/CSV, Migration und Persistenz | PASS | 13/13 Playwright-Prüfungen |
| Syntax | PASS | 55 JavaScript-Einheiten |
| Fixtures | PASS | 6 Referenzfälle semantisch unverändert |
| Zählerregression | PASS | Domain-, Start- und Berechnungsregression |
| Architektur | PASS | AP6, AP7, AP8, AP9, AP13, AP21 und AP21B2 |
| AP21C | PASS | Struktur und Kompatibilität |
| Release-Inhaltsprüfung | PASS | strenge Inhaltsprüfung ohne `node_modules` |

## Korrekturspezifische Abnahme

- Leerer Meldungscontainer: `display:none`, Höhe 0, normaler Abstand zur ersten Karte.
- Echte Status-/Fehlermeldungen bleiben sichtbar und im Dokumentfluss.
- Keine Klappbox `1. Abrechnungszeitraum` mehr auf der Übersicht.
- Zeitraumaktion nur bei geöffnetem Kontext sichtbar.
- Dialogtitel abhängig vom bestehenden Kontext: bearbeiten oder anzeigen.
- Im Ansichtsmodus sind Beginn und Ende deaktiviert; es gibt keine zusätzliche lokale Modusplakette.
- Änderungen verwenden weiterhin `billing.setPeriod`; Jahresabgleich verwendet weiterhin `billing.syncPeriodYear`.
- Der Navigationsabschnitt `Objekt vorbereiten` bleibt bei archivierter Ansicht vollständig sichtbar.

## Technischer Testhinweis

Die beiden eigenständigen Browser-Harnesses wurden jeweils erfolgreich beendet. Bei einer kombinierten Ausführung können in der Containerumgebung verwaiste Chromium-/Playwright-Prozesse den Shell-Abschluss verzögern, obwohl beide Harnesses bereits `PASS` gemeldet haben. Die Testaussagen selbst sind vollständig bestanden; dies betrifft ausschließlich die lokale Testprozessbereinigung, nicht die Anwendung.

## Restpunkte

Keine bekannten funktionalen Restpunkte.
