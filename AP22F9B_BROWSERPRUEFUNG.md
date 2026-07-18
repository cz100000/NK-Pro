# AP22F9B – Reale Browser-Sichtprüfung

Die Screenshots wurden aus der tatsächlich migrierten Anwendung erzeugt, nicht aus Mockups oder separaten HTML-Prototypen.

| Nachweis | Datei | Geprüfte Merkmale |
|---|---|---|
| Desktop Bearbeiten | `AP22F9B_Screenshots/01_desktop_bearbeiten.png` | vier Kacheln, flache Bereiche, 15 Spalten, neutrale Summe, Aktionen |
| Desktop Nur-Ansehen | `AP22F9B_Screenshots/02_desktop_nur_ansehen.png` | große Schreibschutzhinweisbox, lesbare Werte, gesperrte Schreibaktionen |
| Dialog | `AP22F9B_Screenshots/03_dialog_kostenart_hinzufuegen.png` | echter Kostenartendialog, Fokusführung und Rückkehr |
| Leerzustand | `AP22F9B_Screenshots/04_leerzustand.png` | Kacheln `0,00 €`, `0`, `0 von 0`, `0`; Zustandsanzeige im Dokumentfluss |
| Hinweiszustand | `AP22F9B_Screenshots/05_hinweiszustand.png` | vorhandene Status-/Hinweisdaten, keine neue Prüfung |
| 620 px | `AP22F9B_Screenshots/06_ansicht_620px.png` | Kacheln 2×2, kompakte Toolbar, nur interner Tabellen-Scroll |
| 390 px | `AP22F9B_Screenshots/07_ansicht_390px.png` | Kacheln 2×2, kein horizontaler Seitenüberlauf, Navigation nutzbar |

Automatisch gemessen wurden für Desktop, 620 px und 390 px:

- `document.documentElement.scrollWidth <= clientWidth`;
- Haupttabelle behält alle 15 Spalten;
- Tabellenhülle besitzt bei schmalen Viewports eigenen horizontalen Overflow;
- rechte Kopf- und Datenzelle besitzen einen sichtbaren rechten Rahmen;
- Kachelraster besteht bei 620 px und 390 px aus zwei Spalten;
- Kacheln aktualisieren sich nach bestehenden Eingabeänderungen ohne separate Speicherung.
