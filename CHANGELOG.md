# Changelog

## V99.2.3 – Aufklappbare Workflow-Navigation

### Neu und angepasst

- Linke Navigation als aufklappbare Baumstruktur mit drei Hauptbereichen aufgebaut.
- Abrechnungsworkflow in vier nummerierte Phasen gegliedert.
- Abrechnungsjahr und Bearbeitungs-/Archivstatus direkt im Navigationszweig angezeigt.
- Aktiven Navigationspfad bei direkten und programmgesteuerten Tabwechseln automatisch geöffnet.
- Aufklappzustände lokal gespeichert.
- Abrechnungsnavigation ohne aktive Abrechnung gesperrt und in der Archivansicht auf den relevanten Zweig reduziert.
- Sichtbare Titel auf „Abrechnungsstatus“, „Abrechnung exportieren“ und „Datensicherung & System“ präzisiert.
- PWA-Cache auf `nk-pro-v99-2-3` erhöht.

### Unverändert

- Technische Tab-IDs, Datenmodell und fachliche Renderer.
- Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Archiv-, Export- und Migrationslogik.

## V99.2.2 – Praxisanpassungen aus dem Abnahmelauf

### Angepasst

- Im Tab „Mieter & Wohnungen“ den Bestandsabgleich in „Prüfung und Plausibilität“ verschoben und die separate erste Klappbox entfernt.
- Verbleibende Klappboxen in „Mieter & Wohnungen“ neu nummeriert und zentrale Schnellaktionen auf die neue Struktur umgestellt.
- Mieter-ID und Mietername ausschließlich in der Tabelle „Umlage pro Mietverhältnis / Wohnung“ größer dargestellt.
- Blauen Einleitungshinweis im Bereich „Kaltmieteinnahmen“ vollständig entfernt.
- Tabellen im Tab „Zählerstände“ horizontal bündig zum Referenztab „Kaltmiete & NK-Vorauszahlungen“ ausgerichtet.
- WORKBOOK um die fachliche Überarbeitung der Vorjahresübernahme und die noch zu entwickelnde Prüfroutine für Kaltmiete und NK-Vorauszahlungen ergänzt.
- PWA-Cache auf `nk-pro-v99-2-2` erhöht.

### Unverändert

- Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Archiv-, Export- und Datenmigrationslogik.
- Bestehende Platzhalter-Klappbox „Einmalige Korrektur / Gutschrift“ und deren späterer Fachauftrag.

## V99.2.1 – UI-Feinschliff nach Praxistest

### Angepasst

- Blaues Buttondesign der vorherigen Arbeitsoberfläche wiederhergestellt.
- Primäraktionen kräftig blau; Nebenaktionen weiß mit blauer Kontur.
- Verbliebene 1500-px-Maximalbreite aufgehoben und seitlichen Außenabstand reduziert.
- Horizontales Scrollen für breite Tabellen sichtbar und dauerhaft im Tabellenrahmen aktiviert.
- Tabellenzellen standardmäßig einzeilig gehalten, damit breite Datentabellen nicht künstlich in die verfügbare Breite gedrückt werden.
- Ausgewiesene Langtextzellen bleiben umbrechbar.
- PWA-Cache auf `nk-pro-v99-2-1` erhöht.

### Unverändert

- Fachliche Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Archiv- und Exportlogik.
- Zentrale V99.2-Seiten-, Header-, Kachel- und Klappboxarchitektur.

## V99.2 – Konsolidierte Darstellungsarchitektur für alle Tabs

### Neu und vereinheitlicht

- Zentrale Registrierung aller 14 Tabs über `TAB_DEFINITIONS`.
- Einheitlicher statischer Seitenrahmen je Tab mit globaler Kopfleiste, Tab-Kopf, Vier-Kachel-Zeile, Fachabschnitten und abschließender Prüfbox.
- Ein zentraler Renderer für die vier Übersichtskacheln in der Reihenfolge Sammelinfo, Prüfung, Empfohlener nächster Schritt und Schnellaktionen.
- Einheitlicher dreispaltiger Kopfbereich mit tatsächlichem Abrechnungszeitraum und Speicherstatus.
- Standardbuttons für alle Schnellaktionen.
- Dynamische Kartenhöhe mit einer Mindesthöhe von 184 px; keine feste Maximalhöhe und kein Abschneiden normaler Inhalte.
- Responsive Kachelaufteilung: vier Spalten auf großen Ansichten, zwei Spalten bei mittlerer Breite und eine Spalte auf schmalen Ansichten.
- Statische Klappboxstruktur; alle Bereiche beginnen geschlossen, die letzte Box ist technisch als Prüfung gekennzeichnet.
- Eigene Platzhalter-Klappbox „Einmalige Korrektur / Gutschrift“ im Tab Kaltmiete & NK-Vorauszahlungen, ohne Änderung am Datenmodell.
- Dezente MwSt.-Fußnote am Ende des Tabs Kostenarten & Einstellungen.

### Bereinigt

- Parallele tabbezogene Karten- und Aktionssysteme für Dashboard, Kostenarten, Mieter und Zählerstände entfernt.
- Nachträgliche UI-Upgrade-, Headerkorrektur- und DOM-Verschiebungsfunktionen entfernt.
- Tababhängige Body-Klassen als Steuerung des gemeinsamen Seitenlayouts entfernt.
- Doppelte Hauptüberschriften, alte Perioden-/Statuskarten und verschachtelte Übersichtsgitter entfernt.
- Aktive sichtbare V94-Diagnosebezeichnung neutralisiert.

### Erhalten

- Berechnungs- und Umlagelogik
- Vorauszahlungs- und Saldenlogik
- Datenmodell und Migrationen
- Mieter-, Wohnungs-, Kostenarten- und Zählerdaten
- Briefberechnung und Briefinhalte
- Export-, Archiv- und Sicherungslogik
- Bestehende Korrekturwerte und die Tabellenspalte „Einmalige Korrektur / Gutschrift“

### PWA und Versionierung

- Anwendung, Seitentitel und sichtbare Versionsanzeige auf V99.2 gesetzt.
- Manifestname und Kurzname auf V99.2 aktualisiert.
- Service-Worker-Cache auf `nk-pro-v99-2` gesetzt.
- README, CHANGELOG, WORKBOOK, Architekturbericht und Prüfbericht aktualisiert.

### Prüfungen

- JavaScript-Syntaxprüfung erfolgreich.
- Strukturprüfung aller 14 Tabs erfolgreich.
- Chromium-Rendering bei 1440, 1180, 900 und 520 Pixel Breite ohne Seiten- oder Konsolenfehler.
- Interaktionsprüfung für Tabwechsel, Schnellaktion, nächsten Schritt, Eingabe, Neuberechnung und Speichern erfolgreich.
- Vergleich zentraler fachlicher Ergebnisobjekte zwischen V99.1 und V99.2 im mitgelieferten Arbeitsstand ohne Abweichung.

## Frühere Versionen

Die detaillierte frühere Historie bleibt in der Anwendung und im Versionsverlauf des Repositories erhalten. Dieses Changelog beschreibt die ausgelieferte Konsolidierung V99.2.
