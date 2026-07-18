# AP22F7B Korrektur 2 – Umsetzungsbericht

## Ziel

Projektweiter Abgleich aller produktiven Standardtabellen auf den verbindlichen NK-Pro-Tabellenstandard:

- vollständige verfügbare Tabellenbreite auf Desktop;
- klarer rechter Abschluss ohne leere weiße Restfläche;
- ausschließlich interner horizontaler Tabellen-Scroll bei breitem Inhalt;
- kein horizontaler Seitenüberlauf;
- unveränderte Fach-, Eingabe-, Sortier-, Filter-, Speicher-, Migrations-, Archiv-, Brief- und Drucklogik.

## Technische Umsetzung

Die Korrektur wurde zentral in `assets/app.css` innerhalb der vorhandenen Komponente `.nk-ui-table-wrap` / `.nk-ui-table` umgesetzt:

- Tabellenhülle als einspaltiges CSS-Grid;
- Trackdefinition `minmax(100%, max-content)`;
- Tabelle mit `width: 100%` und ohne künstliche Mindestbreite;
- vorhandene fachlich begründete Breiten und intrinsische Tabelleninhalte bleiben wirksam;
- breite Tabellen vergrößern ausschließlich den Scrollbereich ihrer Hülle.

Damit gilt die Korrektur automatisch für alle 19 produktiven Tabellen, ohne einzelne Seitenvarianten oder neue Tabellenklassen einzuführen.

## Produktstand

- Produktversion: `V99.4.42`
- Paketstand: `AP22F7B Korrektur 2`
- PWA-Build-ID: `99.4.42-ap22f7b-k2`
- Datenschema: `5`, unverändert
- Datenebenenvertrag: `1`, unverändert

## Ergebnis

Alle 19 Tabellen schließen auf Desktop rechts bündig mit ihrer jeweiligen Tabellenhülle ab. Bei 620 px und 390 px bleibt die Gesamtseite ohne horizontalen Überlauf; breite Tabellen bleiben intern verschiebbar.
