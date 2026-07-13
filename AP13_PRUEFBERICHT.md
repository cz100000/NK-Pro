# AP13 – Test- und Prüfbericht

**Version:** V99.4.14  
**Datum:** 13. Juli 2026  
**Gesamtergebnis:** bestanden, mit einer transparenten externen Druckereinschränkung

## Automatisierte AP13-Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Statische AP13-Strukturprüfung | bestanden |
| Gemeinsames HTML/CSS in Vorschau und Druckfenster | bestanden |
| DIN-A4-Seitenmaß 210 × 297 mm | bestanden |
| Neun Spalten und vollständige Tabellenlinien | bestanden |
| Zahlungstext und Brieftext mit identischer Schriftgröße | bestanden |
| Explizite Ein-/Zweiseitenlogik | bestanden |
| Abschlussblock genau einmal am Dokumentende | bestanden |
| Vorauszahlungsanpassung in gleicher Tabellenvisualisierung | bestanden |
| Nachzahlung/Guthaben mit unveränderter Vorzeichenlogik | bestanden |
| Lange Empfängerdaten und lange Zusatztexte ohne Überlauf | bestanden |
| Skalierte Vorschau bei schmalem Viewport | bestanden |
| Kontroll-PDF Standard | 1 DIN-A4-Seite |
| Kontroll-PDF erweitert | 2 DIN-A4-Seiten |

## Abnahmekriterien aus der Gestaltungsspezifikation

| Nr. | Testfall | Prüfmethode | Ergebnis |
|---:|---|---|---|
| 1 | Einseitige Abrechnung mit Nachzahlung | Browserfall mit synthetisch angepasstem Ergebnis bei unveränderter Berechnungslogik | bestanden |
| 2 | Einseitige Abrechnung mit Guthaben | Standardfixture und Browserassertion | bestanden |
| 3 | Einseitig ohne optionalen Hinweis | Seitenbedingung und Kontroll-PDF | bestanden |
| 4 | Zweiseitig nur mit Zusatzhinweis | Browserassertion | bestanden |
| 5 | Zweiseitig nur mit Vorauszahlungsanpassung | Browserassertion | bestanden |
| 6 | Zweiseitig mit beiden Zusatzblöcken | Kontroll-PDF und Langtextfall | bestanden |
| 7 | Langer Name und lange Anschrift | Browserfall mit erweitertem Empfänger | bestanden |
| 8 | Mehrere/lange Kostenarten | umfangreiche Eingabequellen-Fixture und Tabellenüberlaufprüfung | bestanden |
| 9 | Lange variable Standardtexte | Browserfall mit mehreren Absätzen | bestanden |
| 10 | Verschiedene Bildschirmgrößen | Viewport- und Skalierungsprüfung | bestanden |
| 11 | PDF-Ausgabe | Chromium-PDF, A4-Seitenformat und Textinhalt geprüft | bestanden |
| 12 | Physischer Druck beziehungsweise Druckvorschau | Chromium-Druckmedium und Druck-DOM geprüft | Druckvorschau bestanden; kein physischer Drucker im Prüfsystem verfügbar |
| 13 | Farbdruck | farbige PDF-Renderings und Referenzabgleich | bestanden |
| 14 | Graustufendruck | Graustufenrendering auf Kontrast und Informationsverständlichkeit geprüft | bestanden |
| 15 | Sichtfenster-Anschriftenfeld | physische CSS-Position und Langadressfall geprüft | bestanden |

## Visueller Abgleich

Die ein- und zweiseitigen Kontrollausgaben wurden als PDF erzeugt, erneut gerendert und mit den finalen Referenz-PDFs verglichen. Geprüft wurden insbesondere:

- Briefkopf, Trennlinie und Informationsblock,
- Anschriftenfenster und Rücksendezeile,
- Titel-, Anrede- und Textabstände,
- Ergebnisleiste,
- Tabellenbreiten, Spaltenreihenfolge, Linien und Summenzeile,
- Hinweisbox und Zahlungstext,
- wiederholter Kopf auf Seite 2,
- Vorauszahlungsanpassung,
- Abschlussblock, Anlagenhinweis und Fußzeilen.

Erkennbare strukturelle Abweichungen aus dem Altstand wurden beseitigt. Inhalte und Beträge der Kontrollausgaben stammen aus den NK-Pro-Testdaten und müssen deshalb nicht den Musterwerten der Referenz-PDFs entsprechen.

## Fachliche Regression

Die vollständigen Referenz-, Zähler-, Architektur-, PWA- und Browserprüfungen wurden ausgeführt. AP13 besitzt keine neue Berechnungsroutine. Alle 13 Playwright-Projekte bestanden: 57 produktive Browsertests, dazu ein bestimmungsgemäß übersprungener optionaler AP11-Bildaufnahmefall. Wegen eines bekannten Zeitlimits des gebündelten Playwright-Gesamtprozesses wurden die Projekte zusätzlich vollständig in getrennten frischen Projektläufen ausgeführt. Die Nachzahlungs-/Guthabenentscheidung greift weiterhin auf das bestehende fachliche Ergebnis zu und verändert dessen Vorzeichen nicht.

## Verbleibende Einschränkung

Ein realer Ausdruck auf einem konkreten physischen Druckermodell konnte in der automatisierten Umgebung nicht durchgeführt werden. Für den Ausdruck müssen im Druckdialog DIN A4, 100 % Skalierung, deaktivierte Browser-Kopf-/Fußzeilen und aktivierte Hintergrundgrafiken verwendet werden. Das durch Chromium verwendete Druckmedium sowie die erzeugten A4-PDFs wurden vollständig geprüft.
