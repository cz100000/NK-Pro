# AP22F4B – Korrektur 1: weißer Tabelleninnenrand

## Ausgangsbefund
Bei der manuellen Prüfung der veröffentlichten V99.4.39 war die Wohnungstabelle unmittelbar an die Kartenhülle gesetzt. Auf einer breiten Desktopansicht nutzte die Tabelle zudem nur ihre Inhaltsbreite, wodurch rechts eine ungleichmäßige freie Fläche entstand.

## Ursache
Die seitenbezogene Tabellenhülle hatte `padding: 0`. Gleichzeitig übernahm die Tabelle aus der zentralen Tabellenkomponente `width: max-content`; die AP22F4B-Regel setzte lediglich eine Mindestbreite. Der bisherige Browsertest prüfte Dokumentfluss und Überlauf, jedoch nicht den sichtbaren Innenabstand zwischen Tabelle und Karte.

## Korrektur
- Tabellenhülle: weißer tokenbasierter Innenabstand von 8 px an allen Seiten
- Wohnungstabelle: `width: 100%` bei unveränderter Mindestbreite von 980 px
- UI-Referenz: identische Regel ergänzt
- schmale Ansichten: horizontaler Scroll bleibt innerhalb der Tabellenhülle
- keine Änderung an Feldern, Fachlogik, Prüfregeln, Schreib- oder Persistenzwegen

## Neue Regression
Der AP22F4B-Browsertest prüft jetzt:
- Innenabstand links, rechts, oben und unten von mindestens 7 CSS-Pixeln
- weißen Hintergrund der Tabellenhülle
- vollständige Nutzung der verfügbaren Inhaltsbreite
- keinen Dokumentüberlauf
- eigenen Desktopfall bei 1648 × 894 CSS-Pixeln

Visueller Nachweis: `screenshots/AP22F4B/05_desktop_weisser_innenrand.png`.

## Ergebnis
Korrektur 1 ist bestanden. Die Produktversion bleibt **V99.4.39**, da es sich um die Bereinigung des noch nicht freigegebenen AP22F4B-Releasekandidaten handelt.
