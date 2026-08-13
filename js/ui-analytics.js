"use strict";

const analyticsUiState = {
  perspective:"nk",
  level:"dashboard",
  fromPeriodId:"",
  toPeriodId:"",
  comparison:"previous",
  referencePeriodId:"",
  costId:"all",
  tenantId:"all",
  unitId:"all",
  usage:"all",
  costArea:"all",
  allocationKey:"all",
  status:"all",
  dataQuality:"all",
  onlyOpenChecks:false,
  displayMode:"total",
  onlyAnomalies:false,
  detail:null
};

function analyticsText(value){return String(value===undefined||value===null?"":value).trim();}
function analyticsNum(value){const n=Number(value);return Number.isFinite(n)?n:0;}
function analyticsRound(value,d=2){const f=10**d;return Math.round((analyticsNum(value)+Number.EPSILON)*f)/f;}
function analyticsMoney(value){return analyticsNum(value).toLocaleString("de-DE",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2});}
function analyticsMoneySigned(value){const n=analyticsNum(value);return (n>0?"+":"")+analyticsMoney(n);}
function analyticsNumber(value,d=1){return analyticsNum(value).toLocaleString("de-DE",{minimumFractionDigits:d,maximumFractionDigits:d});}
function analyticsPercent(value){return value===null||value===undefined||!Number.isFinite(Number(value))?"–":((Number(value)>0?"+":"")+Number(value).toLocaleString("de-DE",{minimumFractionDigits:1,maximumFractionDigits:1})+" %");}
function analyticsEsc(value){return typeof escapeHtml==="function"?escapeHtml(value):analyticsText(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function analyticsId(value){return analyticsText(value).replace(/[^a-zA-Z0-9_-]/g,"_");}
function analyticsArgs(value){return analyticsEsc(JSON.stringify([value]));}
function analyticsCurrentRaw(){return NK_PRO_MODULES.analyticsEngine.build(state);}
function analyticsAvailablePeriods(){return analyticsCurrentRaw().periods||[];}
function analyticsEnsureRange(){
  const periods=analyticsAvailablePeriods();
  if(!periods.length) return;
  if(!periods.some(p=>p.periodId===analyticsUiState.fromPeriodId)) analyticsUiState.fromPeriodId=periods[0].periodId;
  if(!periods.some(p=>p.periodId===analyticsUiState.toPeriodId)) analyticsUiState.toPeriodId=periods[periods.length-1].periodId;
  if(!periods.some(p=>p.periodId===analyticsUiState.referencePeriodId)) analyticsUiState.referencePeriodId=periods[0].periodId;
}
function analyticsSelectedPeriodIds(){
  analyticsEnsureRange();
  const periods=analyticsAvailablePeriods();
  const a=Math.max(0,periods.findIndex(p=>p.periodId===analyticsUiState.fromPeriodId));
  const b=Math.max(0,periods.findIndex(p=>p.periodId===analyticsUiState.toPeriodId));
  const from=Math.min(a,b),to=Math.max(a,b);
  return periods.slice(from,to+1).map(p=>p.periodId);
}
function analyticsView(){
  const raw=NK_PRO_MODULES.analyticsEngine.build(state,{periodIds:analyticsSelectedPeriodIds()});
  let models=(raw.models||[]).slice();
  if(analyticsUiState.dataQuality!=="all") models=models.filter(m=>m.period&&m.period.quality&&m.period.quality.status===analyticsUiState.dataQuality);
  if(analyticsUiState.onlyOpenChecks) models=models.filter(m=>analyticsNum(m.quality&&m.quality.summary&&m.quality.summary.open)>0);
  const ids=new Set(models.map(m=>m.period.periodId));
  return Object.assign({},raw,{models,anomalies:(raw.anomalies||[]).filter(a=>!a.periodId||ids.has(a.periodId))});
}
function analyticsModelByPeriod(view,id){return (view.models||[]).find(m=>m.period.periodId===id)||null;}
function analyticsLatest(view){return (view.models||[]).at(-1)||null;}
function analyticsPrevious(view){return (view.models||[]).length>1?view.models.at(-2):null;}
function analyticsPeriodOptions(periods,selected){return periods.map(p=>'<option value="'+analyticsEsc(p.periodId)+'"'+(p.periodId===selected?' selected':'')+'>'+analyticsEsc(p.label)+(p.quality&&p.quality.legacy?' · Legacy':'')+'</option>').join('');}
function analyticsSelect(value,options,action,label,disabled=false){
  return '<label class="analytics-filter-field"><span>'+analyticsEsc(label)+'</span><select '+(disabled?'disabled ':'')+'data-ui-change="'+analyticsEsc(action)+'" data-ui-args="[&quot;$value&quot;]">'+options.map(o=>'<option value="'+analyticsEsc(o.value)+'"'+(String(o.value)===String(value)?' selected':'')+'>'+analyticsEsc(o.label)+'</option>').join('')+'</select></label>';
}
function analyticsKpi(label,value,note,tone="neutral",drill=""){
  const attrs=drill?' data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+JSON.stringify([drill])+'\' role="button" tabindex="0"':'';
  return '<article class="analytics-center-kpi analytics-center-kpi--'+analyticsEsc(tone)+'"'+attrs+'><small>'+analyticsEsc(label)+'</small><strong>'+value+'</strong><span>'+analyticsEsc(note||"")+'</span></article>';
}
function analyticsEmpty(title,body){return '<div class="nk-ui-state nk-ui-state--empty analytics-empty"><strong>'+analyticsEsc(title)+'</strong><span>'+analyticsEsc(body)+'</span></div>';}
function analyticsQualityBadge(model){
  const status=model&&model.period&&model.period.quality&&model.period.quality.status||"unbekannt";
  const cls=status==="vollständig"?"success":(status==="eingeschränkt"?"warning":"danger");
  return '<span class="analytics-quality-badge is-'+cls+'">'+analyticsEsc(status)+'</span>';
}
function analyticsLegend(items){return '<div class="analytics-chart-legend">'+items.map(i=>'<span><i class="series-'+analyticsEsc(i.key)+'"></i>'+analyticsEsc(i.label)+'</span>').join('')+'</div>';}
function analyticsChartCard(title,subtitle,chart,legend="",alt="",extraClass=""){
  return '<section class="nk-ui-card analytics-chart-card '+extraClass+'"><header class="analytics-chart-card__header"><div><h2>'+analyticsEsc(title)+'</h2><p>'+analyticsEsc(subtitle||"")+'</p></div></header>'+(legend||'')+'<div class="analytics-chart-frame">'+chart+'</div>'+(alt?'<details class="analytics-chart-alt"><summary>Werte als Text</summary><div>'+alt+'</div></details>':'')+'</section>';
}
function analyticsSvgLine(models,valueFn,formatFn,drillType="period",options={}){
  if(!models.length) return analyticsEmpty("Keine Zeitreihe","Für die gewählte Auswahl sind keine Perioden vorhanden.");
  const w=760,h=280,p={l:58,r:20,t:25,b:48};
  const values=models.map(m=>{const v=valueFn(m);return Number.isFinite(Number(v))?Number(v):null;});
  const numeric=values.filter(v=>v!==null);
  if(!numeric.length) return analyticsEmpty("Keine berechenbaren Werte","Die gewählte Kennzahl ist für diese Perioden nicht verfügbar.");
  let min=Math.min(...numeric),max=Math.max(...numeric); if(options.zeroBase!==false) min=Math.min(0,min); if(Math.abs(max-min)<1e-9){max+=1;min-=1;}
  const x=i=>p.l+(models.length===1?(w-p.l-p.r)/2:i*(w-p.l-p.r)/(models.length-1));
  const y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min);
  const points=values.map((v,i)=>v===null?null:[x(i),y(v)]);
  let d=""; points.forEach(pt=>{if(!pt){d="";return;} d+=(d?" L ":"M ")+pt[0].toFixed(1)+" "+pt[1].toFixed(1);});
  const grid=[0,.25,.5,.75,1].map(fr=>{const value=max-(max-min)*fr;const yy=p.t+(h-p.t-p.b)*fr;return '<line class="analytics-grid" x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+yy+'" y2="'+yy+'"></line><text class="analytics-axis-label" x="'+(p.l-8)+'" y="'+(yy+4)+'" text-anchor="end">'+analyticsEsc(formatFn(value))+'</text>';}).join('');
  const dots=points.map((pt,i)=>{
    if(!pt) return '';
    const m=models[i],v=values[i]; const args={type:drillType,key:drillType==="period"?m.period.periodId:(options.key||""),periodId:m.period.periodId};
    return '<g class="analytics-point" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs(args)+'\'><circle cx="'+pt[0]+'" cy="'+pt[1]+'" r="5" tabindex="0"><title>'+analyticsEsc(m.period.label+": "+formatFn(v))+'</title></circle><text class="analytics-x-label" x="'+pt[0]+'" y="'+(h-17)+'" text-anchor="middle">'+analyticsEsc(m.period.label)+'</text></g>';
  }).join('');
  const zero=min<0&&max>0?'<line class="analytics-zero" x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+y(0)+'" y2="'+y(0)+'"></line>':'';
  return '<svg class="analytics-svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+analyticsEsc(options.ariaLabel||"Zeitreihe")+'">'+grid+zero+'<path class="analytics-line" d="'+d+'"></path>'+dots+'</svg>';
}
function analyticsSvgGroupedBars(models,series,formatFn,options={}){
  if(!models.length) return analyticsEmpty("Keine Daten","Für die gewählte Auswahl sind keine Perioden vorhanden.");
  const w=760,h=300,p={l:58,r:20,t:30,b:55}; const all=[];
  models.forEach(m=>series.forEach(s=>all.push(analyticsNum(s.value(m))))); let min=Math.min(0,...all),max=Math.max(0,...all);if(max===min)max=min+1;
  const y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min); const zero=y(0); const groupW=(w-p.l-p.r)/models.length; const barW=Math.min(28,groupW/(series.length+1));
  const grid=[0,.25,.5,.75,1].map(fr=>{const value=max-(max-min)*fr,yy=p.t+(h-p.t-p.b)*fr;return '<line class="analytics-grid" x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+yy+'" y2="'+yy+'"></line><text class="analytics-axis-label" x="'+(p.l-8)+'" y="'+(yy+4)+'" text-anchor="end">'+analyticsEsc(formatFn(value))+'</text>';}).join('');
  let bars='';models.forEach((m,i)=>{const center=p.l+groupW*i+groupW/2;series.forEach((s,j)=>{const v=analyticsNum(s.value(m));const xx=center-(series.length*barW)/2+j*barW;const yy=Math.min(zero,y(v)),height=Math.max(1,Math.abs(y(v)-zero));bars+='<rect class="analytics-bar series-'+analyticsEsc(s.key)+'" x="'+xx+'" y="'+yy+'" width="'+(barW-3)+'" height="'+height+'" tabindex="0" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"period",key:m.period.periodId,periodId:m.period.periodId})+'\'><title>'+analyticsEsc(m.period.label+" · "+s.label+": "+formatFn(v))+'</title></rect>';});bars+='<text class="analytics-x-label" x="'+center+'" y="'+(h-20)+'" text-anchor="middle">'+analyticsEsc(m.period.label)+'</text>';});
  return '<svg class="analytics-svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+analyticsEsc(options.ariaLabel||"Gruppiertes Balkendiagramm")+'">'+grid+'<line class="analytics-zero" x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+zero+'" y2="'+zero+'"></line>'+bars+'</svg>';
}
function analyticsSvgStackedBars(models,segments,valueFn,formatFn,options={}){
  if(!models.length)return analyticsEmpty("Keine Daten","Keine Perioden vorhanden.");
  const w=760,h=310,p={l:58,r:20,t:30,b:55}; const totals=models.map(m=>sumSegments(segments,s=>Math.max(0,analyticsNum(valueFn(m,s))))); const max=Math.max(1,...totals); const y=v=>p.t+(max-v)*(h-p.t-p.b)/max; const groupW=(w-p.l-p.r)/models.length,barW=Math.min(64,groupW*.55);
  function sumSegments(rows,fn){return rows.reduce((s,r)=>s+fn(r),0);}
  const grid=[0,.25,.5,.75,1].map(fr=>{const value=max*(1-fr),yy=p.t+(h-p.t-p.b)*fr;return '<line class="analytics-grid" x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+yy+'" y2="'+yy+'"></line><text class="analytics-axis-label" x="'+(p.l-8)+'" y="'+(yy+4)+'" text-anchor="end">'+analyticsEsc(formatFn(value))+'</text>';}).join('');
  let bars='';models.forEach((m,i)=>{const center=p.l+groupW*i+groupW/2,xx=center-barW/2;let cumulative=0;segments.forEach(s=>{const v=Math.max(0,analyticsNum(valueFn(m,s)));const top=y(cumulative+v),bottom=y(cumulative),hh=Math.max(0,bottom-top);if(hh>0)bars+='<rect class="analytics-bar series-'+analyticsEsc(s.key)+'" x="'+xx+'" y="'+top+'" width="'+barW+'" height="'+hh+'" tabindex="0" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"period",key:m.period.periodId,periodId:m.period.periodId})+'\'><title>'+analyticsEsc(m.period.label+" · "+s.label+": "+formatFn(v))+'</title></rect>';cumulative+=v;});bars+='<text class="analytics-x-label" x="'+center+'" y="'+(h-20)+'" text-anchor="middle">'+analyticsEsc(m.period.label)+'</text>';});
  return '<svg class="analytics-svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+analyticsEsc(options.ariaLabel||"Gestapelte Balken")+'">'+grid+bars+'</svg>';
}
function analyticsSvgHorizontalRanking(rows,valueFn,formatFn,drillType,keyFn){
  const data=rows.filter(r=>Math.abs(analyticsNum(valueFn(r)))>0.00001).sort((a,b)=>Math.abs(analyticsNum(valueFn(b)))-Math.abs(analyticsNum(valueFn(a)))).slice(0,10);
  if(!data.length)return analyticsEmpty("Keine Rangwerte","Für die Auswahl sind keine Werte vorhanden.");
  const w=760,rowH=34,h=50+data.length*rowH,p={l:220,r:95,t:18,b:20},max=Math.max(1,...data.map(r=>Math.abs(analyticsNum(valueFn(r)))));
  let content='';data.forEach((r,i)=>{const v=analyticsNum(valueFn(r)),y=20+i*rowH,width=(w-p.l-p.r)*Math.abs(v)/max;const key=keyFn(r);content+='<text class="analytics-rank-label" x="'+(p.l-10)+'" y="'+(y+17)+'" text-anchor="end">'+analyticsEsc(r.costName||r.name||r.unitName||key)+'</text><rect class="analytics-rank-bar" x="'+p.l+'" y="'+(y+4)+'" width="'+width+'" height="20" tabindex="0" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:drillType,key,periodId:r.periodId})+'\'><title>'+analyticsEsc((r.costName||r.name||r.unitName||key)+": "+formatFn(v))+'</title></rect><text class="analytics-rank-value" x="'+(p.l+width+8)+'" y="'+(y+18)+'">'+analyticsEsc(formatFn(v))+'</text>';});
  return '<svg class="analytics-svg analytics-svg--ranking" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Rangfolge">'+content+'</svg>';
}
function analyticsSvgDiverging(rows){
  const data=rows.filter(r=>Math.abs(analyticsNum(r.balance))>.005).sort((a,b)=>Math.abs(b.balance)-Math.abs(a.balance)); if(!data.length)return analyticsEmpty("Keine Salden","Keine von Null abweichenden Salden vorhanden.");
  const w=760,rowH=34,h=45+data.length*rowH,center=380,max=Math.max(1,...data.map(r=>Math.abs(r.balance))),half=275;let content='<line class="analytics-zero" x1="'+center+'" x2="'+center+'" y1="8" y2="'+(h-20)+'"></line>';
  data.forEach((r,i)=>{const v=r.balance,y=16+i*rowH,width=half*Math.abs(v)/max,x=v>=0?center:center-width;content+='<text class="analytics-rank-label" x="'+(center-half-12)+'" y="'+(y+17)+'" text-anchor="end">'+analyticsEsc(r.name)+'</text><rect class="analytics-diverging '+(v>=0?'is-positive':'is-negative')+'" x="'+x+'" y="'+(y+4)+'" width="'+width+'" height="20" tabindex="0" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"tenant",key:r.tenantId,periodId:r.periodId})+'\'><title>'+analyticsEsc(r.name+": "+analyticsMoneySigned(v))+'</title></rect><text class="analytics-rank-value" x="'+(v>=0?center+width+8:center-width-8)+'" y="'+(y+18)+'" text-anchor="'+(v>=0?'start':'end')+'">'+analyticsEsc(analyticsMoneySigned(v))+'</text>';});
  return '<svg class="analytics-svg analytics-svg--ranking" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Teilnehmersalden mit Nulllinie">'+content+'</svg>';
}
function analyticsSvgWaterfall(cmp){
  if(!cmp)return analyticsEmpty("Kein Vergleich","Für eine Ursachenzerlegung werden mindestens zwei Perioden benötigt.");
  const changes=cmp.costs.filter(r=>Math.abs(r.delta)>.005).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,8); if(!changes.length)return analyticsEmpty("Keine Veränderung","Zwischen den Vergleichsperioden gibt es keine Kostenänderungen.");
  const steps=[{label:cmp.from.label,value:cmp.fromTotal||0,start:0,end:cmp.fromTotal||0,type:"total"}]; let running=cmp.fromTotal||0;changes.forEach(c=>{const start=running;running+=c.delta;steps.push({label:c.costName,value:c.delta,start,end:running,type:c.delta>=0?"up":"down",key:c.costId});});steps.push({label:cmp.to.label,value:cmp.toTotal||0,start:0,end:cmp.toTotal||0,type:"total"});
  const vals=steps.flatMap(s=>[s.start,s.end]);let min=Math.min(0,...vals),max=Math.max(0,...vals);if(max===min)max+=1;const w=820,h=320,p={l:58,r:25,t:25,b:90},xw=(w-p.l-p.r)/steps.length,barW=Math.min(48,xw*.62),y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min);let body='';steps.forEach((s,i)=>{const x=p.l+i*xw+(xw-barW)/2;const a=s.type==="total"?0:s.start,b=s.end,top=y(Math.max(a,b)),bottom=y(Math.min(a,b));body+='<rect class="analytics-waterfall is-'+s.type+'" x="'+x+'" y="'+top+'" width="'+barW+'" height="'+Math.max(2,bottom-top)+'" tabindex="0"'+(s.key?' data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"cost",key:s.key,periodId:cmp.to.periodId})+'\'':'')+'><title>'+analyticsEsc(s.label+": "+analyticsMoneySigned(s.value))+'</title></rect><text class="analytics-waterfall-label" transform="translate('+(x+barW/2)+','+(h-62)+') rotate(-38)" text-anchor="end">'+analyticsEsc(s.label)+'</text>';if(i<steps.length-1){const connectorY=y(s.end);body+='<line class="analytics-waterfall-connector" x1="'+(x+barW)+'" x2="'+(p.l+(i+1)*xw+(xw-barW)/2)+'" y1="'+connectorY+'" y2="'+connectorY+'"></line>';}});const zero=min<0&&max>0?'<line class="analytics-zero" x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+y(0)+'" y2="'+y(0)+'"></line>':'';return '<svg class="analytics-svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Wasserfall der Kostenveränderung">'+zero+body+'</svg>';
}
function analyticsCostTrendValue(model){
  if(analyticsUiState.costId!=="all"){
    const row=model.costs.find(c=>c.costId===analyticsUiState.costId);if(!row)return null;
    if(analyticsUiState.displayMode==="sqm")return model.totals.totalArea?row.total/model.totals.totalArea:null;
    if(analyticsUiState.displayMode==="percent")return model.totals.totalCosts?row.total/model.totals.totalCosts*100:null;
    if(analyticsUiState.displayMode==="consumption")return row.consumptionTotal!==null?row.consumptionTotal:(/wasser/i.test(row.costName)&&model.water.available?model.water.total:null);
    if(analyticsUiState.displayMode==="price")return row.pricePerUnit;
    if(analyticsUiState.displayMode==="participant")return model.tenants.length?row.tenantShare/model.tenants.length:null;
    return row.total;
  }
  if(analyticsUiState.displayMode==="sqm")return model.totals.costPerSqm;
  if(analyticsUiState.displayMode==="participant")return model.tenants.length?model.totals.participantShare/model.tenants.length:null;
  if(analyticsUiState.displayMode==="consumption")return model.water.available?model.water.total:null;
  if(analyticsUiState.displayMode==="price")return model.waterPrice;
  return model.totals.totalCosts;
}
function analyticsDisplayFormatter(v){
  if(analyticsUiState.displayMode==="percent")return analyticsNumber(v,1)+" %";
  if(analyticsUiState.displayMode==="consumption")return analyticsNumber(v,2)+" m³";
  if(analyticsUiState.displayMode==="price")return analyticsNumber(v,3)+" €/Einheit";
  if(analyticsUiState.displayMode==="sqm")return analyticsNumber(v,2)+" €/m²";
  return analyticsMoney(v);
}
function analyticsFilteredTenants(model){return model.tenants.filter(t=>(analyticsUiState.tenantId==="all"||t.tenantId===analyticsUiState.tenantId)&&(analyticsUiState.unitId==="all"||t.unitId===analyticsUiState.unitId)&&(analyticsUiState.usage==="all"||t.usage===analyticsUiState.usage));}
function analyticsFilteredCosts(model){return model.costs.filter(c=>
  (analyticsUiState.costId==="all"||c.costId===analyticsUiState.costId)&&
  (analyticsUiState.costArea==="all"||c.area===analyticsUiState.costArea)&&
  (analyticsUiState.allocationKey==="all"||c.allocationKey===analyticsUiState.allocationKey)&&
  (analyticsUiState.status==="all"||c.calculationStatus===analyticsUiState.status)
);}
function analyticsDisplayOptions(view){
  let options=[{value:"total",label:"Gesamtbetrag"}];
  if(analyticsUiState.perspective==="finance") options.push({value:"sqm",label:"€/m²"});
  else if(analyticsUiState.perspective==="nk"){
    options.push({value:"sqm",label:"€/m²"},{value:"participant",label:"je Teilnehmer"},{value:"percent",label:"Anteil in %"});
    const supportsConsumption=(view.models||[]).some(m=>analyticsFilteredCosts(m).some(c=>c.consumptionTotal!==null||/wasser/i.test(c.costName))||(m.water&&m.water.available));
    if(supportsConsumption) options.push({value:"consumption",label:"Verbrauch"},{value:"price",label:"Preis je Einheit"});
  }
  if(!options.some(o=>o.value===analyticsUiState.displayMode)) analyticsUiState.displayMode="total";
  return options;
}
function analyticsComparison(view){
  const models=view.models||[];if(models.length<2)return null;const latest=models.at(-1);let base=models.at(-2),label=base.period.label;
  if(analyticsUiState.comparison==="first"){base=models[0];label=base.period.label;}
  else if(analyticsUiState.comparison==="previous-year"){
    const y=/^\d{4}$/.test(latest.period.yearLabel||latest.period.label)?Number(latest.period.yearLabel||latest.period.label):null;
    const py=y?models.find(m=>m!==latest&&m.period.quality.calendar&&Number(m.period.yearLabel||m.period.label)===y-1):null;
    if(!py)return null;base=py;label=base.period.label;
  }
  else if(analyticsUiState.comparison==="reference"){base=analyticsModelByPeriod(view,analyticsUiState.referencePeriodId)||models[0];label=base.period.label;}
  else if(analyticsUiState.comparison==="none")return null;
  else if(analyticsUiState.comparison==="average"){
    const prev=models.slice(0,-1);if(!prev.length)return null;const avg=prev.reduce((s,m)=>s+m.totals.totalCosts,0)/prev.length;return {synthetic:true,from:{label:"Ø vorherige Perioden",periodId:"average"},to:latest.period,totalCostDelta:latest.totals.totalCosts-avg,totalCostPercent:avg?(latest.totals.totalCosts-avg)/Math.abs(avg)*100:null,fromTotal:avg,toTotal:latest.totals.totalCosts,costs:[],largestIncreases:[],largestDecreases:[],newCosts:[],removedCosts:[],allocationChanges:[]};
  }
  const cmp=NK_PRO_MODULES.analyticsEngine.comparison(base,latest);if(cmp){cmp.fromTotal=base.totals.totalCosts;cmp.toTotal=latest.totals.totalCosts;}return cmp;
}
function analyticsFilterToolbar(view){
  const periods=analyticsAvailablePeriods();
  const allCosts=new Map(),allTenants=new Map(),allUnits=new Map(),areas=new Set(),keys=new Set(),statuses=new Set();
  (analyticsCurrentRaw().models||[]).forEach(m=>{m.costs.forEach(c=>{allCosts.set(c.costId,c.costName);if(c.area)areas.add(c.area);if(c.allocationKey)keys.add(c.allocationKey);if(c.calculationStatus)statuses.add(c.calculationStatus);});m.tenants.forEach(t=>{allTenants.set(t.tenantId,t.name);if(t.unitId)allUnits.set(t.unitId,t.unitName||t.unitId);});});
  const displayOptions=analyticsDisplayOptions(view);
  return '<section class="nk-ui-card analytics-filter-card" aria-label="Analysefilter"><div class="analytics-filter-primary">'+
    '<label class="analytics-filter-field"><span>Von</span><select data-ui-change="analytics.setFromPeriod" data-ui-args="[&quot;$value&quot;]">'+analyticsPeriodOptions(periods,analyticsUiState.fromPeriodId)+'</select></label>'+ 
    '<label class="analytics-filter-field"><span>Bis</span><select data-ui-change="analytics.setToPeriod" data-ui-args="[&quot;$value&quot;]">'+analyticsPeriodOptions(periods,analyticsUiState.toPeriodId)+'</select></label>'+ 
    analyticsSelect(analyticsUiState.comparison,[{value:"none",label:"Kein Vergleich"},{value:"previous",label:"Vorperiode"},{value:"previous-year",label:"Vorjahr (nur eindeutige Kalenderjahre)"},{value:"first",label:"Erste ausgewählte Periode"},{value:"reference",label:"Freie Referenzperiode"},{value:"average",label:"Ø vorherige Perioden"}],"analytics.setComparison","Vergleich")+
    '<label class="analytics-filter-field"><span>Referenz</span><select '+(analyticsUiState.comparison!=="reference"?'disabled ':'')+'data-ui-change="analytics.setReferencePeriod" data-ui-args="[&quot;$value&quot;]">'+analyticsPeriodOptions(periods,analyticsUiState.referencePeriodId)+'</select></label>'+ 
    '<div class="analytics-quick-periods" role="group" aria-label="Schnellwahl Zeitraum"><button type="button" data-ui-action="analytics.quickRange" data-ui-args=\'["all"]\'>Alle</button><button type="button" data-ui-action="analytics.quickRange" data-ui-args=\'["last3"]\'>Letzte 3</button><button type="button" data-ui-action="analytics.quickRange" data-ui-args=\'["current"]\'>Aktuell</button></div></div>'+ 
    '<div class="analytics-filter-secondary">'+analyticsSelect(analyticsUiState.costId,[{value:"all",label:"Alle Kostenarten"},...Array.from(allCosts).map(([value,label])=>({value,label}))],"analytics.setCost","Kostenart")+
    analyticsSelect(analyticsUiState.costArea,[{value:"all",label:"Alle Kostenbereiche"},...Array.from(areas).sort().map(value=>({value,label:value}))],"analytics.setCostArea","Kostenbereich")+
    analyticsSelect(analyticsUiState.tenantId,[{value:"all",label:"Alle Teilnehmer"},...Array.from(allTenants).map(([value,label])=>({value,label}))],"analytics.setTenant","Teilnehmer")+
    analyticsSelect(analyticsUiState.unitId,[{value:"all",label:"Alle Wohnungen"},...Array.from(allUnits).map(([value,label])=>({value,label}))],"analytics.setUnit","Wohnung")+
    analyticsSelect(analyticsUiState.usage,[{value:"all",label:"Alle Nutzungsarten"},{value:"rented",label:"Vermietet"},{value:"private",label:"Privat / Eigen"}],"analytics.setUsage","Nutzungsart")+
    analyticsSelect(analyticsUiState.allocationKey,[{value:"all",label:"Alle Umlageschlüssel"},...Array.from(keys).sort().map(value=>({value,label:value}))],"analytics.setAllocationKey","Umlageschlüssel")+
    analyticsSelect(analyticsUiState.status,[{value:"all",label:"Alle Status"},...Array.from(statuses).sort().map(value=>({value,label:value}))],"analytics.setStatus","Status")+
    analyticsSelect(analyticsUiState.dataQuality,[{value:"all",label:"Alle Datenqualitäten"},{value:"vollständig",label:"Vollständig"},{value:"eingeschränkt",label:"Eingeschränkt"},{value:"unvollständig",label:"Unvollständig"}],"analytics.setDataQuality","Datenvollständigkeit")+
    analyticsSelect(analyticsUiState.displayMode,displayOptions,"analytics.setDisplayMode","Darstellung")+
    '<label class="analytics-filter-check"><input type="checkbox" data-ui-change="analytics.toggleOpenChecks" data-ui-args="[&quot;$checked&quot;]"'+(analyticsUiState.onlyOpenChecks?' checked':'')+'><span>nur offene Prüfungen</span></label>'+
    '<label class="analytics-filter-check"><input type="checkbox" data-ui-change="analytics.toggleAnomalies" data-ui-args="[&quot;$checked&quot;]"'+(analyticsUiState.onlyAnomalies?' checked':'')+'><span>nur Auffälligkeiten</span></label></div>'+ 
    '<footer><span>'+(view.models||[]).length+' Perioden ausgewertet</span><span>'+((view.models||[]).filter(m=>!m.period.quality.legacy&&m.period.quality.calendar).length)+' vollständig vergleichbar</span><span>'+((view.models||[]).filter(m=>m.period.quality.legacy).length)+' Legacy-Perioden</span></footer></section>';
}
function analyticsPerspectiveTabs(){return '<div class="analytics-perspective-tabs" role="tablist" aria-label="Analysep erspektive"><button role="tab" aria-selected="'+(analyticsUiState.perspective==="nk")+'" data-ui-action="analytics.setPerspective" data-ui-args=\'["nk"]\'>Nebenkosten &amp; Abrechnung</button><button role="tab" aria-selected="'+(analyticsUiState.perspective==="finance")+'" data-ui-action="analytics.setPerspective" data-ui-args=\'["finance"]\'>Finanzen</button><button role="tab" aria-selected="'+(analyticsUiState.perspective==="tax")+'" data-ui-action="analytics.setPerspective" data-ui-args=\'["tax"]\'>Steuerliche Auswertung</button></div>';}
function analyticsLevelTabs(){return '<div class="analytics-level-tabs" role="tablist" aria-label="Darstellungsebene"><button role="tab" aria-selected="'+(analyticsUiState.level==="dashboard")+'" data-ui-action="analytics.setLevel" data-ui-args=\'["dashboard"]\'>Dashboard</button><button role="tab" aria-selected="'+(analyticsUiState.level==="detail")+'" data-ui-action="analytics.setLevel" data-ui-args=\'["detail"]\'>Detailanalyse</button><button role="tab" aria-selected="'+(analyticsUiState.level==="table")+'" data-ui-action="analytics.setLevel" data-ui-args=\'["table"]\'>Tabelle</button></div>';}
function analyticsExportBar(){return '<div class="analytics-export-bar"><button class="secondary" data-ui-action="analytics.exportCsv" type="button">CSV</button><button class="secondary" data-ui-action="analytics.exportExcel" type="button">Excel</button><button class="secondary" data-ui-action="analytics.print" type="button">PDF / Druck</button></div>';}
function analyticsChangeSummary(view){
  const cmp=analyticsComparison(view);if(!cmp)return '<section class="nk-ui-card analytics-change-card"><h2>Was hat sich verändert?</h2>'+analyticsEmpty("Kein Vergleich aktiv","Wähle mindestens zwei Perioden und einen Vergleichsmodus.")+'</section>';
  if(cmp.synthetic)return '<section class="nk-ui-card analytics-change-card"><h2>Was hat sich verändert?</h2><p>'+analyticsEsc(cmp.to.label)+' liegt gegenüber '+analyticsEsc(cmp.from.label)+' um <strong>'+analyticsEsc(analyticsMoneySigned(cmp.totalCostDelta))+'</strong> ('+analyticsEsc(analyticsPercent(cmp.totalCostPercent))+') verändert.</p></section>';
  const inc=cmp.largestIncreases.slice(0,3).map(r=>'<li><button data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"cost",key:r.costId,periodId:cmp.to.periodId})+'\'><strong>'+analyticsEsc(r.costName)+'</strong><span>'+analyticsEsc(analyticsMoneySigned(r.delta))+' · '+analyticsEsc(analyticsPercent(r.percent))+'</span></button></li>').join('')||'<li>Keine Steigerung.</li>';
  const dec=cmp.largestDecreases.slice(0,3).map(r=>'<li><button data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"cost",key:r.costId,periodId:cmp.to.periodId})+'\'><strong>'+analyticsEsc(r.costName)+'</strong><span>'+analyticsEsc(analyticsMoneySigned(r.delta))+' · '+analyticsEsc(analyticsPercent(r.percent))+'</span></button></li>').join('')||'<li>Keine Senkung.</li>';
  const meta=[];if(cmp.newCosts.length)meta.push(cmp.newCosts.length+' neue Kostenart(en)');if(cmp.removedCosts.length)meta.push(cmp.removedCosts.length+' weggefallene Kostenart(en)');if(cmp.allocationChanges.length)meta.push(cmp.allocationChanges.length+' Umlageschlüsseländerung(en)');if(cmp.waterPercent!==null)meta.push('Wasser '+analyticsPercent(cmp.waterPercent));if(cmp.waterEffects)meta.push('Wasserkosten: Verbrauchseffekt '+analyticsMoneySigned(cmp.waterEffects.consumptionEffect)+' · Preiseffekt '+analyticsMoneySigned(cmp.waterEffects.priceEffect)+' · Rest '+analyticsMoneySigned(cmp.waterEffects.otherEffect));
  return '<section class="nk-ui-card analytics-change-card"><header><div><h2>Was hat sich verändert?</h2><p>'+analyticsEsc(cmp.from.label)+' → '+analyticsEsc(cmp.to.label)+'</p></div><strong>'+analyticsEsc(analyticsMoneySigned(cmp.totalCostDelta))+' · '+analyticsEsc(analyticsPercent(cmp.totalCostPercent))+'</strong></header><div class="analytics-change-columns"><div><h3>Größte Steigerungen</h3><ul>'+inc+'</ul></div><div><h3>Größte Senkungen</h3><ul>'+dec+'</ul></div></div>'+(meta.length?'<p class="analytics-change-meta">'+analyticsEsc(meta.join(' · '))+'</p>':'')+'</section>';
}
function analyticsAnomalyPanel(view){
  const rows=(view.anomalies||[]).filter(a=>!analyticsUiState.onlyAnomalies||a.severity!=="data");
  return '<section class="nk-ui-card analytics-anomaly-card"><header><div><h2>Auffälligkeiten</h2><p>Auffälligkeit bedeutet nicht automatisch Fehler. Kritische Mängel bleiben im bestehenden Prüfsystem.</p></div><span>'+rows.length+'</span></header>'+(rows.length?'<ul>'+rows.slice(0,12).map(a=>'<li class="is-'+analyticsEsc(a.severity)+'"><button data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:a.type.includes('water')?'water':(a.type.includes('cost')||a.type.includes('allocation')?'cost':'period'),key:a.key,periodId:a.periodId})+'\'><strong>'+analyticsEsc(a.label)+'</strong><span>'+analyticsEsc(a.detail)+'</span></button></li>').join('')+'</ul>':analyticsEmpty("Keine Auffälligkeiten","Für die ausgewählten Perioden wurden mit den Analyse-Schwellen keine Auffälligkeiten erkannt.") )+'</section>';
}
function analyticsDataQuality(view){
  return '<section class="nk-ui-card analytics-quality-card"><header><div><h2>Datenqualität</h2><p>Belastbarkeit und Herkunft der ausgewerteten Perioden.</p></div></header><div class="analytics-quality-list">'+(view.models||[]).map(m=>'<button data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"period",key:m.period.periodId,periodId:m.period.periodId})+'\'><span><strong>'+analyticsEsc(m.period.label)+'</strong><small>'+analyticsEsc(m.period.source)+' · '+analyticsEsc(m.period.archiveStatus)+'</small></span>'+analyticsQualityBadge(m)+'<em>'+analyticsEsc(String(m.period.quality.score))+'/100</em></button>').join('')+'</div></section>';
}
function analyticsNkDashboard(view){
  const latest=analyticsLatest(view);if(!latest)return analyticsEmpty("Keine Abrechnungsperioden","Es stehen keine analysierbaren Daten zur Verfügung.");
  const cmp=analyticsComparison(view);const rec=latest.reconciliation;const open=rec&&Number.isFinite(Number(rec.open))?rec.open:null;const explained=rec&&Number.isFinite(Number(rec.explanation))?rec.explanation:null;const control=rec&&Number.isFinite(Number(rec.control))?rec.control:null;
  const kpis='<section class="analytics-center-kpis">'+analyticsKpi("Abrechnungsrelevante Kosten",analyticsMoney(latest.totals.totalCosts),cmp?analyticsMoneySigned(cmp.totalCostDelta)+' · '+analyticsPercent(cmp.totalCostPercent):latest.period.label,"neutral",{type:"period",key:latest.period.periodId,periodId:latest.period.periodId})+
  analyticsKpi("Auf Abrechnungsteilnehmer verteilt",analyticsMoney(latest.totals.participantShare),latest.tenants.length+' reguläre Teilnehmer inkl. Privat/Eigen',"success")+
  analyticsKpi("Vorauszahlungen",analyticsMoney(latest.totals.prepayments),latest.period.label,"neutral")+
  analyticsKpi("Nachzahlungen",analyticsMoney(latest.totals.positiveBalance),"Summe positiver Abrechnungssalden","warning")+
  analyticsKpi("Guthaben",analyticsMoney(latest.totals.negativeBalance),"Summe negativer Abrechnungssalden","success")+
  analyticsKpi("Leerstandsanteile",analyticsMoney(latest.totals.vacancyShare),"fachlich getrennt von Privatnutzung","neutral")+
  analyticsKpi("Echte nicht umlagefähige Kosten",analyticsMoney(latest.totals.trueNonAllocable),"dokumentierte Eigentümeranteile","neutral")+
  analyticsKpi("Umlagefähig, aber nicht umgelegt",analyticsMoney(latest.totals.unallocatedAllocable),"nicht mit echter Nichtumlagefähigkeit vermischt","warning")+
  analyticsKpi("Offene Differenz",open===null?"Daten fehlen":analyticsMoney(open),open===null?"für diese Periodenkennung nicht aus Kostenabgleich ableitbar":"fachlicher Status separat","warning")+
  analyticsKpi("Erklärte Differenz",explained===null?"Daten fehlen":analyticsMoney(explained),"Kosten- und Umlagenabgleich","neutral")+
  analyticsKpi("Kontrolldifferenz",control===null?"Daten fehlen":analyticsMoney(control),"rechnerisch; nicht mit fachlichem Status vermischen",control!==null&&Math.abs(control)>.01?"warning":"success")+
  analyticsKpi("Wasserverbrauch",latest.water.available?analyticsNumber(latest.water.total,2)+' m³':"Daten fehlen",latest.water.available?'KW '+analyticsNumber(latest.water.cold,2)+' · WW '+analyticsNumber(latest.water.warm,2):latest.water.reason,"neutral",{type:"water",key:"water",periodId:latest.period.periodId})+
  analyticsKpi("Preis je Verbrauchseinheit",latest.waterPrice!==null?analyticsNumber(latest.waterPrice,3)+' €':"Daten fehlen","Wasserversorgung","neutral")+
  analyticsKpi("Kosten je m²",latest.totals.costPerSqm!==null?analyticsNumber(latest.totals.costPerSqm,2)+' €':"Daten fehlen",latest.totals.totalArea?analyticsNumber(latest.totals.totalArea,1)+' m² Basis':'Flächenbasis fehlt',"neutral")+
  analyticsKpi("Offene Prüfentscheidungen",String(latest.quality.summary.open||0),"bestehende NK-Pro-Prüfarchitektur","warning")+
  analyticsKpi("Relevante Auffälligkeiten",String((view.anomalies||[]).filter(a=>a.periodId===latest.period.periodId&&a.type!=="legacy").length),"Auffälligkeit ist nicht automatisch ein Fehler","neutral")+
  analyticsKpi("Datenqualitätsstatus",analyticsEsc(latest.period.quality.status),latest.period.quality.issues.length+' Hinweise',latest.period.quality.status==="vollständig"?"success":"warning")+'</section>';
  const trend=analyticsSvgLine(view.models,analyticsCostTrendValue,analyticsDisplayFormatter,analyticsUiState.costId==="all"?"period":"cost",{key:analyticsUiState.costId,ariaLabel:"Kostenentwicklung"});
  const latestCosts=analyticsFilteredCosts(latest).filter(c=>c.active);
  const ranking=analyticsSvgHorizontalRanking(latestCosts,r=>r.total,analyticsMoney,"cost",r=>r.costId);
  const water=analyticsSvgLine(view.models,m=>m.water.available?m.water.total:null,v=>analyticsNumber(v,2)+' m³',"water",{key:"water",ariaLabel:"Wasserverbrauch über Perioden"});
  return kpis+'<div class="analytics-chart-grid">'+analyticsChartCard("Kostenentwicklung",analyticsUiState.costId==="all"?"Gesamtkosten je Periode":"Kostenart im Mehrjahresvergleich",trend,"",(view.models||[]).map(m=>analyticsEsc(m.period.label+': '+analyticsDisplayFormatter(analyticsCostTrendValue(m)))).join('<br>'))+analyticsChartCard("Kostenarten-Ranking",latest.period.label+' · größte Kostenarten',ranking,"",latestCosts.sort((a,b)=>b.total-a.total).slice(0,10).map(r=>analyticsEsc(r.costName+': '+analyticsMoney(r.total))).join('<br>'))+analyticsChartCard("Wasserverbrauch","Kalt- und Warmwasser zusammen; nur eindeutig zuordenbare Kalenderperioden",water,"",(view.models||[]).filter(m=>m.water.available).map(m=>analyticsEsc(m.period.label+': '+analyticsNumber(m.water.total,2)+' m³')).join('<br>'))+'</div>'+analyticsChangeSummary(view)+'<div class="analytics-two-column">'+analyticsAnomalyPanel(view)+analyticsDataQuality(view)+'</div>';
}
function analyticsNkDetail(view){
  const latest=analyticsLatest(view);if(!latest)return analyticsEmpty("Keine Daten","");const cmp=analyticsComparison(view);if(cmp&&!cmp.synthetic){cmp.fromTotal=analyticsModelByPeriod(view,cmp.from.periodId).totals.totalCosts;cmp.toTotal=latest.totals.totalCosts;}
  const costSegments=[{key:"heating",label:"Heizung"},{key:"water",label:"Wasser"},{key:"waste",label:"Abfall"},{key:"other",label:"Sonstige"}];
  const segmentValue=(m,s)=>m.costs.filter(c=>c.active).filter(c=>{const a=(c.area+' '+c.costName).toLowerCase();if(s.key==="heating")return a.includes('heiz');if(s.key==="water")return a.includes('wasser');if(s.key==="waste")return a.includes('abfall')||a.includes('müll');return !a.includes('heiz')&&!a.includes('wasser')&&!a.includes('abfall')&&!a.includes('müll');}).reduce((sum,c)=>sum+c.total,0);
  const structure=analyticsSvgStackedBars(view.models,costSegments,segmentValue,analyticsMoney,{ariaLabel:"Kostenstruktur"});
  const waterfall=cmp&&!cmp.synthetic?analyticsSvgWaterfall(cmp):analyticsEmpty("Wasserfall nicht verfügbar","Wähle Vorperiode, erste oder freie Referenzperiode.");
  const saldos=analyticsSvgDiverging(analyticsFilteredTenants(latest));
  const waterUnits=latest.water.available?analyticsSvgHorizontalRanking(latest.water.units,r=>r.total,v=>analyticsNumber(v,2)+' m³',"unit",r=>r.unitId):analyticsEmpty("Keine Wasser-Wohnungsdaten",latest.water.reason);
  return '<div class="analytics-chart-grid">'+analyticsChartCard("Kostenstruktur","Gestapelte Hauptbereiche je Periode",structure,analyticsLegend(costSegments),"")+analyticsChartCard("Warum haben sich die Kosten verändert?","Ursachenzerlegung zwischen Referenz- und aktueller Periode",waterfall,analyticsLegend([{key:"total",label:"Ausgang/Ende"},{key:"up",label:"Steigerung"},{key:"down",label:"Senkung"}]),"")+analyticsChartCard("Teilnehmer-Salden","Nachzahlung und Guthaben um eine Nulllinie",saldos,"","")+analyticsChartCard("Wasser nach Wohnung",latest.period.label,waterUnits,"","")+'</div>'+analyticsWaterEffectAnalysis(view)+analyticsPrepaymentAnalysis(view)+analyticsHousingAnalysis(view)+analyticsVacancyAnalysis(view)+analyticsUnallocatedAnalysis(view)+analyticsTenantMatrix(view)+analyticsCostMatrix(view)+analyticsMeterPanel(latest)+analyticsChangeSummary(view)+'<div class="analytics-two-column">'+analyticsAnomalyPanel(view)+analyticsDataQuality(view)+'</div>';
}
function analyticsCostMatrix(view){
  const models=view.models||[];const ids=new Map();models.forEach(m=>m.costs.filter(c=>c.active).forEach(c=>ids.set(c.costId,c.costName)));const heads=models.map(m=>'<th class="money">'+analyticsEsc(m.period.label)+'</th>').join('');
  const rows=Array.from(ids).map(([id,name])=>{const vals=models.map(m=>{const c=m.costs.find(r=>r.costId===id);return '<td class="money"><button class="analytics-cell-link" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"cost",key:id,periodId:m.period.periodId})+'\'>'+(c?analyticsMoney(c.total):'–')+'</button></td>';}).join('');const numbers=models.map(m=>{const c=m.costs.find(r=>r.costId===id);return c?c.total:null;}).filter(v=>v!==null);const avg=numbers.length?numbers.reduce((s,v)=>s+v,0)/numbers.length:0;const first=numbers[0]||0,last=numbers.at(-1)||0;return '<tr><th scope="row">'+analyticsEsc(name)+'</th>'+vals+'<td class="money">'+analyticsMoney(avg)+'</td><td class="money">'+analyticsMoneySigned(last-first)+'</td><td class="numeric">'+analyticsEsc(first?analyticsPercent((last-first)/Math.abs(first)*100):'–')+'</td></tr>';}).join('');
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Kostenmatrix</h2><p>Exakte Mehrjahreswerte mit Durchschnitt und Veränderung.</p></div></header><div class="nk-ui-table-wrap" tabindex="0"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Kostenart</th>'+heads+'<th class="money">Ø</th><th class="money">Δ €</th><th class="numeric">Δ %</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsTenantMatrix(view){
  const models=view.models||[];const ids=new Map();models.forEach(m=>m.tenants.forEach(t=>ids.set(t.tenantId,{name:t.name,unit:t.unitId,usage:t.usageLabel})));const heads=models.map(m=>'<th class="money">'+analyticsEsc(m.period.label)+'</th>').join('');
  const rows=Array.from(ids).map(([id,info])=>'<tr><th scope="row"><strong>'+analyticsEsc(info.name)+'</strong><small>'+analyticsEsc(info.unit)+' · '+analyticsEsc(info.usage)+'</small></th>'+models.map(m=>{const t=m.tenants.find(r=>r.tenantId===id);return '<td class="money">'+(t?'<button class="analytics-cell-link" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"tenant",key:id,periodId:m.period.periodId})+'\'>'+analyticsMoneySigned(t.balance)+'</button>':'–')+'</td>';}).join('')+'</tr>').join('');
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Teilnehmer-Saldoanalyse</h2><p>Reguläre Abrechnungsteilnehmer einschließlich Privat-/Eigennutzungskennzeichnung.</p></div></header><div class="nk-ui-table-wrap" tabindex="0"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Teilnehmer</th>'+heads+'</tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsMeterPanel(model){
  const m=model.meter;const w=model.water;const waterText=w.available?(w.houseTotal!==null?'Haus-/Unterzählerabgleich: Hausgesamtverbrauch '+analyticsNumber(w.houseTotal,2)+' m³ · Summe relevanter Unterzähler '+analyticsNumber(w.total,2)+' m³ · Differenz '+analyticsNumber(w.houseDifference,2)+' m³ ('+analyticsPercent(w.houseDifferencePercent)+'). Eine Differenz ist nicht automatisch ein Fehler.':'Summe relevanter Unterzähler '+analyticsNumber(w.total,2)+' m³. Ein belastbarer Hausgesamtverbrauch ist in diesem Snapshot nicht vorhanden; keine Differenz wird erfunden.') : analyticsEsc(w.reason);return '<section class="nk-ui-card analytics-meter-card"><header><div><h2>Zähler- und Messanalyse</h2><p>Vorhandene V99.4.69-Zählerarchitektur wird nur gelesen.</p></div>'+analyticsQualityBadge(model)+'</header><div class="analytics-meter-kpis">'+analyticsKpi("Zähler",String(m.meters),m.available?"Stammdaten":"nicht vorhanden")+analyticsKpi("Messwerte",String(m.readings),m.missingValues+' ohne Wert')+analyticsKpi("Messperioden",String(m.measurementPeriods),m.invalidPeriods+' problematisch')+analyticsKpi("Zuordnungen",String(m.assignments),"zeitabhängige Zuordnungen")+analyticsKpi("Zählerwechsel",String(m.replacements),"historisch erfasst")+'</div><p>'+waterText+'</p></section>';
}
function analyticsNkTable(view){return analyticsExactPeriodTable(view)+analyticsHousingAnalysis(view)+analyticsPrepaymentAnalysis(view)+analyticsVacancyAnalysis(view)+analyticsUnallocatedAnalysis(view)+analyticsCostMatrix(view)+analyticsTenantMatrix(view);}
function analyticsWaterEffectAnalysis(view){
  const cmp=analyticsComparison(view);if(!cmp||cmp.synthetic||!cmp.waterEffects)return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Wasser: Preis- und Verbrauchseffekt</h2><p>Eine belastbare Zerlegung ist nur möglich, wenn für beide Vergleichsperioden Verbrauch und Preis vorhanden sind.</p></div></header>'+analyticsEmpty("Zerlegung nicht berechenbar","Es werden keine fehlenden Werte geschätzt.")+'</section>';
  const e=cmp.waterEffects;return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Wasser: Preis- und Verbrauchseffekt</h2><p>'+analyticsEsc(cmp.from.label)+' → '+analyticsEsc(cmp.to.label)+' · '+analyticsEsc(e.method)+'</p></div></header><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Komponente</th><th class="money">Wirkung</th></tr></thead><tbody><tr><th scope="row">Verbrauchseffekt</th><td class="money">'+analyticsMoneySigned(e.consumptionEffect)+'</td></tr><tr><th scope="row">Preiseffekt</th><td class="money">'+analyticsMoneySigned(e.priceEffect)+'</td></tr><tr><th scope="row">sonstiger Verteil-/Struktureffekt</th><td class="money">'+analyticsMoneySigned(e.otherEffect)+'</td></tr><tr><th scope="row">Wasserkostenänderung gesamt</th><td class="money"><strong>'+analyticsMoneySigned(e.costDelta)+'</strong></td></tr></tbody></table></div></section>';
}
function analyticsPrepaymentAnalysis(view){
  const latest=analyticsLatest(view);if(!latest)return '';const tenants=analyticsFilteredTenants(latest);const rows=tenants.map(t=>'<tr><td><button class="analytics-cell-link" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"tenant",key:t.tenantId,periodId:latest.period.periodId})+'\'>'+analyticsEsc(t.name)+'</button></td><td>'+analyticsEsc(t.unitName||t.unitId)+'</td><td class="money">'+analyticsMoney(t.costShare)+'</td><td class="money">'+analyticsMoney(t.prepayments)+'</td><td class="money">'+analyticsMoneySigned(t.prepayments-t.costShare)+'</td></tr>').join('');
  const repeated=(latest.tenants||[]).filter(t=>{const hist=(view.models||[]).map(m=>m.tenants.find(x=>x.tenantId===t.tenantId)).filter(Boolean);return hist.length>=2&&hist.filter(x=>x.prepayments<x.costShare).length>=Math.min(3,hist.length);});
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Vorauszahlungsanalyse</h2><p>Tatsächlicher Kostenanteil und vorhandene Vorauszahlungen; keine automatische Anpassung.</p></div></header>'+(repeated.length?'<aside class="nk-ui-notice nk-ui-notice--warning" role="note">Analysehinweis: '+analyticsEsc(repeated.map(t=>t.name).join(', '))+' lagen in mehreren ausgewerteten Perioden mit den Vorauszahlungen unter dem jeweiligen Kostenanteil.</aside>':'')+'<div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Teilnehmer</th><th>Wohnung</th><th class="money">Kostenanteil</th><th class="money">Vorauszahlungen</th><th class="money">Deckung</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsHousingAnalysis(view){
  const latest=analyticsLatest(view);if(!latest)return '';let units=latest.units||[];if(analyticsUiState.unitId!=="all")units=units.filter(u=>u.unitId===analyticsUiState.unitId);const rows=units.map(u=>'<tr><td><button class="analytics-cell-link" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"unit",key:u.unitId,periodId:latest.period.periodId})+'\'>'+analyticsEsc(u.unitName)+'</button></td><td class="numeric">'+analyticsNumber(u.area,1)+' m²</td><td>'+analyticsEsc(u.participants.map(p=>p.name+(p.usage==="private"?' · '+p.usageLabel:'')).join(', ')||'–')+'</td><td class="money">'+analyticsMoney(u.participantCost)+'</td><td class="money">'+(u.costPerSqm===null?'–':analyticsNumber(u.costPerSqm,2)+' €')+'</td><td>'+(u.waterAvailable?analyticsNumber(u.water,2)+' m³':'–')+'</td><td>'+(u.vacancyDays===null?'Daten fehlen':String(u.vacancyDays))+'</td></tr>').join('');
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Wohnungsanalyse</h2><p>Wohnfläche, Teilnehmerhistorie, Kostenanteile, Verbrauch und belegungsbezogene Leerstandstage.</p></div></header><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Wohnung</th><th>Fläche</th><th>Teilnehmer / Nutzung</th><th class="money">Teilnehmerkosten</th><th class="money">€/m²</th><th>Wasser</th><th>Leerstandstage</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsVacancyAnalysis(view){
  const latest=analyticsLatest(view);if(!latest)return '';const costRows=latest.costs.filter(c=>Math.abs(c.vacancyShare)>.005);const periodRows=(view.models||[]).map(m=>'<tr><td>'+analyticsEsc(m.period.label)+'</td><td>'+(m.totals.vacancyDays===null?'Daten fehlen':m.totals.vacancyDays)+'</td><td class="money">'+analyticsMoney(m.totals.vacancyShare)+'</td><td class="money">'+(m.totals.vacancyCostPerDay===null?'–':analyticsMoney(m.totals.vacancyCostPerDay))+'</td></tr>').join('');const costs=costRows.map(c=>'<tr><td>'+analyticsEsc(c.costName)+'</td><td class="money">'+analyticsMoney(c.vacancyShare)+'</td></tr>').join('')||'<tr><td colspan="2">Keine kostenbezogenen Leerstandsanteile in dieser Periode.</td></tr>';
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Leerstandsanalyse</h2><p>Leerstand bleibt fachlich getrennt von Privat-/Eigennutzung.</p></div></header><div class="analytics-two-column"><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Periode</th><th>Leerstandstage</th><th class="money">Leerstandsanteile</th><th class="money">je Tag</th></tr></thead><tbody>'+periodRows+'</tbody></table></div><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Kostenart '+analyticsEsc(latest.period.label)+'</th><th class="money">Leerstand</th></tr></thead><tbody>'+costs+'</tbody></table></div></div></section>';
}
function analyticsUnallocatedAnalysis(view){
  const latest=analyticsLatest(view);if(!latest)return '';const rows=latest.costs.filter(c=>Math.abs(c.trueNonAllocable)>.005||Math.abs(c.actualUnallocated)>.005).map(c=>'<tr><td><button class="analytics-cell-link" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"cost",key:c.costId,periodId:latest.period.periodId})+'\'>'+analyticsEsc(c.costName)+'</button></td><td class="money">'+analyticsMoney(c.trueNonAllocable)+'</td><td class="money">'+analyticsMoney(c.actualUnallocated)+'</td><td>'+analyticsEsc(c.exclusionHandling||'–')+'</td></tr>').join('')||'<tr><td colspan="4">Keine Beträge in diesen beiden Gruppen vorhanden.</td></tr>';
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Nicht umlagefähig versus nicht umgelegt</h2><p>Echte fachliche Nichtumlagefähigkeit und grundsätzlich umlagefähige, tatsächlich nicht umgelegte Kosten bleiben getrennt.</p></div></header><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Kostenart</th><th class="money">echt nicht umlagefähig</th><th class="money">umlagefähig, nicht umgelegt</th><th>Behandlung</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsExactPeriodTable(view){
  const rows=(view.models||[]).map(m=>'<tr><td><button class="analytics-cell-link" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"period",key:m.period.periodId,periodId:m.period.periodId})+'\'>'+analyticsEsc(m.period.label)+'</button></td><td>'+analyticsEsc(m.period.start||'–')+'</td><td>'+analyticsEsc(m.period.end||'–')+'</td><td>'+analyticsEsc(m.period.source)+'</td><td>'+analyticsEsc(m.period.archiveStatus)+'</td><td>'+analyticsEsc(m.period.snapshotStatus)+'</td><td>'+analyticsQualityBadge(m)+'</td><td class="money">'+analyticsMoney(m.totals.totalCosts)+'</td><td class="money">'+analyticsMoney(m.totals.participantShare)+'</td><td class="money">'+analyticsMoney(m.totals.privateShare)+'</td><td class="money">'+analyticsMoney(m.totals.vacancyShare)+'</td></tr>').join('');
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Perioden- und Herkunftstabelle</h2><p>Periodenidentität, Quelle, Status und zentrale Summen.</p></div></header><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Periode</th><th>Beginn</th><th>Ende</th><th>Datenquelle</th><th>Status</th><th>Snapshot</th><th>Datenqualität</th><th class="money">Kosten</th><th class="money">Teilnehmer</th><th class="money">Privat</th><th class="money">Leerstand</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsFinanceDashboard(view){
  const latest=analyticsLatest(view);if(!latest)return analyticsEmpty("Keine Daten","");const f=latest.financial;const cmp=analyticsComparison(view);const base=cmp&&!cmp.synthetic?analyticsModelByPeriod(view,cmp.from.periodId):null;const resultDelta=base?f.operatingResult-base.financial.operatingResult:null;const maintenance=latest.costs.filter(r=>/reparatur|instandhalt/i.test(r.costName)).reduce((z,r)=>z+r.total,0);const costRatio=f.objectIncome?f.actualCosts/f.objectIncome*100:null;
  const k='<section class="analytics-center-kpis">'+analyticsKpi("Einnahmen gesamt",analyticsMoney(f.objectIncome),"Kaltmiete tatsächlich erhalten + NK-Vorauszahlungen")+analyticsKpi("Ausgaben gesamt",analyticsMoney(f.actualCosts),"vorhandene Objektkosten der Periode")+analyticsKpi("Objektüberschuss/-defizit",analyticsMoneySigned(f.operatingResult),(resultDelta===null?"kein steuerlicher Gewinnbegriff":"Veränderung zur Referenz "+analyticsMoneySigned(resultDelta)),f.operatingResult>=0?"success":"warning")+analyticsKpi("Cashflow",f.cashflowComplete?analyticsMoneySigned(f.cashflow):"Daten fehlen",f.cashflowReason,f.cashflowComplete?"success":"warning")+analyticsKpi("Mietausfall / Soll-Ist",analyticsMoney(f.rentShortfall),"Kaltmiete Soll minus tatsächlich erhalten")+analyticsKpi("Leerstandskosten",analyticsMoney(latest.totals.vacancyShare),"NK-bezogene Leerstandsanteile")+analyticsKpi("Instandhaltung / Reparaturen",analyticsMoney(maintenance),"nur vorhandene Kostenpositionen")+analyticsKpi("Kostenquote",costRatio===null?"Daten fehlen":analyticsPercent(costRatio),"Ausgaben im Verhältnis zu vorhandenen Einnahmen")+analyticsKpi("Ø Monat Objektergebnis",latest.period.quality.calendar?analyticsMoneySigned(f.operatingResult/12):"nicht eindeutig","nur bei eindeutigem Kalenderjahr")+analyticsKpi("Einnahmen je m²",latest.totals.totalArea?analyticsNumber(f.objectIncome/latest.totals.totalArea,2)+' €':"Daten fehlen","Periodenwert")+analyticsKpi("Ausgaben je m²",latest.totals.totalArea?analyticsNumber(f.actualCosts/latest.totals.totalArea,2)+' €':"Daten fehlen","Periodenwert")+'</section>';
  const bars=analyticsSvgGroupedBars(view.models,[{key:"income",label:"Einnahmen",value:m=>m.financial.objectIncome},{key:"expense",label:"Ausgaben",value:m=>m.financial.actualCosts}],analyticsMoney,{ariaLabel:"Einnahmen und Ausgaben"});
  const result=analyticsSvgLine(view.models,m=>m.financial.operatingResult,analyticsMoneySigned,"period",{zeroBase:false,ariaLabel:"Objektergebnis"});
  return k+'<div class="analytics-chart-grid">'+analyticsChartCard("Einnahmen versus Ausgaben","Periodenbezogene Werte; kein fiktiver Cashflow",bars,analyticsLegend([{key:"income",label:"Einnahmen"},{key:"expense",label:"Ausgaben"}]),"")+analyticsChartCard("Objektergebnis","Objektüberschuss/-defizit mit Nulllinie",result,"","")+'</div>'+analyticsFinanceDataGap(view)+analyticsDataQuality(view);
}
function analyticsFinanceDataGap(view){
  const latest=analyticsLatest(view);if(!latest)return '';const f=latest.financial;return '<section class="nk-ui-card analytics-gap-card"><header><div><h2>Cashflow-Datenlage</h2><p>Cashflow wird ausschließlich aus zeitlich zuordenbaren Zahlungsdaten berechnet.</p></div></header><div class="analytics-gap-status '+(f.cashflowComplete?'is-complete':'is-open')+'"><strong>'+(f.cashflowComplete?'Cashflow berechenbar':'Daten fehlen')+'</strong><span>'+analyticsEsc(f.cashflowReason||'Vollständige datierte Ein- und Auszahlungen vorhanden.')+'</span></div><p>Datierte Zahlungsdatensätze im ausgewählten Endzeitraum: '+f.datedPayments.length+'. Sollmieten und Soll-Vorauszahlungen werden nicht als tatsächliche Zahlungszeitpunkte interpretiert.</p></section>';
}
function analyticsFinanceDetail(view){
  const latest=analyticsLatest(view);if(!latest)return '';const f=latest.financial;
  const income=analyticsSvgGroupedBars(view.models,[{key:"rent",label:"Kaltmiete erhalten",value:m=>m.financial.rentReceived},{key:"prepayment",label:"NK-Vorauszahlungen",value:m=>m.financial.nkPrepayments}],analyticsMoney);
  const expense=analyticsSvgStackedBars(view.models,[{key:"nk",label:"NK-abrechnungsrelevant"},{key:"owner",label:"sonstige Objektkosten"}],(m,s)=>s.key==="nk"?m.costs.filter(c=>c.active).reduce((z,c)=>z+c.total,0):m.costs.filter(c=>!c.active).reduce((z,c)=>z+c.total,0),analyticsMoney);
  return '<div class="analytics-chart-grid">'+analyticsChartCard("Einnahmenstruktur","Tatsächlich erhaltene Kaltmiete und periodische NK-Vorauszahlungen",income,analyticsLegend([{key:"rent",label:"Kaltmiete erhalten"},{key:"prepayment",label:"NK-Vorauszahlungen"}]),"")+analyticsChartCard("Ausgabenstruktur","Abrechnungsrelevante und sonstige vorhandene Objektkosten",expense,analyticsLegend([{key:"nk",label:"NK-relevant"},{key:"owner",label:"sonstige Objektkosten"}]),"")+'</div>'+analyticsFinanceTable(view)+analyticsFinanceDataGap(view)+analyticsDataQuality(view);
}
function analyticsFinanceTable(view){
  const rows=(view.models||[]).map(m=>{const f=m.financial;return '<tr><td>'+analyticsEsc(m.period.label)+'</td><td class="money">'+analyticsMoney(f.rentTarget)+'</td><td class="money">'+analyticsMoney(f.rentReceived)+'</td><td class="money">'+analyticsMoney(f.nkPrepayments)+'</td><td class="money">'+analyticsMoney(f.objectIncome)+'</td><td class="money">'+analyticsMoney(f.actualCosts)+'</td><td class="money">'+analyticsMoneySigned(f.operatingResult)+'</td><td>'+ (f.cashflowComplete?analyticsMoneySigned(f.cashflow):'<span class="analytics-data-missing">Daten fehlen</span>')+'</td></tr>';}).join('');
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Finanzielle Mehrjahrestabelle</h2><p>Soll, Ist und periodisches Objektergebnis klar getrennt.</p></div></header><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Periode</th><th class="money">Kaltmiete Soll</th><th class="money">Kaltmiete erhalten</th><th class="money">NK-Voraus</th><th class="money">Einnahmen</th><th class="money">Ausgaben</th><th class="money">Objektergebnis</th><th>Cashflow</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsTaxDashboard(view){
  const latest=analyticsLatest(view);if(!latest)return '';const taxRows=latest.tax;const privateTotal=taxRows.reduce((s,r)=>s+analyticsNum(r.private),0),rented=taxRows.reduce((s,r)=>s+analyticsNum(r.rented),0),vacancy=taxRows.reduce((s,r)=>s+analyticsNum(r.vacancy),0),unclassified=taxRows.filter(r=>r.taxStatus!=="klassifiziert").length;
  const k='<section class="analytics-center-kpis">'+analyticsKpi("Vorhandene Einnahmewerte",analyticsMoney(latest.financial.objectIncome),"noch keine automatische steuerrechtliche Qualifikation")+analyticsKpi("Relevante Objektkostenbasis",analyticsMoney(taxRows.reduce((z,r)=>z+r.total,0)),"aus NK-Pro vorhandene Kostenpositionen")+analyticsKpi("Vermieteter Kostenanteil",analyticsMoney(rented),"aus regulärer Teilnehmerverteilung abgeleitet")+analyticsKpi("Privatanteil",analyticsMoney(privateTotal),"aus Nutzungskennzeichnung identifiziert; NK-Berechnung unverändert")+analyticsKpi("Leerstandsanteil",analyticsMoney(vacancy),"separat von Privatnutzung")+analyticsKpi("Echte nicht umlagefähige Kosten",analyticsMoney(latest.totals.trueNonAllocable),"fachlich getrennte Kostenbasis")+analyticsKpi("Umlagefähig, aber nicht umgelegt",analyticsMoney(latest.totals.unallocatedAllocable),"nicht pauschal Vermieterkosten")+analyticsKpi("Reparatur / Instandhaltung",analyticsMoney(latest.costs.filter(r=>/reparatur|instandhalt/i.test(r.costName)).reduce((z,r)=>z+r.total,0)),"nur vorhandene Kostenpositionen")+analyticsKpi("Nicht klassifizierte Positionen",String(unclassified),"keine steuerliche Annahme ohne Regel","warning")+analyticsKpi("Datenvollständigkeit",analyticsEsc(latest.period.quality.status),latest.period.quality.issues.length+' Hinweise',latest.period.quality.status==="vollständig"?"success":"warning")+'</section>';
  const seg=[{key:"rented",label:"Vermietet"},{key:"private",label:"Privat"},{key:"vacancy",label:"Leerstand"},{key:"other",label:"Sonstige"}];
  const stack=analyticsSvgStackedBars(view.models,seg,(m,s)=>m.tax.reduce((z,r)=>z+analyticsNum(r[s.key]),0),analyticsMoney,{ariaLabel:"Nutzungskostenaufteilung"});
  const privateRanking=analyticsSvgHorizontalRanking(latest.tax.map(r=>Object.assign({},r,{periodId:latest.period.periodId})),r=>analyticsNum(r.private),analyticsMoney,"cost",r=>r.costId);
  return k+'<div class="analytics-chart-grid">'+analyticsChartCard("Nutzungskostenaufteilung","Vermietet, Privat, Leerstand und sonstige Zuordnung",stack,analyticsLegend(seg),"")+analyticsChartCard("Privatanteil nach Kostenarten",latest.period.label,privateRanking,"","")+'</div>'+analyticsTaxNotice()+analyticsTaxTransitionTable(view)+analyticsDataQuality(view);
}
function analyticsTaxNotice(){return '<aside class="nk-ui-notice nk-ui-notice--info analytics-tax-notice" role="note"><strong>Steuerliche Auswertung – keine Steuerberatung</strong><span>NK-Pro bereitet vorhandene Objektwerte nachvollziehbar auf. Eine steuerliche Weiterverarbeitung wird nur ausgewiesen, wenn eine explizite fachliche Regel hinterlegt ist; andernfalls bleibt die Position „noch nicht steuerlich klassifiziert“.</span></aside>';}
function analyticsTaxTransitionTable(view){
  const latest=analyticsLatest(view);if(!latest)return '';const rows=latest.tax.map(r=>'<tr><td><button class="analytics-cell-link" data-ui-action="analytics.openDrill" data-ui-keydown="analytics.openDrill" data-ui-key="Enter" data-ui-args=\''+analyticsArgs({type:"tax-cost",key:r.costId,periodId:r.periodId})+'\'>'+analyticsEsc(r.costName)+'</button></td><td class="money">'+analyticsMoney(r.total)+'</td><td class="money">'+(r.rented===null?'–':analyticsMoney(r.rented))+'</td><td class="money">'+(r.private===null?'–':analyticsMoney(r.private))+'</td><td class="money">'+(r.vacancy===null?'–':analyticsMoney(r.vacancy))+'</td><td class="money">'+analyticsMoney(r.other)+'</td><td><span class="analytics-tax-unclassified">'+analyticsEsc(r.taxStatus)+'</span></td></tr>').join('');
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Steuerliche Kostenüberleitung</h2><p>Gesamtkosten → vermietet → privat → Leerstand → sonstige Zuordnung.</p></div></header><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Kostenart</th><th class="money">Gesamt</th><th class="money">Vermietet</th><th class="money">Privat</th><th class="money">Leerstand</th><th class="money">Sonstige</th><th>steuerliche Aufbereitung</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsTaxDetail(view){return analyticsTaxDashboard(view)+analyticsTaxMultiYearMatrix(view);}
function analyticsTaxMultiYearMatrix(view){
  const positions=[{key:"income",label:"Vorhandene Einnahmewerte",fn:m=>m.financial.objectIncome},{key:"prepayments",label:"NK-Vorauszahlungen",fn:m=>m.financial.nkPrepayments},{key:"costs",label:"Betriebskosten / Objektkostenbasis",fn:m=>m.tax.reduce((z,r)=>z+r.total,0)},{key:"unallocated",label:"Umlagefähig, aber nicht umgelegt",fn:m=>m.totals.unallocatedAllocable},{key:"nonallocable",label:"Echte nicht umlagefähige Kosten",fn:m=>m.totals.trueNonAllocable},{key:"private",label:"Privatanteil",fn:m=>m.tax.reduce((s,r)=>s+analyticsNum(r.private),0)},{key:"vacancy",label:"Leerstandsanteil",fn:m=>m.tax.reduce((s,r)=>s+analyticsNum(r.vacancy),0)},{key:"grundsteuer",label:"Grundsteuer",fn:m=>m.costs.filter(r=>/grundsteuer/i.test(r.costName)).reduce((z,r)=>z+r.total,0)},{key:"versicherung",label:"Versicherungen",fn:m=>m.costs.filter(r=>/versicherung/i.test(r.costName)).reduce((z,r)=>z+r.total,0)},{key:"strom",label:"Allgemeinstrom",fn:m=>m.costs.filter(r=>/allgemeinstrom|beleuchtung/i.test(r.costName)).reduce((z,r)=>z+r.total,0)},{key:"schornstein",label:"Schornstein",fn:m=>m.costs.filter(r=>/schornstein/i.test(r.costName)).reduce((z,r)=>z+r.total,0)},{key:"repairs",label:"Reparaturen / Instandhaltung",fn:m=>m.costs.filter(r=>/reparatur|instandhalt/i.test(r.costName)).reduce((z,r)=>z+r.total,0)}];
  const heads=(view.models||[]).map(m=>'<th class="money">'+analyticsEsc(m.period.label)+'</th>').join('');const rows=positions.map(p=>'<tr><th scope="row">'+analyticsEsc(p.label)+'</th>'+(view.models||[]).map(m=>'<td class="money">'+analyticsMoney(p.fn(m))+'</td>').join('')+'</tr>').join('');
  return '<section class="nk-ui-card analytics-table-card"><header><div><h2>Steuerliche Mehrjahresmatrix</h2><p>Nur aus vorhandenen Daten abgeleitete Werte; keine fiktive steuerliche Klassifikation.</p></div></header><div class="nk-ui-table-wrap"><table class="nk-ui-table nk-ui-table--compact"><thead><tr><th>Position</th>'+heads+'</tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function analyticsTaxTable(view){return analyticsTaxMultiYearMatrix(view)+analyticsTaxTransitionTable(view)+analyticsExactPeriodTable(view);}
function analyticsDrillPanel(view){
  const d=analyticsUiState.detail;if(!d)return '';const model=analyticsModelByPeriod(view,d.periodId)||analyticsLatest(view);if(!model)return '';
  let title="Details",body='';
  if(d.type==="period"){
    title='Periode '+model.period.label;body='<dl><div><dt>periodId</dt><dd>'+analyticsEsc(model.period.periodId)+'</dd></div><div><dt>Beginn / Ende</dt><dd>'+analyticsEsc(model.period.start)+' – '+analyticsEsc(model.period.end)+'</dd></div><div><dt>Datenquelle</dt><dd>'+analyticsEsc(model.period.source)+'</dd></div><div><dt>Status</dt><dd>'+analyticsEsc(model.period.archiveStatus)+' · '+analyticsEsc(model.period.snapshotStatus)+'</dd></div><div><dt>Datenqualität</dt><dd>'+analyticsEsc(model.period.quality.status)+' · '+model.period.quality.score+'/100</dd></div></dl><ul>'+model.period.quality.issues.map(i=>'<li>'+analyticsEsc(i)+'</li>').join('')+'</ul>';
  } else if(d.type==="cost"||d.type==="tax-cost"){
    const c=model.costs.find(r=>r.costId===d.key);const t=model.tax.find(r=>r.costId===d.key);title=c?c.costName:'Kostenart';if(c)body='<dl><div><dt>Gesamtbetrag</dt><dd>'+analyticsMoney(c.total)+'</dd></div><div><dt>Umlageschlüssel</dt><dd>'+analyticsEsc(c.allocationKey)+'</dd></div><div><dt>Teilnehmeranteile</dt><dd>'+analyticsMoney(c.tenantShare)+'</dd></div><div><dt>davon Privat</dt><dd>'+analyticsMoney(c.privateShare)+'</dd></div><div><dt>Leerstand</dt><dd>'+analyticsMoney(c.vacancyShare)+'</dd></div><div><dt>echter Eigentümeranteil</dt><dd>'+analyticsMoney(c.documentedOwnerShare)+'</dd></div><div><dt>nicht umgelegt</dt><dd>'+analyticsMoney(c.actualUnallocated)+'</dd></div><div><dt>Preis je Einheit</dt><dd>'+(c.pricePerUnit===null?'–':analyticsNumber(c.pricePerUnit,3)+' €')+'</dd></div><div><dt>Berechnungsstatus</dt><dd>'+analyticsEsc(c.calculationStatus)+'</dd></div><div><dt>Herkunft / Nachweis</dt><dd>'+analyticsEsc(c.source||model.period.source)+'</dd></div></dl>'+(t?'<p><strong>Steuerliche Aufbereitung:</strong> '+analyticsEsc(t.taxStatus)+'. Die reguläre NK-Teilnehmerberechnung wird dadurch nicht verändert.</p>':'');
  } else if(d.type==="tenant"){
    const t=model.tenants.find(r=>r.tenantId===d.key);title=t?t.name:'Teilnehmer';if(t)body='<dl><div><dt>Teilnehmer-ID</dt><dd>'+analyticsEsc(t.tenantId)+'</dd></div><div><dt>Wohnung</dt><dd>'+analyticsEsc(t.unitId)+' · '+analyticsEsc(t.unitName)+'</dd></div><div><dt>Nutzungsart</dt><dd>'+analyticsEsc(t.usageLabel)+'</dd></div><div><dt>Aktiver Zeitraum</dt><dd>'+analyticsEsc(t.start)+' – '+analyticsEsc(t.end||'offen')+'</dd></div><div><dt>Kostenanteil</dt><dd>'+analyticsMoney(t.costShare)+'</dd></div><div><dt>Vorauszahlungen</dt><dd>'+analyticsMoney(t.prepayments)+'</dd></div><div><dt>Korrekturen</dt><dd>'+analyticsMoney(t.correction)+'</dd></div><div><dt>Saldo</dt><dd>'+analyticsMoneySigned(t.balance)+'</dd></div><div><dt>Kaltmiete Soll / erhalten</dt><dd>'+analyticsMoney(t.coldRentTarget)+' / '+analyticsMoney(t.coldRentReceived)+'</dd></div></dl>';
  } else if(d.type==="water"){
    title='Wasser '+model.period.label;body=model.water.available?'<dl><div><dt>Kaltwasser</dt><dd>'+analyticsNumber(model.water.cold,2)+' m³</dd></div><div><dt>Warmwasser</dt><dd>'+analyticsNumber(model.water.warm,2)+' m³</dd></div><div><dt>Gesamt</dt><dd>'+analyticsNumber(model.water.total,2)+' m³</dd></div><div><dt>Preis je Einheit</dt><dd>'+(model.waterPrice===null?'–':analyticsNumber(model.waterPrice,3)+' €')+'</dd></div><div><dt>Datenquelle</dt><dd>'+analyticsEsc(model.water.source)+'</dd></div></dl>':'<p>'+analyticsEsc(model.water.reason)+'</p>';
  } else if(d.type==="unit"){
    const u=(model.units||[]).find(r=>r.unitId===d.key);title=u?u.unitName:'Wohnung';if(u)body='<dl><div><dt>Wohnfläche</dt><dd>'+analyticsNumber(u.area,1)+' m²</dd></div><div><dt>Teilnehmer / Nutzung</dt><dd>'+analyticsEsc(u.participants.map(p=>p.name+' · '+p.usageLabel).join(', ')||'–')+'</dd></div><div><dt>Teilnehmerkosten</dt><dd>'+analyticsMoney(u.participantCost)+'</dd></div><div><dt>Vorauszahlungen</dt><dd>'+analyticsMoney(u.prepayments)+'</dd></div><div><dt>Saldo</dt><dd>'+analyticsMoneySigned(u.balance)+'</dd></div><div><dt>Leerstandstage</dt><dd>'+(u.vacancyDays===null?'Daten fehlen':u.vacancyDays)+'</dd></div><div><dt>Kaltwasser</dt><dd>'+(u.waterAvailable?analyticsNumber(u.coldWater,2)+' m³':'–')+'</dd></div><div><dt>Warmwasser</dt><dd>'+(u.waterAvailable?analyticsNumber(u.warmWater,2)+' m³':'–')+'</dd></div><div><dt>Wasser gesamt</dt><dd>'+(u.waterAvailable?analyticsNumber(u.water,2)+' m³':'–')+'</dd></div><div><dt>Datenquelle Wasser</dt><dd>'+analyticsEsc(model.water.source||'–')+'</dd></div></dl>';
  }
  if(!body)body='<p>Für diesen Drill-down sind in der gewählten Periode keine Detaildaten vorhanden.</p>';
  return '<aside class="analytics-drill-panel nk-ui-card" aria-live="polite"><header><div><p>Drill-down · '+analyticsEsc(model.period.label)+'</p><h2>'+analyticsEsc(title)+'</h2></div><button class="secondary" data-ui-action="analytics.closeDrill" type="button" aria-label="Detailbereich schließen">Schließen</button></header>'+body+'</aside>';
}
function analyticsMainContent(view){
  if(analyticsUiState.perspective==="finance")return analyticsUiState.level==="dashboard"?analyticsFinanceDashboard(view):(analyticsUiState.level==="detail"?analyticsFinanceDetail(view):analyticsFinanceTable(view));
  if(analyticsUiState.perspective==="tax")return analyticsUiState.level==="dashboard"?analyticsTaxDashboard(view):(analyticsUiState.level==="detail"?analyticsTaxDetail(view):analyticsTaxTable(view));
  return analyticsUiState.level==="dashboard"?analyticsNkDashboard(view):(analyticsUiState.level==="detail"?analyticsNkDetail(view):analyticsNkTable(view));
}
function renderAnalyticsCenter(){
  const root=document.getElementById("analyticsCenterRoot");if(!root)return;analyticsEnsureRange();const view=analyticsView();
  root.innerHTML='<div class="analytics-center-top">'+analyticsPerspectiveTabs()+analyticsExportBar()+'</div>'+analyticsFilterToolbar(view)+analyticsLevelTabs()+'<div class="analytics-main-content">'+analyticsMainContent(view)+'</div>'+analyticsDrillPanel(view);
  const title=document.querySelector('#auswertungen .page-header__title');if(title)title.textContent='Mehrjahres-Analysezentrum';
  const desc=document.querySelector('#auswertungen .page-header__description');if(desc)desc.textContent='Nebenkosten, Finanzen und steuerliche Aufbereitung auf einer gemeinsamen, rein lesenden Datenbasis.';
}
function analyticsSetPerspective(value){analyticsUiState.perspective=analyticsText(value)||"nk";analyticsUiState.detail=null;renderAnalyticsCenter();}
function analyticsSetLevel(value){analyticsUiState.level=analyticsText(value)||"dashboard";renderAnalyticsCenter();}
function analyticsSetFromPeriod(value){analyticsUiState.fromPeriodId=analyticsText(value);renderAnalyticsCenter();}
function analyticsSetToPeriod(value){analyticsUiState.toPeriodId=analyticsText(value);renderAnalyticsCenter();}
function analyticsSetComparison(value){analyticsUiState.comparison=analyticsText(value);renderAnalyticsCenter();}
function analyticsSetReferencePeriod(value){analyticsUiState.referencePeriodId=analyticsText(value);renderAnalyticsCenter();}
function analyticsSetCost(value){analyticsUiState.costId=analyticsText(value)||"all";renderAnalyticsCenter();}
function analyticsSetTenant(value){analyticsUiState.tenantId=analyticsText(value)||"all";renderAnalyticsCenter();}
function analyticsSetUnit(value){analyticsUiState.unitId=analyticsText(value)||"all";renderAnalyticsCenter();}
function analyticsSetUsage(value){analyticsUiState.usage=analyticsText(value)||"all";renderAnalyticsCenter();}
function analyticsSetCostArea(value){analyticsUiState.costArea=analyticsText(value)||"all";renderAnalyticsCenter();}
function analyticsSetAllocationKey(value){analyticsUiState.allocationKey=analyticsText(value)||"all";renderAnalyticsCenter();}
function analyticsSetStatus(value){analyticsUiState.status=analyticsText(value)||"all";renderAnalyticsCenter();}
function analyticsSetDataQuality(value){analyticsUiState.dataQuality=analyticsText(value)||"all";renderAnalyticsCenter();}
function analyticsToggleOpenChecks(value){analyticsUiState.onlyOpenChecks=!!value;renderAnalyticsCenter();}
function analyticsSetDisplayMode(value){analyticsUiState.displayMode=analyticsText(value)||"total";renderAnalyticsCenter();}
function analyticsToggleAnomalies(value){analyticsUiState.onlyAnomalies=!!value;renderAnalyticsCenter();}
function analyticsQuickRange(mode){
  const periods=analyticsAvailablePeriods();if(!periods.length)return;const m=analyticsText(mode);if(m==="current"){const p=periods.find(x=>x.origin==="current")||periods.at(-1);analyticsUiState.fromPeriodId=p.periodId;analyticsUiState.toPeriodId=p.periodId;}else if(m==="last3"){analyticsUiState.fromPeriodId=periods[Math.max(0,periods.length-3)].periodId;analyticsUiState.toPeriodId=periods.at(-1).periodId;}else{analyticsUiState.fromPeriodId=periods[0].periodId;analyticsUiState.toPeriodId=periods.at(-1).periodId;}renderAnalyticsCenter();
}
function analyticsOpenDrill(payload){let data=payload;if(Array.isArray(payload))data=payload[0];if(typeof data==="string"){try{data=JSON.parse(data);}catch(_){data={type:"period",key:data,periodId:data};}}analyticsUiState.detail=data&&typeof data==="object"?data:null;renderAnalyticsCenter();}
function analyticsCloseDrill(){analyticsUiState.detail=null;renderAnalyticsCenter();}
function analyticsExportMeta(view){return [['Auswertungsart',analyticsUiState.perspective],['Darstellung',analyticsUiState.level],['Zeitraum',(view.models||[]).map(m=>m.period.label).join(' bis ')],['Vergleich',analyticsUiState.comparison],['Kostenart',analyticsUiState.costId],['Teilnehmer',analyticsUiState.tenantId],['Wohnung',analyticsUiState.unitId],['Nutzungsart',analyticsUiState.usage],['Kostenbereich',analyticsUiState.costArea],['Umlageschlüssel',analyticsUiState.allocationKey],['Status',analyticsUiState.status],['Datenvollständigkeit',analyticsUiState.dataQuality],['nur offene Prüfungen',analyticsUiState.onlyOpenChecks?'Ja':'Nein'],['Erstellt',new Date().toISOString()],['NK-Pro-Version',APP_VERSION],['Datenqualität',(view.models||[]).map(m=>m.period.label+': '+m.period.quality.status).join(' | ')]];}
function analyticsCsvEscape(v){const s=String(v??'');return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function analyticsExportRows(view){
  const rows=[...analyticsExportMeta(view),[]];
  if(analyticsUiState.perspective==="finance"){
    rows.push(['Periode','Kaltmiete Soll','Kaltmiete erhalten','NK-Vorauszahlungen','Einnahmen','Ausgaben','Objektergebnis','Cashflow','Cashflow-Status']);(view.models||[]).forEach(m=>rows.push([m.period.label,m.financial.rentTarget,m.financial.rentReceived,m.financial.nkPrepayments,m.financial.objectIncome,m.financial.actualCosts,m.financial.operatingResult,m.financial.cashflow===null?'':m.financial.cashflow,m.financial.cashflowComplete?'berechenbar':m.financial.cashflowReason]));
  } else if(analyticsUiState.perspective==="tax"){
    rows.push(['Periode','Kostenart','Gesamt','Vermietet','Privat','Leerstand','Sonstige','steuerliche Aufbereitung','Umlageschlüssel','Datenquelle']);(view.models||[]).forEach(m=>m.tax.forEach(r=>rows.push([m.period.label,r.costName,r.total,r.rented??'',r.private??'',r.vacancy??'',r.other,r.taxStatus,r.allocationKey,r.source])));
  } else {
    rows.push(['Periode','Kostenart','Gesamt','Teilnehmer','Privat','Leerstand','echte nicht umlagefähig','nicht umgelegt','Umlageschlüssel','Status']);(view.models||[]).forEach(m=>m.costs.filter(c=>c.active).forEach(c=>rows.push([m.period.label,c.costName,c.total,c.tenantShare,c.privateShare,c.vacancyShare,c.trueNonAllocable,c.actualUnallocated,c.allocationKey,c.calculationStatus])));
    rows.push([]);rows.push(['Periode','Teilnehmer','Wohnung','Nutzungsart','Kostenanteil','Vorauszahlungen','Korrektur','Saldo']);(view.models||[]).forEach(m=>m.tenants.forEach(t=>rows.push([m.period.label,t.name,t.unitId,t.usageLabel,t.costShare,t.prepayments,t.correction,t.balance])));
  }
  return rows;
}
function analyticsExportCsv(){const view=analyticsView();const content=analyticsExportRows(view).map(r=>r.map(analyticsCsvEscape).join(';')).join('\n');NK_PRO_MODULES.exportService.download('NK-Pro_Analyse_'+analyticsUiState.perspective+'_'+APP_VERSION+'_'+new Date().toISOString().slice(0,10)+'.csv',content,'text/csv;charset=utf-8');}
function analyticsXmlCell(value,type){const t=type||((typeof value==='number')?'Number':'String');return '<Cell><Data ss:Type="'+t+'">'+analyticsEsc(value)+'</Data></Cell>';}
function analyticsXmlSheet(name,rows){return '<Worksheet ss:Name="'+analyticsEsc(name.slice(0,31))+'"><Table>'+rows.map(row=>'<Row>'+row.map(v=>analyticsXmlCell(v)).join('')+'</Row>').join('')+'</Table></Worksheet>';}
function analyticsExportExcel(){
  const view=analyticsView();const meta=analyticsExportMeta(view);const sheets=[analyticsXmlSheet('Übersicht',meta)];
  if(analyticsUiState.perspective==='tax'){
    const all=view.models.flatMap(m=>m.tax.map(r=>[m.period.label,r.costName,r.total,r.rented??'',r.private??'',r.vacancy??'',r.other,r.taxStatus,r.allocationKey,r.source]));
    sheets.push(analyticsXmlSheet('Einnahmen',[['Periode','Kaltmiete Soll','Kaltmiete erhalten','NK-Vorauszahlungen','Vorhandene Einnahmenwerte'],...view.models.map(m=>[m.period.label,m.financial.rentTarget,m.financial.rentReceived,m.financial.nkPrepayments,m.financial.objectIncome])]));
    sheets.push(analyticsXmlSheet('Kosten',[['Periode','Kostenart','Gesamt','Vermietet','Privat','Leerstand','Sonstige','Steuerstatus','Umlageschlüssel','Quelle'],...all]));
    sheets.push(analyticsXmlSheet('Kostenarten',[['Periode','ID','Kostenart','Bereich','NK-relevant','Umlageschlüssel','Behandlung','Steuerklassifikation'],...view.models.flatMap(m=>m.costs.map(c=>[m.period.label,c.costId,c.costName,c.area,c.active?'Ja':'Nein',c.allocationKey,c.exclusionHandling,'noch nicht steuerlich klassifiziert']))]));
    sheets.push(analyticsXmlSheet('Privatanteil',[['Periode','Kostenart','Privatanteil'],...view.models.flatMap(m=>m.tax.filter(r=>analyticsNum(r.private)!==0).map(r=>[m.period.label,r.costName,r.private]))]));
    sheets.push(analyticsXmlSheet('Leerstand',[['Periode','Kostenart','Leerstandsanteil'],...view.models.flatMap(m=>m.tax.filter(r=>analyticsNum(r.vacancy)!==0).map(r=>[m.period.label,r.costName,r.vacancy]))]));
    sheets.push(analyticsXmlSheet('Berechnungsnachweise',[['Periode','Kostenart','Regel','Umlageschlüssel','Quelle'],...view.models.flatMap(m=>m.tax.map(r=>[m.period.label,r.costName,r.usageRule,r.allocationKey,r.source]))]));
    sheets.push(analyticsXmlSheet('Datenquellen',[['Periode','periodId','Quelle','Status','Datenqualität'],...view.models.map(m=>[m.period.label,m.period.periodId,m.period.source,m.period.archiveStatus,m.period.quality.status])]));
  } else sheets.push(analyticsXmlSheet(analyticsUiState.perspective==='finance'?'Finanzen':'Analysewerte',analyticsExportRows(view).filter(r=>r.length)));
  const xml='<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'+sheets.join('')+'</Workbook>';
  NK_PRO_MODULES.exportService.download('NK-Pro_Analyse_'+analyticsUiState.perspective+'_'+APP_VERSION+'.xml',xml,'application/vnd.ms-excel;charset=utf-8');
}
function analyticsPrint(){
  const view=analyticsView();const title=analyticsUiState.perspective==='tax'?'Steuerliche Auswertung':(analyticsUiState.perspective==='finance'?'Finanzanalyse':'Nebenkosten & Abrechnung');const rows=analyticsExportRows(view).filter(r=>r.length);const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><title>'+analyticsEsc(title)+'</title><style>body{font-family:Segoe UI,Arial,sans-serif;color:#182230;padding:24px}h1{font-size:22px}table{border-collapse:collapse;width:100%;font-size:11px;margin:16px 0}td,th{border:1px solid #ccd3dc;padding:6px;text-align:left}tr:first-child{font-weight:700;background:#f3f5f8}.meta{font-size:11px;color:#566273}</style></head><body><h1>NK-Pro · '+analyticsEsc(title)+'</h1><p class="meta">'+analyticsEsc((view.models||[]).map(m=>m.period.label).join(' · '))+' · '+analyticsEsc(APP_VERSION)+' · '+analyticsEsc(new Date().toLocaleString('de-DE'))+'</p><table>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+analyticsEsc(v)+'</td>').join('')+'</tr>').join('')+'</table><p class="meta">Datenqualitätsstatus: '+analyticsEsc((view.models||[]).map(m=>m.period.label+' '+m.period.quality.status).join(' | '))+'</p></body></html>';const win=window.open('','_blank');if(!win)throw new Error('Druckfenster wurde vom Browser blockiert.');win.document.write(html);win.document.close();win.focus();setTimeout(()=>win.print(),150);
}
