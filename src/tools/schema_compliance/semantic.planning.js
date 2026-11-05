function checkCycle(tasks) {
  const adj = new Map(tasks.map(t => [t.id, t.dependencies || []]));
  const visited = new Set(), rec = new Set();
  function dfs(n) {
    if (rec.has(n)) return true;
    if (visited.has(n)) return false;
    rec.add(n);
    for (const dep of (adj.get(n) || [])) if (adj.has(dep) && dfs(dep)) return true;
    rec.delete(n);
    visited.add(n);
    return false;
  }
  return tasks.some(t => !visited.has(t.id) && dfs(t.id));
}

export function validatePlanningSemantics(data) {
  const violations = [], tasks = data?.tasks || [];
  const seen = new Set(), allIds = new Set(tasks.map(t => t.id));
  tasks.forEach((t, i) => {
    if (seen.has(t.id)) violations.push({ code: "DUPLICATE_TASK_ID", field: `/tasks/${i}/id`, message: `Duplicate task id: ${t.id}` });
    seen.add(t.id);
    (t.dependencies || []).forEach(dep => {
      if (!allIds.has(dep)) violations.push({ code: "UNKNOWN_DEPENDENCY", field: `/tasks/${i}/dependencies`, message: `Unknown dependency: ${dep}` });
      if (dep === t.id) violations.push({ code: "SELF_DEPENDENCY", field: `/tasks/${i}/dependencies`, message: `Task cannot depend on itself: ${t.id}` });
    });
  });
  if (checkCycle(tasks)) violations.push({ code: "CIRCULAR_DEPENDENCY", field: "/tasks", message: "Circular dependency detected" });
  const ord = data?.execution_order;
  const validOrder = Array.isArray(ord) && ord.length === tasks.length && new Set(ord).size === tasks.length && tasks.every(t => ord.includes(t.id));
  if (!validOrder) violations.push({ code: "INVALID_EXECUTION_ORDER", field: "/execution_order", message: "Execution order must contain each task id exactly once" });
  return violations;
}
