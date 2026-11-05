import { escapeHtml } from "./dashboard.escape.js";

export function renderBlockersHtml(blockers = []) {
  if (!blockers.length) return '<div class="item" style="color:#64748B">No active blockers</div>';
  return blockers.map(b => `<div class="item">
    <strong>[${escapeHtml(b.task_id || "N/A")}]</strong> ${escapeHtml(b.description || "")}
    ${b.impact ? `<div class="meta">Impact: ${escapeHtml(b.impact)}</div>` : ""}
  </div>`).join("");
}

export function renderRisksHtml(risks = []) {
  if (!risks.length) return '<div class="item" style="color:#64748B">No significant risks</div>';
  return risks.map(r => {
    const sev = typeof r === "object" && r.severity ? escapeHtml(r.severity) : "medium";
    const text = typeof r === "string" ? escapeHtml(r) : escapeHtml(r.risk || "");
    const ev = typeof r === "object" && r.evidence ? `<div class="meta">Evidence: ${escapeHtml(r.evidence)}</div>` : "";
    return `<div class="item"><span class="badge badge-amber">${sev.toUpperCase()}</span> ${text}${ev}</div>`;
  }).join("");
}

export function renderTasksHtml(tasks = []) {
  if (!tasks.length) return '<div class="item" style="color:#64748B">No tasks planned</div>';
  return tasks.map(t => {
    const p = (t.priority || "Medium").toLowerCase();
    const cls = p === "high" ? "badge-red" : p === "medium" ? "badge-amber" : "badge-blue";
    const deps = t.dependencies?.length ? `<span class="meta">Deps: ${t.dependencies.map(escapeHtml).join(", ")}</span>` : "";
    return `<div class="item">
      <span class="badge ${cls}">${escapeHtml(t.priority || "Medium")}</span>
      <strong>${escapeHtml(t.id || "")}</strong>: ${escapeHtml(t.title || "")} ${deps}
    </div>`;
  }).join("");
}
