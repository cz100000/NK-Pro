# NK-Pro V99.4.18 – Gesamtintegration, Releasehärtung und schlanke Arbeitsbasis

NK-Pro ist eine lokale, frameworkfreie HTML/CSS/JavaScript-PWA zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen. AP15 prüft den bestehenden Gesamtprozess, behebt Integrations- und Zustandsreste, härtet PWA- und Offlineverhalten und definiert eine bereinigte Arbeits-ZIP. Es werden keine neuen größeren Fachfunktionen eingeführt.

## Verbindlicher Stand

| Merkmal | Wert |
|---|---|
| App-Version | V99.4.18 |
| Basis | Abschlussstand AP14 V99.4.17 |
| Versionsname | AP15-Gesamtintegration, Releasehärtung und schlanke Arbeitsbasis |
| Datenschema | 5 |
| Datenebenenvertrag | 1 |
| Abrechnungssnapshot | 2 |
| Dokumentlayout | 4 |
| UI-System | 1 |
| PWA-Cache | `nk-pro-v99-4-18-ap15` |

## AP15-Kernergebnis

- Der Bedienfluss von Startseite, Objektvorbereitung, Abrechnungsübersicht und produktiven Abrechnungsschritten ist integriert geprüft.
- Kontextwechsel schließen offene Dialoge, Kopfmenüs und nichtfachliche Kosten-Auswahlzustände zentral.
- Import, Restore und Rollback kehren in einen bereinigten Startzustand zurück.
- Der Service Worker begrenzt Cachebereinigung auf NK-Pro-Caches, cached nur erfolgreiche Same-Origin-Antworten und besitzt einen belastbaren Offline-Navigationsfallback.
- Die Browser-Freigabeprüfung läuft seriell und dadurch aus einer frisch entpackten ZIP reproduzierbar.
- Historische Berichte, Kontrollausgaben, Screenshots und Übergabeartefakte wurden nach Referenzprüfung aus der Arbeitsbasis entfernt.
- Der statische Zählerbereich bleibt DUMMY; die Verbrauchserfassung bleibt produktiv.
- Das AP13-Brief-/Druckmodell und das AP14-UI-System bleiben fachlich und gestalterisch unverändert.

## Start

Die Anwendung kann über einen lokalen statischen Webserver gestartet werden. Für Entwicklung und Tests:

```bash
npm ci
npx playwright install chromium
npm test
```

Die vollständige Freigabeprüfung einschließlich ZIP-Inhaltskontrolle:

```bash
npm run release:check
```

`node_modules`, Testreports und Browserprofile gehören nicht in die Arbeits-ZIP.

## Verbindliche Dokumente

- `AP15_GESAMTINTEGRATION_RELEASEHAERTUNG_UND_SCHLANKE_ARBEITSBASIS.md`
- `AP15_PRUEFBERICHT.md`
- `AP15_TEST_RESULTS.json`
- `AP15_ZIP_INHALTSPRUEFUNG.md`
- `AP15_UEBERGABEREGEL.md`
- `NK-PRO-PROJEKTSTAND.md`
- `TESTING.md`
