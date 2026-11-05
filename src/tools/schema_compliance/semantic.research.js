export function validateResearchSemantics(data, input) {
  const violations = [];
  const m = data?.task_metrics;
  if (m) {
    const sum = (m.completed ?? 0) + (m.in_progress ?? 0) + (m.blocked ?? 0) + (m.not_started ?? 0);
    if (sum !== m.total) {
      violations.push({
        code: "INVALID_METRICS_TOTAL",
        field: "/task_metrics",
        message: "Task metric breakdown must sum to total"
      });
    }
    const exp = m.total > 0 ? (m.completed / m.total) * 100 : 0;
    if (typeof m.completion_percent === "number" && (m.completion_percent < 0 || m.completion_percent > 100 || Math.abs(m.completion_percent - exp) > 1.0)) {
      violations.push({
        code: "INVALID_COMPLETION_PERCENTAGE",
        field: "/task_metrics/completion_percent",
        message: "Completion percentage inconsistent with completed/total"
      });
    }
  }
  if (Array.isArray(input?.tasks) && Array.isArray(data?.blockers)) {
    const valid = new Set(input.tasks.map(t => String(t.id ?? t.task_id)));
    data.blockers.forEach((b, i) => {
      if (b?.task_id && !valid.has(String(b.task_id))) {
        violations.push({
          code: "UNKNOWN_BLOCKER_TASK",
          field: `/blockers/${i}/task_id`,
          message: `Unknown blocker task ID: ${b.task_id}`
        });
      }
    });
  }
  if (Array.isArray(data?.risks)) {
    data.risks.forEach((r, i) => {
      if (!r?.evidence || typeof r.evidence !== "string" || !r.evidence.trim()) {
        violations.push({
          code: "EMPTY_RISK_EVIDENCE",
          field: `/risks/${i}/evidence`,
          message: "Risk evidence must be non-empty"
        });
      }
    });
  }
  return violations;
}
