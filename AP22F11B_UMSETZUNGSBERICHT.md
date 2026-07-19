# AP22F11B – Umsetzungsbericht „Ergebnis der Abrechnung“

## Ergebnis

Die Seite `Nebenkosten abrechnen → Abrechnungsergebnis` wurde auf Basis der unveränderten V99.4.60 technisch auf das freigegebene AP22F11A-Zielbild migriert. Die Produktversion ist **V99.4.61**, das Datenschema bleibt **5**, der Datenebenenvertrag bleibt **1**.

## Umgesetzte Struktur

- vier Kennzahlen: Gesamtkosten, auf Mieter umgelegt, vom Vermieter zu tragen und noch zu klären;
- gemeinsame Ergebnistabelle für vier Mieterfälle und zwei Leerstandsfälle;
- eigener, fachlich aufgeschlüsselter Vermieterbereich für Privat-, Leerstands-, nicht umlagefähige und bewusst bestätigte Anteile;
- vollständige Differenzliste mit berechnetem Wert, Kontrollwert, Differenz, Einheit, Ursache, Status, Begründung und Aktionen;
- dauerhafte Kontrollgleichung sowie Gesamtstatus und Direkteinstiege.

## Differenz- und Entscheidungsmodell

Das neue Modul `js/billing-review.js` leitet Differenzen ausschließlich aus aktiven Kostenarten, Umlageschlüsseln, Berechnungsarten, Abrechnungsfällen und vorhandenen Datenquellen ab. Es enthält keine Aktivierungslogik über `K002`, `K006` oder Kostenartnamen.

Eine Akzeptanz verändert keine Ursprungswerte. Gespeichert werden stabile Differenzkennung, Prüfbereich, ursprünglicher Betrag, Einheit, Behandlung, Begründung, Bearbeiter, Status, Zeitpunkt, App-Version sowie Daten- und Berechnungssignatur. Ändert sich der zugrunde liegende Datenstand, wird die Entscheidung als **„Akzeptanz ungültig – erneut prüfen“** markiert. Ein Rücksetzen auf einen früheren Wert reaktiviert sie nicht automatisch.

## Korrekturweg

`Korrigieren` markiert die Differenz als „In Korrektur“ und führt zur verursachenden Eingabeseite. Die Ergebnis-Seite mutiert keine Gesamtkosten, Vorauszahlungen, Messwerte oder manuellen Einzelwerte. Verschwindet die Differenz nach einer Ursprungskorrektur, wird sie als „Erledigt durch Korrektur“ historisiert.

## Persistenz und Fehlerverhalten

Prüfentscheidungen verwenden die vorhandene Transaktions- und Persistenzschicht. Erfolg wird nur nach erfolgreichem Commit und Readback gemeldet. Bei einem simulierten Speicherfehler wird der Zustand zurückgerollt; Dialogauswahl, Begründung und Bearbeiter bleiben sichtbar.

## Zählersynchronisierung

Der in der V99.4.60-Baseline nachgewiesene Fehler, bei dem technisch identische aktive Messwerte durch die Ableseart wiederholt als neue Korrekturversionen angelegt wurden, wurde minimal behoben. Bestehende Historie wird nicht bereinigt oder umgeschrieben; lediglich weitere Dubletten werden verhindert.

## Gestaltung

Die reale NK-Pro-Navigation und die gelbe Abrechnungskontextleiste bleiben unverändert. Die Seite nutzt die breite Seitenschale, neutrale Tabellenköpfe, vollständige Tabellenrahmen, interne Scrollbereiche nur auf schmalen Ansichten, freistehende Linienicons und stets ausgeschriebene Textstatus.
