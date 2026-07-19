# AP22F10E Korrektur 1 – Löschfunktion aktuelle Abrechnung

## Fehlerursache
Die bisherige Löschaktion setzte lediglich Abschluss-/Ausblendungsmarker. Die eigentlichen Jahreswerte der offenen Abrechnung blieben im Arbeitszustand erhalten. Dadurch war die Aktion fachlich kein Löschen und konnte nach erneutem Laden oder weiteren Zustandsprüfungen wirkungslos erscheinen.

## Korrektur
- Jahresbezogene Arbeitsdaten werden über die bestehende zentrale Rücksetzlogik vollständig geleert.
- Danach wird der aktuelle Abrechnungsdatensatz geschlossen und aus der Übersicht entfernt.
- Objektstammdaten und Jahresarchiv bleiben unverändert erhalten.
- Abschlusskennzeichen werden entfernt.
- Löschjahr, Zeitpunkt und Grund werden nur als technische Nachweismarker gespeichert.
- Die Änderung läuft atomar über `stateAccess.transact` und wird dadurch dauerhaft persistiert.

## Prüfungen
- JavaScript-Syntaxprüfung bestanden.
- Versions- und Cachekennungen auf V99.4.52 / `99.4.52-ap22f10e-k1` aktualisiert.
- ZIP-Integritätsprüfung bestanden.
