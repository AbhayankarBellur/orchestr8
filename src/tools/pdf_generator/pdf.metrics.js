export function renderMetrics(doc, data) {
  const m = data.task_metrics || {};
  const total = m.total ?? 0;
  const completed = m.completed ?? 0;
  const inProgress = m.in_progress ?? 0;
  const blocked = m.blocked ?? 0;
  const notStarted = m.not_started ?? 0;
  const pct = m.completion_percent ?? (total > 0 ? Math.round((completed / total) * 100) : 0);

  doc.fontSize(14).fillColor("#0F172A").text("2. Task Completion & Metrics");
  doc.moveDown(0.4);

  doc.fontSize(10).fillColor("#1E293B").text(`Overall Completion: ${pct}%`);
  doc.rect(50, doc.y + 4, 300, 10).fill("#E2E8F0");
  if (pct > 0) doc.rect(50, doc.y + 4, Math.min(300, Math.round((pct / 100) * 300)), 10).fill("#10B981");
  doc.moveDown(1.2);

  doc.fontSize(10).fillColor("#334155");
  doc.text(`Total Tasks: ${total}    |    Completed: ${completed}    |    In Progress: ${inProgress}`);
  doc.text(`Blocked: ${blocked}    |    Not Started: ${notStarted}`);
  doc.moveDown(1);
}
