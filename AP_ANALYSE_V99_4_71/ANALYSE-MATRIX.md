# Analyse-Matrix – V99.4.71

| Kennzahl/Analyse | Perspektive | Zentrale Datenquelle / Berechnung | Vergleichbarkeit | Drill-down / Darstellung | Datenlücke |
|---|---|---|---|---|---|
| Abrechnungskosten | NK | Summe aktiver NK-Kostenarten | periodisch + fehlende aktive Kostenwerte | Kosten / Zeitreihe | fehlende Kostenposition bleibt offen |
| Teilnehmeranteil | NK | zentrale Teilnehmer-Kostenanteile | Perioden- und Teilnehmerstruktur | Teilnehmer | keine View-Neuberechnung |
| Vorauszahlungen | NK | zentrale Vorauszahlungswerte | Perioden-/Teilnehmerstruktur | Salden | fehlender Wert ≠ 0 |
| Abrechnungssaldo | NK | Summe zentraler Teilnehmer-Salden | Perioden-/Teilnehmerstruktur | Salden | — |
| Kostenartenänderung | NK | `compareCosts()` | Kostenart, Schlüssel, Quelle, Periodenstatus | Ranking / Ursachen | neue Kostenart ohne +∞ % |
| Wasserverbrauch | NK | Kalt-/Warmwasser-Jahresdeltas | Messperiode + Datenabdeckung | Wasser / Wohnungen / Zähler | fehlende Messwerte transparent |
| Wasserpreis | NK | vorhandener Einheitspreis bzw. Kosten / belastbarer Verbrauch | beide Mengen-/Preisbasiswerte | Wasser | keine Scheingenauigkeit |
| Preis-/Verbrauchseffekt | NK | symmetrische Mengen-/Preiszerlegung | beide Perioden müssen Menge, Preis und Kosten liefern | Ursachenanalyse | sonst nicht berechenbar |
| Zählerqualität | NK | Zähler, Messwerte, Perioden, Zuordnungen, Wechsel | periodenspezifisch | Zählerpanel | Lücken als Hinweis, nicht automatisch Fehler |
| Teilnehmeranalyse | NK | zentrale Settlement-Ergebnisse | Teilnehmerstruktur | Teilnehmer-Drill | Privat bleibt Teilnehmer |
| Wohnungsanalyse | NK | aktuelle Objektstammdaten + historische Werte als Nachweis | Flächen-/Belegungsdaten | Wohnung | aktuelle Fläche hat Vorrang |
| Leerstand | NK/Finanz/Steuer | zentrale Leerstandsanteile/-tage soweit berechenbar | Datenabdeckung | eigener Bereich | nicht mit Privat vermischt |
| Nicht umlagefähig | NK/Finanz | echte nicht umlagefähige Kosten | fachliche Kostenklassifikation | eigener Block | getrennt von nicht umgelegt |
| Umlagefähig, nicht umgelegt | NK/Finanz | vorhandene, tatsächlich nicht verteilte Kosten | Verteilstatus | eigener Block | getrennt von nicht umlagefähig |
| Mieteinnahmen | Finanzen | erhaltene Kaltmiete vermieteter Teilnehmer | Perioden-/Teilnehmerstruktur | Einnahmen | Privatnutzung erzeugt keine fiktive Miete |
| Laufende Objektkosten | Finanzen | vorhandene Objektkosten ohne Finanzierung/Investitionen | Kosten-/Periodenstatus | Ausgaben | — |
| Objektbetriebsergebnis | Finanzen | Kaltmiete + echte sonstige Einnahmen + NK-Vorauszahlungen − laufende Objektkosten | zugrunde liegende Komponenten | Bridge / Zeitreihe | nicht als „Gewinn“ bezeichnet |
| Cashflow | Finanzen | ausschließlich tatsächlich datierte Ein-/Auszahlungen | Vollständigkeit Zahlungsdaten | Cashflow | im Echtdatenbestand nicht verfügbar |
| Steuerliche Einnahmen | Steuer | vorhandene Kaltmiete / Umlagen | zeitliche Zuordnung offen, sofern nicht definiert | Überleitung | keine automatische Steuerannahme |
| Steuerlich klassifizierte Aufwendungen | Steuer | nur explizit klassifizierte Positionen | Klassifikationsstatus | Überleitung | aktuell 0, weil keine explizite Regel vorhanden |
| Steuerlich ungeklärte Beträge | Steuer | vorhandene Kosten ohne explizite Steuerklassifikation | Klassifikationsstatus | Überleitung | bewusst offen |
| Privatanteil | Steuer | generische Nutzungsart + zentrale Kostenverteilung | Perioden-/Quellenstatus | Privatanteil-Drill | keine M000-Sonderberechnung |
