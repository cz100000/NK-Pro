# NK-Pro – Development Baseline

**Baseline-Stand:** 12. Juli 2026  
**Technischer App-Stand:** V99.3.0  
**Datenschema:** 5  
**Baseline-Typ:** ausschließlich Dokumentation und Entwicklungsregeln  
**Technische Grundlage:** nur der Inhalt der bereitgestellten ZIP-Datei

## Zweck

Diese Baseline beschreibt den tatsächlich vorgefundenen Zustand von NK-Pro. Sie ist ab sofort die verbindliche Ausgangsbasis für weitere Arbeiten. Frühere Chats, nicht in der ZIP enthaltene Dateien und nicht nachweisbare Annahmen sind keine technische Quelle.

Die Erstellung dieser Baseline verändert keine Fachlogik, keine Berechnung, kein Datenmodell, keine Migration, keine Navigation, keine PWA-Funktion und kein Import-/Exportformat.

---

## 1. Bestätigter Versionsstand

| Merkmal | Festgestellter Stand |
|---|---|
| Anwendung | NK-Pro V99.3.0 |
| Versionsname | Navigation und vollständige Qualitätsprüfung |
| Release-Datum im Quellcode | 2026-07-12 |
| Datenschema | 5 |
| PWA-Manifest | 99.3.0 |
| Service-Worker-Cache | `nk-pro-v99-3-0` |
| npm-Paket | `nk-pro-v99-3-0` / 99.3.0 |
| Produktive Technik | HTML, CSS, JavaScript ohne Framework und ohne Buildprozess |
| Testtechnik | Node.js, Playwright, Chromium |

Die Laufzeitversion bleibt V99.3.0. Die Development Baseline ist keine neue Funktionsversion.

---

## 2. Projektstruktur

```text
NK-Pro_V99_3_0_Navigation_Qualitaetspruefung_GitHub_Edition/
├── index.html
├── assets/
│   └── app.css
├── js/
│   ├── app.js
│   ├── modal-events.js
│   ├── navigation.js
│   └── service-worker-register.js
├── icons/
│   ├── icon-180.png
│   ├── icon-192.png
│   └── icon-512.png
├── manifest.webmanifest
├── service-worker.js
├── tests/
│   ├── app-smoke.spec.js
│   ├── persistence-backup.spec.js
│   ├── reference-cases.spec.js
│   ├── service-worker.spec.js
│   └── test-helpers.cjs
├── testdaten/
│   ├── standardfall.json
│   ├── mieterwechsel.json
│   ├── leerstand.json
│   ├── eigentuemer-m000.json
│   ├── alle-eingabequellen.json
│   └── altdaten-migration.json
├── tools/
│   ├── check-js-syntax.cjs
│   └── static-server.cjs
├── package.json
├── package-lock.json
├── playwright.config.cjs
├── README.md
├── CHANGELOG.md
├── WORKBOOK.md
├── UI_ARCHITEKTUR_V99_3_0.md
├── V99_2_9_Pruefbericht.json
├── V99_3_0_Pruefbericht.json
├── SHA256SUMS.txt
├── .gitignore
└── .nojekyll
```

### Größenordnung

- `js/app.js`: rund 772 KB und rund 9.800 Zeilen
- `assets/app.css`: rund 115 KB und rund 3.100 Zeilen
- `index.html`: rund 75 KB und 14 Anwendungs-Tabs
- Testdaten: sechs umfangreiche JSON-Referenzfälle
- Gesamtes Ausgangsprojekt: 36 Dateien, rund 3,7 MB entpackt

### Verantwortlichkeiten der Dateien

| Datei | Aktuelle Verantwortung |
|---|---|
| `index.html` | statische Seitenstruktur, Navigation, Tabs, Dialoge und Script-/Style-Einbindung |
| `assets/app.css` | vollständiges Bildschirm-, Responsive- und Drucklayout |
| `js/app.js` | Datenmodell, Fachlogik, Migration, Speicherung, Archiv, Berechnung, Renderlogik, Briefe, Import/Export, Audits |
| `js/navigation.js` | Workflow-Navigation, Accordion-Zustand, Sidebar und Navigationskontext |
| `js/modal-events.js` | globale Schließereignisse für den Kostenartendialog |
| `js/service-worker-register.js` | Registrierung und Updatehinweis der PWA |
| `service-worker.js` | App-Shell-Cache und Offline-Fallback |
| `tests/` | automatisierte Chromium- und Strukturprüfungen |
| `testdaten/` | unveränderliche Regressionseingaben |

---

## 3. Architekturanalyse

### Laufzeitarchitektur

NK-Pro ist eine statische Single-Page-Anwendung. Alle Bereiche sind gleichzeitig im DOM vorhanden und werden über aktive Tab-Klassen ein- oder ausgeblendet. Es gibt keine serverseitige Komponente und keine Datenbank.

Die Anwendung lädt in dieser Reihenfolge:

1. `assets/app.css`
2. `js/navigation.js`
3. `js/modal-events.js`
4. `js/app.js`
5. `js/service-worker-register.js`

Die JavaScript-Dateien verwenden einen gemeinsamen globalen Namensraum. `navigation.js` greift auf Funktionen und Variablen aus `app.js` zu, sobald diese verfügbar sind. Viele HTML-Elemente verwenden weiterhin Inline-Handler wie `onclick`, obwohl der ausführbare Code in externen Dateien liegt.

### Zustandsarchitektur

- Zentraler Laufzeitzustand: globale Variable `state`
- Ausgangsdaten: sehr großes eingebettetes Objekt `SEED` in `js/app.js`
- Primärspeicher: Browser-`localStorage`
- Primärschlüssel: `nkpro_browser_v85_qualitaets_cockpit_data`
- Rückfallstand: Primärschlüssel plus `_last_valid`
- Legacy-Erkennung: zahlreiche ältere Speicherkeys ab V39
- Schreibschutz: Archivansicht und finalisierte Abrechnung
- Datenintegrität: FNV-1a-32-Prüfsumme gegen unbeabsichtigte Beschädigung

### Renderarchitektur

- Fach- und Anzeigezustand werden zentral vorbereitet.
- `commitStateChange()` bündelt Normalisierung, Speichern und Rendern.
- `renderAll()` koordiniert Gesamt- oder Teilrendering.
- Für jeden Tab existieren spezialisierte Renderfunktionen.
- Interne Audits prüfen Seitenstruktur, Release-Regeln und Selbsttests.

### PWA-Architektur

- Das Manifest beschreibt eine installierbare Standalone-PWA.
- Der Service Worker cached die vollständige App-Shell.
- Fetch-Strategie: Network-first mit Cache-Aktualisierung und Fallback auf Cache beziehungsweise `index.html`.
- Bei einer neuen Worker-Version wird ein Updatehinweis eingeblendet.

### Architekturgrenzen

Die Anwendung ist bereits modular auf Dateiebene, fachlich aber noch stark in `js/app.js` konzentriert. Eine spätere Modularisierung ist möglich, darf jedoch nicht mit einem Frameworkwechsel, einem Buildsystem oder einer stillen Neuentwicklung verbunden werden.

---

## 4. Datenmodellanalyse

### Root-Struktur des normalisierten Schemas 5

| Bereich | Zweck |
|---|---|
| `wohnungen` | Wohnungsbestand der aktuellen Abrechnung |
| `mieter` | Mietverhältnisse und Eigentümer-/Privatrolle |
| `kostenarten` | Kostenarten, Schlüssel, Beträge und Einstellungen |
| `vorauszahlungen` | Vorauszahlungsmatrix je Kostenart und Mietverhältnis |
| `meta` | Jahr, Zeitraum, Schema, Speicher-, Import-, Backup- und Statusmetadaten |
| `waterMeters` | Wasserzähler-Einstellungen und aktuelle Ablesungen |
| `meterReadings` | generische Zählerstände weiterer Verbrauchskosten |
| `umlageInputs` | manuelle oder externe Eingabewerte je Kostenart |
| `kostenartenMieterUmlage` | individuelle Zulässigkeit je Kostenart und Mietverhältnis |
| `briefSettings` | Briefkopf, Texte, Termine und Vorauszahlungsdarstellung |
| `prepaymentAdjustmentSettings` | Regeln zur Berechnung neuer Vorauszahlungen |
| `stammdaten` | zentraler Wohnungs- und Mieterbestand als Arbeitsgrundlage |
| `abrechnungsEinzelwerte` | vereinheitlichte Einzelwerte aus Legacy-Abrechnungen |
| `jahresArchiv` | archivierte Abrechnungen mit Metadaten, Zusammenfassung und vollständigem Datensnapshot |
| `waterMeterHistory` | importierte historische Wasserzählerwerte und Quellenhinweise |

### Stabile Identitäten

- Wohnungen besitzen stabile IDs wie `W001.EG-L`.
- Mietverhältnisse besitzen IDs wie `M001`; `M000` kennzeichnet Eigentümer/Privat.
- Kostenarten besitzen IDs wie `K002` oder `K006`.
- Bestehende Zählerwerte werden aktuell überwiegend über Wohnungs- oder Mieteridentitäten stabilisiert.
- Eine eigenständige, dauerhaft modellierte Zähler-ID im Sinne des neuen Zielbildes ist im vorgefundenen Modell noch nicht durchgängig vorhanden.

### Archivmodell

Ein Archivdatensatz enthält neben Jahr, Periode, Status und Summen regelmäßig einen vollständigen Datenstand unter `item.data`. Dadurch können historische Abrechnungen eigenständig geöffnet werden. Gleichzeitig führt diese rekursive Struktur dazu, dass Migrationen und Normalisierungen besondere Vorsicht erfordern.

### Objektstandard und Abrechnungsdaten

Die Anwendung verfügt bereits über `stammdaten` sowie Funktionen zum Übernehmen oder Abgleichen mit einer aktuellen Abrechnung. Der gewünschte Grundsatz „Objektstandard wird einmalig kopiert und verändert niemals bestehende Abrechnungen“ ist als Ziel verbindlich, aber im aktuellen Code nicht als vollständig isolierte, formal abgesicherte Datenebene nachgewiesen. Künftige Änderungen hierzu sind datenmodellrelevant und unterliegen der Stop-Regel.

---

## 5. Navigationsanalyse

### Aktueller Stand

Die aktuelle Anwendung hat 14 Tabs:

**Start-/Stammdatenbereich**

- Mieter
- Wohnungen
- Abrechnungsübersicht
- Datensicherung

**Abrechnungsbereich**

- Mieter & Wohnungen
- Kostenarten
- Miete & Vorauszahlungen
- Zählerstände
- Manuelle & externe Werte
- Nebenkostenumlage
- Neue Vorauszahlungen
- Qualitätsprüfung
- Abrechnungsbriefe
- Export

Der Abrechnungsbereich ist in vier Accordion-Phasen gegliedert. Der geöffnete Accordion-Zweig und der eingeklappte Sidebar-Zustand werden separat in `localStorage` gespeichert.

### Abweichung zum Zielbild

Die aktuelle Navigation entspricht noch nicht der neuen Zielstruktur:

- Die Landingpage ist noch keine reine Arbeitsweiche mit genau zwei großen Einstiegen.
- Die Zielgruppen „Objekt vorbereiten“, „Nebenkosten abrechnen“, „Archiv“ und „Extras“ existieren noch nicht in der gewünschten Form.
- „Objekt“, „Zählerverwaltung“, „Umlageschlüssel (Standard)“ und eine eigenständige „Abrechnungsübersicht“ innerhalb der Zielgruppe sind noch nicht entsprechend getrennt.
- Der Navigationskopf zeigt derzeit einen Abrechnungskontext auch ohne tatsächlich geöffnete Abrechnung und verwendet dann einen Platzhalterstatus.
- Archiv und Extras sind nicht als eigene Accordion-Gruppen angelegt.

Diese Punkte sind dokumentierte Funktionsziele, keine Bestandteile der Baseline-Änderung.

---

## 6. Migrationsmechanismen

### Aktueller Ablauf

1. Daten werden aus dem aktuellen Speicherkey gelesen.
2. Die Prüfsumme wird validiert.
3. Bei beschädigtem Hauptstand wird der letzte gültige Rückfallstand versucht.
4. Danach werden ältere Speicherkeys in fester Reihenfolge geprüft.
5. Geladene Daten werden normalisiert.
6. Schema-Migrationen werden bis Schema 5 ausgeführt.
7. Archivdatensätze werden rekursiv ebenfalls migriert.
8. Beim späteren Speichern wird der vorherige gültige Hauptstand als Rückfallstand abgelegt.

### Vorhandene Migrationen

- Schema 1 → 2: stabile Mieter- und Wohnungsidentitäten
- Schema < 4 → 4: individuelle Umlagefähigkeit je Kostenart und Mietverhältnis
- Schema < 5 → 5: Stammdaten, Wohnungsstatus je Abrechnung und eindeutige Quellenmodi für manuelle/externe Werte

Migrationen werden in `meta.migrationHistory` protokolliert.

### Kritische Abweichung von der neuen Baseline

Der aktuelle Code erstellt vor jeder Migration **keine ausdrücklich benannte, automatisch exportierbare Sicherung**. Der Rückfallstand wird erst im normalen Speichervorgang aus dem vorherigen gültigen Hauptstand erzeugt. Außerdem existiert kein eigenständiger, allgemein nutzbarer Downgrade- oder Rollback-Migrationspfad.

Daher gilt für jede künftige Migration zwingend:

- Stop-Regel anwenden,
- automatische Vor-Migrationssicherung implementieren,
- Rückweg definieren,
- Originaldaten unangetastet nachweisbar erhalten,
- aktuelle und historische Datensätze testen.

---

## 7. Teststrukturanalyse

### Vorhandene Teststufen

| Stufe | Umsetzung |
|---|---|
| Syntax | `node --check` für vier Anwendungsskripte und Service Worker |
| Browserstart | Chromium über Playwright |
| Laufzeitfehler | Überwachung von Konsole, Page Errors und fehlgeschlagenen Requests |
| Navigation | alle 14 Tabs und eindeutiger aktiver Tab |
| Seitenstruktur | statischer Seitenrahmen und interne UI-Audits |
| Persistenz | Speichern, Reload und Prüfsumme |
| Recovery | beschädigter Hauptstand und gültiger Rückfallstand |
| Import/Export | JSON-Rundlauf der aktuellen Abrechnung |
| Referenzfälle | Standardfall, Mieterwechsel, Leerstand, M000, Eingabequellen |
| Migration | Altdaten von Schema 4 auf Schema 5 |
| PWA | App-Shell, Cachekennung und Löschung alter Caches |
| Interne Prüfungen | Release Audit und App Self Test |

### Verifizierter Baseline-Lauf

- JavaScript-Syntax: **5/5 bestanden**
- Playwright: **15/15 bestanden**
- Browserkonsole/Page Errors/Request Failures: **keine blockierenden Fehler**
- Verwendetes Chromium: vorhandenes System-Chromium
- Testdatum: 12. Juli 2026

### Noch nicht ausreichend abgesichert

- automatische Sicherung unmittelbar vor Migration
- echter Rollback einer Migration
- unveränderte Byte- oder Fachidentität historischer Archive über mehrere Schemawege
- Zielnavigation und bedingter Bereich „Aktive Abrechnung“
- vollständiger Browser-Offline-Test mit echtem Service Worker
- Import aller historisch unterstützten Exportvarianten als automatisierte Matrix
- Langzeit- und Speichergrenzentests für sehr große Archive

---

## 8. Risiken

### R1 – Historische Daten werden rekursiv normalisiert

Archivdaten enthalten vollständige Datensnapshots und werden durch `migrateDataSchema()` rekursiv bearbeitet. Jede zukünftige Schemaänderung kann deshalb historische Daten berühren.

**Bewertung:** sehr hoch  
**Folge:** Jede Änderung an Schema, Normalisierung oder Archivmodell löst die Stop-Regel aus.

### R2 – Keine explizite Vor-Migrationssicherung

Die vorhandene Recovery-Logik ist nützlich, erfüllt aber nicht die neue Anforderung einer automatisch erstellten, reproduzierbaren Vor-Migrationssicherung.

**Bewertung:** sehr hoch

### R3 – Monolithische Fachdatei

`js/app.js` enthält fast sämtliche Fach-, Daten-, Render-, Import-, Export-, Brief- und Prüfpfade. Kleine Änderungen können unerwartete Seiteneffekte verursachen.

**Bewertung:** hoch

### R4 – Globaler Namensraum und Inline-Handler

Viele Funktionen sind global erreichbar; HTML und JavaScript sind über Funktionsnamen gekoppelt. Umbenennungen oder modulare Verschiebungen sind risikoreich.

**Bewertung:** hoch

### R5 – Stammdaten und Abrechnung noch nicht formal isoliert

Es existieren Übernahme- und Merge-Funktionen. Die gewünschte absolute Unabhängigkeit bestehender Abrechnungen muss vor Änderungen technisch nachgewiesen und getestet werden.

**Bewertung:** hoch

### R6 – Zähler besitzen noch kein durchgängiges eigenes Domänenmodell

Zählerverwaltung und Zählerstände sind im aktuellen Modell nicht konsequent als getrennte Entitäten mit dauerhafter Zähler-ID umgesetzt.

**Bewertung:** hoch

### R7 – Browser-LocalStorage als alleiniger Arbeitsdatenspeicher

Browserbereinigung, Profilwechsel, Speichergrenzen oder Geräteverlust können Daten vernichten. Das Projekt warnt ab etwa 4 MB und bewertet etwa 4,7 MB als kritisch.

**Bewertung:** hoch

### R8 – Eingebettete reale Arbeits- und Personendaten

Der ausgelieferte Seed und die Referenzdaten enthalten konkrete Arbeitsdaten. ZIP, Repository und GitHub-Pages-Veröffentlichung müssen daher als vertraulich bewertet werden, solange keine datenschutzgerechte Trennung oder Anonymisierung beschlossen ist.

**Bewertung:** hoch

### R9 – CSS-Historie und hohe Spezifität

Die CSS-Datei enthält zahlreiche historisch gewachsene Schichten, viele ID-Selektoren und `!important`-Regeln. Optische Änderungen können andere Tabs oder Drucklayouts beeinflussen.

**Bewertung:** mittel bis hoch

### R10 – Service-Worker-Cache kann alte Oberflächen sichtbar halten

Cachewechsel sind versioniert, dennoch können Browser-PWA-Zustände und Updatezeitpunkte bei Tests oder Veröffentlichung zu scheinbar veralteten Ständen führen.

**Bewertung:** mittel

### R11 – Prüfsumme ist kein Sicherheitsnachweis

FNV-1a-32 erkennt typische Beschädigungen, ist aber keine kryptografische Signatur und schützt nicht vor absichtlicher Manipulation.

**Bewertung:** mittel

### R12 – Dokumentationsdrift

Die vorhandene README enthielt einzelne veraltete Versions- und Dateiverweise. Die Baseline korrigiert dies und führt verbindliche Dokumentationspflege ein.

**Bewertung:** mittel; mit dieser Baseline organisatorisch reduziert

---

## 9. Verbesserungsmöglichkeiten

Die Reihenfolge ist verbindlich konservativ:

1. Vorhandene Funktionen nutzen und mit Schutztests absichern.
2. Landingpage und Navigation ausschließlich auf Basis der vorhandenen Tab- und Modussteuerung umbauen.
3. Den Bereich „Aktive Abrechnung“ an eine eindeutige, getestete Öffnungsbedingung koppeln.
4. Objektstandard und Abrechnungssnapshot formal definieren, bevor Datenstrukturen geändert werden.
5. Zählerdomäne mit dauerhafter Zähler-ID entwerfen; vor Umsetzung zwei Migrationswege vergleichen.
6. Vor-Migrationsbackup und nachvollziehbaren Rollback als technische Voraussetzung jeder neuen Schemaversion einführen.
7. `js/app.js` schrittweise nach bestehenden Verantwortlichkeiten aufteilen, ohne Buildsystem und ohne Änderung globaler Fachresultate.
8. CSS nur bereichsweise konsolidieren und jeden Schritt mit Screenshot-/Druckregression absichern.
9. Echte Offline-, Archiv-Langzeit- und Exportformat-Regressionen ergänzen.
10. Vertrauliche Seed-/Referenzdaten langfristig von veröffentlichbaren Demo- oder Testdaten trennen.

---

## Baseline-Freigabe

Diese Baseline ist freigegeben, wenn folgende Bedingungen erfüllt sind:

- alle geforderten Projektdokumente liegen vor,
- keine produktive Datei wurde verändert,
- Syntaxprüfung besteht,
- alle vorhandenen Playwright-Tests bestehen,
- Prüfsummen wurden aktualisiert,
- Dokumentationsänderungen sind im CHANGELOG und WORKBOOK festgehalten.

Der zugehörige maschinenlesbare Nachweis liegt in `DEVELOPMENT_BASELINE_PRUEFBERICHT.json`.
