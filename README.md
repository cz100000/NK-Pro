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
