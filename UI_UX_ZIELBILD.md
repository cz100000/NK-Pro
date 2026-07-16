# NK-Pro – UI-/UX-Zielbild

## 1. Gesamtcharakter

NK-Pro wirkt wie eine moderne professionelle Fachanwendung: sachlich, vertrauenswürdig, leicht, ruhig und effizient. Die Oberfläche unterstützt fachliche Arbeit, statt Aufmerksamkeit durch Dekoration zu binden.

## 2. Helligkeit und Kontrast

Arbeitsflächen sind hell und leicht gebrochen. Weiße Oberflächen heben sich durch feine Rahmen, nicht durch starke Schatten, vom Hintergrund ab. Text besitzt klaren Kontrast; Sekundärtext bleibt lesbar. Dunkle Flächen sind auf die geschützte Navigation und klar abgegrenzte Sonderbereiche beschränkt.

## 3. Informationsdichte

Die Anwendung ist kompakt, aber nicht gedrängt. Zusammengehörige Informationen stehen nah beieinander; unterschiedliche Aufgaben werden durch konsistente Abstände getrennt. Große Leerflächen ohne funktionalen Grund und überladene Kachelwände sind zu vermeiden.

## 4. Flächenwirkung und Hierarchie

Hierarchie entsteht in dieser Reihenfolge:

1. Seitenkontext und Haupttitel,
2. primäre Handlung beziehungsweise Status,
3. fachliche Abschnitte,
4. Detailinformationen und Hilfetexte.

Rahmen, Flächen, Typografie und Abstand werden sparsam kombiniert. Ein Element benötigt nicht gleichzeitig starke Farbe, Schatten, große Schrift und Rahmen.

## 5. Funktion vor Dekoration

Icons, Farben und Flächen erklären Funktion oder Zustand. Rein dekorative Illustrationen, kräftige Verläufe, Glaseffekte, 3D-Wirkung, große Schatten und bewegte Schmuckelemente sind unzulässig.

## 6. Farbverwendung

- Blau: Primäraktion, Auswahl, Fokus und Information.
- Grün: erfolgreicher oder abgeschlossener Zustand.
- Orange: Warnung, offener Prüfbedarf oder Aufmerksamkeit.
- Rot: Fehler, Blockade und destruktive Aktion.
- Violett: nur für ausdrücklich definierte besondere Fachbedeutung.
- Gelb: ausschließlich die globale Abrechnungskontextleiste und fachlich begründete Warnhinweise.
- Grau/Weiß: Hintergrund, Oberflächen, Rahmen und neutrale Zustände.

Farbe wird immer mit Text, Form oder Icon kombiniert.

## 7. Typografie

App-Oberfläche: `Segoe UI`, Arial, sans-serif. Seitentitel sind deutlich, aber nicht plakativ. Bereichs- und Kartentitel sind kompakt und semibold. Fließtext verwendet normale Schriftstärke und gut lesbare Zeilenhöhe. Kennzahlen dürfen größer sein, bleiben aber sachlich. Brief und Druck verwenden weiterhin ihre getrennten Regeln.

## 8. Abstände

Alle Abstände stammen aus einem begrenzten Raster von 4, 8, 12, 16, 24, 32 und 48 Pixeln. Innerhalb einer Komponente werden kleinere Stufen, zwischen größeren Seitenbereichen größere Stufen verwendet. Willkürliche Zwischenwerte sind nicht zulässig.

## 9. Rahmen, Radien und Schatten

Rahmen sind fein und neutral. Eingaben und kompakte Elemente verwenden kleine Radien; Karten und Dialoge mittlere Radien. Schatten sind höchstens leicht und nur dort zulässig, wo eine Ebene oder Interaktion erklärt werden muss. Dauerhafte starke Tiefenwirkung ist unzulässig.

## 10. Icons

Es werden kleine präzise SVG-Linienicons mit einheitlicher Strichstärke und Größenraster verwendet. Icons unterstützen Text, ersetzen zugängliche Beschriftungen aber nicht. Emoji und gemischte Iconbibliotheken sind unzulässig.

## 11. Hover und Fokus

Hover verändert Oberfläche, Rahmen oder Textfarbe leicht und ohne Layoutsprung. Fokus ist deutlich sichtbarer als Hover und verwendet einen konsistenten Fokusrahmen mit ausreichendem Abstand. Fokus darf nicht durch `outline: none` ohne gleichwertigen Ersatz entfernt werden.

## 12. Responsive-Grundprinzipien

- Desktop: mehrspaltige Raster, Aktionen neben dem Seitenkopf, Tabellen in normaler Dichte.
- Mittlere Breite: Raster reduzieren Spalten; Aktionen dürfen umbrechen.
- Schmale Ansicht: fachliche Bereiche stapeln; Seitenkopfaktionen werden volle oder flexible Breite; Tabellen bleiben innerhalb ihres Containers horizontal scrollbar oder erhalten eine freigegebene Listenalternative.
- Niedrige Höhe: Dialoge und lange Bereiche scrollen innerhalb kontrollierter Flächen; wichtige Aktionen bleiben erreichbar.
- Keine unbeabsichtigte horizontale Scrollleiste der Gesamtseite.

## 13. Barrierefreiheits-Grundprinzipien

Semantische HTML-Struktur, Tastaturbedienbarkeit, sichtbarer Fokus, zugängliche Namen, nachvollziehbare Reihenfolge, Text plus Farbe für Status und ausreichende Zielgrößen sind Pflicht. Animationen bleiben kurz und respektieren reduzierte Bewegung. Dialoge besitzen Fokusfalle und Fokusrückgabe.

## 14. Verbindliche visuelle Referenz

`ui-reference/assets/UI_UX_Styleguide_Bild.png` zeigt das freigegebene Zielbild für Arbeitsflächen und Komponenten. Die darin dargestellte Navigation ist ausgeschlossen. Die Referenzbibliothek unter `ui-reference/` übersetzt das Zielbild in NK-Pro-Komponenten und deutsche fiktive Beispieldaten.
