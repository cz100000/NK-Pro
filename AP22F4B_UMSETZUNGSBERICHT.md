# AP22F4B – Umsetzungsbericht

## Ergebnis
Die technische Migration der Seite **Objekt vorbereiten → Wohnungen** (`wohnungsverwaltung`) ist für Release **V99.4.39** abgeschlossen. Grundlage waren ausschließlich `NK-Pro_V99_4_38_AP22F3B_Objektdaten.zip` und `AP22F4A_Planungsartefakte_final.zip`.

## Umgesetzte Zielstruktur
- unveränderte produktive Navigation sowie unveränderte globale Kopf-/Werkzeug- und Kontextmechanik
- Tabellenkarte gemäß `NK-Pro UI Referenz 1.0`
- sechs vorhandene fachliche Spalten plus rechte Aktionsspalte
- nicht editierbare Wohnungs-ID
- unverändert editierbare Felder Bezeichnung, Etage/Lage, Wohnfläche, Zimmer und Bemerkung
- Suche über vorhandene Tabellenwerte
- Statusfilter ausschließlich auf Basis vorhandener wohnungsbezogener `UNIT_*`-Befunde aus `validateObjectStandard(state)`
- Ergebnissumme ohne künstliche Pagination
- bestehende globale Speicheraktion im Bearbeitungsmodus
- deaktivierte Eingaben, Aktionen und Speicherfunktion im Nur-Ansehen-Modus
- Handlungsbedarfs-, Schreibschutz- und Systemhinweise im normalen Dokumentfluss
- interner horizontaler Tabellen-Scroll bei schmalen Viewports ohne horizontalen Seitenüberlauf

## Fachliche Abgrenzung
Es wurden keine neuen Datenfelder, Persistenzwege, Migrationen, Berechnungen, Prüfregeln oder fachlichen Statusquellen eingeführt. Die fünf vorhandenen `setMasterNested('wohnungen', …)`-Schreibpfade bleiben unverändert erhalten. Die Wohnungs-ID bleibt ein reines Systemfeld. Der leere Prüfplatzhalter wurde entfernt.

## Releasefortschreibung
Die zentrale Anwendungsversion, App-/PWA-Metadaten sowie Service-Worker- und Cachekennungen wurden auf V99.4.39 beziehungsweise `99.4.39-ap22f4b` fortgeschrieben. Die ausdrücklich freigegebenen Paketdateien wurden ausschließlich hinsichtlich Paketname und Version angepasst.

## Visuelle Abnahme
Vier Zielzustände wurden automatisiert erzeugt und visuell geprüft:
1. Desktop vollständig
2. Desktop mit Handlungsbedarf
3. Nur ansehen
4. schmale Ansicht bei 390 px

Die aktualisierte, nicht produktiv eingebundene UI-Referenz befindet sich in `ui-reference/index.html`, Abschnitt `#units-page`.

## Ergebnisbewertung
Die AP22F4B-spezifischen statischen Prüfungen, Schutzprüfungen und Browsertests sind bestanden. Angrenzende Regressionen für Objektübersicht und Objektdaten sind bestanden. Historische, unverändert geschützte Tests mit fest verdrahteten früheren Releasebezeichnungen bleiben als historische Nachweise erhalten und sind nicht der Release-Gate für V99.4.39.
