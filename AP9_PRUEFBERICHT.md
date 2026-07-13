# AP9 – Prüfbericht

**Version:** NK-Pro V99.4.10  
**Prüfdatum:** 13. Juli 2026

## Ausgangsprüfung

- Ausgangsversion V99.4.9 und Versionsname verifiziert.
- `app.js`: 539.972 Byte, 9.026 Zeilen, 655 Top-Level-Funktionsdeklarationen.
- Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandards 1 und Snapshotstandard 2 verifiziert.
- Ausgangs-ZIP SHA-256: `487f4b0551786f5619261b03dad6c41c038991a19ac6f60d4c2536cb4a6e502d`.

## Architekturprüfung

Bestanden:

- drei neue eingefrorene Modulschnittstellen.
- keine DOM-, HTML-, Dialog-, Navigations- oder Browser-Speicherzugriffe in den Anwendungsmodulen.
- 32 physisch entfernte Implementierungen.
- 28 entfernte Übergangsweiterleitungen.
- direkte Bindung von Anwendungsschicht und produktiven Aufrufern.
- keine duplizierte AP9-Implementierung in `app.js`.
- atomarer Einzelcommit und vollständiger Rollback.
- statische Ladefolge und PWA-App-Shell.

## Automatisierte Tests

| Prüfstufe | Ergebnis |
|---|---|
| JavaScript-Syntaxprüfung | bestanden; 32 JavaScript-Dateien |
| Referenzfixtures | bestanden; 6/6 |
| Zähler-Domänentest | bestanden |
| AP6-Modularisierung | bestanden |
| AP7-UI-Integration | bestanden; 13 Controller, 99 Aktionen |
| AP8-Anwendungsschicht | bestanden |
| AP9-Kernorchestrierung | bestanden |
| Playwright Browserregression | bestanden; 41/41 |
| Referenzfälle im Browser | bestanden; 6/6 |
| Migration/Restore/Rollback | bestanden; 6/6 |
| Objektstandard/Snapshot | bestanden; 9/9 |
| Persistenz/Backup | bestanden; 5/5 |
| Dokument/Export | bestanden; 2/2 |
| UI-Controller/Ereignisse | bestanden; 2/2 |
| Modulladegrenzen | bestanden; 1/1 |
| Service Worker/PWA | bestanden; 1/1 |

Die Playwright-Browserinstallation über das Netz war wegen DNS-Auflösung zu `cdn.playwright.dev` (`EAI_AGAIN`) nicht möglich. Die Browserprüfung wurde deshalb nicht übersprungen, sondern vollständig mit dem vorhandenen System-Chromium 144 unter `/usr/bin/chromium` ausgeführt.

## Regressionsergebnis

- sechs Referenzabrechnungen unverändert.
- Kostenverteilung, Vorauszahlungen, Salden und Rundungen unverändert.
- Snapshot-Integrität und historische Isolation unverändert.
- Stromzähler-Dummy bleibt gespeichert und vollständig ausgeschlossen.
- Dokument- und Exportaktionen verändern den Arbeitszustand nicht.
- Import, Migration, Vor-Migrationssicherung, Restore und Rollback unverändert.
- PWA-App-Shell enthält alle drei neuen Module.

## Abschlussmetriken

| Kennzahl | V99.4.9 | V99.4.10 | Änderung |
|---|---:|---:|---:|
| Größe `js/app.js` | 539.972 Byte | 510.210 Byte | -29.762 Byte |
| Zeilen `js/app.js` | 9.026 | 8.287 | -739 |
| Top-Level-Funktionsdeklarationen | 655 | 596 | -59 netto |
| Top-Level-Bindungen | 68 | 67 | -1 |
| direkte `state`-Pfadreferenzen | 640 | 503 | -137 |
| direkte Property-Schreibstellen | 233 | 182 | -51 |
| Root-Ersetzungen `state = …` | 13 | 13 | 0 |
| gesamte direkte Schreibstellen | 246 | 195 | -51 |

## Bekannte Grenzen

- Allgemeine Archiv- und Jahreswechselorchestrierung ist noch nicht vollständig extrahiert.
- Qualitäts-, Diagnose-, umfangreiche Renderer- und Dokument-UI-Abläufe verbleiben in `app.js`.
- 112 AP6-Kompatibilitätswrapper bleiben wegen konkreter klassischer globaler Abhängigkeiten bestehen.
- AP11-Navigationsdesign wurde nicht berührt.
