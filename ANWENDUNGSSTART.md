# NK-Pro – Anwendungsstart V99.4.18

Die Anwendung startet weiterhin deterministisch aus `index.html`. Alle produktiven Skripte werden mit `defer` in dokumentierter Reihenfolge geladen; `js/app.js` bleibt der schlanke Orchestrierungseinstieg und `js/service-worker-register.js` registriert abschließend die PWA.

AP15 fügt keinen zweiten Startpfad und keine externe Produktionsabhängigkeit hinzu. Der initiale Seitenzustand ist die Arbeitsweiche. Import, Restore und Rollback kehren nach erfolgreichem Abschluss ebenfalls in einen bereinigten Startzustand zurück.

Für eine reproduzierbare lokale Prüfung:

```bash
npm ci
npx playwright install chromium
npm run release:check
```

Die Prüfung ist aus einer frisch entpackten Arbeits-ZIP ohne mitgeliefertes `node_modules` ausführbar.
