# AP22F11B Korrektur 2 – Umsetzungsbericht

## 1. Navigation

Der zuvor nicht sichtbare Arbeitsbereich **„Vorauszahlungen anpassen“** ist wieder regulär unter **„Nebenkosten abrechnen“** eingeordnet. Die Reihenfolge lautet dort nun:

1. Abrechnungsergebnis
2. Vorauszahlungen anpassen
3. Prüfung & Freigabe
4. Briefe

Zwischen **„Nebenkosten abrechnen“** und **„Archiv“** wurde der neue Navigationsblock **„Analyse“** ergänzt. Er enthält den Eintrag **„Auswertungen“**. Die zentrale Navigationsdefinition, Direkteinstiege, Kontextpfade und gespeicherten Klappzustände wurden entsprechend erweitert.

## 2. Vorauszahlungen anpassen – neues Seitenlayout

Die Seite wurde auf den verbindlichen NK-Pro-Designstandard umgestellt:

- breite NK-Pro-Seitenschale,
- unveränderte weiße Navigation und gelbe Abrechnungskontextleiste,
- vier Kennzahlenkarten,
- neutrale hellgraue Tabellenköpfe,
- rechtsbündige Geld- und Zahlenwerte mit tabellarischen Ziffern,
- vollständiger Tabellenabschluss auf Desktop,
- interner Tabellen-Scroll nur in schmalen Ansichten,
- klar hervorgehobene Primäraktionen,
- standardisierte Informations- und Regelbereiche.

Die automatisch ergänzten Sortiermarkierungen sind für die beiden Ergebnislisten sowie die neue Auswertungstabelle bewusst deaktiviert, weil diese Ansichten keine freigegebene Sortierfunktion besitzen.

## 3. Berechnungsregeln

Der vorhandene Regelbestand wurde erhalten und strukturiert in drei Bereiche gegliedert:

### A. Basisanpassung

- unterjährige Mietzeiten auf zwölf Monate hochrechnen,
- Sicherheitszuschlag,
- Rundung auf 1 €, 5 € oder 10 €,
- monatliche Mindeständerung,
- Erhöhungen und Senkungen beziehungsweise nur eine Änderungsrichtung.

### B. Preisprognose

Die fachlich getrennte Preisprognose wurde ergänzt:

- Preisprognose ein- oder ausschalten,
- allgemeine Preisänderung in Prozent,
- abweichende Preisänderung je Kostenart,
- Gültigkeitsdatum je Kostenart,
- Begründung beziehungsweise Quelle je Kostenart.

Ein leerer Kostenartwert übernimmt den allgemeinen Prozentsatz. Ein eingetragener Wert überschreibt ihn ausschließlich für die betreffende Kostenart.

### C. Ausgabe im Brief

- Wirksamkeitsdatum der Anpassung,
- keine Ausgabe, berechnete Werte oder manuelle Werte im Abrechnungsbrief.

## 4. Nachvollziehbare Berechnung

Die Berechnung trennt Verbrauchs- beziehungsweise Abrechnungseffekt und Preisänderung. Sie erfolgt je Mieter und Kostenart in dieser Reihenfolge:

1. Kostenanteil aus der aktuellen Abrechnung,
2. gegebenenfalls Hochrechnung auf zwölf Monate,
3. Preisprognose,
4. Sicherheitszuschlag,
5. Monatsbetrag,
6. Aufrundung gemäß 1-/5-/10-Euro-Regel,
7. Änderungslogik,
8. Mindeständerung.

Die Ergebnistabellen weisen die aktuelle Vorauszahlung, die Basis aus der Abrechnung, den Preiseffekt, den Sicherheitszuschlag und den empfohlenen Endbetrag getrennt aus. Ursprungswerte werden dabei nicht verdeckt verändert.

## 5. Neuer Analysebereich

Die neue Seite **„Auswertungen“** ist zunächst eine rein lesende zentrale Übersicht. Sie zeigt:

- Gesamtkosten,
- auf Mieter umgelegten Betrag,
- vom Vermieter zu tragenden Betrag aus dem bestehenden Prüfmodell,
- Saldo der Mieterabrechnungen,
- Kostenanteil, Vorauszahlungen, Korrekturen und Saldo je Mietverhältnis.

Sie führt keine Schreibaktion aus und verändert keine Abrechnungsdaten.

## 6. Version und Cache

App-, Manifest-, Projekt-, Paket- und PWA-Version wurden auf `V99.4.63` angehoben. Die neue Build- und Cachekennung lautet `99.4.63-ap22f11b-k2`, damit das geänderte Layout und die neue Navigation auch bei statischem Hosting zuverlässig aktualisiert werden.
