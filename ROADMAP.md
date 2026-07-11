# NK-Pro Architektur-Roadmap

## Ziel

NK-Pro soll langfristig fachlich vollständig und technisch schlicht bleiben. Die Weiterentwicklung erfolgt schrittweise und ohne Verlust bestehender Fachfälle.

## Phase A – Datenmodell dokumentieren

Ziele:

- zentrale Datenobjekte und Felder dokumentieren
- Pflichtfelder, optionale Felder und Standardwerte kennzeichnen
- Archivdaten und aktuelle Abrechnung klar unterscheiden
- Beziehungen zwischen Mieter, Wohnung, Kostenart und Abrechnungsjahr beschreiben
- verbindliche Quellen für berechnungsrelevante Werte festhalten

Ergebnis:

- `DATA_MODEL.md`
- Datenmodellprüfung im Selbsttest
- keine Änderung der Berechnungslogik

## Phase B – Berechnungslandkarte erstellen

Ziele:

- alle fachlichen Berechnungsfunktionen inventarisieren
- Ein- und Ausgaben dokumentieren
- Zustandsänderungen innerhalb von Berechnungsfunktionen identifizieren
- doppelte oder parallele Formeln erkennen

Ergebnis:

- `CALCULATION_MAP.md`
- Klassifizierung: rein / zustandsverändernd / UI-gekoppelt
- priorisierte Extraktionsliste

## Phase C – Reine Berechnungsfunktionen

Ziele:

- ausgewählte Berechnungen schrittweise in reine Funktionen überführen
- Ergebnisse gegen feste Referenzdatensätze vergleichen
- keine Fachformel in der Oberfläche duplizieren

Vorgehen:

1. kleine Berechnung auswählen
2. Referenzwerte festhalten
3. reine Funktion einführen
4. bisherigen Aufruf ersetzen
5. Ergebnisgleichheit prüfen
6. nächste Berechnung erst danach bearbeiten

## Phase D – Oberfläche entkoppeln

Ziele:

- direkte Fachlogik aus Event-Handlern entfernen
- verbleibende Inline-Handler schrittweise zentralisieren
- Renderfunktionen read-only halten
- Abhängigkeiten zwischen Tabs dokumentieren

## Phase E – Doppelungen konsolidieren

Ziele:

- Dashboard, Qualitätsprüfung, Briefe und Export nutzen dieselben Ergebnisobjekte
- doppelte Status- und Plausibilitätsregeln entfernen
- CSS nur nach visuellen Vergleichstests konsolidieren

## Phase F – Langzeit-Regression

Ziele:

- feste Referenzdatensätze für Standardszenarien
- Mieterwechsel
- Leerstand
- Eigentümeranteil
- Wasserfortschreibung
- manuelle Umlage
- Finalisierung und Wiederbearbeitung
- Import, Export und Rückfallwiederherstellung
- Brief- und Druckausgabe

## Prioritätsregel

Neue Fachfunktionen dürfen die Architektur-Roadmap nicht dauerhaft verdrängen.

Für jeweils höchstens zwei Funktionsversionen soll mindestens eine Architektur- oder Testmaßnahme folgen, sofern relevante technische Schulden bestehen.

## Nächste geplante Schritte

1. V95 – Workflow und Benutzerführung ohne neue Rechenlogik
2. danach Datenmodell-Dokumentation
3. Berechnungslandkarte
4. erste kleine Extraktion einer reinen Berechnungsfunktion
5. vollständiger Referenz- und Browservergleich
