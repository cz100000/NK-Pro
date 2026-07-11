# NK-Pro Release-Checkliste

Diese Checkliste ist vor jeder neuen Version abzuarbeiten.

## 1. Versionsdisziplin

- [ ] neue Versionsnummer vergeben
- [ ] alte Version nicht überschrieben
- [ ] Titel, App-Version und Versionsname aktualisiert
- [ ] Änderungsbeschreibung im Changelog ergänzt
- [ ] Cache-Version im Service Worker bei Web-Update erhöht

## 2. Architekturprüfung

- [ ] Änderung einer Schicht zugeordnet
- [ ] Datenmodell, Berechnungslogik und Oberfläche nicht unnötig vermischt
- [ ] keine neue Fachregel in der UI implementiert
- [ ] keine bestehende Formel dupliziert
- [ ] Berechnungsfunktion verändert nicht unbemerkt den Zustand
- [ ] Renderfunktion verändert keine fachlichen Daten
- [ ] Migration läuft nur beim Laden oder Import
- [ ] Speicher- und Renderweg sind kontrolliert
- [ ] betroffene abhängige Ansichten sind dokumentiert

## 3. Fachlogik

- [ ] Berechnungslogik nur geändert, wenn ausdrücklich beauftragt
- [ ] Referenzwerte vor der Änderung gesichert
- [ ] Summen, Salden und Anteile gegen Referenzversion verglichen
- [ ] historische Archive bleiben unverändert
- [ ] Wasserfortschreibung geprüft
- [ ] Vorauszahlungen geprüft
- [ ] manuelle Umlagen geprüft
- [ ] Eigentümer-/Privatanteile geprüft
- [ ] Mieterwechsel und Leerstand berücksichtigt

## 4. Daten und Speicherung

- [ ] Datenmodell normalisiert
- [ ] Import alter Daten geprüft
- [ ] Prüfsumme und Rückfallstand geprüft
- [ ] Speichern und erneutes Laden geprüft
- [ ] LocalStorage-Größe plausibel
- [ ] kein personenbezogener Testdatensatz im Repository

## 5. Oberfläche

- [ ] Startseite geprüft
- [ ] alle Tabs geöffnet
- [ ] keine doppelten HTML-IDs
- [ ] Eingabefokus und Navigation plausibel
- [ ] Qualitätsprüfung aktualisiert
- [ ] Briefe und Druckansicht geprüft
- [ ] mobile Darstellung stichprobenartig geprüft

## 6. Technische Tests

- [ ] JavaScript-Syntax geprüft
- [ ] Service-Worker-Syntax geprüft
- [ ] Manifest gültig
- [ ] App-Selbsttest ohne Fehler
- [ ] Release-Audit ohne Fehler
- [ ] Browser-Smoke-Test durchgeführt
- [ ] Konsolen- und Seitenfehler geprüft
- [ ] Referenzvergleich zur Vorversion durchgeführt
- [ ] nicht durchführbare Tests ausdrücklich dokumentiert

## 7. Veröffentlichung

- [ ] README bei Bedarf aktualisiert
- [ ] SHA256-Prüfsummen aktualisiert
- [ ] Commit-Nachricht eindeutig
- [ ] Push erfolgreich
- [ ] GitHub Pages Deployment erfolgreich
- [ ] veröffentlichte Version auf PC geprüft
- [ ] veröffentlichte Version auf iPhone geprüft
- [ ] Offline-Start geprüft
- [ ] Update-Verhalten geprüft

## Freigabeentscheidung

- [ ] keine blockierenden Fehler
- [ ] verbleibende Hinweise dokumentiert
- [ ] Version als aktuelle Arbeitsversion freigegeben
