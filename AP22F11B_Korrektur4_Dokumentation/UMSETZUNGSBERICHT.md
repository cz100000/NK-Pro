# Umsetzungsbericht

**Stand:** 20.07.2026

## Prüfen und abschließen

- Alle fallbezogenen Resultate werden sichtbar, einschließlich Bestanden, Nicht anwendbar, Noch nicht ausgeführt und bereits entschiedener Abweichungen.
- Gruppierung und Reihenfolge werden aus der zentralen Navigation abgeleitet.
- Tabelle mit Prüfung, konkretem Ergebnis, Status, Entscheidung, Konsequenz und regelabhängigen Aktionen.
- Korrigieren-Sprünge führen zur verursachenden Seite und fokussieren den Zielbereich, soweit ein produktiver Selektor vorhanden ist.
- Vier kompakte weiße Kennzahlenkarten mit NK-Pro-Linien-SVGs dienen als Statusfilter.
- Kritische Mängel können nicht akzeptiert werden.

## Regelinventar

- 87 produktive Regeln vollständig dokumentiert.
- 45 Eingabevalidierungen, 24 fachliche Prüfungen, 12 Plausibilitätsprüfungen und 6 fachliche Hinweise.
- Suche und Filter nach Regeltyp, Bereich, Abschlussrelevanz und Akzeptanz.
- Neutrale Inventarkennzahlen; keine fallbezogenen Statuszahlen.
- Reine automatisierte Testfälle sind ausgeschlossen.

## Entscheidungs- und Abschlusslogik

- Bestehende finanzielle Differenzentscheidung bleibt führend.
- Allgemeine Regelbestätigungen nur außerhalb finanzieller Differenzen.
- Signaturänderung macht eine Entscheidung ungültig.
- Abschluss erst ohne kritische Mängel, ohne offene Entscheidungen, nach ausgeführten relevanten Prüfungen und bei versandbereiten Briefen.
- Abschluss friert den geprüften Stand ein und aktiviert den bestehenden Schreibschutz.

## Technik

- Neue Integrationsmodule: `js/quality-system-k4.js`, `js/ui-quality-k4.js`.
- Bestehende Kernmodule nur kompatibel erweitert; kein Schemawechsel.
- PWA-Build, Cache-ID und sichtbare Versionsmetadaten auf V99.4.65 aktualisiert.
