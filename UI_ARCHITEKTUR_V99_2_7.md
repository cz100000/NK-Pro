# UI-ARCHITEKTUR – NK-Pro V99.2.7

## Ziel

V99.2.7 erweitert die gemeinsame statische Seitenarchitektur um eine klare Trennung von Stammdaten, Periodendaten, Eingabequellen und Berechnung. Die freigegebene flache Navigation aus V99.2.5 bleibt gestalterisch unverändert; Phase 2 erhält den fachlich beschlossenen dritten Unterpunkt.

## Tab-Liste

| ID | Titel | Aufgabe |
|---|---|---|
| `start` | Abrechnungsübersicht | Abrechnungen und Archiv |
| `mieterverwaltung` | Mieterverwaltung | zentrale Mieterstammdaten |
| `wohnungsverwaltung` | Wohnungsverwaltung | physischer Wohnungsbestand ohne Periodenstatus |
| `sicherung` | Datensicherung & System | Sicherung, Version, Audit |
| `dashboard` | Abrechnungsstatus | Arbeits- und Prüfstatus |
| `mieter` | Mieter & Wohnungen | periodische Zuordnung und Wohnungsstatus |
| `einstellungen` | Kostenarten & Einstellungen | Kostenidentität und Umlageregeln |
| `einnahmen` | Kaltmiete & NK-Vorauszahlungen | Zahlungseingaben |
| `wasser` | Zählerstände | physische Zähler und automatisch berechnete Verbräuche |
| `manuellewerte` | Manuelle & externe Werte | alternative Eingabequellen |
| `umlage` | Nebenkostenumlage | Berechnung, Ergebnisse und Nachweise |
| `vorauszahlungsanpassung` | Vorauszahlungsanpassung | künftige Vorauszahlungen |
| `qualitaet` | Qualitätsprüfung | fachliche und technische Kontrollen |
| `briefe` | Abrechnungsbriefe | ein-/zweiseitige Empfängerausgabe |
| `export` | Abrechnung exportieren | Ergebnisexport |

## Datenebenen

### Stammdaten

`state.stammdaten.wohnungen` beschreibt den unveränderlichen physischen Bestand. Statusfelder werden bei Normalisierung entfernt. `state.stammdaten.mieter` bleibt die zentrale Personenquelle.

### Abrechnungsdaten

`state.wohnungen` enthält die für die Abrechnung kopierten Wohnungsdaten einschließlich `status`. Dieser Status wird bei Stammdatenabgleich über die Wohnungs-ID erhalten und mit dem Jahresarchiv eingefroren.

### Eingabequellen

`manualInputModeForCost()` bestimmt je Kostenart die einzige aktive Quelle. `state.umlageInputs` bleibt als kompatibler Wertespeicher erhalten, wird aber ausschließlich über den Tab `manuellewerte` bearbeitet. `applyWaterMetersToUmlage()` schreibt nur bei Quelle `Zählerstände`.

### Zählersnapshots

`captureMeterReadingsSnapshot()` löst Zählerwerte von Arraypositionen. `restoreMeterReadingsAfterTenantSync()` stellt sie nach Stammdatenabgleich über Mieter-ID beziehungsweise Wohnungs-ID wieder her. `carryMeterEndToStart()` nutzt denselben Snapshot für den Jahreswechsel.

## Berechnungsfluss

1. Physische Wohnungsmenge und aktive Periodenmenge werden getrennt ermittelt.
2. Die Eingabequelle der Kostenart liefert Einheiten oder fertige Euroanteile.
3. Direkte und externe Euroanteile werden nicht erneut verteilt.
4. Verbrauchseinheiten werden mit Preis je Einheit beziehungsweise dem Kostenpool bewertet.
5. Ergebnisse werden in Mieter-, Eigentümer-/Privat- und offene Anteile getrennt.
6. Der Berechnungsnachweis stellt jede Wohnungszuordnung und Rundungsdifferenz dar.

## Briefarchitektur

`buildBriefPage()` erzeugt eine Hauptseite mit absolut positionierter Absender-, Fenster- und Datumszone. `buildPrepaymentPage()` wird nur bei einer tatsächlichen individuellen Änderung erzeugt. `briefMainPageOverflows()` misst das gerenderte A4-Element; bei echtem Überlauf wird ein Zusatzblatt erstellt. Einzelvorschau, Sammeldruck und Druckfenster verwenden dieselben HTML- und CSS-Regeln.

## Migration

Schema 5 führt folgende Normalisierung aus:

- Entfernen des Status aus Wohnungsstammdaten,
- Erhalt vorhandener Periodenstatuswerte,
- Ableitung der Eingabequelle aus bestehenden Zähler- und `umlageInputs`-Werten,
- Erhalt archivierter Originalwerte,
- Ergänzung stabiler Quell- und Fortschreibungsmetadaten.

## Prüfpfade

- `auditV992Structure()` prüft statische Tab-, Karten- und Klappboxstruktur.
- `releaseAuditReport()` prüft Release- und Migrationsregeln.
- `appSelfTestReport()` prüft Bedienfunktionen, Berechnung, Speicherzugriff und vorhandene Daten.
- Externe Browserprüfungen testen 7/5-Wohnungsbasis, M000, alle Eingabequellen, Zählersnapshots, Migration und Briefseiten.
