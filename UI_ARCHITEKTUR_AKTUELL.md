# UI-Architektur – aktueller Stand

**Version:** V99.4.1  
**Datenschema:** 5, unverändert  
**Zweck:** verbindliche Alt-zu-Neu-Zuordnung der Phase-1-Navigation

## Grundentscheidung

Die vorhandenen Funktionen werden nicht neu entwickelt. V99.4.1 übernimmt unverändert die in V99.4.0 eingeführte Ordnung im tatsächlichen Arbeitsablauf. Neue UI-Hubs verwenden bestehende Daten und Renderer. Es entstehen keine getrennten Programme, Datenbestände oder Fachmodelle.

## Landingpage

| Einstieg | Ziel | Datenwirkung |
|---|---|---|
| Objekt vorbereiten | Tab `objekt` | keine |
| Nebenkosten abrechnen | Tab `start` | keine |

Die Markenfläche führt jederzeit zurück zu `landing`.

## Navigationszuordnung

| Neue Gruppe | Sichtbarer Eintrag | Technisches Ziel | Herkunft / Funktion |
|---|---|---|---|
| Objekt vorbereiten | Objekt | `objekt` | neuer UI-Hub; nutzt vorhandene Übersichts- und Prüfhelfer |
| Objekt vorbereiten | Wohnungen | `wohnungsverwaltung` | bestehende Wohnungs-Stammdatenfunktion |
| Objekt vorbereiten | Mieter | `mieterverwaltung` | bestehende Mieter-Stammdatenfunktion |
| Nebenkosten abrechnen | Abrechnungsübersicht | `start` | bestehende aktuelle Abrechnung, von Archivliste getrennt |
| Nebenkosten abrechnen | Mieter & Wohnungen | `mieter` | bestehender Abrechnungstab |
| Nebenkosten abrechnen | Kosten erfassen | `einstellungen` | bestehende Kostenarten-/Kostenfunktion |
| Nebenkosten abrechnen | Miete & Vorauszahlungen | `einnahmen` | bestehender Einnahmen-/Vorauszahlungstab |
| Nebenkosten abrechnen | Zählerstände | `wasser` | bestehender Zählerstandstab |
| Nebenkosten abrechnen | Manuelle & externe Werte | `manuellewerte` | bestehender manueller Eingabetab |
| Nebenkosten abrechnen | Verteilung & Berechnung | `umlage` | bestehender Umlagetab |
| Nebenkosten abrechnen | Neue Vorauszahlungen | `vorauszahlungsanpassung` | bestehende Anpassungsfunktion |
| Nebenkosten abrechnen | Qualitätsprüfung | `qualitaet` | bestehende Gesamtprüfung |
| Nebenkosten abrechnen | Briefe | `briefe` | bestehende Brief-/Druckfunktion |
| Nebenkosten abrechnen | Export | `export` | bestehende Exportfunktion |
| Archiv | Abrechnungsarchiv | `archiv` | neuer UI-Hub; verwendet vorhandene Archivzeilen und Aktionen |
| Extras | Datensicherung & System | `sicherung` | bestehende Sicherungs-/Systemfunktion |

## Arbeitskontext

Der Kontext ist nur sichtbar, wenn eine konkrete Abrechnung geöffnet ist.

| Zustand | Anzeige | Quelle |
|---|---|---|
| keine Abrechnung geöffnet | kein Kontext | `billingContextOpen === false` |
| aktuelle Abrechnung | Bearbeitung | vorhandener aktueller Abrechnungsstand |
| Archivansicht | Nur Ansicht | `isArchiveViewer()` |
| gültig finalisierte aktuelle Abrechnung | Finalisiert | `isCurrentBillingFinalized()` |

Objekt und Jahr werden aus vorhandenen Daten abgeleitet. Es wird kein neues persistiertes Kontextfeld angelegt.

## Bewusst nicht umgesetzt

- keine eigenständige Zählerverwaltung,
- keine dauerhafte Zähler-ID,
- keine Standard-Kostenarten oder Standard-Umlageschlüssel,
- kein neues Objektstandardmodell,
- keine Snapshot-Migration,
- keine Änderung historischer Archive.

Diese Punkte gehören zu Phase 2 und Phase 3 und unterliegen der Stop-Regel.

## Technische Dateien

- `index.html`: Landingpage, neue Gruppen und UI-Hubs,
- `assets/app.css`: Darstellung und responsive Regeln,
- `js/navigation.js`: Accordion, aktive Pfade und Kontextanzeige,
- `js/app.js`: Tabregistrierung, Landing-Aktionen, Objekt-/Archiv-Renderer und Kontextableitung,
- `tests/app-smoke.spec.js`: UX-, ARIA-, Navigation- und Statustests.
