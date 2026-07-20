# Vollständiges Regel- und Prüfungsinventar

**Release-Kandidat:** V99.4.65 · **Stand:** 20.07.2026 · **Datenschema:** 5

Das Inventar enthält **87 produktive Regeln**. Reine Playwright-, Fixture-, Syntax-, Integritäts- und Regressionstests sind nicht enthalten. Führende maschinenlesbare Fassung: `REGEL_UND_PRUEFINVENTAR.json`.

## Zusammenfassung

| Typ | Anzahl |
|---|---:|
| Eingabevalidierung | 45 |
| Fachliche Prüfung | 24 |
| Plausibilitätsprüfung | 12 |
| Fachlicher Hinweis | 6 |

| Navigationsbereich | Anzahl |
|---|---:|
| Objekt vorbereiten | 53 |
| Nebenkosten abrechnen | 33 |
| Archiv | 1 |

- Abschlussrelevant: **80**
- Akzeptanz grundsätzlich zulässig: **22**

## Regeln in zentraler Navigationsreihenfolge

### 1. Mindestens eine aktive Wohnung ist vorhanden

- **Regel-ID / Version:** `NKP-FACH-002` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Objekt vorbereiten → Wohnungen (`wohnungsverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-002
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Mindestens eine abrechnungsfähige räumliche Einheit sicherstellen.
- **Datenquellen / Felder:** wohnungen
- **Prüf- oder Berechnungslogik:** Die Liste der Wohnungen muss mindestens eine aktive Wohnung enthalten.
- **Formel:** Anzahl(wohnungen mit Status aktiv) ≥ 1
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Inaktive oder gelöschte Wohnungen zählen nicht.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Wohnungen
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 2. Zählerdatenstruktur fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-001` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METERING_DATA_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Die produktive Zählerdatenstruktur muss vorhanden sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Die produktive Zählerdatenstruktur muss vorhanden sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METERING_DATA_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 3. Zählerdatenversion wird nicht unterstützt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-002` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METERING_VERSION_UNSUPPORTED
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Die gespeicherte Zählerstandard-Version muss vom aktuellen Modul unterstützt werden.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Die gespeicherte Zählerstandard-Version muss vom aktuellen Modul unterstützt werden.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METERING_VERSION_UNSUPPORTED erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 4. Zähler-ID fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-003` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_ID_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Jeder Zähler benötigt eine nicht leere technische ID.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Jeder Zähler benötigt eine nicht leere technische ID.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_ID_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 5. Zähler-ID ist doppelt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-004` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_ID_DUPLICATE
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Zähler-IDs müssen im Bestand eindeutig sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Zähler-IDs müssen im Bestand eindeutig sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_ID_DUPLICATE erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 6. Zählerart fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-005` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_TYPE_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Jeder Zähler benötigt eine fachliche Zählerart.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Jeder Zähler benötigt eine fachliche Zählerart.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_TYPE_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 7. Zählereinheit fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-006` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_UNIT_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Jeder Zähler benötigt eine Einheit.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Jeder Zähler benötigt eine Einheit.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_UNIT_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 8. Einbaudatum ist ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-007` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_INSTALL_DATE_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Das Einbaudatum muss eine gültige ISO-Kalenderangabe sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Das Einbaudatum muss eine gültige ISO-Kalenderangabe sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_INSTALL_DATE_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 9. Ausbaudatum ist ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-008` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_REMOVAL_DATE_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Das Ausbaudatum muss eine gültige ISO-Kalenderangabe sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Das Ausbaudatum muss eine gültige ISO-Kalenderangabe sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_REMOVAL_DATE_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 10. Zähler-Lebensdauer ist umgekehrt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-009` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_LIFETIME_REVERSED
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Das Ausbaudatum darf nicht vor dem Einbaudatum liegen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Das Ausbaudatum darf nicht vor dem Einbaudatum liegen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_LIFETIME_REVERSED erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 11. Strom-Dummy ist nicht ausgeschlossen

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-010` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code ELECTRICITY_DUMMY_NOT_EXCLUDED
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Als Dummy gekennzeichnete Stromzähler dürfen nicht abrechnungsrelevant sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Als Dummy gekennzeichnete Stromzähler dürfen nicht abrechnungsrelevant sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird ELECTRICITY_DUMMY_NOT_EXCLUDED erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 12. Strom-Dummy wird ausgeschlossen

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-011` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code ELECTRICITY_DUMMY_EXCLUDED
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Bestätigt den produktiven Ausschluss eines Strom-Dummys aus Abrechnungswerten.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Bestätigt den produktiven Ausschluss eines Strom-Dummys aus Abrechnungswerten.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird ELECTRICITY_DUMMY_EXCLUDED erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 13. Zählernummer steht im Konflikt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-012` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_NUMBER_CONFLICT
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Physische Zählernummern dürfen nicht unzulässig mehrfach aktiv verwendet werden.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Physische Zählernummern dürfen nicht unzulässig mehrfach aktiv verwendet werden.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_NUMBER_CONFLICT erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 14. Messwert-ID fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-013` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code READING_ID_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Jeder Messwert benötigt eine ID.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Jeder Messwert benötigt eine ID.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird READING_ID_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 15. Messwert-ID ist doppelt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-014` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code READING_ID_DUPLICATE
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Messwert-IDs müssen eindeutig sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Messwert-IDs müssen eindeutig sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird READING_ID_DUPLICATE erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 16. Messwert verweist auf unbekannten Zähler

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-015` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code READING_METER_UNKNOWN
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Die Zählerreferenz eines Messwerts muss existieren.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Die Zählerreferenz eines Messwerts muss existieren.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird READING_METER_UNKNOWN erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 17. Ablesedatum ist ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-016` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code READING_DATE_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Das Ablesedatum muss eine gültige ISO-Kalenderangabe sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Das Ablesedatum muss eine gültige ISO-Kalenderangabe sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird READING_DATE_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 18. Messwert ist ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-017` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code READING_VALUE_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Der Ablesewert muss endlich und numerisch sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Der Ablesewert muss endlich und numerisch sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird READING_VALUE_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 19. Messwert-Einheit passt nicht

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-018` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code READING_UNIT_MISMATCH
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Messwert- und Zählereinheit müssen übereinstimmen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Messwert- und Zählereinheit müssen übereinstimmen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird READING_UNIT_MISMATCH erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 20. Aktiver Messwert ist doppelt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-019` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code READING_DUPLICATE_ACTIVE
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Für denselben Zähler und Stichtag darf nur ein aktiver Messwert bestehen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Für denselben Zähler und Stichtag darf nur ein aktiver Messwert bestehen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird READING_DUPLICATE_ACTIVE erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 21. Korrekturverknüpfung fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-020` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code READING_CORRECTION_LINK_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Ein Korrekturmesswert muss auf den korrigierten Messwert verweisen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Ein Korrekturmesswert muss auf den korrigierten Messwert verweisen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird READING_CORRECTION_LINK_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 22. Zuordnungs-ID fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-021` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code ASSIGNMENT_ID_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Jede Zählerzuordnung benötigt eine ID.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Jede Zählerzuordnung benötigt eine ID.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird ASSIGNMENT_ID_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 23. Zuordnungs-ID ist doppelt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-022` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code ASSIGNMENT_ID_DUPLICATE
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Zuordnungs-IDs müssen eindeutig sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Zuordnungs-IDs müssen eindeutig sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird ASSIGNMENT_ID_DUPLICATE erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 24. Zuordnung verweist auf unbekannten Zähler

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-023` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code ASSIGNMENT_METER_UNKNOWN
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Die Zählerreferenz einer Zuordnung muss existieren.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Die Zählerreferenz einer Zuordnung muss existieren.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird ASSIGNMENT_METER_UNKNOWN erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 25. Zuordnungszeitraum ist ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-024` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code ASSIGNMENT_PERIOD_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Beginn und Ende einer Zuordnung müssen gültige Kalenderdaten sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Beginn und Ende einer Zuordnung müssen gültige Kalenderdaten sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird ASSIGNMENT_PERIOD_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 26. Zuordnungszeitraum ist umgekehrt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-025` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code ASSIGNMENT_PERIOD_REVERSED
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Das Zuordnungsende darf nicht vor dem Beginn liegen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Das Zuordnungsende darf nicht vor dem Beginn liegen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird ASSIGNMENT_PERIOD_REVERSED erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 27. Zählerzuordnungen überschneiden sich

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-026` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code ASSIGNMENT_OVERLAP
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Unvereinbare Zuordnungen desselben Zählers dürfen sich nicht zeitlich überschneiden.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Unvereinbare Zuordnungen desselben Zählers dürfen sich nicht zeitlich überschneiden.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird ASSIGNMENT_OVERLAP erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 28. Messperioden-ID fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-027` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_ID_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Jede Messperiode benötigt eine ID.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Jede Messperiode benötigt eine ID.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_ID_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 29. Messperioden-ID ist doppelt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-028` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_ID_DUPLICATE
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Messperioden-IDs müssen eindeutig sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Messperioden-IDs müssen eindeutig sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_ID_DUPLICATE erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 30. Messperiode verweist auf unbekannten Zähler

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-029` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_METER_UNKNOWN
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Die Zählerreferenz einer Messperiode muss existieren.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Die Zählerreferenz einer Messperiode muss existieren.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_METER_UNKNOWN erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 31. Messperiodenzeitraum ist ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-030` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Beginn und Ende müssen gültige Kalenderdaten sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Beginn und Ende müssen gültige Kalenderdaten sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 32. Messperiodenwerte sind ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-031` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_VALUES_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Anfangs-, End- und Verbrauchswerte müssen numerisch und konsistent sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Anfangs-, End- und Verbrauchswerte müssen numerisch und konsistent sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_VALUES_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 33. Zählerstand ist rückläufig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-032` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_READING_REVERSED
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Der Endstand darf ohne dokumentierten Sonderfall nicht unter dem Anfangsstand liegen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Der Endstand darf ohne dokumentierten Sonderfall nicht unter dem Anfangsstand liegen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_READING_REVERSED erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 34. Messperiode würde doppelt gezählt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-033` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_DOUBLE_COUNT
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Überlappende abrechnungsrelevante Perioden dürfen denselben Verbrauch nicht doppelt einbeziehen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Überlappende abrechnungsrelevante Perioden dürfen denselben Verbrauch nicht doppelt einbeziehen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_DOUBLE_COUNT erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 35. Ausgeschlossener Zähler ist abrechnungsrelevant

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-034` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code EXCLUDED_METER_PERIOD_BILLABLE
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Perioden eines ausgeschlossenen Zählers dürfen nicht in die Abrechnung eingehen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Perioden eines ausgeschlossenen Zählers dürfen nicht in die Abrechnung eingehen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird EXCLUDED_METER_PERIOD_BILLABLE erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 36. Messperiode ohne Zuordnung

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-035` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_ASSIGNMENT_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Für eine abrechnungsrelevante Messperiode muss eine gültige Zuordnung bestehen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Für eine abrechnungsrelevante Messperiode muss eine gültige Zuordnung bestehen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_ASSIGNMENT_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 37. Nutzerzuordnung hat eine Lücke

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-036` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_USER_ASSIGNMENT_GAP
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Die Nutzer-/Fallzuordnung muss den abrechnungsrelevanten Messzeitraum vollständig abdecken.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Die Nutzer-/Fallzuordnung muss den abrechnungsrelevanten Messzeitraum vollständig abdecken.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_USER_ASSIGNMENT_GAP erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 38. Messperiode wurde geschätzt zugeordnet

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-037` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code MEASUREMENT_PERIOD_ALLOCATION_ESTIMATED
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Eine geschätzte Zuordnung wird als prüfpflichtiger Sonderfall ausgewiesen.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Eine geschätzte Zuordnung wird als prüfpflichtiger Sonderfall ausgewiesen.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird MEASUREMENT_PERIOD_ALLOCATION_ESTIMATED erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 39. Zählerwechsel-Referenz ist ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-038` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_REPLACEMENT_REFERENCE_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Alt- und Neuzähler eines Wechsels müssen existieren und verschieden sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Alt- und Neuzähler eines Wechsels müssen existieren und verschieden sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_REPLACEMENT_REFERENCE_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 40. Zählerwechseldatum ist ungültig

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-039` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_REPLACEMENT_DATE_INVALID
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Das Wechseldatum muss eine gültige Kalenderangabe sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Das Wechseldatum muss eine gültige Kalenderangabe sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_REPLACEMENT_DATE_INVALID erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 41. Zählerwechsel ist unvollständig verknüpft

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-040` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_REPLACEMENT_LINK_INCOMPLETE
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Alt- und Neuzähler müssen gegenseitig vollständig dokumentiert sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Alt- und Neuzähler müssen gegenseitig vollständig dokumentiert sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_REPLACEMENT_LINK_INCOMPLETE erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 42. Wechselstände fehlen

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-041` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_REPLACEMENT_READINGS_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Für den Zählerwechsel müssen Ausbau- und Einbaustand vorhanden sein.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Für den Zählerwechsel müssen Ausbau- und Einbaustand vorhanden sein.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_REPLACEMENT_READINGS_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 43. Erforderliche Messperiode fehlt

- **Regel-ID / Version:** `NKP-VAL-ZAEHLER-042` / 1
- **Typ / Kategorie:** Eingabevalidierung / Produktive Eingabevalidierung
- **Navigation:** Objekt vorbereiten → Zähler (`wasser`)
- **Tatsächlicher Prüfungsort:** js/meter-validation.js · Issue-Code METER_PERIOD_MISSING
- **Ausführung / Auslöser:** Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.
- **Fachlicher Zweck:** Für einen abrechnungsrelevanten Zähler fehlt eine passende Messperiode.
- **Datenquellen / Felder:** zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)
- **Prüf- oder Berechnungslogik:** Für einen abrechnungsrelevanten Zähler fehlt eine passende Messperiode.
- **Formel:** Bedingungsprüfung im produktiven Validator; bei Verstoß wird METER_PERIOD_MISSING erzeugt.
- **Toleranz:** Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.
- **Sonderfälle / Ausschlüsse:** Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.
- **Mögliche Ergebnisse:** gültig; Fehler; Hinweis/Sonderfall
- **Konsequenzen:** Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.
- **Abschlusswirkung:** Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 44. Mindestens ein abrechenbares Mietverhältnis ist vorhanden

- **Regel-ID / Version:** `NKP-FACH-003` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-003
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Mindestens einen fachlich abrechenbaren Fall im Zeitraum sicherstellen.
- **Datenquellen / Felder:** mieter, Abrechnungszeitraum
- **Prüf- oder Berechnungslogik:** Mindestens ein Mietverhältnis muss den Abrechnungszeitraum schneiden und als abrechenbarer Mieterfall gelten.
- **Formel:** Anzahl(abrechenbare Mietverhältnisse) ≥ 1
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Eigentümer/Privat und nicht überlappende Zeiträume zählen nicht als Mieterabrechnung.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 45. Mietername ist vorhanden

- **Regel-ID / Version:** `NKP-FACH-004` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-004
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Einen eindeutigen Briefempfänger und Ergebnisfall sicherstellen.
- **Datenquellen / Felder:** mieter.name
- **Prüf- oder Berechnungslogik:** Für jedes relevante Mietverhältnis muss ein nicht leerer Name vorhanden sein.
- **Formel:** trim(mieter.name) ≠ leer
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Prüfung je relevantem Mietverhältnis.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Abrechnung unvollständig).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** Abrechnung unvollständig
- **Produktiv / abschlussrelevant:** Ja / Ja

### 46. Wohnungszuordnung ist vorhanden

- **Regel-ID / Version:** `NKP-FACH-005` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-005
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Jeden Abrechnungsfall einer vorhandenen Wohnung zuordnen.
- **Datenquellen / Felder:** mieter.wohnung, wohnungen.id
- **Prüf- oder Berechnungslogik:** Die Wohnungsreferenz des Mietverhältnisses muss gesetzt sein und auf eine vorhandene Wohnung verweisen.
- **Formel:** mieter.wohnung ∈ IDs(wohnungen)
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Prüfung je relevantem Mietverhältnis.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 47. Mietzeitraum ist logisch

- **Regel-ID / Version:** `NKP-FACH-006` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-006
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Chronologisch gültige Mietzeiträume sicherstellen.
- **Datenquellen / Felder:** mieter.einzug, mieter.auszug
- **Prüf- oder Berechnungslogik:** Einzugs- und Auszugsdatum müssen gültig sein; ein Auszug darf nicht vor dem Einzug liegen.
- **Formel:** ISO(Einzug) ∧ (Auszug leer ∨ ISO(Auszug) ∧ Auszug ≥ Einzug)
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Leeres Auszugsdatum bedeutet fortbestehendes Mietverhältnis.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 48. Mietverhältnisse überschneiden sich nicht

- **Regel-ID / Version:** `NKP-FACH-007` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-007
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Doppelte Belegung derselben Wohnung im selben Zeitraum verhindern.
- **Datenquellen / Felder:** Mietzeiträume je Wohnung
- **Prüf- oder Berechnungslogik:** Zeitintervalle relevanter Mietverhältnisse derselben Wohnung dürfen sich nicht überschneiden.
- **Formel:** für alle Paare a,b: Ende(a) < Beginn(b) ∨ Ende(b) < Beginn(a)
- **Toleranz:** Keine
- **Rundung:** Tagesgenaue inklusive Intervalle
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Nur Mietverhältnisse derselben Wohnung werden paarweise verglichen.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 49. Personenzahl ist für verwendete Schlüssel vorhanden

- **Regel-ID / Version:** `NKP-FACH-008` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-008
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Eine notwendige Personen-Verteilungsgrundlage bereitstellen.
- **Datenquellen / Felder:** mieter.personen, verwendete Umlageschlüssel
- **Prüf- oder Berechnungslogik:** Bei Verwendung eines personenbezogenen Umlageschlüssels muss für jeden relevanten Fall eine positive Personenzahl vorliegen.
- **Formel:** personen > 0
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nur positive Werte
- **Sonderfälle / Ausschlüsse:** Nicht anwendbar ohne personenbezogenen Umlageschlüssel.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 50. Unterjähriges Mietverhältnis

- **Regel-ID / Version:** `NKP-HINW-001` / 1
- **Typ / Kategorie:** Fachlicher Hinweis / Fachlicher Hinweis oder Sonderfall
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-HINW-001
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Unterjährige Belegung transparent machen.
- **Datenquellen / Felder:** Mietzeitraum
- **Prüf- oder Berechnungslogik:** Ein Mietverhältnis beginnt nach Periodenbeginn oder endet vor Periodenende.
- **Formel:** Einzug > Periodenbeginn ∨ Auszug < Periodenende
- **Toleranz:** Keine
- **Rundung:** Tagesgenau
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Reiner Hinweis; korrekte Eingabe erfordert keine Entscheidung.
- **Mögliche Ergebnisse:** Hinweis; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Keine Abschlusswirkung.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Nein

### 51. Leerstand erkannt

- **Regel-ID / Version:** `NKP-HINW-002` / 1
- **Typ / Kategorie:** Fachlicher Hinweis / Fachlicher Hinweis oder Sonderfall
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-HINW-002
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Zeiträume ohne abrechenbaren Mieter kenntlich machen.
- **Datenquellen / Felder:** Aktive Wohnungen und Mietverhältnisse
- **Prüf- oder Berechnungslogik:** Eine aktive Wohnung besitzt für mindestens einen Teil der Abrechnungsperiode keinen abrechenbaren Mieterfall.
- **Formel:** aktive Wohnung − belegte Zeitintervalle > 0 Tage
- **Toleranz:** Keine
- **Rundung:** Tagesgenau
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Leerstand kann als regulärer Abrechnungsfall erfasst sein.
- **Mögliche Ergebnisse:** Hinweis; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Keine Abschlusswirkung.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Nein

### 52. Eigentümer- oder Privatanteil erkannt

- **Regel-ID / Version:** `NKP-HINW-003` / 1
- **Typ / Kategorie:** Fachlicher Hinweis / Fachlicher Hinweis oder Sonderfall
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-HINW-003
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Nicht mieterseitige Fälle transparent kennzeichnen.
- **Datenquellen / Felder:** mieter.abrechnungRolle
- **Prüf- oder Berechnungslogik:** Ein Mietverhältnis ist mit der Abrechnungsrolle Eigentümer/Privat gekennzeichnet.
- **Formel:** abrechnungRolle = Eigentümer/Privat
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Hinweis ohne Sperrwirkung.
- **Mögliche Ergebnisse:** Hinweis; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Keine Abschlusswirkung.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Nein

### 53. Aktive Tage stimmen mit dem Mietzeitraum überein

- **Regel-ID / Version:** `NKP-PLAU-001` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Objekt vorbereiten → Mietverhältnisse (`mieterverwaltung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-001
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Erfasste Miettage gegen den tatsächlichen Mietzeitraum plausibilisieren.
- **Datenquellen / Felder:** mieter.aktiveTage, Mietzeitraum, verwendete Umlageschlüssel
- **Prüf- oder Berechnungslogik:** Erfasste aktive Tage werden mit den inklusiv berechneten Tagen innerhalb des Abrechnungszeitraums verglichen.
- **Formel:** \|aktiveTage − erwarteteTage\| > 1 löst eine Abweichung aus
- **Toleranz:** 1 Tag
- **Rundung:** Kalendertage inklusiv
- **Vorzeichenlogik:** Betrag der Differenz
- **Sonderfälle / Ausschlüsse:** Nur wenn ein tagesabhängiger Schlüssel verwendet wird.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Objekt vorbereiten → Mietverhältnisse
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 54. Abrechnungszeitraum ist gültig

- **Regel-ID / Version:** `NKP-FACH-001` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Übersicht (`start`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-001
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Sicherstellen, dass die Abrechnung auf einem kalendarisch und fachlich gültigen Zeitraum beruht.
- **Datenquellen / Felder:** meta.abrechnungsjahr, meta.abrechnungsbeginn, meta.abrechnungsende
- **Prüf- oder Berechnungslogik:** Beginn und Ende müssen echte ISO-Kalenderdaten sein; Ende darf nicht vor Beginn liegen; das Abrechnungsjahr muss dem Kalenderjahr des Enddatums entsprechen.
- **Formel:** gültig = ISO(Beginn) ∧ ISO(Ende) ∧ Ende ≥ Beginn ∧ Jahr = Jahr(Ende)
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Keine stillschweigende Datumsnormalisierung.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Übersicht · #billingPeriodSettings
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 55. Vorauszahlungsmatrix und Mieterwerte stimmen überein

- **Regel-ID / Version:** `NKP-FACH-015` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Vorauszahlungen (`einnahmen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-015
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Vorauszahlungs-Einzelwerte mit den berechneten Mietersummen abstimmen.
- **Datenquellen / Felder:** vorauszahlungen und berechnete Mieterwerte
- **Prüf- oder Berechnungslogik:** Matrixsumme und aus den Mietverhältnissen abgeleitete Vorauszahlungssumme werden verglichen.
- **Formel:** \|Σ Matrix − Σ Mieterwerte\| > 0,02 €
- **Toleranz:** 0,02 €
- **Rundung:** Anzeige auf Cent
- **Vorzeichenlogik:** Positive/negative Differenz bleibt erhalten
- **Sonderfälle / Ausschlüsse:** Finanzielle Differenzentscheidungen werden führend über abrechnungsPruefungen geführt.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Vorauszahlungen
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 56. NK- und Kaltmietkorrekturen sind getrennt und berechenbar

- **Regel-ID / Version:** `NKP-FACH-020` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Vorauszahlungen (`einnahmen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-020
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Getrennte und berechenbare Korrekturarten sicherstellen.
- **Datenquellen / Felder:** mieter.vorjahresKorrektur und mieter.kaltmietKorrektur
- **Prüf- oder Berechnungslogik:** NK-Vorauszahlungs- und Kaltmietkorrektur werden getrennt numerisch geführt und dürfen sich nicht gegenseitig ersetzen.
- **Formel:** beide Felder unabhängig numerisch; keine vermischte Summierung
- **Toleranz:** Keine
- **Rundung:** Geldwerte auf Cent
- **Vorzeichenlogik:** Positive Werte Gutschrift, negative Werte Nachbelastung gemäß bestehender Vorzeichenlogik
- **Sonderfälle / Ausschlüsse:** Leere Werte werden gemäß bestehender Eingabenormalisierung als 0 behandelt.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Vorauszahlungen
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 57. Erwartete Vorauszahlung fehlt

- **Regel-ID / Version:** `NKP-PLAU-009` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Vorauszahlungen (`einnahmen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-009
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Fehlende erwartete Vorauszahlungen erkennen.
- **Datenquellen / Felder:** aktive Vorauszahlungskosten, Mieterwerte und Vorjahr
- **Prüf- oder Berechnungslogik:** Für einen abrechenbaren Fall und eine aktive Vorauszahlungskostenart fehlt ein plausibler Wert, obwohl Vorjahr oder Vertragsdaten einen Wert erwarten lassen.
- **Formel:** erwartet = wahr ∧ Vorauszahlung = 0/leer
- **Toleranz:** Keine
- **Rundung:** Geldwerte auf Cent
- **Vorzeichenlogik:** Null-/Leerwert
- **Sonderfälle / Ausschlüsse:** Nicht anwendbar bei bewusst fehlender Vorauszahlung.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Vorauszahlungen
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 58. Aktive Kostenarten sind vorhanden

- **Regel-ID / Version:** `NKP-FACH-009` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Gesamtkosten (`einstellungen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-009
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Eine Kostenbasis für die Abrechnung sicherstellen.
- **Datenquellen / Felder:** kostenarten.inNK
- **Prüf- oder Berechnungslogik:** Mindestens eine Kostenart muss für die Nebenkostenabrechnung aktiviert sein.
- **Formel:** Anzahl(kostenarten mit inNK = Ja) ≥ 1
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Deaktivierte Kostenarten zählen nicht.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Gesamtkosten
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 59. Gesamtbetrag der Kostenart ist vorhanden

- **Regel-ID / Version:** `NKP-FACH-010` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Gesamtkosten (`einstellungen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-010
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Vollständige Ausgangskosten sicherstellen.
- **Datenquellen / Felder:** kostenarten.gesamtbetrag
- **Prüf- oder Berechnungslogik:** Jede aktive Kostenart benötigt einen endlichen Gesamtbetrag.
- **Formel:** gesamtbetrag ist numerisch und vorhanden
- **Toleranz:** Keine
- **Rundung:** Geldwerte werden später auf Cent ausgegeben
- **Vorzeichenlogik:** Positive und zulässige negative Korrekturwerte gemäß bestehender Kostenlogik
- **Sonderfälle / Ausschlüsse:** Prüfung je aktiver Kostenart.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Abrechnung unvollständig).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Gesamtkosten
- **Kritische Unterart:** Abrechnung unvollständig
- **Produktiv / abschlussrelevant:** Ja / Ja

### 60. Berechtigte Empfänger der Kostenart sind vorhanden

- **Regel-ID / Version:** `NKP-FACH-011` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Gesamtkosten (`einstellungen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-011
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Mindestens einen zulässigen Empfänger je aktiver Kostenart sicherstellen.
- **Datenquellen / Felder:** kostenartenMieterUmlage, Mietverhältnisse
- **Prüf- oder Berechnungslogik:** Aus Kostenartenzuordnung und relevanten Mietverhältnissen muss mindestens ein berechtigter Abrechnungsfall entstehen.
- **Formel:** Anzahl(berechtigte Fälle) ≥ 1
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Ausschluss- und Rollenlogik der Kostenart wird berücksichtigt.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Gesamtkosten
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 61. Erforderliche Verteilungsgrundlage ist vorhanden

- **Regel-ID / Version:** `NKP-FACH-012` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Gesamtkosten (`einstellungen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-012
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Eine berechenbare Verteilungsgrundlage je Kostenart sicherstellen.
- **Datenquellen / Felder:** Umlageschlüssel, Wohnungen, Mieter, Umlagewerte
- **Prüf- oder Berechnungslogik:** Für den gewählten Umlageschlüssel müssen die jeweils erforderlichen Wohnungs-, Personen-, Tages-, Verbrauchs- oder Einzelwerte vorliegen.
- **Formel:** Nenner(Umlageschlüssel) > 0 und Pflichtwerte vollständig
- **Toleranz:** Keine
- **Rundung:** Gemäß bestehender Umlageberechnung
- **Vorzeichenlogik:** Nur fachlich zulässige Grundlagen
- **Sonderfälle / Ausschlüsse:** Anforderungen unterscheiden sich nach Umlageschlüssel.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Berechnung nicht möglich).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Gesamtkosten
- **Kritische Unterart:** Berechnung nicht möglich
- **Produktiv / abschlussrelevant:** Ja / Ja

### 62. Kostenart weicht stark vom Vorjahr ab

- **Regel-ID / Version:** `NKP-PLAU-002` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Gesamtkosten (`einstellungen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-002
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Ungewöhnliche Kostenentwicklung gegenüber dem Vorjahr erkennen.
- **Datenquellen / Felder:** kostenarten und vergleichbarer Vorjahressnapshot
- **Prüf- oder Berechnungslogik:** Vergleich mit einer passenden Vorjahreskostenart; Abweichung nur bei zugleich relevantem Prozent- und Absolutbetrag.
- **Formel:** \|Δ\| ≥ 100 € ∧ \|Δ/Vorjahr\| ≥ 30 %
- **Toleranz:** 100 € und 30 %
- **Rundung:** Prozentdarstellung gerundet; Vergleich numerisch
- **Vorzeichenlogik:** Zu- und Abnahme werden betragsmäßig geprüft
- **Sonderfälle / Ausschlüsse:** Nicht anwendbar ohne geeigneten Vorjahresvergleich oder bei Vorjahr 0.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Gesamtkosten
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 63. Möglicherweise doppelt erfasste Kosten

- **Regel-ID / Version:** `NKP-PLAU-003` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Gesamtkosten (`einstellungen`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-003
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Doppelerfassung gleichartiger Rechnungen erkennen.
- **Datenquellen / Felder:** Kostenartbezeichnung und Gesamtbetrag
- **Prüf- oder Berechnungslogik:** Aktive Kostenarten mit gleicher normalisierter Bezeichnung und nahezu gleichem Betrag werden paarweise verglichen.
- **Formel:** lower(trim(Name_a)) = lower(trim(Name_b)) ∧ \|Betrag_a−Betrag_b\| < 0,01 €
- **Toleranz:** 0,01 €
- **Rundung:** Keine zusätzliche Rundung
- **Vorzeichenlogik:** Vorzeichen wird berücksichtigt
- **Sonderfälle / Ausschlüsse:** Nur aktive Kostenarten.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Gesamtkosten
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 64. Manuelle Verteilung entspricht dem Gesamtbetrag

- **Regel-ID / Version:** `NKP-FACH-013` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-013
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Manuell verteilte Einzelwerte mit den Ausgangskosten abstimmen.
- **Datenquellen / Felder:** umlageInputs, kostenarten.gesamtbetrag
- **Prüf- oder Berechnungslogik:** Summe der individuellen Werte wird je Kostenart mit dem Gesamtbetrag verglichen.
- **Formel:** Differenz = Σ Einzelwerte − Gesamtbetrag; auffällig bei \|Differenz\| > 0,02 €
- **Toleranz:** 0,02 €
- **Rundung:** Vergleich mit ungerundeten Rechenwerten; Anzeige auf Cent
- **Vorzeichenlogik:** Positive Differenz = Einzelwerte höher; negative Differenz = niedriger
- **Sonderfälle / Ausschlüsse:** Finanzielle Differenzentscheidungen werden führend über abrechnungsPruefungen geführt.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 65. Erforderliche Verbrauchswerte sind vorhanden

- **Regel-ID / Version:** `NKP-FACH-014` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-014
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Alle für Verbrauchsschlüssel notwendigen Messwerte bereitstellen.
- **Datenquellen / Felder:** Verbrauchskosten, umlageInputs und Zählerstände
- **Prüf- oder Berechnungslogik:** Bei aktiven Verbrauchskosten müssen für relevante Fälle aus Eingaben oder Messperioden verwertbare Verbrauchswerte vorliegen.
- **Formel:** für jeden relevanten Fall: Verbrauchswert vorhanden und numerisch
- **Toleranz:** Keine
- **Rundung:** Gemäß Einheit der Kostenart
- **Vorzeichenlogik:** Verbrauch darf nicht unzulässig negativ sein
- **Sonderfälle / Ausschlüsse:** Nicht verbrauchsabhängige Kostenarten sind nicht anwendbar.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Abrechnung unvollständig).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** Abrechnung unvollständig
- **Produktiv / abschlussrelevant:** Ja / Ja

### 66. Kein geeigneter Vorjahresvergleich möglich

- **Regel-ID / Version:** `NKP-HINW-004` / 1
- **Typ / Kategorie:** Fachlicher Hinweis / Fachlicher Hinweis oder Sonderfall
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-HINW-004
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Fehlende Vergleichsbasis transparent erklären.
- **Datenquellen / Felder:** jahresArchiv
- **Prüf- oder Berechnungslogik:** Für einen vorgesehenen Vorjahresvergleich ist kein eindeutig passender Snapshot vorhanden.
- **Formel:** passender Vorjahressnapshot = nicht vorhanden
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Hinweis ohne Abschlusswirkung.
- **Mögliche Ergebnisse:** Hinweis; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Keine Abschlusswirkung.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Nein

### 67. Nullverbrauch bei belegter Wohnung

- **Regel-ID / Version:** `NKP-PLAU-004` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-004
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Unwahrscheinlichen Nullverbrauch bei längerer Belegung erkennen.
- **Datenquellen / Felder:** Verbrauchswerte, Belegungstage, Kostenart
- **Prüf- oder Berechnungslogik:** Ein Verbrauch von 0 wird auffällig, wenn der Fall mindestens 30 Belegungstage besitzt.
- **Formel:** Verbrauch = 0 ∧ Belegungstage ≥ 30
- **Toleranz:** 30 Tage
- **Rundung:** Tagesgenau
- **Vorzeichenlogik:** Nullwertprüfung
- **Sonderfälle / Ausschlüsse:** Leerstand, Privatanteil und tatsächlich unbewohnte Fälle können fachlich erklärbar sein.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 68. Zählerendstand liegt unter dem Anfangsstand

- **Regel-ID / Version:** `NKP-PLAU-005` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-005
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Rückläufige oder negative Zählerverläufe erkennen.
- **Datenquellen / Felder:** zaehlerDaten.messperioden und waterMeters.readings (Legacy-Fallback)
- **Prüf- oder Berechnungslogik:** Endstand kleiner Anfangsstand oder daraus negativer Verbrauch wird gemeldet, sofern kein zulässiger Überlauf-/Wechselstatus vorliegt.
- **Formel:** Endstand < Anfangsstand ∨ Verbrauch < 0
- **Toleranz:** Keine
- **Rundung:** Gemäß Zählereinheit
- **Vorzeichenlogik:** Negative Differenz ist auffällig
- **Sonderfälle / Ausschlüsse:** Dokumentierter Zählerwechsel oder Überlauf wird gesondert behandelt.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 69. Hausverbrauch und Wohnungsverbräuche sind plausibel

- **Regel-ID / Version:** `NKP-PLAU-006` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-006
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Gesamt- und Wohnungsverbrauch mengenmäßig abstimmen.
- **Datenquellen / Felder:** waterMeters.settings.houseWaterTotal und Wohnungsverbräuche
- **Prüf- oder Berechnungslogik:** Hausverbrauch wird mit der Summe der Wohnungs-/Fallverbräuche verglichen; beide Schwellen müssen überschritten sein.
- **Formel:** \|Haus−ΣFälle\| > 0,5 ∧ \|Haus−ΣFälle\|/Haus > 5 %
- **Toleranz:** 0,5 Mengeneinheiten und 5 %
- **Rundung:** Anzeige gemäß Einheit
- **Vorzeichenlogik:** Betrag der Differenz
- **Sonderfälle / Ausschlüsse:** Nicht anwendbar ohne Hausgesamtwert.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 70. Verbrauch weicht stark vom Vorjahr ab

- **Regel-ID / Version:** `NKP-PLAU-007` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-007
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Ungewöhnliche Verbrauchsentwicklung gegenüber dem Vorjahr erkennen.
- **Datenquellen / Felder:** Verbrauch je Wohnung/Kostenart und Vorjahressnapshot
- **Prüf- oder Berechnungslogik:** Vergleichbarer Verbrauch je Fall/Kostenart wird mit dem Vorjahr verglichen und bei deutlicher relativer Abweichung gemeldet.
- **Formel:** relative Abweichung gemäß produktiver Vorjahresvergleichslogik
- **Toleranz:** Im Prüfcode festgelegte Vergleichsschwelle
- **Rundung:** Gemäß Verbrauchseinheit
- **Vorzeichenlogik:** Zu- und Abnahme
- **Sonderfälle / Ausschlüsse:** Nicht anwendbar ohne geeigneten Vorjahreswert.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 71. Auffällig identische Verbrauchswerte

- **Regel-ID / Version:** `NKP-PLAU-008` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-008
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Mögliche Kopier- oder Schätzfehler in Verbrauchswerten erkennen.
- **Datenquellen / Felder:** Verbrauchswerte je Wohnung
- **Prüf- oder Berechnungslogik:** Auffällig identische Verbrauchswerte mehrerer relevanter Fälle werden gruppiert gemeldet.
- **Formel:** gleicher normalisierter Verbrauchswert bei mehreren Fällen
- **Toleranz:** Exakte numerische Gleichheit nach Normalisierung
- **Rundung:** Gemäß Eingabenormalisierung
- **Vorzeichenlogik:** Vorzeichen wird berücksichtigt
- **Sonderfälle / Ausschlüsse:** Identische Werte können fachlich korrekt sein und sind deshalb entscheidbar.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 72. Gesamtwasserverbrauch und individuelle Messperioden stimmen überein

- **Regel-ID / Version:** `NKP-PLAU-012` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Individuelle Werte (`manuellewerte`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-012
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Den in Gesamtkosten erfassten Gesamtwasserverbrauch mit allen individuellen Messperioden abstimmen.
- **Datenquellen / Felder:** kostenarten[K002].gesamtverbrauch und zaehlerDaten.messperioden
- **Prüf- oder Berechnungslogik:** Kalt- und Warmwasserverbräuche aller Miet-, Leerstands- und Privatfälle werden addiert und mit dem Gesamtverbrauch der Wasser-Kostenart verglichen.
- **Formel:** Differenz = Σ Messperiodenverbrauch − kostenarten[K002].gesamtverbrauch; auffällig bei \|Differenz\| > 0,01 m³
- **Toleranz:** 0,01 m³
- **Rundung:** Anzeige auf geeignete Dezimalstellen; Vergleich numerisch
- **Vorzeichenlogik:** Positive Differenz = Messperioden höher; negative = Gesamtkostenwert höher
- **Sonderfälle / Ausschlüsse:** Kein Kostenabgleich; nicht anwendbar ohne aktive Verbrauchskostenart oder Gesamtwert.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Individuelle Werte · #individualWaterComparison
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 73. Umlagesummen stimmen mit den Ausgangskosten überein

- **Regel-ID / Version:** `NKP-FACH-016` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Abrechnungsergebnis (`umlage`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-016
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Vollständige Verteilung der Ausgangskosten sicherstellen.
- **Datenquellen / Felder:** calculateUmlage und umlageTotals
- **Prüf- oder Berechnungslogik:** Summe der Miet-, Privat-, dokumentierten Vermieter- und Restanteile wird je Kostenart und insgesamt gegen die Ausgangskosten geprüft.
- **Formel:** \|Ausgangskosten − verteilte Summe\| > 0,02 €
- **Toleranz:** 0,02 €
- **Rundung:** Berechnung intern; Anzeige auf Cent
- **Vorzeichenlogik:** Differenzvorzeichen bleibt erhalten
- **Sonderfälle / Ausschlüsse:** Finanzielle Differenzentscheidungen werden führend über abrechnungsPruefungen geführt.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Abrechnungsergebnis
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 74. Unerklärter Eigentümer- oder Restanteil

- **Regel-ID / Version:** `NKP-PLAU-010` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Abrechnungsergebnis (`umlage`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-010
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Nicht erklärten Vermieter-/Restanteil erkennen.
- **Datenquellen / Felder:** umlageTotals.ownerShare
- **Prüf- oder Berechnungslogik:** Berechneter Eigentümer-/Restanteil wird um dokumentierte und systematisch begründete Anteile bereinigt.
- **Formel:** unerklärt = ownerShare − documentedOwnerShare; auffällig bei \|unerklärt\| > 0,02 €
- **Toleranz:** 0,02 €
- **Rundung:** Anzeige auf Cent
- **Vorzeichenlogik:** Positiver Rest = nicht verteilt
- **Sonderfälle / Ausschlüsse:** Bewusst nicht umlagefähige Kosten und dokumentierte Privat-/Leerstandsanteile werden berücksichtigt.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Abrechnungsergebnis
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 75. Abrechnungsergebnis ist ungewöhnlich hoch

- **Regel-ID / Version:** `NKP-PLAU-011` / 1
- **Typ / Kategorie:** Plausibilitätsprüfung / Plausibilitätsprüfung
- **Navigation:** Nebenkosten abrechnen → Abrechnungsergebnis (`umlage`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-PLAU-011
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Außergewöhnlich hohe Mieterergebnisse zur Kontrolle markieren.
- **Datenquellen / Felder:** Mieterergebnis, Vorauszahlungen und Kostenanteil
- **Prüf- oder Berechnungslogik:** Betrag des Saldos wird gegen absolute und relative Schwelle aus Vorauszahlungen/Kostenbezug geprüft.
- **Formel:** \|Saldo\| ≥ 1.000 € ∧ \|Saldo\| ≥ 75 % × max(\|Vorauszahlungen\|, 500 €)
- **Toleranz:** 1.000 € und 75 %
- **Rundung:** Anzeige auf Cent
- **Vorzeichenlogik:** Nachzahlung und Guthaben betragsmäßig
- **Sonderfälle / Ausschlüsse:** Hinweis/Entscheidung ohne automatische Änderung des Ergebnisses.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Abrechnungsergebnis
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 76. Finanzielle Differenzen werden zentral abgeleitet

- **Regel-ID / Version:** `NKP-VAL-DIFF-001` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Prüfung
- **Navigation:** Nebenkosten abrechnen → Abrechnungsergebnis (`umlage`)
- **Tatsächlicher Prüfungsort:** js/billing-review.js · deriveDifferences()
- **Ausführung / Auslöser:** Ereignisgesteuert im produktiven Workflow.
- **Fachlicher Zweck:** Manuelle, Verbrauchs-, Umlage-, Vorauszahlungs- und Rundungsdifferenzen ohne doppelte Fachprüfung ableiten.
- **Datenquellen / Felder:** kostenarten, umlageInputs, zaehlerDaten, vorauszahlungen, calculateUmlage()
- **Prüf- oder Berechnungslogik:** Aus fünf produktiven Differenztypen werden stabile Differenz-IDs sowie Daten- und Berechnungssignaturen erzeugt.
- **Formel:** Differenz je Typ = berechneter Wert − Kontrollwert; nur Werte oberhalb der typbezogenen Toleranz werden ausgegeben.
- **Toleranz:** Typbezogen, überwiegend 0,01/0,02 € beziehungsweise Mengenwert
- **Rundung:** Signaturen verwenden normalisierte Rechenwerte; Anzeige fachgerecht
- **Vorzeichenlogik:** Vorzeichen bleibt erhalten; monetaryAmount wird für Summen betragsmäßig geführt.
- **Sonderfälle / Ausschlüsse:** Bewusst dokumentierte Vermieteranteile werden separat berücksichtigt.
- **Mögliche Ergebnisse:** Bestanden; Entscheidung erforderlich
- **Konsequenzen:** Offene Differenz verlangt Korrektur oder zulässige Entscheidung.
- **Abschlusswirkung:** Offene Differenz verhindert den Abschluss.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Abrechnungsergebnis
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 77. Differenzentscheidung ist vollständig begründet

- **Regel-ID / Version:** `NKP-VAL-DIFF-002` / 1
- **Typ / Kategorie:** Eingabevalidierung / Eingabevalidierung
- **Navigation:** Nebenkosten abrechnen → Abrechnungsergebnis (`umlage`)
- **Tatsächlicher Prüfungsort:** js/billing-review.js · accept()
- **Ausführung / Auslöser:** Ereignisgesteuert im produktiven Workflow.
- **Fachlicher Zweck:** Nachvollziehbare, bewusste Akzeptanzen erzwingen.
- **Datenquellen / Felder:** Behandlung, Begründung, Bearbeiter, ausdrückliche Bestätigung
- **Prüf- oder Berechnungslogik:** Behandlung muss zulässig sein; Begründung mindestens fünf Zeichen; Bearbeiter nicht leer; Checkbox ausdrücklich bestätigt.
- **Formel:** gültig = Behandlung ∈ TREATMENTS ∧ Länge(Begründung) ≥ 5 ∧ Bearbeiter ≠ leer ∧ confirmed = true
- **Toleranz:** Begründung mindestens 5 Zeichen
- **Rundung:** Keine
- **Vorzeichenlogik:** Behandlung entscheidet, ob der Betrag als akzeptierte Differenz oder Vermieteranteil geführt wird.
- **Sonderfälle / Ausschlüsse:** Kritische Abrechnungsmängel sind nicht über diese Funktion akzeptierbar.
- **Mögliche Ergebnisse:** Entscheidung gespeichert; Validierungsfehler
- **Konsequenzen:** Unvollständige Entscheidung wird nicht gespeichert.
- **Abschlusswirkung:** Nur gültig gespeicherte Entscheidung erledigt eine Differenz.
- **Zulässige Aktionen:** Entscheiden; Entscheidung ansehen/ändern
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Entscheidungsdialog Abrechnungsergebnis
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 78. Entscheidung wird bei Datenänderung ungültig

- **Regel-ID / Version:** `NKP-VAL-DIFF-003` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Prüfung
- **Navigation:** Nebenkosten abrechnen → Abrechnungsergebnis (`umlage`)
- **Tatsächlicher Prüfungsort:** js/billing-review.js · decisionStatus()
- **Ausführung / Auslöser:** Ereignisgesteuert im produktiven Workflow.
- **Fachlicher Zweck:** Veraltete Akzeptanzen nach einer Änderung der Ursache verhindern.
- **Datenquellen / Felder:** record.dataSignature, record.calculationSignature, aktuelle Differenzsignaturen
- **Prüf- oder Berechnungslogik:** Gespeicherte und aktuelle Daten- sowie Berechnungssignatur müssen identisch sein.
- **Formel:** gültig = gespeicherte dataSignature = aktuell ∧ gespeicherte calculationSignature = aktuell
- **Toleranz:** Keine
- **Rundung:** Kanonische normalisierte Signaturwerte
- **Vorzeichenlogik:** Änderung von Wert oder Vorzeichen ändert die Signatur.
- **Sonderfälle / Ausschlüsse:** In Korrektur befindliche Entscheidungen bleiben offen.
- **Mögliche Ergebnisse:** Bestanden; Entscheidung erforderlich
- **Konsequenzen:** Nicht passende Entscheidung wird als ungültig angezeigt und muss neu behandelt werden.
- **Abschlusswirkung:** Ungültige Entscheidung verhindert den Abschluss.
- **Zulässige Aktionen:** Entscheiden; Korrigieren; Details
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Abrechnungsergebnis
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 79. Vorauszahlungsanpassung wird nicht gedruckt

- **Regel-ID / Version:** `NKP-HINW-005` / 1
- **Typ / Kategorie:** Fachlicher Hinweis / Fachlicher Hinweis oder Sonderfall
- **Navigation:** Nebenkosten abrechnen → Vorauszahlungen anpassen (`vorauszahlungsanpassung`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-HINW-005
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Bewusste Nichtausgabe der Vorauszahlungsanpassung sichtbar machen.
- **Datenquellen / Felder:** prepaymentAdjustmentSettings.letterPrintMode
- **Prüf- oder Berechnungslogik:** Die Briefoption ist auf Nicht drucken gesetzt.
- **Formel:** letterPrintMode = Nicht drucken
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Kein Abschlusshemmnis.
- **Mögliche Ergebnisse:** Hinweis; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Keine Abschlusswirkung.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Vorauszahlungen anpassen
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Nein

### 80. Abschlussvoraussetzungen sind erfüllt

- **Regel-ID / Version:** `NKP-FACH-019` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Prüfen und abschließen (`qualitaet`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-019
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Den fachlichen Abschluss ausschließlich bei erfüllter Prüflage und versandbereiten Briefen freigeben.
- **Datenquellen / Felder:** Alle zentralen fachlichen Prüfergebnisse
- **Prüf- oder Berechnungslogik:** Es dürfen keine kritischen Mängel und keine offenen Entscheidungen bestehen; alle relevanten Prüfungen müssen ausgeführt und die Briefprüfungen bestanden sein.
- **Formel:** kritisch = 0 ∧ entscheidung = 0 ∧ nochNichtAusgeführt(abschlussrelevant) = 0 ∧ Briefstatus versandbereit
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Der tatsächliche Versand ist nicht Bestandteil des Abschlusses.
- **Mögliche Ergebnisse:** Entscheidung erforderlich; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht.
- **Zulässige Aktionen:** Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Prüfen und abschließen
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Ja

### 81. Fachliche Abschlussbereitschaft

- **Regel-ID / Version:** `NKP-VAL-FINAL-001` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Prüfung
- **Navigation:** Nebenkosten abrechnen → Prüfen und abschließen (`qualitaet`)
- **Tatsächlicher Prüfungsort:** js/billing-workflow.js · finalizeCurrentBilling() / quality-assurance.js · finalBillingReadiness()
- **Ausführung / Auslöser:** Ereignisgesteuert im produktiven Workflow.
- **Fachlicher Zweck:** Nur einen vollständig geprüften und versandbereiten Stand finalisieren.
- **Datenquellen / Felder:** Zentraler Qualitätsbericht und Briefprüfungen
- **Prüf- oder Berechnungslogik:** Finalisierung wird nur ausgeführt, wenn keine kritischen Mängel, offenen Entscheidungen oder ausstehenden abschlussrelevanten Prüfungen bestehen.
- **Formel:** kritisch = 0 ∧ entscheidung = 0 ∧ ausstehend(abschlussrelevant) = 0
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Versand ist nicht Teil des Abschlusses; Entwurfsbriefe sind vorher zulässig.
- **Mögliche Ergebnisse:** Abschluss freigegeben; Abschluss verweigert
- **Konsequenzen:** Bei fehlender Bereitschaft wird kein Finalisierungszustand gespeichert.
- **Abschlusswirkung:** Unmittelbar abschlussbestimmend.
- **Zulässige Aktionen:** Details; Korrigieren; Abrechnung abschließen
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Prüfen und abschließen
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 82. Finalisierter Abrechnungsstand ist schreibgeschützt

- **Regel-ID / Version:** `NKP-VAL-FINAL-002` / 1
- **Typ / Kategorie:** Eingabevalidierung / Eingabevalidierung
- **Navigation:** Nebenkosten abrechnen → Prüfen und abschließen (`qualitaet`)
- **Tatsächlicher Prüfungsort:** js/billing-workflow.js und NKProBillingContext.assertWritable()
- **Ausführung / Auslöser:** Ereignisgesteuert im produktiven Workflow.
- **Fachlicher Zweck:** Den geprüften Abrechnungsstand nach Abschluss einfrieren.
- **Datenquellen / Felder:** meta.currentBillingFinalizedAt und Schreibkontext
- **Prüf- oder Berechnungslogik:** Schreibaktionen werden im finalisierten Zustand abgewiesen, bis eine kontrollierte Korrekturöffnung erfolgt.
- **Formel:** schreibbar = nicht finalisiert ∨ expliziter Finalisierungs-Bypass für Systemaktion
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Ansicht, Export und finale Briefe bleiben möglich.
- **Mögliche Ergebnisse:** Schreibbar; Schreibgeschützt
- **Konsequenzen:** Unzulässige Datenmutation wird verhindert.
- **Abschlusswirkung:** Schützt den abgeschlossenen Stand.
- **Zulässige Aktionen:** Details; Zur Korrektur öffnen
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Prüfen und abschließen
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 83. Erforderliche Empfänger- und Adressdaten sind vorhanden

- **Regel-ID / Version:** `NKP-FACH-017` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Briefe (`briefe`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-017
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Vollständige Empfänger- und Absenderdaten für versandbereite Briefe sicherstellen.
- **Datenquellen / Felder:** Mieterstammdaten und briefSettings
- **Prüf- oder Berechnungslogik:** Globale Briefangaben und je abrechenbarem Mietverhältnis Name, Anrede und Anschrift werden auf Pflichtfelder geprüft.
- **Formel:** Anzahl(fehlende Pflichtfelder) = 0
- **Toleranz:** Keine
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Prüfung je Briefempfänger und globaler Briefkonfiguration.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Abrechnung unvollständig).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Briefe
- **Kritische Unterart:** Abrechnung unvollständig
- **Produktiv / abschlussrelevant:** Ja / Ja

### 84. Briefwerte stimmen mit dem Berechnungsergebnis überein

- **Regel-ID / Version:** `NKP-FACH-018` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Pflicht- und Konsistenzprüfung
- **Navigation:** Nebenkosten abrechnen → Briefe (`briefe`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-FACH-018
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Identische Beträge in Berechnung und Mieterbrief sicherstellen.
- **Datenquellen / Felder:** briefCostRows und calculateUmlage
- **Prüf- oder Berechnungslogik:** Summe der Brief-Kostenzeilen wird je Empfänger mit dem berechneten Kostenanteil verglichen.
- **Formel:** \|Σ Briefanteile − Kostenanteil\| > 0,02 €
- **Toleranz:** 0,02 €
- **Rundung:** Briefanzeige auf Cent
- **Vorzeichenlogik:** Differenzvorzeichen bleibt erhalten
- **Sonderfälle / Ausschlüsse:** Berechnungsfehler selbst wird als unvollständiger Briefstand behandelt.
- **Mögliche Ergebnisse:** Kritischer Abrechnungsmangel; Bestanden; Nicht anwendbar
- **Konsequenzen:** Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung.
- **Abschlusswirkung:** Abschlussverhindernd im Fehlerfall (Abrechnung unvollständig).
- **Zulässige Aktionen:** Korrigieren; Details; Regeldetails
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Briefe
- **Kritische Unterart:** Abrechnung unvollständig
- **Produktiv / abschlussrelevant:** Ja / Ja

### 85. Druckbild sollte wegen langer Inhalte kontrolliert werden

- **Regel-ID / Version:** `NKP-HINW-006` / 1
- **Typ / Kategorie:** Fachlicher Hinweis / Fachlicher Hinweis oder Sonderfall
- **Navigation:** Nebenkosten abrechnen → Briefe (`briefe`)
- **Tatsächlicher Prüfungsort:** js/quality-rules.js · evaluate() / NKP-HINW-006
- **Ausführung / Auslöser:** Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.
- **Fachlicher Zweck:** Mögliche Layoutprobleme vor der finalen Ausgabe kenntlich machen.
- **Datenquellen / Felder:** Brieftexte, Adressen und Kostenartenbezeichnungen
- **Prüf- oder Berechnungslogik:** Lange Adress-, Kostenarten- oder Zusatztexte werden gegen die produktiven Brief-Layoutgrenzen geprüft.
- **Formel:** Textlänge/Zeilenrisiko überschreitet hinterlegte Grenzwerte
- **Toleranz:** Layoutabhängige Grenzwerte
- **Rundung:** Keine
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Hinweis; visuelle Prüfung kann ausreichend sein.
- **Mögliche Ergebnisse:** Hinweis; Bestanden; Nicht anwendbar
- **Konsequenzen:** Hinweis ohne verpflichtende Korrektur oder Entscheidung.
- **Abschlusswirkung:** Keine Abschlusswirkung.
- **Zulässige Aktionen:** Korrigieren; Entscheiden; Entscheidung ansehen/ändern; Details; Regeldetails
- **Akzeptanz zulässig:** Ja
- **Korrekturziel:** Nebenkosten abrechnen → Briefe
- **Kritische Unterart:** 
- **Produktiv / abschlussrelevant:** Ja / Nein

### 86. Brief-Preflight vor Ausgabe

- **Regel-ID / Version:** `NKP-VAL-BRIEF-001` / 1
- **Typ / Kategorie:** Fachliche Prüfung / Fachliche Prüfung
- **Navigation:** Nebenkosten abrechnen → Briefe (`briefe`)
- **Tatsächlicher Prüfungsort:** js/document-data.js · Brief-Preflight / acceptanceProtocolData()
- **Ausführung / Auslöser:** Ereignisgesteuert im produktiven Workflow.
- **Fachlicher Zweck:** Empfänger, Berechnungsergebnis und Druckfreigabe vor Entwurf und finaler Ausgabe prüfen.
- **Datenquellen / Felder:** briefSettings, Mieterstammdaten, calculateUmlage(), Briefzeilen
- **Prüf- oder Berechnungslogik:** Pflichtdaten- und Betragsprüfungen werden zu Fehlern, Hinweisen und OK-Ergebnissen zusammengeführt.
- **Formel:** versandbereit = Fehleranzahl = 0 und zentrale Briefregeln bestanden
- **Toleranz:** Betragsabgleich 0,02 €
- **Rundung:** Briefbeträge auf Cent
- **Vorzeichenlogik:** Nachzahlung/Guthaben folgt dem berechneten Saldo.
- **Sonderfälle / Ausschlüsse:** Lange Inhalte erzeugen Hinweise, keine pauschale Sperre.
- **Mögliche Ergebnisse:** Entwurf prüfbar; Versandbereit; Fehler; Hinweis
- **Konsequenzen:** Fehler verhindern den fachlichen Abschluss; Hinweise nicht.
- **Abschlusswirkung:** Fehlerfall abschlussverhindernd.
- **Zulässige Aktionen:** Korrigieren; Details; Briefentwurf prüfen
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Nebenkosten abrechnen → Briefe
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Ja

### 87. Abrechnungssnapshot wird vor Archivierung validiert

- **Regel-ID / Version:** `NKP-VAL-SNAPSHOT-001` / 1
- **Typ / Kategorie:** Eingabevalidierung / Eingabevalidierung
- **Navigation:** Archiv → Archivübersicht (`archiv`)
- **Tatsächlicher Prüfungsort:** js/billing-snapshot.js / js/archive-actions.js · validateBillingSnapshot()
- **Ausführung / Auslöser:** Ereignisgesteuert im produktiven Workflow.
- **Fachlicher Zweck:** Nur vollständige, integritätsgesicherte Abrechnungsstände archivieren.
- **Datenquellen / Felder:** Abrechnungssnapshot, Metadaten, Objekt-/Periodenbezug, Prüfsumme
- **Prüf- oder Berechnungslogik:** Snapshotstruktur, Pflichtbezug und Integritätschecksumme werden vor Speicherung beziehungsweise Öffnung geprüft.
- **Formel:** gültig = Struktur vollständig ∧ Scope korrekt ∧ Prüfsumme stimmt
- **Toleranz:** Keine
- **Rundung:** Kanonische Snapshotdarstellung
- **Vorzeichenlogik:** Nicht relevant
- **Sonderfälle / Ausschlüsse:** Historische Snapshots bleiben unveränderlich und werden nur kontrolliert geöffnet.
- **Mögliche Ergebnisse:** Snapshot gültig; Snapshot abgewiesen
- **Konsequenzen:** Ungültiger Snapshot wird nicht als verlässlicher Archivstand verwendet.
- **Abschlusswirkung:** Keine direkte Abschlussentscheidung; schützt Archiv-/Snapshotqualität.
- **Zulässige Aktionen:** Details; Daten prüfen
- **Akzeptanz zulässig:** Nein
- **Korrekturziel:** Archiv / Datensicherung
- **Kritische Unterart:** —
- **Produktiv / abschlussrelevant:** Ja / Nein

