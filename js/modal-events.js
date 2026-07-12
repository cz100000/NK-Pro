(function(global) {
  "use strict";
  let listenerCount = 0;

  document.addEventListener("click", function (event) {
    const modal = document.getElementById("costSelectionModal");
    if (!modal || modal.hidden || event.target !== modal) return;
    if (global.NKProUiController && global.NKProUiController.hasAction("cost.closeSelectionDialog")) {
      global.NKProUiController.dispatch("cost.closeSelectionDialog", { event, element:modal });
    }
  });
  listenerCount += 1;

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (global.NKProUiController && global.NKProUiController.hasAction("cost.closeSelectionDialog")) {
      global.NKProUiController.dispatch("cost.closeSelectionDialog", { event, element:event.target });
    }
  });
  listenerCount += 1;

  global.NKProModalEvents = Object.freeze({ describe:() => Object.freeze({ listenerCount }) });
})(globalThis);
