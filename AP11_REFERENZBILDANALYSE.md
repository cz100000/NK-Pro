# AP11 – Analyse des Referenzbildes

**Referenz:** `NK PRO Design und strukturziel Navi Leiste.png`, 323 × 1024 Pixel.  
**Rolle:** verbindliche visuelle und strukturelle Zielrichtung; handschriftliche Markierungen werden als Änderungsanweisungen interpretiert.

## Direkt erkennbar

- Dunkelmarineblaue App-Schale mit weißer, leicht abgesetzter Navigationsfläche.
- Kopfbereich mit Wortmarke „NK-Pro“ und Unterzeile „Nebenkostenabrechnung“.
- Links ausgerichtete, dunkelblaue Kontur-Icons in konsistenter optischer Größe.
- Zeilen mit ungefähr 42 Pixel Höhe, klaren horizontalen Trennlinien und großzügigem Icon-Text-Abstand.
- Hierarchische Gruppen „Objekt vorbereiten“, „Nebenkosten abrechnen“, „Archiv“ und „Extras“.
- Fester unterer Bereich mit Benutzer-/Statusinformation und allgemeinem Menüpunkt „Einstellungen“.
- Grüner Hinweis „START“ markiert die gewünschte obere Startposition. Orange Pfeile verlangen die Reihenfolge Zähler vor Mieter. Rot gestrichene Einträge zeigen, dass objektbezogene „Kostenarten“, „Umlageschlüssel“ und ein dortiger „Einstellungen“-Eintrag nicht in diese Gruppe gehören.

## Zuverlässig abgeleitet

- Navigationsbreite im Referenzbild knapp 315 Pixel; Umsetzung: 316 Pixel, bei typischer Notebookbreite 286 Pixel.
- Schalenfarbe ungefähr `#031d41`; weiße Fläche ungefähr `#fefefe`; Text und Icons sehr dunkles Blau.
- Systemnahe, nüchterne Sans-Serif-Typografie. Umsetzung nutzt lokal verfügbare Windows-Schriften: `Segoe UI Variable`, `Segoe UI`, Arial, Helvetica, sans-serif.
- Icons sind funktional, nicht dekorativ, und folgen einer einheitlichen Konturästhetik.
- Hauptnavigation und Footer müssen bei geringer Höhe getrennt bleiben; der mittlere Navigationsbereich ist deshalb kontrolliert scrollbar.

## Technisch notwendige Ergänzungen

- Aktive Fläche, seitlicher 4-Pixel-Marker und `aria-current=page`, weil das Referenzbild keinen vollständigen aktiven Zustand zeigt.
- Hover-, Fokus-, deaktivierte und reduzierte-Bewegungszustände für Maus, Tastatur und Barrierefreiheit.
- Drawer-Verhalten unter 981 Pixel Breite; das Referenzbild zeigt nur die Desktopansicht.
- Kontextpanel für aktive Abrechnung bleibt erhalten, wird aber in die weiße Navigationsfläche integriert.
- Alle produktiv benötigten Abrechnungsseiten bleiben ohne zusätzliche Untergruppe gleichrangig innerhalb „Nebenkosten abrechnen“ erreichbar.

## Nicht eindeutig erkennbar und konsistent festgelegt

- Exakte Schriftmetriken, Schattenstärke und Rundungsradien konnten aus dem Rasterbild nicht pixelgenau bestimmt werden. Festgelegt wurden 6/10/14 Pixel Radien, zurückhaltender Schatten und ein 4-Pixel-Abstandsraster.
- Das Referenzbild zeigt kein mobiles Verhalten. Die Anwendung bleibt Desktop-first; bei schmalen Fenstern erscheint eine 316-Pixel-Schublade mit Überlagerung statt einer neuen mobilen Informationsarchitektur.
- Die im Bild vorhandene Benutzerbezeichnung wird nicht als personenbezogener Fachdatensatz interpretiert. V99.4.12 zeigt stattdessen neutral „Lokale Anwendung“ und die Versionsnummer.

## Gegenüberstellung

| Referenzelement | Umsetzung V99.4.12 | Abweichung/Begründung |
|---|---|---|
| Dunkle Schale | Verlauf `#031d41` → `#05264f` | minimale Flächenabstufung für Tiefe |
| Weiße Navigationskarte | `#fefefe`, 8 px Außenabstand, 8 px Rundung | entspricht Wirkung und Proportion |
| Wortmarke und Unterzeile | „NK-Pro“ / „Nebenkostenabrechnung“ | Schreibweise exakt übernommen |
| Kontur-Icons | 22 Inline-SVGs, 24 × 24, 1,8 px Strich | vollständig offline und konsistent |
| Zähler vor Mieter | umgesetzt | handschriftliche Pfeilvorgabe übernommen |
| gestrichene Objektpunkte | nicht als Objektpunkte vorhanden | Kosten/Verteilung liegen im Abrechnungsworkflow |
| Einstellungen unten | sichtbarer, deaktivierter Dummy | Hinweis „Noch nicht verfügbar“ per Fokus/Hover |
| unterer Benutzerbereich | neutraler lokaler Status | keine erfundene Benutzerverwaltung |
