# AP9 – Datenfluss, Zustandszugriff und Commit

## Rollen

| Schicht | Darf | Darf nicht |
|---|---|---|
| `ui-events.js` | Ereignisse delegieren, DOM-Kontext erfassen | Fachlogik, Zustandsmutation |
| `ui-controller.js` | Aktionskennung auf Handler abbilden | DOM, Speicher, Fachzustand |
| `ui-bindings.js` | UI-Argumente aufbereiten, Dialoge/Meldungen/Navigation präsentieren | Fachregeln, Abrechnungsberechnung |
| `application-actions.js` | Domäne/Aktion auf echte Moduloperation abbilden | DOM, Speicher, Schattenzustand |
| Anwendungsmodule | normalisieren, Fachmodule koordinieren, atomar mutieren, Ergebnis liefern | DOM, HTML, Browser-Speicher, zweite Berechnungsengine |
| `state-access.js` | aktuellen Einzelzustand bereitstellen, Transaktion, Rollback, Einzelcommit | Fachlogik, DOM, Speicher |
| `commitStateChange()` | Konsistenz, Persistenz und Rendering zentral koordinieren | parallelen Zustand führen |
| Fachmodule | Berechnung, Objekt-, Zähler- und Snapshotregeln | UI-Navigation, Dialoge |

## Erfolgreiche schreibende Aktion

```text
normalisierte Eingabe
→ Anwendungsmodul
→ NKProStateAccess.transact(mutator, options)
→ tiefe Vorherkopie
→ atomare Mutation am einzigen state
→ optionale Validierung
→ genau ein Adapter-Commit
→ commitStateChange(options)
→ prepareStateForPersistence()
→ NKProPersistence
→ definierte Renderer
→ unveränderliches Aktionsergebnis
```

## Fehlgeschlagene Aktion

```text
Vorherkopie
→ Mutation oder Validierung wirft Fehler
→ replaceState(Vorherkopie)
→ kein Commit
→ keine Persistenz
→ kein Rendering
→ Fehler an UI-Grenze
```

## Finalisierung

`NKProBillingWorkflow.finalize()` prüft Archivmodus, aktiven Arbeitsstand und Abrechnungsbereitschaft. Eine Bestätigung wird als strukturiertes Ergebnis an `ui-bindings.js` zurückgegeben. Erst der bestätigte zweite Aufruf führt die atomare Statusänderung mit kontrolliertem Finalisierungs-Schreibbypass aus. Fehlgeschlagene Bereitschaft oder abgelehnte Bestätigung hinterlässt keinen Teilzustand.

## Snapshot-Erzeugung

```text
Archiv/Jahreswechsel/Export
→ NKProBillingWorkflow.createSnapshot()
→ Readiness und vorhandene Normalisierung
→ NKProBillingCalculation.calculateUmlage()
→ NKProBillingSnapshot.createBillingSnapshot()
→ unveränderlicher Snapshot 2
```

Der Snapshotpfad besitzt keinen eigenen Commit, keine Persistenz und kein Rendering. Er verändert weder vorhandene Archive noch historische Snapshots. `NKProBillingSnapshot` bleibt die alleinige Snapshotgrundlage.

## Zustandsersetzung

`transact()` interpretiert Rückgabewerte nicht als neuen Zustand. Eine Root-Ersetzung ist nur mit `replaceStateResult:true` zulässig. Damit können Aktionsergebnisse wie `{ changed:true }` nicht den Arbeitszustand überschreiben.

## Persistenz- und Renderinggrenze

Neue Anwendungsaktionen verwenden weder `localStorage` noch IndexedDB oder Cache Storage. Direkter `localStorage`-Zugriff bleibt ausschließlich in `persistence.js` und `ui-preferences.js`. Dokumentdaten-, Dokumentrenderer- und Exportmodule bleiben zustandsneutral.
