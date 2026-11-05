import { DASHBOARD_CSS } from "./dashboard.styles.js";
import { escapeHtml } from "./dashboard.escape.js";
import { renderStatusSvg, renderProgressGauge } from "./dashboard.svg.js";
import { renderBlockersHtml, renderRisksHtml, renderTasksHtml } from "./dashboard.sections.js";

export function buildDashboardHtml(data, artifactId) {
  const m = data.task_metrics || {};
  const total = m.total || 0, comp = m.completed || 0;
  const pct = m.completion_percent ?? (total > 0 ? Math.round((comp / total) * 100) : 0);
  const proj = escapeHtml(data.project_name || data.project || "TaskOS");
  const sum = escapeHtml(data.project_summary || data.summary || "No summary");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard - ${proj}</title><style>${DASHBOARD_CSS}</style></head>
<body><div class="container">
  <div class="header">
    <h1>${proj} Project Dashboard</h1>
    <div class="meta">Artifact: ${escapeHtml(artifactId)} | Date: ${new Date().toISOString().split("T")[0]} | Status: ${escapeHtml(data.status || "Active")}</div>
    <p style="margin-top:10px;font-size:14px;color:#475569">${sum}</p>
  </div>
  <div class="grid">
    <div class="card" style="display:flex;align-items:center;gap:18px">
      ${renderProgressGauge(pct)}
      <div><h2>Overall Progress</h2><div class="meta">${comp} of ${total} tasks complete</div></div>
    </div>
    <div class="card">
      <h2>Task Status Breakdown</h2>
      ${renderStatusSvg(m)}
      <div class="legend">
        <span><span class="dot" style="background:#10B981"></span>Comp: ${comp}</span>
        <span><span class="dot" style="background:#3B82F6"></span>Prog: ${m.in_progress || 0}</span>
        <span><span class="dot" style="background:#EF4444"></span>Block: ${m.blocked || 0}</span>
        <span><span class="dot" style="background:#94A3B8"></span>Not: ${m.not_started || 0}</span>
      </div>
    </div>
  </div>
  <div class="grid">
    <div class="card"><h2>Blockers</h2>${renderBlockersHtml(data.blockers)}</div>
    <div class="card"><h2>Risks</h2>${renderRisksHtml(data.risks)}</div>
  </div>
  <div class="card"><h2>Implementation Tasks</h2>${renderTasksHtml(data.tasks)}</div>
</div></body></html>`;
}
