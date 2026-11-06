import { fetchExecutions } from "./api.js";

export function initHistory(onSelect) {
  fetchExecutions().then(list => {
    const sel = document.getElementById("exec-select");
    if (!sel || !list.length) return;
    sel.innerHTML = '<option value="">History...</option>' + list.map(id => `<option value="${id}">${id}</option>`).join("");
    sel.onchange = () => { if (sel.value) onSelect(sel.value); };
  });
}
