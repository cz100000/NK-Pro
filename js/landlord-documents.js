(function(global) {
  "use strict";
  // V99.4.79: Vermieterunterlagen are derived exclusively from the live billing calculation.
  // They do not persist derived values and do not change the tenant-letter workflow.
  const euro = v => new Intl.NumberFormat("de-DE", {style:"currency",currency:"EUR"}).format(Number(v) || 0);
  const numeric = v => Number(String(v == null ? 0 : v).replace(",", ".")) || 0;
  const round = v => Math.round((numeric(v) + Number.EPSILON) * 100) / 100;
  const safe = v => String(v == null ? "" : v).replace(/[&<>"']/g, x => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const units = v => new Intl.NumberFormat("de-DE",{maximumFractionDigits:2}).format(numeric(v));
  const order = id => ({ "W001.EG-L":1,"W002.EG-R":2,"W003.1OG-L":3,"W004.1OG-R":4,"W000.UG":5,"W005.DG-L":6,"W006.DG-R":7 })[id] || 20;
  const costLabel = cost => cost.id === "K006" ? "Heizung &amp; Warmwasser" : cost.id === "K002" ? "Wasser" : cost.id === "K009" ? "Müll" : safe(cost.kostenart || cost.id);
  const CSS = [
    "@page{size:A4;margin:0}",
    "*{box-sizing:border-box}",
    "html,body{margin:0;padding:0;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#1a2e43;-webkit-print-color-adjust:exact;print-color-adjust:exact}",
    ".nk-internal-sheet{width:210mm;height:297mm;overflow:hidden;position:relative;break-after:page;page-break-after:always;padding:13mm 15mm 13mm;background:#fff}",
    ".nk-internal-sheet:last-child{break-after:auto;page-break-after:auto}",
    ".ni-top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1.2px solid #20344a;padding-bottom:3mm}",
    ".ni-brand{font-weight:800;font-size:10pt;letter-spacing:.8px}.ni-secret{font-size:7pt;color:#64758a;text-transform:uppercase;letter-spacing:.6px}",
    "h1{font-size:19pt;letter-spacing:-.3px;margin:7mm 0 2mm;line-height:1.14}h2{font-size:10.5pt;margin:0}",
    ".ni-sub{font-size:9pt;color:#5d7083;margin:0 0 5mm}",
    ".ni-band{display:grid;grid-template-columns:1.2fr 1fr .8fr;gap:3mm;padding:3mm 4mm;background:#f0f3f6;border-radius:3px;margin-bottom:6mm}",
    ".ni-band span,.ni-kpi span,.ni-stat span{display:block;font-size:6.6pt;text-transform:uppercase;color:#627487;font-weight:700;letter-spacing:.3px;margin-bottom:1mm}",
    ".ni-band strong{font-size:8.3pt}",
    ".ni-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2mm;margin-bottom:7mm}",
    ".ni-kpi{border:1px solid #c7d1da;padding:3mm;border-radius:3px;min-height:19mm}",
    ".ni-kpi strong{font-size:12.5pt;white-space:nowrap;letter-spacing:-.25px}",
    ".ni-kpi small{display:block;margin-top:1mm;color:#657789;font-size:6.7pt}",
    ".ni-section{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #ccd5de;padding-bottom:2mm;margin:5mm 0 2.5mm}",
    ".ni-section small{font-size:7pt;color:#67778a}",
    "table{border-collapse:collapse;width:100%;table-layout:fixed}",
    "th{background:#e8edf1;color:#1b2d40;text-align:left;font-size:7pt;padding:2.3mm 2mm;border-bottom:1px solid #a9b7c5}",
    "td{padding:2.1mm 2mm;font-size:7.7pt;border-bottom:1px solid #e0e5ea;vertical-align:middle}",
    ".ni-amt{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".ni-name strong{display:block;font-size:8.4pt}.ni-name small{display:block;color:#728090;font-size:6.6pt;margin-top:.65mm}",
    ".ni-main td{border-bottom:0;padding-bottom:0}.ni-detail td{padding-top:.7mm;padding-bottom:2.7mm;border-bottom:1px solid #e0e5ea}",
    ".ni-detail small{color:#5e7184;font-size:7pt;line-height:1.25;display:block}",
    ".ni-detail b{color:#2f4a63}",
    ".ni-subtotal td{background:#f0f3f6;font-weight:700;border-top:1px solid #c7d1da;border-bottom:1px solid #c7d1da}",
    ".ni-accent{font-weight:800;color:#1d344c}",
    ".ni-positive{color:#19583b;font-weight:700}.ni-muted{color:#687b8d}",
    ".ni-extras{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2mm;margin:3mm 0}",
    ".ni-stat{border:1px solid #d2d9e0;padding:2mm;border-radius:2px}",
    ".ni-stat strong{font-size:9.4pt;white-space:nowrap}",
    ".ni-line{font-size:7.8pt;margin:2mm 0;color:#495e70;line-height:1.4}",
    ".ni-foot{position:absolute;bottom:10mm;left:15mm;right:15mm;border-top:1px solid #d4dce2;padding-top:2mm;font-size:6.6pt;color:#6e7e8e;display:flex;justify-content:space-between}",
    ".ni-unit-table th,.ni-unit-table td{font-size:9pt;padding:3.4mm 3mm}",
    ".ni-unit-table th{font-size:7.7pt}.ni-result{padding:5mm;background:#f0f3f6;border:1px solid #becbd5;display:flex;justify-content:space-between;align-items:center;margin-top:5mm}",
    ".ni-result span{font-size:10pt}.ni-result strong{font-size:17pt}",
    ".ni-unit-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin:4mm 0}",
    ".ni-unit-meta div{background:#f3f5f7;padding:3mm}.ni-unit-meta small{display:block;font-size:7pt;color:#647588}.ni-unit-meta b{font-size:9pt}",
    ".ni-note{font-size:7.5pt;color:#596a7d;line-height:1.4;margin-top:4mm}",
    ".ni-empty-line{border-bottom:1px solid #ccd4dc;height:10mm;margin:1mm 0}",
    ".ni-guide{background:#eef4f8;border:1px solid #d2dce5;padding:10px 12px;margin:12px auto;max-width:210mm;font:13px Arial;color:#234259}",
    ".ni-guide button{margin-left:10px;background:#fff;border:1px solid #a8b9cb;border-radius:4px;padding:6px 10px;cursor:pointer}",
    "@media print{.ni-guide{display:none!important} .nk-internal-sheet{margin:0!important}}"
  ].join("\n");

  function selectedYear(data) { return String(data.meta && data.meta.abrechnungsjahr || "—"); }
  function period(data) { return data.meta && data.meta.abrechnungsbeginn ? data.meta.abrechnungsbeginn.split("-").reverse().join(".") + " – " + String(data.meta.abrechnungsende||"").split("-").reverse().join(".") : selectedYear(data); }
  function vacantAmount(data, costId, unitId, year) {
    const cv = data.umlageInputs && data.umlageInputs[costId] && data.umlageInputs[costId].caseValues;
    if (!cv) return 0;
    const expected = "vacancy:" + unitId + ":" + year + "-01-01:" + year + "-12-31";
    const key = Object.prototype.hasOwnProperty.call(cv,expected) ? expected : Object.keys(cv).find(k => k.startsWith("vacancy:"+unitId+":") && k.includes(":"+year+"-"));
    if (!key) return 0;
    const entry=cv[key];
    return numeric(entry && typeof entry==="object" ? (entry.amount !== undefined ? entry.amount : entry.value) : entry);
  }
  function makeModel(data, calc) {
    if (!data || !calc || !Array.isArray(data.wohnungen)) throw new Error("Abrechnungsdaten fehlen.");
    const year=selectedYear(data);
    const active=calc.costResults.filter(x=>x.cost && x.cost.inNK==="Ja");
    const byUnit=new Map();
    (calc.tenantResults||[]).forEach(result=>{ if (result.tenant && result.tenant.wohnung) byUnit.set(result.tenant.wohnung,result); });
    const records=data.wohnungen.slice().sort((a,b)=>order(a.id)-order(b.id)).map(unit=>{
      const rr=byUnit.get(unit.id), t=rr&&rr.tenant;
      const costs=active.map(x=>({
        id:x.cost.id,label:costLabel(x.cost),amount:round(t ? numeric(x.allocations[t.originalIndex]) : vacantAmount(data,x.cost.id,unit.id,year)),
        waterUnits: t && x.cost.id==="K002" && data.umlageInputs && data.umlageInputs.K002 && Array.isArray(data.umlageInputs.K002.values)
          ? numeric(data.umlageInputs.K002.values[t.originalIndex]) : 0,
        advance: t && typeof global.vorauszahlungByCostAndTenant === "function"
          ? numeric(global.vorauszahlungByCostAndTenant(x.cost.id,t.originalIndex)) : 0
      }));
      const total=round(costs.reduce((s,c)=>s+c.amount,0));
      const advanced=t ? round(rr.prepayments) : 0;
      const correction=t ? round(rr.correction) : 0;
      return {id:unit.id,unit:unit.bezeichnung||unit.lage||unit.id,name:t ? (t.name||t.id) : "Leerstand",
        role:t ? ((t.id==="M000" || String(t.abrechnungRolle).includes("Privat") || String(t.abrechnungRolle).includes("Eigentümer")) ? "Privatanteil" : "Mieter") : "Leerstand",
        area:numeric(unit.wohnflaeche),total,advanced,correction,balance:round(total-advanced-correction),costs,meterText: costs.find(c=>c.id==="K002")?.waterUnits || 0};
    });
    const regular=records.filter(x=>x.role==="Mieter"),privateRecords=records.filter(x=>x.role==="Privatanteil"),vacant=records.filter(x=>x.role==="Leerstand");
    const sum=(rows,k)=>round(rows.reduce((s,x)=>s+numeric(x[k]),0));
    const allCosts=round(active.reduce((s,x)=>s+numeric(x.cost.gesamtbetrag),0));
    const regularCosts=sum(regular,"total"),privateCosts=sum(privateRecords,"total"),vacantCosts=sum(vacant,"total");
    const rest=round(allCosts-regularCosts-privateCosts-vacantCosts);
    const water=active.find(x=>x.cost.id==="K002");
    const techem=active.find(x=>x.cost.id==="K006");
    const waterResidual=water ? round(water.ownerShare||0) : 0;
    const techemResidual=techem ? round(numeric(techem.externalOwnerShare)||numeric(techem.cost && data.umlageInputs && data.umlageInputs.K006 && data.umlageInputs.K006.externalBilling && data.umlageInputs.K006.externalBilling.includedOwnerShare)) : 0;
    return {year,period:period(data),records,regular,privateRecords,vacant,allCosts,regularCosts,privateCosts,vacantCosts,
      rest,waterResidual,techemResidual,totalAdvances:sum(regular,"advanced"),corrections:sum(regular,"correction"),
      totalBalance:round(regular.reduce((s,r)=>s+r.balance,0)),
      property:(data.objekt && (data.objekt.adresse||data.objekt.strasse)) || "Am Rauhen Biehl 5, 55774 Baumholder",
      costKinds:active.map(x=>({id:x.cost.id,name:x.cost.kostenart||x.cost.id,total:numeric(x.cost.gesamtbetrag)}))};
  }

  const foot=(model,index,total)=>'<div class="ni-foot"><span>NK-PRO · Vermieterunterlagen · nicht an Mieter versenden</span><span>Abrechnung '+safe(model.year)+' · Blatt '+index+' / '+total+'</span></div>';
  const sect=(title,numbr,right)=>'<div class="ni-section"><h2>'+numbr+' &nbsp; '+safe(title)+'</h2><small>'+safe(right||"")+'</small></div>';
  const head=(title,model)=>'<div class="ni-top"><span class="ni-brand">NK / PRO</span><span class="ni-secret">Vermieterakte · interne Ausfertigung</span></div>'+
    '<h1>'+safe(title)+'</h1><p class="ni-sub">Nebenkostenabrechnung '+safe(model.year)+' &nbsp; · &nbsp; '+safe(model.property)+'</p>';
  function resultText(r) {
    if(r.role==="Leerstand")return "Eigentümerkosten";
    if(r.role==="Privatanteil")return "Rechnerischer Privatanteil";
    return r.balance>=0 ? "Nachzahlung" : "Guthaben";
  }
  function resultDisplay(r) {
    if(r.role!=="Mieter")return euro(r.total);
    return r.balance<0 ? "−"+euro(Math.abs(r.balance)) : "+"+euro(r.balance);
  }
  const smallCost=r=>r.costs.map(c=>c.label+" <b>"+euro(c.amount)+"</b>"+(c.id==="K002"?" ("+units(c.waterUnits)+" m³)":"")).join(" &nbsp; · &nbsp; ");
  function overviewPage(model) {
    const count=8;
    const regular=model.regular;
    const kpi=(label,value,sub)=>'<div class="ni-kpi"><span>'+label+'</span><strong>'+euro(value)+'</strong><small>'+safe(sub)+'</small></div>';
    const rows=model.records.map(r=>
      '<tr class="ni-main"><td class="ni-name"><strong>'+safe(r.unit)+'</strong><small>'+safe(r.id)+'</small></td>'+
      '<td class="ni-name"><strong>'+safe(r.name)+'</strong><small>'+safe(r.role)+'</small></td>'+
      '<td class="ni-amt">'+euro(r.total)+'</td><td class="ni-amt">'+(r.role==="Mieter"?euro(r.advanced):"–")+'</td>'+
      '<td class="ni-amt">'+(r.role==="Mieter"?euro(r.correction):"–")+'</td>'+
      '<td class="ni-amt '+(r.role==="Mieter"&&r.balance<0?"ni-positive":"")+'">'+(r.role==="Mieter"?resultDisplay(r):"–")+'</td></tr>'+
      '<tr class="ni-detail"><td colspan="6"><small>'+smallCost(r)+'</small></td></tr>'
    ).join("");
    const costs=model.costKinds.map(x=>safe(x.name)+" "+euro(x.total)).join(" &nbsp; · &nbsp; ");
    const extras=[
      ["Mieter",model.regularCosts],["Privatanteil",model.privateCosts],["Leerstand",model.vacantCosts],
      ["Wasserschwund / Rest",model.waterResidual],["Techem-Eigentümerrest",model.techemResidual]
    ].map(x=>'<div class="ni-stat"><span>'+safe(x[0])+'</span><strong>'+euro(x[1])+'</strong></div>').join("");
    const net=model.totalBalance<0 ? "Guthaben saldiert" : "Mieter-Nachzahlungen saldiert";
    return '<article class="nk-internal-sheet">'+head("Objekt-Gesamtübersicht",model)+
      '<div class="ni-band"><div><span>Abrechnungszeitraum</span><strong>'+safe(model.period)+'</strong></div>'+
      '<div><span>Umfang</span><strong>'+model.records.length+' Wohnungen / '+regular.length+' Mietverhältnisse</strong></div>'+
      '<div><span>Status</span><strong>Arbeitsstand</strong></div></div>'+
      '<div class="ni-kpis">'+kpi("Gesamtkosten",model.allCosts,"laut Kostenarten")+
      kpi("Mieterkosten",model.regularCosts,regular.length+" reguläre Fälle")+
      kpi("VZ + Gutschriften",model.totalAdvances+model.corrections,euro(model.totalAdvances)+" + "+euro(model.corrections))+
      kpi("Saldo der Mieter",model.totalBalance,net)+'</div>'+
      sect("Abrechnung je Wohnung","01","Kostenarten je Wohnung in der zweiten Zeile")+
      '<table><colgroup><col style="width:14%"><col style="width:22%"><col style="width:17%"><col style="width:16%"><col style="width:14%"><col style="width:17%"></colgroup>'+
      '<thead><tr><th>Wohnung</th><th>Nutzer / Fall</th><th class="ni-amt">Kosten</th><th class="ni-amt">Vorauszahl.</th><th class="ni-amt">NK-Korr.</th><th class="ni-amt">Ergebnis</th></tr></thead><tbody>'+rows+
      '<tr class="ni-subtotal"><td colspan="2">Summe Mietverhältnisse ('+regular.length+')</td>'+
      '<td class="ni-amt">'+euro(model.regularCosts)+'</td><td class="ni-amt">'+euro(model.totalAdvances)+'</td>'+
      '<td class="ni-amt">'+euro(model.corrections)+'</td><td class="ni-amt">'+(model.totalBalance>=0?"+":"−")+euro(Math.abs(model.totalBalance))+'</td></tr></tbody></table>'+
      sect("Gesamtkosten und Zuordnung","02","Beträge in EUR")+
      '<p class="ni-line"><b>Belegte Kostenarten:</b> '+costs+'</p>'+
      '<div class="ni-extras">'+extras+'</div>'+
      '<p class="ni-line"><b>Abgleich:</b> Mieter '+euro(model.regularCosts)+' + Privat '+euro(model.privateCosts)+' + Leerstand '+euro(model.vacantCosts)+' + Eigentümerrest '+euro(model.rest)+' = <b>'+euro(model.allCosts)+'</b>.</p>'+
      (Math.abs(round(model.rest-model.waterResidual-model.techemResidual))>.01 ? '<p class="ni-line">Sonstige Restbeträge: '+euro(round(model.rest-model.waterResidual-model.techemResidual))+'</p>' : '')+
      foot(model,1,count)+'</article>';
  }
  function unitPage(model,record,index) {
    const isTenant=record.role==="Mieter";
    const heading=record.role==="Leerstand"?"Leerstands- und Kostenblatt":"Wohnungs-Abrechnungsblatt";
    const costRows=record.costs.map(c=>'<tr><td>'+c.label+'</td><td class="ni-amt">'+(c.id==="K002"?units(c.waterUnits)+" m³":"gemäß Umlage")+'</td>'+
      '<td class="ni-amt">'+euro(c.amount)+'</td><td class="ni-amt">'+(isTenant?euro(c.advance):"–")+'</td></tr>').join("");
    return '<article class="nk-internal-sheet">'+head(heading,model)+
      '<div class="ni-band"><div><span>Wohnung</span><strong>'+safe(record.unit)+' · '+safe(record.id)+'</strong></div>'+
      '<div><span>Nutzer / Nutzung</span><strong>'+safe(record.name)+'</strong></div>'+
      '<div><span>Rolle</span><strong>'+safe(record.role)+'</strong></div></div>'+
      '<div class="ni-unit-meta"><div><small>Abrechnungszeitraum</small><b>'+safe(model.period)+'</b></div>'+
      '<div><small>Wohnfläche</small><b>'+units(record.area)+' m²</b></div>'+
      '<div><small>Abrechnungsfall</small><b>'+safe(record.role)+'</b></div></div>'+
      sect("Kosten und Vorauszahlungen","01","Werte aus NK-Pro")+
      '<table class="ni-unit-table"><colgroup><col style="width:36%"><col style="width:26%"><col style="width:19%"><col style="width:19%"></colgroup>'+
      '<thead><tr><th>Kostenart</th><th class="ni-amt">Berechnungsbasis</th><th class="ni-amt">Kosten</th><th class="ni-amt">Vorauszahl.</th></tr></thead>'+
      '<tbody>'+costRows+'<tr class="ni-subtotal"><td colspan="2">Gesamt</td><td class="ni-amt">'+euro(record.total)+'</td><td class="ni-amt">'+(isTenant?euro(record.advanced):"–")+'</td></tr>'+
      (isTenant?'<tr><td colspan="3">NK-Korrektur / Gutschrift</td><td class="ni-amt">'+euro(record.correction)+'</td></tr>':"")+'</tbody></table>'+
      '<div class="ni-result"><span>'+safe(resultText(record))+'</span><strong>'+resultDisplay(record)+'</strong></div>'+
      sect("Berechnungsgrundlagen und Hinweise","02","Interne Dokumentation")+
      '<p class="ni-line">Heiz- und Warmwasserkosten: externe Einzelabrechnung gemäß Techem. Wasserkosten: gemessener Verbrauch der Wohneinheit; Zählerstandsrundung gemäß NK-Pro-Abrechnung. Müll: gültiger Umlageschlüssel der Kostenart.</p>'+
      (record.role==="Privatanteil"?'<p class="ni-note">Privatanteil: rechnerisches Ergebnis für die Objektakte, kein Zahlungsanspruch gegenüber einem externen Mieter.</p>':
       record.role==="Leerstand"?'<p class="ni-note">Leerstand: Kosten gehören zum Eigentümeranteil und sind keine Mieternachforderung.</p>':
       '<p class="ni-note">Die NK-Korrektur ist in den angerechneten Beträgen berücksichtigt. Dieses Blatt ist ausschließlich für die Vermieterakte bestimmt.</p>')+
      '<div class="ni-empty-line"></div><div class="ni-empty-line"></div>'+
      foot(model,index,8)+'</article>';
  }

  function allSheets(model) {
    return overviewPage(model)+model.records.map((r,i)=>unitPage(model,r,i+2)).join("");
  }
  function markup(body,guide) {
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+
      '<title>NK-Pro Vermieterunterlagen</title><style>'+CSS+'</style></head><body>'+
      (guide?'<div class="ni-guide"><strong>Vermieterunterlagen – Druck / PDF:</strong> A4 · Maßstab 100 % · Browser-Kopfzeilen ausblenden. <button type="button" onclick="window.print()">Drucken / PDF</button><button type="button" onclick="window.close()">Schließen</button></div>':"")+
      body+'</body></html>';
  }

  function modelLive() {
    if (typeof global.calculateUmlage !== "function" || !global.state) throw new Error("Die aktuelle Abrechnung ist nicht verfügbar.");
    return makeModel(global.state,global.calculateUmlage());
  }
  function currentSheet() {
    const model=modelLive(),sel=document.getElementById("landlordDocType")?.value||"overview";
    if(sel==="overview")return {model,body:overviewPage(model),scope:"Objekt-Gesamtübersicht"};
    const id=document.getElementById("landlordDocUnit")?.value||model.records[0]?.id;
    const record=model.records.find(r=>r.id===id)||model.records[0];
    return {model,body:unitPage(model,record,model.records.indexOf(record)+2),scope:"Wohnungsblatt "+record.unit};
  }
  function updateUI() {
    const panel=document.getElementById("landlordDocPanel");
    if (!panel||!panel.open)return;
    try {
      const model=modelLive();
      const type=document.getElementById("landlordDocType"),unit=document.getElementById("landlordDocUnit");
      const prevId=unit.value;
      unit.innerHTML=model.records.map(r=>'<option value="'+safe(r.id)+'">'+safe(r.unit+" · "+r.name+" · "+r.role)+'</option>').join("");
      if(model.records.some(r=>r.id===prevId))unit.value=prevId;
      unit.hidden=type.value==="overview";
      const selected=type.value==="overview" ? overviewPage(model) : unitPage(model,model.records.find(r=>r.id===unit.value)||model.records[0],2+model.records.findIndex(r=>r.id===unit.value));
      const frame=document.getElementById("landlordDocPreview");
      frame.srcdoc=markup(selected,false);
      document.getElementById("landlordDocHint").textContent=type.value==="overview" ? "Objektübersicht mit allen sieben Wohnungen auf einer A4-Seite." : "Ein separates DIN-A4-Kostenblatt für die ausgewählte Wohnung.";
    }catch(e) {
      document.getElementById("landlordDocHint").textContent="Vorschau derzeit nicht verfügbar: "+String(e.message||e);
    }
  }
  function print(mode) {
    const model=modelLive(),html=mode==="all" ? allSheets(model) : currentSheet().body;
    const win=global.open("","_blank");
    if (!win){global.alert("Druckfenster wurde blockiert. Bitte Pop-ups für NK-Pro erlauben.");return;}
    win.document.open();win.document.write(markup(html,true));win.document.close();win.focus();
  }
  function init() {
    const panel=document.getElementById("landlordDocPanel");
    if(!panel)return;
    panel.addEventListener("toggle",()=>{if(panel.open)updateUI()});
    document.getElementById("landlordDocType").addEventListener("change",updateUI);
    document.getElementById("landlordDocUnit").addEventListener("change",updateUI);
    document.getElementById("landlordDocRefresh").addEventListener("click",updateUI);
    document.getElementById("landlordDocPrint").addEventListener("click",()=>print("selected"));
    document.getElementById("landlordDocPrintAll").addEventListener("click",()=>print("all"));
    // Read-only documents deliberately have no new data fields to sync.
  }
  global.NKProLandlordDocs=Object.freeze({makeModel,overviewPage,unitPage,allSheets,markup,init});
  init();
})(globalThis);
