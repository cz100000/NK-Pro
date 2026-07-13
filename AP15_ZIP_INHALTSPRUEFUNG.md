# AP15 – ZIP-Inhaltsprüfung

## Ausführung

```bash
node tools/check-release-contents.cjs --ignore-node-modules --strict
```

Die Prüfung untersucht rekursiv:

- eingebettete Archive und alte Versions-ZIPs
- `node_modules`, Browser-, Cache- und Testausgaben
- Backup-, Temporär-, Log- und Trace-Dateien
- historische visuelle Referenzen und Kontroll-PDFs
- historische AP-Artefakte außerhalb der aktuellen Dokumentation
- unerwartet große Dateien
- absolute lokale Entwicklungspfade
- inkonsistente App-, Manifest-, Paket- und Cacheversionen

Die Prüfung entfernt nichts automatisch. `--json` erzeugt eine maschinenlesbare Ausgabe. Bei `--strict` endet sie bei Befunden mit einem Fehlerstatus. Die aktuell einzige bewusst erhaltene historische Testbaseline ist `AP9_BASELINE_INVENTORY.json`, weil ein aktueller Architekturtest sie direkt einliest.
