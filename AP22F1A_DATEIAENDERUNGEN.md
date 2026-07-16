# AP22F1A – Dateiänderungen

## Markup und Styles

- `index.html`: konkurrierenden globalen Seitentitel entfernt; Kontextfeld Jahr durch vollständigen Zeitraum ersetzt; Modusfeld entfernt; 18 sichtbare Ansichten mit Schale, Header und H1 versehen; Assetkennung aktualisiert.
- `assets/app.css`: semantische Schalentokens, drei Inhaltsbreiten, Seiteninnenabstände 32/24/16 px, responsives Seitenkopfraster und kompakte Kontextleiste ergänzt; alte Modus-Selektoren entfernt.

## Laufzeit

- `js/navigation.js`: `billingPeriodLabel` als read-only Provider aufgenommen und Kontextdarstellung ohne Modus umgesetzt.
- `js/app.js`: vorhandene Periodenformatierung an die Navigation übergeben.
- `js/ui-page-controller.js`: zentrale Shell-/Headerklassen und H1-Sicherung ergänzt.
- `js/ui-design-system.js`: Version 1.4.0, Komponentenmetadaten für Schale/Header/Kontext und Ausschluss der Kontextleiste aus generischen Listenupgrades.
- `js/app-runtime-config.js`, `js/service-worker-register.js`: ausschließlich Release-/Buildkennung.

## Referenz und Vertrag

Die Referenzbibliothek zeigt sämtliche Kontextzustände ohne Modusfeld. Die Nur-ansehen-Aktion befindet sich ausschließlich in der größeren Notice. Vertrags-, Anatomie-, Komponenten-, Abnahme-, Architektur-, Migrations-, Test- und Projektstandsdokumente wurden synchronisiert.

## Release

Paket-, Manifest-, Projekt- und Service-Worker-Kennungen wurden auf V99.4.34 / `99.4.34-ap22f1a` gesetzt. Die Service-Worker-Funktionslogik blieb hashidentisch nach Normalisierung der zwei Buildkonstanten.
