# AP22F10G-B – Liste aller geänderten Dateien

## Produkt- und Testdateien

| Art | Datei | Zweck |
|---|---|---|
| Geändert | `assets/app.css` | Vollständiges responsives Seitenlayout, Kennzahlenkacheln, dynamische Karten, Tabellen, Status-, Dialog- und Hinweiszustände. |
| Geändert | `index.html` | Neuer durchgehender Seitenaufbau ohne Reiter; Steuerungshinweis, Kennzahlen, dynamische Bereiche, Historie, Prüfung und Dialoge. |
| Geändert | `js/app-runtime-config.js` | Versions- und Release-Metadaten auf V99.4.58/AP22F10G-B. |
| Geändert | `js/billing-calculation.js` | Generische Klassifikation aktiver Kostenarten; Verbrauchs-/manuelle Modelle, Zählerzuordnung, Fall- und Summenberechnung ohne K002-Sonderlogik. |
| Geändert | `js/service-worker-register.js` | Build-ID für kontrollierte Aktivierung des neuen App-Caches. |
| Geändert | `js/ui-individual-values.js` | Vollständige Neuentwicklung der Seite mit Entwurfsstabilität, Validierung, Bereichsspeicherung, Rückleseprüfung, Dialogen und Vorjahresübernahme. |
| Geändert | `js/ui-master-data.js` | Persistenz-Rückleseprüfung über Integritätsprüfsumme und Zeitstempel. |
| Geändert | `js/ui-metering.js` | Generische Zählerentwurfs-Schnittstelle für alle Verbrauchskostenarten; kanonische Messwerte und Legacy-Wasserbindung. |
| Geändert | `js/year-transition-actions.js` | Vorjahresübernahme für alle Verbrauchskostenarten; kostenartbezogene, dublettenfreie Auditierung. |
| Geändert | `manifest.webmanifest` | PWA-Version, Beschreibung und Build-ID auf V99.4.58. |
| Geändert | `nk-pro-project.json` | Projekt-, Cache-, Funktions- und Folge-AP-Metadaten. |
| Geändert | `package.json` | Releaseversion und AP22F10G-B-Testskripte. |
| Geändert | `package-lock.json` | Paketmetadaten auf V99.4.58 synchronisiert. |
| Geändert | `service-worker.js` | Cache- und Build-ID auf V99.4.58. |
| Geändert | `RELEASE_INHALTSMANIFEST_SHA256.txt` | Neu erzeugtes SHA256-Inhaltsmanifest des vollständigen Releasebestands. |
| Neu | `tests/ap22f10g-individual-values.test.cjs` | Statische Schutz- und Strukturprüfung der dynamischen Steuerung. |
| Neu | `tests/ap22f10g-individual-values-browser.test.cjs` | Browserstrecke mit 28 verbindlichen Prüfungen und Screenshot-Erzeugung. |

## Abschlussartefakte

| Art | Datei | Zweck |
|---|---|---|
| Neu | `AP22F10G_B_Dokumentation/README.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/ABSCHLUSS.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/UMSETZUNGSBERICHT.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/TESTBERICHT.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/BASELINEBERICHT.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/UMLAGESCHLUESSEL_ANALYSE.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/DATEIAENDERUNGEN.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/DATEIAENDERUNGEN.json` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/DATENMIGRATIONEN.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/SCREENSHOTS.md` | Abschlussartefakt |
| Neu | `AP22F10G_B_Dokumentation/browser-test-results.json` | Abschlussartefakt |
| Neu | `AP22F10G_B_Screenshots/01_desktop_realer_gesamtbestand.png` | Browsernachweis |
| Neu | `AP22F10G_B_Screenshots/02_schmale_ansicht_tabellenscroll.png` | Browsernachweis |
| Neu | `AP22F10G_B_Screenshots/03_browserzoom_125_prozent.png` | Browsernachweis |
| Neu | `AP22F10G_B_Screenshots/04_vorjahresuebernahme_dialog.png` | Browsernachweis |
| Neu | `AP22F10G_B_Screenshots/05_speicherfehler_wert_bleibt_sichtbar.png` | Browsernachweis |

## Entfernte Dateien

Keine Produktdatei wurde aus V99.4.52 entfernt.
