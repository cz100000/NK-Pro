"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("Persistenz-, Migrations-, Backup-/Restore- und Archivmodule sind vor app.js geladen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const scripts = [...document.scripts].map(script => new URL(script.src).pathname.split("/").pop());
    const names = ["persistence.js", "migration.js", "backup-recovery.js", "meter-master.js", "meter-readings.js", "meter-periods.js", "meter-validation.js", "object-standard.js", "billing-snapshot.js", "archive.js", "default-seed.js", "app.js"];
    const order = names.map(name => scripts.indexOf(name));
    const snapshot = createYearSnapshot();
    const protectedState = protectDataForStorage(clone(state));
    return {
      order,
      modules:{
        persistence:!!window.NKProPersistence,
        migration:!!window.NKProMigration,
        archive:!!window.NKProArchive,
        backupRecovery:!!window.NKProBackupRecovery,
        meterMaster:!!window.NKProMeterMaster,
        meterReadings:!!window.NKProMeterReadings,
        meterPeriods:!!window.NKProMeterPeriods,
        meterValidation:!!window.NKProMeterValidation,
        objectStandard:!!window.NKProObjectStandard,
        billingSnapshot:!!window.NKProBillingSnapshot
      },
      frozen:{
        persistence:Object.isFrozen(window.NKProPersistence),
        migration:Object.isFrozen(window.NKProMigration),
        archive:Object.isFrozen(window.NKProArchive),
        backupRecovery:Object.isFrozen(window.NKProBackupRecovery),
        meterMaster:Object.isFrozen(window.NKProMeterMaster),
        meterReadings:Object.isFrozen(window.NKProMeterReadings),
        meterPeriods:Object.isFrozen(window.NKProMeterPeriods),
        meterValidation:Object.isFrozen(window.NKProMeterValidation),
        objectStandard:Object.isFrozen(window.NKProObjectStandard),
        billingSnapshot:Object.isFrozen(window.NKProBillingSnapshot)
      },
      compatibility:{
        integrity:validateStoredDataIntegrity(protectedState).valid,
        schema:currentDataSchemaVersion(state),
        bounded:!Object.prototype.hasOwnProperty.call(snapshot.data, "jahresArchiv") &&
          !Object.prototype.hasOwnProperty.call(snapshot.data, "stammdaten") &&
          !Object.prototype.hasOwnProperty.call(snapshot.data, "waterMeterHistory")
      }
    };
  });

  expect(result.modules).toEqual({ persistence:true, migration:true, archive:true, backupRecovery:true, meterMaster:true, meterReadings:true, meterPeriods:true, meterValidation:true, objectStandard:true, billingSnapshot:true });
  expect(result.frozen).toEqual({ persistence:true, migration:true, archive:true, backupRecovery:true, meterMaster:true, meterReadings:true, meterPeriods:true, meterValidation:true, objectStandard:true, billingSnapshot:true });
  expect(result.order.every(index => index >= 0)).toBe(true);
  expect(result.order).toEqual([...result.order].sort((a, b) => a - b));
  expect(result.compatibility).toEqual({ integrity:true, schema:5, bounded:true });
  runtime.assertClean();
});
