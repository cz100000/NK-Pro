# Testbericht AP22F10G-B Korrektur 1

## Testgrundlage

Technische Basis: V99.4.58

Realer Testbestand:
`nk-pro-gesamtbestand-2025-V99.4.58-2026-07-19-16-16-12.json`

SHA256 des unveränderten Testbestands:
`b02a04881a45e8dbf7d190bc6d31a1ad788d44d8db3e04fd8654cd4ab9f36b09`

Der Testbestand wurde nicht in das Release eingebaut.

## Ergebnisse

### Syntax und statische Prüfungen

- 55 JavaScript-Einheiten: bestanden
- AP22F10G-B Bestandsprüfung: bestanden
- AP22F10G-B Korrektur 1: bestanden

### Bestehende Browserregression

28 von 28 Prüfungen bestanden. Geprüft wurden weiterhin insbesondere dynamische Kostenartsteuerung, Zählerberechnungen, Teil- und Wohnungssummen, lokalisierte Zahleneingabe, Rerendering, Filter, Seitenwechsel, Persistenz, Rücklesen, Speicherfehler, Vorjahresübernahme, Dublettenschutz, manuelle Kosten, Leerstand, Privatanteil, responsive Darstellung und Browserzoom.

Detaildatei: `regression-browser-test-results.json`

### Korrektur-1-Browserprüfung

15 von 15 Prüfungen bestanden:

1. kompakte Standard-Seitenbreite,
2. linker und rechter Tabelleninnenabstand,
3. Kaltwasserzähler mit blauem Punkt,
4. Warmwasserzähler mit rotem Punkt,
5. übernommener Anfangsstand gesperrt und ausgegraut,
6. Endstand weiterhin bearbeitbar,
7. bewusste Freigabe im Sonderfalldialog,
8. ausschließlich gewählte Zeile entsperrt,
9. Änderung und Speicherung des freigegebenen Sonderfalls,
10. Erhalt nach Browser-Neuladen,
11. keine Dublette bei wiederholter Sonderfallaktion,
12. reale manuelle Einzelwerte erhalten,
13. Gesamtbestand und Jahresarchiv erhalten,
14. interner horizontaler Tabellen-Scroll in schmaler Ansicht,
15. kein globaler Horizontalversatz bei 125 Prozent Browserzoom.

Detaildatei: `browser-test-results.json`

## Laufzeit

In beiden Browserprüfungen wurden keine `pageerror`- oder `console.error`-Ereignisse festgestellt.
