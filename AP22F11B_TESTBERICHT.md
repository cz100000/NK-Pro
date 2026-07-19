# AP22F11B – Testbericht

## AP22F11B-spezifische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax, 56 Einheiten | PASS |
| Referenz-Fixtures, 6 Fälle | PASS |
| AP22F11B statische Struktur-/Sonderlogikprüfung | PASS |
| AP22F11B Browserprüfung | PASS – 14 Prüfgruppen |
| Zählerdomäne, Zählerstart und Zählerberechnung | PASS |
| AP8 Anwendungsaktionen | PASS |
| AP9 Kernorchestrierung | PASS |
| AP13 Brieflayout-Struktur | PASS |
| AP21 Regelprüfung | PASS |
| AP21B2 Navigation | PASS |

## Browserprüfung mit Echtdaten

- Gesamtbestand über den echten JSON-Importdialog importiert
- Beide Echtdaten-Differenzen offen und ohne automatische Akzeptanz dargestellt
- Mieter-, Privat- und Leerstandsfälle fachlich getrennt
- Desktop 1440/1640, 125 %, schmale Ansicht und Tabellen-Scroll geprüft
- Korrigieren führt zu Individuelle Werte und hebt den verursachenden Bereich hervor
- Akzeptanzdialog per Tastatur geöffnet, fokussiert und mit Escape geschlossen
- Akzeptanz mit Behandlung, Begründung, Zeit, Version und Signaturen persistent gespeichert
- Akzeptanz nach neuem Browserzustand und Seitenwechsel erhalten
- Änderung macht Akzeptanz ungültig; Rücksetzen reaktiviert sie nicht automatisch
- Alle Differenzen bewusst geprüft; Gesamtstatus und Kontrollgleichung schließen auf 0,00 €
- Simulierter Speicherfehler: keine Erfolgsmeldung, Rollback und sichtbarer Dialoginhalt
- Zählersynchronisierung mehrfach idempotent; keine neuen Messwertdubletten
- Gesamtexport und Reimport nach geleertem Browserzustand ohne Daten-, Archiv- oder Entscheidungsdubletten
- Nur-Ansehen-/Archivkontext blockiert Schreibaktionen

Laufzeitfehler: **0**.

## Geprüfte Ansichten

- Desktop 1440 px;
- Desktop 1640 px;
- Browserzoom 125 %;
- schmale Ansicht mit internem Tabellen-Scroll;
- Akzeptanzdialog und Tastatur/Escape;
- akzeptierter und ungültig gewordener Prüfstatus;
- Nur-Ansehen-/Archivkontext.

## Persistenz und Echtdaten

- Erfolg erst nach Commit und Readback;
- Speicherfehler mit Rollback und erhaltenem Dialoginhalt;
- Akzeptanz nach Neuladen und Seitenwechsel erhalten;
- Ursprungsänderung macht Akzeptanz ungültig;
- Rücksetzen reaktiviert nicht automatisch;
- Gesamtexport und Reimport in leeren Browserzustand ohne Daten-, Entscheidungs- oder Archivdubletten;
- Zählersynchronisierung wiederholt idempotent.

## Vorbestehende beziehungsweise versionsgebundene Abweichungen

- `ap6-modularization.test.cjs` meldet dieselben drei Persistenzdateien bereits in V99.4.60.
- Der statische AP22F10G-Korrektur-2-Test erwartet ausdrücklich V99.4.60 und ist für das Nachfolgerelease versionsbedingt nicht passfähig.

Diese Abweichungen sind keine neue AP22F11B-Regression.
