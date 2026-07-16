# AP22F1A – Verbindliche Entscheidungen

## Kontextleiste

Die gelbe Abrechnungskontextleiste zeigt in dieser Reihenfolge Objekt, vollständigen Abrechnungszeitraum und Status, gefolgt von bereits bestehenden fachlich zulässigen Kontextaktionen. Eine Modusangabe ist allgemeingültig ausgeschlossen. Das gilt für Bearbeiten, Nur ansehen, abgeschlossen, wieder geöffnet, Archiv und Korrektur.

Der Nur-ansehen-Zustand wird über die bestehende größere handlungsorientierte Schreibschutz-Notice, deaktivierte beziehungsweise ausgeblendete Bearbeitungsfunktionen und die dort verbleibende Aktion `Zur Bearbeitung öffnen` vermittelt. `js/billing-context.js` bleibt unverändert.

## Seitenschale und Seitenkopf

Alle 18 sichtbaren Ansichten verwenden genau eine zentrale Seitenschale und einen zentralen Seitenkopf. Die Breiten sind `narrow` 760 px, `default` 1180 px und `wide` 1440 px. Die Seiteninnenabstände betragen 32 px, unter 1280 px 24 px und unter 620 px 16 px. Jede sichtbare Ansicht besitzt genau ein sichtbares `h1`; der globale App-Kopf führt keinen Seitentitel.

## Schutzentscheidungen

Die Navigation bleibt vollständig bytegleich, einschließlich ihrer sichtbaren, aus der Ausgangsbasis übernommenen Versionsanzeige. Karten, Tabellen, Formulare, Dialoge, Klappboxen, lokale Metablöcke, statische Speicherstatus und Save-Aktionen werden nicht in AP22F1A bereinigt.

## Technische Ausnahmen

Die vor Änderung benannten Dateien `UI_UX_KOMPONENTENREGELN.md`, `js/app-runtime-config.js`, `js/service-worker-register.js` und `playwright.config.cjs` wurden ausschließlich aus der jeweils dokumentierten zwingenden Konsistenz- beziehungsweise Testregistrierungsnotwendigkeit angepasst.
