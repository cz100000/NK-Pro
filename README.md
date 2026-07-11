# NK-Pro V96.1 Workflow-Dashboard

Fachlich auf V93 basierend. Ergänzt wurden Entwicklerdiagnose, Diagnoseexport, Performance-/Speicheranzeige und kontrollierte Updateprüfung. Berechnungslogik unverändert.

## Veröffentlichung
1. Alle Dateien dieses Ordners in den lokalen Repository-Ordner kopieren.
2. GitHub Desktop: Summary `NK-Pro V94 Entwicklerdiagnose`.
3. `Commit to main`, danach `Push origin`.
4. GitHub: Settings → Pages → Deploy from a branch → main → /(root).

Adresse: https://cz100000.github.io/NK-Pro/

Keine JSON-Backups oder personenbezogenen Daten ins öffentliche Repository laden.

## V96.1
Erste kleine Workflow-Ausbaustufe. Die Startseite zeigt vorhandene Qualitätsprüfungen kompakt nach Arbeitsbereichen.

## V97.1 – Neues Grundgerüst

V97.1 führt ausschließlich einen neuen visuellen Seitenrahmen ein:

- linke Navigation
- kompakte Arbeitskopfzeile
- responsive mobile Navigation

Die Inhalte und Funktionen der einzelnen Tabs entsprechen V96.2.

## V97.2 – Pilot-Tab Kostenarten

Der Tab „Kostenarten & Einstellungen“ dient als Pilot für die schrittweise Vereinfachung datenreicher Ansichten. Die Standardansicht reduziert die gleichzeitig sichtbaren Spalten; die erweiterte Ansicht erhält den vollständigen bisherigen Funktionsumfang.

## V97.3 – Mock-up-Abgleich

Der Kostenarten-Pilot verwendet nun das freigegebene Mock-up als konkrete visuelle Vorgabe. Das betrifft ausschließlich Darstellung und Bedienhierarchie; die bestehende Fachlogik bleibt erhalten.

## V97.4 – Einheitlicher Kostenarten-Tab

Der Kostenarten-Tab besitzt nur noch eine vollständige Ansicht. Kostenarten werden über ein integriertes Auswahlfenster aktiviert und erscheinen direkt in der zentralen Bearbeitungstabelle.

## V97.5 – Tabellenhierarchie und sichere Deaktivierung

Kostenarten werden explizit über eine Auswahlspalte markiert und ausschließlich über den eindeutig beschrifteten Button oberhalb der Tabelle deaktiviert.

## V98.3 – Sanfte Abschnittshierarchie

Klappbox-Kopfzeilen verwenden nun eine helle Blaugrau-Fläche mit dunkelblauem Akzentbalken. Tabellenköpfe bleiben mittelblau. Tabellen und Kontrollbereiche beginnen innerhalb jeder Klappbox nach einem einheitlichen weißen Innenabstand.

## V98.4 – Neuveröffentlichung

Diese Version ist optisch und funktional identisch zu V98.3. Sie besitzt lediglich eine neue Versions- und Cache-Kennung, damit GitHub Pages die Veröffentlichung eindeutig neu lädt.

## V98.5
Kostenarten-Feinschliff und vollständige Überführung des Tabs Mieter & Wohnungen in das einheitliche Bedienkonzept. Berechnungslogik unverändert.

## V98.6
Einheitliches Look & Feel auf allen Tabs. Fachlogik und Datenmodell unverändert.
