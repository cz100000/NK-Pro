<!-- AP9-CURRENT -->
# Architekturstand V99.4.10

Die Anwendungsschicht besteht aus `application-actions.js` als Aktionsregister, drei DOM-/speicherfreien Orchestrierungsmodulen und `state-access.js` als atomarer Einzelzustandsgrenze. UI-Dialoge und Navigation bleiben in `ui-bindings.js`; Persistenz bleibt in `persistence.js`; Berechnung bleibt in `billing-calculation.js`; Snapshots bleiben in `billing-snapshot.js`. Details: `AP9_DATENFLUSS_UND_COMMIT.md`.

# NK-Pro – Architektur

**Ist-Stand:** V99.4.9  
**Datenschema:** 5  
**Datenebenenvertrag:** 1  
**Objektstandard:** 1  
**Zähler-/Messstandard:** 1  
**Abrechnungssnapshot:** 2, kompatibel zu 1  
**Architekturversion:** 2

## AP7-UI-Architektur

```text
DOM-Ereignis → NKProUiEvents → NKProUiController → NKProUiBindings
             → Anwendungs-/Fachdienst → Ergebnis/State → Renderer → Persistenzadapter
```

`app.js` registriert keine DOM-Ereignisse. Controller und State-Access sind DOM- und speicherfrei. Fachmodule bleiben DOM-frei; Renderer führen keine Persistenz aus. `state` bleibt der einzige Anwendungszustand.

## 1. Laufzeit

NK-Pro läuft ohne Framework und ohne Buildschritt als lokale HTML/CSS/JavaScript-PWA. Produktive Daten verbleiben im Browser oder in explizit heruntergeladenen Dateien.

## 2. Schichten

1. **UI und Navigation:** `app.js`, `navigation.js`, `ui-table-tools.js`.
2. **Anwendungsstart und Kompatibilität:** `app-bootstrap.js`, `compatibility.js`.
3. **Abrechnungsfachlogik:** `billing-calculation.js`.
4. **Zähler- und Verbrauchsfachlogik:** AP5-Module `meter-*`.
5. **Dokumentdaten und Ausgabe:** `document-data.js`, `document-renderer.js`, `export-service.js`.
6. **Objekt und Snapshot:** `object-standard.js`, `billing-snapshot.js`.
7. **Datenzugriff und Lebenszyklus:** `persistence.js`, `migration.js`, `archive.js`, `backup-recovery.js`.
8. **Nicht fachliche UI-Persistenz:** `ui-preferences.js`.

## 3. Abrechnungsarchitektur

`billing-calculation.js` enthält die zentrale Kostenverteilung, Verbrauchszuordnung, Vorauszahlung, Saldenbildung und Vorauszahlungsanpassung. Das Modul enthält keine DOM- oder Browser-Speicherzugriffe. UI, Dokumente und Exporte verwenden dasselbe Berechnungsergebnis.

Die vorhandenen AP5-Zählermodule bleiben verbindliche Quelle für Zählerstammdaten, Messwerte, Messperioden, Zuordnungen, Wechsel und Verbrauch. Der Stromzähler-Dummy ist weiterhin vollständig gespeichert, aber fachlich ausgeschlossen.

## 4. Dokument-, Druck- und Exportarchitektur

```text
Arbeitsstand / Snapshot
        ↓
billing-calculation.js
        ↓
document-data.js
        ↓
document-renderer.js
        ↓
UI-Drucksteuerung
```

Exporte verwenden `export-service.js`. Dieses Modul serialisiert vorhandene Fachwerte und löst Downloads aus, führt jedoch keine eigene Abrechnungsberechnung durch.

## 5. Persistenz und Speicherwege

Direkte `localStorage`-Zugriffe existieren produktiv nur in:

- `persistence.js` für Arbeits-, Sicherungs-, Recovery- und Restore-Daten,
- `ui-preferences.js` für nicht fachliche Navigationseinstellungen.

Alle Fach-, Dokument- und Exportmodule sind speicherfrei.

## 6. Anwendungsstart

`app-bootstrap.js` führt sieben benannte Schritte in fester Reihenfolge aus. Start- und Kompatibilitätsstatus sind über `window.__NKPRO_STARTUP__` und `window.__NKPRO_COMPATIBILITY__` diagnostizierbar.

## 7. Globale Kompatibilität

112 globale Funktionsnamen leiten ausschließlich an AP6-Module weiter. Die eigentliche Implementierung liegt jeweils nur im Zielmodul. 534 globale Funktionen und 71 Top-Level-Bindungen verbleiben vorläufig in `app.js`; Details stehen im Inventar.

## 8. PWA

`service-worker.js` verwendet `nk-pro-v99-4-7` und enthält alle produktiven Module in der verbindlichen Ladefolge. Beim Aktivieren werden alte Caches entfernt.

## 9. Verbleibende Grenze

`app.js` bleibt mit 9.030 Zeilen der zentrale UI-Controller und enthält weitere Legacy-Arbeitsabläufe. Der globale Laufzeitkontext wird in AP6 nicht vollständig ersetzt. Weitere Ausgliederungen benötigen jeweils eigene Referenz-, Browser- und Kompatibilitätstests.
