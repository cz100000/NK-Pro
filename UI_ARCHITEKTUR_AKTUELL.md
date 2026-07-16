# AP21C – UI-Architektur Individuelle Werte

Die Seite nutzt weiterhin `index.html` als statischen Rahmen, `assets/app.css` für seitenbezogene Darstellung und `js/ui-individual-values.js` für dynamische Kostenarten- und Filterdarstellung. Fach- und Persistenzzugriffe verbleiben in den bestehenden zentralen Modulen.

# UI-Architektur V99.4.26 / AP21B1

Die linke Navigation besteht aus den drei unabhängig klappbaren Gruppen `object`, `billing` und `archive`. `js/navigation.js` hält die Gruppenpräferenz unter `nkpro.workflowNavigation.v6`, migriert ältere Präferenzen und ordnet `archiv` dem eigenständigen Archivbereich zu.

Die sichtbare Navigation enthält 13 Ziele. Die Seiten `objektuebersicht`, `vorauszahlungsanpassung`, `export` und `sicherung` bleiben als kompatible Direkteinstiege im DOM und in der Seitensteuerung erhalten, werden aber nicht als reguläre Navigationsschritte angezeigt. Die Arbeitsweiche ist ausschließlich über `.sidebar-brand-home` und `#sidebarCollapseTop` erreichbar.

Desktopbreite, Zustände und Responsive-Overlay liegen ausschließlich im AP21B1-Navigationsblock von `assets/app.css`. Fach- und Datenzustände werden durch die Navigation nicht mutiert.

# NK-Pro – UI-Architektur V99.4.23

## Visuelles System

Die App verwendet zentral `"Segoe UI", Arial, sans-serif`; Briefvorschau, Druck und PDF bleiben durch AP13 isoliert und verwenden Arial. Das AP18-System für Steuerungshöhen, Abstände, Rundungen, Rahmen, Fokus, Übergänge, Icons und Buttons bleibt verbindlich.

## Navigation und Abrechnungskontext

Der AP19-Kontext besitzt weiterhin `closed`, `edit` und `view`. Zehn Abrechnungs-Unterpunkte sind ohne geöffneten Kontext sichtbar, aber nicht aufrufbar. Die gelbe Kontextleiste bleibt die zentrale Status- und Modusanzeige.

## AP20-Prüfoberflächen

`quality-rules.js` erzeugt das zentrale Ergebnis. `ui-quality.js` rendert vier Statuskarten, acht Bereichsgruppen, Statusfilter, Detaildialog, Bestätigungsnachweise, Regelübersicht, kontextbezogene Fachseitenhinweise und Systemdiagnose. Dashboard und Dokumentmodule lesen dieselben Ergebnisse.

15 vorhandene Validierungsbereiche erhalten kompakte Seitensummen. 36 fachliche Regelinstanzen besitzen Zielseiten. Direkteinstiege öffnen den fachlichen Bereich, scrollen zum Ziel und setzen Fokus beziehungsweise zeitliche Hervorhebung. Technische Regeln erscheinen ausschließlich in der Systemdiagnose.

## Schreibschutz

54 schreibende Aktionskennungen sind zentral abgesichert; darunter AP20-Bestätigen und Nicht-anwendbar. Der Ansichtsmodus sperrt UI, Ereignisdelegation und direkte Aufrufe. Lesen, Filtern, Aufklappen, Vorschau, Druck und Export bleiben möglich.

## Barrierefreiheit und Responsivität

Status werden mit Text statt nur Farbe kommuniziert. Fokuszustände sind sichtbar. Aufklappgruppen und Dialoge besitzen nachvollziehbare Beschriftungen. AP20 ergänzt Breakpoints bei 900 und 620 Pixeln sowie Regeln für geringe Höhe, Kartenstapel, Aktionsumbruch und kontrollierte Langtexte. Eine vollständige mobile Neuentwicklung bleibt außerhalb AP20.

## V99.4.29 – AP22A UI-Bibliothek
AP22A führt den zentralen Namensraum `nk-ui-*`, kanonische `--nk-ui-*`-Design-Tokens, eine JavaScript-Metadaten-Schnittstelle sowie Katalog und Migrationsmatrix ein. Bestehende Fachseiten und Altvarianten bleiben unverändert; die kontrollierte Migration folgt in separaten AP22-Paketen.
