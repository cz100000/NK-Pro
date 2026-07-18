# AP22F4B – Schutz-Hash-Bericht

## Ausgangsbasis
SHA-256 der produktiven Ausgangs-ZIP:

`aa084a8d403b02a0de8fa67d9e20f8d18d5f716ff36db4d56730a8ebd3c9d6a9`

## Geschützte Gesamtdateien
| Datei | Soll-SHA-256 | Ergebnis |
|---|---|---|
| `js/navigation.js` | `2e9e2c4b0fd8059640c0db073cf47a56364deca484f07dddbc68f7380a49375e` | identisch |
| `js/billing-context.js` | `5027295c32fc214b80b07f3d35b4e06186a911995e35d2cb9787fdc99f23f1e8` | identisch |
| `js/object-standard.js` | `64f68daf6c5a5100482403637c2b24c64001dbbfabc69e77112ad47b41a89046` | identisch |
| `js/master-data-actions.js` | `5bcdc4eaadc3875da740d30ae5551c8edcc2429f24f2c7777d149b5227f87c82` | identisch |
| `js/state-access.js` | `4e4cd3e72edac6f611a8c4e7bc05f313c539f898f60ff1843ce36332772e827d` | identisch |
| `js/app-state-persistence.js` | `a337f6c2126d4aeb70dcb702523d5c2f9af2561d3d2f275cdc25dd03047868b8` | identisch |
| `js/persistence.js` | `c22eab211ae2d080ce82b3050f83edf173752e610688050330f0f12547cd6c6b` | identisch |
| `js/migration.js` | `24db7607caca48ce1fb244f8bc0d9f3b4835a5e53c47868f02a673c9e9722828` | identisch |
| `js/backup-recovery.js` | `92b2f1df919acf425be770eb554373a23fc54b792249bbb33e88229475760bc7` | identisch |
| `js/archive.js` | `4f148c7df20d5301f4902fd464b584fd39eaa713da9a6a20820a2dfc1ef9c87e` | identisch |
| `js/billing-snapshot.js` | `65148329226ab031e9bcab3f03d9403cd017ecb2a841a3c0dc2373fec0e12b47` | identisch |
| `js/application-actions.js` | `f707a5e41b351b2de16880406fa0bb41d238875e081405e28f4a7691afa23201` | identisch |
| `js/ui-master-data.js` | `73a29dfa8cd0fdaeda8c39a9e39a2643e28d6f9ff1bff6f3a4e65cc365677207` | identisch |

## Bestehende Regressionstests
Alle **74** im AP22F4A-Planungspaket verzeichneten bestehenden Regressionstestdateien stimmen bytegenau mit ihren freigegebenen SHA-256-Werten überein.

## Fragment- und Funktionsschutz
- `index.html`: produktive Strukturänderung auf `section#wohnungsverwaltung` und freigegebene Release-/Assetkennungen begrenzt
- `js/ui-navigation-pages.js`: fachliche Änderung auf die UI-Aufbereitung in `renderStartUnitManagement()` begrenzt; bestehende fünf Schreibausdrücke erhalten
- `js/ui-page-controller.js`: Seitenkonfiguration und generische Read-only-Deaktivierung ergänzt; andere Fachrenderer unverändert
- Navigation und Abrechnungskontext: durch unveränderte geschützte Dateien abgesichert

## Korrektur 1
Die visuelle Nachkorrektur betrifft ausschließlich `assets/app.css`, `ui-reference/reference.css`, die bereits neuen AP22F4B-Tests, Screenshots und Abschlussdokumente. Sämtliche geschützten Produktdateien und bestehenden Regressionstests bleiben unverändert.

## Ergebnis
**BESTANDEN: 13 geschützte Dateien und 74 bestehende Regressionstestdateien unverändert.**
