# AP20-Prüfbericht – NK-Pro V99.4.23

## Ausgangsprüfung

Die hochgeladene ZIP wurde als NK-Pro V99.4.22 / AP19 bestätigt. Anwendungsversion, Datenschema 5, Datenebenenvertrag 1, kontrollierter AP19-Abrechnungskontext, Paketmetadaten und vorhandene Projektdokumentation waren konsistent. Es wurde keine technische Grundlage aus anderen Chats übernommen.

## Inventar- und Architekturprüfung

- 176 vorhandene Prüfstellen inventarisiert und bewertet
- 42 zentrale Regel-IDs
- 8 fachliche Prüfbereiche
- 4 Kategorien
- 6 sichtbare Status
- 19 Pflichtprüfungen
- 11 Plausibilitätsprüfungen
- 6 Hinweis-/Sonderfallregeln
- 6 technische Systemregeln
- 19 blockierende Regeln
- 17 bestätigbare Regeln
- 36 fachliche Direkteinstiege
- 15 produktiv angebundene Fachseitenbereiche

## Automatisierte Ergebnisse

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax | bestanden, 53 Einheiten |
| Referenzdaten | bestanden, 6 Fälle |
| Zählerdomäne | bestanden |
| Architektur AP6–AP20 | bestanden |
| AP20-Registry und zentrale UI-Struktur | bestanden |
| serverloser Chromium-Harness | bestanden, 5 Szenarien / 48 Prüfungen |
| Cockpit mit 8 Gruppen | bestanden |
| Detaildialog und zentrale Datenquelle | bestanden |
| Ansichtsmodus und direkte Schreibsperre | bestanden |
| Bestätigen / Zurücknehmen / Nicht anwendbar | bestanden |
| Fingerprint-Ungültigwerden nach Datenänderung | bestanden |
| Blocker nicht bestätigbar | bestanden |
| getrennte Systemdiagnose | bestanden |
| Datenschema und Datenvertrag | unverändert, bestanden |
| bestehende Berechnungs-Fixures | semantisch unverändert |

## Korrekturstand 1 – Datenstart bei rückläufigem Zählerstand

Die nach der Erstfreigabe gemeldete Neustartstörung wurde reproduziert und korrigiert. Ein Zählerendstand unter dem Anfangsstand ohne dokumentierten Überlauf bleibt eine fachliche Auffälligkeit, führt aber nicht mehr zum Abbruch der Dateninitialisierung. Echte strukturelle Zählerfehler bleiben weiterhin startblockierend.

Die Korrektur wurde auf drei Ebenen geprüft:

| Korrekturprüfung | Ergebnis |
|---|---|
| Zählerstandard-Migration mit rückläufiger Messperiode | bestanden; Status nicht `failed` |
| zentrale Regel `NKP-PLAU-005` | bestanden; Status „Zu prüfen“, nicht blockierend, bestätigbar |
| echter Chromium-Neustart mit vorbefülltem Local Storage | bestanden; kein Fallback, keine Startfehler, Datensatz vollständig geladen |
| Erhalt der auffälligen Messperiode | bestanden; keine automatische fachliche Korrektur |
| PWA-Aktualisierung | Cachekennung auf `nk-pro-v99-4-23-ap20-corr1` angehoben |

Datenschema 5, Datenebenenvertrag 1, Abrechnungsformeln und der gespeicherte Datenbestand bleiben unverändert.

## Abschluss- und Freigabelogik

Die Workflow- und Dokumentmodule verwenden die zentrale Readiness-Auswertung. Offene Blocker verhindern den Abschluss. Ohne Blocker, aber mit offenen Plausibilitäten lautet das Ergebnis „Fachlich zu prüfen“. Erst nach Bearbeitung aller relevanten Auffälligkeiten wird „Abschlussbereit“ ausgegeben. Das Abnahmeprotokoll erhält keine eigene Prüfberechnung.

## Regression

AP13-Dokumentrenderer, Briefvorschau-Isolation, Zoom-, Druck-, PDF- und Schwarzweißmodule wurden nicht fachlich geändert. PWA-Cache, Manifest und App-Shell wurden auf V99.4.23 aktualisiert; `quality-rules.js` ist offline enthalten. Schema 5 und Datenebenenvertrag 1 bleiben unverändert.

Die normale serverbasierte Playwright-Navigation ist in der Prüfumbgebung weiterhin durch `ERR_BLOCKED_BY_ADMINISTRATOR` für Loopback-Adressen blockiert. Der serverlose Chromium-Harness lädt denselben HTML-, CSS- und JavaScript-Bestand ohne Netzwerkserver und besteht mit 48 Einzelprüfungen. Eine sehr schmale Chromium-Viewport-Ausführung beendet in dieser Hostumgebung den Targetprozess. Responsive Breakpoints, Strukturen und Focus-/Overflow-Regeln sind statisch geprüft; eine reale Narrow-Viewport-Abnahme bleibt deshalb als Zielsystemprüfung dokumentiert.

## Reproduzierbare Prüfung

```text
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:contents
npm run test:ap20:harness
npm run test:ap20:meter-start-browser
npm run test:release
```

In einer Umgebung ohne Loopback-Sperre zusätzlich:

```text
npm run test:browser
```

## Korrekturstand 3 – Asset-Aktualisierung und historischer Fehlwert

| Prüfung | Ergebnis |
|---|---|
| Build-ID der kritischen Zählerassets | `99.4.23-ap20-corr3` |
| Service-Worker-Aktualisierung ohne HTTP-Cache | bestanden |
| einmaliger automatischer Reload nach Workerwechsel | bestanden |
| Ausgangswert `29774` reproduziert `29.508 m³` | bestanden |
| Eingabe `297,74` aktualisiert live auf `31,74 m³` | bestanden |
| Enter ersetzt den Fehlwert durch `297.74` | bestanden |
| Speicherung und Neustart | bestanden |
| PWA-Cache | `nk-pro-v99-4-23-ap20-corr3` |

## Korrekturstand 2 – Live-Zählerberechnung

| Prüfung | Ergebnis |
|---|---|
| Verbrauch während der Eingabe | bestanden |
| Summenzeile während der Eingabe | bestanden |
| Enter-Commit | bestanden |
| Dezimalkomma `297,24` | bestanden; 31,24 m³ |
| Dezimalpunkt `128.06` | bestanden; 11,06 m³ |
| Vorschau ohne vorzeitige Persistenz | bestanden |
| Speicherung und Browserneustart | bestanden |
| Datenschema / Datenebenenvertrag | unverändert 5 / 1 |
| PWA-Aktualisierung | Cachekennung `nk-pro-v99-4-23-ap20-corr2` |
