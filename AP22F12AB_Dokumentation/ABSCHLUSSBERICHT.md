# AP22F12A/B – Abschlussbericht

**Release:** V99.4.66  
**Arbeitspaket:** Kosten- und Umlagenabgleich  
**Stand:** 02.08.2026

## Ergebnis

Der Kosten- und Umlagenabgleich wurde als vollständige NK-Pro-Funktion integriert. Die neue Seite ist unter „Analyse“ erreichbar und verwendet reale Datenquellen des jeweiligen Bestands. Tatsächliche Einnahmen, analyserelevante Kosten, Differenz, Erklärungskategorien, Kontrollrechnung und fachlicher Prüfstatus sind getrennt und nachvollziehbar umgesetzt.

## Erfüllte Kernpunkte

- eigene produktive Analyseseite in bestehender Shell und Navigation,
- tatsächliche Zahlungsflüsse mit getrenntem Zahlungs-/Abrechnungsjahr,
- keine automatische Umdeutung von Soll-Vorauszahlungen,
- Kostenarten-Detailmodell mit Herkunft/Nachweis,
- alle geforderten Erklärungskategorien,
- offene Differenz als eigener Warnzustand,
- getrennte Kontrolldifferenz und fachlicher Status,
- Wiederverwendung der bestehenden Prüfentscheidungsarchitektur,
- Statuskarte auf „Prüfen und abschließen“,
- Excel-2019-kompatibler SpreadsheetML-Export,
- A4-Druck/PDF-Ansicht und internes Prüfprotokoll,
- additive Migration in Datenschema 5,
- Sicherungs-, Wiederherstellungs-, Snapshot- und PWA-Integration,
- neue Domain- und Integrationstests,
- vollständige Release-Dokumentation.

## Qualität

Der aktuelle statische Release-Gate einschließlich Syntax, Fixtures, Zählerregression, Architektur, AP22F11B-K4, AP22F12-Domain/Integration und Release-Inhalt ist bestanden. Die fehlende Playwright-Abhängigkeit verhinderte die Browserautomation; dieser Umstand ist als Testumgebungsrestpunkt transparent dokumentiert.

## Neue technische Ausgangsbasis

`NK-Pro_V99_4_66_AP22F12AB_Kosten_und_Umlagenabgleich.zip`
