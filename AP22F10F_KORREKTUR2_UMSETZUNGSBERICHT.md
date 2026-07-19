# AP22F10F – Korrektur 2: Vorperiodenwerte Wasser

## Fehlerursachen

1. Die Übernahme war an einen eingebetteten Vorjahresdatensatz in `jahresArchiv` gebunden. In realen Beständen liegt die historische Reihe jedoch teilweise ausschließlich unter `waterMeterHistory`.
2. Ein bereits vorhandener Übernahmevermerk konnte eine erneute Reparatur blockieren, obwohl der aktuelle Anfangsstand weiterhin leer war.
3. Beim Schreiben wurde die erste Messperiode des Zählers gewählt, nicht zwingend die zur aktuellen Abrechnungsperiode gehörende Messperiode.

## Korrektur

- Fallback auf `waterMeterHistory` über Wohnungs-ID/Bezeichnung und Zählerart.
- Ermittlung des Werts für das unmittelbar vorherige Abrechnungsjahr.
- Veraltete Übernahmevermerke blockieren nur noch, wenn tatsächlich ein Anfangsstand vorhanden ist.
- Ziel ist ausschließlich die Messperiode, die den aktuellen Abrechnungszeitraum überlappt.
- Kalt- und Warmwasser bleiben getrennt.
- Manuell vorhandene Anfangsstände werden nicht überschrieben.
- Neue Endstände bleiben unverändert.
