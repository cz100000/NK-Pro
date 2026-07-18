# AP22F9B – Positivlistenabgleich

## Ergebnis

**Bestanden.** Die produktive Seitenänderung beschränkt sich auf die freigegebenen Dateien und Teilbereiche.

| Planungseintrag | Umsetzung | Status |
|---|---|---|
| `assets/app.css`: nur Gesamtkosten-Selektoren | Neuer, angehängter `#einstellungen`-Block; Ausgangspräfix hashgleich | bestanden |
| `js/ui-costs.js`: Renderer/lokaler UI-Zustand | Kacheln, Suche, Tabellenrenderer und lokale Periodenformatierung; Folgebereich hashgleich | bestanden |
| `index.html`: nur `section#einstellungen` und zwei Dialoge | Präfix und Suffix außerhalb des Seitenabschnitts hashgleich | bestanden |
| `package.json`: AP22F9B-Tests/Releasekette | AP22F9B-Skripte ergänzt; zusätzlich zwingende Paketversion 99.4.44 | bestanden mit dokumentierter Releasefortschreibung |
| `js/ui-bindings.js`: nur bei Suchbindung | Exakt zwei lokale Suchbindungen | bestanden |
| neue Tests, Dokumente, Screenshots, Ergebnisse | ausschließlich AP22F9B-bezogene neue Dateien | bestanden |

## Zwingende Release-Metadatenfortschreibung

Die Benutzerfreigabe verlangt ausdrücklich Version `99.4.44` und eine aktualisierte zentrale Versionsanzeige. Daher mussten zusätzlich die bestehenden zentralen Release-, PWA- und Cachemetadaten in folgenden Dateien fortgeschrieben werden:

`js/app-runtime-config.js`, `js/service-worker-register.js`, `service-worker.js`, `manifest.webmanifest`, `nk-pro-project.json`, `package-lock.json` sowie die Versionsfelder in `package.json`.

Diese Änderungen enthalten keine Fachlogik, kein Datenmodell und keine UI-Änderung außerhalb der Versions-/Buildanzeige. Ohne sie wäre das verlangte Release inkonsistent und könnte veraltete PWA-Assets weiterverwenden.

## Nicht genutzte optionale Erweiterungen

Nicht umgesetzt wurden neue Gruppenfilter, Statusfilter, Vorauszahlungsfilter, Sortierfunktionen, Kostenstatus, Prüfkennzahlen oder Symbolaktionen. Die verbindliche Suche bleibt lokaler, nicht persistierter UI-Zustand.
