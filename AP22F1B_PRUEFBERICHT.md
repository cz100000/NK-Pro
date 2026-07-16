# AP22F1B – Prüfbericht

## Abnahmeergebnis

Die vier neuen AP22F1B-Prüfungen bestehen vollständig:

- statische Seitenkopfmatrix: 18 sichtbare Ansichten, exakt 11 zulässige Kopf-Speicheraktionen,
- Aktionsredundanz: genau ein Speicherweg auf `manuellewerte`, fachliche Inhaltsaktionen erhalten,
- Schutzprüfung: 15 vollständige Dateien sowie 7 geschützte beziehungsweise patchbegrenzte Bereiche,
- Chromium: 9 von 9 Tests einschließlich 1440×1000, 1280×900, 1024×800, 900×620, 620×800, 390×844, Nur-ansehen und Tastaturfokus.

`npm run release:check` besteht. Das Gate umfasst Syntax, Fixtures, AP22F1A-Schutzbereiche, sämtliche AP22F1B-Statiktests, Zählerregression, Architektur AP21B2 und AP21C.

## Bestandene ergänzende Regressionen

- JavaScript-Syntax: 55 Einheiten fehlerfrei.
- Fixtures: 6 Referenzfälle semantisch unverändert.
- AP22F1A-Schutzprüfung: 12 Hash-Schutzbereiche bestanden.
- Zählerregression: Migration, Messwerte, Messperioden, Dezimalkomma/-punkt und Berechnung bestanden.
- Architektur AP6/AP7/AP8/AP9/AP13/AP21/AP21B2: bestanden.
- AP21C Struktur/Kompatibilität: bestanden.
- AP13 Brief/Dokument: statisch bestanden; Chromium 8 von 8 bestanden.
- AP21B2 Navigation: statisch bestanden; Chromium 3 von 3 bestanden.
- AP20 Chromium: 4 von 5 bestanden; ausschließlich die historische Erwartung eines entfernten `data-global-billing-mode` scheitert.
- AP22F1A Chromium: 9 von 10 bestanden; ausschließlich die fest verdrahtete Referenztitel-Erwartung `AP22F1A` scheitert am aktuellen Titel `AP22F1B`.

## Historische, unverändert belassene Assertions

Gemäß Arbeitsregel wurden bestehende Tests nicht angepasst. Deshalb melden ältere Tests erwartete Konflikte mit später freigegebenen Zuständen:

- AP22F1A-Statik erwartet weiterhin `data-page-save-status` und die Kennung AP22F1A.
- AP19/AP20 erwarten weiterhin ein Modusfeld in der gelben Kontextleiste.
- AP11/AP14 erwarten frühere Navigationsgruppen und sichtbare Navigationsziele.
- AP19/AP20/AP21A/AP22B–AP22E enthalten fest verdrahtete frühere Paket- oder Designsystemversionen.
- AP22A–AP22D Chromium erwarten Designsystem 1.0.0 bis 1.3.0 statt des aktuellen 1.4.0.
- AP22E Chromium erwartet die damalige unveränderte Produktbasis V99.4.32 statt V99.4.35.

Diese Meldungen sind keine AP22F1B-Produktfehler und wurden nicht durch Änderungen an historischen Testdateien kaschiert. Das aktuelle Releasegate verwendet weiterhin deren fachlich relevante Schutzprüfungen und die neuen separaten AP22F1B-Tests.

## Schutzprüfungen

Hashgleich beziehungsweise normalisiert hashgleich bestätigt wurden:

- vollständiges Navigations-`aside`,
- globale Abrechnungskontextleiste,
- `js/billing-context.js`, `js/navigation.js`, `js/ui-navigation-pages.js`, `js/app.js`,
- `#billingPeriodSection` und `renderBillingPeriodSettings()`,
- `applyBillingContextToDom()` einschließlich Schreibschutz-Notice,
- `saveData()` einschließlich Dirty-State-Reset und Feedback,
- Persistenz, Migration, Backup/Restore, Archiv, Billing-Workflow, Berechnung, Export und Dokumentausgabe,
- Service-Worker-Funktionslogik nach Normalisierung der freigegebenen Cache-/Buildkennungen,
- `js/ui-individual-values.js` außerhalb des exakt freigegebenen Save-Button-Fragments.

## Bekannte verbleibende Punkte

Innerhalb AP22F1B besteht kein offener Umsetzungsfehler. Die Zeitraumsektion auf `start` ist ausdrücklich geschützt und bleibt Gegenstand eines möglichen späteren eigenen Arbeitspakets.
