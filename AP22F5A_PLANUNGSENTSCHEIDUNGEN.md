# AP22F5A – Verbindliche Planungsentscheidungen

## Gemeinsamer Umfang
AP22F5 umfasst die Seiten **Objekt vorbereiten → Zähler** (`wasser`) und **Objekt vorbereiten → Mietverhältnisse** (`mieterverwaltung`). Technische Ausgangsbasis ist ausschließlich `NK-Pro_V99_4_39_AP22F4B_Wohnungen_Korrektur1.zip`.

## Zähler
- Zielrichtung: freigegebenes Mockup B.
- Die Seite bleibt vollständig ein DUMMY.
- Genau fünf Arten: Wasser, Wärme, HKV, Gas und Strom.
- Weiße kompakte Kartenleiste mit zentralen farbigen SVG-Linienicons.
- Keine produktiven Aktionen, keine Speicherung, keine Datenfelder, keine Zählerfachlogik.
- Suche und Filter wirken ausschließlich auf statische Beispieldaten im DOM.
- DUMMY-Hinweise stehen im normalen Dokumentfluss.

## Mietverhältnisse
- Zielrichtung: freigegebenes Mockup A.
- Kennzahlenkarten sind zulässig, sofern ausschließlich vorhandene Daten verwendet werden.
- Für V99.4.40: Gesamt, Aktiv, Nicht aktiv und Archiviert.
- Alle zwölf vorhandenen Felder bleiben erhalten.
- Neuanlage, Speichern, Archivieren und Reaktivieren verwenden ausschließlich bestehende Aktionen.
- Keine neuen Statuswerte, Berechnungen, Datenfelder oder Persistenzwege.
- Die Inhalte der Kennzahlenkarten können später in einem gesonderten UI-Paket geändert werden.

## Projektweite Regeln
- bestehende Navigation unverändert
- `NK-Pro UI Referenz 1.0` verbindlich
- Tabellen mit weißem Innenabstand und internem horizontalem Scroll
- Hinweise ohne Überlagerung
- zentrale Tokens und SVG-Linienicons
- keine Änderung geschützter Fach-, Speicher-, Migrations- oder Zählerdateien
