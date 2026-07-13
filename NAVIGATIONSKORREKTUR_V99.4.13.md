# Navigationskorrektur V99.4.13

## Anlass

Die in AP11 eingeführte Unterüberschrift „Weitere Abrechnungsschritte“ erzeugte innerhalb der Gruppe „Nebenkosten abrechnen“ eine fachlich nicht gewünschte Unterhierarchie.

## Änderung

- Unterüberschrift vollständig entfernt.
- CSS-Klassen und Spezialformatierung der ehemaligen sekundären Einträge entfernt.
- Alle zehn Abrechnungspunkte verwenden identische Ebene, Typografie, Zeilenhöhe, Icongröße, Trennlinien und aktive Markierung.
- Reihenfolge auf den tatsächlichen Arbeitsablauf ausgerichtet:
  1. Abrechnungsübersicht
  2. Mieter & Wohnungen
  3. Miete & Vorauszahlungen
  4. Kosten erfassen
  5. Manuelle & externe Werte
  6. Verteilung
  7. Prüfung
  8. Neue Vorauszahlungen
  9. Briefe
  10. Export

## Unverändert

Tab-IDs, `navigation.switchTab`, 13 UI-Controller, 99 Aktionskennungen, Fachzustand, Persistenz, Berechnungen, Dokumente, Archiv, PWA und Offline-App-Shell wurden nicht verändert.
