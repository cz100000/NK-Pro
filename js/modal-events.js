document.addEventListener("click", function (event) {
  const modal = document.getElementById("costSelectionModal");
  if (modal && !modal.hidden && event.target === modal) closeCostSelectionDialog();
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeCostSelectionDialog();
});
