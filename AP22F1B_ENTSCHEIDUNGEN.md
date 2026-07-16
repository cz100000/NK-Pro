# AP22F1B – Umgesetzte Entscheidungen

## Statische Speicherstatus

Alle 14 produktiven `[data-page-save-status]`-Elemente und ihre statische Aktualisierung im Seitencontroller sind entfernt. AP22F1B führt weder Dirty-State noch dauerhafte Live-Speicheranzeige ein. Die zeitbezogene Rückmeldung nach `saveData()` bleibt unverändert.

## Kopf-Speichern-Aktionen

Genau ein Kopfbutton `Speichern` bleibt auf `objekt`, `mieterverwaltung`, `wohnungsverwaltung`, `qualitaet`, `einstellungen`, `mieter`, `einnahmen`, `manuellewerte`, `umlage`, `vorauszahlungsanpassung` und `briefe`.

Auf `archiv`, `sicherung` und `export` ist die allgemeine Kopfaktion entfernt. Die fachlich benannten Inhaltsaktionen dieser Seiten bleiben erhalten.

## Individuelle Werte

Der Kopfbutton ist der einzige führende Speicherweg. Aus `manualBody()` wurde ausschließlich der wiederholte `application.save`-Button entfernt. Reset, Import, Eingaben, Quellen, Summenabgleich, Filter, Zählerfunktionen und Berechnungen sind unverändert.

## Lokale Kopf-Metablöcke

Die `.page-header__period`-Blöcke auf `objekt`, `archiv`, `mieterverwaltung`, `wohnungsverwaltung`, `sicherung` und `wasser` sind ohne Ersatz entfernt. DUMMY- und Schutzkennzeichnungen im Inhalt von `wasser` bleiben bestehen.

## Ausgeschlossene und geschützte Bereiche

Nicht verändert wurden Navigation, globale Abrechnungskontextleiste, `#billingPeriodSection`, `renderBillingPeriodSettings()`, `applyBillingContextToDom()`, Schreibschutz-Notice und `Zur Bearbeitung öffnen`, `saveData()`, Dirty-State, Fachlogik, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv, Import/Export, Prüfregeln, Brief, Druck und PDF.

Die bearbeitbare Zeitraumsektion auf `start` bleibt einem eigenen späteren Planungs- und Freigabepaket vorbehalten.
