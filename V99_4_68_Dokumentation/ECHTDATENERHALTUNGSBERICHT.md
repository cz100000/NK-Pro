# NK-Pro V99.4.68 – Echtdatenerhaltungsbericht

## Prüfergebnis

Der vollständige Echtdatenbestand wurde erhalten. Die Migration verändert keine stabilen IDs, löscht keine Teilnehmer und ersetzt keine Werte durch Demo- oder Testdaten.

## Nachgewiesene Erhaltung

- 7 Wohnungen unverändert vorhanden
- 20 Teilnehmer-/Platzhalterzeilen mit identischer ID-Reihenfolge
- 42 Kostenarten mit identischer ID-Reihenfolge
- vollständige Vorauszahlungsmatrizen erhalten
- `umlageInputs`, Wasserstände, Zählerstammdaten, Messwerte, Messperioden und Zuordnungen erhalten
- Brief- und Prüfkonfigurationen erhalten
- 4 Jahresarchive unverändert
- bestehende Prüfbestätigungen, Abschluss- und Wiederöffnungsmetadaten erhalten

## Zulässige Datenänderung

Nur M000 wurde in den drei aktiven Ebenen auf `2010-01-01` korrigiert. Archivstände blieben unberührt. Die Änderung ist mit einer eigenen Migrationskennung, Zeitstempel, Version, Umfang und Hinweis dokumentiert.

## Laufzeitprüfung

Der migrierte Bestand wurde in der echten Anwendung gestartet. M000 wurde regulär berechnet und in allen geprüften Folgepfaden erhalten. Der Gesamt-Kostenabgleich weist eine Verteilungsdifferenz von 0.00 EUR aus. JSON-Roundtrip, Snapshot, Wiederöffnung und Jahreswechsel sind bestanden.

## Prüfsummen

- Quelle: `582032d05bfc8217105f4cb12dbf452945b674c9c09ab3a4fa283f8f1aabe389`
- Migriertes Ziel: `c1f0a90fd96b465b709b9993299190d93a3f250824cefb047c851ec6a515007b`
- Archivstruktur Quelle/Ziel: `9d67f36902138d37ebb477b8225da723de437325142673736525999afdb80ecb`
