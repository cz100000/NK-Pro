"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("AP12-Startfolge, Controller und Ereignisdelegation sind idempotent", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const beforeControllers = NK_PRO_MODULES.uiController.describe();
    const beforeEvents = NK_PRO_MODULES.uiEvents.describe();
    const beforeCompatibility = NK_PRO_MODULES.runtimeDiagnostics.snapshot().compatibility;
    const registration = registerUiControllers();
    const events = startUiEvents();
    const afterControllers = NK_PRO_MODULES.uiController.describe();
    const afterEvents = NK_PRO_MODULES.uiEvents.describe();
    const startup = NK_PRO_MODULES.runtimeDiagnostics.snapshot().startup;
    return {
      startup:{ ok:startup.ok, completed:[...startup.completed] },
      controllerCountBefore:beforeControllers.length,
      controllerCountAfter:afterControllers.length,
      actionCountBefore:beforeControllers.reduce((sum, item) => sum + item.actionCount, 0),
      actionCountAfter:afterControllers.reduce((sum, item) => sum + item.actionCount, 0),
      eventBefore:{ started:beforeEvents.started, listenerCount:beforeEvents.listenerCount, eventTypes:[...beforeEvents.eventTypes] },
      eventAfter:{ started:afterEvents.started, listenerCount:afterEvents.listenerCount, eventTypes:[...afterEvents.eventTypes] },
      registrationRegistered:registration.registered,
      eventStartReturned:events.started,
      compatibilityCount:beforeCompatibility.reduce((sum, item) => sum + item.wrapperCount, 0),
      activeSections:document.querySelectorAll("section.tab.active").length,
      errors:JSON.parse(JSON.stringify(renderErrors || []))
    };
  });

  expect(result.startup.ok).toBe(true);
  expect(result.startup.completed).toEqual([
    "Kernmodule konfigurieren", "Arbeitszustand laden", "Zustandszugriff konfigurieren",
    "Anwendungsaktionen konfigurieren", "Navigation konfigurieren", "UI-Controller registrieren",
    "UI-Ereignisse registrieren", "Kompatibilität registrieren", "Arbeitsstand vorbereiten",
    "Erste Darstellung", "Navigation initialisieren", "Arbeitsbereiche schließen",
    "Seitenköpfe aktualisieren", "Übersichtskarten aktualisieren", "Strukturprüfung",
    "UI-Architekturprüfung"
  ]);
  expect(result.controllerCountBefore).toBe(13);
  expect(result.controllerCountAfter).toBe(13);
  expect(result.actionCountBefore).toBe(104);
  expect(result.actionCountAfter).toBe(104);
  expect(result.eventBefore).toEqual({ started:true, listenerCount:5, eventTypes:["click", "change", "input", "submit", "keydown"] });
  expect(result.eventAfter).toEqual(result.eventBefore);
  expect(result.registrationRegistered).toBe(true);
  expect(result.eventStartReturned).toBe(true);
  expect(result.compatibilityCount).toBe(75);
  expect(result.activeSections).toBe(1);
  expect(result.errors).toEqual([]);
  runtime.assertClean();
});
