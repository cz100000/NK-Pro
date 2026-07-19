# AP22F11B Korrektur 3 – Umsetzungsbericht

## Ausgangsbasis

Alle Änderungen bauen ausschließlich auf `NK-Pro_V99_4_63_AP22F11B_Korrektur2_Vorauszahlungsanpassung_Analyse.zip` auf. Die produktive Zielversion ist **NK-Pro V99.4.64**.

## Ziel

Die bisherige Seite `Prüfung & Freigabe` wurde fachlich klar getrennt:

- Die operative Abschlussseite heißt jetzt **„Prüfen und abschließen“**.
- Das vollständige Regelinventar befindet sich als eigene rein lesende Seite unter **Analyse → Regelinventar**.
- Prüfregeln, Regelkennungen, Berechnungen, Finalisierung, Schreibschutz und Persistenz bleiben unverändert erhalten.

## Neue Seite „Prüfen und abschließen“

Die Seite ist handlungsorientiert aufgebaut:

1. vier Kennzahlen für blockierende Fehler, offene Prüfungen, Hinweise und Abschlussstatus,
2. Tabelle „Noch zu erledigen“ mit Ursache, Status, Detail und Direkteinstieg,
3. einblendbare Tabelle „Erledigte Prüfungen“,
4. klarer Abschlussbereich mit Voraussetzungen und zentraler Aktion `Abrechnung abschließen`,
5. automatische Aktualisierung nach relevanten Datenänderungen,
6. weiterhin vorhandener Prüfbericht.

Die Bearbeitung der Ursprungsdaten erfolgt ausschließlich auf den verursachenden Seiten. Die Abschlussseite verändert keine fachlichen Eingabewerte verdeckt.

## Regelinventar unter Analyse

Die neue Seite enthält:

- vier Kennzahlen zum Regelbestand,
- Suche nach Regel, Bereich und Datenquelle,
- Filter nach Fachbereich und Status,
- vollständige Regelregistry mit fachlicher Bezeichnung, technischer Kennung, Datenquelle, aktuellem Ergebnis und Status,
- bestehenden Detaildialog je Regel.

Technische Regelkennungen bleiben sichtbar, sind der fachlichen Bezeichnung jedoch nachgeordnet.

## Navigation

Unter `Nebenkosten abrechnen` wurde `Prüfung & Freigabe` in **„Prüfen und abschließen“** umbenannt. Der bereits vorhandene Bereich `Analyse` enthält nun:

1. Auswertungen
2. Regelinventar

Danach folgt unverändert der Archivbereich.

## Design

- breite bestehende Seitenschale,
- neutrale hellgraue Tabellenköpfe,
- interner Tabellen-Scroll auf schmalen Ansichten,
- sichtbare Statusbezeichnungen zusätzlich zu Farben,
- deaktivierte Abschlussaktion klar als nicht ausführbar erkennbar,
- vollständige Fokus- und Tastaturbedienbarkeit der vorhandenen Dialoge,
- unveränderte weiße Navigation und gelbe Abrechnungskontextleiste.

## Fachliche und technische Grenzen

Nicht geändert wurden:

- Datenschema 5,
- zentrale Regeldefinitionen und Regel-IDs,
- Berechnungslogik,
- Abschluss- und Entsperrlogik,
- Persistenz-, Readback-, Import- und Exportwege,
- Archiv- und Schreibschutz,
- Mieter-, Kosten-, Wasser-, Vorauszahlungs- und Ergebnisdaten.
