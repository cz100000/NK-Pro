# Umsetzungsbericht AP22F10G-B Korrektur 1

## Ausgangslage

Die Seite „Individuelle Werte“ aus V99.4.58 war funktional freigegeben, wich aber in drei visuellen beziehungsweise sicherheitsbezogenen Punkten vom gewünschten Zielbild ab:

- der Seiteninhalt war im Vergleich zu anderen NK-Pro-Seiten zu breit,
- der Tabellenrahmen besaß aufgrund einer älteren globalen `!important`-Regel tatsächlich keinen linken Innenabstand,
- Kalt- und Warmwasserzähler waren nicht mehr durch die früher verwendeten Farbpunkte unterscheidbar,
- bestätigte Vorjahresanfangsstände konnten wie normale Eingaben behandelt werden.

## Technische Umsetzung

### Kompakte Seitenbreite

Der Seitenrahmen wurde von `nk-ui-page-shell--wide` auf `nk-ui-page-shell--default` umgestellt. Damit beträgt die maximale Inhaltsbreite 1180 CSS-Pixel. Die responsive Darstellung und der interne Tabellen-Scroll bleiben erhalten.

### Tabelleninnenabstand

Die Tabellencontainer erhalten eine berechnete Breite von `calc(100% - 32px)` und einen horizontalen Karteninnenabstand von jeweils 16 Pixeln. Die ältere globale Regel `.individual-values-table-wrap { margin:0 !important; }` wird auf dieser Seite gezielt und ausdrücklich überschrieben. Dialogtabellen bleiben davon ausgenommen.

### Zählerfarbmarkierung

Die Kennzeichnung wird aus `meterType` abgeleitet:

- `cold-water` → „Kaltwasserzähler“ mit blauem Punkt,
- `hot-water` → „Warmwasserzähler“ mit rotem Punkt,
- andere Zählerarten → unveränderte textliche Darstellung ohne künstliche Sonderfarbe.

Es besteht keine Abhängigkeit von K002, einem Kostenartnamen oder einem Wasser-Sonderpfad.

### Schutz übernommener Anfangsstände

Ein Anfangsstand wird gesperrt, wenn im Gesamtbestand eine bestätigte Vorjahresübernahme für die stabile Zähler-ID dokumentiert ist. Das Eingabefeld wird deaktiviert, grau dargestellt und mit „Aus Vorjahr übernommen“ gekennzeichnet.

Die vorhandene Sonderfallaktion wurde erweitert. Im Zählerdialog muss die Option

`Übernommenen Anfangsstand als Sonderfall zur Bearbeitung freigeben`

bewusst bestätigt werden. Erst danach wird ausschließlich der gewählte Anfangsstand entsperrt.

Die Bestätigung wird optional unter `meta.individualValuesStartOverrides` dokumentiert. Dabei werden Zähler-ID, Quelljahr, übernommener Wert, Zeitpunkt, Bestätigungsart und Bemerkung gespeichert. Für dieselbe Zähler-ID entstehen keine Dubletten.

Die Freigabe selbst verändert keinen Zählerwert. Eine Wertänderung muss anschließend weiterhin über „Bereich speichern“ persistiert und erfolgreich zurückgelesen werden.

## Datensicherheit

- Kein automatisches Anlegen von Sonderfallfreigaben beim Import.
- Keine Änderung des Datenschemas.
- Keine Änderung an vorhandenen Wasserständen, manuellen Kosten oder Archiven.
- Keine automatische Überschreibung eines Anfangsstands.
- Keine Sonderfreigabe für andere Zählerzeilen.
- Kein Speichern ohne bestehende Rückleseprüfung.
