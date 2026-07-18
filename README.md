# NK-Pro V99.4.42 – AP22F7B Mietverhältnisse Abrechnung

AP22F7B migriert ausschließlich `Nebenkosten abrechnen → Mietverhältnisse` auf NK-Pro UI Referenz 1.0. Die periodengebundene Abrechnungskopie wird ohne Klappboxen als kompakter Datenstandsblock, führende Mietverhältnistabelle mit Lesedetails, nachgeordnete Wohnungstabelle und verständliche Sonderfallhinweise dargestellt. Fachlogik und Datenwege bleiben unverändert.

Prüfung:

```bash
npm ci
npm run release:check
npm run test:ap22f7b:browser
```

# NK-Pro V99.4.41 – AP22F6B Korrektur 1

Korrigierter Paketstand der Seite `Nebenkosten abrechnen → Übersicht`: normaler Seitenabstand ohne leeren Hinweisbereich, keine Zeitraum-Klappbox mehr, klar bezeichneter Zeitraumdialog und vollständig sichtbarer Navigationsabschnitt `Objekt vorbereiten` auch im Archiv-Ansichtsmodus. Fachlogik und Datenwege bleiben unverändert.

Prüfung:

```bash
npm ci
npm run release:check
npm run test:ap22f6b:browser
```

# NK-Pro V99.4.41 – AP22F6B Nebenkostenabrechnung Übersicht

AP22F6B migriert ausschließlich `Nebenkosten abrechnen → Übersicht` auf `NK-Pro UI Referenz 1.0`. Aktuelle und archivierte Abrechnungen stehen in einer kompakten gemeinsamen Tabellenstruktur mit Suche, Bestandsfiltern, Ergebniszählung und quadratischen Symbolbuttons ohne sichtbare Textbeschriftung oder Zeilenumbruch. Fach-, Status-, Speicher-, Lade-, Migrations-, Archivierungs-, Berechnungs-, Brief- und Druckwege bleiben unverändert.

Prüfung:

```bash
npm ci
npm run release:check
npm run test:ap22f6b:browser
```

# NK-Pro V99.4.40 – AP22F5B Korrektur 1

Aktueller Paketstand: kompakte Mietverhältnisse mit aufklappbaren Details und gemeinsamer schreibgeschützter Archivansicht. Siehe `AP22F5B_README.md`.

# NK-Pro V99.4.40 – AP22F5B Zähler-DUMMY und Mietverhältnisse

Aktueller Release mit migrierten Seiten **Objekt vorbereiten → Zähler** und **Objekt vorbereiten → Mietverhältnisse**. Zähler bleibt ein deutlich gekennzeichneter, rein statischer DUMMY ohne Speicherung oder Fachlogik. Mietverhältnisse verwendet den neuen Kennzahlen-, Filter- und Tabellenstandard, erhält aber sämtliche vorhandenen Felder und zentralen Datenpflegewege.

Prüfung:

```text
npm ci
npm run test:ap22f5b
npm run release:check
```

Datenschema 5 und Datenebenenvertrag 1 sind unverändert.

# NK-Pro V99.4.37 – AP22F2B Objektübersicht

Aktueller Release mit vollständig migrierter Seite „Objekt vorbereiten – Übersicht“. Die Seite zeigt eine kompakte Objektidentität, den Status der drei produktiven Vorbereitungsbereiche, genau eine nächste Aktion und vier Aufgaben-/Statuskarten. Kostenarten- und Doppelanzeigen entfallen; Zähler bleibt ein eindeutig gekennzeichneter DUMMY.

Prüfung:

```text
npm ci
npm run test:ap22f2b:static
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ap22f2b:browser
npm run release:check
```

Datenschema 5 und Datenebenenvertrag 1 sind unverändert.

# NK-Pro V99.4.28 – AP21C Individuelle Werte

Aktueller Release mit konsolidierter Arbeitsoberfläche für individuelle Werte. Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert.

# NK-Pro V99.4.26

Aktueller Stand: **AP21B1 – Navigation**. Die linke Navigation folgt der freigegebenen Referenz mit 256 px Desktopbreite, eigener Archivgruppe und Startzugang ausschließlich über Logo beziehungsweise Zurück-Button. Datenschema 5 und Datenebenenvertrag 1 sind unverändert.

Für die AP21B1-Abnahme: `npm run test:ap21b1`. Die vollständige Releaseprüfung wird über `npm run release:check` ausgeführt.

# NK-Pro V99.4.23

NK-Pro ist eine lokale, frameworkfreie PWA zur Vorbereitung und Durchführung von Nebenkostenabrechnungen.

## Aktueller Stand

**AP20 – Zentrales Prüf-, Plausibilitäts- und Freigabesystem**

- Anwendungsversion: 99.4.23
- Datenschema: 5
- Datenebenenvertrag: 1
- Dokumentlayout: 4
- Grundlage: V99.4.22 / AP19

AP20 führt 176 vorhandene Prüfstellen in eine dokumentierte Architektur mit 42 stabilen Regel-IDs über. Das zentrale Cockpit „Abrechnung prüfen“, Fachseitenhinweise, Abschlussprüfung und Abnahmeprotokoll verwenden dieselben Ergebnisse. Technische Prüfungen sind in der Systemdiagnose getrennt.

Der AP19-Abrechnungskontext bleibt verbindlich: Abrechnungen werden ausdrücklich mit **Bearbeiten** oder **Ansehen** geöffnet; im Ansichtsmodus sind auch Prüfbestätigungen technisch gesperrt. Der Zählerbereich unter „Objekt vorbereiten“ bleibt ein gekennzeichneter DUMMY.

## Start

`index.html` über einen statischen Webserver öffnen. Für die Offline-PWA ist ein sicherer Ursprung erforderlich.

## Prüfung

```text
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:contents
npm run test:ap20:harness
npm run test:release
```

Details: `AP20_ZENTRALES_PRUEF_PLAUSIBILITAETS_UND_FREIGABESYSTEM.md`, `AP20_PRUEFINVENTAR.md`, `AP20_REGELUEBERSICHT.md` und `AP20_PRUEFBERICHT.md`.
## Korrekturstand 1

Die ausgelieferte V99.4.23 enthält die Korrektur für den Datenstart bei einem rückläufigen Zählerstand. Der Datensatz wird geladen und die Auffälligkeit zentral als `NKP-PLAU-005` („Zu prüfen“) dargestellt.

## Korrekturstand 3

Die für Zählerberechnung und Ereignissteuerung maßgeblichen JavaScript-Dateien werden mit einer festen Build-Kennung geladen. Der Service Worker wird ohne HTTP-Cache aktualisiert und aktiviert den neuen Stand mit einem einmaligen automatischen Reload. Dadurch kann keine alte Zählerlogik mit dem aktuellen HTML gemischt ausgeführt werden. Ein zuvor falsch gespeicherter Wert wie `29774` lässt sich durch Eingabe von `297,74` sofort auf `31,74 m³` korrigieren und mit Enter speichern.

## Korrekturstand 2

Die Zählerstandstabellen berechnen Verbrauch, Zeilensumme und Gesamtsumme nun bereits während der Eingabe. Enter speichert den Wert zuverlässig. Dezimalkomma und Dezimalpunkt werden bei Zählerständen korrekt verarbeitet. Die Live-Vorschau schreibt erst beim bestätigten Commit in den Datensatz.

## V99.4.29 – AP22A UI-Bibliothek
AP22A führt den zentralen Namensraum `nk-ui-*`, kanonische `--nk-ui-*`-Design-Tokens, eine JavaScript-Metadaten-Schnittstelle sowie Katalog und Migrationsmatrix ein. Bestehende Fachseiten und Altvarianten bleiben unverändert; die kontrollierte Migration folgt in separaten AP22-Paketen.
