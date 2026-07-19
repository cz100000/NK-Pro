# AP22F10B – Änderungsnachweis

## Oberfläche

- DOM-Inhalt ausschließlich innerhalb von `section#manuellewerte` ersetzt.
- Genau vier KPI-Kacheln ergänzt: Wasserverbrauch gesamt, erfasste Wasserzähler, Heiz- und Warmwasserkosten, Kostenabgleich.
- Rotes NK-Pro-Flammensymbol als freistehendes Linien-SVG eingesetzt; kein Euro-Symbol als Hauptsymbol.
- Wasser- und externe Kostenbereiche mit neutralen Tabellen, Status- und Differenzanzeigen umgesetzt.
- Dialoge für Wasserwerte, externe Einzelwerte, Import und bestätigte Vorjahresübernahme ergänzt.
- Fokusführung, Rückkehrfokus, Nur-Ansehen-Modus, Leer-/Hinweis-/Fehlerzustände und responsive Tabellenrahmen umgesetzt.

## Wasserfachlichkeit

- Stabile Fallableitung für Mieter, Privatanteil und Leerstand eingeführt.
- Kalt- und Warmwasserzähler pro aktivem Fall bereitgestellt.
- Veraltete oder nicht eindeutig zugeordnete Legacy-Zähler werden nicht in der operativen Tabelle angezeigt.
- Messwerte und Messperioden werden kanonisch geführt und bei bestehender Legacy-Bindung synchronisiert.
- Fallsubtotale und Gesamtverbrauch werden aus den Messperioden berechnet.
- Anfangsstand größer Endstand wird als Fehler behandelt; kein stiller Nullverbrauch.
- Wasserabgleich gegen `K002.gesamtverbrauch` mit Toleranz `0,01 m³` ergänzt.

## Externe Einzelkosten

- Additive `caseValues`-Struktur für eindeutige Abrechnungsfälle ergänzt.
- Manuelle Eingabe und Import für Mieter, Privatanteil und Leerstand umgesetzt.
- Unbekannte, mehrdeutige und doppelte Importzuordnungen werden blockiert.
- Summen und Differenzen werden gegen den Gesamtbetrag der Kostenart geprüft.
- Leerstandsanteile werden getrennt dokumentiert und nicht über künstliche Mieter abgebildet.

## Vorjahreswerte

- Kandidaten werden ausschließlich über stabile Zähleridentität bestimmt.
- Erstübernahme benötigt eine ausdrückliche Bestätigung.
- Fehlender Vorjahreswert, Zählerwechsel, mehrdeutige Identität, geänderte Zuordnung und bereits erfolgte Übernahme werden geschützt behandelt.
- Bestätigung und übernommene Werte werden auditierbar dokumentiert.

## Qualität und Regression

- Neue Qualitätsregel `NKP-PLAU-012` für den individuellen Gesamtwasserverbrauch ergänzt.
- Bestehende Regel `NKP-PLAU-006` nicht ersetzt oder umgedeutet.
- Schutztest mit 12 vollständigen Datei-Hashes sowie vier Teilbereichen ergänzt.
- Statischer Fach-/UI-Vertrag, Browsertest mit 17 Screenshots und Release-Metadatenprüfung ergänzt.

## Release-Metadaten

Version, Build-ID und PWA-Cache wurden nach bestandener Umsetzung auf `V99.4.45` / `99.4.45-ap22f10b` fortgeschrieben. Datenschema 5 blieb unverändert.
