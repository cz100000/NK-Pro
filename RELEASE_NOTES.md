# Release Notes

## V99.4.65 – AP22F11B Korrektur 4 (Release-Kandidat)

- Konsolidiertes Prüf- und Regelsystem auf zwei getrennten Seiten.
- Moderne Statuslogik mit „Kritischer Abrechnungsmangel“ und „Entscheidung erforderlich“.
- 87 produktive Regeln vollständig inventarisiert.
- Bestehende finanzielle Differenzentscheidungen auf beiden Seiten konsistent.
- Abschluss, Brieffreigabe und Schreibschutz an nachweisbare Produktlogik gebunden.
- Datenschema 5 unverändert; keine Schemamigration.

Die bisherige Seite „Prüfung & Freigabe“ wurde als handlungsorientierte Seite **„Prüfen und abschließen“** neu gestaltet. Blockierende Fehler, offene Prüfungen, Hinweise und Abschlussstatus werden als Kennzahlen dargestellt. Offene Punkte führen direkt zur verursachenden Eingabeseite; erledigte Prüfungen bleiben einblendbar. Der Abschlussbereich zeigt die Voraussetzungen und deaktiviert die Finalisierung sichtbar, solange Blocker bestehen.

Das vollständige Regelinventar wurde unverändert als neue rein lesende Seite unter **Analyse → Regelinventar** eingeordnet. Suche, Fachbereichs- und Statusfilter sowie Regeldetails bleiben verfügbar. Datenschema, Regeldefinitionen, Regelkennungen, Fachlogik, Persistenz, Archiv und Schreibschutz sind unverändert.

---

# Release V99.4.43 – AP22F8B Vorauszahlungen Korrektur 1

Die Vorauszahlungsseite besitzt vier kompakte Übersichts­kacheln. Alle fallbezogenen Spalten der NK-Vorauszahlungsmatrix sind gleich breit. NK-Vorauszahlungs-Korrekturen und Kaltmietkorrekturen werden getrennt erfasst, summiert und unmittelbar in den zugehörigen „nach Korrektur“-Werten berücksichtigt. Der Brief weist beide Kategorien getrennt aus; nur die NK-Korrektur beeinflusst das Nebenkostenabrechnungsergebnis. Der sichtbare Bereich „Prüfung und Hinweise“ zeigt die zentralen Vorauszahlungsprüfungen einschließlich der neuen Trennungsprüfung.

Die Produktversion bleibt V99.4.43; Cache- und Buildkennung lauten `99.4.43-ap22f8b-k1`.

# Release V99.4.43 – AP22F8B Vorauszahlungen

Die Seite „Nebenkosten abrechnen → Vorauszahlungen“ entspricht jetzt NK-Pro UI Referenz 1.0. Drei getrennte Tabellen führen NK-Vorauszahlungen, Kaltmiete und Korrekturen/Gutschriften. Der vollständige Wohnungs- und Belegungsbestand bleibt sichtbar, während nicht abrechenbare Fälle weiterhin fachlich ausgeschlossen sind. Bestehende Gesamtsummen bleiben erhalten und werden neutral dargestellt.

Unverändert bleiben Datenschema 5, Navigation, Berechnungen, Datenwerte, Speicher-, Migrations-, Archivierungs-, Brief- und Druckwege. Die Produktversion lautet V99.4.43; die Cachekennung lautet `99.4.43-ap22f8b`.