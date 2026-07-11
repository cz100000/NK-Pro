# Changelog

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
