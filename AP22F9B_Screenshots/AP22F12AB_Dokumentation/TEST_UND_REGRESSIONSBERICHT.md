# AP22F12A/B – Test- und Regressionsbericht

**Prüfdatum:** 02.08.2026  
**Release:** V99.4.66

## 1. Automatisierter Release-Gate

Befehl: `npm run release:check:ap22f12`

Ergebnis: **bestanden**.

Enthaltene Prüfungen:

- JavaScript-Syntax: 60 Einheiten fehlerfrei,
- Fixture-Prüfung: 6 logische Referenzfälle semantisch unverändert,
- vollständige Zähler-/Messperiodenregression bestanden,
- Architekturregression AP6/AP7/AP8/AP9/AP10/AP13/AP21/AP21B2 bestanden,
- AP22F11B Korrektur 4 statisch bestanden,
- AP22F12-Domaintests bestanden,
- AP22F12-Integrations-/Statiktests bestanden,
- strikte Release-Inhaltsprüfung bestanden: 815 Dateien.

## 2. AP22F12-Domaintests

Geprüft wurden:

- neutrale Migration ohne fiktive Einnahmen,
- Vorzeichenlogik für Vorauszahlung, Nachzahlung, Erstattung und Korrektur,
- getrennte Speicherung von Zahlungs- und Abrechnungsjahr,
- offene Differenz bei Kontrolldifferenz 0,00 Euro,
- Speicherung und Rücknahme im bestehenden Prüfentscheidungsregister,
- Invalidierung eines Prüf-/Freigabestatus bei fachlicher Änderung,
- Kostenübersteuerung,
- JSON-Roundtrip der neuen Daten.

## 3. AP22F12-Integrationsprüfungen

Geprüft wurden:

- Seite, Navigation und zentrale Seitenregistrierung,
- Modul- und Skriptladereihenfolge,
- V99.4.66-Metadaten,
- Snapshot-/Migrationsintegration,
- zentrale Prüfregel und Statuskarte,
- Excel-, Druck- und Prüfprotokollfunktionen,
- Service-Worker-/PWA-Integration.

## 4. Regression

Bestanden:

- bestehende Fixture-Daten,
- Zählerstandard, Messperioden und Zählerberechnung,
- zentrale Zustands-/Anwendungsaktionsarchitektur,
- Navigation und Direkteinstiege,
- Dokumentlayout-Struktur,
- AP22F11B-K4-Struktur,
- Release-Inhaltsregeln.

## 5. Browserautomation – nicht ausführbar

Der vorgesehene Befehl `npm run test:browser:ap22f12` konnte in der bereitgestellten Umgebung nicht ausgeführt werden. Ursache:

`Cannot find module .../node_modules/playwright`

Auch der bestehende AP22F11B-K4-Datenroundtrip benötigt Playwright und war aus demselben Grund nicht startbar. Ein Installationsversuch konnte die erforderliche Abhängigkeit über die interne Paketquelle nicht beziehen. Daher wird ausdrücklich **kein bestandener Browser-/E2E-Test behauptet**.

Diese Einschränkung betrifft die Testumgebung. Syntax-, Fachlogik-, Integrations-, Architektur-, Fixture-, Zähler- und Releaseprüfungen wurden unabhängig davon erfolgreich ausgeführt.

## 6. Manuelle Risikobewertung

Die neue UI wurde gegen vorhandene zentrale Aktions-, Schreibschutz-, Navigations-, Persistenz- und Renderverträge statisch geprüft. Vor produktiver Endabnahme in einem Browser mit installierter Playwright-Abhängigkeit sollten die vorhandenen Browser-/E2E-Suiten nachgeholt werden.
