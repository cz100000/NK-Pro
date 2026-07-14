# NK-Pro V99.4.22

NK-Pro ist eine lokale, frameworkfreie PWA zur Vorbereitung und Durchführung von Nebenkostenabrechnungen.

## Aktueller Stand

**AP19 – Produktive Bereichsübersichten und kontrollierter Abrechnungskontext**

- Anwendungsversion: 99.4.22
- Datenschema: 5
- Datenebenenvertrag: 1
- Dokumentlayout: 4
- Grundlage: V99.4.21 / AP18

Nach jedem normalen Start ist keine Abrechnung geöffnet. Abrechnungen werden ausschließlich über „Nebenkosten abrechnen – Übersicht“ ausdrücklich mit **Bearbeiten** oder **Ansehen** geöffnet. Archivierte Abrechnungen besitzen zusätzlich **Zur Korrektur öffnen**.

Die beiden Bereichsübersichten verwenden produktive Werte aus dem aktuellen Projektzustand. Der Zählerbereich unter „Objekt vorbereiten“ bleibt ein gekennzeichneter DUMMY.

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
npm run test:ap19:harness
npm run test:release
```

Die vollständige AP19-Beschreibung steht in `AP19_PRODUKTIVE_BEREICHSUEBERSICHTEN_UND_KONTROLLIERTER_ABRECHNUNGSKONTEXT.md`.
