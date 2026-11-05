export function renderBlockersAndRisks(doc, data) {
  doc.fontSize(14).fillColor("#0F172A").text("3. Blockers & Risks");
  doc.moveDown(0.4);

  const blockers = Array.isArray(data.blockers) ? data.blockers : [];
  doc.fontSize(11).fillColor("#DC2626").text("Active Blockers:");
  if (blockers.length === 0) {
    doc.fontSize(10).fillColor("#64748B").text("  No active blockers reported.");
  } else {
    blockers.forEach(b => {
      doc.fontSize(10).fillColor("#1E293B").text(`  - [${b.task_id || "N/A"}] ${b.description || "No description"}`);
      if (b.impact) doc.fontSize(9).fillColor("#64748B").text(`    Impact: ${b.impact}`);
    });
  }
  doc.moveDown(0.8);

  const risks = Array.isArray(data.risks) ? data.risks : [];
  doc.fontSize(11).fillColor("#D97706").text("Identified Risks:");
  if (risks.length === 0) {
    doc.fontSize(10).fillColor("#64748B").text("  No significant risks identified.");
  } else {
    risks.forEach(r => {
      const title = typeof r === "string" ? r : r.risk || "Risk";
      const sev = typeof r === "object" && r.severity ? `[${r.severity.toUpperCase()}]` : "";
      doc.fontSize(10).fillColor("#1E293B").text(`  - ${sev} ${title}`);
      if (r.evidence) doc.fontSize(9).fillColor("#64748B").text(`    Evidence: ${r.evidence}`);
    });
  }
  doc.moveDown(1);
}
