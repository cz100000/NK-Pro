# AP8 – Modularisierte Anwendungsaktionen und fachliche Orchestrierung

## Ergebnis

V99.4.9 führt mit `js/application-actions.js` eine explizite, DOM- und speicherfreie Anwendungsschicht ein. Die bestehenden 13 UI-Controller behalten ihre 99 Aktionskennungen. Schreibende Kernaktionen aus den Bereichen Anwendung, Zustand, Objekt/Stammdaten, Abrechnung und Zähler werden nicht mehr unmittelbar aus den UI-Bindings auf große globale Funktionen aufgerufen, sondern über benannte Anwendungsaktionen vermittelt.

## Datenfluss

`DOM → ui-events.js → ui-controller.js → ui-bindings.js → application-actions.js → bestehende Fach-/Legacy-Funktion → zentraler Commit → Renderer`

Die Anwendungsschicht führt keinen zweiten Store, erzeugt kein HTML, greift nicht auf DOM oder Browser-Speicher zu und enthält keine parallele Abrechnungsberechnung.

## Aktionsgruppen

- `application`: Speichern, Reset
- `state`: kontrolliertes Setzen verschachtelter Werte
- `object`: Mietverhältnisse anlegen, archivieren, wiederherstellen; Stammdaten übernehmen; Wohnungsstatus und Stammdatenfelder ändern
- `cost`: Kostenkonfiguration, freie Kosten, Vorauszahlungsaktivierung, Mieterfreigaben
- `billing`: Finalisieren, Wiederöffnen, Periode/Jahr, manuelle/externe Werte, Vorauszahlungen und Anpassungseinstellungen
- `meter`: Wasser- und generische Messwerte sowie Wasserzählereinstellungen

## Zustandsgrenze

`NKProStateAccess` wurde um `transact()` erweitert. Der Pfad erstellt vor einer atomaren Änderung eine Rückfallkopie, führt optional eine Validierung aus, committet und rendert höchstens einmal und stellt bei Fehlern den vorherigen Arbeitszustand wieder her. `state` bleibt der einzige veränderliche Arbeitszustand.

## Inventar

| Kennzahl | V99.4.8 | V99.4.9 |
|---|---:|---:|
| app.js Bytes | 538.680 | 539.972 |
| app.js Zeilen | 9.014 | 9.026 |
| Top-Level-Funktionsdeklarationen | 654 | 655 |
| direkte `state`-Referenzen | 640 | 640 |
| heuristisch erkannte direkte Schreibzugriffe | 234 | 234 |

Die direkten Zugriffe in `app.js` wurden in diesem sicheren Zwischenschritt noch nicht mechanisch verschoben. Stattdessen wurde zuerst die produktive UI-Aufrufgrenze eingeführt. Eine weitere physische Extraktion ohne diese Grenze hätte hohe Regressionsgefahr erzeugt. Die verbleibenden Zugriffe sind als technische Schuld dokumentiert.

## Standards

Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandards 1 und Abrechnungssnapshot 2 bleiben unverändert. Historische Snapshots und Archive werden von der neuen Anwendungsschicht nicht verändert.
