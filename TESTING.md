# NK-Pro – Teststrategie V99.4.18

## Reproduzierbarer Freigabepfad

```bash
npm ci
npx playwright install chromium
npm run release:check
```

Die Browserprojekte laufen bewusst seriell (`workers: 1`, `fullyParallel: false`). Dadurch bleiben Migration-, Restore-, Service-Worker- und Gesamtabläufe auch in ressourcenbegrenzten Umgebungen reproduzierbar.

## Prüfebenen

- JavaScript-Syntax und statische Vertragsprüfungen
- Fixture-, Daten-, Migrations-, Persistenz-, Archiv-, Sicherungs- und Restoreprüfungen
- Fachtests der Verbrauchs- und Zählerdomäne
- Architektur- und Zustandszugriffsprüfungen
- AP13-Brief-/Druckregression
- AP14-Navigation, Typografie und Responsivität
- AP15-Gesamtintegration und transiente Zustandsbereinigung
- Service-Worker-, Cache- und Offlineprüfungen
- Releasekonsistenz, SHA-256-Dateiinventar und ZIP-Inhaltsprüfung

## AP15-spezifische Tests

`tests/ap15-integration-release.test.cjs` prüft Version, Härtungsmarker, Dokumentation, Inhaltskontrolle und seriellen Testpfad. `tests/ap15-integration-release.spec.js` prüft den Bedienfluss, Kontextwechsel, sämtliche produktiven Abrechnungsschritte, Jahreswechsel, Zähler-DUMMY und produktive Verbrauchserfassung. `tests/service-worker.spec.js` prüft Cachegrenzen, Installation, Aktivierung, Online- und Offlineverhalten.

Maschinenlesbare Ergebnisse stehen in `AP15_TEST_RESULTS.json`; Einzelheiten in `AP15_PRUEFBERICHT.md`.

Alternativ kann ein bereits installierter Chromium-Browser ohne lokalen Pfad im Projekt über die Laufzeitvariable eingebunden werden:

```bash
CHROMIUM_EXECUTABLE_PATH=<Pfad-zum-Chromium> npm run release:check
```

Der optionale reale Loopback-PWA-Test wird mit `NKPRO_RUN_REAL_PWA_TEST=1` aktiviert. Die reguläre Freigabe prüft die Service-Worker-Ereignisse, Cachegrenzen und Offlineantworten deterministisch ohne diese Umgebungsabhängigkeit.
