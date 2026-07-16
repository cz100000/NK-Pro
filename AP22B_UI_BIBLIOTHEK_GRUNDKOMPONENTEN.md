# AP22B – UI-Bibliothek: produktive Grundkomponenten

## Ziel

AP22B überführt die ersten produktiven UI-Grundkomponenten kontrolliert auf das in AP22A geschaffene zentrale `nk-ui-*`-System. Fachlogik, Datenmodell, Berechnungen, Persistenz, Navigation, Archiv, Briefe und Export bleiben unverändert.

## Migrierte Komponentenfamilien

- Buttons
- Formularfelder
- Karten
- Klappboxen
- Statusanzeigen
- Hinweise

Tabellen und Listen sind ausdrücklich nicht Bestandteil dieses Pakets; sie folgen in AP22C. Toolbars, Dialoge und Leerzustände bleiben ebenfalls späteren AP22-Paketen vorbehalten.

## Technische Umsetzung

`js/ui-design-system.js` stellt mit Version 1.1.0 eine zentrale, rein darstellungsbezogene Migrationsschnittstelle bereit. `upgrade(root)` ergänzt kanonische Klassen an bestehendem Markup. Ein begrenzter `MutationObserver` erfasst ausschließlich neu eingefügte DOM-Teilbäume, damit auch dynamisch gerenderte Inhalte dieselben Komponentenklassen erhalten.

Die Schnittstelle verändert keine Fachdaten, löst keine Navigation aus und persistiert nichts. Bestehende Legacy-Klassen bleiben vorerst als Kompatibilitätsschicht erhalten. Ihre Entfernung ist erst nach vollständiger Migration und Gesamtregression zulässig.

## Statische Migration

Die 48 vorhandenen produktiven `page-section`-Klappboxen sind im HTML zusätzlich als `nk-ui-accordion` markiert. Inhaltsbereiche und Statuskennzeichnungen verwenden ergänzend `nk-ui-accordion__body` beziehungsweise `nk-ui-status`.

## Gestaltung

Die produktiven Komponenten verwenden die zentralen `--nk-ui-*`-Tokens für Farben, Abstände, Radien, Schatten, Fokus und Zustände. Spezialisierte Fachlayouts bleiben erhalten; insbesondere behalten Klappboxköpfe ihre bestehende Informationsstruktur.

## Abgrenzung

Nicht verändert wurden:

- Datenschema 5 und Datenebenenvertrag 1
- Abrechnungs- und Umlageberechnungen
- Zähler-, Mieter-, Kosten- und Archivfachlogik
- Navigation und Abrechnungskontext
- Brief-, Druck- und Exportlogik
- bestehende Regressionstests

## Folgeschritt

Nächstes Paket: **AP22C – UI-Bibliothek: Tabellen und Listen**.
