# Changelog

## V96.1 – Workflow-Dashboard · Stufe 1
- kompaktes Arbeitsstand-Dashboard auf der Startseite
- nutzt vorhandene Qualitätsprüfungen statt neuer Fachregeln
- Auswertung auf einer Zustandskopie; Rendern verändert den produktiven Zustand nicht
- direkte Navigation zur Qualitätsprüfung
- keine Berechnungs-, Umlage-, Brief- oder Archivlogik verändert

## V96.2 – Abrechnungsdashboard
- Workflow-Status vollständig von der Startseite entfernt.
- Startseite enthält wieder nur Abrechnungsübersicht und Abrechnungsaktionen.
- Workflow-Status in den Dashboard-Tab der geöffneten Abrechnung verschoben.
- Fehlplatzierten V96.1-Architekturtest in den regulären App-Selbsttest verschoben.
- Keine Berechnungs-, Umlage-, Brief-, Archiv- oder Speicherlogik verändert.

## V97.1 – Neues Grundgerüst
- Neues visuelles App-Grundgerüst mit fester linker Navigation.
- Kompakte Arbeitskopfzeile mit dem Namen des aktiven Tabs.
- Bestehende Start- und Abrechnungstabs in der Navigation gruppiert.
- Mobile Navigation als einblendbare Seitenleiste.
- Druckansichten blenden Navigationsrahmen weiterhin aus.
- Keine Tabellen, Formulare, Berechnungs-, Speicher-, Archiv- oder Brieflogik verändert.

## V97.2 – Pilot-Tab Kostenarten
- Tab „Kostenarten & Einstellungen“ visuell neu strukturiert.
- Standardansicht zeigt die häufig benötigten Kernfelder.
- Erweiterte Ansicht zeigt alle bisherigen Felder und Sonderoptionen.
- Arbeitsbereiche als einklappbare Abschnitte gegliedert.
- Kompakte, rein lesende Zusammenfassung ergänzt.
- Bestehende Eingabefelder, Event-Handler und Fachregeln beibehalten.
- Keine Berechnungs-, Speicher-, Archiv- oder Brieflogik verändert.

## V97.3 – Mock-up-Abgleich Kostenarten
- Pilot-Tab visuell eng an das freigegebene Mock-up angeglichen.
- Eigene Kopfzeile mit Ansichtsumschalter, Speicherstatus und Speichern-Aktion.
- Vier Übersichtskarten: Zusammenfassung, Prüfstatus, nächster Schritt und Schnellaktionen.
- Kompakte nummerierte Abschnittsleisten.
- Werkzeugleiste und Tabellenstruktur entsprechend dem Mock-up.
- Kontrollsummen als horizontale Abschlussleiste.
- Erweiterte Sonderoptionen bleiben vollständig erreichbar.
- Keine Berechnungs-, Speicher-, Archiv- oder Brieflogik verändert.

## V97.4 – Einheitlicher Kostenarten-Tab
- Standard-/Erweitert-Umschalter entfernt.
- Eine vollständige Ansicht enthält alle Kostenartenfelder und Sonderbereiche.
- Separaten Abschnitt „Kostenarten auswählen“ entfernt.
- „Kostenart hinzufügen“ öffnet ein Such- und Auswahlfenster.
- Inaktive vordefinierte Kostenarten werden über den bestehenden `inNK`-Mechanismus aktiviert.
- Bereits aktive Kostenarten sind im Auswahlfenster gekennzeichnet und nicht doppelt auswählbar.
- Freie Kostenarten können im Auswahlfenster neu angelegt werden.
- Sämtliche Tabellen, Dialoge, Buttons und Sonderbereiche an ein gemeinsames Look-and-feel angepasst.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V97.5 – Tabellenhierarchie und sichere Deaktivierung
- Alle Tabellen und Kontrollbereiche bündig an derselben linken Position ausgerichtet.
- Klappbox-Kopfzeilen dunkelblau gestaltet.
- Tabellenkopfzeilen in einem etwas helleren Blau gestaltet.
- Auswahlspalte am Tabellenanfang ergänzt.
- Deaktivierung ausschließlich über den oberen Button.
- Drei-Punkte-Aktion am Zeilenende entfernt.
- Zweite Klappbox in „Umlage pro Mietverhältnis / Wohnung“ umbenannt.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V97.6 – Abnahme und Sicherheit Kostenarten
- Sicherheitsabfrage vor dem Deaktivieren einer oder mehrerer Kostenarten.
- Hinweis, dass vorhandene Eingaben erhalten bleiben.
- Auswahlzustand wird nach Aktivierung, Deaktivierung und Neurendern bereinigt.
- Deaktivierungsaktion in Archivansichten gesperrt.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V98.1 – Zählerstände-Pilot
- Zählerstände-Tab in das neue Bedien- und Designkonzept überführt.
- Übersichtskarten für Kostenarten, Verbräuche, Endwerte und Umlageübernahme.
- Vier einheitliche Klappboxen: Erfassung, Verbrauch je Mietverhältnis/Wohnung, Historie und Kontrollen.
- Dunkelblaue Klappbox-Kopfzeilen und hellblaue Tabellenkopfzeilen.
- Tabellen und Kontrollbereiche bündig ausgerichtet.
- Bestehende Eingabefunktionen und Zählerberechnungen weiterverwendet.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V98.2 – Wiederherstellung und Browserprüfung
- Neue Versions- und Cache-Kennung.
- Vollständiger Browser-Smoke-Test über Startseite, aktive Abrechnung und sämtliche Tabs.
- Keine Fach- oder Berechnungslogik geändert.

## V98.3 – Sanfte Abschnittshierarchie
- Vollflächig dunkelblaue Klappbox-Kopfzeilen durch helle Blaugrau-Flächen ersetzt.
- Dunkelblauer Akzentbalken links kennzeichnet weiterhin die übergeordnete Abschnittsebene.
- Tabellenkopfzeilen bleiben mittelblau mit weißer Schrift.
- Einheitlicher weißer Innenrand zwischen Klappbox-Rand und Tabellen/Kontrollbereichen.
- Innenabstand gilt im Kostenarten- und Zählerstände-Tab für alle Klappboxen.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V98.4 – Neuveröffentlichung
- Funktional und optisch identisch zu V98.3.
- Neue Versionskennung V98.4.
- Neue Service-Worker-Cache-Kennung `nk-pro-v98-4`.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V98.5 – Mieter & Wohnungen im einheitlichen Look
- Browser-Tab-Titel eindeutig auf V98.5 korrigiert.
- Ungenutzten Kopieren-Button im Kostenarten-Tab entfernt.
- Kostenarten-Zeilen vereinheitlicht; Preis je Einheit kompakt mit Stift-Symbol.
- Einheitspreis wird in einem kleinen Bearbeitungsdialog geändert; Auto-Preis-Funktion bleibt erhalten.
- Buttons in den oberen Übersichtskacheln auf gleiche Höhe ausgerichtet.
- Rundere Tabelle aus Abschnitt 2 als Tabellenstandard auf alle Tabellen übertragen.
- Tab Mieter & Wohnungen mit Seitenkopf, Übersichtskacheln, sanften Klappboxen, Innenrändern und Kontrollsummen neu gestaltet.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V98.6 – Einheitliches Look & Feel für alle Tabs
- Visuelle Grundstruktur aus „Kosten und Einstellungen bearbeiten“ appweit übertragen.
- Einheitliche Seitenköpfe, Karten, Klappboxen, Tabellen, Innenabstände, Eingabefelder und Buttons.
- Sanfte Abschnittsköpfe mit linker Akzentleiste auch für bestehende Details/Klappbereiche.
- Rundungen und Tabellenkopf-Stil auf alle Datentabellen übertragen.
- Bestehende Inhalte, Funktionen und Tab-Strukturen bleiben erhalten.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V98.7 – Echte Kachel- und Klappboxstruktur
- Nicht nur Farben, sondern die vollständige Bedienstruktur aus Kostenarten & Einstellungen übertragen.
- Dashboard, Kaltmiete & NK-Vorauszahlungen, Nebenkostenumlage, Vorauszahlungsanpassung, Qualitätsprüfung, Abrechnungsbriefe und Export erhalten Seitenkopf, Kachelübersicht und nummerierte Klappboxen.
- Mieter & Wohnungen, Kostenarten & Einstellungen und Zählerstände behalten ihre bereits angepasste Struktur.
- Dynamische Kacheln für Einnahmen, Briefe und Export ergänzt.
- Bestehende Tabellen, Eingaben, IDs und Renderfunktionen bleiben erhalten.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.

## V98.8 – Kompakte Sammelkacheln und einheitliche Bearbeitungstabs
- Doppelte Hauptüberschriften entfernt; pro Tab bleibt genau ein Seitenkopf.
- Kacheln in allen Bearbeitungstabs auf die Größe aus Kostenarten & Einstellungen begrenzt.
- Verwandte Kennzahlen zu kompakten Sammelkacheln zusammengeführt.
- In jedem Arbeitstab stehen rechts „Empfohlener nächster Schritt“ und „Schnellaktionen“.
- Dezente, einheitliche Icons ergänzt.
- Kachelbuttons horizontal mittig und je Reihe auf gleicher Höhe ausgerichtet.
- Farben, Schriften, Rahmen, Hover-Zustände und Buttonarten am Muster-Tab vereinheitlicht.
- Alle Klappboxen sind beim Start und nach Tabwechsel standardmäßig geschlossen.
- WORKBOOK.md ist fester Bestandteil des Versionspakets.
- Keine Änderung an Berechnungs-, Speicher-, Archiv- oder Brieflogik.
