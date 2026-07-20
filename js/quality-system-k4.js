(function (global) {
  "use strict";

  const legacy = global.NKProQualityRules;
  if (!legacy) throw new Error("AP22F11B K4 benötigt die bestehende zentrale Regelregistry.");

  const CATEGORY = legacy.CATEGORY;
  const STATUS = Object.freeze({
    BLOCKED:"Kritischer Abrechnungsmangel",
    REVIEW:"Entscheidung erforderlich",
    HINT:"Hinweis",
    DONE:"Bestanden",
    NOT_APPLICABLE:"Nicht anwendbar",
    NOT_EXECUTED:"Noch nicht ausgeführt",
    TECHNICAL_ERROR:"Technischer Fehler"
  });

  const STATUS_MAP = Object.freeze({
    "Blockiert":STATUS.BLOCKED,
    "Zu prüfen":STATUS.REVIEW,
    "Hinweis":STATUS.HINT,
    "Erledigt":STATUS.DONE,
    "Nicht anwendbar":STATUS.NOT_APPLICABLE,
    "Technischer Fehler":STATUS.TECHNICAL_ERROR
  });

  const LEGACY_TARGET_ALIASES = Object.freeze({verbraeuche:"manuellewerte"});
  const CRITICAL_SUBTYPE = Object.freeze({
    "NKP-FACH-001":"Berechnung nicht möglich",
    "NKP-FACH-002":"Berechnung nicht möglich",
    "NKP-FACH-003":"Berechnung nicht möglich",
    "NKP-FACH-004":"Abrechnung unvollständig",
    "NKP-FACH-005":"Berechnung nicht möglich",
    "NKP-FACH-006":"Berechnung nicht möglich",
    "NKP-FACH-007":"Berechnung nicht möglich",
    "NKP-FACH-008":"Berechnung nicht möglich",
    "NKP-FACH-009":"Berechnung nicht möglich",
    "NKP-FACH-010":"Abrechnung unvollständig",
    "NKP-FACH-011":"Berechnung nicht möglich",
    "NKP-FACH-012":"Berechnung nicht möglich",
    "NKP-FACH-014":"Abrechnung unvollständig",
    "NKP-FACH-017":"Abrechnung unvollständig",
    "NKP-FACH-018":"Abrechnung unvollständig",
    "NKP-FACH-020":"Berechnung nicht möglich"
  });

  const RULE_FACTS = Object.freeze({
    "NKP-FACH-001":{purpose:"Sicherstellen, dass die Abrechnung auf einem kalendarisch und fachlich gültigen Zeitraum beruht.",logic:"Beginn und Ende müssen echte ISO-Kalenderdaten sein; Ende darf nicht vor Beginn liegen; das Abrechnungsjahr muss dem Kalenderjahr des Enddatums entsprechen.",formula:"gültig = ISO(Beginn) ∧ ISO(Ende) ∧ Ende ≥ Beginn ∧ Jahr = Jahr(Ende)",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Keine stillschweigende Datumsnormalisierung."},
    "NKP-FACH-002":{purpose:"Mindestens eine abrechnungsfähige räumliche Einheit sicherstellen.",logic:"Die Liste der Wohnungen muss mindestens eine aktive Wohnung enthalten.",formula:"Anzahl(wohnungen mit Status aktiv) ≥ 1",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Inaktive oder gelöschte Wohnungen zählen nicht."},
    "NKP-FACH-003":{purpose:"Mindestens einen fachlich abrechenbaren Fall im Zeitraum sicherstellen.",logic:"Mindestens ein Mietverhältnis muss den Abrechnungszeitraum schneiden und als abrechenbarer Mieterfall gelten.",formula:"Anzahl(abrechenbare Mietverhältnisse) ≥ 1",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Eigentümer/Privat und nicht überlappende Zeiträume zählen nicht als Mieterabrechnung."},
    "NKP-FACH-004":{purpose:"Einen eindeutigen Briefempfänger und Ergebnisfall sicherstellen.",logic:"Für jedes relevante Mietverhältnis muss ein nicht leerer Name vorhanden sein.",formula:"trim(mieter.name) ≠ leer",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Prüfung je relevantem Mietverhältnis."},
    "NKP-FACH-005":{purpose:"Jeden Abrechnungsfall einer vorhandenen Wohnung zuordnen.",logic:"Die Wohnungsreferenz des Mietverhältnisses muss gesetzt sein und auf eine vorhandene Wohnung verweisen.",formula:"mieter.wohnung ∈ IDs(wohnungen)",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Prüfung je relevantem Mietverhältnis."},
    "NKP-FACH-006":{purpose:"Chronologisch gültige Mietzeiträume sicherstellen.",logic:"Einzugs- und Auszugsdatum müssen gültig sein; ein Auszug darf nicht vor dem Einzug liegen.",formula:"ISO(Einzug) ∧ (Auszug leer ∨ ISO(Auszug) ∧ Auszug ≥ Einzug)",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Leeres Auszugsdatum bedeutet fortbestehendes Mietverhältnis."},
    "NKP-FACH-007":{purpose:"Doppelte Belegung derselben Wohnung im selben Zeitraum verhindern.",logic:"Zeitintervalle relevanter Mietverhältnisse derselben Wohnung dürfen sich nicht überschneiden.",formula:"für alle Paare a,b: Ende(a) < Beginn(b) ∨ Ende(b) < Beginn(a)",tolerance:"Keine",rounding:"Tagesgenaue inklusive Intervalle",sign:"Nicht relevant",exceptions:"Nur Mietverhältnisse derselben Wohnung werden paarweise verglichen."},
    "NKP-PLAU-001":{purpose:"Erfasste Miettage gegen den tatsächlichen Mietzeitraum plausibilisieren.",logic:"Erfasste aktive Tage werden mit den inklusiv berechneten Tagen innerhalb des Abrechnungszeitraums verglichen.",formula:"|aktiveTage − erwarteteTage| > 1 löst eine Abweichung aus",tolerance:"1 Tag",rounding:"Kalendertage inklusiv",sign:"Betrag der Differenz",exceptions:"Nur wenn ein tagesabhängiger Schlüssel verwendet wird."},
    "NKP-FACH-008":{purpose:"Eine notwendige Personen-Verteilungsgrundlage bereitstellen.",logic:"Bei Verwendung eines personenbezogenen Umlageschlüssels muss für jeden relevanten Fall eine positive Personenzahl vorliegen.",formula:"personen > 0",tolerance:"Keine",rounding:"Keine",sign:"Nur positive Werte",exceptions:"Nicht anwendbar ohne personenbezogenen Umlageschlüssel."},
    "NKP-HINW-001":{purpose:"Unterjährige Belegung transparent machen.",logic:"Ein Mietverhältnis beginnt nach Periodenbeginn oder endet vor Periodenende.",formula:"Einzug > Periodenbeginn ∨ Auszug < Periodenende",tolerance:"Keine",rounding:"Tagesgenau",sign:"Nicht relevant",exceptions:"Reiner Hinweis; korrekte Eingabe erfordert keine Entscheidung."},
    "NKP-HINW-002":{purpose:"Zeiträume ohne abrechenbaren Mieter kenntlich machen.",logic:"Eine aktive Wohnung besitzt für mindestens einen Teil der Abrechnungsperiode keinen abrechenbaren Mieterfall.",formula:"aktive Wohnung − belegte Zeitintervalle > 0 Tage",tolerance:"Keine",rounding:"Tagesgenau",sign:"Nicht relevant",exceptions:"Leerstand kann als regulärer Abrechnungsfall erfasst sein."},
    "NKP-HINW-003":{purpose:"Nicht mieterseitige Fälle transparent kennzeichnen.",logic:"Ein Mietverhältnis ist mit der Abrechnungsrolle Eigentümer/Privat gekennzeichnet.",formula:"abrechnungRolle = Eigentümer/Privat",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Hinweis ohne Sperrwirkung."},
    "NKP-FACH-009":{purpose:"Eine Kostenbasis für die Abrechnung sicherstellen.",logic:"Mindestens eine Kostenart muss für die Nebenkostenabrechnung aktiviert sein.",formula:"Anzahl(kostenarten mit inNK = Ja) ≥ 1",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Deaktivierte Kostenarten zählen nicht."},
    "NKP-FACH-010":{purpose:"Vollständige Ausgangskosten sicherstellen.",logic:"Jede aktive Kostenart benötigt einen endlichen Gesamtbetrag.",formula:"gesamtbetrag ist numerisch und vorhanden",tolerance:"Keine",rounding:"Geldwerte werden später auf Cent ausgegeben",sign:"Positive und zulässige negative Korrekturwerte gemäß bestehender Kostenlogik",exceptions:"Prüfung je aktiver Kostenart."},
    "NKP-FACH-011":{purpose:"Mindestens einen zulässigen Empfänger je aktiver Kostenart sicherstellen.",logic:"Aus Kostenartenzuordnung und relevanten Mietverhältnissen muss mindestens ein berechtigter Abrechnungsfall entstehen.",formula:"Anzahl(berechtigte Fälle) ≥ 1",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Ausschluss- und Rollenlogik der Kostenart wird berücksichtigt."},
    "NKP-FACH-012":{purpose:"Eine berechenbare Verteilungsgrundlage je Kostenart sicherstellen.",logic:"Für den gewählten Umlageschlüssel müssen die jeweils erforderlichen Wohnungs-, Personen-, Tages-, Verbrauchs- oder Einzelwerte vorliegen.",formula:"Nenner(Umlageschlüssel) > 0 und Pflichtwerte vollständig",tolerance:"Keine",rounding:"Gemäß bestehender Umlageberechnung",sign:"Nur fachlich zulässige Grundlagen",exceptions:"Anforderungen unterscheiden sich nach Umlageschlüssel."},
    "NKP-FACH-013":{purpose:"Manuell verteilte Einzelwerte mit den Ausgangskosten abstimmen.",logic:"Summe der individuellen Werte wird je Kostenart mit dem Gesamtbetrag verglichen.",formula:"Differenz = Σ Einzelwerte − Gesamtbetrag; auffällig bei |Differenz| > 0,02 €",tolerance:"0,02 €",rounding:"Vergleich mit ungerundeten Rechenwerten; Anzeige auf Cent",sign:"Positive Differenz = Einzelwerte höher; negative Differenz = niedriger",exceptions:"Finanzielle Differenzentscheidungen werden führend über abrechnungsPruefungen geführt."},
    "NKP-PLAU-002":{purpose:"Ungewöhnliche Kostenentwicklung gegenüber dem Vorjahr erkennen.",logic:"Vergleich mit einer passenden Vorjahreskostenart; Abweichung nur bei zugleich relevantem Prozent- und Absolutbetrag.",formula:"|Δ| ≥ 100 € ∧ |Δ/Vorjahr| ≥ 30 %",tolerance:"100 € und 30 %",rounding:"Prozentdarstellung gerundet; Vergleich numerisch",sign:"Zu- und Abnahme werden betragsmäßig geprüft",exceptions:"Nicht anwendbar ohne geeigneten Vorjahresvergleich oder bei Vorjahr 0."},
    "NKP-PLAU-003":{purpose:"Doppelerfassung gleichartiger Rechnungen erkennen.",logic:"Aktive Kostenarten mit gleicher normalisierter Bezeichnung und nahezu gleichem Betrag werden paarweise verglichen.",formula:"lower(trim(Name_a)) = lower(trim(Name_b)) ∧ |Betrag_a−Betrag_b| < 0,01 €",tolerance:"0,01 €",rounding:"Keine zusätzliche Rundung",sign:"Vorzeichen wird berücksichtigt",exceptions:"Nur aktive Kostenarten."},
    "NKP-FACH-014":{purpose:"Alle für Verbrauchsschlüssel notwendigen Messwerte bereitstellen.",logic:"Bei aktiven Verbrauchskosten müssen für relevante Fälle aus Eingaben oder Messperioden verwertbare Verbrauchswerte vorliegen.",formula:"für jeden relevanten Fall: Verbrauchswert vorhanden und numerisch",tolerance:"Keine",rounding:"Gemäß Einheit der Kostenart",sign:"Verbrauch darf nicht unzulässig negativ sein",exceptions:"Nicht verbrauchsabhängige Kostenarten sind nicht anwendbar."},
    "NKP-PLAU-004":{purpose:"Unwahrscheinlichen Nullverbrauch bei längerer Belegung erkennen.",logic:"Ein Verbrauch von 0 wird auffällig, wenn der Fall mindestens 30 Belegungstage besitzt.",formula:"Verbrauch = 0 ∧ Belegungstage ≥ 30",tolerance:"30 Tage",rounding:"Tagesgenau",sign:"Nullwertprüfung",exceptions:"Leerstand, Privatanteil und tatsächlich unbewohnte Fälle können fachlich erklärbar sein."},
    "NKP-PLAU-005":{purpose:"Rückläufige oder negative Zählerverläufe erkennen.",logic:"Endstand kleiner Anfangsstand oder daraus negativer Verbrauch wird gemeldet, sofern kein zulässiger Überlauf-/Wechselstatus vorliegt.",formula:"Endstand < Anfangsstand ∨ Verbrauch < 0",tolerance:"Keine",rounding:"Gemäß Zählereinheit",sign:"Negative Differenz ist auffällig",exceptions:"Dokumentierter Zählerwechsel oder Überlauf wird gesondert behandelt."},
    "NKP-PLAU-006":{purpose:"Gesamt- und Wohnungsverbrauch mengenmäßig abstimmen.",logic:"Hausverbrauch wird mit der Summe der Wohnungs-/Fallverbräuche verglichen; beide Schwellen müssen überschritten sein.",formula:"|Haus−ΣFälle| > 0,5 ∧ |Haus−ΣFälle|/Haus > 5 %",tolerance:"0,5 Mengeneinheiten und 5 %",rounding:"Anzeige gemäß Einheit",sign:"Betrag der Differenz",exceptions:"Nicht anwendbar ohne Hausgesamtwert."},
    "NKP-PLAU-012":{purpose:"Den in Gesamtkosten erfassten Gesamtwasserverbrauch mit allen individuellen Messperioden abstimmen.",logic:"Kalt- und Warmwasserverbräuche aller Miet-, Leerstands- und Privatfälle werden addiert und mit dem Gesamtverbrauch der Wasser-Kostenart verglichen.",formula:"Differenz = Σ Messperiodenverbrauch − kostenarten[K002].gesamtverbrauch; auffällig bei |Differenz| > 0,01 m³",tolerance:"0,01 m³",rounding:"Anzeige auf geeignete Dezimalstellen; Vergleich numerisch",sign:"Positive Differenz = Messperioden höher; negative = Gesamtkostenwert höher",exceptions:"Kein Kostenabgleich; nicht anwendbar ohne aktive Verbrauchskostenart oder Gesamtwert."},
    "NKP-PLAU-007":{purpose:"Ungewöhnliche Verbrauchsentwicklung gegenüber dem Vorjahr erkennen.",logic:"Vergleichbarer Verbrauch je Fall/Kostenart wird mit dem Vorjahr verglichen und bei deutlicher relativer Abweichung gemeldet.",formula:"relative Abweichung gemäß produktiver Vorjahresvergleichslogik",tolerance:"Im Prüfcode festgelegte Vergleichsschwelle",rounding:"Gemäß Verbrauchseinheit",sign:"Zu- und Abnahme",exceptions:"Nicht anwendbar ohne geeigneten Vorjahreswert."},
    "NKP-PLAU-008":{purpose:"Mögliche Kopier- oder Schätzfehler in Verbrauchswerten erkennen.",logic:"Auffällig identische Verbrauchswerte mehrerer relevanter Fälle werden gruppiert gemeldet.",formula:"gleicher normalisierter Verbrauchswert bei mehreren Fällen",tolerance:"Exakte numerische Gleichheit nach Normalisierung",rounding:"Gemäß Eingabenormalisierung",sign:"Vorzeichen wird berücksichtigt",exceptions:"Identische Werte können fachlich korrekt sein und sind deshalb entscheidbar."},
    "NKP-HINW-004":{purpose:"Fehlende Vergleichsbasis transparent erklären.",logic:"Für einen vorgesehenen Vorjahresvergleich ist kein eindeutig passender Snapshot vorhanden.",formula:"passender Vorjahressnapshot = nicht vorhanden",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Hinweis ohne Abschlusswirkung."},
    "NKP-FACH-015":{purpose:"Vorauszahlungs-Einzelwerte mit den berechneten Mietersummen abstimmen.",logic:"Matrixsumme und aus den Mietverhältnissen abgeleitete Vorauszahlungssumme werden verglichen.",formula:"|Σ Matrix − Σ Mieterwerte| > 0,02 €",tolerance:"0,02 €",rounding:"Anzeige auf Cent",sign:"Positive/negative Differenz bleibt erhalten",exceptions:"Finanzielle Differenzentscheidungen werden führend über abrechnungsPruefungen geführt."},
    "NKP-PLAU-009":{purpose:"Fehlende erwartete Vorauszahlungen erkennen.",logic:"Für einen abrechenbaren Fall und eine aktive Vorauszahlungskostenart fehlt ein plausibler Wert, obwohl Vorjahr oder Vertragsdaten einen Wert erwarten lassen.",formula:"erwartet = wahr ∧ Vorauszahlung = 0/leer",tolerance:"Keine",rounding:"Geldwerte auf Cent",sign:"Null-/Leerwert",exceptions:"Nicht anwendbar bei bewusst fehlender Vorauszahlung."},
    "NKP-FACH-020":{purpose:"Getrennte und berechenbare Korrekturarten sicherstellen.",logic:"NK-Vorauszahlungs- und Kaltmietkorrektur werden getrennt numerisch geführt und dürfen sich nicht gegenseitig ersetzen.",formula:"beide Felder unabhängig numerisch; keine vermischte Summierung",tolerance:"Keine",rounding:"Geldwerte auf Cent",sign:"Positive Werte Gutschrift, negative Werte Nachbelastung gemäß bestehender Vorzeichenlogik",exceptions:"Leere Werte werden gemäß bestehender Eingabenormalisierung als 0 behandelt."},
    "NKP-HINW-005":{purpose:"Bewusste Nichtausgabe der Vorauszahlungsanpassung sichtbar machen.",logic:"Die Briefoption ist auf Nicht drucken gesetzt.",formula:"letterPrintMode = Nicht drucken",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Kein Abschlusshemmnis."},
    "NKP-FACH-016":{purpose:"Vollständige Verteilung der Ausgangskosten sicherstellen.",logic:"Summe der Miet-, Privat-, dokumentierten Vermieter- und Restanteile wird je Kostenart und insgesamt gegen die Ausgangskosten geprüft.",formula:"|Ausgangskosten − verteilte Summe| > 0,02 €",tolerance:"0,02 €",rounding:"Berechnung intern; Anzeige auf Cent",sign:"Differenzvorzeichen bleibt erhalten",exceptions:"Finanzielle Differenzentscheidungen werden führend über abrechnungsPruefungen geführt."},
    "NKP-PLAU-010":{purpose:"Nicht erklärten Vermieter-/Restanteil erkennen.",logic:"Berechneter Eigentümer-/Restanteil wird um dokumentierte und systematisch begründete Anteile bereinigt.",formula:"unerklärt = ownerShare − documentedOwnerShare; auffällig bei |unerklärt| > 0,02 €",tolerance:"0,02 €",rounding:"Anzeige auf Cent",sign:"Positiver Rest = nicht verteilt",exceptions:"Bewusst nicht umlagefähige Kosten und dokumentierte Privat-/Leerstandsanteile werden berücksichtigt."},
    "NKP-PLAU-011":{purpose:"Außergewöhnlich hohe Mieterergebnisse zur Kontrolle markieren.",logic:"Betrag des Saldos wird gegen absolute und relative Schwelle aus Vorauszahlungen/Kostenbezug geprüft.",formula:"|Saldo| ≥ 1.000 € ∧ |Saldo| ≥ 75 % × max(|Vorauszahlungen|, 500 €)",tolerance:"1.000 € und 75 %",rounding:"Anzeige auf Cent",sign:"Nachzahlung und Guthaben betragsmäßig",exceptions:"Hinweis/Entscheidung ohne automatische Änderung des Ergebnisses."},
    "NKP-FACH-017":{purpose:"Vollständige Empfänger- und Absenderdaten für versandbereite Briefe sicherstellen.",logic:"Globale Briefangaben und je abrechenbarem Mietverhältnis Name, Anrede und Anschrift werden auf Pflichtfelder geprüft.",formula:"Anzahl(fehlende Pflichtfelder) = 0",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Prüfung je Briefempfänger und globaler Briefkonfiguration."},
    "NKP-FACH-018":{purpose:"Identische Beträge in Berechnung und Mieterbrief sicherstellen.",logic:"Summe der Brief-Kostenzeilen wird je Empfänger mit dem berechneten Kostenanteil verglichen.",formula:"|Σ Briefanteile − Kostenanteil| > 0,02 €",tolerance:"0,02 €",rounding:"Briefanzeige auf Cent",sign:"Differenzvorzeichen bleibt erhalten",exceptions:"Berechnungsfehler selbst wird als unvollständiger Briefstand behandelt."},
    "NKP-HINW-006":{purpose:"Mögliche Layoutprobleme vor der finalen Ausgabe kenntlich machen.",logic:"Lange Adress-, Kostenarten- oder Zusatztexte werden gegen die produktiven Brief-Layoutgrenzen geprüft.",formula:"Textlänge/Zeilenrisiko überschreitet hinterlegte Grenzwerte",tolerance:"Layoutabhängige Grenzwerte",rounding:"Keine",sign:"Nicht relevant",exceptions:"Hinweis; visuelle Prüfung kann ausreichend sein."},
    "NKP-FACH-019":{purpose:"Den fachlichen Abschluss ausschließlich bei erfüllter Prüflage und versandbereiten Briefen freigeben.",logic:"Es dürfen keine kritischen Mängel und keine offenen Entscheidungen bestehen; alle relevanten Prüfungen müssen ausgeführt und die Briefprüfungen bestanden sein.",formula:"kritisch = 0 ∧ entscheidung = 0 ∧ nochNichtAusgeführt(abschlussrelevant) = 0 ∧ Briefstatus versandbereit",tolerance:"Keine",rounding:"Keine",sign:"Nicht relevant",exceptions:"Der tatsächliche Versand ist nicht Bestandteil des Abschlusses."}
  });

  function navDefinition() {
    try { return global.NKProNavigation.navigationDefinition(); } catch (_) { return []; }
  }

  function navIndex(tab) {
    const normalized = LEGACY_TARGET_ALIASES[tab] || tab;
    let order = 10000;
    navDefinition().forEach((group, gi) => (group.items || []).forEach((item, ii) => {
      if (item.tab === normalized) order = gi * 100 + ii;
    }));
    return order;
  }

  function navInfo(tab) {
    const normalized = LEGACY_TARGET_ALIASES[tab] || tab;
    for (const group of navDefinition()) {
      const item = (group.items || []).find(entry => entry.tab === normalized);
      if (item) return {areaKey:group.key, areaLabel:group.label, pageTab:item.tab, pageLabel:item.label, navOrder:navIndex(item.tab)};
    }
    return {areaKey:"billing", areaLabel:"Nebenkosten abrechnen", pageTab:normalized || "qualitaet", pageLabel:normalized || "Prüfen und abschließen", navOrder:navIndex(normalized)};
  }

  function ruleMetadata(definition) {
    const fact = RULE_FACTS[definition.id] || {};
    const nav = navInfo(definition.targetTab);
    const criticalSubtype = CRITICAL_SUBTYPE[definition.id] || "";
    const completionRelevant = !!definition.blocking || definition.category === CATEGORY.PLAUSIBILITY || definition.id === "NKP-FACH-019";
    return Object.freeze(Object.assign({}, definition, {
      targetTab:LEGACY_TARGET_ALIASES[definition.targetTab] || definition.targetTab,
      type:definition.category === CATEGORY.MANDATORY ? "Fachliche Prüfung" : (definition.category === CATEGORY.PLAUSIBILITY ? "Plausibilitätsprüfung" : "Fachlicher Hinweis"),
      navigationArea:nav.areaLabel,
      navigationAreaKey:nav.areaKey,
      navigationPage:nav.pageLabel,
      navigationTab:nav.pageTab,
      navigationOrder:nav.navOrder,
      actualCheckLocation:"js/quality-rules.js · evaluate() / " + definition.id,
      executionTrigger:definition.trigger || "Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.",
      purpose:fact.purpose || definition.description,
      logic:fact.logic || definition.description,
      formula:fact.formula || "Boolesche Fachprüfung gemäß produktiver Auswertungsfunktion.",
      tolerance:fact.tolerance || "Keine zusätzliche Toleranz",
      rounding:fact.rounding || "Gemäß zugrunde liegender Fachberechnung",
      signLogic:fact.sign || "Nicht relevant",
      specialCases:fact.exceptions || definition.notApplicable,
      possibleResults:definition.category === CATEGORY.HINT ? [STATUS.HINT,STATUS.DONE,STATUS.NOT_APPLICABLE] : [criticalSubtype ? STATUS.BLOCKED : STATUS.REVIEW,STATUS.DONE,STATUS.NOT_APPLICABLE],
      consequences:criticalSubtype ? "Fehlerfall verhindert den Abschluss und muss korrigiert werden; bestanden oder nicht anwendbar hat keine Sperrwirkung." : (definition.category === CATEGORY.PLAUSIBILITY ? "Offene Abweichung verlangt eine zulässige Entscheidung oder Korrektur; Hinweis/Bestanden sperrt nicht." : "Hinweis ohne verpflichtende Korrektur oder Entscheidung."),
      completionEffect:criticalSubtype ? "Abschlussverhindernd im Fehlerfall (" + criticalSubtype + ")." : (completionRelevant ? "Offene Entscheidung verhindert den Abschluss; zulässig entschieden oder bestanden nicht." : "Keine Abschlusswirkung."),
      allowedActions:criticalSubtype ? ["Korrigieren","Details","Regeldetails"] : (definition.confirmAllowed ? ["Korrigieren","Entscheiden","Entscheidung ansehen/ändern","Details","Regeldetails"] : ["Details","Regeldetails"]),
      acceptanceAllowed:!!definition.confirmAllowed && !criticalSubtype,
      correctionTarget:(nav.areaLabel + " → " + nav.pageLabel) + (definition.targetSelector ? " · " + definition.targetSelector : ""),
      criticalSubtype,
      completionRelevant,
      productive:true
    }));
  }

  const METER_RULES = Object.freeze([
    ["METERING_DATA_MISSING","Zählerdatenstruktur fehlt","Die produktive Zählerdatenstruktur muss vorhanden sein."],
    ["METERING_VERSION_UNSUPPORTED","Zählerdatenversion wird nicht unterstützt","Die gespeicherte Zählerstandard-Version muss vom aktuellen Modul unterstützt werden."],
    ["METER_ID_MISSING","Zähler-ID fehlt","Jeder Zähler benötigt eine nicht leere technische ID."],
    ["METER_ID_DUPLICATE","Zähler-ID ist doppelt","Zähler-IDs müssen im Bestand eindeutig sein."],
    ["METER_TYPE_MISSING","Zählerart fehlt","Jeder Zähler benötigt eine fachliche Zählerart."],
    ["METER_UNIT_MISSING","Zählereinheit fehlt","Jeder Zähler benötigt eine Einheit."],
    ["METER_INSTALL_DATE_INVALID","Einbaudatum ist ungültig","Das Einbaudatum muss eine gültige ISO-Kalenderangabe sein."],
    ["METER_REMOVAL_DATE_INVALID","Ausbaudatum ist ungültig","Das Ausbaudatum muss eine gültige ISO-Kalenderangabe sein."],
    ["METER_LIFETIME_REVERSED","Zähler-Lebensdauer ist umgekehrt","Das Ausbaudatum darf nicht vor dem Einbaudatum liegen."],
    ["ELECTRICITY_DUMMY_NOT_EXCLUDED","Strom-Dummy ist nicht ausgeschlossen","Als Dummy gekennzeichnete Stromzähler dürfen nicht abrechnungsrelevant sein."],
    ["ELECTRICITY_DUMMY_EXCLUDED","Strom-Dummy wird ausgeschlossen","Bestätigt den produktiven Ausschluss eines Strom-Dummys aus Abrechnungswerten."],
    ["METER_NUMBER_CONFLICT","Zählernummer steht im Konflikt","Physische Zählernummern dürfen nicht unzulässig mehrfach aktiv verwendet werden."],
    ["READING_ID_MISSING","Messwert-ID fehlt","Jeder Messwert benötigt eine ID."],
    ["READING_ID_DUPLICATE","Messwert-ID ist doppelt","Messwert-IDs müssen eindeutig sein."],
    ["READING_METER_UNKNOWN","Messwert verweist auf unbekannten Zähler","Die Zählerreferenz eines Messwerts muss existieren."],
    ["READING_DATE_INVALID","Ablesedatum ist ungültig","Das Ablesedatum muss eine gültige ISO-Kalenderangabe sein."],
    ["READING_VALUE_INVALID","Messwert ist ungültig","Der Ablesewert muss endlich und numerisch sein."],
    ["READING_UNIT_MISMATCH","Messwert-Einheit passt nicht","Messwert- und Zählereinheit müssen übereinstimmen."],
    ["READING_DUPLICATE_ACTIVE","Aktiver Messwert ist doppelt","Für denselben Zähler und Stichtag darf nur ein aktiver Messwert bestehen."],
    ["READING_CORRECTION_LINK_MISSING","Korrekturverknüpfung fehlt","Ein Korrekturmesswert muss auf den korrigierten Messwert verweisen."],
    ["ASSIGNMENT_ID_MISSING","Zuordnungs-ID fehlt","Jede Zählerzuordnung benötigt eine ID."],
    ["ASSIGNMENT_ID_DUPLICATE","Zuordnungs-ID ist doppelt","Zuordnungs-IDs müssen eindeutig sein."],
    ["ASSIGNMENT_METER_UNKNOWN","Zuordnung verweist auf unbekannten Zähler","Die Zählerreferenz einer Zuordnung muss existieren."],
    ["ASSIGNMENT_PERIOD_INVALID","Zuordnungszeitraum ist ungültig","Beginn und Ende einer Zuordnung müssen gültige Kalenderdaten sein."],
    ["ASSIGNMENT_PERIOD_REVERSED","Zuordnungszeitraum ist umgekehrt","Das Zuordnungsende darf nicht vor dem Beginn liegen."],
    ["ASSIGNMENT_OVERLAP","Zählerzuordnungen überschneiden sich","Unvereinbare Zuordnungen desselben Zählers dürfen sich nicht zeitlich überschneiden."],
    ["MEASUREMENT_PERIOD_ID_MISSING","Messperioden-ID fehlt","Jede Messperiode benötigt eine ID."],
    ["MEASUREMENT_PERIOD_ID_DUPLICATE","Messperioden-ID ist doppelt","Messperioden-IDs müssen eindeutig sein."],
    ["MEASUREMENT_PERIOD_METER_UNKNOWN","Messperiode verweist auf unbekannten Zähler","Die Zählerreferenz einer Messperiode muss existieren."],
    ["MEASUREMENT_PERIOD_INVALID","Messperiodenzeitraum ist ungültig","Beginn und Ende müssen gültige Kalenderdaten sein."],
    ["MEASUREMENT_PERIOD_VALUES_INVALID","Messperiodenwerte sind ungültig","Anfangs-, End- und Verbrauchswerte müssen numerisch und konsistent sein."],
    ["METER_READING_REVERSED","Zählerstand ist rückläufig","Der Endstand darf ohne dokumentierten Sonderfall nicht unter dem Anfangsstand liegen."],
    ["MEASUREMENT_PERIOD_DOUBLE_COUNT","Messperiode würde doppelt gezählt","Überlappende abrechnungsrelevante Perioden dürfen denselben Verbrauch nicht doppelt einbeziehen."],
    ["EXCLUDED_METER_PERIOD_BILLABLE","Ausgeschlossener Zähler ist abrechnungsrelevant","Perioden eines ausgeschlossenen Zählers dürfen nicht in die Abrechnung eingehen."],
    ["MEASUREMENT_PERIOD_ASSIGNMENT_MISSING","Messperiode ohne Zuordnung","Für eine abrechnungsrelevante Messperiode muss eine gültige Zuordnung bestehen."],
    ["MEASUREMENT_PERIOD_USER_ASSIGNMENT_GAP","Nutzerzuordnung hat eine Lücke","Die Nutzer-/Fallzuordnung muss den abrechnungsrelevanten Messzeitraum vollständig abdecken."],
    ["MEASUREMENT_PERIOD_ALLOCATION_ESTIMATED","Messperiode wurde geschätzt zugeordnet","Eine geschätzte Zuordnung wird als prüfpflichtiger Sonderfall ausgewiesen."],
    ["METER_REPLACEMENT_REFERENCE_INVALID","Zählerwechsel-Referenz ist ungültig","Alt- und Neuzähler eines Wechsels müssen existieren und verschieden sein."],
    ["METER_REPLACEMENT_DATE_INVALID","Zählerwechseldatum ist ungültig","Das Wechseldatum muss eine gültige Kalenderangabe sein."],
    ["METER_REPLACEMENT_LINK_INCOMPLETE","Zählerwechsel ist unvollständig verknüpft","Alt- und Neuzähler müssen gegenseitig vollständig dokumentiert sein."],
    ["METER_REPLACEMENT_READINGS_MISSING","Wechselstände fehlen","Für den Zählerwechsel müssen Ausbau- und Einbaustand vorhanden sein."],
    ["METER_PERIOD_MISSING","Erforderliche Messperiode fehlt","Für einen abrechnungsrelevanten Zähler fehlt eine passende Messperiode."]
  ].map((entry,index) => Object.freeze({
    id:"NKP-VAL-ZAEHLER-" + String(index + 1).padStart(3,"0"),
    sourceCode:entry[0], title:entry[1], description:entry[2], category:"Produktive Eingabevalidierung", type:"Eingabevalidierung", group:"meter-validation", version:1,
    targetTab:"wasser", targetSelector:"", navigationArea:"Objekt vorbereiten", navigationAreaKey:"object", navigationPage:"Zähler", navigationTab:"wasser", navigationOrder:navIndex("wasser"),
    actualCheckLocation:"js/meter-validation.js · Issue-Code " + entry[0], executionTrigger:"Beim Validieren, Synchronisieren und vor abrechnungsrelevanter Verwendung von Zählerdaten.",
    purpose:entry[2], dataSource:"zaehlerDaten (Zähler, Messwerte, Messperioden, Zuordnungen, Wechsel)", logic:entry[2], formula:"Bedingungsprüfung im produktiven Validator; bei Verstoß wird " + entry[0] + " erzeugt.", tolerance:"Keine, sofern der jeweilige Issue-Code keinen Schätz-/Sonderfall bezeichnet.", rounding:"Keine zusätzliche Rundung", signLogic:"Gemäß Zählerstandsdifferenz; negative Verläufe sind nur als dokumentierter Sonderfall zulässig.", specialCases:"Strom-Dummys werden gespeichert, aber aus der Abrechnung ausgeschlossen; Zählerwechsel und Schätzzuordnungen werden gesondert behandelt.",
    possibleResults:["gültig","Fehler","Hinweis/Sonderfall"], consequences:"Fehlerhafte abrechnungsrelevante Zählerdaten werden nicht stillschweigend als gültige Verbrauchsgrundlage behandelt.", completionEffect:"Je nach Issue-Schwere mittelbar abschlussrelevant über die fachlichen Verbrauchs- und Vollständigkeitsprüfungen.", allowedActions:["Korrigieren","Details","Regeldetails"], acceptanceAllowed:entry[0] === "MEASUREMENT_PERIOD_ALLOCATION_ESTIMATED", correctionTarget:"Objekt vorbereiten → Zähler beziehungsweise Nebenkosten abrechnen → Individuelle Werte", completionRelevant:true, productive:true, inventoryOnly:true
  })));

  const EXTRA_RULES = Object.freeze([
    {id:"NKP-VAL-DIFF-001",title:"Finanzielle Differenzen werden zentral abgeleitet",type:"Fachliche Prüfung",targetTab:"umlage",actualCheckLocation:"js/billing-review.js · deriveDifferences()",purpose:"Manuelle, Verbrauchs-, Umlage-, Vorauszahlungs- und Rundungsdifferenzen ohne doppelte Fachprüfung ableiten.",dataSource:"kostenarten, umlageInputs, zaehlerDaten, vorauszahlungen, calculateUmlage()",logic:"Aus fünf produktiven Differenztypen werden stabile Differenz-IDs sowie Daten- und Berechnungssignaturen erzeugt.",formula:"Differenz je Typ = berechneter Wert − Kontrollwert; nur Werte oberhalb der typbezogenen Toleranz werden ausgegeben.",tolerance:"Typbezogen, überwiegend 0,01/0,02 € beziehungsweise Mengenwert",rounding:"Signaturen verwenden normalisierte Rechenwerte; Anzeige fachgerecht",signLogic:"Vorzeichen bleibt erhalten; monetaryAmount wird für Summen betragsmäßig geführt.",specialCases:"Bewusst dokumentierte Vermieteranteile werden separat berücksichtigt.",possibleResults:[STATUS.DONE,STATUS.REVIEW],consequences:"Offene Differenz verlangt Korrektur oder zulässige Entscheidung.",completionEffect:"Offene Differenz verhindert den Abschluss.",allowedActions:["Korrigieren","Entscheiden","Entscheidung ansehen/ändern","Details","Regeldetails"],acceptanceAllowed:true,correctionTarget:"Nebenkosten abrechnen → Abrechnungsergebnis",completionRelevant:true},
    {id:"NKP-VAL-DIFF-002",title:"Differenzentscheidung ist vollständig begründet",type:"Eingabevalidierung",targetTab:"umlage",actualCheckLocation:"js/billing-review.js · accept()",purpose:"Nachvollziehbare, bewusste Akzeptanzen erzwingen.",dataSource:"Behandlung, Begründung, Bearbeiter, ausdrückliche Bestätigung",logic:"Behandlung muss zulässig sein; Begründung mindestens fünf Zeichen; Bearbeiter nicht leer; Checkbox ausdrücklich bestätigt.",formula:"gültig = Behandlung ∈ TREATMENTS ∧ Länge(Begründung) ≥ 5 ∧ Bearbeiter ≠ leer ∧ confirmed = true",tolerance:"Begründung mindestens 5 Zeichen",rounding:"Keine",signLogic:"Behandlung entscheidet, ob der Betrag als akzeptierte Differenz oder Vermieteranteil geführt wird.",specialCases:"Kritische Abrechnungsmängel sind nicht über diese Funktion akzeptierbar.",possibleResults:["Entscheidung gespeichert","Validierungsfehler"],consequences:"Unvollständige Entscheidung wird nicht gespeichert.",completionEffect:"Nur gültig gespeicherte Entscheidung erledigt eine Differenz.",allowedActions:["Entscheiden","Entscheidung ansehen/ändern"],acceptanceAllowed:true,correctionTarget:"Entscheidungsdialog Abrechnungsergebnis",completionRelevant:true},
    {id:"NKP-VAL-DIFF-003",title:"Entscheidung wird bei Datenänderung ungültig",type:"Fachliche Prüfung",targetTab:"umlage",actualCheckLocation:"js/billing-review.js · decisionStatus()",purpose:"Veraltete Akzeptanzen nach einer Änderung der Ursache verhindern.",dataSource:"record.dataSignature, record.calculationSignature, aktuelle Differenzsignaturen",logic:"Gespeicherte und aktuelle Daten- sowie Berechnungssignatur müssen identisch sein.",formula:"gültig = gespeicherte dataSignature = aktuell ∧ gespeicherte calculationSignature = aktuell",tolerance:"Keine",rounding:"Kanonische normalisierte Signaturwerte",signLogic:"Änderung von Wert oder Vorzeichen ändert die Signatur.",specialCases:"In Korrektur befindliche Entscheidungen bleiben offen.",possibleResults:[STATUS.DONE,STATUS.REVIEW],consequences:"Nicht passende Entscheidung wird als ungültig angezeigt und muss neu behandelt werden.",completionEffect:"Ungültige Entscheidung verhindert den Abschluss.",allowedActions:["Entscheiden","Korrigieren","Details"],acceptanceAllowed:true,correctionTarget:"Nebenkosten abrechnen → Abrechnungsergebnis",completionRelevant:true},
    {id:"NKP-VAL-FINAL-001",title:"Fachliche Abschlussbereitschaft",type:"Fachliche Prüfung",targetTab:"qualitaet",actualCheckLocation:"js/billing-workflow.js · finalizeCurrentBilling() / quality-assurance.js · finalBillingReadiness()",purpose:"Nur einen vollständig geprüften und versandbereiten Stand finalisieren.",dataSource:"Zentraler Qualitätsbericht und Briefprüfungen",logic:"Finalisierung wird nur ausgeführt, wenn keine kritischen Mängel, offenen Entscheidungen oder ausstehenden abschlussrelevanten Prüfungen bestehen.",formula:"kritisch = 0 ∧ entscheidung = 0 ∧ ausstehend(abschlussrelevant) = 0",tolerance:"Keine",rounding:"Keine",signLogic:"Nicht relevant",specialCases:"Versand ist nicht Teil des Abschlusses; Entwurfsbriefe sind vorher zulässig.",possibleResults:["Abschluss freigegeben","Abschluss verweigert"],consequences:"Bei fehlender Bereitschaft wird kein Finalisierungszustand gespeichert.",completionEffect:"Unmittelbar abschlussbestimmend.",allowedActions:["Details","Korrigieren","Abrechnung abschließen"],acceptanceAllowed:false,correctionTarget:"Nebenkosten abrechnen → Prüfen und abschließen",completionRelevant:true},
    {id:"NKP-VAL-FINAL-002",title:"Finalisierter Abrechnungsstand ist schreibgeschützt",type:"Eingabevalidierung",targetTab:"qualitaet",actualCheckLocation:"js/billing-workflow.js und NKProBillingContext.assertWritable()",purpose:"Den geprüften Abrechnungsstand nach Abschluss einfrieren.",dataSource:"meta.currentBillingFinalizedAt und Schreibkontext",logic:"Schreibaktionen werden im finalisierten Zustand abgewiesen, bis eine kontrollierte Korrekturöffnung erfolgt.",formula:"schreibbar = nicht finalisiert ∨ expliziter Finalisierungs-Bypass für Systemaktion",tolerance:"Keine",rounding:"Keine",signLogic:"Nicht relevant",specialCases:"Ansicht, Export und finale Briefe bleiben möglich.",possibleResults:["Schreibbar","Schreibgeschützt"],consequences:"Unzulässige Datenmutation wird verhindert.",completionEffect:"Schützt den abgeschlossenen Stand.",allowedActions:["Details","Zur Korrektur öffnen"],acceptanceAllowed:false,correctionTarget:"Nebenkosten abrechnen → Prüfen und abschließen",completionRelevant:true},
    {id:"NKP-VAL-BRIEF-001",title:"Brief-Preflight vor Ausgabe",type:"Fachliche Prüfung",targetTab:"briefe",actualCheckLocation:"js/document-data.js · Brief-Preflight / acceptanceProtocolData()",purpose:"Empfänger, Berechnungsergebnis und Druckfreigabe vor Entwurf und finaler Ausgabe prüfen.",dataSource:"briefSettings, Mieterstammdaten, calculateUmlage(), Briefzeilen",logic:"Pflichtdaten- und Betragsprüfungen werden zu Fehlern, Hinweisen und OK-Ergebnissen zusammengeführt.",formula:"versandbereit = Fehleranzahl = 0 und zentrale Briefregeln bestanden",tolerance:"Betragsabgleich 0,02 €",rounding:"Briefbeträge auf Cent",signLogic:"Nachzahlung/Guthaben folgt dem berechneten Saldo.",specialCases:"Lange Inhalte erzeugen Hinweise, keine pauschale Sperre.",possibleResults:["Entwurf prüfbar","Versandbereit","Fehler","Hinweis"],consequences:"Fehler verhindern den fachlichen Abschluss; Hinweise nicht.",completionEffect:"Fehlerfall abschlussverhindernd.",allowedActions:["Korrigieren","Details","Briefentwurf prüfen"],acceptanceAllowed:false,correctionTarget:"Nebenkosten abrechnen → Briefe",completionRelevant:true},
    {id:"NKP-VAL-SNAPSHOT-001",title:"Abrechnungssnapshot wird vor Archivierung validiert",type:"Eingabevalidierung",targetTab:"archiv",actualCheckLocation:"js/billing-snapshot.js / js/archive-actions.js · validateBillingSnapshot()",purpose:"Nur vollständige, integritätsgesicherte Abrechnungsstände archivieren.",dataSource:"Abrechnungssnapshot, Metadaten, Objekt-/Periodenbezug, Prüfsumme",logic:"Snapshotstruktur, Pflichtbezug und Integritätschecksumme werden vor Speicherung beziehungsweise Öffnung geprüft.",formula:"gültig = Struktur vollständig ∧ Scope korrekt ∧ Prüfsumme stimmt",tolerance:"Keine",rounding:"Kanonische Snapshotdarstellung",signLogic:"Nicht relevant",specialCases:"Historische Snapshots bleiben unveränderlich und werden nur kontrolliert geöffnet.",possibleResults:["Snapshot gültig","Snapshot abgewiesen"],consequences:"Ungültiger Snapshot wird nicht als verlässlicher Archivstand verwendet.",completionEffect:"Keine direkte Abschlussentscheidung; schützt Archiv-/Snapshotqualität.",allowedActions:["Details","Daten prüfen"],acceptanceAllowed:false,correctionTarget:"Archiv / Datensicherung",completionRelevant:false}
  ].map((entry,index) => {
    const nav = navInfo(entry.targetTab);
    return Object.freeze(Object.assign({version:1,category:entry.type,group:"productive-extra-"+index,description:entry.title,executionTrigger:"Ereignisgesteuert im produktiven Workflow.",navigationArea:nav.areaLabel,navigationAreaKey:nav.areaKey,navigationPage:nav.pageLabel,navigationTab:nav.pageTab,navigationOrder:nav.navOrder,productive:true,inventoryOnly:true},entry));
  }));

  const CORE_REGISTRY = legacy.REGISTRY.filter(rule => rule.category !== CATEGORY.TECHNICAL).map(ruleMetadata);
  const REGISTRY = Object.freeze(CORE_REGISTRY.concat(METER_RULES,EXTRA_RULES).sort((a,b) => (a.navigationOrder-b.navigationOrder) || a.id.localeCompare(b.id,"de")));
  const RULE_BY_ID = Object.freeze(Object.fromEntries(REGISTRY.map(rule => [rule.id,rule])));

  function transformLegacyResult(row) {
    const definition = RULE_BY_ID[row.ruleId] || ruleMetadata((legacy.REGISTRY || []).find(rule=>rule.id===row.ruleId) || {id:row.ruleId,title:row.title,description:row.description,category:row.category,group:row.group,targetTab:row.targetTab,blocking:row.blocking,confirmAllowed:row.confirmAllowed,allowNotApplicable:row.allowNotApplicable,version:row.ruleVersion||1,module:row.module,dataSource:row.dataSource,trigger:row.executionTime,solution:row.solution});
    const mappedStatus = STATUS_MAP[row.status] || row.status;
    const critical = mappedStatus === STATUS.BLOCKED;
    const nav = navInfo(row.targetTab || definition.targetTab);
    return Object.assign({},row,{
      status:mappedStatus,
      findingStatus:STATUS_MAP[row.findingStatus] || row.findingStatus,
      targetTab:nav.pageTab,
      group:nav.pageTab,
      groupLabel:nav.pageLabel,
      groupOrder:nav.navOrder,
      navigationArea:nav.areaLabel,
      navigationAreaKey:nav.areaKey,
      navigationPage:nav.pageLabel,
      criticalSubtype:critical ? (definition.criticalSubtype || "Abrechnung unvollständig") : "",
      consequence:critical ? "Muss korrigiert werden; fachlicher Abschluss ist nicht möglich." : (mappedStatus===STATUS.REVIEW ? "Korrektur oder zulässige fachliche Entscheidung erforderlich; bis dahin kein Abschluss." : (mappedStatus===STATUS.HINT ? "Keine verpflichtende Korrektur oder Entscheidung; Abschluss bleibt möglich." : "Keine offene Abschlusswirkung.")),
      decision:row.confirmation ? {source:"quality-confirmation",mode:row.confirmation.mode,reason:row.confirmation.reason||"",at:row.confirmation.at||""} : null,
      ruleDefinition:definition,
      open:[STATUS.BLOCKED,STATUS.REVIEW,STATUS.HINT,STATUS.NOT_EXECUTED].includes(mappedStatus)
    });
  }

  const DIFFERENCE_RULE_MAP = Object.freeze({
    "manual-total":"NKP-FACH-013",
    "consumption-total":"NKP-PLAU-012",
    "allocation-residual":"NKP-PLAU-010",
    "prepayment-total":"NKP-FACH-015",
    "rounding-total":"NKP-FACH-016"
  });

  function billingReviewRows(data) {
    if (!global.NKProBillingReview || !global.NKProBillingReview.describe().configured) return [];
    let model;
    try { model = global.NKProBillingReview.currentModel(data); } catch (_) { return []; }
    return (model.differences || []).map(diff => {
      const ruleId = DIFFERENCE_RULE_MAP[diff.type] || "NKP-VAL-DIFF-001";
      const definition = RULE_BY_ID[ruleId] || RULE_BY_ID["NKP-VAL-DIFF-001"];
      const accepted = diff.status === global.NKProBillingReview.STATUS.ACCEPTED || diff.status === global.NKProBillingReview.STATUS.LANDLORD;
      const nav = navInfo(diff.targetTab || definition.targetTab || "umlage");
      const decision = diff.record ? {source:"billing-review",status:diff.status,label:diff.label,treatment:diff.record.treatment||"",treatmentLabel:diff.record.treatmentLabel||"",reason:diff.record.reason||"",acceptedBy:diff.record.acceptedBy||"",acceptedAt:diff.record.acceptedAt||"",recordId:diff.record.recordId||""} : {source:"billing-review",status:diff.status,label:diff.label};
      return {
        ruleId, instanceId:ruleId+"|difference:"+diff.id, title:definition.title, description:definition.description, category:definition.category,
        group:nav.pageTab, groupLabel:nav.pageLabel, groupOrder:nav.navOrder, navigationArea:nav.areaLabel,navigationAreaKey:nav.areaKey,navigationPage:nav.pageLabel,
        severity:accepted?"OK":"Prüfen",blocking:false,entity:{type:"difference",id:diff.id,label:diff.costName||diff.area},entityType:"difference",entityId:diff.id,entityLabel:diff.costName||diff.area,
        dataSource:diff.source,prerequisites:"Die finanzielle Differenz ist durch die bestehende Abrechnungsberechnung ableitbar.",notApplicableRule:"Nicht anwendbar, wenn keine Differenz oberhalb der produktiven Toleranz besteht.",executionTime:"Bei Änderung relevanter Eingangsdaten, beim Öffnen der Ergebnisseite und vor dem Abschluss.",
        details:diff.description+" Berechnet: "+String(diff.calculatedValue)+" "+diff.unit+", Kontrollwert: "+String(diff.controlValue)+" "+diff.unit+", Differenz: "+String(diff.difference)+" "+diff.unit+".",resultText:diff.description,
        values:{calculatedValue:diff.calculatedValue,controlValue:diff.controlValue,difference:diff.difference,unit:diff.unit,monetaryAmount:diff.monetaryAmount},comparisonValues:{dataSignature:diff.dataSignature,calculationSignature:diff.calculationSignature},
        targetTab:nav.pageTab,targetSelector:diff.targetSelector||"",solution:"Ursprungswerte korrigieren oder die ausdrücklich zulässige Differenz fachlich entscheiden.",
        confirmAllowed:false,allowNotApplicable:false,justification:"required",ruleVersion:definition.version,module:"billing-review.js",passed:accepted,automaticNotApplicable:false,notApplicableReason:"",fingerprint:diff.dataSignature+":"+diff.calculationSignature,
        status:accepted?STATUS.DONE:STATUS.REVIEW,findingStatus:STATUS.REVIEW,processingState:accepted?diff.label:(diff.status===global.NKProBillingReview.STATUS.INVALID?"Entscheidung nach Datenänderung ungültig":diff.label),confirmation:null,decision,decisionSource:"billing-review",decisionId:diff.id,reviewStatus:diff.status,
        consequence:accepted?"Die dokumentierte Entscheidung ist aktuell gültig; keine offene Abschlusswirkung.":"Korrektur oder zulässige fachliche Entscheidung erforderlich; bis dahin kein Abschluss.",criticalSubtype:"",ruleDefinition:definition,open:!accepted
      };
    });
  }

  function resultPriority(row) {
    return ({[STATUS.BLOCKED]:6,[STATUS.REVIEW]:5,[STATUS.NOT_EXECUTED]:4,[STATUS.HINT]:3,[STATUS.NOT_APPLICABLE]:2,[STATUS.DONE]:1})[row.status] || 0;
  }

  function buildGroups(results) {
    const pages=[];
    navDefinition().filter(group => ["object","billing"].includes(group.key)).forEach(group => (group.items || []).forEach(item => pages.push({id:item.tab,label:item.label,areaKey:group.key,areaLabel:group.label,order:navIndex(item.tab),targetTab:item.tab})));
    return pages.map(page => {
      const rows=results.filter(row=>row.group===page.id && row.ruleId!=="NKP-FACH-019").sort((a,b)=>(a.ruleId||"").localeCompare(b.ruleId||"","de")||(a.entityLabel||"").localeCompare(b.entityLabel||"","de"));
      return Object.freeze(Object.assign({},page,{results:Object.freeze(rows),counts:Object.freeze({blocked:rows.filter(r=>r.status===STATUS.BLOCKED).length,review:rows.filter(r=>r.status===STATUS.REVIEW).length,hints:rows.filter(r=>r.status===STATUS.HINT).length,done:rows.filter(r=>r.status===STATUS.DONE).length,notApplicable:rows.filter(r=>r.status===STATUS.NOT_APPLICABLE).length,notExecuted:rows.filter(r=>r.status===STATUS.NOT_EXECUTED).length})}));
    }).filter(group=>group.results.length);
  }

  function completionRow(data, results) {
    const definition=RULE_BY_ID["NKP-FACH-019"];
    const nav=navInfo("qualitaet");
    const relevant=results.filter(row=>row.ruleId!=="NKP-FACH-019");
    const critical=relevant.filter(row=>row.status===STATUS.BLOCKED);
    const decisions=relevant.filter(row=>row.status===STATUS.REVIEW);
    const pending=relevant.filter(row=>row.status===STATUS.NOT_EXECUTED && row.ruleDefinition && row.ruleDefinition.completionRelevant);
    const ready=!critical.length&&!decisions.length&&!pending.length;
    const details=ready?"Alle relevanten Prüfungen sind ausgeführt, es bestehen keine kritischen Mängel und keine offenen Entscheidungen; die Briefprüfungen sind bestanden.":[
      critical.length?critical.length+" kritische Mängel":"",
      decisions.length?decisions.length+" offene Entscheidungen":"",
      pending.length?pending.length+" ausstehende abschlussrelevante Prüfungen":""
    ].filter(Boolean).join(" · ")+". Der fachliche Abschluss ist noch nicht möglich.";
    return {ruleId:definition.id,instanceId:definition.id+"|billing:current",title:definition.title,description:definition.description,category:definition.category,group:nav.pageTab,groupLabel:nav.pageLabel,groupOrder:nav.navOrder,navigationArea:nav.areaLabel,navigationAreaKey:nav.areaKey,navigationPage:nav.pageLabel,severity:ready?"OK":"Fehler",blocking:!ready,entity:{type:"billing",id:"current",label:"Aktuelle Abrechnung"},entityType:"billing",entityId:"current",entityLabel:"Aktuelle Abrechnung",dataSource:"Zentraler Prüfbericht und Briefstatus",prerequisites:"Alle relevanten Fachprüfungen sind ausführbar.",notApplicableRule:"Die Abschlussprüfung ist immer anwendbar.",executionTime:"Vor jedem Abschlussversuch und beim Öffnen der Seite.",details,resultText:details,values:{critical:critical.map(r=>r.instanceId),decisions:decisions.map(r=>r.instanceId),pending:pending.map(r=>r.instanceId)},comparisonValues:{},targetTab:"qualitaet",targetSelector:"#qualityCompletionCard",solution:ready?"Abrechnung fachlich abschließen.":"Kritische Mängel korrigieren und offene Entscheidungen bearbeiten.",confirmAllowed:false,allowNotApplicable:false,justification:"none",ruleVersion:definition.version,module:"quality-system-k4.js",passed:ready,automaticNotApplicable:false,notApplicableReason:"",fingerprint:[critical.length,decisions.length,pending.length].join(":"),status:ready?STATUS.DONE:(critical.length?STATUS.BLOCKED:(decisions.length?STATUS.REVIEW:STATUS.NOT_EXECUTED)),findingStatus:critical.length?STATUS.BLOCKED:(decisions.length?STATUS.REVIEW:(pending.length?STATUS.NOT_EXECUTED:STATUS.DONE)),processingState:ready?"automatisch bestanden":(critical.length?"kritische Mängel offen":(decisions.length?"Entscheidungen offen":"Prüfungen ausstehend")),confirmation:null,decision:null,consequence:ready?"Abschluss kann ausgeführt werden; der geprüfte Stand wird eingefroren und finale Briefe werden freigegeben.":(critical.length?"Kritische Mängel verhindern den fachlichen Abschluss.":(decisions.length?"Offene Entscheidungen verhindern den fachlichen Abschluss.":"Ausstehende abschlussrelevante Prüfungen verhindern den fachlichen Abschluss.")),criticalSubtype:critical.length?"Abrechnung unvollständig":"",ruleDefinition:definition,open:!ready};
  }

  function summarize(results) {
    const counts={blocked:0,review:0,hints:0,done:0,notApplicable:0,notExecuted:0,technicalErrors:0};
    results.filter(row=>row.ruleId!=="NKP-FACH-019").forEach(row=>{if(row.status===STATUS.BLOCKED)counts.blocked++;else if(row.status===STATUS.REVIEW)counts.review++;else if(row.status===STATUS.HINT)counts.hints++;else if(row.status===STATUS.DONE)counts.done++;else if(row.status===STATUS.NOT_APPLICABLE)counts.notApplicable++;else if(row.status===STATUS.NOT_EXECUTED)counts.notExecuted++;});
    const readiness=counts.blocked?{level:"err",label:"Nicht abschließbar",message:"Kritische Abrechnungsmängel müssen korrigiert werden."}:counts.review?{level:"warn",label:"Entscheidung erforderlich",message:"Die Abrechnung ist berechenbar, aber offene Abweichungen müssen korrigiert oder zulässig entschieden werden."}:counts.notExecuted?{level:"warn",label:"Prüfung ausstehend",message:"Mindestens eine relevante Prüfung wurde noch nicht ausgeführt."}:{level:"ok",label:"Abschlussbereit",message:"Alle relevanten Prüfungen sind erledigt und die Briefe sind versandbereit."};
    return {counts:Object.freeze(counts),groups:Object.freeze(buildGroups(results)),readiness:Object.freeze(readiness)};
  }

  function evaluate(data, options={}) {
    const legacyReport=legacy.evaluate(data,options);
    let results=(legacyReport.results||[]).filter(row=>row.ruleId!=="NKP-FACH-019").map(transformLegacyResult);
    const diffRows=billingReviewRows(data);
    const activeDiffRules=new Set(diffRows.map(row=>row.ruleId));
    results=results.filter(row=>!(activeDiffRules.has(row.ruleId)&&!row.passed));
    results=results.concat(diffRows);
    results.push(completionRow(data,results));
    results.sort((a,b)=>(a.groupOrder-b.groupOrder)||resultPriority(b)-resultPriority(a)||(a.ruleId||"").localeCompare(b.ruleId||"","de")||(a.entityLabel||"").localeCompare(b.entityLabel||"","de"));
    const technical=(legacyReport.technicalResults||[]).map(transformLegacyResult);
    const summary=summarize(results);
    return Object.freeze({registry:REGISTRY,results:Object.freeze(results),technicalResults:Object.freeze(technical),groups:summary.groups,counts:summary.counts,readiness:summary.readiness,issues:Object.freeze(results.filter(row=>[STATUS.BLOCKED,STATUS.REVIEW,STATUS.HINT,STATUS.NOT_EXECUTED].includes(row.status)).map(row=>({code:row.ruleId,severity:row.status===STATUS.BLOCKED?"Fehler":(row.status===STATUS.REVIEW?"Prüfen":"Hinweis"),area:row.navigationArea+" → "+row.navigationPage,point:row.title,detail:row.details,ruleId:row.ruleId,instanceId:row.instanceId,status:row.status,processingState:row.processingState,targetTab:row.targetTab,targetSelector:row.targetSelector,blocking:row.status===STATUS.BLOCKED,confirmAllowed:row.confirmAllowed,fingerprint:row.fingerprint}))),scope:options.scope||"currentBilling",generatedAt:new Date().toISOString()});
  }

  function findResult(report,id){return report&&report.results&&report.results.find(row=>row.instanceId===id)||null;}
  function saveConfirmation(data,row,mode,reason){if(row&&row.decisionSource==="billing-review")throw new Error("Finanzielle Differenzen werden ausschließlich über die bestehende Differenzentscheidung bearbeitet.");return legacy.saveConfirmation(data,row,mode,reason);}
  function removeConfirmation(data,row){if(row&&row.decisionSource==="billing-review")return global.NKProBillingReview.reopen(row.decisionId);return legacy.removeConfirmation(data,row);}
  function describe(){return Object.freeze({name:"NKProQualityRules",registryVersion:4,ruleCount:REGISTRY.length,productiveRuleCount:REGISTRY.length,categories:Object.values(CATEGORY).filter(value=>value!==CATEGORY.TECHNICAL),statuses:Object.values(STATUS),navigationDerived:true,schemaVersionChanged:false});}

  global.NKProQualityRules=Object.freeze({CATEGORY,STATUS,GROUPS:Object.freeze([]),REGISTRY,RULE_BY_ID,describe,evaluate,findResult,saveConfirmation,removeConfirmation,billingKey:legacy.billingKey,storedConfirmation:legacy.storedConfirmation,navInfo,navIndex});
})(globalThis);
