# NK-Pro – UI-Architektur V99.4.21

## Verbindliches visuelles System

Die normale Anwendungsoberfläche verwendet zentral `"Segoe UI", Arial, sans-serif`. AP18 ergänzt zentrale Variablen für Steuerungshöhen, Abstände, Rundungen, Rahmen, Fokus, Übergänge und Icongrößen. Briefvorschau, Druck und Dokumentausgabe bleiben durch AP13 isoliert und verwenden Arial.

## Navigation und Kontext

Der globale Start-Eintrag ist oberhalb der vier unabhängig klappbaren Fachgruppen dauerhaft sichtbar. Chevron-Bedienung und Navigation sind getrennt. Direkteinstiege öffnen den korrekten Pfad; aktive Unterseiten verwenden sichtbare und semantische Zustände.

Die globale Abrechnungskontextleiste zeigt nur auf relevanten Arbeitsseiten Objekt, Kurzcode, Jahr und Status. Arbeitsweiche und Bereichsübersichten bleiben fachlich unverändert.

## Aktionssystem

Acht zentrale Varianten decken Primär, Sekundär, dezent, Gefahr, Warnung, Icon, kompakt und Umschalter/deaktiviert ab. Hover verursacht keine Bewegung. Fokus ist mit Outline und Fokusfläche sichtbar. Navigation, Karten, Tabellenzeilen und Klappboxen behalten eigenständige Komponentenrollen.

## Briefvorschau

Die Bildschirmvorschau besitzt Seite-, Breite- und Benutzerzoom. Der Zoomzustand ist sitzungsbezogen und beeinflusst weder Renderer noch Druck-/PDF-Ausgabe. Die Werkzeugleiste besteht aus den Gruppen Ansicht, Darstellung und Ausgabe.

## Responsivität

AP18 bündelt Regeln bei 1280, 1100, 900 und 680 Pixeln sowie für geringe Fensterhöhe. Werkzeuggruppen brechen kontrolliert um, Dialoge bleiben im Viewport und die lange Brieferfassung verwendet auf breiten Ansichten eine sticky Vorschau.
