# AP20 – Zentrales Prüf-, Plausibilitäts- und Freigabesystem

## Release

- Zielstand: **NK-Pro V99.4.23**
- alleinige technische Grundlage: **NK-Pro V99.4.22 / AP19**
- Datenschema: **5**, unverändert
- Datenebenenvertrag: **1**, unverändert
- Dokumentlayout: **4**, unverändert
- kontrollierter Abrechnungskontext aus AP19: vollständig erhalten

## 1. Ausgangsinventar

Vor der Umsetzung wurden die tatsächlichen Prüf-, Kontroll-, Warn-, Hinweis-, Freigabe-, Diagnose- und Regressionseinstiege des AP19-Quellstands automatisiert und manuell erfasst. Das vollständige Inventar steht in `AP20_PRUEFINVENTAR.json` und `AP20_PRUEFINVENTAR.md`.

Ergebnis: **176 bestehende Prüfstellen**.

| Entscheidung | Anzahl |
|---|---:|
| unverändert übernehmen | 0 |
| fachlich oder sprachlich überarbeiten | 8 |
| mit anderen Prüfungen zusammenführen | 26 |
| nur unter Voraussetzungen ausführen | 8 |
| als Hinweis oder Sonderfall darstellen | 6 |
| in die Systemdiagnose verschieben | 80 |
| ausschließlich als Regressionstest weiterführen | 47 |
| vollständig entfernen | 1 |

Die hohe Zahl technischer Prüfstellen entsteht insbesondere durch Selbsttest, Release-Audit, DOM-/CSS-/Layoutkontrollen, Snapshot-, Persistenz-, Sicherungs- und PWA-Prüfungen. Diese Prüfstellen bleiben technisch erhalten, werden aber nicht mehr als fachliche Aufgaben im Prüfungscockpit dargestellt.

## 2. Zentrale Prüfarchitektur

`js/quality-rules.js` ist die zentrale, seiteneffektfreie Regel- und Ergebnisquelle. `js/quality-assurance.js` bleibt als kompatibler Adapter bestehen und delegiert seine fachlichen Ergebnisse an die Registry. Dashboard, Fachseiten, Prüfungscockpit, Abschlusslogik und Abnahmeprotokoll greifen auf dieselbe Auswertung zu.

Die Registry enthält **42 stabile Regel-IDs**:

- 19 fachliche Pflicht- und Konsistenzregeln,
- 11 Plausibilitätsregeln,
- 6 Hinweis- und Sonderfallregeln,
- 6 technische Systemregeln.

Die vollständige menschen- und maschinenlesbare Übersicht steht in `AP20_REGELUEBERSICHT.md` und `AP20_REGELUEBERSICHT.json`.

Jede Regel beschreibt mindestens Regel-ID, Titel, Kategorie, Prüfgruppe, Datenquelle, Voraussetzung, Nicht-anwendbar-Logik, Ausführungszeitpunkt, Schweregrad, Blockierwirkung, Bestätigungsmöglichkeit, Zielseite, Lösungshinweis, Regelversion und zuständiges Modul. Jedes Ergebnis ergänzt betroffene Entität, aktuelle und Vergleichswerte, Ergebnistext, Bearbeitungszustand, Direkteinstieg und einen Fingerprint der relevanten Eingangsdaten.

## 3. Kategorien, Status und Bearbeitungszustände

### Kategorien

1. Fachliche Pflicht- und Konsistenzprüfung
2. Plausibilitätsprüfung
3. Fachlicher Hinweis oder Sonderfall
4. Technische Systemprüfung

### Sichtbare Status

- **Blockiert**: zwingender fachlicher Widerspruch; Abschluss nicht möglich.
- **Zu prüfen**: fachliche Auffälligkeit; bewusste Prüfung erforderlich.
- **Hinweis**: relevanter Sonderfall ohne Sperrwirkung.
- **Erledigt**: automatisch bestanden, behoben oder zulässig bestätigt.
- **Nicht anwendbar**: Regel gilt für die konkrete Konstellation nicht.
- **Technischer Fehler**: getrennt dargestelltes technisches Problem.

### Bearbeitungszustände

- automatisch bestanden
- automatisch nicht anwendbar
- noch offen
- geprüft und bestätigt
- als nicht anwendbar bestätigt
- nur gelesen
- behoben, sobald die erneute Auswertung keinen Befund mehr liefert

Bestätigt und behoben bleiben getrennte Sachverhalte. Ein bestätigter Plausibilitätsbefund bleibt im Nachweis sichtbar. Ein blockierender Befund ist nicht bestätigbar.

## 4. Bestätigungen, Begründungen und Datenänderungen

Bestätigungen werden additiv unter `state.meta.qualityRuleConfirmationsV2` gespeichert. Schema 5 und Datenebenenvertrag 1 werden dadurch nicht geändert. Der Schlüssel verbindet Abrechnung, Regelinstanz, betroffene Entität und Fingerprint.

Der Fingerprint umfasst die für den Befund verwendeten Werte und Vergleichswerte. Ändern sich relevante Eingangsdaten, stimmt der gespeicherte Fingerprint nicht mehr überein; die alte Bestätigung wird nicht mehr angewendet und der Prüfpunkt erscheint erneut offen. Bestätigungen können zurückgenommen werden.

Im AP19-Ansichtsmodus sind Bestätigen, Nicht-anwendbar-Markieren und Zurücknehmen visuell deaktiviert und zusätzlich durch `NKProBillingContext` technisch gesperrt. Direkte Aufrufe lösen `NKPRO_BILLING_READONLY` aus.

## 5. Zusammenführung und bedingte Ausführung

AP20 führt gleichartige Meldungen auf zentrale Regeln zurück, unter anderem:

- fehlende Kostenbeträge auf `NKP-FACH-010`,
- fehlende Mieternamen auf `NKP-FACH-004`,
- fehlende Wohnungszuordnungen auf `NKP-FACH-005`,
- Zeitraumfehler und Überschneidungen auf die zentrale Zeitraumanalyse,
- Umlage- und Summendifferenzen auf zusammengefasste Bereichsergebnisse,
- Vorauszahlungen auf eine zentrale Konsistenzanalyse,
- Eigentümeranteile getrennt als dokumentierter Hinweis oder unerklärter Restanteil.

Bedingte Prüfungen werden nur ausgeführt, wenn ihre Datenbasis und fachliche Voraussetzung bestehen. Dies betrifft insbesondere Personenzahl, aktive Tage, Verbrauchspflicht, Nullverbrauch, Vorauszahlungserwartung und Vorjahresvergleiche. Fehlt eine Vergleichsgrundlage, entsteht kein Fehler.

## 6. Zentrale Seite „Abrechnung prüfen“

Der Navigationspunkt „Prüfung“ ist ein produktives Cockpit mit vier Statuskarten und acht fachlichen Gruppen:

1. Objekt und Abrechnungszeitraum
2. Wohnungen und Mietverhältnisse
3. Kosten und Kostenarten
4. Verbräuche und Zählerstände
5. Vorauszahlungen und Korrekturen
6. Umlage und Summen
7. Briefe und Ausgabe
8. Abschluss

Die Gruppen zeigen Blocker, offene Plausibilitäten, Hinweise, erledigte Punkte, verständliche Zusammenfassungen und aufklappbare Details. Statusfilter, Detaildialog, Regelübersicht und Nachweis bestätigter Punkte verwenden dieselben Ergebnisobjekte.

Ohne geöffneten AP19-Abrechnungskontext wird keine Abrechnung ausgewählt. Im Ansichtsmodus bleibt das Cockpit vollständig lesbar, aber unveränderlich.

## 7. Fachseitenintegration und Direkteinstiege

**15 vorhandene Fachseitenbereiche** mit `data-section-role="validation"` erhalten eine kompakte, kontextbezogene Zusammenfassung. Sie zeigt nur die zur Seite gehörenden Befunde. Insgesamt sind **36 fachliche Regel-Direkteinstiege** produktiv mit Zielseiten verbunden.

„Zur Ursache“ navigiert zur Zielseite, öffnet gegebenenfalls den betroffenen Detailbereich, sucht nach Zielselektor oder Entitätsbezug, scrollt zum Ziel, setzt den Tastaturfokus soweit möglich und hebt den Bereich zeitlich begrenzt hervor. Status und Fokus werden nicht ausschließlich über Farbe vermittelt.

## 8. Vorjahres- und Vergleichsprüfungen

Sechs neue Vergleichsregeln sind produktiv angebunden:

- `NKP-PLAU-002`: Kostenart gegenüber vergleichbarem Vorjahressnapshot,
- `NKP-PLAU-006`: Hausverbrauch gegenüber Summe der Wohnungsverbräuche,
- `NKP-PLAU-007`: Verbrauch je Wohnung und Kostenart gegenüber dem Vorjahr,
- `NKP-PLAU-008`: auffällig identische Verbrauchswerte in mehreren Wohnungen,
- `NKP-PLAU-011`: ungewöhnlich hohes Abrechnungsergebnis relativ zu Vorauszahlungen,
- `NKP-HINW-004`: kein geeigneter Vorjahresvergleich möglich.

### Dokumentierte Schwellen

| Prüfung | Schwelle |
|---|---|
| Stromverbrauch | mindestens 35 % und mindestens 100 Einheiten Abweichung |
| Gas, Heizung oder Wärme | mindestens 40 % und mindestens 300 Einheiten |
| Wasser | mindestens 50 % und mindestens 10 Einheiten |
| sonstige Verbrauchsarten | mindestens 50 % und mindestens 10 Einheiten |
| Kostenart gegenüber Vorjahr | mindestens 30 % und mindestens 100 EUR |
| Haus-/Wohnungsverbrauch | mehr als 5 % und mehr als 0,5 Einheit |
| identische Verbrauchswerte | derselbe positive Wert in mindestens 3 Wohnungen |
| hohe Nachzahlung/Gutschrift | mindestens 1.000 EUR und mindestens 75 % der Vergleichsbasis; Mindestbasis 500 EUR |
| Summen-/Umlagetoleranz | 0,02 EUR |

Vorjahresdaten werden ausschließlich aus vorhandenen, älteren Archiv-/Snapshotdaten verwendet. Es werden keine Werte erfunden. Die primäre Zuordnung erfolgt über Wohnung, Kosten-/Verbrauchsart und vorhandene stabile Kennungen. Nicht ausreichend vergleichbare Daten führen zu „Nicht anwendbar“ beziehungsweise zum Hinweis „Kein geeigneter Vorjahresvergleich möglich“.

## 9. Abschluss und Abnahmeprotokoll

Vor der Finalisierung wird die zentrale Auswertung neu erzeugt. Die Abschlusslogik unterscheidet:

- **Nicht abschließbar** bei mindestens einem offenen Blocker,
- **Fachlich zu prüfen** bei offenen Plausibilitätsbefunden ohne Blocker,
- **Abschlussbereit** nach bestandenen Pflichtprüfungen und bearbeiteten Plausibilitäten.

Offene Plausibilitäten werden nicht durch eine allgemeine Abschlussbestätigung übergangen. Das Abnahmeprotokoll verwendet exakt dieselben zentralen Ergebnisse und besitzt keine zweite Freigabelogik.

## 10. Systemdiagnose

Technische Regeln werden getrennt unter „Datensicherung & System → Systemdiagnose“ dargestellt. Die sechs zentralen Diagnosegruppen umfassen Datenverträge, Serialisierbarkeit/Persistenz, Snapshot-/Sicherungsintegrität, Import/Export, PWA/Offline sowie Release-Audit/App-Selbsttest.

DOM-, CSS-, AP13-Layout- und interne Regressionstests bleiben ausschließlich in Test- und Projektdokumentation, soweit sie keine verständliche Nutzerhandlung besitzen. Technische Ergebnisse erscheinen nicht als fachliche Abrechnungsaufgaben.

## 11. UI, Barrierefreiheit und Responsive-Verhalten

AP20 verwendet das zentrale AP18-Interaktions- und Buttonsystem. Status enthalten Text und Symbolik; Fokusrahmen sind sichtbar. Aufklappgruppen, Filter, Detaildialog, Begründungsaktionen und Direkteinstiege sind tastaturbedienbar. Lange Texte umbrechen kontrolliert. Der schreibgeschützte Modus behält gute Lesbarkeit.

Neue CSS-Regeln decken Desktop, Laptop, schmale Fenster, geringe Höhe, Tablet- und sehr schmale Breiten ab. Die statischen Breakpoint- und Layoutprüfungen bestehen. Der serverlose Chromium-Harness besteht in normaler Desktopansicht. Die isolierte Chromium-Ausführung mit sehr schmalem Viewport beendet in dieser Hostumgebung den Rendering-Targetprozess; daher ist die reale Narrow-Viewport-Abnahme zusätzlich auf einem normalen Zielsystem auszuführen. Dies ist als Umgebungsgrenze dokumentiert und kein festgestellter JavaScript- oder Layoutfehler.

## 12. Unveränderte Fach- und Ausgabelogik

Nicht verändert wurden:

- Datenschema 5 und Datenebenenvertrag 1,
- Umlage-, Abrechnungs-, Rundungs- und Ergebnisformeln,
- Import-, Speicher-, Restore- und Archivgrundlagen,
- AP13-Brief-, Druck-, PDF- und Schwarzweißlayout,
- AP19-Bearbeiten-/Ansehen-/Schließen-Kontext,
- Arbeitsweiche,
- Zähler-DUMMY,
- PWA-Grundarchitektur und lokale Produktionsabhängigkeiten.

## 13. Nicht produktiv umgesetzte Prüfideen

Mangels sicherer Datenbasis wurden keine erfundenen Ergebnisse eingeführt. Dokumentierte Erweiterungsmöglichkeiten sind:

- allgemeine Verbrauch-je-Person-und-Tag-Bewertung ohne belastbare, zeitlich versionierte Personenzahl,
- sichere Erkennung geänderter Messmethode oder Verbrauchseinheit über alle Altdatenstände,
- vollständige Zählerwechsel-/Überlaufanalyse außerhalb der bereits strukturiert dokumentierten Zählerdaten,
- branchenweite Normwerte je Gebäudetyp, Bauzustand oder Wetterbereinigung,
- probabilistische Dubletten- und KI-Anomalieerkennung,
- pauschale Schwellen für alle Verbrauchsarten.

Diese Punkte sind keine verdeckten Dummy-Prüfungen; sie liefern produktiv keine erfundenen Meldungen.
