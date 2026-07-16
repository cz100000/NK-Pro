# NK-Pro – Verbindliche UI-Design-Tokens

**Vertragsstand:** AP22E / V99.4.33  
**Umsetzung:** Zielwerte für spätere freigegebene Migrationspakete. AP22E ändert keine produktive CSS-Datei.

## 1. Namensraum und Regeln

Alle zentralen Tokens beginnen mit `--nk-ui-`. Produktive Seiten dürfen keine seitenbezogenen Farb-, Typografie-, Abstands-, Radius-, Schatten-, Fokus- oder Breakpoint-Werte einführen. Neue Tokens benötigen mindestens zwei Komponenten oder eine ausdrücklich freigegebene systemweite Rolle.

## 2. Farben

| Token | Zielwert | Rolle |
|---|---:|---|
| `--nk-ui-color-primary` | `#0f6cbd` | Primäraktion, Auswahl |
| `--nk-ui-color-primary-hover` | `#0b5ca3` | Hover Primäraktion |
| `--nk-ui-color-primary-soft` | `#eaf4fc` | aktive/Info-Fläche |
| `--nk-ui-color-success` | `#067647` | Erfolg |
| `--nk-ui-color-success-soft` | `#ecfdf3` | Erfolgsfläche |
| `--nk-ui-color-warning` | `#b54708` | Warnung/Handlungsbedarf |
| `--nk-ui-color-warning-soft` | `#fffaeb` | Warnfläche |
| `--nk-ui-color-danger` | `#b42318` | Fehler/Destruktiv |
| `--nk-ui-color-danger-soft` | `#fef3f2` | Fehlerfläche |
| `--nk-ui-color-special` | `#6941c6` | nur freigegebene besondere Fachrolle |
| `--nk-ui-color-special-soft` | `#f4f0ff` | besondere Fachfläche |
| `--nk-ui-color-context` | `#fff3c5` | Abrechnungskontext |
| `--nk-ui-color-context-border` | `#e7cd7d` | Kontextbegrenzung |
| `--nk-ui-color-navigation` | bestehender V99.4.32-Wert | geschützte Navigation |
| `--nk-ui-color-background` | `#f3f6f9` | Arbeitsflächenhintergrund |
| `--nk-ui-color-surface` | `#ffffff` | Oberfläche |
| `--nk-ui-color-surface-muted` | `#f7f9fc` | ruhige Sekundärfläche |
| `--nk-ui-color-border` | `#d8e3ed` | Standardrahmen |
| `--nk-ui-color-text` | `#173b5a` | Primärtext |
| `--nk-ui-color-text-muted` | `#607083` | Sekundärtext |
| `--nk-ui-color-disabled` | `#9aa8b5` | deaktiviert |
| `--nk-ui-color-focus` | `#155eef` | Fokus |

Bestehende Alias-Tokens wie `--nk-ui-color-accent`, `--nk-ui-color-accent-hover` und `--nk-ui-color-accent-soft` bleiben bis zur kontrollierten Migration kompatibel und werden später auf die Primärrollen abgebildet.

## 3. Typografie

| Token | Zielwert |
|---|---|
| `--nk-ui-font-family` | `"Segoe UI", Arial, sans-serif` |
| `--nk-ui-font-family-mono` | `ui-monospace, SFMono-Regular, Consolas, monospace` |
| `--nk-ui-font-size-xs` | `12px` |
| `--nk-ui-font-size-sm` | `13px` |
| `--nk-ui-font-size-md` | `14px` |
| `--nk-ui-font-size-base` | `15px` |
| `--nk-ui-font-size-lg` | `16px` |
| `--nk-ui-font-size-xl` | `20px` |
| `--nk-ui-font-size-2xl` | `28px` |
| `--nk-ui-font-size-metric` | `32px` |
| `--nk-ui-font-weight-regular` | `400` |
| `--nk-ui-font-weight-medium` | `600` |
| `--nk-ui-font-weight-bold` | `700` |
| `--nk-ui-line-height-tight` | `1.2` |
| `--nk-ui-line-height-heading` | `1.3` |
| `--nk-ui-line-height-body` | `1.5` |

## 4. Abstände

| Token | Wert |
|---|---:|
| `--nk-ui-space-2xs` | `4px` |
| `--nk-ui-space-xs` | `8px` |
| `--nk-ui-space-sm` | `12px` |
| `--nk-ui-space-md` | `16px` |
| `--nk-ui-space-lg` | `24px` |
| `--nk-ui-space-xl` | `32px` |
| `--nk-ui-space-2xl` | `48px` |

Der bisherige 6-px-Wert bleibt nur als Kompatibilitätswert im bestehenden Produktcode. Neue Zielentscheidungen verwenden ausschließlich 4/8/12/16/24/32/48 px.

## 5. Inhaltsbreiten und Seitenabstände

| Token | Zielwert |
|---|---:|
| `--nk-ui-content-narrow` | `760px` |
| `--nk-ui-content-max` | `1180px` |
| `--nk-ui-content-wide` | `1440px` |
| `--nk-ui-page-padding-desktop` | `32px` |
| `--nk-ui-page-padding-medium` | `24px` |
| `--nk-ui-page-padding-narrow` | `16px` |

## 6. Radien

| Token | Wert | Einsatz |
|---|---:|---|
| `--nk-ui-radius-sm` | `6px` | Eingaben, kompakte Elemente |
| `--nk-ui-radius-md` | `8px` | Buttons, Standardflächen |
| `--nk-ui-radius-lg` | `12px` | Karten, Klappboxen |
| `--nk-ui-radius-dialog` | `14px` | Dialoge |
| `--nk-ui-radius-pill` | `999px` | Statuspillen |

## 7. Rahmen und Schatten

| Token | Zielwert |
|---|---|
| `--nk-ui-border-width` | `1px` |
| `--nk-ui-border-width-strong` | `2px` |
| `--nk-ui-shadow-none` | `none` |
| `--nk-ui-shadow-sm` | `0 1px 2px rgba(16,24,40,.06)` |
| `--nk-ui-shadow-md` | `0 8px 24px rgba(16,24,40,.09)` |
| `--nk-ui-shadow-dialog` | `0 20px 48px rgba(16,24,40,.20)` |

## 8. Icons und Steuerelemente

| Token | Zielwert |
|---|---:|
| `--nk-ui-icon-xs` | `16px` |
| `--nk-ui-icon-sm` | `18px` |
| `--nk-ui-icon-md` | `20px` |
| `--nk-ui-icon-lg` | `24px` |
| `--nk-ui-control-height-sm` | `34px` |
| `--nk-ui-control-height` | `40px` |
| `--nk-ui-control-height-lg` | `44px` |

SVG-Linienicons verwenden 1.75–2 px Strichstärke und `currentColor`.

## 9. Fokus und Bewegung

| Token | Zielwert |
|---|---|
| `--nk-ui-focus-ring` | `0 0 0 3px color-mix(in srgb, #155eef 28%, transparent)` |
| `--nk-ui-focus-offset` | `2px` |
| `--nk-ui-transition-fast` | `140ms ease` |
| `--nk-ui-transition-medium` | `200ms ease` |

Reduzierte Bewegung deaktiviert nicht notwendige Übergänge und Animationen.

## 10. Breakpoints

| Token | Zielwert | Bedeutung |
|---|---:|---|
| `--nk-ui-breakpoint-wide` | `1280px` | großer Desktop |
| `--nk-ui-breakpoint-medium` | `900px` | mittlere/schmale Umschaltung |
| `--nk-ui-breakpoint-narrow` | `620px` | einspaltige Kompaktansicht |
| `--nk-ui-breakpoint-low-height` | `700px` | geringe Fensterhöhe |

CSS-Custom-Properties dürfen nicht direkt in Media Queries verwendet werden; die Werte sind dennoch zentrale Vertragswerte und werden in der technischen Umsetzung synchron geführt.

## 11. Z-Ebenen

| Token | Wert | Rolle |
|---|---:|---|
| `--nk-ui-z-base` | `0` | normaler Inhalt |
| `--nk-ui-z-sticky` | `20` | sticky Werkzeuge |
| `--nk-ui-z-navigation-overlay` | `40` | bestehendes Navigations-Overlay |
| `--nk-ui-z-popover` | `60` | Menüs/Popover |
| `--nk-ui-z-dialog-backdrop` | `80` | Dialoghintergrund |
| `--nk-ui-z-dialog` | `90` | Dialog |
| `--nk-ui-z-toast` | `100` | globale Rückmeldung |

## 12. Umsetzungsgrenze AP22E

Diese Datei definiert Zielwerte. Produktive Tokens in `assets/app.css` bleiben in AP22E unverändert. Abweichende vorhandene Werte werden erst in freigegebenen Migrationspaketen je vollständig migriertem Seitenbereich technisch angeglichen.
