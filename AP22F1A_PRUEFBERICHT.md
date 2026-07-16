# AP22F1A – Prüfbericht

## AP22F1A-Releasegate

| Prüfung | Ergebnis |
|---|---:|
| `npm run release:check` | PASS |
| `npm run test:ap22f1a:static` | PASS |
| globale Schale/Kontext statisch | PASS |
| Seitenkopfmatrix, 18 Ansichten | PASS |
| Schutztest, 12 Hashbereiche | PASS |
| `npm run test:ap22f1a:browser` | PASS, 10/10 |
| sechs Ziel-Viewports ohne Dokument-Overflow-X | PASS |
| Bearbeiten, Nur ansehen, Archiv, kein Kontext | PASS |
| vollständiger Zeitraum und vollständiges Modusverbot | PASS |
| Schreibschutz-Notice und `Zur Bearbeitung öffnen` | PASS |
| Tastaturfokus und mobile Aktionsstapelung | PASS |
| Referenzbibliothek ohne Modusfeld | PASS |

## Bestandsschutz

| Bereich | Ergebnis |
|---|---:|
| vollständiges Navigations-`aside` | SHA-256 identisch |
| Navigation außerhalb freigegebenem Kontext-Provider/-Renderer | SHA-256 identisch |
| `js/billing-context.js` | SHA-256 identisch |
| Berechnung, Persistenz, Migration, Backup, Archiv, Export | SHA-256 identisch |
| Dokumentdaten und Dokumentrenderer | SHA-256 identisch |
| Service-Worker-Funktionslogik | SHA-256 identisch nach Buildkonstanten-Normalisierung |
| AP13 statisch und Chromium | PASS, 8/8 Browserfälle |
| AP21B2 statisch und Chromium | PASS, 3/3 Browserfälle |
| Syntax | PASS, 55 Einheiten |
| Fixtures | PASS, 6 Fälle |
| Zählerregression | PASS |
| Architektur AP6/AP7/AP8/AP9/AP13/AP21/AP21B2 | PASS |
| AP21C | PASS |

## Unveränderte historische Testkonflikte

Die folgenden Altprüfungen wurden ausgeführt, aber nicht als AP22F1A-Releasegate gewertet, weil ihre erwarteten Zustände durch spätere freigegebene Pakete oder die vorrangige Nutzerentscheidung ausdrücklich ersetzt wurden:

- AP11/AP14: frühere Navigationsstruktur beziehungsweise AP21A-Titel.
- AP19/AP20: erwartetes `[data-global-billing-mode]` und Modustexte; diese Assertions widersprechen dem AP22F1A-Auftrag unmittelbar.
- AP21A/ältere Smoke-Tests: fest verdrahtete V99.4.24- und frühere Navigationswerte.
- AP22A–AP22D: fest verdrahtete UI-Designsystemversionen 1.0.0–1.3.0 statt 1.4.0.

Die bestehenden Dateien wurden gemäß Vorgabe nicht geändert. Es wurde keine Produktabweichung festgestellt, die eine Änderung außerhalb des freigegebenen Systembereichs erfordert.

## Eingangs- und Schutz-Hashes

- Produktive Eingangs-ZIP: `f89ff320bff895c3378467cd0c89be1a54ac4fbc84d36c94637570e67581d31b`
- Planungsartefakte-ZIP: `ce68f2e8699c67f173faed30a0c64b4b5dfda3cf26f3ffcae401f1f1bf5495e5`
- vollständiges Navigations-`aside`: `9beb233787dc382c5b56a9ae8cdfce03447fa8e3bf8cd8b8843435b14603b427`
- `js/billing-context.js`: `5027295c32fc214b80b07f3d35b4e06186a911995e35d2cb9787fdc99f23f1e8`
- `js/billing-calculation.js`: `2d1a130455e6dc0e2b541f80edeb9c12cfd8ffe9f9b0460f368f35030e7050c2`
- `js/persistence.js`: `c22eab211ae2d080ce82b3050f83edf173752e610688050330f0f12547cd6c6b`
- `js/migration.js`: `24db7607caca48ce1fb244f8bc0d9f3b4835a5e53c47868f02a673c9e9722828`
- `js/backup-recovery.js`: `92b2f1df919acf425be770eb554373a23fc54b792249bbb33e88229475760bc7`
- `js/archive.js`: `4f148c7df20d5301f4902fd464b584fd39eaa713da9a6a20820a2dfc1ef9c87e`
- `js/export-service.js`: `4954c06643fe10afbaa03f7c89aca36a4e20a3fd0336fccca65e1b615b280b87`
- `js/document-renderer.js`: `def7bbc7a6fb53c0937840c89ae920b13f2ec710ef0484fa2b4859fef214edda`
- `js/document-data.js`: `b96bc414bdd7604962994cd8598fd2832e4d66523799f3051dfc4877317a9775`
