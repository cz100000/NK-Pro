(function (global) {
  "use strict";

  let configured = false;
  let d = {};

  function configure(dependencies) {
    d = Object.assign({}, dependencies || {});
    ["stateAccess", "clone", "withIsolatedState", "qualityRules"].forEach(name => {
      if (!d[name]) throw new Error("NKProQualityAssurance: Abhängigkeit fehlt: " + name);
    });
    configured = true;
    return api;
  }

  function ensureConfigured() { if (!configured) throw new Error("NKProQualityAssurance ist nicht konfiguriert."); }
  function tenantQualityLabel(m) { return (typeof tenantDisplayId === "function" ? tenantDisplayId(m) : (m && m.id || "")) + (m && m.name ? " · " + m.name : ""); }
  function tenantPeriodInterval(m) {
    const start = typeof periodStart === "function" ? periodStart() : "";
    const end = typeof periodEnd === "function" ? periodEnd() : "";
    const ps=Date.parse(start), pe=Date.parse(end), a=Date.parse(m && m.einzug || start), b=Date.parse(m && m.auszug || end);
    if (![ps,pe,a,b].every(Number.isFinite)) return null;
    const from=Math.max(ps,a), to=Math.min(pe,b);
    return from<=to ? { start:from, end:to } : null;
  }
  function expectedTenantDaysInCurrentPeriod(m) { const i=tenantPeriodInterval(m); return i ? Math.round((i.end-i.start)/86400000)+1 : 0; }
  function tenantIntervalLabel(m) { const start=m&&m.einzug||periodStart(), end=m&&m.auszug||periodEnd(); return (typeof dateDe === "function" ? dateDe(start) : start) + " bis " + (typeof dateDe === "function" ? dateDe(end) : end); }
  function tenantRowsHaveOverlappingIntervals(rows) {
    const list=Array.isArray(rows)?rows:[];
    for(let i=0;i<list.length;i+=1)for(let j=i+1;j<list.length;j+=1){const a=tenantPeriodInterval(list[i]),b=tenantPeriodInterval(list[j]);if(a&&b&&a.start<=b.end&&b.start<=a.end)return true;}
    return false;
  }
  function missingBriefFieldsForTenant(tenant) {
    const missing=[]; if(!tenant||!tenant.name)missing.push("Name"); if(!tenant||!tenant.geschlecht||tenant.geschlecht==="Frau/Herr")missing.push("Geschlecht/Anrede prüfen"); if(!tenant||!tenant.strasse)missing.push("Straße"); if(!tenant||!tenant.plz)missing.push("PLZ"); if(!tenant||!tenant.ort)missing.push("Ort"); return missing;
  }

  function readOnlyRun(worker) {
    ensureConfigured();
    const live=d.stateAccess.current(), before=JSON.stringify(live), isolated=d.clone(live);
    const result=d.withIsolatedState(isolated,worker);
    if(JSON.stringify(d.stateAccess.current())!==before)throw new Error("Qualitätsprüfung hat den Arbeitszustand verändert.");
    return result;
  }

  function inspect(options = {}) { return readOnlyRun(() => d.qualityRules.evaluate(state, options)); }
  function centralReport(options = {}) { return inspect(options); }
  function registry() { return d.qualityRules.REGISTRY; }
  function resultByInstanceId(instanceId, options = {}) { return d.qualityRules.findResult(inspect(options), instanceId); }
  function technicalDiagnostics() { return inspect({ scope:"system", includeTechnical:true }).technicalResults; }

  function specialCases() {
    const report=inspect({scope:"currentBilling",includeTechnical:false});
    const rows=report.results.filter(row=>row.category===d.qualityRules.CATEGORY.HINT&&!row.passed).map(row=>({code:row.ruleId,severity:"Hinweis",type:row.title,subject:row.entityLabel,detail:row.details,status:row.status,processingState:row.processingState}));
    return {rows,errors:0,checks:0,hints:rows.filter(row=>row.status==="Hinweis").length,infos:rows.filter(row=>row.status!=="Hinweis").length,underjaehrig:rows.filter(row=>/Unterjährig|Mieterwechsel/i.test(row.type)).length,leerstand:rows.filter(row=>/Leerstand/i.test(row.type)).length,privateCount:rows.filter(row=>/Eigentümer|Privat/i.test(row.type)).length,billableCount:typeof billableTenantRows==="function"?billableTenantRows().length:0,activeUnitCount:typeof activeWohnungen==="function"?activeWohnungen().length:0,level:"ok",label:rows.length?"Hinweise":"OK",message:rows.length?"Sonderfälle und Hinweise wurden zentral erkannt.":"Keine Sonderfälle erkannt."};
  }

  function finalBillingReadiness(report) {
    const source=report&&report.results?report:inspect({scope:"currentBilling",includeTechnical:false});
    const errors=source.results.filter(row=>row.status===d.qualityRules.STATUS.BLOCKED);
    const warnings=source.results.filter(row=>row.status===d.qualityRules.STATUS.REVIEW);
    const hints=source.results.filter(row=>row.status===d.qualityRules.STATUS.HINT);
    const readiness=source.readiness||{};
    return {level:readiness.level||(errors.length?"err":warnings.length?"warn":"ok"),label:readiness.label||(errors.length?"Nicht abschließbar":warnings.length?"Fachlich zu prüfen":"Abschlussbereit"),message:readiness.message||(errors.length?"Die Abrechnung kann noch nicht abgeschlossen werden.":warnings.length?"Keine blockierenden Fehler. Es bestehen noch unbestätigte Plausibilitätsauffälligkeiten.":"Die Abrechnung ist abschlussbereit."),errors,warnings,hints};
  }

  function describe() { return {name:"NKProQualityAssurance",responsibility:"Seiteneffektfreie Orchestrierung der zentralen AP20-Regelregistry",mutatesState:false,commits:false,persists:false,renders:false,publicActions:["inspect","centralReport","registry","specialCases","technicalDiagnostics","finalBillingReadiness"],ruleCount:d.qualityRules.REGISTRY.length}; }
  const api=Object.freeze({configure,describe,inspect,centralReport,registry,resultByInstanceId,technicalDiagnostics,specialCases,finalBillingReadiness,tenantQualityLabel,expectedTenantDaysInCurrentPeriod,tenantIntervalLabel,tenantRowsHaveOverlappingIntervals,missingBriefFieldsForTenant});
  global.NKProQualityAssurance=api;
})(typeof window!=="undefined"?window:globalThis);
