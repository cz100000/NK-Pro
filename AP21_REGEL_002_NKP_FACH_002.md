# AP21 – Einzelprüfung NKP-FACH-002

## Regel

- **ID:** NKP-FACH-002
- **Titel:** Mindestens eine aktive Wohnung ist vorhanden
- **Status:** analysiert; Korrekturentscheidung ausstehend

## Ergebnis der Prüfung

Die Regel ist fachlich notwendig, blockierend und nicht bestätigbar. Die aktuelle technische Auswertung ist jedoch nicht konsistent mit der Umlageberechnung.

### 1. Unterschiedliche Definition von „aktiv“

Die Qualitätsregel zählt jede Wohnung als aktiv, deren Status nicht exakt `inaktiv` lautet. Dadurch gelten auch leere Werte, `Aktiv`, `leerstand` oder sonstige unbekannte Werte als aktiv. Die Umlageberechnung verwendet dagegen ausschließlich den exakten Wert `aktiv`. Eine Abrechnung kann deshalb diese Pflichtregel bestehen, obwohl die Berechnung keine aktive Wohnung verwendet.

### 2. Falscher Direkteinstieg

Der bisherige Direkteinstieg `wohnungsverwaltung` führt zum zentralen Wohnungsbestand. Dort wird der abrechnungsbezogene Aktivstatus bewusst nicht gepflegt. Der tatsächliche Bearbeitungsort ist `Mieter & Wohnungen` im Bereich `#tenantUnitsSection` beziehungsweise in der Tabelle `#wohnungenTable`.

### 3. Unzureichende Ergebnisdaten

Aktuell wird nur die Zahl aktiver Wohnungen ausgegeben. Für eine nachvollziehbare Prüfung fehlen Gesamtzahl, inaktive Wohnungen, ungültige oder fehlende Statuswerte und die betroffenen Wohnungs-IDs.

## Empfohlene Entscheidung

- Regel-ID und Titel bleiben bestehen.
- Bekannte Legacy-Schreibweisen `Aktiv` und `Inaktiv` werden beim Laden auf `aktiv` und `inaktiv` normalisiert.
- Nur der kanonische Status `aktiv` zählt als aktiv.
- Leere und unbekannte Statuswerte sind blockierende Fehler und werden je Wohnung angezeigt.
- Qualitätsregel, Umlageberechnung, Dashboards und Snapshot-Prüfung verwenden dieselbe zentrale Aktivdefinition.
- Direkteinstieg: `mieter` → `#tenantUnitsSection`.
- Eine inaktive Wohnung wird nie automatisch aktiviert. Leerstand bleibt eine aktive Wohnung ohne abrechenbares Mietverhältnis und ist kein dritter Wohnungsstatus.

## Erforderliche Tests

Leerer Bestand, alle Wohnungen inaktiv, mindestens eine kanonisch aktive Wohnung, Legacy-Groß-/Kleinschreibung, fehlender Status, unbekannter Status und korrekter Direkteinstieg.
