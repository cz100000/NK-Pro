# Testanleitung – NK-Pro V99.4.23

## Automatisierte Prüfungen

```text
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:contents
npm run test:ap20:harness
npm run test:release
```

`test:architecture` umfasst AP6 bis AP20. Der AP20-Chromium-Harness prüft fünf reale Browserabläufe mit 48 Einzelprüfungen ohne Netzwerkserver, darunter Cockpit, Detaildialog, Systemdiagnose, Ansichtsmodus, direkte Schreibsperre, Bestätigungsfingerprint und Blockerschutz.

In einer Umgebung ohne Loopback-Sperre zusätzlich:

```text
npm run test:browser
```

## Manuelle Kernabnahme

1. Anwendung neu laden; keine Abrechnung darf automatisch geöffnet sein.
2. Abrechnung ausdrücklich mit Bearbeiten öffnen und „Abrechnung prüfen“ aufrufen.
3. Vier Statuskarten, acht Prüfbereiche, Filter, Aufklappgruppen und Regelübersicht prüfen.
4. Einen Plausibilitätsbefund bestätigen, Begründung prüfen, Bestätigung zurücknehmen.
5. Relevanten Eingangswert ändern und prüfen, dass die alte Bestätigung nicht mehr gilt.
6. Einen Blocker öffnen; Bestätigung darf nicht angeboten oder technisch akzeptiert werden.
7. „Zur Ursache“ auf mehreren Fachseiten prüfen; Ziel soll fokussiert oder hervorgehoben werden.
8. Abrechnung im Ansichtsmodus öffnen; Bestätigen, Nicht anwendbar und Zurücknehmen müssen gesperrt sein.
9. Systemdiagnose unter Datensicherung & System prüfen; technische Meldungen dürfen nicht im fachlichen Cockpit erscheinen.
10. Abschlussaussagen „Nicht abschließbar“, „Fachlich zu prüfen“ und „Abschlussbereit“ gegen die zentralen Ergebnisse prüfen.
11. Desktop, Laptop, schmale Fenster, geringe Höhe, Tablet und sehr schmale Ansicht kontrollieren.
12. Briefvorschau, Schwarzweiß, Druck und PDF gegen AP13 prüfen; Offline-Start nach einmaligem Online-Laden prüfen.

## Umgebungsgrenzen

Die Prüfumbgebung blockiert serverbasierte Loopback-Navigation mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Der serverlose Desktop-Chromium-Harness ist bestanden. Bei isolierter sehr schmaler Viewport-Ausführung beendet diese Hostumgebung den Chromium-Targetprozess. Responsive Regeln sind statisch geprüft; die Narrow-Viewport-Abnahme ist auf einem normalen Zielsystem zu wiederholen.
## AP20-Korrekturstand 1 – Zählerstartregression

```text
npm run test:metering
npm run test:ap20:meter-start-browser
```

Der Browsertest legt vor dem Start einen gespeicherten Datensatz mit rückläufigem Zählerstand in den Local Storage. Erwartet werden ein vollständiger Start ohne Fallback sowie ein zentraler Prüfpunkt `NKP-PLAU-005` mit Status „Zu prüfen“.

## AP20-Korrekturstand 3 – Asset-Aktualisierungsregression

```text
node tests/ap20-asset-refresh-regression.test.cjs
NODE_PATH=<Playwright-Installation>/node_modules node tools/check-ap20-meter-calculation-browser.cjs
```

Der Browserfall startet gezielt mit dem historisch falsch gespeicherten Wert `29774`, gibt anschließend `297,74` ein und prüft Live-Ergebnis `31,74`, Enter-Commit, Persistenz und Neustart. Zusätzlich werden Build-Parameter, Cachekennung, cachefreie Worker-Aktualisierung, einmaliger Reload und Schleifenschutz statisch geprüft.

## AP20-Korrekturstand 2 – Zählerberechnungsregression

Statische Zahlen- und Integrationsprüfung:

```bash
node tests/ap20-meter-calculation-regression.test.cjs
```

Serverloser Chromium-Test:

```bash
node tools/check-ap20-meter-calculation-browser.cjs
```

Geprüft werden Live-Verbrauch und Live-Summe vor dem Fokuswechsel, Enter-Commit, Dezimalkomma, Dezimalpunkt, Local-Storage-Speicherung und korrekte Wiederherstellung nach einem Neustart.
