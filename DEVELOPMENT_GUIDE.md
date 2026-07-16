# NK-Pro – Entwicklungsleitfaden V99.4.18

## Grundregeln

- Vor Änderungen ausschließlich die vollständige, bereinigte ZIP des unmittelbar vorherigen Arbeitspakets verwenden.
- HTML, CSS und JavaScript im vorhandenen Stil fortführen; keine Frameworks oder Buildkette ergänzen.
- Fachzustand nur über die vorhandenen Module und Anwendungsaktionen verändern.
- Renderer bleiben seiteneffektfrei.
- Datenverträge, Migrationen, Restore, Archiv und Offlinebetrieb bei jeder relevanten Änderung regressionsprüfen.
- Brief-/Druckdarstellung nicht durch globale UI-Regeln beeinflussen.

## Lokale Prüfung

```bash
npm ci
npx playwright install chromium
npm run release:check
```

Vor der ZIP-Erstellung müssen `node_modules`, `test-results`, `playwright-report`, Browserprofile, temporäre Dateien und generierte Kontrollausgaben entfernt werden. Anschließend `SHA256SUMS.txt` neu erzeugen und die Releasekonsistenz erneut prüfen.

## Release-Inhaltsprüfung

```bash
node tools/check-release-contents.cjs --ignore-node-modules --strict
```

Die Prüfung meldet unerwünschte Artefakte, löscht jedoch nichts automatisch.

## V99.4.29 – AP22A UI-Bibliothek
AP22A führt den zentralen Namensraum `nk-ui-*`, kanonische `--nk-ui-*`-Design-Tokens, eine JavaScript-Metadaten-Schnittstelle sowie Katalog und Migrationsmatrix ein. Bestehende Fachseiten und Altvarianten bleiben unverändert; die kontrollierte Migration folgt in separaten AP22-Paketen.
