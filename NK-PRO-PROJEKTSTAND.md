# Projektstand V99.4.28 – AP21C

AP21C ist abgeschlossen. Die Seite „Individuelle Werte“ wurde visuell und strukturell konsolidiert; Navigation, Datenlogik und Persistenz blieben unverändert. Nächstes Paket: AP21D.

# Projektstand V99.4.26 / AP21B1

AP21B1 ist abgeschlossen. Die linke Navigation wurde als eigenständiges, klar abgegrenztes Paket umgesetzt. Sichtbar sind drei Hauptbereiche: „Projekt vorbereiten“, „Nebenkosten abrechnen“ und „Archiv“. Die Arbeitsweiche bleibt über Logo und Zurück-Button erreichbar; entfernte sichtbare Arbeitsschritte bleiben über ihre bestehenden Seitenschlüssel und Direkteinstiege kompatibel.

Betroffene Produktdateien: zehn. Nicht betroffen sind Fachlogik, Speicher-/Dirty-State, Persistenz, Migration, Snapshot, Archivfachlogik, Briefe, Druck und Export. Nächster geplanter Stand: AP21B2.

# NK-Pro – Projektstand

## Aktuelle Version

- Version: **V99.4.23**
- Arbeitspaket: **AP20**
- Datenschema: **5**
- Datenebenenvertrag: **1**
- Dokumentlayout: **4**

## Erreichter Stand

AP20 ersetzt verteilte und teilweise redundante Prüfoberflächen durch eine zentrale Regel- und Ergebnisarchitektur. 42 Regeln werden in acht fachlichen Prüfbereichen ausgewertet. Das Cockpit, kontextbezogene Fachseitenhinweise, Abschlussbereitschaft und Abnahmeprotokoll verwenden dieselbe Quelle. Technische Selbsttests und Releasekontrollen sind in der Systemdiagnose getrennt.

Bestätigungen sind einer Abrechnung, Regelinstanz und einem Fingerprint der Eingangsdaten zugeordnet. Relevante Datenänderungen öffnen den Punkt erneut. Blocker sind nicht bestätigbar. Im AP19-Ansichtsmodus bleiben sämtliche Änderungen gesperrt.

## Aktueller Korrekturstand

Korrekturstand 3 verhindert gemischte Browserstände aus altem Service-Worker-Cache und neuen HTML-Dateien. Die kritischen Zählerassets sind versionsgebunden; der Worker aktualisiert sich cachefrei und lädt die App nach Aktivierung einmal neu.

## Unverändert

Berechnungsformeln, Abrechnungsergebnisse, Arbeitsweiche, AP13-Brieflayout, Druck/PDF/Schwarzweiß, Schema und Datenvertrag wurden nicht fachlich verändert. Der Zählerbereich unter Objektvorbereitung bleibt DUMMY.

## Nächster Stand

AP21 ist offen und nicht Bestandteil dieses Releases.

## V99.4.29 – AP22A UI-Bibliothek
AP22A führt den zentralen Namensraum `nk-ui-*`, kanonische `--nk-ui-*`-Design-Tokens, eine JavaScript-Metadaten-Schnittstelle sowie Katalog und Migrationsmatrix ein. Bestehende Fachseiten und Altvarianten bleiben unverändert; die kontrollierte Migration folgt in separaten AP22-Paketen.
