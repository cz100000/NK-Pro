# AP10 – Jahreswechseldatenfluss

| Zustandsbereich | Behandlung im neuen Jahr |
|---|---|
| Objekt-/Stammdaten, Wohnungen, IDs, unbekannte Felder | unverändert übernommen |
| Mieter/Mietverhältnisse | übernommen; zeitliche Gültigkeit bleibt erhalten |
| Kostenarten, Umlageparameter, individuelle Freigaben | Struktur übernommen |
| jährliche Kostenbeträge und manuelle externe Werte | gezielt zurückgesetzt |
| Vorauszahlungsstruktur | übernommen; Vorjahres-/Anpassungswerte nach vorhandener Regel fortgeschrieben |
| Abrechnungsperiode | neu aus Jahr/Start/Ende erzeugt |
| Bearbeitungs- und Finalisierungsstatus | neuer Arbeitsstand; Abschlussstatus entfernt |
| Zählerstammdaten und stabile IDs | unverändert übernommen |
| Zähler-Endstände | als neue Anfangsstände übernommen, sofern vorhanden |
| neue Endstände | geleert, außer nachweislich manuell geschützte Werte |
| Zählerwechsel/Messperioden/Zuordnungen | über bestehende Zählermodule erhalten/normalisiert |
| Stromzähler-Dummys | erhalten; `billingRole=excluded`, `abrechnungsrelevant=false` |
| abgeschlossenes Vorjahr | über bestehenden Snapshot-/Archivpfad neu ergänzt, danach unveränderlich |
| bestehende Archive/Snapshots | unverändert erhalten |
| Dokument-/Exportdaten | keine parallele Neuberechnung; werden später aus dem neuen Arbeitsstand erzeugt |

`createBilling()` und `prepareNextYear()` sind atomare Aktionen. Der AP10-Test weist Einzelcommit, Erhalt unbekannter Felder, Dummy-Erhalt und vollständigen Rollback bei Fehlern nach.
