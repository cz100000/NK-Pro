# NK-Pro – Architektur V99.4.23

## Schichten und Einstieg

`index.html` lädt Stylesheet und produktive JavaScript-Module deterministisch. `quality-rules.js` wird vor `quality-assurance.js` geladen; `app.js` bleibt schlanker Anwendungsstart. Service-Worker-Registrierung folgt zuletzt.

## Daten und Persistenz

Datenschema 5, Datenebenenvertrag 1, Objektstandard 1 und Abrechnungssnapshot 2 bleiben unverändert. Bestätigungen werden als additive Metadaten `qualityRuleConfirmationsV2` gespeichert. Ihre Gültigkeit wird durch einen Fingerprint der regelrelevanten Werte geprüft.

## Zentrale Prüfarchitektur

Die Registry definiert 42 Regeln in vier Kategorien und acht fachlichen Gruppen. Eine Auswertung erzeugt einheitliche Ergebnisobjekte, Gruppen, Statussummen und Abschlussbereitschaft. Dashboard, Fachseiten, Cockpit, Workflow und Abnahmeprotokoll verwenden dieselbe Quelle. Technische Ergebnisse werden getrennt als Systemdiagnose gerendert.

`quality-assurance.js` bleibt als Kompatibilitätsadapter für bestehende Aufrufer erhalten. Es existiert keine zweite fachliche Prüfberechnung für Abschluss oder Dashboard.

## UI und Kontext

AP19 stellt weiterhin die Zustände `closed`, `edit` und `view` bereit. AP20-Bestätigungen sind schreibende Aktionen und damit im Ansichtsmodus auf UI-, Ereignis- und Anwendungsebene blockiert. Direkteinstiege navigieren kontrolliert zur betroffenen Seite und Entität.

## Dokumentmodell

`document-data.js`, `document-renderer.js`, `ui-documents.js` und `browser-io.js` bilden weiterhin das gemeinsame DIN-A4-Modell. Vorschau, Druck, PDF und Schwarzweiß verwenden unverändert das AP13-Layout. Nur die Abschluss-/Abnahmeinformationen lesen nun die zentrale Prüfbereitschaft.

## PWA

Der Service Worker verwendet `nk-pro-v99-4-23-ap20` und enthält `quality-rules.js` im App-Shell. Same-Origin-, Offline- und Cachehärtung aus AP15 bleiben erhalten.

## Releasegrenze

Die ZIP enthält produktiven Code, lokale Ressourcen, aktuelle Tests und Projektdokumentation. Installierte Abhängigkeiten, Browserprofile, Testreports und temporäre Dateien werden ausgeschlossen. `SHA256SUMS.txt` deckt jeden enthaltenen Projektbestand ab.
