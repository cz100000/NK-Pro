(function(global) {
  "use strict";

  // NK-Pro: one accounting amount, optional contextual metadata. The metadata
  // never affects the accounting result and is saved on the existing tenant.
  const MODES = Object.freeze(["kurz","jahr","jahr-text","frei"]);
  const DEFAULT_MODE = "kurz";
  const validYear = value => /^\d{4}$/.test(String(value || "")) && Number(value) >= 1900 && Number(value) <= 2100;
  const truncate = (value,limit) => String(value == null ? "" : value).trim().slice(0,limit);

  function read(tenant) {
    const source = tenant && tenant.nkKorrekturDetails && typeof tenant.nkKorrekturDetails === "object" &&
      !Array.isArray(tenant.nkKorrekturDetails) ? tenant.nkKorrekturDetails : {};
    return {
      bezugsjahr:validYear(source.bezugsjahr) ? String(source.bezugsjahr) : "",
      grund:truncate(source.grund,400),
      briefmodus:MODES.includes(source.briefmodus) ? source.briefmodus : DEFAULT_MODE,
      brieftext:truncate(source.brieftext,140)
    };
  }

  function forNewCorrection(billingYear) {
    return {
      bezugsjahr:validYear(billingYear) ? String(billingYear) : "",
      grund:"",
      briefmodus:DEFAULT_MODE,
      brieftext:""
    };
  }

  function printLabel(tenant, correction) {
    const metadata = read(tenant);
    const base = Number(correction) < -0.004 ? "Korrektur / Nachbelastung Nebenkosten" : "Korrektur / Gutschrift Nebenkosten";
    if (metadata.briefmodus === "frei") return metadata.brieftext || base;
    if (metadata.briefmodus === "kurz") return base;
    const year = metadata.bezugsjahr ? " · " + metadata.bezugsjahr : "";
    if (metadata.briefmodus === "jahr") return base + year;
    return base + year + (metadata.brieftext ? " · " + metadata.brieftext : "");
  }

  global.NKProNkCorrections = Object.freeze({
    modes:MODES, validYear, read, forNewCorrection, printLabel
  });
})(globalThis);
