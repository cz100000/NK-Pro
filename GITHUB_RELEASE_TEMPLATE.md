# NK-Pro – GitHub Release Template

> Diese Vorlage ist für jede veröffentlichte Version vollständig auszufüllen. Nicht zutreffende Punkte werden mit „nicht betroffen“ beantwortet, nicht gelöscht.

## Release

**Version:** `Vx.y.z`  
**Titel:**  
**Datum:** `YYYY-MM-DD`  
**Datenschema:**  
**Basisversion:**  
**Release-Status:** Entwurf / Test / Freigabefähig / Gesperrt

## Kurzfassung

Beschreibe in drei bis fünf Sätzen:

- was geändert wurde,
- warum es geändert wurde,
- welche Bereiche ausdrücklich unverändert blieben.

## Commit Summary

```text
NK-Pro Vx.y.z: <knappe Zusammenfassung>
```

## Commit Description

```text
- Ausgangsversion:
- Hauptänderung:
- Fachlogik betroffen: ja/nein
- Datenmodell betroffen: ja/nein
- Archive betroffen: ja/nein
- Migration erforderlich: ja/nein
- Tests:
- Dokumentation:
```

## Technische Änderungen

### Dateien geändert

- 

### Dateien neu

- 

### Dateien entfernt

- 

### Architekturwirkung

- vorhandene Funktion genutzt:
- vorhandene Funktion erweitert:
- Struktur vereinfacht:
- Struktur modularisiert:
- neue Architektur eingeführt:
- Begründung:

## Fachliche Änderungen

- Berechnung:
- Kostenarten:
- Umlageschlüssel:
- Zähler:
- Vorauszahlungen:
- Briefe:
- Archiv:
- Import/Export:

## Datenmodell und Migration

**Datenschema geändert:** ja/nein  
**Von:**  
**Nach:**  
**Migrations-ID:**  
**Vor-Migrationsbackup:**  
**Rollback/Wiederherstellung:**  
**Idempotenz geprüft:** ja/nein  
**Historische Archive geprüft:** ja/nein

### Stop-Regel

- Zweifel oder mögliche Datenwirkung festgestellt: ja/nein
- Ist-Zustand dokumentiert: ja/nein
- mindestens zwei Lösungswege bewertet: ja/nein
- Nutzerentscheidung vorhanden: ja/nein
- WORKBOOK-Entscheidungs-ID:

## Testergebnis

| Prüfung | Ergebnis | Nachweis |
|---|---|---|
| Syntaxprüfung |  |  |
| Browserkonsole |  |  |
| Chromium |  |  |
| Playwright |  |  |
| Referenzfälle |  |  |
| Export |  |  |
| Import |  |  |
| Migration |  |  |
| Rollback |  |  |
| PWA |  |  |
| Cache |  |  |
| Release Audit |  |  |
| App Self Test |  |  |
| Druck/PDF |  |  |
| Datenschutzprüfung |  |  |

**Tests bestanden:**  
**Tests fehlgeschlagen:**  
**Tests übersprungen:**  
**Freigabeentscheidung:**

## Berechnungs- und Referenznachweis

- Standardfall:
- Mieterwechsel:
- Leerstand:
- Eigentümer/Privat M000:
- Eingabequellen:
- Zählerfortschreibung:
- Summen/Salden:

## Bekannte Einschränkungen

- 

## Sicherheits- und Datenschutz-Hinweise

- lokale Datenhaltung:
- Backup-Empfehlung:
- enthaltene Produktiv-/Testdaten:
- öffentliche Veröffentlichung zulässig: ja/nein

## Upgrade-Hinweise

1. Gesamt-JSON sichern.
2. PWA/Browsercache gemäß Releasehinweis aktualisieren.
3. neue Version öffnen.
4. Migrationsmeldung prüfen.
5. Referenz- oder Stichprobenabrechnung öffnen.
6. neue Gesamtsicherung erzeugen.

## Downgrade-Hinweise

- unterstützter Rückweg:
- benötigte Sicherung:
- nicht rückwärtskompatible Felder:

## Release Notes

### Neu

- 

### Verbessert

- 

### Behoben

- 

### Unverändert geschützt

- historische Abrechnungen:
- Berechnungsergebnisse:
- Import-/Exportformate:
- PWA:

## Roadmap

- nächster geplanter Schritt:
- bewusst nicht Bestandteil dieses Releases:

## Prüfsummen

- `SHA256SUMS.txt` aktualisiert: ja/nein
- ZIP-SHA-256:
