# AP14 – Navigationsbereinigung und visuelles UI-System

## Ausgangslage

Technische Grundlage ist ausschließlich der geprüfte AP13-Abschlussstand V99.4.17. Die bestehende Verbrauchserfassung war vollständig an das Seitenziel `wasser` gebunden. Das AP13-Dokumentmodell, Datenschema 5 und die fachlichen Zähler-/Abrechnungsdienste wurden nicht verändert.

## Umgesetzte Navigationszuordnung

| Navigation | Seitenziel | Funktion |
|---|---|---|
| Projekt vorbereiten → Zähler | `wasser` | statischer Zählerinventar-DUMMY ohne Speicherung oder Fachverarbeitung |
| Nebenkosten abrechnen → Manuelle & externe Werte | `manuellewerte` | bestehende manuelle/externe Eingaben |
| Nebenkosten abrechnen → Verbräuche erfassen | `verbraeuche` | vollständige bisherige Verbrauchserfassung |
| Nebenkosten abrechnen → Verteilung | `umlage` | unveränderte Umlageberechnung |

`verbraeuche` steht unmittelbar nach `manuellewerte`. Die produktiven DOM-Bereiche, Renderer und Datenzugriffe der Verbrauchserfassung wurden nur dem neuen Seitenziel zugeordnet. Es gibt keine Kopie und keine zweite Speicherung.

## Zählerinventar-DUMMY

Die Seite `wasser` enthält fünf statische Übersichtskacheln für Wasserzähler, Wärmemengenzähler, Heizkostenverteiler, Gaszähler und Stromzähler sowie eine statische Inventartabelle. Der DUMMY-Status steht direkt an der Seitenüberschrift und wird im Informationstext sowie in der Tabellenkennzeichnung wiederholt. Die Seite besitzt keine Eingabefelder, keine Speichern-Aktion und keinen fachlichen Zustandszugriff.

## Visuelles UI-System

Die normale App nutzt `"Segoe UI", Arial, sans-serif`. Zentrale CSS-Tokens definieren dunkles Navigationsblau, hellen Arbeitsbereich, blaue Aktion/Fokusfarbe sowie ruhige Flächen- und Rahmenfarben. Vereinheitlicht wurden Buttons, Links, Fokus, Eingaben, Tabs im Bestand, Karten, Tabellen, Filterflächen und deaktivierte Zustände. Semantische Erfolgs-, Warn- und Fehlerfarben bleiben eigenständig.

Briefvorschau, Druckfenster und PDF bleiben vom App-System getrennt. Die bestehenden Arial-Regeln im Hauptstylesheet und im isolierten AP13-Dokumentstylesheet wurden nicht geändert.

## Kopfbereich und Startseite

Der vorhandene Kopfbereich wurde weiterverwendet. Rechts stehen Hilfe und Menü mit lokalen SVG-Icons und Text. Die Funktionen öffnen kleine Aktionsfelder, keine neue Hauptbereich-Tab-Leiste. Die beiden Arbeitsweg-Kacheln der Startseite enthalten exakt die SVGs der korrespondierenden Navigationsgruppen einschließlich Motiv, Strichstärke und Linienattributen.

## Technische Abgrenzung

Nicht geändert wurden Datenschema, Persistenz, Berechnungen, Zählerstandards, Dokumentrenderer, Drucklogik, PDF-Ausgabe, Service-Worker-Ressourcenliste und bestehende Modulgrenzen. Es wurden keine Bibliotheken, externen Schriften oder Buildwerkzeuge ergänzt.
