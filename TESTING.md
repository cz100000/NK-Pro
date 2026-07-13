<!-- AP9-CURRENT -->
# Teststand V99.4.10

Die Releaseprüfung umfasst Syntax, sechs Referenzfixtures, Zählerdomäne, AP6–AP9-Architekturtests und 41 Playwright-Browserfälle. Browserfälle decken Start, UI, Module, Migration/Restore/Rollback, Objektstandard/Snapshot, Persistenz/Backup, sechs Referenzabrechnungen, Dokument/Export und Service Worker ab. System-Chromium 144 wurde erfolgreich verwendet.

# NK-Pro – Testkonzept

**Aktueller Stand:** V99.4.9, Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandard 1, Snapshot 2, Architektur 2

## Prüfstufen

1. **Syntax:** alle produktiven JavaScript-Dateien und der Service Worker.
2. **Referenzfälle:** sechs kanonische Datensätze mit unveränderten Ergebnissen.
3. **Zählerdomäne:** Migration, stabile IDs, Messwerte, Perioden, Korrektur, Wechsel, Zuordnung, Dummy-Ausschluss und Snapshotprojektion.
4. **AP6-Architektur:** Modulschnittstellen, DOM-freie Berechnung, DOM-freie Dokumentdaten, reine Wrapper, Speichergrenzen, Ladefolge, Bootstrap und Registry.
5. **AP7-UI-Architektur:** 130 entfernte Inline-Handler, 13 Controller, 99 eindeutige Aktionen, zentrale Ereignisdelegation, Zustandsgrenze und entfernte Navigationsglobals.
6. **Release-Konsistenz:** Versionen, Standards, Module, PWA-App-Shell, Dokumente und Datenvertrag.
7. **Browserregression:** 41 Fälle für Start, Navigation, Berechnung, Persistenz, Migration, Restore, Snapshot, Archiv, Dokumente, Exporte und Service Worker.
7. **Frische Entpackung:** Wiederholung aller Prüfungen aus der finalen ZIP.

## Befehle

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

Ist das Playwright-Browserpaket nicht lokal installiert, wird ein vorhandenes Chromium über `CHROMIUM_EXECUTABLE_PATH` verwendet.

## AP6-Pflichtfälle

- `app.js` liegt unter 9.500 Zeilen,
- alle neuen Module exportieren feste Schnittstellen,
- Berechnungsmodul enthält keinen DOM- oder Speicherzugriff,
- Dokumentdatenmodul enthält keinen DOM- oder Speicherzugriff,
- globale Kompatibilitätswrapper enthalten keine Parallelfachlogik,
- direkte Speicherzugriffe liegen nur in Persistenz und UI-Präferenzen,
- Startschritte laufen in dokumentierter Reihenfolge,
- Referenzabrechnungen bleiben unverändert,
- Zähler-Dummy bleibt ausgeschlossen,
- Snapshot, Backup, Restore und Rollback bleiben kompatibel,
- App-Shell enthält alle neuen Dateien,
- Brief- und CSV-Erzeugung stimmen über Modul- und Kompatibilitätsaufruf überein und bleiben zustandsneutral.

Die konkreten Freigabeergebnisse stehen in `AP6_PRUEFBERICHT.md`.
