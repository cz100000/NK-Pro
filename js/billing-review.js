(function (global) {
  "use strict";

  const REVIEW_VERSION = 1;
  const STATUS = Object.freeze({
    OPEN:"open",
    IN_CORRECTION:"in-correction",
    ACCEPTED:"accepted",
    LANDLORD:"landlord",
    RESOLVED:"resolved-by-correction",
    INVALID:"acceptance-invalid"
  });
  const STATUS_LABELS = Object.freeze({
    [STATUS.OPEN]:"Offen",
    [STATUS.IN_CORRECTION]:"In Korrektur",
    [STATUS.ACCEPTED]:"Akzeptiert",
    [STATUS.LANDLORD]:"Vermieter trägt",
    [STATUS.RESOLVED]:"Erledigt durch Korrektur",
    [STATUS.INVALID]:"Akzeptanz ungültig – erneut prüfen"
  });
  const TREATMENTS = Object.freeze([
    Object.freeze({ value:"landlord-private", label:"Vermieter trägt – Privatanteil", group:"landlord" }),
    Object.freeze({ value:"landlord-vacancy", label:"Vermieter trägt – Leerstand", group:"landlord" }),
    Object.freeze({ value:"landlord-non-allocable", label:"Vermieter trägt – nicht umlagefähig", group:"landlord" }),
    Object.freeze({ value:"landlord-other", label:"Vermieter trägt – sonstiger Anteil", group:"landlord" }),
    Object.freeze({ value:"accepted-rounding", label:"Akzeptierte Rundungsdifferenz", group:"accepted" }),
    Object.freeze({ value:"accepted-other", label:"Sonstige fachlich akzeptierte Differenz", group:"accepted" })
  ]);
  let deps = null;

  function configure(options = {}) {
    if (deps) return describe();
    if (!options.stateAccess || typeof options.stateAccess.current !== "function" || typeof options.stateAccess.transact !== "function") throw new Error("Differenzprüfung benötigt NKProStateAccess.");
    if (!options.calculation || typeof options.calculation.calculateUmlage !== "function" || typeof options.calculation.individualValuePageModel !== "function") throw new Error("Differenzprüfung benötigt die Abrechnungsberechnung.");
    deps = Object.freeze({
      stateAccess:options.stateAccess,
      calculation:options.calculation,
      appVersion:String(options.appVersion || ""),
      now:typeof options.now === "function" ? options.now : () => new Date().toISOString()
    });
    return describe();
  }

  function requireDeps() {
    if (!deps) throw new Error("Differenzprüfung wurde noch nicht konfiguriert.");
    return deps;
  }

  function number(value) {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value).replace(/\./g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function text(value) { return String(value === undefined || value === null ? "" : value).trim(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") {
      return Object.keys(value).sort().reduce((result, key) => {
        if (value[key] !== undefined) result[key] = canonical(value[key]);
        return result;
      }, {});
    }
    if (typeof value === "number") return Number.isFinite(value) ? Math.round(value * 1e9) / 1e9 : 0;
    return value;
  }

  function stableStringify(value) { return JSON.stringify(canonical(value)); }
  function hash(value) {
    const source = String(value || "");
    let result = 0x811c9dc5;
    for (let index = 0; index < source.length; index += 1) {
      result ^= source.charCodeAt(index);
      result = Math.imul(result, 0x01000193);
    }
    return (result >>> 0).toString(16).padStart(8, "0");
  }

  function periodKey(data) {
    const meta = data && data.meta || {};
    return [text(meta.abrechnungsjahr), text(meta.abrechnungsbeginn), text(meta.abrechnungsende)].join("|");
  }

  function ensureContainer(data) {
    if (!data.abrechnungsPruefungen || typeof data.abrechnungsPruefungen !== "object" || Array.isArray(data.abrechnungsPruefungen)) {
      data.abrechnungsPruefungen = { version:REVIEW_VERSION, records:{}, history:[] };
    }
    const container = data.abrechnungsPruefungen;
    container.version = REVIEW_VERSION;
    if (!container.records || typeof container.records !== "object" || Array.isArray(container.records)) container.records = {};
    if (!Array.isArray(container.history)) container.history = [];
    return container;
  }

  function readContainer(data) {
    const container = data && data.abrechnungsPruefungen;
    return container && typeof container === "object" && !Array.isArray(container)
      ? { version:container.version || REVIEW_VERSION, records:container.records && typeof container.records === "object" && !Array.isArray(container.records) ? container.records : {}, history:Array.isArray(container.history) ? container.history : [] }
      : { version:REVIEW_VERSION, records:{}, history:[] };
  }

  function treatment(value) { return TREATMENTS.find(row => row.value === value) || null; }
  function statusLabel(status) { return STATUS_LABELS[status] || STATUS_LABELS[STATUS.OPEN]; }

  function differenceId(type, costId, data) {
    return "DIF-" + hash([type, text(costId), periodKey(data)].join("|")).toUpperCase();
  }

  function activeCostMap(data) {
    return new Map((Array.isArray(data && data.kostenarten) ? data.kostenarten : []).filter(row => row && row.id && row.inNK === "Ja").map(row => [String(row.id), row]));
  }

  function allocationMap(calculation) {
    return new Map((calculation && Array.isArray(calculation.costResults) ? calculation.costResults : []).map(row => [String(row.cost && row.cost.id || ""), row]));
  }

  function costSourceSignature(data, cost, type, modelRow, allocationRow) {
    const base = {
      period:periodKey(data),
      type,
      cost:{
        id:text(cost && cost.id), active:text(cost && cost.inNK), amount:number(cost && cost.gesamtbetrag), consumption:number(cost && cost.gesamtverbrauch), price:number(cost && cost.preisProEinheit),
        calculation:text(cost && cost.berechnungsart), key:text(cost && cost.umlageschluessel), exclusion:text(cost && cost.ausschlussBehandlung)
      },
      cases:requireDeps().calculation.individualValueCases(data).map(row => ({ key:row.caseKey, role:row.role, unitId:row.unitId, tenantId:row.tenantId, start:row.start, end:row.end })),
      roles:(Array.isArray(data && data.mieter) ? data.mieter : []).map(row => ({ id:row && row.id, unit:row && row.wohnung, role:row && row.abrechnungRolle, entry:row && row.einzug, exit:row && row.auszug }))
    };
    if (type === "manual-total") {
      const input = data && data.umlageInputs && data.umlageInputs[cost.id] || {};
      base.input = { mode:input.mode || input.art || "", values:input.values || [], caseValues:input.caseValues || {} };
    } else if (type === "consumption-total") {
      base.meters = (modelRow && modelRow.rows || []).map(row => ({ meterId:row.meterId, caseKey:row.caseKey, start:row.startValue, end:row.endValue, consumption:row.consumption, status:row.status, startDate:row.startDate, endDate:row.endDate }));
    } else {
      base.allocation = allocationRow ? {
        ownerShare:number(allocationRow.ownerShare), documentedOwnerShare:number(allocationRow.documentedOwnerShare), vacancyShare:number(allocationRow.vacancyShare), allocations:allocationRow.allocations || {}, status:allocationRow.status
      } : null;
    }
    return hash(stableStringify(base));
  }

  function makeDifference(data, input) {
    const signedDifference = number(input.difference);
    const calculationPayload = {
      calculatedValue:number(input.calculatedValue), controlValue:number(input.controlValue), difference:signedDifference,
      unit:text(input.unit), monetaryAmount:number(input.monetaryAmount)
    };
    return Object.freeze({
      id:differenceId(input.type, input.costId, data),
      type:input.type,
      costId:text(input.costId),
      area:text(input.area || input.costName || "Abrechnung"),
      costName:text(input.costName || input.area || "Abrechnung"),
      description:text(input.description),
      calculatedValue:number(input.calculatedValue),
      controlValue:number(input.controlValue),
      difference:signedDifference,
      unit:text(input.unit || "€"),
      monetaryAmount:Math.abs(number(input.monetaryAmount !== undefined ? input.monetaryAmount : signedDifference)),
      cause:text(input.cause),
      source:text(input.source),
      targetTab:text(input.targetTab || "umlage"),
      targetSelector:text(input.targetSelector || ""),
      dataSignature:text(input.dataSignature),
      calculationSignature:hash(stableStringify(calculationPayload))
    });
  }

  function deriveDifferences(data, suppliedCalculation) {
    const d = requireDeps();
    const calculation = suppliedCalculation || d.calculation.calculateUmlage();
    const model = d.calculation.individualValuePageModel(data);
    const costs = activeCostMap(data);
    const allocations = allocationMap(calculation);
    const differences = [];
    const representedCosts = new Set();

    (model.manualCosts || []).forEach(summary => {
      if (Math.abs(number(summary.difference)) <= number(summary.tolerance || 0.01)) return;
      const cost = costs.get(String(summary.cost && summary.cost.id || "")) || summary.cost || {};
      const allocation = allocations.get(String(cost.id || ""));
      representedCosts.add(String(cost.id || ""));
      differences.push(makeDifference(data, {
        type:"manual-total", costId:cost.id, costName:cost.kostenart, area:cost.kostenart,
        description:"Summe der individuellen Kostenwerte weicht von den Gesamtkosten ab.",
        calculatedValue:summary.actual, controlValue:summary.expected, difference:summary.difference, unit:"€",
        monetaryAmount:Math.abs(number(allocation && allocation.ownerShare) - number(allocation && allocation.documentedOwnerShare)) || Math.abs(number(summary.difference)),
        cause:"Individuelle Werte / externe Einzelabrechnung", source:"umlageInputs." + text(cost.id) + ".caseValues ↔ kostenarten.gesamtbetrag",
        targetTab:"manuellewerte", targetSelector:'[data-individual-section="manual"]',
        dataSignature:costSourceSignature(data, cost, "manual-total", summary, allocation)
      }));
    });

    (model.consumptionCosts || []).forEach(summary => {
      if (!summary.expectedPresent || Math.abs(number(summary.difference)) <= number(summary.tolerance || 0.01)) return;
      const cost = costs.get(String(summary.cost && summary.cost.id || "")) || summary.cost || {};
      const allocation = allocations.get(String(cost.id || ""));
      representedCosts.add(String(cost.id || ""));
      const residual = Math.abs(number(allocation && allocation.ownerShare) - number(allocation && allocation.documentedOwnerShare));
      const unitPrice = number(cost.preisProEinheit) || (number(summary.expected) ? number(cost.gesamtbetrag) / number(summary.expected) : 0);
      differences.push(makeDifference(data, {
        type:"consumption-total", costId:cost.id, costName:cost.kostenart, area:cost.kostenart,
        description:"Summe der erfassten Verbräuche weicht vom hinterlegten Gesamtverbrauch ab.",
        calculatedValue:summary.actual, controlValue:summary.expected, difference:summary.difference, unit:summary.unit || "Einheit",
        monetaryAmount:residual || Math.abs(number(summary.difference) * unitPrice),
        cause:"Zählerstände und daraus abgeleitete Messperioden", source:"zaehlerDaten.messperioden ↔ kostenarten.gesamtverbrauch",
        targetTab:"manuellewerte", targetSelector:'[data-individual-section="consumption"]',
        dataSignature:costSourceSignature(data, cost, "consumption-total", summary, allocation)
      }));
    });

    (calculation.costResults || []).forEach(row => {
      const cost = row.cost || {};
      const intentionallyLandlord = text(cost.ausschlussBehandlung) === "Nicht umlagefähig / Eigentümeranteil";
      const unexplained = intentionallyLandlord ? 0 : number(row.ownerShare) - number(row.documentedOwnerShare);
      if (representedCosts.has(String(cost.id || "")) || Math.abs(unexplained) <= 0.02) return;
      differences.push(makeDifference(data, {
        type:"allocation-residual", costId:cost.id, costName:cost.kostenart, area:cost.kostenart,
        description:"Kosten wurden nicht vollständig einem Abrechnungsfall oder einem dokumentierten Vermieteranteil zugeordnet.",
        calculatedValue:number(cost.gesamtbetrag) - unexplained, controlValue:number(cost.gesamtbetrag), difference:-unexplained, unit:"€", monetaryAmount:Math.abs(unexplained),
        cause:"Umlage und Abrechnungsfall-Zuordnung", source:"calculateUmlage().costResults", targetTab:"mieterverwaltung",
        dataSignature:costSourceSignature(data, cost, "allocation-residual", null, row)
      }));
    });

    const totals = d.calculation.umlageTotals(calculation);
    const prepaymentDifference = number(totals.prepayments) - number(totals.prepaymentMatrixTotal);
    if (Math.abs(prepaymentDifference) > 0.02) {
      differences.push(makeDifference(data, {
        type:"prepayment-total", costId:"", costName:"Vorauszahlungen", area:"Vorauszahlungen",
        description:"Die Summe der verwendeten Vorauszahlungen weicht von der Vorauszahlungsmatrix ab.",
        calculatedValue:totals.prepayments, controlValue:totals.prepaymentMatrixTotal, difference:prepaymentDifference, unit:"€", monetaryAmount:Math.abs(prepaymentDifference),
        cause:"Vorauszahlungen und Korrekturen", source:"mieter / vorauszahlungen", targetTab:"einnahmen",
        dataSignature:hash(stableStringify({ period:periodKey(data), vorauszahlungen:data.vorauszahlungen || [], mieter:(data.mieter || []).map(row => ({ id:row.id, nkVoraus:row.nkVoraus, correction:row.vorjahresKorrektur })) }))
      }));
    }

    if (Math.abs(number(totals.allocationDelta)) > 0.005) {
      differences.push(makeDifference(data, {
        type:"rounding-total", costId:"", costName:"Gesamtabgleich", area:"Gesamtabgleich",
        description:"Rundungs- oder Verteilungsdifferenz im Gesamtabgleich.",
        calculatedValue:totals.allocatedCheck, controlValue:totals.totalCosts, difference:-number(totals.allocationDelta), unit:"€", monetaryAmount:Math.abs(number(totals.allocationDelta)),
        cause:"Gesamtsummen der Umlage", source:"umlageTotals", targetTab:"umlage",
        dataSignature:hash(stableStringify({ period:periodKey(data), totals }))
      }));
    }

    return differences.sort((a,b) => a.area.localeCompare(b.area, "de") || a.id.localeCompare(b.id));
  }

  function pushHistory(container, record, status, note) {
    if (!record) return;
    container.history.push(Object.assign(clone(record), {
      status:status || record.status,
      statusLabel:statusLabel(status || record.status),
      historyAt:requireDeps().now(),
      historyNote:text(note)
    }));
    if (container.history.length > 500) container.history.splice(0, container.history.length - 500);
  }

  function reconcile(data, suppliedDifferences) {
    const container = ensureContainer(data);
    const differences = suppliedDifferences || deriveDifferences(data);
    const current = new Map(differences.map(row => [row.id, row]));
    Object.keys(container.records).forEach(id => {
      const record = container.records[id];
      const difference = current.get(id);
      if (!record || typeof record !== "object") { delete container.records[id]; return; }
      if ((record.status === STATUS.ACCEPTED || record.status === STATUS.LANDLORD) && (!difference || record.dataSignature !== difference.dataSignature || record.calculationSignature !== difference.calculationSignature)) {
        pushHistory(container, record, STATUS.INVALID, "Zugrunde liegende Daten oder Berechnung haben sich geändert.");
        if (!difference) {
          container.records[id] = Object.assign({}, record, {
            status:STATUS.RESOLVED, statusLabel:statusLabel(STATUS.RESOLVED), treatment:"", treatmentLabel:"", reason:"",
            resolvedAt:requireDeps().now(), invalidatedAcceptanceAt:requireDeps().now(), previousAcceptedRecordId:record.recordId || ""
          });
        } else {
          container.records[id] = Object.assign({}, record, {
            status:STATUS.INVALID, statusLabel:statusLabel(STATUS.INVALID), invalidatedAt:requireDeps().now(), invalidationReason:"Daten- oder Differenzstand geändert",
            currentDataSignature:difference.dataSignature, currentCalculationSignature:difference.calculationSignature,
            currentDifference:difference.difference, currentUnit:difference.unit
          });
        }
        return;
      }
      if (record.status === STATUS.IN_CORRECTION) {
        if (!difference) {
          container.records[id] = Object.assign({}, record, { status:STATUS.RESOLVED, statusLabel:statusLabel(STATUS.RESOLVED), resolvedAt:requireDeps().now() });
        } else {
          record.currentDataSignature = difference.dataSignature;
          record.currentCalculationSignature = difference.calculationSignature;
          record.currentDifference = difference.difference;
          record.currentUnit = difference.unit;
        }
        return;
      }
      if (record.status === STATUS.RESOLVED && difference) {
        pushHistory(container, record, STATUS.RESOLVED, "Differenz ist erneut aufgetreten.");
        delete container.records[id];
      }
    });
    container.updatedAt = requireDeps().now();
    container.updatedWithAppVersion = requireDeps().appVersion;
    return container;
  }

  function decisionStatus(data, difference) {
    const container = readContainer(data);
    const record = container.records[difference.id];
    if (!record) return { status:STATUS.OPEN, label:statusLabel(STATUS.OPEN), record:null };
    if (record.status === STATUS.ACCEPTED || record.status === STATUS.LANDLORD) {
      if (record.dataSignature === difference.dataSignature && record.calculationSignature === difference.calculationSignature) return { status:record.status, label:statusLabel(record.status), record };
      return { status:STATUS.INVALID, label:statusLabel(STATUS.INVALID), record };
    }
    if (record.status === STATUS.IN_CORRECTION) return { status:STATUS.IN_CORRECTION, label:statusLabel(STATUS.IN_CORRECTION), record };
    if (record.status === STATUS.INVALID) return { status:STATUS.INVALID, label:statusLabel(STATUS.INVALID), record };
    return { status:STATUS.OPEN, label:statusLabel(STATUS.OPEN), record };
  }

  function currentModel(data = requireDeps().stateAccess.current()) {
    const calculation = requireDeps().calculation.calculateUmlage();
    const differences = deriveDifferences(data, calculation);
    const rows = differences.map(row => Object.freeze(Object.assign({}, row, decisionStatus(data, row))));
    const container = readContainer(data);
    const totals = requireDeps().calculation.umlageTotals(calculation);
    const acceptedOther = rows.filter(row => row.status === STATUS.ACCEPTED).reduce((sum,row) => sum + row.monetaryAmount, 0);
    const acceptedLandlord = rows.filter(row => row.status === STATUS.LANDLORD).reduce((sum,row) => sum + row.monetaryAmount, 0);
    const openAmount = rows.filter(row => [STATUS.OPEN, STATUS.IN_CORRECTION, STATUS.INVALID].includes(row.status)).reduce((sum,row) => sum + row.monetaryAmount, 0);
    const intentionalOwnerShare = (calculation.costResults || []).filter(row => text(row.cost && row.cost.ausschlussBehandlung) === "Nicht umlagefähig / Eigentümeranteil").reduce((sum,row) => sum + Math.max(0, number(row.ownerShare) - number(row.documentedOwnerShare)), 0);
    const landlordBase = number(totals.privateShare) + number(totals.documentedOwnerShare) + intentionalOwnerShare;
    const landlordTotal = landlordBase + acceptedLandlord;
    const control = number(totals.billableShare) + landlordTotal + acceptedOther + openAmount;
    return Object.freeze({
      calculation, totals, differences:Object.freeze(rows), records:container.records, history:Object.freeze(container.history.slice()),
      summary:Object.freeze({
        totalCosts:number(totals.totalCosts), tenantShare:number(totals.billableShare), landlordBase, intentionalOwnerShare, landlordAccepted:acceptedLandlord,
        landlordTotal, acceptedOther, openAmount, control, balance:number(totals.totalCosts) - control,
        openCount:rows.filter(row => [STATUS.OPEN, STATUS.IN_CORRECTION, STATUS.INVALID].includes(row.status)).length,
        acceptedCount:rows.filter(row => [STATUS.ACCEPTED, STATUS.LANDLORD].includes(row.status)).length,
        allChecked:rows.every(row => [STATUS.ACCEPTED, STATUS.LANDLORD].includes(row.status))
      })
    });
  }

  function markCorrection(differenceIdValue) {
    const d = requireDeps();
    const id = text(differenceIdValue);
    let target = "umlage";
    return d.stateAccess.transact(data => {
      const differences = deriveDifferences(data);
      const difference = differences.find(row => row.id === id);
      if (!difference) throw new Error("Die Differenz ist nicht mehr vorhanden.");
      const container = ensureContainer(data);
      if (container.records[id]) pushHistory(container, container.records[id], container.records[id].status, "Korrektur wurde neu begonnen.");
      target = difference.targetTab || "umlage";
      container.records[id] = {
        recordId:"REV-" + hash(id + "|" + d.now()), differenceId:id, type:difference.type, costId:difference.costId, area:difference.area,
        originalDifference:difference.difference, unit:difference.unit, originalMonetaryAmount:difference.monetaryAmount,
        status:STATUS.IN_CORRECTION, statusLabel:statusLabel(STATUS.IN_CORRECTION), startedAt:d.now(), appVersion:d.appVersion,
        dataSignature:difference.dataSignature, calculationSignature:difference.calculationSignature, targetTab:target, targetSelector:difference.targetSelector || ""
      };
      return Object.freeze({ changed:true, targetTab:target, targetSelector:difference.targetSelector || "", differenceId:id });
    }, { reason:"Differenzkorrektur begonnen", tabId:"umlage", requireCommitSuccess:true });
  }

  function accept(differenceIdValue, input = {}) {
    const d = requireDeps();
    const id = text(differenceIdValue);
    const selectedTreatment = treatment(text(input.treatment));
    const reason = text(input.reason);
    const acceptedBy = text(input.acceptedBy);
    if (!selectedTreatment) throw new Error("Bitte eine Behandlung auswählen.");
    if (reason.length < 5) throw new Error("Bitte eine nachvollziehbare Begründung mit mindestens 5 Zeichen eingeben.");
    if (!acceptedBy) throw new Error("Bitte den Bearbeiter angeben.");
    if (input.confirmed !== true) throw new Error("Die fachliche Prüfung muss ausdrücklich bestätigt werden.");
    return d.stateAccess.transact(data => {
      const differences = deriveDifferences(data);
      const difference = differences.find(row => row.id === id);
      if (!difference) throw new Error("Die Differenz ist nicht mehr vorhanden und kann nicht akzeptiert werden.");
      const container = ensureContainer(data);
      if (container.records[id]) pushHistory(container, container.records[id], container.records[id].status, "Neue bewusste Prüfentscheidung.");
      const status = selectedTreatment.group === "landlord" ? STATUS.LANDLORD : STATUS.ACCEPTED;
      const now = d.now();
      container.records[id] = {
        recordId:"REV-" + hash(id + "|" + now + "|" + difference.dataSignature),
        differenceId:id, type:difference.type, costId:difference.costId, area:difference.area, costName:difference.costName,
        originalDifference:difference.difference, unit:difference.unit, originalMonetaryAmount:difference.monetaryAmount,
        treatment:selectedTreatment.value, treatmentLabel:selectedTreatment.label, reason, status, statusLabel:statusLabel(status),
        acceptedBy, acceptedAt:now, confirmed:true, appVersion:d.appVersion,
        dataSignature:difference.dataSignature, calculationSignature:difference.calculationSignature
      };
      if (!data.meta || typeof data.meta !== "object") data.meta = {};
      data.meta.lastReviewUser = acceptedBy;
      return Object.freeze({ changed:true, differenceId:id, status, treatment:selectedTreatment.value });
    }, { reason:"Differenz fachlich akzeptiert", tabId:"umlage", requireCommitSuccess:true });
  }

  function reopen(differenceIdValue) {
    const d = requireDeps();
    const id = text(differenceIdValue);
    return d.stateAccess.transact(data => {
      const container = ensureContainer(data);
      const record = container.records[id];
      if (record) pushHistory(container, record, record.status, "Prüfentscheidung zur erneuten Bearbeitung geöffnet.");
      delete container.records[id];
      return Object.freeze({ changed:!!record, differenceId:id });
    }, { reason:"Differenz erneut geöffnet", tabId:"umlage", requireCommitSuccess:true });
  }

  function describe() {
    return Object.freeze({ configured:!!deps, version:REVIEW_VERSION, statuses:Object.freeze(Object.keys(STATUS_LABELS)), treatmentCount:TREATMENTS.length });
  }

  global.NKProBillingReview = Object.freeze({
    REVIEW_VERSION, STATUS, STATUS_LABELS, TREATMENTS,
    configure, describe, ensureContainer, readContainer, treatment, statusLabel, stableStringify, hash,
    deriveDifferences, reconcile, decisionStatus, currentModel, markCorrection, accept, reopen
  });
})(globalThis);
