# AP22F10B – Testergebnisse

## Gesamtergebnis

**BESTANDEN.** Der Release-Kandidat erfüllt die AP22F10B-Fach-, UI-, Schutz- und Releaseverträge. Es wurden keine schwerwiegenden Produktregressionen festgestellt.

## Statische und fachliche Prüfungen

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax | 55 Einheiten bestanden |
| Referenzfixtures | 6 logische Fälle semantisch unverändert |
| Zählerdomain | bestanden |
| Zählerstartregression | bestanden |
| Zählerberechnungsregression | bestanden |
| Architekturset | bestanden |
| AP22F10B Fach-/UI-Vertrag | bestanden |
| AP22F10B Schutzprüfung | 12 Vollhashes + 4 Teilbereiche bestanden |
| AP22F10B Release-Metadaten | bestanden |
| Release-Inhaltsprüfung | bestanden |

## AP22F10B-Browsertest

**Bestanden, 17 reale Anwendungsscreenshots erzeugt.**

Abgedeckt sind unter anderem:

- Kalt- und Warmwasser je Fall, sechs Fälle und zwölf physische Zähler;
- Fallsubtotal, Gesamtverbrauch und Wasserabgleich;
- Privatanteil und Leerstand ohne künstliche Mieterdatensätze;
- Vorjahresdialog mit zehn eindeutigen Kandidaten und zwei gesperrten fehlenden Vorjahreswerten;
- fehlender Vorjahresstand, Zählerwechsel und rückläufiger Zählerstand;
- externe Einzelwerte einschließlich Import, mehrdeutiger, unbekannter und doppelter Zuordnung;
- Kostenabgleich vollständig und abweichend;
- Speichern, Neuladen und Weitergabe an nachgelagerte Verteilung;
- Bearbeiten, Nur-Ansehen und bestehender Schreibschutz;
- Fokusführung und Rückkehrfokus;
- Desktop, 620 px und 390 px, 2×2-KPI-Raster, interner Tabellenscroll, kein Seitenüberlauf.

## Seitenregressionen

| Bereich | Ergebnis |
|---|---|
| AP22F9B Gesamtkosten | Browser bestanden |
| AP22F8B Korrektur 1 | Browser bestanden |
| AP22F8B Vorauszahlungen | Browser bestanden |
| AP22F6B Abrechnungsübersicht | Browser bestanden |
| AP22F6B Korrektur 1 | Browser bestanden |

## Kernregressionen mit System-Chromium

| Projekt | Ergebnis |
|---|---|
| Dokument-/Brief-/CSV-Export | 2/2 bestanden |
| Migration und Restore/Rollback | 6/6 bestanden |
| Persistenz, Backup und Archiv-Snapshots | 5/5 bestanden |
| Referenzfälle einschließlich Leerstand und Schema-5-Migration | 6/6 bestanden |
| Qualitäts-, Archiv- und Jahreswechselorchestrierung | 5/5 bestanden |

## Sichtprüfung

Alle 17 vorgeschriebenen Ansichten wurden aus der tatsächlich umgesetzten Anwendung erzeugt. Separate HTML-Mockups sind nicht Bestandteil des Produktreleases.
