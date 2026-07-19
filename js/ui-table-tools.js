(function(global) {
  "use strict";

  // DOM-bezogene Tabellen-, Sortier- und Filterhilfen.
  // app.js behält nur kleine globale Kompatibilitätsweiterleitungen.

  function cellSortValue(cell) {
    const input = cell.querySelector("input, select");
    const raw = input ? input.value : cell.textContent;
    const text = String(raw ?? "").trim();
    const numeric = Number(text.replace(/[€\s]/g, "").replace(/\./g, "").replace(",", "."));
    if (text !== "" && !Number.isNaN(numeric)) return { type:"number", value:numeric };
    const dateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) return { type:"number", value:new Date(text).getTime() };
    return { type:"text", value:text.toLocaleLowerCase("de-DE") };
  }

  function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    if (!table || !table.tBodies.length) return;
  
    const current = tableSortState[tableId] || {};
    const direction = current.columnIndex === columnIndex && current.direction === "asc" ? "desc" : "asc";
    tableSortState[tableId] = { columnIndex, direction };
  
    const tbody = table.tBodies[0];
    const allRows = Array.from(tbody.rows);
    const totalRows = allRows.filter(row => row.classList.contains("total-row"));
    const rows = allRows.filter(row => !row.classList.contains("total-row"));
    rows.sort((a,b) => {
      const av = cellSortValue(a.cells[columnIndex] || {});
      const bv = cellSortValue(b.cells[columnIndex] || {});
      let result = 0;
      if (av.type === "number" && bv.type === "number") result = av.value - bv.value;
      else result = String(av.value).localeCompare(String(bv.value), "de-DE", { numeric:true, sensitivity:"base" });
      return direction === "asc" ? result : -result;
    });
    rows.forEach(row => tbody.appendChild(row));
    totalRows.forEach(row => tbody.appendChild(row));
  
    const headers = table.querySelectorAll("thead th");
    headers.forEach((th, idx) => {
      th.classList.remove("sort-asc", "sort-desc");
      if (idx === columnIndex) th.classList.add(direction === "asc" ? "sort-asc" : "sort-desc");
    });
    applyTableFilter(tableId);
  }

  function applyTableFilter(tableId) {
    const table = document.getElementById(tableId);
    if (!table || !table.tBodies.length) return;
    const query = (tableFilters[tableId] || "").toLocaleLowerCase("de-DE").trim();
    Array.from(table.tBodies[0].rows).forEach(row => {
      if (row.classList.contains("total-row")) {
        row.classList.remove("filtered-out");
        return;
      }
      const text = row.textContent.toLocaleLowerCase("de-DE");
      row.classList.toggle("filtered-out", query !== "" && !text.includes(query));
    });
  }

  function clearTableFilter(tableId) {
    tableFilters[tableId] = "";
    const input = document.querySelector('.table-tools[data-table="' + tableId + '"] input');
    if (input) input.value = "";
    applyTableFilter(tableId);
  }

  function ensureTableTools(table) {
    if (!table.id) return;
    const wrap = table.closest(".table-wrap");
    if (!wrap) return;
    let tools = document.querySelector('.table-tools[data-table="' + table.id + '"]');
    if (!tools) {
      tools = document.createElement("div");
      tools.className = "table-tools";
      tools.dataset.table = table.id;
      tools.innerHTML =
        '<input type="search" placeholder="' + (tableLabels[table.id] || "Tabelle") + ' filtern ...">' +
        '<button type="button">Filter löschen</button>' +
        '<span class="small">Spaltenüberschriften anklicken zum Sortieren.</span>';
      wrap.parentNode.insertBefore(tools, wrap);
  
      const input = tools.querySelector("input");
      input.addEventListener("input", () => {
        tableFilters[table.id] = input.value;
        applyTableFilter(table.id);
      });
      tools.querySelector("button").addEventListener("click", () => clearTableFilter(table.id));
    }
    const input = tools.querySelector("input");
    if (input) input.value = tableFilters[table.id] || "";
  }

  function enhanceTables() {
    document.querySelectorAll("table").forEach(table => {
      if (!table.id) return;
      ensureTableTools(table);
  
      const sortable = table.dataset.nkUiSortable !== "false";
      table.querySelectorAll("thead th").forEach((th, idx) => {
        th.classList.toggle("sortable", sortable);
        th.classList.remove("sort-asc", "sort-desc");
        th.onclick = sortable ? () => sortTable(table.id, idx) : null;
      });
  
      const sortState = sortable ? tableSortState[table.id] : null;
      if (sortState && sortState.columnIndex !== undefined) {
        const headers = table.querySelectorAll("thead th");
        headers.forEach((th, idx) => {
          if (idx === sortState.columnIndex) th.classList.add(sortState.direction === "asc" ? "sort-asc" : "sort-desc");
        });
      }
      applyTableFilter(table.id);
    });
  }

  global.NKProUiTableTools = Object.freeze({
    cellSortValue,
    sortTable,
    applyTableFilter,
    clearTableFilter,
    ensureTableTools,
    enhanceTables
  });
})(globalThis);
