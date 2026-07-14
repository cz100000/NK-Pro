"use strict";

// AP12: Archiv-, Sicherungs-, Diagnose- und Legacy-Importansichten.
function localStorageUsageBytes() {
  return NK_PRO_MODULES.persistence.totalStorageUsageBytes(persistenceModuleOptions());
}

function developerDiagnosticsData() {
  const integrity = validateStoredDataIntegrity(state);
  const recoveryRaw = NK_PRO_MODULES.persistence.rawStorageValue(STORAGE_RECOVERY_KEY, persistenceModuleOptions());
  const preMigrationBackup = readPreMigrationBackupResult();
  const restoreCheckpoint = readRestoreCheckpointResult();
  return NK_PRO_MODULES.diagnostics.developerSnapshot({
    app:{ version:APP_VERSION, name:APP_VERSION_NAME, releaseDate:APP_RELEASE_DATE, schema:DATA_SCHEMA_VERSION },
    browser:{ userAgent:navigator.userAgent, online:navigator.onLine, language:navigator.language, viewport:window.innerWidth + "x" + window.innerHeight, protocol:location.protocol, serviceWorkerSupported:"serviceWorker" in navigator, serviceWorkerControlled:!!(navigator.serviceWorker && navigator.serviceWorker.controller) },
    storage:{ writable:storageWritable(), bytes:localStorageUsageBytes(), protected:!!integrity.protected, valid:!!integrity.valid, reason:integrity.reason || "", recoveryAvailable:!!recoveryRaw, recoveryBytes:jsonByteLength(recoveryRaw), preMigrationBackupAvailable:!!preMigrationBackup.valid, preMigrationBackupId:preMigrationBackup.valid ? preMigrationBackup.envelope.metadata.backupId : "", restoreCheckpointAvailable:!!restoreCheckpoint.valid },
    rendering:{ renderCount, lastDurationMs:renderLastDurationMs, lastActiveTab:renderLastActiveTab, preparationCount:statePreparationCount, inProgress:renderInProgress, queued:renderQueued, errors:Array.isArray(renderErrors) ? renderErrors.slice(-10) : [] },
    billing:{ year:currentAbrechnungsjahr(), period:periodLabelShort(), active:NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling(), finalized:NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized(), archiveCount:Array.isArray(state.jahresArchiv) ? state.jahresArchiv.length : 0 }
  });
}



function renderDeveloperDiagnostics() {
  const host = document.getElementById("sicherung");
  if (!host) return;
  let el = document.getElementById("developerDiagnosticsBox");
  if (!el) {
    el = document.createElement("div");
    el.id = "developerDiagnosticsBox";
    const versionBox = document.getElementById("versionBox");
    if (versionBox && versionBox.parentNode) versionBox.insertAdjacentElement("afterend", el);
    else host.appendChild(el);
  }
  const d = developerDiagnosticsData();
  const renderErrorText = d.rendering.errors.length ? d.rendering.errors.map(e => (e.area || "Bereich") + ": " + (e.message || "Fehler")).join("\n") : "Keine Renderfehler protokolliert.";
  el.className = "developer-diagnostics";
  el.innerHTML = '<details><summary>Entwicklerdiagnose</summary>' +
    '<div class="small">Technische Laufzeitinformationen. Dieser Bereich verändert keine Abrechnungsdaten.</div>' +
    '<div class="developer-grid">' +
      '<div class="developer-pill"><strong>Version</strong><br>' + escapeHtml(d.app.version + " · " + d.app.name) + '<br><span class="small">Schema ' + escapeHtml(d.app.schema) + '</span></div>' +
      '<div class="developer-pill"><strong>Speicher</strong><br>' + escapeHtml(NK_PRO_MODULES.diagnostics.formatBytes(d.storage.bytes)) + '<br><span class="small">' + escapeHtml(d.storage.reason) + '</span></div>' +
      '<div class="developer-pill"><strong>Rückfallstand</strong><br>' + (d.storage.recoveryAvailable ? "vorhanden" : "nicht vorhanden") + '<br><span class="small">' + escapeHtml(NK_PRO_MODULES.diagnostics.formatBytes(d.storage.recoveryBytes)) + '</span></div>' +
      '<div class="developer-pill"><strong>Rendering</strong><br>' + escapeHtml(String(d.rendering.lastDurationMs)) + ' ms zuletzt<br><span class="small">' + escapeHtml(String(d.rendering.renderCount)) + ' Läufe</span></div>' +
      '<div class="developer-pill"><strong>Service Worker</strong><br>' + (d.browser.serviceWorkerControlled ? "aktiv" : (d.browser.serviceWorkerSupported ? "registrierbar" : "nicht unterstützt")) + '<br><span class="small">' + escapeHtml(d.browser.protocol) + '</span></div>' +
      '<div class="developer-pill"><strong>Verbindung</strong><br>' + (d.browser.online ? "online" : "offline") + '<br><span class="small">' + escapeHtml(d.browser.viewport) + '</span></div>' +
    '</div>' +
    '<div class="developer-actions">' +
      '<button type="button" data-ui-action="system.renderDiagnostics">Diagnose aktualisieren</button>' +
      '<button type="button" data-ui-action="system.runSelfTest">App-Selbsttest</button>' +
      '<button type="button" data-ui-action="system.downloadDiagnostics">Diagnose-JSON herunterladen</button>' +
      '<button type="button" data-ui-action="system.checkUpdate">Nach Update suchen</button>' +
      '<button type="button" class="secondary" data-ui-action="system.reload">App neu laden</button>' +
    '</div>' +
    '<h4>Letzte Renderfehler</h4><div class="developer-log">' + escapeHtml(renderErrorText) + '</div>' +
    '</details>';
}

function downloadDeveloperDiagnostics() {
  const data = developerDiagnosticsData();
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  download("NK-Pro_" + APP_VERSION.replace(/[^A-Za-z0-9._-]/g,"_") + "_Diagnose_" + stamp + ".json", JSON.stringify(data, null, 2), "application/json;charset=utf-8");
}

async function checkForAppUpdate() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    alert("Die Update-Prüfung ist nur in der veröffentlichten HTTPS-App verfügbar.");
    return;
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration("./");
    if (!registration) {
      alert("Der Service Worker ist noch nicht registriert. Bitte die App einmal neu laden.");
      return;
    }
    await registration.update();
    alert(registration.waiting || registration.installing ? "Eine neue Version wird vorbereitet. Bitte die App anschließend neu laden." : "Update-Prüfung abgeschlossen. Aktuell wurde keine neue bereitstehende Version erkannt.");
  } catch(error) {
    alert("Update-Prüfung fehlgeschlagen: " + errorMessage(error));
  }
}

function renderSicherung() {
  renderBackupStatus();
  renderVersionInfo();
  renderDeveloperDiagnostics();
}

function buildArchiveTableHtml(withLoadButton) {
  ensureYearData();
  const rows = state.jahresArchiv.length ? state.jahresArchiv.map((a,i) => {
    const saldo = NK_PRO_MODULES.archiveActions.recordSaldo(a);
    const period = NK_PRO_MODULES.archiveActions.periodLabel(a);
    const actions = archiveActionButtonsHtml(i, {open:!!withLoadButton, primaryOpen:true, openLabel:"In neuem Fenster öffnen", download:true});
    return '<tr><td>' + escapeHtml(a.year) + '</td><td>' + escapeHtml(period) + '</td><td>' + escapeHtml(dateDe(a.archivedAt)) + '</td><td>' + archiveStatusBadgeHtml(a) + '</td><td>' + (a.summary ? a.summary.mietverhaeltnisse : "–") + '</td><td>' + fmtMoney(a.summary ? a.summary.kostenNK : 0) + '</td><td>' + fmtMoney(a.summary ? a.summary.vorauszahlungen : 0) + '</td><td>' + (saldo >= 0 ? "Nachzahlung " : "Guthaben ") + fmtMoney(Math.abs(saldo)) + '</td><td>' + actions + '</td></tr>';
  }).join("") : '<tr><td colspan="9">Noch kein Abrechnungsjahr archiviert.</td></tr>';
  return '<thead><tr><th>Jahr</th><th>Periode</th><th>Archiviert am</th><th>Status</th><th>Miet-/Einzelabrechnungen</th><th>Umlagefähige Kosten</th><th>Vorauszahlungen</th><th>Saldo</th><th>Aktion</th></tr></thead><tbody>' + rows + '</tbody>';
}

function replaceArchiveViewerPart(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(label);
  return html.replace(pattern, replacement);
}

function createArchiveViewerHtml(item) {
  const archiveItem = NK_PRO_MODULES.archiveActions.prepareItem(item);
  const validation = NK_PRO_MODULES.archiveActions.validateItem(archiveItem);
  if (validation.errors.length) throw new Error("Archivdatensatz ist unvollständig: " + validation.errors.join(" "));

  const viewerState = normalizeLegacyData(clone(archiveItem.data || {}), { scope:ARCHIVE_SNAPSHOT_SCOPE });
  if (!viewerState.meta) viewerState.meta = {};
  viewerState.meta.archiveViewer = true;
  viewerState.meta.archivedAt = archiveItem.archivedAt || "";
  viewerState.meta.archivedYear = archiveItem.year || "";
  viewerState.meta.archiveReturnUrl = window.location && window.location.href ? window.location.href : "";
  viewerState.meta.dataSchemaVersion = DATA_SCHEMA_VERSION;
  viewerState.meta.dataLayerRole = "archiveViewerRuntime";
  viewerState.jahresArchiv = [];
  viewerState.waterMeterHistory = clone(state.waterMeterHistory || DEFAULT_WATER_METER_HISTORY);
  ensureWaterMeterHistory(viewerState);
  NK_PRO_MODULES.masterDataActions.ensureStammdatenData(viewerState);

  let viewerHtml = APP_HTML_TEMPLATE || ("<!DOCTYPE html>\n" + document.documentElement.outerHTML);
  const seedJson = JSON.stringify(viewerState).replace(/</g, "\\u003c");
  viewerHtml = replaceArchiveViewerPart(viewerHtml, /const SEED = [\s\S]*?;\s*const APP_VERSION/, "const SEED = " + seedJson + ";\nconst APP_VERSION", "Archivdaten konnten nicht in die Archivansicht eingesetzt werden.");
  viewerHtml = replaceArchiveViewerPart(viewerHtml, /const STORAGE_KEY = "[^"]*";/, 'const STORAGE_KEY = "nkpro_archive_view_' + String(archiveItem.year || "jahr").replace(/\\W/g, "_") + '_' + Date.now() + '";', "Archiv-Speicherbereich konnte nicht isoliert werden.");
  viewerHtml = viewerHtml.replace(/const LEGACY_STORAGE_KEYS = \[[^\]]*\];/, "const LEGACY_STORAGE_KEYS = [];");
  viewerHtml = viewerHtml.replace(/NK-Pro Webbrowserseite V51/g, "NK-Pro Archivansicht V51");
  const safeArchiveYear = escapeHtml(archiveItem.year || "");
  viewerHtml = viewerHtml.replace(/<title>(.*?)<\/title>/, "<title>Archivierte NK-Abrechnung " + safeArchiveYear + "</title>");
  return viewerHtml;
}



function openArchiveStateInApp(item, index) {
  const viewerState = NK_PRO_MODULES.archiveActions.viewerStateFromItem(item);
  if (!archiveReturnState) archiveReturnState = clone(state);
  replaceApplicationState(viewerState);
  pendingStorageWarning = "";
  renderErrors = [];
  const key = archiveBillingRecordKey(item, Number(index));
  NK_PRO_MODULES.billingContext.open({ recordKey:key, recordType:"archive", archiveIndex:Number(index), label:periodLabelShort() }, NK_PRO_MODULES.billingContext.MODES.VIEW);
  document.documentElement.dataset.billingExplicitlyOpened="true";
  renderAll();
  billingContextOpen = true;
  enterBillingMode(validBillingTarget(key));
  setActionMessage("Archivierte Abrechnung nur zur Ansicht geöffnet: " + periodLabelShort());
  renderActionFeedback();
}
function archiveViewerFileName(item) {
  const raw = String((item && item.year) || "archiv").trim() || "archiv";
  const safe = raw.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "archiv";
  return "NK-Pro_Archivansicht_" + safe + ".html";
}

function openArchiveViewerDocument(viewerHtml, item) {
  let objectUrl = "";
  try {
    const blob = new Blob([viewerHtml], { type:"text/html;charset=utf-8" });
    objectUrl = URL.createObjectURL(blob);
    const win = window.open(objectUrl, "_blank");
    if (win) {
      if (win.focus) win.focus();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      return true;
    }
    URL.revokeObjectURL(objectUrl);
    objectUrl = "";
  } catch(e) {
    console.warn("Archivfenster konnte nicht per Blob geöffnet werden", e);
    if (objectUrl) {
      try { URL.revokeObjectURL(objectUrl); } catch(revokeError) {}
    }
  }

  try {
    document.open();
    document.write(viewerHtml);
    document.close();
    return true;
  } catch(e) {
    console.warn("Archivansicht konnte nicht im aktuellen Fenster geöffnet werden", e);
  }

  const filename = archiveViewerFileName(item);
  if (download(filename, viewerHtml, "text/html;charset=utf-8")) {
    alert("Das Archivfenster konnte nicht geöffnet werden. Die Abrechnung wurde deshalb als HTML-Datei vorbereitet: " + filename);
    return true;
  }
  alert("Die Archivansicht konnte nicht geöffnet werden. Bitte Browser-Berechtigungen und Pop-up-Einstellungen prüfen.");
  return false;
}
function openArchiveYear(index) {
  if (NK_PRO_MODULES.billingContext.isOpen() && !prepareBillingContextSwitch()) return;
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) {
    alert("Diese archivierte Abrechnung wurde nicht gefunden.");
    return;
  }

  try {
    openArchiveStateInApp(item, index);
  } catch(e) {
    console.warn("Archivansicht konnte nicht vorbereitet werden", e);
    alert("Die Archivansicht konnte nicht vorbereitet werden.\n" + String(e && (e.message || e) || "Unbekannter Fehler"));
  }
}

// Rückwärtskompatibler Alias: Archiv wird nicht mehr im Arbeitsfenster geladen.



function loadArchiveYear(index) {
  openArchiveYear(index);
}








function hasEnteredMeterValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}































function renderPrepaymentCarryForwardNotice() {
  const el = document.getElementById("prepaymentCarryForwardNotice");
  if (!el) return;
  const info = state.meta && state.meta.prepaymentCarryForward;
  if (!info) {
    el.innerHTML = '<div class="hint"><strong>Vorjahresübernahme:</strong> Beim Anlegen einer neuen Abrechnung werden NK-Vorauszahlungen aus der Vorjahresabrechnung übernommen, sofern der Mieter dort abgerechnet wurde.</div>';
    return;
  }
  const warnings = Array.isArray(info.warnings) ? info.warnings : [];
  const cls = warnings.length ? "hint feedback-box warn" : "hint feedback-box";
  const source = info.sourceYear ? " aus " + escapeHtml(info.sourceYear) : "";
  const detail = (num(info.copied) || num(info.adjusted)) ? (escapeHtml(info.copied || 0) + " Werte übernommen" + (num(info.adjusted) ? ", davon " + escapeHtml(info.adjusted) + " mit Vorauszahlungsanpassung" : "")) : "keine Werte übernommen";
  el.innerHTML = '<div class="' + cls + '"><strong>Vorjahresübernahme NK-Vorauszahlungen' + source + ':</strong> ' + detail + '.' + (warnings.length ? '<ul>' + warnings.slice(0,8).map(w => '<li>' + escapeHtml(w) + '</li>').join('') + (warnings.length > 8 ? '<li>Weitere Hinweise vorhanden.</li>' : '') + '</ul>' : '') + '</div>';
}




















function downloadArchiveYear(index) {
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) {
    alert("Dieser Archivdatensatz wurde nicht gefunden. Bitte die Archivliste neu laden oder die Qualitätsprüfung öffnen.");
    return;
  }
  const validation = NK_PRO_MODULES.archiveActions.validateItem(item);
  if ((validation.errors.length || validation.warnings.length) && !confirm("Dieser Archivdatensatz enthält Prüfhinweise:\n" + NK_PRO_MODULES.archiveActions.validationMessage(validation) + "\n\nTrotzdem als JSON herunterladen?")) return;
  let downloadItem = item;
  try { downloadItem = NK_PRO_MODULES.archiveActions.prepareItem(item); } catch(error) { console.warn("Archivdatensatz wird unnormalisiert heruntergeladen", error); }
  const filename = backupFileName("nk-pro-archiv", { meta:{ abrechnungsjahr:(downloadItem.year || item.year || "jahr") } });
  if (downloadJsonFile(filename, downloadItem)) registerBackupEvent("archive-year", filename);
}

function downloadFullArchive() {
  ensureYearData();
  if (!state.jahresArchiv.length) {
    alert("Es gibt noch keine archivierten Abrechnungen zum Herunterladen.");
    return;
  }
  const problemRows = state.jahresArchiv.map((item, index) => ({ item, index, validation:NK_PRO_MODULES.archiveActions.validateItem(item) })).filter(row => row.validation.errors.length || row.validation.warnings.length);
  if (problemRows.length) {
    const preview = problemRows.slice(0, 5).map(row => NK_PRO_MODULES.archiveActions.itemLabel(row.item, row.index) + ": " + NK_PRO_MODULES.archiveActions.validationMessage(row.validation).replace(/\n/g, " ")).join("\n");
    if (!confirm("Das Archiv enthält " + problemRows.length + " Datensatz/Datensätze mit Prüfhinweisen.\n\n" + preview + (problemRows.length > 5 ? "\n..." : "") + "\n\nTrotzdem gesamtes Archiv herunterladen?")) return;
  }
  const exportArchive = state.jahresArchiv.map(item => {
    try { return NK_PRO_MODULES.archiveActions.prepareItem(item); } catch(error) { console.warn("Archivdatensatz wird unnormalisiert exportiert", error, item); return item; }
  });
  const filename = backupFileName("nk-pro-jahresarchiv", { meta:{ abrechnungsjahr:currentAbrechnungsjahr() } });
  if (downloadJsonFile(filename, exportArchive)) registerBackupEvent("year-archive", filename);
}

function renderYearArchive() {
  const cardsEl = document.getElementById("yearCards");
  const settingsEl = document.getElementById("yearSettings");
  const tableEl = document.getElementById("yearArchiveTable");
  if (!cardsEl || !settingsEl || !tableEl) return;

  const year = currentAbrechnungsjahr();
  const nextYear = NK_PRO_MODULES.archiveActions.yearNumber(year) + 1;
  const archiveCount = state.jahresArchiv.length;
  const last = state.jahresArchiv[0];

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("wasser");

  settingsEl.innerHTML =
    '<label class="small"><strong>Aktuelles Abrechnungsjahr</strong><br><input value="' + escapeHtml(year) + '"' + uiActionAttributes("billing.setYear", ["$value"], "change") + '></label>' +
    '<label class="small"><strong>Beginn</strong><br><input type="date" value="' + escapeHtml(periodStart()) + '"' + uiActionAttributes("billing.setPeriod", ["abrechnungsbeginn","$value"], "change") + '></label>' +
    '<label class="small"><strong>Ende</strong><br><input type="date" value="' + escapeHtml(periodEnd()) + '"' + uiActionAttributes("billing.setPeriod", ["abrechnungsende","$value"], "change") + '></label>' +
    '<button class="primary" data-ui-action="billing.openLatestYear">Aktuelles/letztes Arbeitsjahr öffnen</button>' +
    '<button data-ui-action="archive.currentYear">Aktuelles Jahr archivieren</button>' +
    '<button data-ui-action="archive.downloadFull">Jahresarchiv herunterladen</button>';

  tableEl.innerHTML = buildArchiveTableHtml(true);
}


function normalizeLegacyImportText(text) {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]+/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeLegacyArrayBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  const decoderNames = ["utf-8", "windows-1252", "utf-16le"];
  const texts = [];
  decoderNames.forEach(name => {
    try { texts.push(new TextDecoder(name).decode(bytes)); } catch(e) {}
  });
  let ascii = "";
  for (let i=0; i<bytes.length; i++) ascii += (bytes[i] >= 32 && bytes[i] <= 126) ? String.fromCharCode(bytes[i]) : "\n";
  texts.push(ascii);
  return normalizeLegacyImportText(texts.join("\n"));
}

function firstMatch(text, regex, group) {
  const m = String(text || "").match(regex);
  return m ? (m[group || 1] || "").trim() : "";
}

function parseEuroFromText(value) {
  const text = String(value || "").replace(/€/g, "").replace(/\s+/g, "").replace(/^-$/, "0");
  if (!text || text === "-") return 0;
  return num(text);
}

function legacyMoneyValues(text) {
  const vals = [];
  String(text || "").replace(/-?\s*(?:\d{1,3}(?:\.\d{3})*|\d+),\d{2}|-\s*€/g, m => { vals.push(parseEuroFromText(m)); return m; });
  return vals;
}

function legacySlice(text, startLabel, endLabels) {
  const src = String(text || "");
  const start = src.toLowerCase().indexOf(String(startLabel || "").toLowerCase());
  if (start < 0) return "";
  let end = src.length;
  (endLabels || []).forEach(label => {
    const idx = src.toLowerCase().indexOf(String(label || "").toLowerCase(), start + String(startLabel || "").length);
    if (idx >= 0 && idx < end) end = idx;
  });
  return src.slice(start, end);
}

function parseLegacyLastMoneyInWindow(text, startLabel, endLabels) {
  const vals = legacyMoneyValues(legacySlice(text, startLabel, endLabels));
  return vals.length ? vals[vals.length - 1] : 0;
}

function parseLegacyMoneyAfter(text, label) {
  const vals = legacyMoneyValues(legacySlice(text, label, ["\n"]));
  if (vals.length) return vals[vals.length - 1];
  const safe = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(safe + "[\\s\\S]{0,220}?(-?\\s*\\d{1,3}(?:\\.\\d{3})*,\\d{2}|-\\s*€|-)", "i");
  return parseEuroFromText(firstMatch(text, re, 1));
}

function parseLegacyPeriodAfter(text, label) {
  const safe = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return firstMatch(text, new RegExp(safe + "\\s+(\\d{2}\\.\\d{2}\\.\\d{2}\\s*-\\s*\\d{2}\\.\\d{2}\\.\\d{2})", "i"), 1).replace(/\s+/g, "");
}

function nameFromLegacyFilename(filename) {
  const base = String(filename || "").replace(/\.[^.]+$/, "");
  const m = base.match(/\b(Montoya|Melzig|Schneider|Gärtner|Gaertner|Bonesta|Udroiu|Kerner|Lang)\b/i);
  if (!m) return "";
  const map = {montoya:"Janina Montoya", lang:"Janina Montoya", melzig:"Cynthia Melzig", schneider:"Jutta Schneider", "gärtner":"Inna Gärtner", gaertner:"Inna Gärtner", bonesta:"Hatixe Bonesta", udroiu:"Ion Udroiu", kerner:"Waldemar Kerner"};
  return map[m[1].toLowerCase()] || m[1];
}

function wohnungFromLegacyFilename(filename) {
  const m = String(filename || "").match(/\b(0EG-L|0EG-R|1OG-L|1OG-R|2OG-L|2OG-R|EG-L|EG-R|DG-L|DG-R)\b/i);
  return m ? m[1].toUpperCase() : "";
}

function isoFromLegacyShortDate(value) {
  const m = String(value || "").match(/(\d{2})\.(\d{2})\.(\d{2})/);
  if (!m) return "";
  const year = Number(m[3]) >= 70 ? "19" + m[3] : "20" + m[3];
  return year + "-" + m[2] + "-" + m[1];
}

function parseLegacyBillingFromText(text, filename) {
  const clean = normalizeLegacyImportText(text);
  const year = firstMatch(clean, /Jahr\s+(20\d{2})/i, 1) || firstMatch(filename, /(20\d{2})/, 1) || "";
  let name = firstMatch(clean, /(?:Frau|Herr)\s+([A-ZÄÖÜ][^\n]+?)\s+Am Rauhen Biehl/i, 1) || nameFromLegacyFilename(filename);
  if (/^Janina Montoya/i.test(name) || /Lang/i.test(filename || "")) name = "Janina Montoya";
  const wohnung = wohnungFromLegacyFilename(filename);
  let heizPeriod = parseLegacyPeriodAfter(clean, "Ihre Heizkosten");
  const wasserPeriod = parseLegacyPeriodAfter(clean, "Ihre Wasserkosten");
  const abfallPeriod = parseLegacyPeriodAfter(clean, "Ihre Abfallkosten");
  if (!heizPeriod) {
    const fn = String(filename || "");
    if (/01Mai-15NOV|01.?Mai.*15.?NOV/i.test(fn)) heizPeriod = "01.05.22-14.11.22";
    else if (/16NOV-31Dez|16.?NOV.*31.?Dez/i.test(fn)) heizPeriod = "15.11.22-31.12.22";
    else if (/Mai-Dez|Mai.*Dez/i.test(fn)) heizPeriod = "01.05.22-31.12.22";
  }
  const periods = [heizPeriod, wasserPeriod, abfallPeriod].filter(Boolean);
  const start = periods.map(p => isoFromLegacyShortDate(p.split("-")[0])).filter(Boolean).sort()[0] || (year ? year + "-01-01" : "");
  const end = periods.map(p => isoFromLegacyShortDate(p.split("-")[1])).filter(Boolean).sort().slice(-1)[0] || (year ? year + "-12-31" : "");

  let heiz = parseLegacyLastMoneyInWindow(clean, "Ihre Heizkosten", ["Ihre Vorauszahlung", "Ihr Heizkosten", "Ihre Heizkosten-Nachzahlung", "Wasserkosten"]);
  let vHeiz = parseLegacyLastMoneyInWindow(legacySlice(clean, "Heizkosten", ["Wasserkosten"]), "Ihre Vorauszahlung", ["Ihr Heizkosten", "Ihre Heizkosten-Nachzahlung", "Wasserkosten"]);
  const wasser = parseLegacyLastMoneyInWindow(clean, "Ihre Wasserkosten", ["Ihre Vorauszahlung", "Ihr Wasserkosten", "Ihre Wasserkosten-Nachzahlung", "Abfallkosten"]);
  const vWasser = parseLegacyLastMoneyInWindow(legacySlice(clean, "Wasserkosten", ["Abfallkosten"]), "Ihre Vorauszahlung", ["Ihr Wasserkosten", "Ihre Wasserkosten-Nachzahlung", "Abfallkosten"]);
  const abfall = parseLegacyLastMoneyInWindow(clean, "Ihre Abfallkosten", ["Ihre Vorauszahlung", "Ihr Abfallkosten", "Ihre Abfallkosten-Nachzahlung", "Ihr Anteil an den Gesamtkosten"]);
  const vAbfall = parseLegacyLastMoneyInWindow(legacySlice(clean, "Abfallkosten", ["Ihr Anteil an den Gesamtkosten"]), "Ihre Vorauszahlung", ["Ihr Abfallkosten", "Ihre Abfallkosten-Nachzahlung", "Ihr Anteil an den Gesamtkosten"]);
  const kostenanteil = parseLegacyLastMoneyInWindow(clean, "Ihr Anteil an den Gesamtkosten", ["Ihre Vorauszahlung"]) || (heiz + wasser + abfall);
  let vorauszahlung = parseLegacyLastMoneyInWindow(legacySlice(clean, "Ihr Anteil an den Gesamtkosten", ["Ihr Guthaben", "Ihre Nachzahlung an die Vermieterin", "*)"]), "Ihre Vorauszahlung", ["Ihr Guthaben", "Ihre Nachzahlung an die Vermieterin", "*)"]);
  if (!vorauszahlung) vorauszahlung = vHeiz + vWasser + vAbfall;
  if ((!heiz || heiz < 0) && kostenanteil) heiz = Math.round((kostenanteil - wasser - abfall) * 100) / 100;
  if ((!vHeiz || vHeiz < 0) && vorauszahlung) vHeiz = Math.round((vorauszahlung - vWasser - vAbfall) * 100) / 100;
  let saldo = kostenanteil - vorauszahlung;
  const finalNachzahlung = parseLegacyMoneyAfter(clean, "Ihre Nachzahlung an die Vermieterin");
  const finalGuthaben = parseLegacyMoneyAfter(clean, "Ihr Guthaben");
  if (finalNachzahlung) saldo = Math.abs(finalNachzahlung);
  else if (finalGuthaben) saldo = -Math.abs(finalGuthaben);

  if (!name || !kostenanteil) return null;
  return {
    wohnung,
    mieter:name,
    jahr:year,
    periode:(start && end) ? (start + " bis " + end) : "",
    heizPeriode:heizPeriod,
    wasserPeriode:wasserPeriod,
    abfallPeriode:abfallPeriod,
    heizkosten:heiz,
    wasserkosten:wasser,
    abfallkosten:abfall,
    vHeiz: Math.round(vHeiz * 100) / 100,
    vWasser: Math.round(vWasser * 100) / 100,
    vAbfall: Math.round(vAbfall * 100) / 100,
    rundung: Math.round((kostenanteil - heiz - wasser - abfall) * 100) / 100,
    kostenanteil: Math.round(kostenanteil * 100) / 100,
    vorauszahlung: Math.round(vorauszahlung * 100) / 100,
    saldo: Math.round(saldo * 100) / 100,
    briefErgebnis: saldo >= 0 ? "Nachzahlung" : "Guthaben",
    briefBetrag: Math.abs(Math.round(saldo * 100) / 100),
    quelle: filename || ""
  };
}





