# NK-Pro V99.4.5 – Objektstandard und Abrechnungssnapshot

**Stand:** 12. Juli 2026  
**Ausgangsversion:** V99.4.4  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1, unverändert  
**Objektstandard:** 1  
**Abrechnungssnapshot:** 1

## 1. Bestandsanalyse V99.4.4

Der vorhandene Produktivbestand war fachlich vollständig nutzbar, aber auf mehrere parallele Strukturen verteilt:

| Fachbereich | Tatsächliche Ausgangsstruktur |
|---|---|
| Einheiten | `wohnungen` und gespiegelt in `stammdaten.wohnungen` |
| Nutzer/Vertragspartner | `mieter` und gespiegelt in `stammdaten.mieter` |
| Nutzungszeiträume | Felder `einzug`, `auszug`, `aktiveTage`, `status` in Mieterdatensätzen |
| Eigentümer/Privat | fachliche Rolle `Eigentümer/Privat`, zusätzlich Brief-/Absenderdaten |
| Kostenarten | `kostenarten` mit Umlagefähigkeit, Berechnungsart, Umlageschlüssel und Betrag |
| Verteilungsgrundlagen | Wohnfläche, Personen, Personentage, Miettage, Wohneinheiten, Verbrauch sowie manuelle Werte |
| Vorauszahlungen | `vorauszahlungen`, Mieterfelder und abgeleitete Summen |
| Wasserzähler | periodische Zeilen in `waterMeters.readings` |
| sonstige Verbrauchswerte | kostenartenbezogene Zeilen in `meterReadings.readings` |
| manuelle Umlagewerte | `umlageInputs` |
| globale Historie | `waterMeterHistory` |
| Abrechnungszeitraum | `meta.abrechnungsjahr`, `meta.abrechnungsbeginn`, `meta.abrechnungsende` |
| historische Abrechnungen | begrenzte Datensätze in `jahresArchiv` |

Die Bestandsdaten besaßen bereits Snapshot-Grenzen, aber keine fachlich eindeutige Snapshot-ID, keine unveränderliche Snapshot-Hülle, keine Snapshot-Prüfsumme und keine versionierte, zentrale Objektprojektion. Die vorhandene Berechnung blieb deshalb die fachliche Quelle; V99.4.5 ergänzt eine additive, versionierte Projektion und eine unveränderliche Abrechnungshülle.

## 2. Architekturentscheidung

V99.4.5 führt keine neue Schemaversion ein. Die bestehenden Produktivfelder bleiben unverändert erhalten und werden nicht ersetzt. Zwei eingefrorene Fachmodule werden ergänzt:

- `js/object-standard.js`: additive Normalisierung, Zählerstandard und Objektvalidierung,
- `js/billing-snapshot.js`: Abrechnungsbereitschaft, Snapshot-Erstellung, Snapshot-Integrität und Legacy-Kennzeichnung.

`js/app.js` orchestriert bestehende Berechnung und UI. `js/archive.js` begrenzt weiterhin Archivdaten und validiert vollständige Snapshots. Persistenz, Migration sowie Backup/Restore bleiben in ihren V99.4.4-Modulen.

## 3. Verbindlicher Objektstandard 1

Der Objektstandard wird unter `objektStandard` abgelegt und besitzt `version: 1` sowie die Rolle `billingObject`. Er enthält:

- `objekt`: stabile Objekt-ID, Bezeichnung, Status und Rolle,
- `gebaeude`: Gebäude-ID, Objektbezug, Bezeichnung und Adresse,
- `einheiten`: Einheit-ID, Abrechnungseinheit, Gebäude-/Objektbezug, Typ, Status, Wohnfläche und Verteilungsgrundlagen,
- `eigentuemer`: Eigentümer-/Vermieter- und Absenderdaten soweit im Bestand vorhanden,
- `partner`: Nutzer, Mieter, Eigentümer und sonstige Vertragspartner mit stabiler Partner-ID und Rollen,
- `vertraege`: Vertrags-ID, Partner-, Einheiten- und Objektbezug, Rolle, Beginn, Ende, Ein-/Auszug und Status,
- `kostenarten`: Kostenart-ID, Bezeichnung, Umlagefähigkeit, Berechnungsart und Verteilerschlüssel-ID,
- `verteilerschluessel`: stabile Schlüssel-ID, Bezeichnung und Typ,
- `vorauszahlungen`: verlustfreie Projektion der bestehenden Vorauszahlungsdaten,
- `zaehler`: typisierte Zähler mit stabiler Zähler-ID, Zuordnungsebene, Einheit, Standort und Messwerten,
- `verbrauchsstellen`: vorhandene oder künftig ergänzte Verbrauchsstellen,
- `abrechnungszeitraeume`: Jahr, Beginn und Ende,
- `abrechnungseinstellungen`: abrechnungsrelevante Einstellungen und Zuordnungen.

Die Normalisierung ist additiv und idempotent. Bestehende Quellstrukturen und unbekannte optionale Felder werden nicht gelöscht. Leere vorbereitete Mietzeilen werden nicht als Vertragspartner oder Vertrag interpretiert. Das aktuelle Projekt bildet tatsächlich ein Objekt mit einem Hauptgebäude ab; weitere Gebäude bleiben durch die Struktur möglich, werden aber nicht künstlich erzeugt.

## 4. Zählerstandard und Stromzähler-Dummy

Jeder Zähler kann den Ebenen Objekt, Gebäude, Einheit, Nutzer oder Verbrauchsstelle zugeordnet werden. Bestehende Wasser- und sonstige Verbrauchsdaten werden in typisierte Zählerprojektionen überführt, ohne die bisherigen Berechnungsquellen zu ersetzen.

Der neue Typ `electricity-dummy` besitzt mindestens:

- `meterId`/`zaehlerId`,
- `bezeichnung`,
- `zaehlernummer`,
- `einheit` (Standard `kWh`),
- `standortbeschreibung`,
- Objekt-/Gebäudezuordnung,
- optional `einheitId` oder `verbrauchsstelleId`,
- `abrechnungsrelevant: false`,
- `billingRole: "excluded"`,
- einen eindeutigen Ausschlussgrund.

`billingRelevantMeters()` entfernt den Dummy aus der Berechnungsauswahl. Die Abrechnungsbereitschaft meldet einen kritischen Fehler, falls ein Stromzähler-Dummy widersprüchlich als abrechnungsrelevant gekennzeichnet wird. Der Snapshot führt ihn ausschließlich in `meterSelection.excluded`; er erzeugt keine Kosten, Umlagen oder Abrechnungspositionen. Da `objektStandard` Bestandteil von Arbeitsstand, Gesamtbackup, Restore und Snapshot ist, bleibt der Dummy in allen technischen Lebenszyklen erhalten.

## 5. Zentrale Abrechnungsbereitschaft

`validateBillingReadiness()` liefert automatisiert testbare Einträge mit `code`, `severity`, `path`, `message` und optionaler `entityId`. Kritische Fehler verhindern die Snapshot-Erstellung.

Geprüft werden insbesondere:

- Objektstandard und eindeutige Objekt-ID,
- gültiger und nicht umgekehrter Abrechnungszeitraum,
- eindeutige Einheiten- und Partner-/Vertrags-IDs,
- vorhandene Einheiten- und Partnerreferenzen,
- widerspruchsfreie Vertragszeiträume und unzulässige Überschneidungen,
- aktive Einheiten ohne zeitlich passende Nutzung als Hinweis,
- erforderliche Flächen und Verteilungsgrundlagen,
- gültige Kostenarten und Verteilerschlüssel,
- erforderliche abrechnungsrelevante Zähler und Anfangs-/Endstände,
- vollständiger Ausschluss von Stromzähler-Dummys,
- Vorauszahlungszuordnungen und Werteanzahl.

Hinweise bleiben sichtbar, blockieren aber nur dann, wenn sie fachlich als `error` klassifiziert sind.

## 6. Abrechnungssnapshot 1

Ein neuer Snapshot besitzt die Hülle `nk-pro-billing-snapshot` und enthält mindestens:

- eindeutige `snapshotId`,
- `snapshotVersion: 1`, Status `complete` und `immutable: true`,
- Objekt-ID und Zeitraum,
- Erstellungszeitpunkt und App-Version,
- Datenschema 5, Datenebenenvertrag 1 und Objektstandard 1,
- strukturiertes Validierungsergebnis,
- eingeschlossene und ausgeschlossene Zähler-IDs,
- vollständiges Berechnungsergebnis und Zusammenfassung,
- begrenzte Abrechnungsdaten einschließlich Objektstandard,
- FNV1A32-Prüfsumme über die gesamte Snapshot-Hülle ohne eigenes Integritätsfeld.

Die Snapshot-Hülle wird rekursiv eingefroren. Änderungen am aktuellen Arbeitsstand verändern den Snapshot nicht. Die Prüfsumme erkennt nachträgliche Manipulationen. Die bestehende Berechnung wird vor der Aufnahme ausgeführt; dadurch enthält der Snapshot die tatsächlich verwendeten Berechnungsergebnisse und Grundlagen.

## 7. Historische Abrechnungen

Vorhandene Jahresarchive werden nicht stillschweigend in vollständige Snapshots des neuen Standards umgeschrieben. Sie werden technisch begrenzt, ihre Facharrays bleiben unverändert und sie erhalten:

- Status `legacy-partial`,
- Vollständigkeit `historical-not-fully-reconstructable`,
- eine stabile Legacy-Snapshot-ID,
- einen ausdrücklichen Hinweis, dass eine vollständige Rekonstruktion des Objektstandards nicht garantiert ist.

Schema- und Vertragsangaben des historischen Datensatzes werden soweit vorhanden beibehalten. Ein vollständiger V99.4.5-Snapshot wird dagegen vor Archivierung immer per Prüfsumme validiert.

## 8. Migration, Sicherung, Restore und Rollback

Fehlt `objektStandard` oder besitzt er nicht Version 1, wird dies als additive, datenverändernde Migration `object-standard-v1` behandelt. Vor der Normalisierung erzeugt das V99.4.4-Fundament eine validierte Vor-Migrationssicherung, auch wenn das Datenschema bereits 5 ist. Quelle und Ziel bleiben Schema 5.

Die Projektion bewahrt unbekannte Felder und die bisherigen Fachstrukturen. Restore und Rollback arbeiten weiterhin auf vollständigen Datenständen; `objektStandard`, Stromzähler-Dummys und vollständige Snapshots werden deshalb automatisch mitgeführt. Fehlgeschlagene Schema- oder Archivmigrationen bleiben transaktional ohne Teilübernahme.

## 9. Kompatibilität

- Datenschema 5 bleibt unverändert.
- Datenebenenvertrag 1 bleibt unverändert.
- Bestehende V99.4.4-Daten werden beim Laden additiv ergänzt.
- Bestehende Gesamtbackups, Recovery-Daten, Vor-Migrationssicherungen und Restore-Checkpoints bleiben verwendbar.
- Bestehende Archivdaten bleiben in ihrer historischen Aussage unverändert.
- Einzelabrechnungs-JSON wird als formaler Snapshot exportiert und beim Import vor dem Entpacken validiert.
- Die sechs fachlichen Referenzfälle bleiben semantisch unverändert.

## 10. Bewusste Grenzen

- Die bestehenden Quellarrays bleiben aus Kompatibilitätsgründen führend; `objektStandard` ist in V99.4.5 eine verbindliche additive Projektion, noch kein vollständiger Ersatz aller UI-Formulare.
- Das reale Ausgangsmodell enthält ein Objekt und ein Hauptgebäude. Mehrgebäudige Bearbeitung ist strukturell vorbereitet, aber noch nicht als eigene UI vollständig ausgebaut.
- Historische Altarchive können fehlende frühere Vertrags-, Zähler- oder Einstellungsdetails nicht nachträglich rekonstruieren.
- Die FNV1A32-Prüfsumme dient der Integritätskontrolle, nicht einer kryptografischen Signatur oder rechtssicheren Langzeitarchivierung.
- Die physische Trennung dauerhafter Zählerstammdaten von periodischen Zählerständen bleibt ein späteres, eigenes Arbeitspaket.
