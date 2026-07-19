# AP22F10G-B – Umsetzungsbericht

## 1. Auftrag und Abgrenzung

Die Seite „Individuelle Werte“ wurde als neue, durchgehende Arbeitsseite auf V99.4.52 umgesetzt. Es wurden keine Komponenten oder Logiken aus AP22F10F beziehungsweise V99.4.53 bis V99.4.57 übernommen.

Datenschema und Gesamtarchitektur bleiben unverändert bei **Schema 5**. Die Gesamt-JSON aus V99.4.55 wurde ausschließlich als Daten- und Browser-Testreferenz verwendet.

## 2. Steuerung durch „Gesamtkosten“

Die führende Entscheidung wird für jede Kostenart aus den vorhandenen Feldern `inNK`, `status`, `umlageschluessel` und ergänzend `berechnungsart` abgeleitet:

1. Nur Kostenarten mit `inNK = "Ja"`, vorhandener ID und Bezeichnung sowie ohne Ausschlussstatus sind aktiv.
2. Umlageschlüssel `Verbrauch` erzeugt einen Verbrauchsbereich.
3. Schlüssel beziehungsweise Berechnungsarten mit „manuell“, „individuell“ oder „direkter Eurobetrag“ erzeugen einen manuellen Bereich.
4. Alle übrigen Schlüssel gelten für diese Seite als automatisch und erzeugen keinen Erfassungsbereich.

Die Klassifikation liegt zentral in `js/billing-calculation.js`. UI und Prüfung greifen auf dasselbe Seitenmodell zu.

## 3. Verbrauchskostenarten

Für jede aktive Verbrauchskostenart werden ausschließlich Zähler mit passender `kostenId` berücksichtigt. Zusätzlich müssen sie abrechnungsrelevant, nicht ausgeschlossen, im Abrechnungszeitraum aktiv und einer regulären Abrechnungseinheit zugeordnet sein.

Die Tabelle enthält:

- Wohnung / Abrechnungsfall
- Zählerart
- Zählernummer
- Anfangsstand
- Endstand
- Verbrauch
- Gesamtverbrauch Wohnung
- Status
- Sonderfallaktion

Einzelverbrauch und Wohnungssumme werden aus denselben Anfangs- und Endwerten berechnet. Die Wohnungssumme wird nur ausgegeben, wenn alle der Wohnung zugeordneten erforderlichen Zähler vollständig und fachlich gültig sind. Andernfalls erscheint `–` und „Unvollständig“.

Für den realen Wasserfall entstehen Kalt- und Warmwasserzeilen allein durch die Kostenartkonfiguration `Verbrauch` und die `kostenId`-Zuordnung der Zähler. `K002` wird nicht als Aktivierungskriterium verwendet.

## 4. Manuelle Kostenarten

Für jede aktive manuelle Kostenart entsteht ein eigener Tabellenbereich mit sämtlichen regulären Abrechnungsfällen:

- Mietverhältnis
- Eigentümer-/Privatanteil
- Leerstand

Die Daten werden kostenart- und fallbezogen in `umlageInputs[costId].caseValues[caseKey]` geführt. Jeder Bereich zeigt dieselbe fachliche Summenkontrolle:

- Gesamtkosten laut „Gesamtkosten“
- Summe der Einzelwerte
- Differenz
- „Stimmt überein“ oder „Abweichung“

## 5. Abrechnungsfälle

Mietverhältnisse, Privatanteil und Leerstand werden durch die gemeinsame Funktion `individualValueCases` erzeugt. Es existiert keine parallele Eingabelogik für Sonderrollen. Rolle, Empfänger und Zeitraum werden in der regulären Zeile kenntlich gemacht.

## 6. Datensicherheit und Persistenz

### Entwurfsstabilität

Sichtbare Eingaben werden beim Tippen zunächst in einem seiteninternen Entwurf gehalten und gleichzeitig bei fachlich gültiger Änderung in die führenden Zustandswerte übertragen. Neu-Rendern, Filter, Dialoge und Seitenwechsel lesen wieder aus diesen Werten beziehungsweise dem Entwurf.

### Zahlenverarbeitung

`parseLocaleNumber` verarbeitet deutsches Dezimalkomma, Dezimalpunkt und Tausendertrennzeichen. Die Anzeige erfolgt über deutsche Zahlenformatierung.

### Speichern

Bereichsspeicherung erfolgt zeilenisoliert. Vor der Erfolgsmeldung werden:

1. alle sichtbaren Eingaben validiert,
2. der Zustand über die vorhandene Persistenzschicht gespeichert,
3. der Speicherwert zurückgelesen,
4. Integritätsprüfsumme und `lastSavedAt` mit dem aktuellen Zustand verglichen.

Bei Fehler bleibt der sichtbare Eingabewert erhalten und es erscheint eine Fehlermeldung statt einer Erfolgsmeldung.

## 7. Historie und Vorjahresübernahme

Die Vorjahresübernahme liest ausschließlich einen vorhandenen Vorjahressnapshot. Kandidaten werden über stabile Zähler-ID und nachvollziehbare Fallzuordnung ermittelt. Die Kostenart wird im Kandidaten mitgeführt.

Neue Audit-Einträge enthalten optional `costId`. Bereits vorhandene ältere Audit-Einträge ohne `costId` bleiben gültig. Dubletten werden anhand Zähler, Quelljahr und – soweit vorhanden – Kostenart unterdrückt.

Vorjahreskosten werden nicht in aktuelle manuelle Einzelwerte übernommen.

## 8. Oberfläche

Die Seite folgt der verbindlichen Reihenfolge:

1. Titel und Steuerungshinweis
2. vier Kennzahlenkacheln
3. dynamische Verbrauchsbereiche
4. dynamische manuelle Bereiche
5. Historie / Vorjahresübernahme
6. Prüfung und Zusammenfassung

Die linke Navigation und die gelbe Abrechnungskontextleiste wurden nicht umgestaltet. Tabellenköpfe sind neutral, Desktopkarten füllen die Inhaltsbreite und schmale Ansichten verwenden internen horizontalen Tabellen-Scroll.

## 9. Version und PWA

App-, Projekt-, Paket-, Manifest-, Service-Worker- und Cache-Metadaten wurden einheitlich auf **V99.4.58 / 99.4.58-ap22f10g-b** gesetzt.
