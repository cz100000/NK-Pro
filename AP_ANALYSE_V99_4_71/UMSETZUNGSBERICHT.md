# Umsetzungsbericht – V99.4.71

V99.4.71 wurde als produktive Weiterentwicklung der V99.4.70-Korrektur-2-Basis umgesetzt. Die zentrale Analyseengine wurde auf ein kennzahlenbezogenes Ergebnis-/Vergleichsmodell erweitert. Fehlende Werte, echte Nullwerte und nicht berechenbare Werte sind getrennt. Kostenvergleich, Wasser-/Preis-/Mengeneffekt, Teilnehmer-, Wohnungs-, Finanz- und Steuerableitungen verwenden dieselbe read-only Engine.

Die Oberfläche wurde auf vier dominante KPIs, eine Hauptentwicklung, direkte Veränderungserklärung, priorisierte Insights und kompakte Datenqualität reduziert. Detailanalysen sind thematisch statt als gleichgewichtete Kartenlandschaft organisiert. Auf Desktop öffnet der Drill-down rechts als fester Drawer; auf schmalen Ansichten wird er vollbreit.

Der Tabellenmodus enthält Suche, Sortierung, Gruppierung, Spaltensteuerung, Detailzeilen und Export. Der Steuerexport erzeugt getrennte Blätter für Übersicht, Einnahmen, Kosten, Privatanteil, Leerstand, Klassifikation, Berechnungsnachweise und Datenquellen.

Cashflow wird im Echtdatenbestand nicht errechnet, weil vollständige tatsächlich datierte Ein- und Auszahlungen fehlen. Steuerkategorie und Steuerjahr bleiben ohne explizite Regel offen. Es wurden keine fiktiven Werte ergänzt.
