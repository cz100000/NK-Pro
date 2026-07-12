# NK-Pro V99.4.1 – Prüfbericht der ChatGPT-Arbeitsbasis

**Datum:** 12. Juli 2026  
**Ausgang:** NK-Pro V99.4.0 – UX-Grundgerüst und Arbeitskontext  
**Ziel:** NK-Pro V99.4.1 – ChatGPT-Arbeitsbasis und Testdatenstruktur  
**Datenschema:** 5, unverändert

## 1. Umfang der Bereinigung

| Kennzahl | V99.4.0 | V99.4.1 | Veränderung |
|---|---:|---:|---:|
| aktive Dateien | 48 | 51 | zusätzliche Prüf- und Steuerdateien |
| unkomprimierte Größe | 3.924.520 Bytes | 1.582.030 Bytes | −59,7 % |
| Textzeilen | 114.462 | 32.892 | −71,3 % |
| Testdaten | 2.752.134 Bytes | 470.008 Bytes | −82,9 % |
| `js/app.js` | 775.784 Bytes | 579.843 Bytes | −25,3 % |

Die aktive ZIP enthält trotz zusätzlicher Prüfroutinen nur noch rund 40 % des vorherigen unkomprimierten Umfangs.

## 2. Nachweise

### JavaScript-Syntax

- 6 von 6 produktiven JavaScript-Einheiten fehlerfrei.
- `js/default-seed.js` wird vor `js/app.js` geladen.
- `service-worker.js` ist syntaktisch gültig.

### SEED-Trennung

- Der Objektliteral-Inhalt des bisherigen `SEED` stimmt bytegenau mit `js/default-seed.js` überein.
- Der restliche Inhalt von `js/app.js` unterscheidet sich ausschließlich durch die beabsichtigte SEED-Auslagerung und die Versionsangaben.
- Fachfunktionen wurden nicht umgeschrieben.

### Referenzdaten

Alle sechs logischen Referenzfälle werden aus einer Basis und fünf Patches rekonstruiert und gegen feste kanonische SHA-256-Werte geprüft:

| Fall | Patch-Operationen | Ergebnis |
|---|---:|---|
| Standardfall | 0 | identisch |
| Mieterwechsel | 26 | identisch |
| Leerstand | 3 | identisch |
| Eigentümer M000 | 2 | identisch |
| alle Eingabequellen | 25 | identisch |
| Altdatenmigration | 16 | identisch |

### Release-Konsistenz

Geprüft und bestanden:

- App-, Paket-, Manifest- und Projektversion V99.4.1,
- Datenschema 5,
- Skriptreihenfolge,
- PWA-App-Shell einschließlich `js/default-seed.js`,
- Cachewechsel auf `nk-pro-v99-4-1`,
- Entfernung alter Caches in der Service-Worker-Simulation,
- Entfernung der fünf redundanten Vollkopien,
- Vorhandensein von Projektstand und Arbeitsregeln.

## 3. Browserregression

Die 19 vorhandenen Playwright-Tests wurden gestartet. Ein dateibasierter Manifest-/PWA-Test bestand. Die 18 browserabhängigen Tests konnten in der aktuellen Ausführungsumgebung nicht ausgeführt werden, weil:

1. der Playwright-Browser nicht lokal installiert war,
2. der Browserdownload wegen fehlender DNS-/Netzwerkverbindung nicht möglich war,
3. das vorhandene System-Chromium bereits bei einer leeren Testseite durch Container-, DBus- und Netlink-Beschränkungen hängen blieb.

Es wurde kein fachlicher oder anwendungsbezogener Testfehler festgestellt; der Browser startete nicht bis zur Anwendung. Vor Verwendung als freigegebene Produktivversion ist die Playwright-Suite auf einem normalen Entwicklungsrechner vollständig auszuführen:

```bash
npm ci
npx playwright install chromium
npm test
```

Alternativ kann ein vorhandenes Chromium angegeben werden:

```bash
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

## 4. Ergebnis

Die Arbeitsbasis ist strukturell, syntaktisch, datenbezogen und versionsseitig konsistent. Die fachliche Browserregression bleibt wegen der beschriebenen Umgebungsgrenze noch als externer Freigabenachweis offen.
