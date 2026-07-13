(function(global) {
  "use strict";

  let structureAudit = null;
  let uiArchitecture = null;
  let startup = null;
  let compatibility = Object.freeze([]);

  function setStructureAudit(report) { structureAudit = report || null; return structureAudit; }
  function setUiArchitecture(report) { uiArchitecture = report || null; return uiArchitecture; }
  function setStartup(report) { startup = report || null; return startup; }
  function setCompatibility(report) {
    compatibility = Object.freeze(Array.isArray(report) ? report.slice() : []);
    return compatibility;
  }
  function snapshot() {
    return Object.freeze({ structureAudit, uiArchitecture, startup, compatibility });
  }

  global.NKProRuntimeDiagnostics = Object.freeze({
    setStructureAudit,
    setUiArchitecture,
    setStartup,
    setCompatibility,
    snapshot
  });
})(globalThis);
