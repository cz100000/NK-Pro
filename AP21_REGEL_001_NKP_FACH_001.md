# AP21 – Einzelprüfung NKP-FACH-001

## Regel

- **ID:** NKP-FACH-001
- **Titel:** Abrechnungszeitraum ist gültig
- **Status:** freigegeben, umgesetzt und getestet
- **Freigabe:** 16.07.2026

## Umgesetzte Fachlogik

Die Regel prüft jetzt:

1. Beginn und Ende sind vorhanden.
2. Beide Werte besitzen exakt das Format `YYYY-MM-DD`.
3. Beide Werte sind tatsächlich existierende Kalendertage.
4. Das Ende liegt nicht vor dem Beginn.
5. `meta.abrechnungsjahr` entspricht dem Jahr des Enddatums.

Teilperioden und jahresübergreifende Perioden bleiben zulässig. Es wurde keine pauschale Kalenderjahr- oder Zwölfmonatspflicht eingeführt.

## Oberfläche und Direkteinstieg

Der Direkteinstieg führt nun zur Abrechnungsübersicht und markiert `#billingPeriodSettings`. Der Bereich zeigt Abrechnungsjahr, Beginn und Ende. In Bearbeitung sind die Datumsfelder editierbar; in Ansicht und Archiv sind sie schreibgeschützt. Bei einer Jahresabweichung kann das Endjahr gezielt übernommen werden.

## Meldungen

Die Sammelmeldung wurde durch konkrete Fehlergründe ersetzt:

- Wert fehlt
- falsches Format
- unmögliches Kalenderdatum
- Ende vor Beginn
- Abrechnungsjahr stimmt nicht mit Endjahr überein

## Tests

`tests/ap21-rule-audit.test.cjs` deckt alle genannten Fehlerfälle sowie gültige Teil- und jahresübergreifende Perioden ab. Syntax-, Referenzdaten-, Zähler-, Architektur-, Inhalts- und Releaseprüfungen sind bestanden. Der App-Browserlauf konnte wegen der Hostrichtlinie dieser Umgebung nicht ausgeführt werden (`ERR_BLOCKED_BY_ADMINISTRATOR` bei lokaler beziehungsweise Loopback-Navigation); der Chromium-Prozess selbst startet fehlerfrei.
