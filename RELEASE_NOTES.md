# Release Notes – NK-Pro V99.4.23

## AP20

- vollständiges Inventar von 176 bestehenden Prüfstellen mit Bewertungsmatrix,
- zentrale Registry mit 42 stabilen Regel-IDs,
- vier Kategorien, sechs sichtbare Status und getrennte Bearbeitungszustände,
- produktives Cockpit „Abrechnung prüfen“ mit acht fachlichen Bereichen,
- 15 kontextbezogene Fachseitenbereiche und 36 Regel-Direkteinstiege,
- Fingerprint-gebundene Bestätigungen, Begründungen und Nicht-anwendbar-Entscheidungen,
- automatische Entwertung veralteter Bestätigungen bei relevanten Datenänderungen,
- sechs Vorjahres- und Vergleichsregeln mit dokumentierten, fachartspezifischen Schwellen,
- Abschlussprüfung und Abnahmeprotokoll auf derselben zentralen Ergebnisquelle,
- technische Prüfungen in eigener Systemdiagnose,
- AP19-Ansichtsmodus einschließlich direkter Schreibsperre vollständig erhalten,
- Datenschema 5, Datenebenenvertrag 1, Berechnungsergebnisse und AP13-Ausgabelayout unverändert.

Abschluss: **Änderungen umgesetzt – NK-Pro V99.4.23**
## Korrekturstand 1

Ein rückläufiger Zählerstand ohne dokumentierten Überlauf wird beim Neustart nicht mehr als fataler Speicher- oder Migrationsfehler behandelt. Der Datensatz wird geladen; der Punkt erscheint im zentralen Prüfsystem als „Zu prüfen“.

## Korrekturstand 2

- Sofortige Verbrauchsberechnung während der Zählerstandseingabe.
- Sofortige Aktualisierung der Wasser- und Gesamtsummen.
- Enter speichert Zählerwerte zuverlässig.
- Dezimalkomma und Dezimalpunkt werden korrekt akzeptiert.
- Keine zusätzlichen Messwertrevisionen durch die reine Live-Vorschau.
- PWA-Cache: `nk-pro-v99-4-23-ap20-corr2`.
