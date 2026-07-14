# Testanleitung – NK-Pro V99.4.22

## Automatisierte Prüfungen

```text
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:contents
npm run test:ap19:harness
npm run test:release
```

`test:architecture` umfasst die statischen und fachlichen Regressionen AP6 bis AP19. Der AP19-Chromium-Harness prüft fünf reale Browserabläufe mit 42 Einzelprüfungen ohne Netzwerkserver.

In einer Umgebung ohne Loopback-Sperre zusätzlich:

```text
npm run test:browser
```

## Manuelle Kernabnahme

1. Neu laden: Kontextleiste meldet „Keine Abrechnung geöffnet“.
2. Abrechnungs-Unterpunkte sind sichtbar, aber deaktiviert.
3. Über die Übersicht aktuelle Abrechnung mit Bearbeiten öffnen.
4. Schließen und anschließend mit Ansehen öffnen.
5. Schreibschutzkennzeichnung, ausgeblendete Aktionen und Strg/Cmd+S prüfen.
6. Archiv ansehen, schließen und „Zur Korrektur öffnen“ mit Bestätigung prüfen.
7. Dirty-State erzeugen und Schließen abbrechen/bestätigen.
8. Dashboardwerte, Direkteinstiege, 640-px-Darstellung und Tastaturfokus prüfen.
9. Briefvorschau, Schwarzweiß, Druck und PDF gegen AP13 prüfen.
10. Offline-Start nach einmaligem Online-Laden prüfen.

## Umgebungsgrenze

Die verwendete Prüfumbgebung blockiert die serverbasierte Navigation zu lokalen Loopback-Adressen mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Der serverlose Chromium-Harness ist bestanden. Die statischen AP13-, PWA- und Releaseprüfungen bleiben vollständig aktiv.
