(function(global) {
  "use strict";

  function start(steps, options = {}) {
    const completed = [];
    try {
      (Array.isArray(steps) ? steps : []).forEach(step => {
        if (!step || typeof step.run !== "function") return;
        step.run();
        completed.push(String(step.name || "Startschritt"));
      });
      return Object.freeze({ ok:true, completed:Object.freeze(completed.slice()), error:null });
    } catch(error) {
      if (typeof options.onError === "function") options.onError(error, completed.slice());
      if (typeof options.onFallback === "function") {
        try { options.onFallback(error, completed.slice()); } catch(fallbackError) {
          if (typeof options.onFallbackError === "function") options.onFallbackError(fallbackError);
        }
      }
      return Object.freeze({ ok:false, completed:Object.freeze(completed.slice()), error });
    }
  }

  global.NKProAppBootstrap = Object.freeze({ start });
})(globalThis);
