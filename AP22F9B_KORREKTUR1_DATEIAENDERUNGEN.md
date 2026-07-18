# AP22F9B Korrektur 1 – Dateiänderungen

## Produktive UI-Dateien

| Datei | Änderung |
|---|---|
| `index.html` | Ausschließlich im Abschnitt `#einstellungen`: vier Textglyphen durch Linien-SVGs ersetzt. |
| `assets/app.css` | Ausschließlich AP22F9B-seitenbezogene Selektoren: neutraler Tabellenkopfstandard, SVG-Größen und Statusfarben. |
| `js/ui-costs.js` | Ausschließlich lokaler Gesamtkosten-Renderer: automatische Sortierklassen und Klickhandler der beiden Tabellen nach dem Rendern entfernen. |

## Release- und PWA-Metadaten

| Datei | Änderung |
|---|---|
| `service-worker.js` | Cache-/Build-ID auf `99.4.44-ap22f9b-k1` erhöht. |
| `js/service-worker-register.js` | Build-ID auf `99.4.44-ap22f9b-k1` erhöht. |
| `manifest.webmanifest` | Build-ID und Korrekturbezeichnung aktualisiert; sichtbare Version bleibt 99.4.44. |
| `nk-pro-project.json` | PWA-Cache- und Runtime-Build-ID sowie Korrekturbezeichnung aktualisiert. |

Die PWA-Metadatenänderung ist erforderlich, damit die korrigierten CSS- und UI-Dateien nach einer Bereitstellung über GitHub Pages zuverlässig neu geladen werden.

## Tests und Nachweise

- `tests/ap22f9b-total-costs.test.cjs`
- `tests/ap22f9b-total-costs-browser.test.cjs`
- `AP22F9B_Korrektur1_Screenshots/` mit sieben realen Browser-Screenshots
- `AP22F9B_Korrektur1_Screenshots_Kontaktbogen.jpg`
- AP22F9B-Korrektur-1-Dokumentationsdateien

## Unverändert

Alle Fach-, Berechnungs-, Speicher-, Migrations-, Backup-/Restore-, Archiv-, Qualitäts-, Brief-, Druck-, Navigations- und Kontextmodule bleiben unverändert.
