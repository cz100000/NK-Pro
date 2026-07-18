# AP22F9B – Abschlussbericht technische Migration „Gesamtkosten“

## Ergebnis

AP22F9B wurde auf Basis von `NK-Pro_V99_4_43_AP22F8B_Vorauszahlungen_Korrektur1.zip` und der freigegebenen Planung `AP22F9A_Planungsartefakte_Korrektur1.zip` umgesetzt. Die Seite `Nebenkosten abrechnen → Gesamtkosten` entspricht dem freigegebenen Zielbild und dem Designstandard „NK-Pro UI Referenz 1.0“.

Die Produktversion wurde entsprechend der Releasevorgabe auf **V99.4.44** und die Build-/Cachekennung auf **`99.4.44-ap22f9b`** fortgeschrieben. **Datenschema 5 ist unverändert.**

## Umgesetzte Planungsentscheidungen

- Vier kompakte Kennzahlenkacheln oberhalb der Arbeitsbereiche: Gesamtkosten, aktive Kostenarten, vollständig erfasst und offene Hinweise.
- Drei flache, standardmäßig sichtbare Arbeitsbereiche anstelle der bisherigen geschlossenen Klappbereiche.
- Vollständiger Erhalt der 15 Spalten der Haupttabelle sowie aller Summen, Eingaben, Statuswerte und Aktionen.
- Verbindliche lokale Suche nach Kostenart und Kosten-ID direkt oberhalb der Haupttabelle.
- Neutrale Tabellen- und Summengestaltung ohne gelbe Eingabeflächen oder grüne Summenzeilen.
- Vollständiger rechter Tabellenabschluss; horizontaler Überlauf ausschließlich innerhalb der Tabellencontainer.
- Kompaktes 2×2-Kachelraster bei 620 px und 390 px.
- Deutsche Periodendarstellung `TT.MM.JJJJ` ausschließlich innerhalb der Gesamtkostentabelle.
- Hinweise, Leerzustand und Schreibschutzhinweis im normalen Dokumentfluss.

## Technische Speisung der Kennzahlen

Die Kacheln besitzen keine eigene Speicherung und keine eigene Fachlogik:

- **Gesamtkosten:** vorhandene Summe `gesamtbetrag` der bestehenden aktiven Kostenarten.
- **Aktive Kostenarten:** Länge der bereits bestehenden aktiven Kostenartenliste.
- **Vollständig erfasst:** Zählung der vorhandenen Ergebnisse `costActions.kostenStatus(k) === "Vollständig"`.
- **Offene Hinweise:** Anzahl der aktiven Kostenarten, deren vorhandener `kostenStatus()` nicht „Vollständig“ ist.

Die Anzeige wird bei jedem bestehenden Renderdurchlauf neu aus den produktiven Bestandswerten abgeleitet. Es wurden keine neuen Datenfelder, Berechnungen, Prüfregeln oder Statuswerte eingeführt.

## Unverändert gebliebene Fach- und Systemfunktionen

Unverändert sind insbesondere:

- Gesamtkosten-, Summen-, Zwischensummen-, Differenz-, Einheitspreis-, Verteilungs- und Umlagelogik;
- Datenmodell, Datenschema 5 und Datenebenenvertrag;
- Kostenarten-, Vorauszahlungs- und Mietverhältnislogik;
- Speichern, Neuladen, Persistenz und Browser-Wiederanlauf;
- Migration, Backup, Restore, Rollback und Archivierung;
- Qualitäts- und Plausibilitätsregeln;
- Abrechnungsstatus und Schreibschutzlogik;
- Brief-, Dokument-, Export- und Drucksystem;
- Navigation, NK-Pro-Seitenkopf und globale Abrechnungskontextleiste;
- alle bereits migrierten Seiten.

## Produktive Änderungen

Die eigentliche Seitenmigration liegt ausschließlich in den freigegebenen Bereichen von:

- `index.html` – nur Abschnitt `section#einstellungen` einschließlich der zwei zugehörigen Dialoge;
- `assets/app.css` – neuer, eng mit `#einstellungen` präfixierter AP22F9B-Block;
- `js/ui-costs.js` – Renderer und lokaler UI-Zustand der Gesamtkostenseite;
- `js/ui-bindings.js` – exakt zwei Suchbindungen.

Zusätzlich wurden ausschließlich die für das ausdrücklich verlangte Release V99.4.44 notwendigen Versions-, Build- und Cachemetadaten fortgeschrieben. Details stehen in `AP22F9B_DATEIAENDERUNGEN.md` und `AP22F9B_POSITIVLISTENABGLEICH.md`.

## Schutz- und Positivlistenstatus

- 13 vollständig geschützte Dateien: Hash unverändert.
- 5 teilweise geschützte Bereiche: Segment-/Normalisierungsprüfung bestanden.
- Allgemeine Projektdokumente außerhalb der Positivliste: unverändert zur Ausgangsbasis.
- Keine unerwartete produktive Änderung außerhalb der Seitenbereiche und Releasemetadaten.

## Tests

Die AP22F9B-Statik-, Schutz- und Browserprüfungen sind bestanden. Die funktionalen Regressionen für Vorauszahlungen, Abrechnungsübersicht, Mietverhältnisse, Zählerdomäne, Architektur und individuelle Werte sind bestanden. Persistenz/Backup, Migration/Restore, Referenzfälle, Dokumentexport und Brieflayout wurden browserseitig geprüft.

Der historische Gesamttest endet weiterhin am bereits in der unveränderten Ausgangsbasis vorhandenen Fehler:

`tests/ap20-asset-refresh-regression.test.cjs`  
`Versionsparameter fehlt für ui-bindings.js.`

Weitere alte Tests mit fest verdrahteten Vorversionen beziehungsweise inzwischen aufgehobenen UI-Annahmen wurden gegen die unveränderte Ausgangsbasis verglichen und zeigen dort identische Abweichungen. Sie stellen keine neue AP22F9B-Regression dar. Einzelheiten stehen in `AP22F9B_TESTBERICHT.md`.

## Reale Browsernachweise

Die sieben geforderten Zustände befinden sich in `AP22F9B_Screenshots/`:

1. Desktop Bearbeiten;
2. Desktop Nur-Ansehen;
3. geöffneter Kostenartendialog;
4. Leerzustand;
5. Hinweiszustand;
6. 620 px;
7. 390 px.

Ein Kontaktbogen liegt als `AP22F9B_Screenshots_Kontaktbogen.jpg` bei.

## Restrisiken und offene Punkte

Es bestehen keine neu eingeführten fachlichen Restrisiken. Offen bleiben ausschließlich historische, versionsgebundene Testannahmen der Ausgangsbasis. Diese wurden nicht durch Änderungen an geschützten zentralen Dateien umgangen.
