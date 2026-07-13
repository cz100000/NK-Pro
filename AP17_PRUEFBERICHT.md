# AP17 – Prüfbericht

## Abschlussstatus

**Änderungen umgesetzt – NK-Pro V99.4.20**

Die technische Basis wurde als NK-Pro V99.4.19, AP16-Korrekturstand „Mockupnahe UI“, bestätigt. Datenschema 5 und Datenebenenvertrag 1 blieben unverändert. AP17 wurde ausschließlich auf dieser Projektbasis umgesetzt.

## Ergebnisübersicht

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax | bestanden, 51 Einheiten |
| Referenz-/Fixture-Daten | bestanden, 6 Fälle |
| Zählerdomäne | bestanden |
| Architektur- und statische Regression AP6–AP17 | bestanden |
| Release-Inhaltsprüfung | bestanden, 153 Dateien geprüft; `node_modules` ausgeschlossen |
| Release-Konsistenz | bestanden |
| Browserregression | 80 Tests erkannt, 77 bestanden, 3 optionale Tests übersprungen, 0 fehlgeschlagen |
| Navigation | bestanden |
| Tastatur und Fokus | bestanden |
| Responsive | bestanden |
| PWA/Offline | Service-Worker-Semantik und reguläre App-Shell-Prüfung bestanden |
| Brief, Druck, PDF und Schwarzweiß | bestanden, 8 AP13-Regressionsfälle |
| Start aus bereinigter Release-Kopie | bestanden; alle 6 AP17-Browsertests grün |

Die Browsermatrix wurde seriell und aufgrund des externen Befehlslaufzeitlimits in reproduzierbaren Projektgruppen ausgeführt. Es gab keine fachlichen oder technischen Testfehler.

## AP17-Kennzahlen

| Kennzahl | Ergebnis |
|---|---:|
| neue Substartseiten | 2 |
| reale Dashboardwerte | 15 |
| eindeutig markierte DUMMY-/Vorschauwerte | 15 |
| dokumentierte offene Fachlogiken | 6 |
| entfernte oder umgewandelte Kacheln | 119 |
| geprüfte und vereinheitlichte Abrechnungsicons | 11 |

## Navigation, Tastatur und Fokus

Alle vier Navigationsgruppen lassen sich unabhängig öffnen und schließen. Der Zustand wird gespeichert, direkte Seitenaufrufe öffnen die zugehörige Gruppe automatisch, die aktive Unterseite bleibt erkennbar und die Bedienung per Maus und Tastatur einschließlich Fokus- und ARIA-Zuständen ist geprüft.

## Responsive-Prüfung

Die Bereichs-Dashboards, die globale Abrechnungskontextleiste, die Navigation und die kompakten Inhaltsköpfe wurden für Desktopansichten, 760 px, 390 px sowie geringe Fensterhöhen geprüft. Es wurden keine horizontalen Überlagerungen oder abgeschnittenen Bedienelemente festgestellt.

## PWA- und Offlineprüfung

Der reguläre Service-Worker-Test hat App-Shell, Cachebegrenzung, Same-Origin-Regel, Cachebereinigung und Offline-Navigationsfallback erfolgreich geprüft. Der zusätzlich erzwungene optionale reale Loopback-Offline-Test konnte in der Ausführungsumgebung nicht bewertet werden, weil Chromium den initialen Aufruf von `127.0.0.1` durch eine Administratorrichtlinie blockierte, bevor NK-Pro geladen wurde. Dies ist eine Einschränkung der Testumgebung und kein Anwendungsfehler.

## Brief-, Druck- und PDF-Regression

Alle acht AP13-Browserregressionen sind bestanden. Bestätigt wurden unter anderem DIN-A4-Struktur, Seitenumbrüche, Abschlussblock, Vorauszahlungsanpassung, Vorzeichenlogik, Schwarzweißmodus, Vorschauverhalten und lange Empfängerdaten. Das AP13-Layout wurde nicht verändert.

## Bekannte Einschränkungen

1. Die 15 Vorschauwerte besitzen bewusst noch keine produktive Fachlogik.
2. ARB5 bleibt der verbindliche Einzelobjekt-Kontext; Mehrgebäude- und Mehrabrechnungsauswahl gehören nicht zu AP17.
3. Der optionale reale Loopback-Offline-Browsertest ist in dieser Umgebung administrativ blockiert. Die verpflichtenden Service-Worker- und App-Shell-Prüfungen sind bestanden.

## Reproduzierbarkeit

Die finale ZIP enthält keine installierten Abhängigkeiten, generierten Browserberichte, Browserprofile, Caches oder eingebetteten Archive. Nach dem Entpacken können die Prüfungen mit `npm ci` und den in `package.json` dokumentierten Testskripten reproduziert werden.
