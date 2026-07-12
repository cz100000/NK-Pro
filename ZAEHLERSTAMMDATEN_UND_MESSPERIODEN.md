# NK-Pro V99.4.6 – Zählerstammdaten und Messperioden

## 1. Ausgangsanalyse V99.4.5

Der tatsächliche Projektstand verwendete drei parallele Zählerquellen:

- `waterMeters.readings` für Kalt-/Warmwasserstände je aktueller Mieterposition,
- `meterReadings.readings[kostenId]` für weitere verbrauchsabhängige Kosten,
- `objektStandard.zaehler[].zaehlerstaende` als additive AP4-Projektion.

Stammdaten, aktuelle Zuordnung und periodische Werte waren dadurch teilweise gemeinsam gespeichert oder aus Arraypositionen abgeleitet. Zählernummern waren nicht flächendeckend vorhanden und konnten daher keine technische Identität bilden. Nutzerwechsel konnten dieselbe physische Messstelle mehrfach projizieren. Der AP4-Snapshot war unveränderlich, enthielt aber noch keine eigenständige, versionierte Messwert- und Messperiodenstruktur.

## 2. Additiver Datenstandard

V99.4.6 ergänzt im Arbeitsstand die Struktur `zaehlerDaten`:

```text
zaehlerDaten
├── version: 1
├── zaehler[]
├── messwerte[]
├── messperioden[]
├── zuordnungen[]
└── zaehlerwechsel[]
```

Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert. Die Struktur ist eine fachliche Standardisierung innerhalb des bestehenden Schemas. Legacy-Felder bleiben für Laden, UI-Kompatibilität und verlustfreien Export erhalten.

## 3. Zählerstammdatenstandard 1

Ein Zählerstammdatensatz enthält mindestens:

- `meterId`/`zaehlerId` als stabile technische ID,
- Zählertyp, Bezeichnung, Zählernummer, Einheit und Status,
- Einbau- und Ausbaudatum,
- Standortbeschreibung,
- Objekt-, Gebäude-, Einheiten- und Verbrauchsstellenbezug,
- optional Nutzer- und Kostenbezug,
- Abrechnungsrelevanz, Abrechnungsrolle und Ausschlussgrund,
- Vorgänger- und Nachfolger-ID,
- erhaltene unbekannte und optionale Quellfelder,
- Standardversion und Legacy-Quellbindungen.

Für aus Legacy-Feldern abgeleitete Zähler wird die ID deterministisch aus physischer Einheit, Zählertyp und Kostenbezug gebildet. Sie ist unabhängig von aktuellem Nutzer, Arrayposition und Abrechnungsjahr. Manuell vorhandene stabile IDs werden beibehalten.

Zählernummern bleiben fachliche Merkmale. Doppelte nichtleere Zählernummern werden als Konflikt validiert, aber niemals als alleinige Primärschlüssel verwendet.

## 4. Messwertstandard 1

Messwerte sind eigenständige Datensätze mit:

- `messwertId`,
- `zaehlerId`,
- Ablesedatum und optional Messzeitpunkt,
- Messzeitraum von/bis,
- Wert und Maßeinheit,
- Ableseart und Herkunft,
- Erfassungszeitpunkt,
- Status, Plausibilitätsstatus und Abrechnungszeitraum-ID,
- Rolle als Anfangs-, Zwischen-, End-, Wechsel-, Schätz- oder Korrekturablesung,
- Referenz `ersetztMesswertId` bei Korrekturen,
- Quellschlüssel und Quellpfad zur verlustfreien Legacy-Synchronisierung,
- unbekannten Zusatzfeldern.

Eine Änderung eines synchronisierten Quellwerts erzeugt eine neue Revision. Der bisher aktive Messwert wird als ersetzt gekennzeichnet. Stornierte, korrigierte oder ersetzte Werte werden bei der Periodenbildung nicht aktiv verwendet, bleiben aber historisch gespeichert.

## 5. Messperiodenstandard 1

Messperioden werden aus zeitlich sortierten aktiven Messwerten desselben Zählers gebildet. Sie enthalten:

- eigene Perioden-ID,
- Zähler-ID,
- Beginn, Ende und Ablesedatum,
- Anfangs- und Endmesswert-ID,
- Anfangsstand, Endstand und berechneten Verbrauch,
- Maßeinheit,
- Status,
- Schätz-, Korrektur- und Überlaufkennzeichen,
- Abrechnungsrelevanz und Ausschlussgrund,
- zeitabhängige Zuordnungsanteile.

Ein negativer Verbrauch ist ohne dokumentiertes Überlaufmaximum ungültig. Gleiche Messwertfolgen dürfen nicht doppelt als abrechenbare Periode vorkommen. Schätz- und Korrekturwerte bleiben ausdrücklich gekennzeichnet.

## 6. Zeitabhängige Zuordnungen

`zuordnungen` trennt die aktuelle Stammdatenzuordnung von der historischen Nutzung. Eine Zuordnung besitzt:

- eigene Zuordnungs-ID,
- Zähler-ID und Zuordnungstyp `location` oder `usage`,
- Objekt-, Gebäude-, Einheiten- und Verbrauchsstellenbezug,
- optional Nutzer- und Vertrags-ID,
- Gültigkeit von/bis,
- Status, Herkunft und Quellschlüssel.

Standortzuordnungen werden aus den Zählerstammdaten erzeugt. Nutzungszuordnungen werden aus den Verträgen des Objektstandards abgeleitet. Bei einem Nutzer- oder Vertragswechsel ohne Zwischenablesung wird der gemessene Periodenverbrauch tageweise auf die überschneidenden Zeiträume verteilt und als geschätzte Zuordnung markiert. Die Tageszählung behandelt Vertragsenden einschließlich des angegebenen Datums, sodass unmittelbar aufeinanderfolgende Mietzeiträume keine künstliche Lücke erzeugen.

## 7. Zählerwechselstandard 1

Ein Zählerwechsel besitzt:

- eigene Wechsel-ID,
- ID des alten und neuen Zählers,
- Wechseldatum,
- Ausbau- und Einbauwert oder entsprechende Messwertreferenzen,
- Herkunft, Status und Hinweise.

Der alte Zähler behält seine ID und erhält `nachfolgerZaehlerId`. Der neue Zähler erhält eine neue ID und `vorgaengerZaehlerId`. Ausbau- und Einbaudatum werden widerspruchsfrei ergänzt. Verbrauch vor und nach dem Wechsel bleibt in getrennten Messperioden nachvollziehbar. Fehlende Wechselstände sind bei Abrechnungsbereitschaft kritisch, solange sie nicht als dokumentierte Schätzung behandelt werden.

## 8. Stromzähler-Dummy

Der Typ `electricity-dummy` wird vollständig in `zaehlerDaten.zaehler` gespeichert und kann Messwerte sowie Messperioden besitzen. Zentral erzwungen werden:

- `abrechnungsrelevant=false`,
- `billingRole="excluded"`,
- dokumentierter Ausschlussgrund,
- keine Aufnahme in `billingRelevantMeters`,
- `abrechnungsrelevant=false` für erzeugte Perioden,
- keine Berücksichtigung in `consumptionForCostAndTenant`,
- Aufnahme in die Snapshot-Ausschlussliste.

Ein gespeicherter Dummy-Messwert erzeugt damit keine Abrechnungsposition und keine Kostenverteilung.

## 9. Zentrale Validierung

`meter-validation.js` liefert strukturierte Befunde mit:

- Fehlercode,
- Schweregrad,
- Entitätstyp,
- Entitäts-ID,
- Datenpfad,
- verständlicher Meldung,
- Korrekturhinweis.

Geprüft werden unter anderem stabile und eindeutige IDs, Zählernummernkonflikte, Typ und Einheit, Lebensdauer, Messwertreferenzen, Datum und Zeitraum, aktive Doppelwerte, Einheitenkonsistenz, Rückwärtsstände, Periodendoppelungen, Zuordnungen, Zählerwechsel, fehlende Wechselstände und der Dummy-Ausschluss. Kritische Befunde verhindern Snapshot-Erstellung.

## 10. Migration und Kompatibilität

`metering-standard-v1` wird als additive Standardmigration über das vorhandene AP3/AP4-Fundament ausgeführt:

1. Bedarf erkennen,
2. Vor-Migrationssicherung mit unveränderlichen Metadaten erzeugen,
3. Datenkopie anlegen,
4. Legacy-Zähler in stabile Stammdatensätze überführen,
5. Legacy-Stände in eigenständige Messwerte überführen,
6. Zuordnungen und Perioden erzeugen,
7. strukturell validieren,
8. nur bei vollständigem Erfolg übernehmen.

Die Migration ist idempotent. Quellschlüssel verhindern wiederholte Duplikate. Unbekannte Felder und bestehende Archive, Backups, Recovery-Stände und Checkpoints werden nicht entfernt. Ein Fehler gibt den unveränderten Ausgangsstand zurück.

## 11. Abrechnungssnapshot 2

Neue Snapshots erhalten zusätzlich die Projektion `metering` mit:

- allen im Snapshot berücksichtigten Zählerstammdaten,
- relevanten Messwerten,
- Messperioden,
- zeitabhängigen Zuordnungen,
- Zählerwechseln,
- ausgeschlossenen Zählern und Gründen,
- allen Teilstandardversionen,
- Rekonstruktionsstatus und Hinweisen.

Die Projektion wird vor Prüfsummenbildung tief kopiert und anschließend mit der gesamten Snapshot-Hülle rekursiv eingefroren. Spätere Arbeitsstandänderungen können den Snapshot nicht verändern.

Snapshot-Version 1 bleibt als unterstütztes historisches Format lesbar. Sie erhält bei Validierung einen Hinweis auf den fehlenden vollständigen Zählerstandard, wird aber nicht fachlich auf Version 2 umgeschrieben.

## 12. Bekannte Grenzen

- Die bestehenden Formulare schreiben weiterhin in `waterMeters` und `meterReadings`; die kanonischen Strukturen werden zentral synchronisiert.
- Ohne Zwischenablesung kann ein Nutzerwechsel nur zeitanteilig geschätzt werden.
- Alte Snapshots können fehlende historische Messwertbezüge nicht nachträglich vollständig rekonstruieren.
- Zählerüberlauf wird nur verarbeitet, wenn ein Überlaufmaximum am Zähler dokumentiert ist.
- Allgemeine UI-Änderungen waren nicht Bestandteil dieses Arbeitspakets.
