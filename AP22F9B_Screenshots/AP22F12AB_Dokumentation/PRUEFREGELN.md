# AP22F12A/B – Prüfregeln

## 1. Neue zentrale Regel

**Regel-ID:** `NKP-ANALYSE-001`  
**Titel:** Kosten- und Umlagenabgleich  
**Typ:** Fachliche Analyseprüfung  
**Zielseite:** `kostenumlagenabgleich`

### Prüflogik

`Kontrolldifferenz = analyserelevante Kosten − tatsächliche Umlageeinnahmen − Summe der Erklärungskategorien`

Toleranz: 0,01 Euro.

### Mögliche Ergebnisse

- erledigt/OK bei fachlich vollständig geprüftem Zustand,
- Hinweis bei offener Differenz, fehlender Zuordnung oder erforderlicher Entscheidung,
- nicht ausgeführt bei noch nicht begonnenem Analysebestand.

### Abschlusswirkung

Die Regel ist `completionRelevant: false`. Sie wird auf „Prüfen und abschließen“ angezeigt, blockiert den fachlichen Betriebskostenabrechnungsabschluss aber nicht pauschal. Eine offene Differenz verhindert jedoch den Analysezustand „Vollständig geprüft“.

## 2. Fachliche Schutzregeln

1. Soll-Vorauszahlungen sind keine tatsächlichen Einnahmen.
2. Erstattungen werden genau einmal und negativ berücksichtigt.
3. Zahlungs- und Abrechnungsjahr bleiben getrennt.
4. Eine Restdifferenz wird nur nach ausdrücklicher Aktion als „Offene Differenz“ zugeordnet.
5. Eine Kontrolldifferenz von 0,00 Euro bedeutet nur rechnerische Zuordnung.
6. Eine offene Differenz ungleich 0,00 Euro bleibt ein Warnzustand.
7. Negative Gegenpositionen werden nicht allein wegen ihres Vorzeichens als Fehler markiert.
8. Privat- und Leerstandsanteile stammen aus der bestehenden Kostenarten-/Umlagelogik oder einer dokumentierten manuellen Zuordnung.
9. Nicht umgelegte Kosten werden nicht automatisch als Privatanteil behandelt.
10. Prüf-/Freigabestatus wird bei jeder fachlichen Änderung invalidiert.

## 3. Prüfentscheidungen

Geprüfte Differenzzuordnungen erfordern:

- Kategorie,
- Betrag,
- Jahr,
- Begründung bei nicht offener Kategorie,
- Bearbeiter,
- optional Kostenart, Wohnung, Mietverhältnis, Nachweis und Herkunft.

Die Entscheidung kann geändert oder zurückgenommen werden. Dabei wird der zugehörige scoped Datensatz im bestehenden Entscheidungsregister aktualisiert beziehungsweise entfernt.

## 4. Kostenartenkontrolle

Je Kostenart zeigt die Detailansicht:

`Analyserelevante Kosten = Mieteranteil + Privatanteil + Leerstandsanteil + sonstiger Vermieteranteil + offene Zuordnung`

Eine verbleibende offene Zuordnung wird sichtbar ausgewiesen; verwendeter Schlüssel, Herkunft, Nachweis- und Berechnungsstatus bleiben nachvollziehbar.
