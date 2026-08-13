# Release Notes

## V99.4.71 – Professionelles Immobilien-Analysezentrum

- Drei klar getrennte Perspektiven: Nebenkosten & Abrechnung, Finanzen und Steuerliche Auswertung.
- Zentrale read-only Analyseengine V2 als gemeinsame Wahrheit für Dashboard, Details, Tabellen, Tooltips/Drill-down und Exporte.
- Kennzahlenbezogene Vergleichbarkeitsprüfung; `0`, fehlend, noch nicht erfasst, nicht berechenbar und nicht vergleichbar bleiben getrennte Zustände.
- Vier dominante KPIs pro Übersicht, große Hauptentwicklung, direkte Veränderungserklärung und maximal drei priorisierte Auffälligkeiten.
- Tiefenanalyse für Kosten, Wasser/Zähler, Teilnehmer, Wohnungen, Vorauszahlungen/Salden, Leerstand sowie getrennt nicht umlagefähige und tatsächlich nicht umgelegte Kosten.
- Symmetrische Preis-/Mengenzerlegung für geeignete Verbrauchskostenarten.
- Finanzperspektive mit Objektbetriebsergebnis und Eigentümerbelastung; Cashflow nur bei vollständigen tatsächlich datierten Zahlungen.
- Steuerliche Überleitung mit separatem Privat-/Leerstandsanteil; keine automatische Steuerklassifikation oder Gleichsetzung von Abrechnungsperiode und Steuerjahr.
- Rechter Desktop-Drill-down, responsive Vollbreitenansicht auf kleinen Geräten, Tastaturbedienung und erweiterter Tabellenmodus.
- Datenschema 5 unverändert; Korrektur-2-Kontextschutz, Archive, Zähler, Persistenz, Backup/Restore und Offlinefähigkeit geschützt.


## V99.4.69 – UI-, Archiv- und Gesamtkorrekturen

V99.4.69 schließt die visuelle Neugestaltung des Kosten- und Umlagenabgleichs und die zustandsabhängige Archivaktion ab. Die bestehende Fach-, Daten-, Prüf-, Export- und Persistenzarchitektur wird weiterverwendet; es wurde keine Parallelseite und keine zweite Entscheidungslogik aufgebaut.

Der Kosten- und Umlagenabgleich trennt Einnahmen, relevante Kosten, Vergleich, Erklärung der Differenz, Kontrollrechnung, fachlichen Status, Kostenartendetails, Zahlungsflüsse und Prüfentscheidungen. Auf breiten Ansichten steht der kompakte Ergebnis-/Statusbereich rechts; auf schmaleren Ansichten folgt er unterhalb der Hauptinhalte. Tabellen bleiben auf der Seite ohne unkontrollierten horizontalen Überlauf und scrollen nur intern, wenn die Detailbreite dies tatsächlich erfordert.

Die Archivaktion lautet für eine aktuelle Abrechnung `Abrechnung ins Archiv verschieben.` und für eine kontrolliert geöffnete Archivkorrektur `Archiv aktualisieren.`. Die Aktion aktualisiert den zugehörigen Archivstand mit erhaltener Periodenidentität. Der zuvor festgestellte Prüfsummenfehler wurde beseitigt, indem sämtliche Perioden- und Korrekturmetadaten vor der Snapshot-Prüfsummenbildung erzeugt werden.

Die Teilnehmerkorrektur aus V99.4.68 bleibt vollständig bestehen. M000 und generische Privat-/Eigenanteile bleiben reguläre Teilnehmer; ihre Nutzungsart ist nur eine Kennzeichnung. Finalisierte historische Archive werden nicht stillschweigend verändert. Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert.


## V99.4.68 – Systemweite Teilnehmerkorrektur Privatanteil/Eigenanteil

Dieses Release hebt die bisherige systemweite Sonderbehandlung privat oder eigentümerbezogen gekennzeichneter Datensätze auf. Solche Datensätze werden nun vollständig wie reguläre Abrechnungsteilnehmer verarbeitet. Die Kennzeichnung bleibt ausschließlich als Nutzungsart sichtbar.

Der Echtdatenfall `M000` / Erik Zimmermann / `W000.UG` wird in der Abrechnung 2023 mit 3.523,53 EUR Kostenanteil, 0,00 EUR Vorauszahlungen und 3.523,53 EUR Saldo regulär ausgewiesen. Er erscheint in Ergebnis, individuellen Werten, Briefauswahl, CSV/JSON/Excel-Ausgabe, Snapshot, Wiederöffnung und Jahreswechsel. Das Einzugsdatum `01.01.2010` ist in den drei aktiven maßgeblichen Datenebenen hinterlegt. Finalisierte Archivstände wurden nicht verändert.

Ein zusätzlicher generischer Browserfall `P900` mit Rolle `Eigenanteil` bestätigt, dass die Lösung nicht auf M000, einen Namen oder eine Wohnung fest verdrahtet ist. Kostenanteil, Vorauszahlungen, Korrekturen, Kaltmietkorrektur, Saldo, Dokument, Sammeldruck, Export, Snapshot, Wiederöffnung und Jahreswechsel wurden durchgängig geprüft.

Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert. Die Buildkennung lautet `99.4.68-private-participants`.


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