"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("Persistenz-, Migrations-, Backup-/Restore- und Archivmodule sind vor app.js geladen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const scripts = [...document.scripts].map(script => new URL(script.src).pathname.split("/").pop());
    const names = ["persistence.js", "migration.js", "backup-recovery.js", "archive.js", "default-seed.js", "app.js"];
    const order = names.map(name => scripts.indexOf(name));
    const snapshot = createYearSnapshot();
    const protectedState = protectDataForStorage(clone(state));
    return {
      order,
      modules:{
        persistence:!!window.NKProPersistence,
        migration:!!window.NKProMigration,
        archive:!!window.NKProArchive,
        backupRecovery:!!window.NKProBackupRecovery
      },
      frozen:{
        persistence:Object.isFrozen(window.NKProPersistence),
        migration:Object.isFrozen(window.NKProMigration),
        archive:Object.isFrozen(window.NKProArchive),
        backupRecovery:Object.isFrozen(window.NKProBackupRecovery)
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

  expect(result.modules).toEqual({ persistence:true, migration:true, archive:true, backupRecovery:true });
  expect(result.frozen).toEqual({ persistence:true, migration:true, archive:true, backupRecovery:true });
  expect(result.order.every(index => index >= 0)).toBe(true);
  expect(result.order).toEqual([...result.order].sort((a, b) => a - b));
  expect(result.compatibility).toEqual({ integrity:true, schema:5, bounded:true });
  runtime.assertClean();
});
