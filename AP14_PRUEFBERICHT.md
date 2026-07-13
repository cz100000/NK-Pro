# AP14 – Prüfbericht

## Ergebnis

**Status: bestanden**

AP14 wurde auf dem geprüften AP13-Abschlussstand V99.4.17 umgesetzt. Datenschema, Persistenz, Berechnungen, Zählerstandards und das AP13-Dokumentmodell blieben unverändert.

## Prüfungen

| Bereich | Ergebnis |
|---|---|
| JavaScript-Syntax | 51 Einheiten fehlerfrei |
| Referenzdaten | 6 Fälle semantisch unverändert |
| Zählerdomäne | Migration, Messwerte, Perioden, Zuordnungen, Snapshot und Strom-Dummy bestanden |
| Architektur AP6–AP14 | 9 statische Pakete bestanden |
| AP14-Browserfälle | 6/6 bestanden |
| AP14-Referenzbilder | 3 Ansichten erzeugt |
| gesamte Browserregression | 66 bestanden, 2 optionale Referenzerfassungen regulär übersprungen |
| AP13-Briefregression | 8/8 bestanden |
| PWA-Service-Worker | App-Shell und Cache `nk-pro-v99-4-17-ap14` bestanden |
| Release-Konsistenz / Prüfsummen | bestanden |

## Bestätigte AP14-Invarianten

- `wasser` öffnet ausschließlich den Zählerinventar-DUMMY.
- Der DUMMY verändert keine fachlichen Daten und speichert keine Werte; der vorhandene Tabellenfilter ist rein lokal und flüchtig.
- `verbraeuche` enthält die vollständige bisherige Verbrauchserfassung einschließlich Hauszähler, Ständen, Mietverhältnis-/Wohnungskontrolle, Historie und Plausibilität.
- Der neue Navigationspunkt steht direkt unter `Manuelle & externe Werte`.
- Aktive Zustände und Gruppenzuordnung sind korrekt.
- App-Schrift ist Segoe UI; Briefvorschau, Druckquelle und PDF-Modell bleiben Arial.
- Hilfe und Menü sind im bestehenden Kopfbereich sichtbar und per Tastatur schließbar.
- Startseitenkacheln verwenden bytegleiches SVG-Markup der korrespondierenden Navigationsgruppen.
- Bei 900 × 720 treten keine Überlagerung und kein horizontaler Seitenüberlauf auf.
- Es existiert keine neue Hauptbereich-Tab-Leiste und keine externe Abhängigkeit.

## Baseline-Hinweis

Der Ausgangsstand verwendete im Service Worker korrekt `nk-pro-v99-4-17`. Zwei ältere Regressionstests erwarteten noch `nk-pro-v99-4-16`; diese Testinkonsistenz wurde korrigiert. AP14 verwendet bewusst `nk-pro-v99-4-17-ap14`, damit eine bereits installierte AP13-PWA trotz identischer sichtbarer Versionsnummer sicher aktualisiert wird.

## Bekannte Einschränkungen

Das Zählerinventar bleibt absichtlich ein statischer DUMMY. Ein physischer Drucker beziehungsweise gerätespezifischer Druckertreiber war nicht Teil der automatisierten Prüfung; die vollständigen AP13-Vorschau-/Drucktests bestanden unverändert.
