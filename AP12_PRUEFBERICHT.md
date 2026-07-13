# AP12 – Test- und Prüfbericht

**Version:** V99.4.13  
**Datum:** 13. Juli 2026  
**Gesamtergebnis:** bestanden

## Statische und fachliche Prüfungen

| Suite | Ergebnis |
|---|---|
| JavaScript-Syntax | 51 Einheiten fehlerfrei |
| Referenzdaten | 6 Fälle semantisch unverändert |
| Zählerstandard | bestanden |
| Architektur AP6-AP12 | bestanden |


## Browser- und PWA-Prüfungen

| Playwright-Projekt | Tests | Ergebnis |
|---|---|---|
| app-smoke | 9/9 | passed |
| document-export | 2/2 | passed |
| migration-restore | 6/6 | passed |
| module-boundaries | 1/1 | passed |
| ui-controller-events | 2/2 | passed |
| object-snapshot | 9/9 | passed |
| persistence-backup | 5/5 | passed |
| reference-cases | 6/6 | passed |
| service-worker | 1/1 | passed |
| ap10-orchestration | 5/5 | passed |
| ap11-navigation | 5 passed, 1 intentional skipped | passed |
| ap12-orchestration | 1/1 | passed |


Wiederholte Playwright-/Webserver-Teardown-Hänger betrafen den Prozessabschluss, nicht die Testassertionen. Deshalb wurden das Snapshot-Projekt und einzelne Restprojekte in frischen Prozessen ausgeführt. **Alle neun Snapshot-Prüfungen bestanden**; derselbe Anwendungspayload hatte zuvor zusätzlich einen gemeinsamen 9/9-Lauf bestanden. Ein zunächst belegter lokaler Testport wurde vor der Wiederholung bereinigt. Der visuelle AP11-Aufnahmetest ist bewusst nur bei gesetztem `AP11_CAPTURE=1` aktiv und wurde nicht als produktiver Regressionstest gezählt. Es blieben keine angeforderten Funktionsprüfungen unausgeführt.

## Verifizierte Invarianten

- sechs Referenzabrechnungen semantisch unverändert,
- Kosten, Vorauszahlungen, Nachzahlungen/Guthaben, Rundungen und Zählerverbräuche unverändert,
- Stromzähler-Dummy weiterhin nicht abrechnungswirksam,
- Archiv, Snapshot, Jahreswechsel, Migration, Backup, Restore und Rollback unverändert,
- Datenschema 5 und Datenverträge unverändert,
- Navigation aus AP11 vollständig erreichbar,
- PWA-App-Shell und Offlinecache vollständig,
- Anwendung startet aus frischer Entpackung ohne JavaScript-Fehler.

## Prüfung der fertigen ZIP

- interne Dateiprüfsummen: 196/196 bestanden,
- `npm ci`: bestanden,
- statische, fachliche, Architektur- und Releaseprüfung: bestanden,
- 12/12 Playwright-Projekte: bestanden,
- 52 produktive Browsertests bestanden; ein optionaler visueller AP11-Aufnahmetest bewusst übersprungen.

Maschinenlesbare Ergebnisse: `AP12_TEST_RESULTS.json`.
