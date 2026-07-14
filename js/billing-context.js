(function (global) {
  "use strict";

  const preferences = global.NKProUiPreferences;
  if (!preferences) throw new Error("NK-Pro UI-Einstellungsspeicher fehlt für den Abrechnungskontext.");

  const MODES = Object.freeze({ CLOSED:"closed", EDIT:"edit", VIEW:"view" });
  const LAST_STEP_STORAGE_KEY = "nkpro.billingLastSteps.v1";
  const VALID_STEPS = Object.freeze(["mieter","einstellungen","einnahmen","manuellewerte","verbraeuche","umlage","vorauszahlungsanpassung","qualitaet","briefe","export"]);
  const WRITE_ACTIONS = Object.freeze([
    "application.save","application.reset","state.setNested",
    "object.addMasterTenancy","object.applyMasterDataToBilling","object.archiveMasterTenancy","object.restoreMasterTenancy","object.setBillingUnitStatus","object.setMasterNested",
    "cost.configureFree","cost.setSetting","cost.openPriceEditor","cost.savePriceFromDialog","cost.resetPriceFromDialog","cost.openSelectionDialog","cost.createFreeRow","cost.deactivateSelected","cost.toggleAllRows","cost.toggleRowSelection","cost.toggleAllVisibleRows","cost.activateDefaultPrepayments","cost.deactivateAllPrepayments","cost.setTenantAllowed","cost.activateFromDialog",
    "billing.createFromModal","billing.confirmDelete","billing.finalize","billing.unlock","billing.setYear","billing.setPeriod","billing.resetAllocationInputs","billing.setManualInputMode","billing.setManualExternalValue","billing.setPrepaymentValue","billing.setPrepaymentAdjustmentSetting",
    "meter.setWaterValue","meter.setGenericValue","meter.setWaterSetting",
    "document.setBriefSetting","document.refreshBrief",
    "archive.reopenForRework","archive.currentYear","archive.deleteAt","archive.importItems",
    "yearTransition.createBilling","yearTransition.prepareNextYear",
    "quality.acknowledgeIssue","quality.reopenIssue",
    "recovery.importLegacy","recovery.importJson","recovery.restorePreMigration","recovery.rollbackLastRestore"
  ]);
  const WRITE_ACTION_SET = new Set(WRITE_ACTIONS);
  let context = closedContext();
  let dirty = false;
  let configured = false;
  let onChange = null;

  function closedContext() {
    return Object.freeze({ mode:MODES.CLOSED, recordKey:"", recordType:"", archiveIndex:null, openedAt:"", label:"" });
  }

  function normalizeMode(mode) {
    return mode === MODES.VIEW ? MODES.VIEW : (mode === MODES.EDIT ? MODES.EDIT : MODES.CLOSED);
  }

  function configure(options = {}) {
    onChange = typeof options.onChange === "function" ? options.onChange : null;
    configured = true;
    return describe();
  }

  function notify() {
    if (onChange) {
      try { onChange(snapshot()); } catch (error) { if (global.console && console.warn) console.warn("Abrechnungskontext-Aktualisierung fehlgeschlagen", error); }
    }
  }

  function open(record = {}, mode = MODES.EDIT) {
    const normalizedMode = normalizeMode(mode);
    if (normalizedMode === MODES.CLOSED) throw new Error("Eine Abrechnung kann nicht im geschlossenen Modus geöffnet werden.");
    const recordKey = String(record.recordKey || "").trim();
    if (!recordKey) throw new Error("Der Abrechnungskontext benötigt eine stabile Datensatzkennung.");
    context = Object.freeze({
      mode:normalizedMode,
      recordKey,
      recordType:String(record.recordType || "current"),
      archiveIndex:Number.isInteger(record.archiveIndex) ? record.archiveIndex : null,
      openedAt:new Date().toISOString(),
      label:String(record.label || "")
    });
    dirty = false;
    notify();
    return snapshot();
  }

  function close() {
    context = closedContext();
    dirty = false;
    notify();
    return snapshot();
  }

  function switchMode(mode) {
    if (!isOpen()) throw new Error("Es ist keine Abrechnung geöffnet.");
    const normalizedMode = normalizeMode(mode);
    if (normalizedMode === MODES.CLOSED) return close();
    context = Object.freeze({ ...context, mode:normalizedMode });
    dirty = false;
    notify();
    return snapshot();
  }

  function isOpen() { return context.mode !== MODES.CLOSED; }
  function isEditing() { return context.mode === MODES.EDIT; }
  function isReadOnly() { return context.mode === MODES.VIEW; }
  function modeLabel() { return isReadOnly() ? "Nur ansehen" : (isEditing() ? "Bearbeiten" : "Keine Abrechnung geöffnet"); }
  function snapshot() { return Object.freeze({ ...context, dirty }); }

  function readLastSteps() {
    try {
      const parsed = JSON.parse(preferences.get(LAST_STEP_STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) { return {}; }
  }

  function lastStep(recordKey = context.recordKey) {
    const value = readLastSteps()[String(recordKey || "")];
    return VALID_STEPS.includes(value) ? value : "";
  }

  function rememberStep(tabId, recordKey = context.recordKey) {
    const step = String(tabId || "");
    const key = String(recordKey || "");
    if (!key || !VALID_STEPS.includes(step)) return false;
    const values = readLastSteps();
    values[key] = step;
    preferences.set(LAST_STEP_STORAGE_KEY, JSON.stringify(values));
    return true;
  }

  function markDirty(value = true) {
    if (!isEditing()) return false;
    dirty = !!value;
    notify();
    return dirty;
  }

  function clearDirty() { dirty = false; notify(); return false; }
  function hasUnsavedChanges() { return !!dirty; }
  function isWriteAction(actionName) { return WRITE_ACTION_SET.has(String(actionName || "")); }

  function assertWritable(actionLabel) {
    if (!isReadOnly()) return true;
    const error = new Error("Diese Abrechnung ist im Ansichtsmodus geöffnet und kann nicht geändert werden.");
    error.code = "NKPRO_BILLING_READONLY";
    error.actionLabel = String(actionLabel || "");
    throw error;
  }

  function allowUiAction(actionName) {
    if (!isReadOnly() || !isWriteAction(actionName)) return true;
    return false;
  }

  function allowApplicationAction(domain, action) {
    const actionName = String(domain || "") + "." + String(action || "");
    if (!isReadOnly() || !isWriteAction(actionName)) return true;
    assertWritable(actionName);
    return false;
  }


  function installDomGuards() {
    if (!global.document || document.documentElement.dataset.billingContextGuards === "true") return;
    document.documentElement.dataset.billingContextGuards = "true";
    document.addEventListener("keydown", event => {
      if (!isReadOnly() || !(event.ctrlKey || event.metaKey) || String(event.key || "").toLowerCase() !== "s") return;
      event.preventDefault();
      global.alert("Diese Abrechnung ist im Ansichtsmodus geöffnet und kann nicht geändert werden.");
    }, true);
    document.addEventListener("input", event => {
      if (!isEditing()) return;
      const target=event.target;
      if (!target || typeof target.closest !== "function" || !target.closest("section.tab.active")) return;
      const page=target.closest("section.tab");
      if (page && VALID_STEPS.includes(page.id)) markDirty(true);
    }, true);
    global.addEventListener("beforeunload", event => {
      if (!hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue="";
    });
  }

  function describe() {
    return Object.freeze({
      configured,
      states:Object.freeze([MODES.CLOSED, MODES.EDIT, MODES.VIEW]),
      stateCount:3,
      writeActionCount:WRITE_ACTIONS.length,
      validStepCount:VALID_STEPS.length,
      context:snapshot()
    });
  }

  installDomGuards();

  global.NKProBillingContext = Object.freeze({
    MODES, VALID_STEPS, WRITE_ACTIONS,
    configure, open, close, switchMode, snapshot, describe,
    isOpen, isEditing, isReadOnly, modeLabel,
    lastStep, rememberStep, markDirty, clearDirty, hasUnsavedChanges,
    isWriteAction, allowUiAction, allowApplicationAction, assertWritable
  });
})(globalThis);
