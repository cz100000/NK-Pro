"use strict";

// AP12: Datei-, Download-, Import- und Zurücksetzabläufe.
// ===== Bereich: Import, Export und Sicherung =====
async function importLegacyBillingFiles(ev) {
  const input = ev.target;
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Import ist nur im ursprünglichen Arbeitsfenster möglich.");
    if (input) input.value = "";
    return;
  }
  const files = Array.from(input.files || []);
  if (!files.length) return;
  const entries = [];
  const failedFiles = [];
  let archiveJsonImports = 0;
  const archiveJsonItems = [];
  for (const file of files) {
    try {
      const name = file.name || "";
      if (/\.json$/i.test(name)) {
        const json = parseJsonFileText(await file.text());
        if (Array.isArray(json)) json.forEach(e => entries.push(e));
        else if (Array.isArray(json.legacyEinzelabrechnungen)) json.legacyEinzelabrechnungen.forEach(e => entries.push(e));
        else if (json.summary && json.data) {
          const prepared = NK_PRO_MODULES.archiveActions.prepareItem(json);
          const validation = NK_PRO_MODULES.archiveActions.validateItem(prepared);
          if (validation.errors.length) throw new Error("Archivdatensatz ungültig: " + validation.errors.join(" "));
          archiveJsonItems.push(prepared);
          archiveJsonImports++;
          continue;
        }
        else throw new Error("JSON-Format wurde nicht als Archiv oder Einzelabrechnung erkannt.");
      } else {
        const text = decodeLegacyArrayBuffer(await file.arrayBuffer());
        const entry = parseLegacyBillingFromText(text, name);
        if (entry) entries.push(entry);
        else failedFiles.push((name || "Unbenannte Datei") + ": kein bekanntes Abrechnungsformat erkannt");
      }
    } catch(e) {
      console.warn("Importdatei konnte nicht gelesen werden", file && file.name, e);
      failedFiles.push(((file && file.name) || "Unbenannte Datei") + ": " + String(e && (e.message || e.name) || e));
    }
  }
  input.value = "";
  if (!entries.length) {
    if (archiveJsonImports) {
      const msg = archiveJsonImports + " Archivdatensatz/Archivdatensätze importieren?" + backupStatusHint(backupStatusReport());
      if (!confirm(msg)) return;
      const execution = NK_PRO_MODULES.applicationActions.execute("archive", "importItems", [archiveJsonItems]);
      const result = execution.value;
      if (result && result.message) alert(result.message);
      if (result && result.changed) switchToTab(result.targetTab || "archiv");
      return;
    }
    alert("Es konnten keine Abrechnungen erkannt werden. Bitte nur DOC/TXT/HTML-Dateien im bekannten Abrechnungsformat oder ein JSON mit Einzelabrechnungen importieren." + (failedFiles.length ? "\n\nDetails:\n- " + failedFiles.slice(0, 6).join("\n- ") : ""));
    return;
  }
  const item = NK_PRO_MODULES.archiveActions.createLegacyArchiveItem(entries);
  const saldo = NK_PRO_MODULES.archiveActions.recordSaldo(item);
  const label = NK_PRO_MODULES.archiveActions.periodLabel(item);
  const msg = entries.length + " Einzelabrechnung(en) als Archivsatz " + item.year + " / " + label + " importieren?\n\nSaldo: " + (saldo >= 0 ? "Nachzahlung " : "Guthaben ") + fmtMoney(Math.abs(saldo)) + backupStatusHint(backupStatusReport()) + (archiveJsonImports ? "\n\nZusätzlich wurden " + archiveJsonImports + " Archiv-JSON-Datensatz/Datensätze erkannt." : "") + (failedFiles.length ? "\n\nNicht importiert:\n- " + failedFiles.slice(0, 6).join("\n- ") : "");
  if (!confirm(msg)) return;
  const execution = NK_PRO_MODULES.applicationActions.execute("archive", "importItems", [archiveJsonItems.concat([item])]);
  const result = execution.value;
  if (result && result.message) alert(result.message);
  if (result && result.changed) switchToTab(result.targetTab || "archiv");
}

function safeFilePart(...args) { return NK_PRO_MODULES.exportService.safeFilePart(...args); }

function downloadJsonFile(...args) { return NK_PRO_MODULES.exportService.downloadJsonFile(...args); }

function downloadFullJson(...args) { return NK_PRO_MODULES.exportService.downloadFullJson(...args); }

function downloadCurrentBillingJson(...args) { return NK_PRO_MODULES.exportService.downloadCurrentBillingJson(...args); }

function downloadKostenCsv(...args) { return NK_PRO_MODULES.exportService.downloadKostenCsv(...args); }
function downloadMieterCsv(...args) { return NK_PRO_MODULES.exportService.downloadMieterCsv(...args); }


function txtFileName(...args) { return NK_PRO_MODULES.exportService.txtFileName(...args); }

function downloadUmlageCsv(...args) { return NK_PRO_MODULES.exportService.downloadUmlageCsv(...args); }


function downloadFinalBillingReport(...args) { return NK_PRO_MODULES.exportService.downloadFinalBillingReport(...args); }


function downloadExportPackage(...args) { return NK_PRO_MODULES.exportService.downloadExportPackage(...args); }

function downloadFullExportPackage(...args) { return NK_PRO_MODULES.exportService.downloadFullExportPackage(...args); }

function resetData() {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Zurücksetzen ist nur im ursprünglichen Arbeitsfenster möglich.");
    return;
  }
  if (!confirmRiskyDataAction("Gesamtdaten zurücksetzen", "Wirklich auf die Ausgangsdaten zurücksetzen? Lokale Änderungen gehen verloren.")) return;
  try {
    NK_PRO_MODULES.persistence.removeStoredData([STORAGE_KEY, STORAGE_RECOVERY_KEY], persistenceModuleOptions());
  } catch(e) {
    notifyStorageProblem("Der lokale Speicher konnte beim Zurücksetzen nicht geleert werden.", e);
  }
  replaceApplicationState(normalizeLegacyData(clone(SEED)));
  commitStateChange({ reason:"Benutzereingabe" });
}

async function importJsonFile(ev) {
  const input = ev.target;
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. JSON-Import ist nur im ursprünglichen Arbeitsfenster möglich.");
    if (input) input.value = "";
    return;
  }
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsedFile = parseJsonFileText(text);
    let parsed = parsedFile;
    let importedBackupEnvelope = null;
    if (parsedFile && parsedFile.snapshotFormat === NK_PRO_MODULES.billingSnapshot.BILLING_SNAPSHOT_FORMAT) {
      const snapshotValidation = validateBillingSnapshot(parsedFile);
      if (!snapshotValidation.valid) throw new Error("Abrechnungssnapshot ist ungültig: " + snapshotValidation.errors.map(item => item.message).join(" "));
      parsed = clone(parsedFile.data);
      if (!parsed.meta) parsed.meta = {};
      parsed.meta.importedFromBillingSnapshotId = parsedFile.snapshotId;
    } else if (parsedFile && parsedFile.format === NK_PRO_MODULES.backupRecovery.BACKUP_FORMAT) {
      const envelopeValidation = NK_PRO_MODULES.backupRecovery.validateBackupEnvelope(parsedFile, backupRecoveryModuleOptions());
      if (!envelopeValidation.valid) throw new Error("Sicherungshülle ist ungültig: " + envelopeValidation.errors.join(" "));
      importedBackupEnvelope = parsedFile;
      parsed = NK_PRO_MODULES.backupRecovery.restoreBackupEnvelope(parsedFile, backupRecoveryModuleOptions({
        validateData:(data) => validateMigrationData(data, { phase:"beforeMigration" })
      }));
    }
    const report = importValidationReport(parsed);
    if (report.errors.length) throw new Error(report.errors.join("\n"));
    const nextState = importAppData(parsed, file.name || "");
    const summary = importSummaryText(nextState, file.name || "", report);
    const restoreNotice = importedBackupEnvelope
      ? "\n\nValidierte Sicherung: " + importedBackupEnvelope.metadata.backupId + ". Der aktuelle Arbeitsstand wird vorher als Restore-Checkpoint gesichert."
      : "";
    if (!confirm(summary + restoreNotice + "\n\nDer aktuelle lokale Arbeitsstand wird ersetzt." + backupStatusHint(backupStatusReport()) + "\n\nImport wirklich durchführen?")) return;
    ensurePreMigrationBackup(parsed, { reason:"Migration eines importierten JSON-Datenstands", sourceStorageKey:file.name || "external-json" });
    if (importedBackupEnvelope) createRestoreCheckpoint("Checkpoint vor Restore aus externer Sicherung " + importedBackupEnvelope.metadata.backupId);
    replaceApplicationState(nextState);
    const saved = commitStateChange({ reason:importedBackupEnvelope ? "Restore aus externer Sicherung" : "Benutzereingabe" });
    alert(saved
      ? (importedBackupEnvelope ? "Sicherung wurde validiert, auf den aktuellen Stand migriert und wiederhergestellt." : "Daten wurden importiert und gespeichert.")
      : "Daten wurden geladen, konnten aber nicht im Browser-Speicher gespeichert werden. Bitte sofort eine JSON-Sicherung herunterladen.");
  } catch(e) {
    console.warn("NK-Pro: JSON-Import fehlgeschlagen", e);
    alert("Die Datei konnte nicht importiert werden.\n\n" + String(e && (e.message || e.name) || e));
  } finally {
    input.value = "";
  }
}

function handleDeleteBillingKey(key) {
  if (key === "Enter") confirmDeleteBilling();
  if (key === "Escape") closeDeleteBillingModal();
}

