(function (global) {
  "use strict";

  const CATEGORY = Object.freeze({
    MANDATORY:"Fachliche Pflicht- und Konsistenzprüfung",
    PLAUSIBILITY:"Plausibilitätsprüfung",
    HINT:"Fachlicher Hinweis oder Sonderfall",
    TECHNICAL:"Technische Systemprüfung"
  });
  const STATUS = Object.freeze({
    BLOCKED:"Blockiert", REVIEW:"Zu prüfen", HINT:"Hinweis", DONE:"Erledigt",
    NOT_APPLICABLE:"Nicht anwendbar", TECHNICAL_ERROR:"Technischer Fehler"
  });
  const GROUPS = Object.freeze([
    { id:"object-period", label:"Objekt und Abrechnungszeitraum", order:1, targetTab:"einstellungen" },
    { id:"units-tenancies", label:"Wohnungen und Mietverhältnisse", order:2, targetTab:"mieter" },
    { id:"costs", label:"Kosten und Kostenarten", order:3, targetTab:"einstellungen" },
    { id:"consumption", label:"Verbräuche und Zählerstände", order:4, targetTab:"verbraeuche" },
    { id:"prepayments", label:"Vorauszahlungen und Korrekturen", order:5, targetTab:"einnahmen" },
    { id:"allocation", label:"Umlage und Summen", order:6, targetTab:"umlage" },
    { id:"letters", label:"Briefe und Ausgabe", order:7, targetTab:"briefe" },
    { id:"completion", label:"Abschluss", order:8, targetTab:"qualitaet" }
  ]);
  const GROUP_BY_ID = Object.freeze(Object.fromEntries(GROUPS.map(group => [group.id, group])));

  function rule(id, title, category, group, options = {}) {
    return Object.freeze(Object.assign({
      id, title, description:title, category, group, severity:category === CATEGORY.MANDATORY ? "Fehler" : (category === CATEGORY.PLAUSIBILITY ? "Prüfen" : "Hinweis"),
      blocking:category === CATEGORY.MANDATORY, dataSource:"Aktueller Abrechnungszustand", prerequisites:"Für die konkrete Regel erforderliche Daten sind vorhanden.",
      notApplicable:"Regel wird nicht ausgeführt, wenn ihre fachlichen Voraussetzungen fehlen.", trigger:"Bei Änderung relevanter Eingangsdaten und vor dem Abschluss.",
      targetTab:(GROUP_BY_ID[group] || {}).targetTab || "qualitaet", targetSelector:"", solution:"Daten an der Ursache prüfen und korrigieren.",
      confirmAllowed:category === CATEGORY.PLAUSIBILITY || category === CATEGORY.HINT, allowNotApplicable:category === CATEGORY.PLAUSIBILITY,
      justification:category === CATEGORY.PLAUSIBILITY ? "optional" : "none", version:1, module:"quality-rules.js"
    }, options));
  }

  const REGISTRY = Object.freeze([
    rule("NKP-FACH-001","Abrechnungszeitraum ist gültig",CATEGORY.MANDATORY,"object-period",{dataSource:"meta.abrechnungsbeginn, meta.abrechnungsende",targetTab:"einstellungen",solution:"Beginn und Ende des Abrechnungszeitraums korrigieren."}),
    rule("NKP-FACH-002","Mindestens eine aktive Wohnung ist vorhanden",CATEGORY.MANDATORY,"object-period",{dataSource:"wohnungen",targetTab:"wohnungsverwaltung"}),
    rule("NKP-FACH-003","Mindestens ein abrechenbares Mietverhältnis ist vorhanden",CATEGORY.MANDATORY,"units-tenancies",{dataSource:"mieter, Abrechnungszeitraum",targetTab:"mieterverwaltung"}),
    rule("NKP-FACH-004","Mietername ist vorhanden",CATEGORY.MANDATORY,"units-tenancies",{dataSource:"mieter.name",targetTab:"mieterverwaltung",solution:"Den Namen im betroffenen Mietverhältnis ergänzen."}),
    rule("NKP-FACH-005","Wohnungszuordnung ist vorhanden",CATEGORY.MANDATORY,"units-tenancies",{dataSource:"mieter.wohnung, wohnungen.id",targetTab:"mieterverwaltung",solution:"Das Mietverhältnis einer vorhandenen Wohnung zuordnen."}),
    rule("NKP-FACH-006","Mietzeitraum ist logisch",CATEGORY.MANDATORY,"units-tenancies",{dataSource:"mieter.einzug, mieter.auszug",targetTab:"mieterverwaltung",solution:"Einzugs- und Auszugsdatum korrigieren."}),
    rule("NKP-FACH-007","Mietverhältnisse überschneiden sich nicht",CATEGORY.MANDATORY,"units-tenancies",{dataSource:"Mietzeiträume je Wohnung",targetTab:"mieterverwaltung",solution:"Überlappende Zeiträume auflösen."}),
    rule("NKP-PLAU-001","Aktive Tage stimmen mit dem Mietzeitraum überein",CATEGORY.PLAUSIBILITY,"units-tenancies",{dataSource:"mieter.aktiveTage, Mietzeitraum, verwendete Umlageschlüssel",targetTab:"mieterverwaltung",allowNotApplicable:true}),
    rule("NKP-FACH-008","Personenzahl ist für verwendete Schlüssel vorhanden",CATEGORY.MANDATORY,"units-tenancies",{dataSource:"mieter.personen, verwendete Umlageschlüssel",targetTab:"mieterverwaltung"}),
    rule("NKP-HINW-001","Unterjähriges Mietverhältnis",CATEGORY.HINT,"units-tenancies",{dataSource:"Mietzeitraum",targetTab:"mieterverwaltung",solution:"Sonderfall prüfen; bei korrekten Angaben ist keine Änderung erforderlich."}),
    rule("NKP-HINW-002","Leerstand erkannt",CATEGORY.HINT,"units-tenancies",{dataSource:"Aktive Wohnungen und Mietverhältnisse",targetTab:"mieterverwaltung"}),
    rule("NKP-HINW-003","Eigentümer- oder Privatanteil erkannt",CATEGORY.HINT,"units-tenancies",{dataSource:"mieter.abrechnungRolle",targetTab:"mieterverwaltung"}),
    rule("NKP-FACH-009","Aktive Kostenarten sind vorhanden",CATEGORY.MANDATORY,"costs",{dataSource:"kostenarten.inNK",targetTab:"einstellungen"}),
    rule("NKP-FACH-010","Gesamtbetrag der Kostenart ist vorhanden",CATEGORY.MANDATORY,"costs",{dataSource:"kostenarten.gesamtbetrag",targetTab:"einstellungen",solution:"Den Gesamtbetrag der Kostenart erfassen."}),
    rule("NKP-FACH-011","Berechtigte Empfänger der Kostenart sind vorhanden",CATEGORY.MANDATORY,"costs",{dataSource:"kostenartenMieterUmlage, Mietverhältnisse",targetTab:"einstellungen"}),
    rule("NKP-FACH-012","Erforderliche Verteilungsgrundlage ist vorhanden",CATEGORY.MANDATORY,"costs",{dataSource:"Umlageschlüssel, Wohnungen, Mieter, Umlagewerte",targetTab:"einstellungen"}),
    rule("NKP-FACH-013","Manuelle Verteilung entspricht dem Gesamtbetrag",CATEGORY.MANDATORY,"costs",{dataSource:"umlageInputs, kostenarten.gesamtbetrag",targetTab:"manuellewerte"}),
    rule("NKP-PLAU-002","Kostenart weicht stark vom Vorjahr ab",CATEGORY.PLAUSIBILITY,"costs",{dataSource:"kostenarten und vergleichbarer Vorjahressnapshot",targetTab:"einstellungen",justification:"optional"}),
    rule("NKP-PLAU-003","Möglicherweise doppelt erfasste Kosten",CATEGORY.PLAUSIBILITY,"costs",{dataSource:"Kostenartbezeichnung und Gesamtbetrag",targetTab:"einstellungen"}),
    rule("NKP-FACH-014","Erforderliche Verbrauchswerte sind vorhanden",CATEGORY.MANDATORY,"consumption",{dataSource:"Verbrauchskosten, umlageInputs und Zählerstände",targetTab:"verbraeuche"}),
    rule("NKP-PLAU-004","Nullverbrauch bei belegter Wohnung",CATEGORY.PLAUSIBILITY,"consumption",{dataSource:"Verbrauchswerte, Belegungstage, Kostenart",targetTab:"verbraeuche"}),
    rule("NKP-PLAU-005","Zählerendstand liegt unter dem Anfangsstand",CATEGORY.PLAUSIBILITY,"consumption",{dataSource:"waterMeters.readings",targetTab:"verbraeuche",solution:"Eingabe, Zählerwechsel oder Zählerüberlauf prüfen."}),
    rule("NKP-PLAU-006","Hausverbrauch und Wohnungsverbräuche sind plausibel",CATEGORY.PLAUSIBILITY,"consumption",{dataSource:"waterMeters.settings.houseWaterTotal und Wohnungsverbräuche",targetTab:"verbraeuche"}),
    rule("NKP-PLAU-007","Verbrauch weicht stark vom Vorjahr ab",CATEGORY.PLAUSIBILITY,"consumption",{dataSource:"Verbrauch je Wohnung/Kostenart und Vorjahressnapshot",targetTab:"verbraeuche",justification:"optional"}),
    rule("NKP-PLAU-008","Auffällig identische Verbrauchswerte",CATEGORY.PLAUSIBILITY,"consumption",{dataSource:"Verbrauchswerte je Wohnung",targetTab:"verbraeuche"}),
    rule("NKP-HINW-004","Kein geeigneter Vorjahresvergleich möglich",CATEGORY.HINT,"consumption",{dataSource:"jahresArchiv",targetTab:"verbraeuche"}),
    rule("NKP-FACH-015","Vorauszahlungsmatrix und Mieterwerte stimmen überein",CATEGORY.MANDATORY,"prepayments",{dataSource:"vorauszahlungen und berechnete Mieterwerte",targetTab:"einnahmen"}),
    rule("NKP-PLAU-009","Erwartete Vorauszahlung fehlt",CATEGORY.PLAUSIBILITY,"prepayments",{dataSource:"aktive Vorauszahlungskosten, Mieterwerte und Vorjahr",targetTab:"einnahmen"}),
    rule("NKP-HINW-005","Vorauszahlungsanpassung wird nicht gedruckt",CATEGORY.HINT,"prepayments",{dataSource:"prepaymentAdjustmentSettings.letterPrintMode",targetTab:"vorauszahlungsanpassung"}),
    rule("NKP-FACH-016","Umlagesummen stimmen mit den Ausgangskosten überein",CATEGORY.MANDATORY,"allocation",{dataSource:"calculateUmlage und umlageTotals",targetTab:"umlage"}),
    rule("NKP-PLAU-010","Unerklärter Eigentümer- oder Restanteil",CATEGORY.PLAUSIBILITY,"allocation",{dataSource:"umlageTotals.ownerShare",targetTab:"umlage"}),
    rule("NKP-PLAU-011","Abrechnungsergebnis ist ungewöhnlich hoch",CATEGORY.PLAUSIBILITY,"allocation",{dataSource:"Mieterergebnis, Vorauszahlungen und Kostenanteil",targetTab:"umlage"}),
    rule("NKP-FACH-017","Erforderliche Empfänger- und Adressdaten sind vorhanden",CATEGORY.MANDATORY,"letters",{dataSource:"Mieterstammdaten und briefSettings",targetTab:"briefe"}),
    rule("NKP-FACH-018","Briefwerte stimmen mit dem Berechnungsergebnis überein",CATEGORY.MANDATORY,"letters",{dataSource:"briefCostRows und calculateUmlage",targetTab:"briefe"}),
    rule("NKP-HINW-006","Druckbild sollte wegen langer Inhalte kontrolliert werden",CATEGORY.HINT,"letters",{dataSource:"Brieftexte, Adressen und Kostenartenbezeichnungen",targetTab:"briefe"}),
    rule("NKP-FACH-019","Abschlussvoraussetzungen sind erfüllt",CATEGORY.MANDATORY,"completion",{dataSource:"Alle zentralen fachlichen Prüfergebnisse",targetTab:"qualitaet",confirmAllowed:false}),
    rule("NKP-TECH-001","Datenschema und Datenebenenvertrag",CATEGORY.TECHNICAL,"completion",{blocking:false,dataSource:"meta.dataSchemaVersion, meta.dataLayerContractVersion",targetTab:"sicherung",confirmAllowed:false}),
    rule("NKP-TECH-002","Datensatz ist serialisierbar",CATEGORY.TECHNICAL,"completion",{blocking:false,dataSource:"Aktueller Arbeitszustand",targetTab:"sicherung",confirmAllowed:false}),
    rule("NKP-TECH-003","Start- und Renderdiagnose",CATEGORY.TECHNICAL,"completion",{blocking:false,dataSource:"runtimeDiagnostics, startupErrors, renderErrors",targetTab:"sicherung",confirmAllowed:false}),
    rule("NKP-TECH-004","Persistenz- und Snapshot-Integrität",CATEGORY.TECHNICAL,"completion",{blocking:false,dataSource:"Persistenz- und Snapshotmodule",targetTab:"sicherung",confirmAllowed:false}),
    rule("NKP-TECH-005","PWA-, Service-Worker- und Offlinebasis",CATEGORY.TECHNICAL,"completion",{blocking:false,dataSource:"Manifest, Service Worker und Browserunterstützung",targetTab:"sicherung",confirmAllowed:false}),
    rule("NKP-TECH-006","Interne Regressionstests",CATEGORY.TECHNICAL,"completion",{blocking:false,dataSource:"Release-Audit und App-Selbsttest",targetTab:"sicherung",confirmAllowed:false})
  ]);
  const RULE_BY_ID = Object.freeze(Object.fromEntries(REGISTRY.map(item => [item.id, item])));

  function numSafe(value) { const n = Number(String(value ?? "").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function text(value) { return String(value == null ? "" : value).trim(); }
  function fnv1a(value) {
    let hash = 0x811c9dc5;
    const input = String(value || "");
    for (let i = 0; i < input.length; i += 1) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
    return (hash >>> 0).toString(16).padStart(8,"0");
  }
  function stableJson(value) {
    if (value == null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(stableJson).join(",") + "]";
    return "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + stableJson(value[key])).join(",") + "}";
  }
  function billingKey(data) {
    const meta = data && data.meta || {};
    return [meta.abrechnungsjahr || "", meta.abrechnungsbeginn || "", meta.abrechnungsende || ""].join("|");
  }
  function entityKey(entity) { return [entity && entity.type || "billing", entity && entity.id || "current"].join(":"); }
  function instanceId(ruleId, entity) { return ruleId + "|" + entityKey(entity); }
  function groupInfo(id) { return GROUP_BY_ID[id] || GROUPS[GROUPS.length - 1]; }

  function confirmationStore(data, create) {
    if (!data || typeof data !== "object") return {};
    if (!data.meta) { if (!create) return {}; data.meta = {}; }
    if (!data.meta.qualityRuleConfirmationsV2 || typeof data.meta.qualityRuleConfirmationsV2 !== "object") {
      if (!create) return {};
      data.meta.qualityRuleConfirmationsV2 = {};
    }
    const key = billingKey(data);
    if (!data.meta.qualityRuleConfirmationsV2[key] || typeof data.meta.qualityRuleConfirmationsV2[key] !== "object") {
      if (!create) return {};
      data.meta.qualityRuleConfirmationsV2[key] = {};
    }
    return data.meta.qualityRuleConfirmationsV2[key];
  }
  function storedConfirmation(result, data) {
    const record = confirmationStore(data, false)[result.instanceId];
    return record && record.fingerprint === result.fingerprint ? record : null;
  }

  function baseResult(ruleId, options = {}) {
    const definition = RULE_BY_ID[ruleId];
    if (!definition) throw new Error("Unbekannte Prüfregel: " + ruleId);
    const entity = Object.assign({ type:"billing", id:"current", label:"Aktuelle Abrechnung" }, options.entity || {});
    const values = options.values || {};
    const result = {
      ruleId:definition.id, title:definition.title, description:definition.description, category:definition.category,
      group:definition.group, groupLabel:groupInfo(definition.group).label, groupOrder:groupInfo(definition.group).order,
      severity:options.severity || definition.severity, blocking:options.blocking !== undefined ? !!options.blocking : !!definition.blocking,
      entity, entityType:entity.type, entityId:entity.id, entityLabel:entity.label,
      dataSource:options.dataSource || definition.dataSource, prerequisites:options.prerequisites || definition.prerequisites,
      notApplicableRule:definition.notApplicable, executionTime:definition.trigger,
      details:options.details || "", resultText:options.resultText || options.details || "", values,
      comparisonValues:options.comparisonValues || {}, targetTab:options.targetTab || definition.targetTab,
      targetSelector:options.targetSelector || definition.targetSelector, solution:options.solution || definition.solution,
      confirmAllowed:options.confirmAllowed !== undefined ? !!options.confirmAllowed : !!definition.confirmAllowed,
      allowNotApplicable:options.allowNotApplicable !== undefined ? !!options.allowNotApplicable : !!definition.allowNotApplicable,
      justification:options.justification || definition.justification, ruleVersion:definition.version, module:definition.module,
      passed:!!options.passed, automaticNotApplicable:!!options.automaticNotApplicable, notApplicableReason:options.notApplicableReason || ""
    };
    result.instanceId = instanceId(ruleId, entity);
    result.fingerprint = fnv1a(stableJson({ ruleId, entity:entityKey(entity), values, comparisonValues:result.comparisonValues, passed:result.passed, details:result.details }));
    return result;
  }

  function finalizeResult(result, data) {
    let status;
    let processingState;
    const findingStatus = result.category === CATEGORY.TECHNICAL ? STATUS.TECHNICAL_ERROR : (result.blocking ? STATUS.BLOCKED : (result.category === CATEGORY.PLAUSIBILITY ? STATUS.REVIEW : STATUS.HINT));
    const confirmation = storedConfirmation(result, data);
    if (result.automaticNotApplicable) { status = STATUS.NOT_APPLICABLE; processingState = "automatisch nicht anwendbar"; }
    else if (result.passed) { status = STATUS.DONE; processingState = "automatisch bestanden"; }
    else if (confirmation && confirmation.mode === "not-applicable") { status = STATUS.NOT_APPLICABLE; processingState = "als nicht anwendbar bestätigt"; }
    else if (confirmation && confirmation.mode === "read") { status = STATUS.DONE; processingState = "nur gelesen"; }
    else if (confirmation) { status = STATUS.DONE; processingState = "geprüft und bestätigt"; }
    else { status = findingStatus; processingState = "noch offen"; }
    return Object.assign(result, { status, findingStatus, processingState, confirmation, open:status === STATUS.BLOCKED || status === STATUS.REVIEW || status === STATUS.HINT || status === STATUS.TECHNICAL_ERROR });
  }

  function result(ruleId, options, data) { return finalizeResult(baseResult(ruleId, options), data); }
  function passed(ruleId, details, values, data, options = {}) { return result(ruleId, Object.assign({ passed:true, details, values }, options), data); }
  function notApplicable(ruleId, reason, data, options = {}) { return result(ruleId, Object.assign({ automaticNotApplicable:true, notApplicableReason:reason, details:reason }, options), data); }

  function activeCosts(data) { return (Array.isArray(data.kostenarten) ? data.kostenarten : []).filter(cost => cost && text(cost.kostenart) && cost.inNK === "Ja"); }
  function currentTenants() { try { return visibleTenantRows(); } catch (_) { return []; } }
  function billableTenants() { try { return billableTenantRows(); } catch (_) { return currentTenants().filter(row => row && row.abrechnungRolle !== "Eigentümer/Privat"); } }
  function privateTenants() { try { return privateTenantRows(); } catch (_) { return currentTenants().filter(row => row && row.abrechnungRolle === "Eigentümer/Privat"); } }
  function labelTenant(row) { try { return NK_PRO_MODULES.qualityAssurance && NK_PRO_MODULES.qualityAssurance.tenantQualityLabel(row); } catch (_) { return (row && (row.id || row.name)) || "Mietverhältnis"; } }
  function tenantEntity(row) { return { type:"tenant", id:text(row && row.id) || String(row && row.originalIndex || ""), label:labelTenant(row) }; }
  function unitEntity(row) { return { type:"unit", id:text(row && row.id), label:(typeof unitDisplayId === "function" ? unitDisplayId(row) : text(row && row.id)) }; }
  function costEntity(cost) { return { type:"cost", id:text(cost && cost.id), label:[text(cost && cost.id),text(cost && cost.kostenart)].filter(Boolean).join(" · ") }; }
  function periodSerial(value) { const n = Date.parse(value); return Number.isFinite(n) ? n : null; }
  function periodDays(start, end) { const a=periodSerial(start), b=periodSerial(end); return a !== null && b !== null && b >= a ? Math.round((b-a)/86400000)+1 : 0; }
  function tenantInterval(row, start, end) {
    const a=periodSerial(row && row.einzug) ?? periodSerial(start), b=periodSerial(row && row.auszug) ?? periodSerial(end), ps=periodSerial(start), pe=periodSerial(end);
    if (a===null || b===null || ps===null || pe===null) return null;
    const from=Math.max(a,ps), to=Math.min(b,pe); return from<=to ? {from,to,days:Math.round((to-from)/86400000)+1} : null;
  }
  function usesPersonBasis(costs) { return costs.some(cost => /person/i.test(text(cost.umlageschluessel))); }
  function usesDayBasis(costs, tenants, fullDays) { return costs.some(cost => /tag|mietzeit/i.test(text(cost.umlageschluessel))) || tenants.some(row => { const i=tenantInterval(row, periodStart(), periodEnd()); return i && i.days < fullDays; }); }
  function priorArchiveData(data) {
    const currentYear = Number(data && data.meta && data.meta.abrechnungsjahr);
    const items = Array.isArray(data && data.jahresArchiv) ? data.jahresArchiv : [];
    const candidates = items.map(item => ({ item, year:Number(item && (item.year || item.meta && item.meta.abrechnungsjahr || item.data && item.data.meta && item.data.meta.abrechnungsjahr)) })).filter(x => Number.isFinite(x.year) && (!Number.isFinite(currentYear) || x.year < currentYear)).sort((a,b)=>b.year-a.year);
    const source = candidates[0] && candidates[0].item;
    return source && source.data && typeof source.data === "object" ? source.data : null;
  }
  function tenantByUnit(data) {
    const map = {};
    (Array.isArray(data && data.mieter) ? data.mieter : []).forEach((row,index) => { if (!row || !text(row.wohnung)) return; if (!map[row.wohnung]) map[row.wohnung]=[]; map[row.wohnung].push(Object.assign({originalIndex:index},row)); });
    return map;
  }
  function costConsumption(data, cost, tenant, index) {
    const input = data && data.umlageInputs && data.umlageInputs[cost.id] && Array.isArray(data.umlageInputs[cost.id].values) ? data.umlageInputs[cost.id].values[index] : undefined;
    if (input !== undefined && input !== "") return numSafe(input);
    try { return meterTotalForCostAndTenant(cost.id, tenant.originalIndex !== undefined ? tenant.originalIndex : index); } catch (_) { return 0; }
  }
  function priorConsumption(prior, costId, unitId) {
    if (!prior) return null;
    const tenants = tenantByUnit(prior)[unitId] || [];
    const cost = (Array.isArray(prior.kostenarten) ? prior.kostenarten : []).find(row => row && row.id === costId);
    if (!cost || !tenants.length) return null;
    return tenants.reduce((sum,row,index) => {
      const values = prior.umlageInputs && prior.umlageInputs[costId] && Array.isArray(prior.umlageInputs[costId].values) ? prior.umlageInputs[costId].values : [];
      return sum + numSafe(values[row.originalIndex !== undefined ? row.originalIndex : index]);
    },0);
  }
  function consumptionThreshold(cost) {
    const label=(text(cost && cost.kostenart)+" "+text(cost && cost.id)).toLowerCase();
    if (/strom/.test(label)) return {percent:35,min:100};
    if (/gas|heiz|wärm/.test(label)) return {percent:40,min:300};
    if (/wasser/.test(label)) return {percent:50,min:10};
    return {percent:50,min:10};
  }

  function evaluateFactual(data) {
    const results=[];
    const start=text(data.meta && data.meta.abrechnungsbeginn), end=text(data.meta && data.meta.abrechnungsende);
    const startSerial=periodSerial(start), endSerial=periodSerial(end), fullDays=periodDays(start,end);
    if (!start || !end || startSerial===null || endSerial===null || endSerial<startSerial) results.push(result("NKP-FACH-001",{details:"Zeitraum "+(start||"–")+" bis "+(end||"–")+" ist ungültig.",values:{start,end}},data)); else results.push(passed("NKP-FACH-001","Zeitraum "+start+" bis "+end+" ist gültig.",{start,end},data));
    const units=(Array.isArray(data.wohnungen)?data.wohnungen:[]).filter(row=>row&&text(row.id));
    const activeUnits=units.filter(row=>text(row.status).toLowerCase()!=="inaktiv");
    results.push(activeUnits.length ? passed("NKP-FACH-002",activeUnits.length+" aktive Wohnungen vorhanden.",{count:activeUnits.length},data) : result("NKP-FACH-002",{details:"Keine aktive Wohnung vorhanden.",values:{count:0}},data));
    const tenants=currentTenants(), billable=billableTenants(), privates=privateTenants();
    results.push(billable.length ? passed("NKP-FACH-003",billable.length+" abrechenbare Mietverhältnisse vorhanden.",{count:billable.length},data) : result("NKP-FACH-003",{details:"Kein abrechenbares Mietverhältnis vorhanden.",values:{count:0}},data));
    const unitIds=new Set(units.map(row=>row.id));
    const missingNames=billable.filter(row=>!text(row.name));
    if (missingNames.length) missingNames.forEach(row=>results.push(result("NKP-FACH-004",{entity:tenantEntity(row),details:"Name fehlt.",values:{name:row.name||""},targetSelector:'[data-tenant-id="'+text(row.id)+'"]'},data))); else results.push(passed("NKP-FACH-004","Alle abrechenbaren Mietverhältnisse besitzen einen Namen.",{count:billable.length},data));
    const missingUnits=tenants.filter(row=>!text(row.wohnung)||!unitIds.has(row.wohnung));
    if (missingUnits.length) missingUnits.forEach(row=>results.push(result("NKP-FACH-005",{entity:tenantEntity(row),details:!text(row.wohnung)?"Wohnungszuordnung fehlt.":"Zugeordnete Wohnung "+row.wohnung+" existiert nicht.",values:{wohnung:row.wohnung||""}},data))); else results.push(passed("NKP-FACH-005","Alle relevanten Mietverhältnisse sind vorhandenen Wohnungen zugeordnet.",{count:tenants.length},data));
    const reversed=tenants.filter(row=>row.einzug&&row.auszug&&periodSerial(row.auszug)!==null&&periodSerial(row.einzug)!==null&&periodSerial(row.auszug)<periodSerial(row.einzug));
    if (reversed.length) reversed.forEach(row=>results.push(result("NKP-FACH-006",{entity:tenantEntity(row),details:"Auszug liegt vor Einzug.",values:{einzug:row.einzug,auszug:row.auszug}},data))); else results.push(passed("NKP-FACH-006","Keine logisch umgekehrten Mietzeiträume gefunden.",{count:tenants.length},data));
    const byUnit={}; billable.forEach(row=>{ if (!row.wohnung) return; (byUnit[row.wohnung]||(byUnit[row.wohnung]=[])).push(row); });
    const overlaps=[]; Object.entries(byUnit).forEach(([unit,rows])=>{ for(let i=0;i<rows.length;i++) for(let j=i+1;j<rows.length;j++){ const a=tenantInterval(rows[i],start,end),b=tenantInterval(rows[j],start,end); if(a&&b&&a.from<=b.to&&b.from<=a.to) overlaps.push({unit,a:rows[i],b:rows[j]}); }});
    if (overlaps.length) overlaps.forEach(x=>results.push(result("NKP-FACH-007",{entity:{type:"unit",id:x.unit,label:x.unit},details:labelTenant(x.a)+" und "+labelTenant(x.b)+" überschneiden sich.",values:{a:[x.a.einzug,x.a.auszug],b:[x.b.einzug,x.b.auszug]}},data))); else results.push(passed("NKP-FACH-007","Keine Überschneidungen gefunden.",{units:Object.keys(byUnit).length},data));
    const costs=activeCosts(data), dayRelevant=usesDayBasis(costs,billable,fullDays), personRelevant=usesPersonBasis(costs);
    if (!dayRelevant) results.push(notApplicable("NKP-PLAU-001","Aktive Tage werden in dieser Konstellation nicht als Verteilungsgrundlage benötigt.",data)); else {
      const mismatches=billable.map(row=>({row,interval:tenantInterval(row,start,end)})).filter(x=>x.interval&&Math.abs(numSafe(x.row.aktiveTage)-x.interval.days)>1);
      if(mismatches.length) mismatches.forEach(x=>results.push(result("NKP-PLAU-001",{entity:tenantEntity(x.row),details:"Eingetragen "+numSafe(x.row.aktiveTage)+", erwartet "+x.interval.days+" Tage.",values:{entered:numSafe(x.row.aktiveTage),expected:x.interval.days},allowNotApplicable:true},data))); else results.push(passed("NKP-PLAU-001","Aktive Tage sind plausibel.",{checked:billable.length},data));
    }
    if (!personRelevant) results.push(notApplicable("NKP-FACH-008","Keine verwendete Kostenart benötigt die Personenzahl.",data)); else {
      const missing=billable.filter(row=>numSafe(row.personen)<=0);
      if(missing.length) missing.forEach(row=>results.push(result("NKP-FACH-008",{entity:tenantEntity(row),details:"Personenzahl fehlt oder ist 0.",values:{personen:row.personen}},data))); else results.push(passed("NKP-FACH-008","Personenzahlen sind für alle betroffenen Mietverhältnisse vorhanden.",{count:billable.length},data));
    }
    const under=billable.filter(row=>{const i=tenantInterval(row,start,end); return i&&fullDays&&i.days<fullDays;});
    if(under.length) under.forEach(row=>{const i=tenantInterval(row,start,end);results.push(result("NKP-HINW-001",{entity:tenantEntity(row),details:i.days+" von "+fullDays+" Tagen belegt.",values:{days:i.days,periodDays:fullDays}},data));}); else results.push(passed("NKP-HINW-001","Keine unterjährigen Mietverhältnisse erkannt.",{count:0},data));
    const occupiedUnitIds=new Set(billable.map(row=>row.wohnung));
    const vacancy=activeUnits.filter(row=>!occupiedUnitIds.has(row.id)&&!privates.some(p=>p.wohnung===row.id));
    if(vacancy.length) vacancy.forEach(row=>results.push(result("NKP-HINW-002",{entity:unitEntity(row),details:"Aktive Wohnung ohne abrechenbares Mietverhältnis.",values:{unit:row.id}},data))); else results.push(passed("NKP-HINW-002","Kein unbelegter aktiver Wohnungsdatensatz erkannt.",{count:0},data));
    if(privates.length) privates.forEach(row=>results.push(result("NKP-HINW-003",{entity:tenantEntity(row),details:"Datensatz wird als Eigentümer/Privat geführt.",values:{role:row.abrechnungRolle}},data))); else results.push(passed("NKP-HINW-003","Kein Eigentümer-/Privatdatensatz vorhanden.",{count:0},data));
    return {results, units, activeUnits, tenants, billable, privates, costs, fullDays};
  }

  function evaluateCosts(data, ctx) {
    const results=[], costs=ctx.costs, billable=ctx.billable;
    results.push(costs.length ? passed("NKP-FACH-009",costs.length+" aktive NK-Kostenarten vorhanden.",{count:costs.length},data) : result("NKP-FACH-009",{details:"Keine aktive NK-Kostenart vorhanden.",values:{count:0}},data));
    const noAmount=costs.filter(cost=>numSafe(cost.gesamtbetrag)<=0);
    if(noAmount.length) noAmount.forEach(cost=>results.push(result("NKP-FACH-010",{entity:costEntity(cost),details:"Gesamtbetrag fehlt oder ist 0.",values:{gesamtbetrag:numSafe(cost.gesamtbetrag)}},data))); else results.push(passed("NKP-FACH-010","Alle aktiven Kostenarten besitzen einen Gesamtbetrag.",{count:costs.length},data));
    const noRecipients=costs.filter(cost=>!billable.some(row=>{try{return isCostAllowedForTenant(cost.id,row);}catch(_){return true;}}));
    if(noRecipients.length) noRecipients.forEach(cost=>results.push(result("NKP-FACH-011",{entity:costEntity(cost),details:"Keine berechtigten Mietverhältnisse vorhanden.",values:{costId:cost.id}},data))); else results.push(passed("NKP-FACH-011","Alle aktiven Kostenarten besitzen berechtigte Empfänger.",{count:costs.length},data));
    const missingBasis=[];
    costs.forEach(cost=>{
      const key=text(cost.umlageschluessel).toLowerCase();
      if(/wohnfläche/.test(key)&&ctx.activeUnits.reduce((s,row)=>s+numSafe(row.wohnflaeche),0)<=0) missingBasis.push({cost,reason:"Wohnfläche fehlt"});
      if(/person/.test(key)&&ctx.billable.reduce((s,row)=>s+numSafe(row.personen),0)<=0) missingBasis.push({cost,reason:"Personenzahl fehlt"});
      if(/verbrauch/.test(key)){ const input=data.umlageInputs&&data.umlageInputs[cost.id]&&Array.isArray(data.umlageInputs[cost.id].values)?data.umlageInputs[cost.id].values:[]; if(input.reduce((s,v)=>s+numSafe(v),0)<=0) missingBasis.push({cost,reason:"Verbrauchsbasis fehlt"}); }
    });
    if(missingBasis.length) missingBasis.forEach(x=>results.push(result("NKP-FACH-012",{entity:costEntity(x.cost),details:x.reason+".",values:{key:x.cost.umlageschluessel}},data))); else results.push(passed("NKP-FACH-012","Erforderliche Verteilungsgrundlagen sind vorhanden.",{count:costs.length},data));
    const manual=[]; costs.forEach(cost=>{const isManual=cost.berechnungsart==="Manuell je Mieter"||/manuell|einzelbetrag/i.test(text(cost.umlageschluessel)); if(!isManual||numSafe(cost.gesamtbetrag)<=0)return; const values=data.umlageInputs&&data.umlageInputs[cost.id]&&Array.isArray(data.umlageInputs[cost.id].values)?data.umlageInputs[cost.id].values:[]; const sum=ctx.billable.reduce((s,row)=>s+numSafe(values[row.originalIndex]),0); if(Math.abs(sum-numSafe(cost.gesamtbetrag))>.02)manual.push({cost,sum});});
    if(manual.length) manual.forEach(x=>results.push(result("NKP-FACH-013",{entity:costEntity(x.cost),details:"Einzelwerte "+fmtMoney(x.sum)+" vs. Gesamtbetrag "+fmtMoney(x.cost.gesamtbetrag)+".",values:{sum:x.sum,total:numSafe(x.cost.gesamtbetrag)}},data))); else results.push(passed("NKP-FACH-013","Manuelle Verteilungen sind summenkonsistent oder nicht erforderlich.",{count:manual.length},data));
    const prior=priorArchiveData(data);
    if(!prior) results.push(notApplicable("NKP-PLAU-002","Kein vergleichbarer Vorjahressnapshot vorhanden.",data)); else {
      const priorCosts=new Map((Array.isArray(prior.kostenarten)?prior.kostenarten:[]).map(cost=>[cost.id,cost])); const findings=[];
      costs.forEach(cost=>{const old=priorCosts.get(cost.id); if(!old||numSafe(old.gesamtbetrag)<=0||numSafe(cost.gesamtbetrag)<=0)return; const delta=numSafe(cost.gesamtbetrag)-numSafe(old.gesamtbetrag),pct=delta/numSafe(old.gesamtbetrag)*100; if(Math.abs(pct)>=30&&Math.abs(delta)>=100)findings.push({cost,old:numSafe(old.gesamtbetrag),current:numSafe(cost.gesamtbetrag),delta,pct});});
      if(findings.length)findings.forEach(x=>results.push(result("NKP-PLAU-002",{entity:costEntity(x.cost),details:"Vorjahr "+fmtMoney(x.old)+", aktuell "+fmtMoney(x.current)+" ("+(x.pct>=0?"+":"")+x.pct.toFixed(1)+" %).",values:{current:x.current,previous:x.old,absoluteDelta:x.delta,percentDelta:x.pct},comparisonValues:{previousYear:prior.meta&&prior.meta.abrechnungsjahr}},data))); else results.push(passed("NKP-PLAU-002","Keine starke Kostenabweichung mit ausreichender Datenbasis gefunden.",{compared:costs.length},data));
    }
    const dup=[]; for(let i=0;i<costs.length;i++)for(let j=i+1;j<costs.length;j++){const a=costs[i],b=costs[j]; if(text(a.kostenart).toLowerCase()===text(b.kostenart).toLowerCase()&&Math.abs(numSafe(a.gesamtbetrag)-numSafe(b.gesamtbetrag))<.01)dup.push({a,b});}
    if(dup.length)dup.forEach(x=>results.push(result("NKP-PLAU-003",{entity:costEntity(x.a),details:"Gleiche Bezeichnung und gleicher Betrag wie "+costEntity(x.b).label+".",values:{other:x.b.id,amount:numSafe(x.a.gesamtbetrag)}},data))); else results.push(passed("NKP-PLAU-003","Keine auffälligen Dubletten erkannt.",{count:costs.length},data));
    return {results, prior};
  }

  function evaluateConsumption(data, ctx, prior) {
    const results=[]; const consumption=ctx.costs.filter(cost=>/verbrauch/i.test(text(cost.umlageschluessel)));
    if(!consumption.length){results.push(notApplicable("NKP-FACH-014","Keine aktive Kostenart verwendet Verbrauch als Grundlage.",data)); results.push(notApplicable("NKP-PLAU-004","Keine aktive Verbrauchskostenart vorhanden.",data)); results.push(notApplicable("NKP-PLAU-007","Keine aktive Verbrauchskostenart vorhanden.",data)); results.push(notApplicable("NKP-PLAU-008","Keine aktive Verbrauchskostenart vorhanden.",data)); results.push(notApplicable("NKP-HINW-004","Kein Vorjahresvergleich erforderlich.",data));}
    else {
      const missing=[]; const zeros=[]; const deviations=[]; const duplicateFindings=[];
      consumption.forEach(cost=>{
        const vals=[];
        ctx.billable.forEach((tenant,index)=>{if(!(function(){try{return isCostAllowedForTenant(cost.id,tenant);}catch(_){return true;}})())return; const value=costConsumption(data,cost,tenant,tenant.originalIndex!==undefined?tenant.originalIndex:index); vals.push({tenant,value}); if(numSafe(cost.gesamtbetrag)>0&&value<=0){missing.push({cost,tenant}); const interval=tenantInterval(tenant,periodStart(),periodEnd()); if(interval&&interval.days>=30)zeros.push({cost,tenant,days:interval.days});}
          const old=priorConsumption(prior,cost.id,tenant.wohnung); if(old!==null&&old>0&&value>=0){const threshold=consumptionThreshold(cost),delta=value-old,pct=delta/old*100;if(Math.abs(pct)>=threshold.percent&&Math.abs(delta)>=threshold.min)deviations.push({cost,tenant,current:value,old,delta,pct,threshold});}
        });
        const buckets={}; vals.filter(x=>x.value>0).forEach(x=>{const k=x.value.toFixed(3);(buckets[k]||(buckets[k]=[])).push(x.tenant);}); Object.entries(buckets).forEach(([value,rows])=>{if(rows.length>=3)duplicateFindings.push({cost,value:Number(value),rows});});
      });
      if(missing.length)missing.forEach(x=>results.push(result("NKP-FACH-014",{entity:{type:"consumption",id:x.cost.id+":"+x.tenant.id,label:costEntity(x.cost).label+" · "+labelTenant(x.tenant)},details:"Für ein abrechenbares Mietverhältnis fehlt der erforderliche Verbrauchswert.",values:{costId:x.cost.id,tenantId:x.tenant.id,value:0}},data))); else results.push(passed("NKP-FACH-014","Erforderliche Verbrauchswerte sind vorhanden.",{costs:consumption.length},data));
      if(zeros.length)zeros.forEach(x=>results.push(result("NKP-PLAU-004",{entity:{type:"consumption",id:x.cost.id+":"+x.tenant.id,label:costEntity(x.cost).label+" · "+labelTenant(x.tenant)},details:"0 Verbrauch bei "+x.days+" belegten Tagen.",values:{value:0,occupiedDays:x.days}},data))); else results.push(passed("NKP-PLAU-004","Kein auffälliger Nullverbrauch bei belegten Wohnungen erkannt.",{checked:ctx.billable.length},data));
      if(prior&&deviations.length)deviations.forEach(x=>results.push(result("NKP-PLAU-007",{entity:{type:"consumption",id:x.cost.id+":"+x.tenant.wohnung,label:costEntity(x.cost).label+" · "+x.tenant.wohnung},details:"Aktuell "+formatPlainNumber(x.current,3)+", Vorjahr "+formatPlainNumber(x.old,3)+" ("+(x.pct>=0?"+":"")+x.pct.toFixed(1)+" %).",values:{current:x.current,previous:x.old,absoluteDelta:x.delta,percentDelta:x.pct,thresholdPercent:x.threshold.percent},comparisonValues:{unit:x.tenant.wohnung,previousYear:prior.meta&&prior.meta.abrechnungsjahr}},data))); else if(prior)results.push(passed("NKP-PLAU-007","Keine starke Verbrauchsabweichung mit vergleichbarer Datenbasis erkannt.",{costs:consumption.length},data)); else results.push(notApplicable("NKP-PLAU-007","Kein vergleichbarer Vorjahressnapshot vorhanden.",data));
      if(duplicateFindings.length)duplicateFindings.forEach(x=>results.push(result("NKP-PLAU-008",{entity:costEntity(x.cost),details:x.rows.length+" Wohnungen besitzen denselben Wert "+formatPlainNumber(x.value,3)+".",values:{value:x.value,units:x.rows.map(r=>r.wohnung)}},data))); else results.push(passed("NKP-PLAU-008","Keine auffällig identischen Werte in mindestens drei Wohnungen erkannt.",{costs:consumption.length},data));
      results.push(prior ? passed("NKP-HINW-004","Vergleichbarer Vorjahressnapshot wurde gefunden.",{year:prior.meta&&prior.meta.abrechnungsjahr},data) : result("NKP-HINW-004",{details:"Kein geeigneter Vorjahresvergleich möglich.",values:{archiveCount:Array.isArray(data.jahresArchiv)?data.jahresArchiv.length:0}},data));
    }
    const rollovers=[]; if(data.waterMeters&&Array.isArray(data.waterMeters.readings))data.waterMeters.readings.forEach((row,index)=>{if(!row)return; if((row.kwEnd!==""&&numSafe(row.kwEnd)<numSafe(row.kwStart))||(row.wwEnd!==""&&numSafe(row.wwEnd)<numSafe(row.wwStart)))rollovers.push({row,index,tenant:data.mieter&&data.mieter[index]});});
    if(rollovers.length)rollovers.forEach(x=>results.push(result("NKP-PLAU-005",{entity:{type:"meter",id:String(x.index),label:labelTenant(x.tenant||{})},details:"Mindestens ein Endstand liegt unter dem Anfangsstand.",values:{kwStart:x.row.kwStart,kwEnd:x.row.kwEnd,wwStart:x.row.wwStart,wwEnd:x.row.wwEnd}},data))); else results.push(passed("NKP-PLAU-005","Keine rückläufigen Wasserzählerstände erkannt.",{checked:data.waterMeters&&data.waterMeters.readings?data.waterMeters.readings.length:0},data));
    const house=numSafe(data.waterMeters&&data.waterMeters.settings&&data.waterMeters.settings.houseWaterTotal); let sum=0; try{const water=consumption.filter(c=>/wasser/i.test(text(c.kostenart)+" "+text(c.id))); sum=water.reduce((s,c)=>s+ctx.billable.reduce((a,t,i)=>a+costConsumption(data,c,t,t.originalIndex!==undefined?t.originalIndex:i),0),0);}catch(_){}
    if(house<=0)results.push(notApplicable("NKP-PLAU-006","Kein Hausverbrauch als Vergleichswert vorhanden.",data)); else {const delta=house-sum,pct=house?delta/house*100:0;if(Math.abs(delta)>.5&&Math.abs(pct)>5)results.push(result("NKP-PLAU-006",{details:"Haus "+formatPlainNumber(house,3)+", Wohnungen "+formatPlainNumber(sum,3)+" (Abweichung "+pct.toFixed(1)+" %).",values:{house,units:sum,absoluteDelta:delta,percentDelta:pct}},data));else results.push(passed("NKP-PLAU-006","Haus- und Wohnungsverbrauch stimmen innerhalb der Toleranz überein.",{house,units:sum},data));}
    return results;
  }

  function evaluateFinancial(data, ctx) {
    const results=[];
    let calc=null,totals=null; try{calc=calculateUmlage();totals=umlageTotals(calc);}catch(error){results.push(result("NKP-FACH-016",{details:"Umlage konnte nicht ausgewertet werden: "+error.message,values:{error:error.message}},data));}
    const activePrepay=ctx.costs.filter(cost=>cost.vorauszahlung==="Ja"); let matrixDelta=0;
    if(activePrepay.length){try{matrixDelta=totals?numSafe(totals.prepaymentMatrixTotal)-numSafe(totals.prepayments):0;}catch(_){} }
    if(activePrepay.length&&Math.abs(matrixDelta)>.02)results.push(result("NKP-FACH-015",{details:"Vorauszahlungsmatrix weicht um "+fmtMoney(matrixDelta)+" ab.",values:{delta:matrixDelta}},data));else results.push(activePrepay.length?passed("NKP-FACH-015","Vorauszahlungsmatrix und Mieterwerte stimmen überein.",{delta:matrixDelta},data):notApplicable("NKP-FACH-015","Keine aktive Vorauszahlungskostenart vorhanden.",data));
    if(!activePrepay.length)results.push(notApplicable("NKP-PLAU-009","Keine Erwartungsgrundlage für Vorauszahlungen vorhanden.",data));else {const zero=ctx.billable.filter(t=>{try{return Math.abs(totalVorauszahlungForTenant(t.originalIndex))<=.01;}catch(_){return numSafe(t.nkVoraus)<=.01;}}); if(zero.length)zero.forEach(t=>results.push(result("NKP-PLAU-009",{entity:tenantEntity(t),details:"Für das Mietverhältnis ist trotz aktiver Vorauszahlungskosten keine Vorauszahlung vorhanden.",values:{prepayment:0}},data)));else results.push(passed("NKP-PLAU-009","Für alle betroffenen Mietverhältnisse sind Vorauszahlungen vorhanden.",{count:ctx.billable.length},data));}
    const settings=data.prepaymentAdjustmentSettings||{}; if(settings.letterPrintMode==="Nicht drucken")results.push(result("NKP-HINW-005",{details:"Berechnete Anpassungen werden bewusst nicht im Brief ausgegeben.",values:{letterPrintMode:settings.letterPrintMode}},data));else results.push(passed("NKP-HINW-005","Vorauszahlungsanpassung ist nicht ausdrücklich vom Briefdruck ausgeschlossen.",{letterPrintMode:settings.letterPrintMode||""},data));
    if(totals){const delta=numSafe(totals.allocationDelta); if(Math.abs(delta)>.02)results.push(result("NKP-FACH-016",{details:"Aktive Kosten und Verteilung weichen um "+fmtMoney(delta)+" ab.",values:{allocationDelta:delta,totalCosts:totals.totalCosts,allTenantShare:totals.allTenantShare}},data));else results.push(passed("NKP-FACH-016","Aktive Kosten und Verteilung stimmen überein.",{allocationDelta:delta},data));
      const owner=numSafe(totals.ownerShare); if(Math.abs(owner)>.02)results.push(result("NKP-PLAU-010",{details:"Nicht auf Mieter umgelegter Restanteil: "+fmtMoney(owner)+".",values:{ownerShare:owner,totalCosts:totals.totalCosts}},data));else results.push(passed("NKP-PLAU-010","Kein unerklärter Restanteil vorhanden.",{ownerShare:owner},data));
      const high=[];(calc&&calc.tenantResults||[]).forEach(row=>{const amount=Math.abs(numSafe(row.costShare)-numSafe(row.prepayments)-numSafe(row.correction)); const basis=Math.max(Math.abs(numSafe(row.prepayments)),500); if(amount>=1000&&amount>=basis*.75)high.push({row,amount,basis});}); if(high.length)high.forEach(x=>results.push(result("NKP-PLAU-011",{entity:tenantEntity(x.row.tenant),details:"Abrechnungsergebnis "+fmtMoney(x.amount)+" bei Vorauszahlungen "+fmtMoney(x.row.prepayments)+".",values:{result:x.amount,prepayments:x.row.prepayments,costShare:x.row.costShare}},data)));else results.push(passed("NKP-PLAU-011","Keine ungewöhnlich hohen Nachzahlungen oder Guthaben nach der dokumentierten Schwelle erkannt.",{checked:(calc&&calc.tenantResults||[]).length},data));
    }
    return {results,calc,totals};
  }

  function evaluateLetters(data, ctx, calc) {
    const results=[]; const missing=[];
    ctx.billable.forEach(tenant=>{const fields=[]; if(!text(tenant.name))fields.push("Name"); if(!text(tenant.strasse))fields.push("Straße"); if(!text(tenant.plz))fields.push("PLZ"); if(!text(tenant.ort))fields.push("Ort"); if(fields.length)missing.push({tenant,fields});});
    const bs=data.briefSettings||{}; const globalMissing=[]; if(!text(bs.absenderName))globalMissing.push("Vermietername"); if(!text(bs.briefdatum))globalMissing.push("Briefdatum");
    if(missing.length)missing.forEach(x=>results.push(result("NKP-FACH-017",{entity:tenantEntity(x.tenant),details:"Fehlende Briefdaten: "+x.fields.join(", ")+".",values:{missing:x.fields}},data))); if(globalMissing.length)results.push(result("NKP-FACH-017",{entity:{type:"letter-settings",id:"global",label:"Brief-Einstellungen"},details:"Fehlende Angaben: "+globalMissing.join(", ")+".",values:{missing:globalMissing}},data)); if(!missing.length&&!globalMissing.length)results.push(passed("NKP-FACH-017","Erforderliche Empfänger- und Kerndaten sind vorhanden.",{tenants:ctx.billable.length},data));
    const mismatches=[]; if(calc){try{briefResultRows(calc).forEach(row=>{const rows=briefCostRows(calc,row.tenant),sum=rows.reduce((s,r)=>s+numSafe(r.anteil),0);if(Math.abs(sum-numSafe(row.costShare))>.02)mismatches.push({row,sum});});}catch(error){mismatches.push({error});}}
    if(mismatches.length)mismatches.forEach(x=>results.push(result("NKP-FACH-018",{entity:x.row?tenantEntity(x.row.tenant):{type:"letter",id:"calculation",label:"Briefberechnung"},details:x.error?"Briefwerte konnten nicht geprüft werden.":"Brief "+fmtMoney(x.sum)+" vs. Umlage "+fmtMoney(x.row.costShare)+".",values:x.error?{error:x.error.message}:{brief:x.sum,calculation:x.row.costShare}},data)));else results.push(passed("NKP-FACH-018","Briefwerte stimmen mit den Berechnungsergebnissen überein.",{checked:calc&&calc.tenantResults?calc.tenantResults.length:0},data));
    const long=[]; try{const selected=calc&&selectedBriefTenant(calc); if(selected){const rows=briefCostRows(calc,selected.tenant); briefLongTextRisks(rows,selected.tenant,bs,bs.vorauszahlungPrintMode!=="Nicht drucken").forEach(msg=>long.push(msg));}}catch(_){}
    if(long.length)results.push(result("NKP-HINW-006",{details:long.join(" "),values:{risks:long}},data));else results.push(passed("NKP-HINW-006","Keine auffälligen Langtextrisiken erkannt.",{count:0},data));
    return results;
  }

  function evaluateCompletion(data, currentResults) {
    const blocking=currentResults.filter(row=>row.blocking&&row.status===STATUS.BLOCKED); const review=currentResults.filter(row=>row.findingStatus===STATUS.REVIEW&&row.status===STATUS.REVIEW);
    if(blocking.length)return result("NKP-FACH-019",{details:"Abschluss durch "+blocking.length+" blockierende Prüfpunkte verhindert.",values:{blocking:blocking.map(x=>x.instanceId),openReviews:review.map(x=>x.instanceId)}},data);
    if(review.length)return result("NKP-FACH-019",{blocking:false,severity:"Prüfen",confirmAllowed:false,details:"Keine Blocker, aber "+review.length+" unbestätigte Plausibilitätsauffälligkeiten.",values:{blocking:[],openReviews:review.map(x=>x.instanceId)}},data);
    return passed("NKP-FACH-019","Alle Pflichtprüfungen bestanden und alle relevanten Auffälligkeiten bearbeitet.",{blocking:0,openReviews:0},data);
  }

  function evaluateTechnical(data) {
    const results=[];
    const schema=numSafe(data.meta&&data.meta.dataSchemaVersion),contract=numSafe(data.meta&&data.meta.dataLayerContractVersion);
    if(schema===Number(typeof DATA_SCHEMA_VERSION!=="undefined"?DATA_SCHEMA_VERSION:5)&&contract===Number(typeof DATA_LAYER_CONTRACT_VERSION!=="undefined"?DATA_LAYER_CONTRACT_VERSION:1))results.push(passed("NKP-TECH-001","Datenschema "+schema+" und Datenebenenvertrag "+contract+" sind aktuell.",{schema,contract},data));else results.push(result("NKP-TECH-001",{details:"Erwartet Schema "+(typeof DATA_SCHEMA_VERSION!=="undefined"?DATA_SCHEMA_VERSION:5)+" / Vertrag "+(typeof DATA_LAYER_CONTRACT_VERSION!=="undefined"?DATA_LAYER_CONTRACT_VERSION:1)+", gefunden "+schema+" / "+contract+".",values:{schema,contract},blocking:false},data));
    try{JSON.stringify(data);results.push(passed("NKP-TECH-002","Aktueller Datensatz ist JSON-serialisierbar.",{serializable:true},data));}catch(error){results.push(result("NKP-TECH-002",{details:error.message,values:{serializable:false},blocking:false},data));}
    const runtime=global.NKProRuntimeDiagnostics&&global.NKProRuntimeDiagnostics.snapshot?global.NKProRuntimeDiagnostics.snapshot():{}; const startList=typeof startupErrors!=="undefined"?startupErrors:[], renderList=typeof renderErrors!=="undefined"?renderErrors:[]; const startOk=!startList.length,renderOk=!renderList.length;
    if(startOk&&renderOk)results.push(passed("NKP-TECH-003","Keine Start- oder Renderfehler protokolliert.",{startErrors:0,renderErrors:0},data));else results.push(result("NKP-TECH-003",{details:startList.concat(renderList).map(x=>x.message||String(x)).join("; "),values:{startErrors:startList.length,renderErrors:renderList.length},blocking:false},data));
    let snapshotValid=true,snapshotDetail="Persistenz- und Snapshotmodule sind geladen."; try{snapshotValid=!!global.NKProPersistence&&!!global.NKProBillingSnapshot;if(!snapshotValid)snapshotDetail="Persistenz- oder Snapshotmodul fehlt.";}catch(error){snapshotValid=false;snapshotDetail=error.message;}
    results.push(snapshotValid?passed("NKP-TECH-004",snapshotDetail,{modulesLoaded:true},data):result("NKP-TECH-004",{details:snapshotDetail,values:{modulesLoaded:false},blocking:false},data));
    const manifest=typeof document!=="undefined"&&!!document.querySelector('link[rel="manifest"]'),sw=!!global.NKProServiceWorkerRegistration||(typeof navigator!=="undefined"&&"serviceWorker" in navigator); results.push(manifest&&sw?passed("NKP-TECH-005","Manifest und Service-Worker-Basis sind vorhanden.",{manifest,serviceWorker:sw},data):result("NKP-TECH-005",{details:"Manifest oder Service-Worker-Basis fehlt.",values:{manifest,serviceWorker:sw},blocking:false},data));
    results.push(passed("NKP-TECH-006","Release-Audit und App-Selbsttest sind getrennt als bedarfsgesteuerte Regressionstests verfügbar.",{releaseAudit:!!(global.NKProDiagnostics&&global.NKProDiagnostics.releaseAuditReport),selfTest:!!(global.NKProDiagnostics&&global.NKProDiagnostics.appSelfTestReport)},data));
    return results;
  }

  function summarize(results) {
    const visible=results.filter(row=>row.category!==CATEGORY.TECHNICAL);
    const counts={blocked:0,review:0,hints:0,done:0,notApplicable:0,technicalErrors:0};
    results.forEach(row=>{if(row.status===STATUS.BLOCKED)counts.blocked++;else if(row.status===STATUS.REVIEW)counts.review++;else if(row.status===STATUS.HINT)counts.hints++;else if(row.status===STATUS.DONE)counts.done++;else if(row.status===STATUS.NOT_APPLICABLE)counts.notApplicable++;else if(row.status===STATUS.TECHNICAL_ERROR)counts.technicalErrors++;});
    const groups=GROUPS.map(group=>{const rows=visible.filter(row=>row.group===group.id);return Object.assign({},group,{results:rows,counts:{blocked:rows.filter(r=>r.status===STATUS.BLOCKED).length,review:rows.filter(r=>r.status===STATUS.REVIEW).length,hints:rows.filter(r=>r.status===STATUS.HINT).length,done:rows.filter(r=>r.status===STATUS.DONE).length,notApplicable:rows.filter(r=>r.status===STATUS.NOT_APPLICABLE).length}});});
    const readiness=counts.blocked?{level:"err",label:"Nicht abschließbar",message:"Die Abrechnung kann noch nicht abgeschlossen werden."}:counts.review?{level:"warn",label:"Fachlich zu prüfen",message:"Keine blockierenden Fehler. Es bestehen noch unbestätigte Plausibilitätsauffälligkeiten."}:{level:"ok",label:"Abschlussbereit",message:"Die Abrechnung ist abschlussbereit."};
    return {counts,groups,readiness};
  }

  function evaluate(data, options = {}) {
    const factual=evaluateFactual(data), cost=evaluateCosts(data,factual), consumption=evaluateConsumption(data,factual,cost.prior), financial=evaluateFinancial(data,factual), letters=evaluateLetters(data,factual,financial.calc);
    let results=[...factual.results,...cost.results,...consumption,...financial.results,...letters];
    results.push(evaluateCompletion(data,results));
    const technical=options.includeTechnical===false?[]:evaluateTechnical(data);
    const summary=summarize(results.concat(technical));
    return Object.freeze({
      registry:REGISTRY, results:Object.freeze(results), technicalResults:Object.freeze(technical), groups:Object.freeze(summary.groups), counts:Object.freeze(summary.counts), readiness:Object.freeze(summary.readiness),
      issues:Object.freeze(results.filter(row=>!row.passed&&!row.automaticNotApplicable).map(row=>({code:row.ruleId,severity:row.status===STATUS.BLOCKED?"Fehler":(row.status===STATUS.REVIEW?"Prüfen":(row.status===STATUS.HINT?"Hinweis":"OK")),area:row.groupLabel,point:row.title,detail:row.details,ruleId:row.ruleId,instanceId:row.instanceId,status:row.status,processingState:row.processingState,targetTab:row.targetTab,targetSelector:row.targetSelector,blocking:row.blocking,confirmAllowed:row.confirmAllowed,fingerprint:row.fingerprint}))),
      scope:options.scope||"currentBilling", generatedAt:new Date().toISOString()
    });
  }

  function findResult(report, id) { return report && report.results && report.results.find(row=>row.instanceId===id) || null; }
  function saveConfirmation(data, resultRow, mode, reason) {
    if (!resultRow) throw new Error("Prüfpunkt wurde nicht gefunden.");
    if (resultRow.blocking || !resultRow.confirmAllowed) throw new Error("Dieser Prüfpunkt kann nicht bestätigt werden.");
    if (mode==="not-applicable"&&!resultRow.allowNotApplicable) throw new Error("Diese Regel kann nicht als nicht anwendbar markiert werden.");
    const store=confirmationStore(data,true); store[resultRow.instanceId]={ruleId:resultRow.ruleId,entityKey:entityKey(resultRow.entity),fingerprint:resultRow.fingerprint,mode:mode||"confirmed",reason:text(reason),at:new Date().toISOString(),appVersion:typeof APP_VERSION!=="undefined"?APP_VERSION:""}; return store[resultRow.instanceId];
  }
  function removeConfirmation(data, resultRow) { const store=confirmationStore(data,false); if(resultRow&&store[resultRow.instanceId])delete store[resultRow.instanceId]; return true; }
  function describe() { return Object.freeze({name:"NKProQualityRules",registryVersion:1,ruleCount:REGISTRY.length,categories:Object.values(CATEGORY),statuses:Object.values(STATUS),groupCount:GROUPS.length}); }

  global.NKProQualityRules=Object.freeze({CATEGORY,STATUS,GROUPS,REGISTRY,describe,evaluate,findResult,saveConfirmation,removeConfirmation,billingKey,storedConfirmation});
})(globalThis);
