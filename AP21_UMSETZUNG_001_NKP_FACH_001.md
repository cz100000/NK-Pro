# AP21 – Umsetzungsstand 1

## Grundlage

NK-Pro V99.4.23 – AP20 Korrekturstand 3

## Umgesetzt

NKP-FACH-001 wurde nach Nutzerfreigabe vollständig korrigiert. Die Regel verwendet eine strenge ISO-Kalenderprüfung, prüft die Reihenfolge und den Abgleich des Abrechnungsjahres mit dem Endjahr. Der Direkteinstieg führt zu einem neuen Periodenbereich auf der Abrechnungsübersicht.

## Geänderte Dateien

- `js/quality-rules.js`
- `js/billing-workflow.js`
- `js/app.js`
- `js/ui-bindings.js`
- `js/billing-context.js`
- `js/ui-navigation-pages.js`
- `index.html`
- `assets/app.css`
- `tests/ap21-rule-audit.test.cjs`
- AP21-Prüfdokumentation

## Teststand

- JavaScript-Syntax: bestanden
- Referenzdaten: 6/6 bestanden
- Zählerregressionen: bestanden
- Architekturtests AP6–AP21: bestanden
- AP21-Regressionsfälle NKP-FACH-001: bestanden
- Release-Inhaltsprüfung: bestanden (216 Dateien)
- Release-Konsistenz und Prüfsummen: bestanden
- Chromium-Starttest: bestanden
- App-Browserlauf: durch Hostrichtlinie blockiert (`ERR_BLOCKED_BY_ADMINISTRATOR` für lokale, Loopback- und Datei-Navigation)

Der blockierte Browserlauf ist eine Umgebungsbeschränkung und kein fachlicher Testfehler. Ein vollständiger Playwright-Lauf bleibt für die spätere lokale Codex-/Chromium-Gesamtprüfung vorgesehen.
