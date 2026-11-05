export function renderPlanAndActions(doc, data) {
  doc.fontSize(14).fillColor("#0F172A").text("4. Implementation Plan & Execution Actions");
  doc.moveDown(0.4);

  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  if (data.goal) doc.fontSize(10).fillColor("#475569").text(`Goal: ${data.goal}`).moveDown(0.5);

  if (tasks.length === 0) {
    doc.fontSize(10).fillColor("#64748B").text("  No implementation tasks specified.");
  } else {
    tasks.forEach(t => {
      const p = t.priority ? `(${t.priority})` : "";
      const deps = t.dependencies?.length ? `[Deps: ${t.dependencies.join(", ")}]` : "";
      doc.fontSize(10).fillColor("#1E293B").text(`  - ${t.id || "Task"}: ${t.title || "Untitled"} ${p} ${deps}`);
      if (t.description) doc.fontSize(9).fillColor("#64748B").text(`    ${t.description}`);
    });
  }
  doc.moveDown(0.8);

  const actions = Array.isArray(data.actions) ? data.actions : [];
  doc.fontSize(11).fillColor("#0F172A").text("Proposed Actions:");
  if (actions.length === 0) {
    doc.fontSize(10).fillColor("#64748B").text("  No execution actions proposed.");
  } else {
    actions.forEach(a => {
      const appr = a.requires_approval ? "Requires Approval" : "Auto";
      doc.fontSize(10).fillColor("#1E293B").text(`  - ${a.action_id || "Action"} [${a.action_type || "type"}]: ${a.description || ""} (${appr})`);
    });
  }
  doc.moveDown(0.8);

  const plan = Array.isArray(data.verification_plan) ? data.verification_plan : [];
  if (plan.length > 0) {
    doc.fontSize(11).fillColor("#0F172A").text("Verification Checklist:");
    plan.forEach(step => doc.fontSize(9).fillColor("#475569").text(`  [ ] ${step}`));
  }
}
