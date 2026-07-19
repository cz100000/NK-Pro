# AP22F10G-B – Testbericht

## Zusammenfassung

- Reale Browser-Testreferenz: `nk-pro-gesamtbestand-2025-V99.4.55-2026-07-19-13-20-22(1)(1).json`
- Browser: Chromium (`/usr/bin/chromium`)
- Ergebnis: **28 von 28 bestanden, 0 fehlgeschlagen**
- Laufzeitfehler im Browser: **0**
- Maschinenlesbarer Bericht: `browser-test-results.json`

## Vorprüfungen

| Prüfung | Ergebnis |
|---|---|
| Integrität technische Ausgangs-ZIP | Bestanden; keine ZIP-Fehler |
| Integrität Planungs-ZIP | Bestanden; keine ZIP-Fehler |
| JavaScript-Syntax | Bestanden; 55 Einheiten |
| Referenzdaten | Bestanden; 6 logische Fälle semantisch unverändert |
| AP22F10G-B statisch | Bestanden |
| Release-Inhaltsprüfung | Bestanden; vollständiger Releasebestand |
| Browserstrecke mit Fallback-Testbestand | Bestanden; 28/28 |
| Browserstrecke mit realem Gesamtbestand | Bestanden; 28/28 |

## Verbindliche Browserprüfungen

| Nr. | Prüfung | Ergebnis | Dauer |
|---:|---|---|---:|
| 1 | Kostenart in Gesamtkosten deaktivieren | PASS | 1383 ms |
| 2 | Automatischer Umlageschlüssel erzeugt keinen Bereich | PASS | 6 ms |
| 3 | Beliebige Kostenart auf Verbrauch stellen | PASS | 75 ms |
| 4 | Kostenart auf manuellen Umlageschlüssel stellen | PASS | 90 ms |
| 5 | Umlageschlüssel nachträglich ändern | PASS | 1447 ms |
| 6 | Keine K002-Sonderlogik erforderlich | PASS | 1421 ms |
| 7 | Reale Kalt- und Warmwasserzähler geladen | PASS | 12 ms |
| 8 | 490,00 → 564,00 = 74,00 | PASS | 496 ms |
| 9 | 280,00 → 312,42 = 32,42 | PASS | 456 ms |
| 10 | Gesamtverbrauch UG = 106,42 | PASS | 6 ms |
| 11 | 266,00 → 297,74 = 31,74 | PASS | 427 ms |
| 12 | 108,00 → 119,28 = 11,28 | PASS | 414 ms |
| 13 | Gesamtverbrauch EG-Links = 43,02 | PASS | 7 ms |
| 14 | Fehlender Teilwert zeigt keine falsche Wohnungssumme | PASS | 5 ms |
| 15 | Komma- und Punkteingabe | PASS | 2 ms |
| 16 | Neu-Rendern erhält Werte | PASS | 61 ms |
| 17 | Dialog öffnen und schließen ohne Wertverlust | PASS | 124 ms |
| 18 | Filterwechsel erhält Werte | PASS | 127 ms |
| 19 | Seitenwechsel erhält Werte | PASS | 184 ms |
| 20 | Browser-Neuladen nach Speicherung | PASS | 2005 ms |
| 21 | Simulierter Speicherfehler lässt Wert sichtbar | PASS | 1612 ms |
| 22 | Vorjahresübernahme | PASS | 971 ms |
| 23 | Wiederholte Vorjahresübernahme ohne Dubletten | PASS | 106 ms |
| 24 | Summenkontrolle manueller Kostenarten | PASS | 1609 ms |
| 25 | Leerstand und Privatanteil als reguläre Fälle | PASS | 18 ms |
| 26 | Desktop-Sichtprüfung | PASS | 573 ms |
| 27 | Schmale Ansicht mit internem Tabellen-Scroll | PASS | 509 ms |
| 28 | Browserzoom 125 Prozent | PASS | 765 ms |

## Fachliche Referenzwerte

| Fall | Anfang | Ende | Ergebnis |
|---|---:|---:|---:|
| UG Kaltwasser | 490,00 | 564,00 | 74,00 |
| UG Warmwasser | 280,00 | 312,42 | 32,42 |
| UG Gesamtverbrauch | – | – | 106,42 |
| EG-Links Kaltwasser | 266,00 | 297,74 | 31,74 |
| EG-Links Warmwasser | 108,00 | 119,28 | 11,28 |
| EG-Links Gesamtverbrauch | – | – | 43,02 |

## Sichtprüfung

Die Screenshots belegen:

- reale Desktopseite mit dynamischem Verbrauchs- und manuellem Bereich,
- Kennzahlen und Gesamtprüfung,
- reguläre Kennzeichnung von Privatanteil und Leerstand,
- internen Tabellen-Scroll bei 620 CSS-Pixeln,
- funktionsfähige Darstellung bei 125 % Browserzoom,
- Vorjahresübernahme-Dialog,
- sichtbaren Fehlerzustand bei simulierter Speicherstörung.

## Bewertung

Die Browserprüfung mit dem realen Gesamtbestand wurde bestanden. Damit ist die im Auftrag gesetzte Voraussetzung für die Freigabefähigkeit erfüllt.
