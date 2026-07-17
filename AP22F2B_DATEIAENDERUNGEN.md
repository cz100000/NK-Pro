# AP22F2B – Dateiänderungen

## Produkt und Referenz

| Datei | Änderung |
|---|---|
| `js/ui-page-controller.js` | Reines Objektübersichtsmodell und freigegebener Renderer für Identität, Gesamtstatus, nächste Aktion und vier Karten. |
| `assets/app.css` | Ausschließlich begrenzte Objektübersichts-, Raster-, Status- und Responsive-Regeln mit zentralen Tokens. |
| `ui-reference/index.html`, `ui-reference/reference.css` | Verbindliche AP22F2B-Zielansicht ergänzt. |
| `index.html`, Laufzeit-, Manifest-, Projekt- und Service-Worker-Dateien | Ausschließlich V99.4.37/AP22F2B-, Cache-, Build- und Migrationsmetadaten aktualisiert. |

## Tests und Integration

Drei neue separate AP22F2B-Testdateien prüfen Statik, Browserzustände und Schutzbereiche. `playwright.config.cjs` registriert nur das neue Projekt. `package.json`/`package-lock.json` enthalten V99.4.37 und separate Testskripte; Abhängigkeiten wurden nicht geändert.

## Dokumentation

Die freigegebenen Projekt-, UI-Vertrags-, Katalog-, Architektur-, Test- und Releaseunterlagen wurden ausschließlich um den AP22F2B-Stand ergänzt. `SHA256SUMS.txt` wird aus dem finalen Releaseinhalt neu erzeugt.

Es wurde keine Datei außerhalb der bestätigten Positivliste geändert; bestehende Regressionstestdateien blieben unverändert.
