# Vergleichbarkeitskonzept – V99.4.71

## Grundsatz

Eine Veränderung wird erst berechnet, nachdem beide Kennzahlen fachlich auf Vergleichbarkeit geprüft wurden. `0` ist ein vorhandener numerischer Wert. `null` steht für fehlend/nicht berechenbar und darf nicht als Null interpretiert werden.

## Status

- **vergleichbar** – gleichartige, belastbare Periodenbasis.
- **eingeschränkt vergleichbar** – Vergleich möglich, aber mit transparentem Grund, z. B. Legacy-Periode, Sonderperiode, Arbeitsstand, geänderte Struktur oder geänderte Quelle.
- **nicht vergleichbar** – mindestens ein erforderlicher Wert fehlt oder die Datenbasis reicht nicht für eine belastbare Veränderung.

## Regeln

Berücksichtigt werden insbesondere Periodenlänge, Kalender-/Sonderperiode, Legacy-Status, laufender/erneut geöffneter Arbeitsstand, fehlende Werte, Teilnehmer-/Belegungsstruktur, Umlageschlüssel und Datenquelle.

Eine neue Kostenart erhält `Neu in dieser Periode` und keine unendliche Prozentänderung. Eine fachlich inaktive Kostenart wird nicht allein aus einem fehlenden Zielwert als weggefallen interpretiert. Ein fehlender Zielwert erzeugt weder −100 % noch eine absolute Veränderung. Ein echter Zielwert 0 kann dagegen bei belastbarem Ausgangswert korrekt −100 % ergeben.

Die direkte Browserverifikation enthält getrennte Testfälle für `missing → keine Veränderungszahl` und `echte 0 → echte −100 %`.
