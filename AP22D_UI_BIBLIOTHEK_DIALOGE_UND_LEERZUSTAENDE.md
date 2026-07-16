# AP22D – UI-Bibliothek: Dialoge und Leerzustände

## Ziel und Abgrenzung

AP22D erweitert das zentrale `nk-ui-*`-System um Dialoge und standardisierte Inhaltszustände. Die Umsetzung verändert ausschließlich Darstellung, Semantik und Bedienverhalten der ausgewählten UI-Schalen. Fachaktionen, Berechnungen, Datenflüsse, Speicherung, Navigation, Abrechnungskontext, Briefe, Druck, PDF, Import und Export bleiben unverändert.

## Zentrales Dialogsystem

Die Komponente `nk-ui-dialog` besitzt die Größen `default`, `compact` und `wide` sowie die Variante `danger`. Header, Titel, Beschreibung, Inhaltsbereich und Aktionsbereich werden über `nk-ui-dialog__*` strukturiert. Die öffentliche Schnittstelle `NKProUIDesignSystem.dialog` stellt `open`, `close`, `sync` und `active` bereit.

Das System übernimmt:

- Fokus auf ein ausdrücklich markiertes Anfangselement oder die erste bedienbare Aktion,
- Fokusfalle innerhalb des obersten geöffneten Dialogs,
- Rückgabe des Fokus an den Auslöser,
- Escape-Schließen nur bei fachlicher Zulässigkeit,
- Hintergrundschließen nur bei ausdrücklicher Freigabe,
- zentrale Semantik, sichtbaren Fokus und responsive Darstellung,
- Weiterleitung des Schließens an vorhandene UI-Aktionen statt eigener Fachlogik.

Der Löschdialog ist besonders geschützt: Escape und Hintergrundklick schließen ihn nicht, der Anfangsfokus liegt auf der Codeeingabe und nicht auf der destruktiven Aktion.

## Migrierte produktive Dialoge

1. Neue Abrechnung anlegen
2. Nebenkostenabrechnung löschen
3. Einheitspreis bearbeiten
4. Kostenart hinzufügen
5. Prüfpunktdetails

## Zentrale Inhaltszustände

`NKProUIDesignSystem.states` stellt die Typen `no-data`, `not-created`, `filtered`, `loading`, `error`, `not-applicable` und `unavailable` bereit. `create` erzeugt einen Zustand, `render` setzt ihn in einen Zielcontainer. Rollen, Live-Region und `aria-busy` werden abhängig vom Zustand gesetzt.

Produktiv migriert wurden der leere Kostenarten-Suchzustand und der leere Filterzustand auf „Individuelle Werte“. Weitere Zustandstypen werden zentral bereitgestellt, jedoch noch nicht breit über Fachseiten verteilt.

## Schutzgrenzen

Bereiche unter `.letter-page`, `.brief-preview-host`, `.document-print-window` sowie ausdrücklich übersprungene Bereiche werden nicht automatisch migriert. Bestehende native `alert`, `confirm` und `prompt` außerhalb der fünf ausgewählten Dialoge bleiben unverändert.

## Folgeschritt

Nächstes Paket: **AP22E – UI-Bibliothek: Seitenschale, Layout und Komponenten-Sonderformen**.
