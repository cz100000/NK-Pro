# NK-Pro – UI-Architektur V99.4.18

## Verbindliches visuelles System

Die normale Anwendungsoberfläche verwendet zentral `"Segoe UI", Arial, sans-serif`. Navigation, Kopfbereich, Hauptarbeitsfläche, Karten, Tabellen, Filter, Buttons und Statusfarben folgen weiterhin dem AP14-System. Briefvorschau, Druck und Dokumentausgabe sind davon isoliert und verwenden Arial.

## Navigation und Kontext

Startseiten-Kacheln und linke Navigation öffnen dieselben fachlichen Ziele. `Projekt vorbereiten → Zähler` bleibt der statische DUMMY; `Nebenkosten abrechnen → Verbräuche erfassen` bleibt produktiv.

AP15 ergänzt eine zentrale Bereinigung rein transienter UI-Zustände an Kontextgrenzen. Geschlossen werden Dialoge, Kopfmenüs und nichtfachliche Kosten-Auswahlzustände. Persistierte Fach- und Abrechnungsdaten bleiben unverändert.

## Responsivität

Die bestehende AP14-Struktur für normale, schmale und niedrige Fenster bleibt unverändert. AP15 führt keine Hauptbereich-Tabs, keine neue Navigation und kein neues allgemeines UI-Konzept ein.
