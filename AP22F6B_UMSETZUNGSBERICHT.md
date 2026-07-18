# AP22F6B – Umsetzungsbericht

## Ergebnis
Die technische Migration der Seite **Nebenkosten abrechnen → Übersicht** (`start`) ist für Release **V99.4.41** abgeschlossen. Verwendet wurden ausschließlich die freigegebene Produkt-ZIP `NK-Pro_V99_4_40_AP22F5B_Zaehler_und_Mietverhaeltnisse_Korrektur1.zip` und das Planungspaket `AP22F6A_Planungsartefakte_Korrektur2.zip` Korrektur 2.

## Umgesetzte Zielstruktur
- unveränderte weiße Navigation, unveränderter NK-Pro-Seitenkopf und unveränderte globale Abrechnungskontextleiste
- keine Modusangabe in der Kontextleiste
- eine kompakte gemeinsame Tabellenfläche für aktuelle und archivierte Abrechnungen
- Suche, bestandsbasierte Filter `Alle`, `Aktuell`, `Archiv` und Ergebniszählung
- sieben Spalten: Abrechnung, Objekt, Status, Arbeitsstand, zuletzt bearbeitet, Saldo und Aktionen
- getrennte Tabellen-Gruppen für aktuelle und archivierte Abrechnungen
- quadratische Icon-only-Buttons in einer nicht umbrechenden Aktionsgruppe
- Auge für Ansehen, Stift für Bearbeiten/Korrektur, Haken im Kreis für Abschließen, Archivbox für Archivieren und Aktualisierungssymbol für Archiv aktualisieren
- vollständige `title`-Tooltips, identische `aria-label`, dekorative SVGs mit `aria-hidden="true"`, sichtbarer Fokus und eindeutige deaktivierte Zustände
- Hinweise und Schreibschutz ausschließlich im normalen Dokumentfluss
- interner horizontaler Tabellen-Scroll bei schmalen Viewports ohne horizontalen Seitenüberlauf

## Unveränderte Fachwege
Bearbeiten, Ansehen, Abschließen, Archivieren, Archiv aktualisieren, Zur Korrektur öffnen, Schließen, Kontextwechsel und Rücksprung auf den letzten Arbeitsschritt verwenden weiterhin die bestehenden Handler. Es wurden keine Datenfelder, Statuswerte, Prüfregeln, Berechnungen, Speicher-, Lade-, Migrations-, Archivierungs-, Brief- oder Druckwege verändert.

## Releasefortschreibung
Anwendung, PWA, Cache und Paketmetadaten wurden nach bestandener technischer und visueller Abnahme auf **V99.4.41** beziehungsweise `99.4.41-ap22f6b` fortgeschrieben.

## Visuelle Abnahme
Neun reale Chromium-Screenshots liegen unter `screenshots/AP22F6B/`: Desktop geschlossen, Bearbeiten, Nur ansehen, Archiv, 620 px, 390 px, Leerzustand, Fehlerzustand und Zoomäquivalent.

## Ergebnisbewertung
Die AP22F6B-spezifischen statischen Prüfungen, der Schutz-Hash-Abgleich, der Browsertest und der vollständige Release-Check sind bestanden. Angrenzende Regressionen für Zähler/Mietverhältnisse, Objektdaten, Qualitätscockpit, Persistenz, Migration, Archiv-/Wiederbearbeitung sowie Brief-/Drucksystem sind bestanden.
