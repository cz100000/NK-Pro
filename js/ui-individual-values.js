"use strict";

// AP21C: konsolidierte Arbeitsoberfläche für individuelle, externe und zentrale Verbrauchswerte.
(function (global) {
  let activeFilter = "all";
  let requestedFocus = null;
  const connectedMeterSourcePanels = new WeakSet();

  const ICONS = Object.freeze({
    water:'<path d="M12 2.5s6.5 6.8 6.5 11.2a6.5 6.5 0 1 1-13 0C5.5 9.3 12 2.5 12 2.5Z"/><path d="M9.2 15.2a3 3 0 0 0 2.8 2"/>',
    heat:'<path d="M13.2 2.5c.6 3.1-.7 4.7-2.1 6.2-1.5 1.6-3 3.2-3 6a4.1 4.1 0 0 0 8.2 0c0-1.5-.6-2.8-1.5-4 2.6 1.3 4.2 3.8 4.2 6.5A7 7 0 0 1 5 17.2c0-3.9 2.3-6.2 4.4-8.4 1.8-1.9 3.5-3.6 3.8-6.3Z"/><path d="M12.1 12.2c1.4 1.2 2.2 2.5 2.2 4a2.3 2.3 0 1 1-4.6 0c0-1.4.9-2.7 2.4-4Z"/>',
    electricity:'<path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z"/>',
    building:'<path d="M4 21V7l8-4 8 4v14M8 10h2M14 10h2M8 14h2M14 14h2M9 21v-4h6v4M3 21h18"/>',
    chimney:'<path d="M5 21V9l7-5 7 5v12M14 6V2h4v7M9 21v-6h6v6"/>',
    cleaning:'<path d="m14 3 2 2-7 7-2-2 7-7ZM7 10l-3 8c3 2 7 3 11 2l-6-8M5 15c2 1 4 2 7 2"/>',
    insurance:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m8.5 12 2.2 2.2 4.8-5.4"/>',
    garden:'<path d="M19 4c-6 .2-10 3.5-10 8.5 0 2.8 2 5 5 5 4.8 0 6-6.7 5-13.5Z"/><path d="M5 21c1.5-5 4.5-8 9-10"/>',
    waste:'<path d="M4 7h16M9 3h6l1 4H8l1-4ZM6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
    lift:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h6M9 16h6M12 6v4M10 8l2-2 2 2M12 18v-4M10 16l2 2 2-2"/>',
    satellite:'<path d="M4.5 5.5a10 10 0 0 0 14 14"/><path d="M7 3a14 14 0 0 0 14 14"/><path d="m8.2 15.8-3.7 3.7M4 22h7"/><circle cx="15.5" cy="8.5" r="1.4"/>',
    default:'<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>'
  });

  function iconName(cost) {
    const text = String((cost && cost.kostenart) || "").toLocaleLowerCase("de-DE");
    if (/wasser|entwässer/.test(text)) return "water";
    if (/heiz|wärme|warm/.test(text)) return "heat";
    if (/strom|beleuchtung/.test(text)) return "electricity";
    if (/schornstein/.test(text)) return "chimney";
    if (/reinigung|hauswart|meister/.test(text)) return "cleaning";
    if (/versicher/.test(text)) return "insurance";
    if (/garten|pflanz/.test(text)) return "garden";
    if (/müll|abfall/.test(text)) return "waste";
    if (/aufzug|lift/.test(text)) return "lift";
    if (/antenne|verteilanlage|satellit|kabelanlage/.test(text)) return "satellite";
    if (/grundsteuer|gebäude|haus/.test(text)) return "building";
    return "default";
  }

  function iconHtml(cost) {
    const name = iconName(cost);
    return '<span class="individual-cost-icon individual-cost-icon--' + name + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg></span>';
  }

  function html(value) { return typeof escapeHtml === "function" ? escapeHtml(String(value == null ? "" : value)) : String(value == null ? "" : value); }
  function numeric(value) { return typeof num === "function" ? num(value) : Number(value || 0); }
  function numberText(value, digits = 3) { return Number(value || 0).toLocaleString("de-DE", { maximumFractionDigits:digits }); }
  function activeCosts() { return (state && Array.isArray(state.kostenarten) ? state.kostenarten : []).filter(cost => cost && cost.id && cost.kostenart && cost.inNK === "Ja"); }
  function tenants() { return typeof tenantRowsWithIndex === "function" ? tenantRowsWithIndex() : []; }
  function units() { return typeof allWohnungen === "function" ? allWohnungen() : (state.wohnungen || []).filter(row => row && row.id); }
  function inputFor(cost) { return state.umlageInputs && state.umlageInputs[cost.id] ? state.umlageInputs[cost.id] : null; }
  function modeFor(cost) { return inputFor(cost) && inputFor(cost).mode ? inputFor(cost).mode : (typeof manualInputModeForCost === "function" ? manualInputModeForCost(cost) : ""); }

  function sourceType(cost) {
    const mode = modeFor(cost);
    if (mode === "Zählerstände") return "automatic";
    if (mode === "Externe Einzelabrechnung") return "external";
    if (mode === "Verbrauchsmenge" || mode === "Direkter Eurobetrag" || cost.berechnungsart === "Manuell je Mieter" || String(cost.umlageschluessel || "").includes("Manuelle Eingabe")) return "manual";
    if (cost.umlageschluessel === "Verbrauch") return "automatic";
    return "none";
  }

  function expectedValue(cost, source) {
    if (source === "manual" || source === "external") {
      return modeFor(cost) === "Verbrauchsmenge" ? numeric(cost.gesamtverbrauch) : numeric(cost.gesamtbetrag);
    }
    return numeric(cost.gesamtverbrauch);
  }

  function unitFor(cost, source) {
    if (source === "automatic") return typeof costUnitLabel === "function" ? (costUnitLabel(cost) || "Einheit") : "Einheit";
    if (modeFor(cost) === "Verbrauchsmenge") return typeof costUnitLabel === "function" ? (costUnitLabel(cost) || "Einheit") : "Einheit";
    if (source === "manual" || source === "external") return "Euro";
    return "–";
  }

  function assessment(cost) {
    const source = sourceType(cost);
    const input = inputFor(cost);
    const rows = tenants();
    const values = input && Array.isArray(input.values) ? input.values : [];
    const relevant = rows.map(row => numeric(values[row.originalIndex]));
    const entered = relevant.filter(value => Math.abs(value) > 0.000001).length;
    const total = relevant.reduce((sum,value) => sum + value, 0);
    const expected = expectedValue(cost, source);
    const difference = expected - total;
    if (source === "none") return { key:"none", label:"Keine Eingabe erforderlich", source, total, expected, difference, entered, count:rows.length, progress:"Automatische Verteilung" };
    if (source === "automatic") {
      const complete = rows.length > 0 && entered === rows.length;
      return { key:complete ? "complete" : "open", label:complete ? "Vollständig" : "Offen", source, total, expected, difference, entered, count:rows.length, progress:entered + " von " + rows.length + " Wohnungen" };
    }
    if (expected > 0 && Math.abs(difference) > 0.01 && entered > 0) return { key:"error", label:"Fehlerhaft", source, total, expected, difference, entered, count:rows.length, progress:numberText(total) + " von " + numberText(expected) };
    const complete = entered > 0 && (expected <= 0 || Math.abs(difference) <= 0.01);
    return { key:complete ? "complete" : "open", label:complete ? "Vollständig" : "Offen", source, total, expected, difference, entered, count:rows.length, progress:entered + " von " + rows.length + " Werten" };
  }

  function statusHtml(a) {
    const icons={complete:"✓",open:"○",error:"!",none:"–"};
    return '<span class="individual-cost-status individual-cost-status--' + a.key + '"><span aria-hidden="true">' + icons[a.key] + '</span>' + html(a.label) + '</span>';
  }

  function sourceLabel(cost, source) {
    if (source === "automatic") return "Zentrale Zählerdaten";
    if (source === "external") return "Externe Einzelabrechnung";
    if (source === "manual") return modeFor(cost) || "Manuelle individuelle Werte";
    return "Kein individueller Wert";
  }

  function unitRows(cost, editable) {
    const input = inputFor(cost) || { values:[] };
    const rowTenants = tenants();
    const byUnit = new Map();
    rowTenants.forEach(tenant => {
      const key=String(tenant.wohnung || "");
      if (!byUnit.has(key)) byUnit.set(key, []);
      byUnit.get(key).push(tenant);
    });
    const rows=[];
    units().filter(unit => unit.status === "aktiv" || byUnit.has(String(unit.id))).forEach(unit => {
      const assigned=byUnit.get(String(unit.id)) || [];
      if (!assigned.length) {
        rows.push('<tr><td><strong>' + html(unit.id) + '</strong><small>' + html(unit.bezeichnung || unit.lage || "") + '</small></td><td><span class="individual-row-role">Leerstand</span></td><td class="readonly-cell">–</td><td>' + html(unitFor(cost, sourceType(cost))) + '</td><td><span class="individual-row-status individual-row-status--none">Keine Zuordnung</span></td></tr>');
        return;
      }
      assigned.forEach(tenant => {
        const value=numeric(input.values[tenant.originalIndex]);
        const entered=Math.abs(value)>0.000001;
        const field=editable
          ? '<input class="individual-value-input" inputmode="decimal" value="' + html(String(value).replace(".",",")) + '" aria-label="Wert für ' + html(tenant.name || tenant.id) + '" data-ui-change="billing.setManualExternalValue" data-ui-args=\'["' + html(cost.id) + '",'+tenant.originalIndex+',"$value"]\'>'
          : '<span class="individual-readonly-value">' + numberText(value) + '</span>';
        rows.push('<tr><td><strong>' + html(unit.id) + '</strong><small>' + html(unit.bezeichnung || unit.lage || "") + '</small></td><td><strong>' + html(tenant.name || tenant.id) + '</strong><small>' + html(tenant.id) + '</small></td><td class="' + (editable ? "editable" : "readonly-cell") + '">' + field + '</td><td>' + html(unitFor(cost, sourceType(cost))) + '</td><td><span class="individual-row-status individual-row-status--' + (entered ? "complete" : "open") + '">' + (entered ? "Vollständig" : "Offen") + '</span></td></tr>');
      });
    });
    return rows.join("");
  }

  function valuesTable(cost, editable) {
    return '<div class="table-wrap individual-values-table-wrap"><table class="individual-values-table"><thead><tr><th>Wohnung</th><th>Mietverhältnis oder Leerstand</th><th>Eingabewert</th><th>Einheit</th><th>Status</th></tr></thead><tbody>' + (unitRows(cost, editable) || '<tr><td colspan="5">Keine Wohnungen vorhanden.</td></tr>') + '</tbody></table></div>';
  }

  function automaticBody(cost, a) {
    const meterRows = cost.id === "K002" && state.waterMeters && Array.isArray(state.waterMeters.readings) ? state.waterMeters.readings : [];
    const meterCount = meterRows.filter(row => row && (row.kwEndDate || row.wwEndDate || Math.abs(numeric(row.kwEnd) - numeric(row.kwStart)) > 0 || Math.abs(numeric(row.wwEnd) - numeric(row.wwStart)) > 0)).length;
    return '<div class="individual-cost-body__intro"><div><span>Verwendete Zähler</span><strong>' + (meterCount || a.count) + '</strong></div><div><span>Messperiode</span><strong>' + html(typeof periodLabelShort === "function" ? periodLabelShort() : "Aktuelle Abrechnung") + '</strong></div><div><span>Gesamtsumme</span><strong>' + numberText(a.total) + ' ' + html(unitFor(cost,"automatic")) + '</strong></div></div>' +
      valuesTable(cost,false) +
      '<div class="individual-cost-check ' + (a.key === "complete" ? "is-complete" : "is-open") + '"><strong>' + (a.key === "complete" ? "Zählerwerte vollständig" : "Zählerwerte noch nicht vollständig") + '</strong><span>' + (a.key === "complete" ? "Die Werte wurden aus der zentralen Zählerquelle übernommen." : "Fehlende oder unplausible Werte müssen in der zentralen Zählerverwaltung korrigiert werden.") + '</span></div>' +
      '<div class="individual-cost-actions"><button type="button" class="ui-button ui-button--secondary" data-individual-open-meter-source="' + html(cost.id) + '">Zählerdaten prüfen</button></div>';
  }

  function manualBody(cost, a, external) {
    const input=inputFor(cost) || {};
    const readonly = !!(global.NKProBillingContext && global.NKProBillingContext.isReadOnly());
    const modes=["Direkter Eurobetrag","Verbrauchsmenge","Externe Einzelabrechnung"];
    const currentMode=modeFor(cost) || "Direkter Eurobetrag";
    const sourceControl='<div class="individual-source-control"><label><span>Quelle / Eingabeart</span><select data-ui-change="billing.setManualInputMode" data-ui-args="[&quot;' + html(cost.id) + '&quot;,&quot;$value&quot;]" ' + (readonly ? 'disabled' : '') + '>' + modes.map(mode => '<option value="' + html(mode) + '" ' + (mode === currentMode ? 'selected' : '') + '>' + html(mode) + '</option>').join("") + '</select></label><small>Die Auswahl ändert nur die Eingabequelle; vorhandene Werte bleiben bis zu einer bestätigten Rücksetzung erhalten.</small></div>';
    const controls=external ? '<section class="individual-import-panel"><div class="individual-import-panel__header"><div><h4>Externe Abrechnungswerte übernehmen</h4><p>Datei mit Wohnung/Mietverhältnis und Wert importieren oder Werte direkt einfügen.</p></div>' + (input.importSource ? '<span class="individual-import-meta">' + html(input.importSource) + '<small>' + html(formatImportDate(input.importedAt)) + '</small></span>' : '') + '</div><div class="individual-import-controls"><label class="ui-button ui-button--secondary individual-file-label">Datei importieren<input type="file" accept=".csv,.txt,.tsv" data-individual-file="' + html(cost.id) + '" ' + (readonly ? 'disabled' : '') + '></label><textarea rows="3" aria-label="Externe Werte für ' + html(cost.kostenart) + ' einfügen" data-individual-paste="' + html(cost.id) + '" placeholder="Wohnungs-ID; Wert&#10;W001.EG-L; 125,50" ' + (readonly ? 'readonly' : '') + '></textarea><button type="button" class="ui-button ui-button--secondary" data-individual-import-paste="' + html(cost.id) + '" ' + (readonly ? 'disabled' : '') + '>Werte einfügen</button></div>' + importErrorsHtml(input) + '</section>' : '';
    const sourceSelector=sourceControl;
    const mismatch = a.expected > 0 ? '<div class="individual-cost-check ' + (a.key === "error" ? "is-error" : (a.key === "complete" ? "is-complete" : "is-open")) + '"><strong>Summenabgleich</strong><span>Einzelwerte: ' + numberText(a.total) + ' · Referenz: ' + numberText(a.expected) + ' · Differenz: ' + numberText(a.difference) + '</span></div>' : '<div class="individual-cost-check is-open"><strong>Referenzwert fehlt</strong><span>Erfassen Sie zunächst den Gesamtbetrag in „Gesamtkosten“ oder tragen Sie die individuellen Werte vollständig ein.</span></div>';
    return sourceSelector + controls + valuesTable(cost,!readonly) + mismatch + '<div class="individual-cost-actions"><button type="button" class="ui-button ui-button--danger" data-individual-reset="' + html(cost.id) + '" ' + (readonly ? 'disabled' : '') + '>Werte zurücksetzen</button></div>';
  }

  function noInputBody(cost) {
    return '<div class="individual-no-input"><span class="individual-no-input__icon" aria-hidden="true">✓</span><div><strong>Keine individuelle Eingabe erforderlich</strong><p>Diese Kostenart wird mit dem festgelegten Verteilungsschlüssel automatisch aufgeteilt.</p><dl><div><dt>Verteilungsschlüssel</dt><dd>' + html(cost.umlageschluessel || "Nicht festgelegt") + '</dd></div><div><dt>Quelle</dt><dd>Gesamtkosten und Abrechnungsstammdaten</dd></div></dl></div></div>';
  }

  function importErrorsHtml(input) {
    const errors=Array.isArray(input.importErrors) ? input.importErrors : [];
    if (!errors.length) return "";
    return '<div class="individual-import-errors" role="alert"><strong>' + errors.length + ' Wert(e) konnten nicht zugeordnet werden</strong><ul>' + errors.slice(0,10).map(error => '<li>' + html(error) + '</li>').join("") + '</ul></div>';
  }

  function formatImportDate(value) {
    if (!value) return "";
    const date=new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("de-DE");
  }

  function cardHtml(cost, a) {
    const body = a.source === "automatic" ? automaticBody(cost,a) : (a.source === "external" ? manualBody(cost,a,true) : (a.source === "manual" ? manualBody(cost,a,false) : noInputBody(cost)));
    const open = requestedFocus && ((requestedFocus.costId && requestedFocus.costId === cost.id) || (requestedFocus.source && requestedFocus.source === a.source));
    return '<details class="individual-cost-card individual-cost-card--' + a.key + '" data-individual-cost="' + html(cost.id) + '" data-individual-status="' + a.key + '" data-individual-source="' + a.source + '" ' + (open ? 'open' : '') + '><summary class="individual-cost-card__summary">' + iconHtml(cost) + '<span class="individual-cost-card__identity"><strong>' + html(cost.kostenart) + '</strong><small>' + html(cost.id) + ' · ' + html(sourceLabel(cost,a.source)) + ' · ' + html(cost.umlageschluessel || "Verteilung noch festlegen") + '</small></span><span class="individual-cost-card__progress"><small>Fortschritt</small><strong>' + html(a.progress) + '</strong></span>' + statusHtml(a) + '<span class="individual-cost-card__chevron" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m9 10 3 3 3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></summary><div class="individual-cost-card__body">' + body + '</div></details>';
  }

  function filterMatches(a) { return activeFilter === "all" || a.key === activeFilter; }

  function render() {
    const root=document.getElementById("individualValuesList");
    if (!root || !state) return;
    if (typeof syncUmlageInputs === "function") syncUmlageInputs();
    if (typeof applyWaterMetersToUmlage === "function") applyWaterMetersToUmlage();
    const costs=activeCosts();
    const rows=costs.map(cost => ({cost,assessment:assessment(cost)}));
    const counts={active:rows.length,complete:0,open:0,error:0,none:0};
    rows.forEach(row => { counts[row.assessment.key]=(counts[row.assessment.key]||0)+1; });
    Object.keys(counts).forEach(key => {
      const target=document.querySelector('[data-individual-summary="' + key + '"]');
      if (target) target.textContent=String(counts[key]);
    });
    const visible=rows.filter(row => filterMatches(row.assessment));
    root.innerHTML=visible.map(row => cardHtml(row.cost,row.assessment)).join("");
    const resultCount=document.querySelector("[data-individual-result-count]");
    if (resultCount) {
      const label=visible.length === 1 ? "1 Kostenart" : visible.length + " Kostenarten";
      resultCount.textContent=activeFilter === "all" ? label : label + " im Filter";
    }
    const empty=document.getElementById("individualValuesEmpty");
    if (empty) empty.hidden=visible.length > 0;
    connectMeterSourcePanel();
    const meterPanel=document.getElementById("individualValuesMeterSource");
    if (meterPanel && meterPanel.open) renderMeterSource();
    if (requestedFocus) {
      requestAnimationFrame(() => {
        const target=root.querySelector('details[open]');
        if (target) target.scrollIntoView({block:"start",behavior:"smooth"});
      });
      requestedFocus=null;
    }
  }

  function setFilter(filter) {
    const allowed=["all","open","error","complete","none"];
    activeFilter=allowed.includes(filter) ? filter : "all";
    document.querySelectorAll('[data-individual-filter]').forEach(button => {
      const active=button.dataset.individualFilter === activeFilter;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",active ? "true" : "false");
    });
    render();
  }

  function parseRows(text) {
    const result=[];
    String(text || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean).forEach((line,index) => {
      let parts=line.includes("\t") ? line.split("\t") : (line.includes(";") ? line.split(";") : line.split(/,(?=\s*-?\d+(?:[.,]\d+)?\s*$)/));
      parts=parts.map(part => part.trim().replace(/^"|"$/g,""));
      if (parts.length < 2) { result.push({line:index+1,key:line,value:null,error:"Keine Trennung zwischen Zuordnung und Wert erkannt"}); return; }
      const key=parts.slice(0,-1).join(" ").trim();
      const valueText=parts[parts.length-1].replace(/\s/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",",".");
      const value=Number(valueText);
      if (!key || !Number.isFinite(value)) result.push({line:index+1,key,value:null,error:"Ungültige Zuordnung oder Zahl"});
      else result.push({line:index+1,key,value});
    });
    return result;
  }

  function importText(costId, text, source) {
    if (global.NKProBillingContext && global.NKProBillingContext.isReadOnly()) return;
    const parsed=parseRows(text);
    const rowTenants=tenants();
    const values=(inputFor({id:costId}) && Array.isArray(inputFor({id:costId}).values) ? inputFor({id:costId}).values.slice() : Array(Math.max(20,Array.isArray(state.mieter) ? state.mieter.length : 0)).fill(0));
    const errors=[];
    parsed.forEach(row => {
      if (row.error) { errors.push("Zeile " + row.line + ": " + row.error); return; }
      const key=String(row.key).trim().toLocaleLowerCase("de-DE");
      const matches=rowTenants.filter(tenant => [tenant.id,tenant.wohnung,tenant.name].some(value => String(value || "").trim().toLocaleLowerCase("de-DE") === key));
      if (matches.length !== 1) { errors.push("Zeile " + row.line + ": „" + row.key + "“ ist " + (matches.length ? "nicht eindeutig" : "nicht zuordenbar")); return; }
      values[matches[0].originalIndex]=row.value;
    });
    const result=global.NKProBillingWorkflow.setIndividualValuesImport(costId,values,{source:source || "Eingefügte Werte",importedAt:new Date().toISOString(),format:"Wohnung/Mietverhältnis und Wert",errors,mode:"Externe Einzelabrechnung"});
    if (result && result.changed) render();
  }

  function resetCost(costId) {
    if (global.NKProBillingContext && global.NKProBillingContext.isReadOnly()) return;
    let result=global.NKProBillingWorkflow.resetIndividualValues(costId);
    if (result && result.requiresConfirmation && global.confirm(result.confirmationMessage)) result=global.NKProBillingWorkflow.resetIndividualValues(costId,{confirmed:true});
    if (result && result.message) global.alert(result.message);
    if (result && result.changed) render();
  }

  function requestFocus(options = {}) { requestedFocus={costId:String(options.costId || ""),source:String(options.source || "")}; }

  function renderMeterSource() {
    if (typeof global.renderWaterMeters === "function") global.renderWaterMeters();
  }

  function connectMeterSourcePanel() {
    const panel=document.getElementById("individualValuesMeterSource");
    if (!panel || connectedMeterSourcePanels.has(panel)) return;
    connectedMeterSourcePanels.add(panel);
    panel.addEventListener("toggle", () => {
      if (panel.open) renderMeterSource();
    });
  }

  connectMeterSourcePanel();

  document.addEventListener("toggle", event => {
    const panel=event.target;
    if (panel && panel.id === "individualValuesMeterSource" && panel.open) renderMeterSource();
  }, true);

  document.addEventListener("click", event => {
    const meterSourceSummary=event.target.closest("#individualValuesMeterSource > summary");
    if (meterSourceSummary) {
      requestAnimationFrame(() => {
        const panel=document.getElementById("individualValuesMeterSource");
        if (panel && panel.open) renderMeterSource();
      });
    }
    const filter=event.target.closest("[data-individual-filter]");
    if (filter) { setFilter(filter.dataset.individualFilter); return; }
    const meterSource=event.target.closest("[data-individual-open-meter-source]");
    if (meterSource) {
      const panel=document.getElementById("individualValuesMeterSource");
      renderMeterSource();
      if (panel) {
        panel.open=true;
        requestAnimationFrame(() => panel.scrollIntoView({block:"start",behavior:"smooth"}));
      }
      return;
    }
    const paste=event.target.closest("[data-individual-import-paste]");
    if (paste) {
      const costId=paste.dataset.individualImportPaste;
      const textarea=document.querySelector('[data-individual-paste="' + CSS.escape(costId) + '"]');
      importText(costId,textarea ? textarea.value : "","Eingefügte Werte");
      return;
    }
    const reset=event.target.closest("[data-individual-reset]");
    if (reset) resetCost(reset.dataset.individualReset);
  });

  document.addEventListener("change", event => {
    const fileInput=event.target.closest("[data-individual-file]");
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    const file=fileInput.files[0];
    const reader=new FileReader();
    reader.onload=() => importText(fileInput.dataset.individualFile,String(reader.result || ""),file.name);
    reader.onerror=() => global.alert("Die Datei konnte nicht gelesen werden.");
    reader.readAsText(file,"utf-8");
  });

  global.NKProIndividualValues=Object.freeze({ render, setFilter, requestFocus, assessment, sourceType, describe:() => Object.freeze({filter:activeFilter,activeCosts:activeCosts().length}) });
})(globalThis);

function renderIndividualValues() { return globalThis.NKProIndividualValues.render(); }
