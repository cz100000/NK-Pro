# Testbericht

- Vollständig leer stehende, inaktive Wohnung wird als Leerstandsfall erzeugt.
- Kein künstlicher Mieterdatensatz wird angelegt.
- Externe Einzelwerte nutzen den stabilen `caseKey` des Leerstandsfalls.
- Speicherung, Neuladen und Summenbildung erfolgen über bestehende `caseValues`-Datenwege.
- Wasserzähler der Leerstandswohnung werden über denselben Abrechnungsfall einbezogen.
- Datenschema 5 unverändert.
