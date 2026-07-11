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
