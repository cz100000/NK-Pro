# NK-Pro V99.4.38 – AP22F3B

## Installation und lokale Prüfung

1. Das ZIP in einen neuen, leeren Ordner entpacken. Nicht über eine ältere NK-Pro-Version kopieren.
2. `index.html` im Browser öffnen. Für vollständige PWA-/Cacheprüfung besser einen lokalen HTTP-Server verwenden, beispielsweise `node tools/static-server.cjs` und anschließend `http://127.0.0.1:4173` öffnen.
3. In der Navigation `Objekt vorbereiten → Objektdaten` öffnen.
4. Prüfen, dass keine Aktion `Speichern` und keine Eingabefelder vorhanden sind.
5. Objektidentität, technischen Status und die vier Änderungswege kontrollieren.
6. Optional nach `npm install` beziehungsweise mit vorhandenen Abhängigkeiten ausführen: `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ap22f3b` und `npm run release:check`. Unter Windows kann der Browserpfad entfallen, wenn Playwright Chromium installiert hat.

## Freigabeschritte

- Die vier Bilder unter `AP22F3B_Screenshots/` mit der Produktdarstellung vergleichen.
- `AP22F3B_TESTBERICHT.md`, `AP22F3B_SCHUTZ_HASH_PRUEFBERICHT.md` und `AP22F3B_ABNAHMEKATALOG.md` prüfen.
- SHA-256 des heruntergeladenen ZIPs mit der separat gelieferten `.sha256`-Datei vergleichen.
- Bei erfolgreicher Sichtprüfung das ZIP unverändert als alleinige technische Ausgangsbasis für das nächste Arbeitspaket verwenden.

## Wichtig

`node_modules`, Playwright-Ergebnisordner und Laufzeitlogs sind nicht Bestandteil des Release-ZIPs. Bestehende lokale NK-Pro-Daten werden durch das Entpacken nicht automatisch übernommen; Datenübernahme erfolgt nur über die vorhandenen NK-Pro-Sicherungs-/Importwege.
