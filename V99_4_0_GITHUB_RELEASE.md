# NK-Pro V99.4.0 – GitHub Release

**Titel:** UX-Grundgerüst und Arbeitskontext  
**Datum:** 2026-07-12  
**Datenschema:** 5, unverändert  
**Basisversion:** V99.3.0 Development Baseline  
**Release-Status:** freigabefähig mit dokumentierter PWA-E2E-Umgebungsgrenze

## Kurzfassung

V99.4.0 führt die neue Arbeitsweiche und die fachlich gruppierte Navigation ein. Die Anwendung bleibt eine statische HTML/CSS/JavaScript-PWA ohne Framework oder Buildsystem. Berechnung, Datenmodell, Migrationen, historische Archive, Referenzdaten sowie Import-/Exportformate bleiben unverändert. Objektstandard und Zählerverwaltung werden wegen ihrer Datenmodellwirkung bewusst nicht vorgezogen.

## Commit Summary

```text
NK-Pro V99.4.0: Arbeitsweiche, gruppierte Navigation und bedingter Abrechnungskontext
```

## Commit Description

```text
- Ausgangsversion: V99.3.0 Development Baseline
- Hauptänderung: UX-Grundgerüst Phase 1
- Fachlogik betroffen: nein
- Datenmodell betroffen: nein
- Archive betroffen: nur UI-Zuordnung, keine Datenänderung
- Migration erforderlich: nein
- Tests: 5/5 Syntax, 19/19 Playwright/Chromium
- Dokumentation: vollständig aktualisiert
```

## Technische Änderungen

### Geändert

- `index.html`
- `assets/app.css`
- `js/navigation.js`
- `js/app.js`
- `manifest.webmanifest`
- `service-worker.js`
- `package.json`, `package-lock.json`
- UX-bezogene Testdateien und Projektdokumentation

### Neu

- `UI_ARCHITEKTUR_V99_4_0.md`
- `V99_4_0_GITHUB_RELEASE.md`
- `V99_4_0_Pruefbericht.json`

### Architekturwirkung

- vorhandene Funktionen genutzt und neu zugeordnet,
- Navigation vereinfacht,
- keine neue Facharchitektur,
- keine neue Persistenzstruktur,
- flüchtiger UI-Kontext statt neuem Datenfeld.

## Fachliche Änderungen

| Bereich | Wirkung |
|---|---|
| Berechnung | unverändert |
| Kostenarten | unverändert |
| Umlageschlüssel | unverändert |
| Zähler | unverändert |
| Vorauszahlungen | unverändert |
| Briefe | unverändert |
| Archiv | Daten unverändert; eigene Übersicht ergänzt |
| Import/Export | Formate unverändert |

## Datenmodell und Migration

- Datenschema geändert: nein
- Migration: nicht erforderlich
- Vor-Migrationsbackup: nicht betroffen
- Rollback: Austausch der statischen V99.4.0-Dateien durch das V99.3.0-Paket; Datenformat identisch
- Historische Archive: Referenz- und Archivlogik unverändert geprüft
- Stop-Regel: keine Datenmodellwirkung festgestellt; ADR-NK-0009 bis ADR-NK-0012

## Testergebnis

| Prüfung | Ergebnis |
|---|---|
| Syntaxprüfung | 5/5 bestanden |
| Browserkonsole / Page Errors | fehlerfrei |
| Chromium / Playwright | 19/19 bestanden |
| Landingpage / Navigation / ARIA | bestanden |
| Arbeitskontext und drei Statuswerte | bestanden |
| Persistenz / Recovery | bestanden |
| Export-/Import-Rundlauf | bestanden |
| Schema-5-Migration | bestanden |
| Referenzfälle | bestanden |
| PWA-Manifest / Cache | bestanden |
| Release Audit / App Self Test | ohne Fehler |
| Desktop-/Mobil-Sichtprüfung | bestanden |
| echter PWA-Install-/Offline-E2E | umgebungsbedingt nicht ausführbar |

## Bekannte Einschränkungen

- Objektstandard und Abrechnungssnapshot sind noch nicht formal getrennt.
- Zählerverwaltung und Zählerstände besitzen noch keine dauerhafte Zähler-ID.
- `js/app.js` bleibt monolithisch.
- Ein echter PWA-Installations- und Offline-Neustart muss außerhalb der blockierten Testumgebung nochmals manuell geprüft werden.
- Vor öffentlicher GitHub-Veröffentlichung sind enthaltene Daten auf Personen- und Finanzbezug zu prüfen.

## Upgrade

1. Bestehende Gesamt-JSON extern sichern.
2. Dateien durch V99.4.0 ersetzen.
3. Browser/PWA neu laden; der Cache wechselt auf `nk-pro-v99-4-0`.
4. Landingpage und mindestens eine bestehende Abrechnung öffnen.
5. Neue Gesamt-JSON-Sicherung erzeugen.

Da Datenschema und Austauschformate unverändert sind, ist keine Datenmigration erforderlich.

## Roadmap

Nächster Schritt ist die Entscheidungsphase für Objektstandard und Abrechnungssnapshot. Vor jeder Umsetzung sind mindestens zwei Lösungswege, Auswirkungen auf Archive und Austauschformate sowie Backup und Wiederherstellung zu bewerten.
