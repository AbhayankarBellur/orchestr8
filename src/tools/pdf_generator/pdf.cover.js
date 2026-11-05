export function renderCover(doc, data, artifactId) {
  doc.rect(50, 45, doc.page.width - 100, 4).fill("#2563EB");
  doc.moveDown(1.5);
  doc.fontSize(22).fillColor("#1E293B").text("Orchestr8 Execution Report", { align: "left" });
  doc.fontSize(12).fillColor("#64748B").text(`Project: ${data.project_name || data.project || "TaskOS"}`, { align: "left" });
  doc.moveDown(0.5);

  doc.fontSize(9).fillColor("#475569");
  doc.text(`Report ID: ${artifactId}   |   Date: ${new Date().toISOString().split("T")[0]}   |   Status: ${data.status || "Active"}`);
  doc.moveDown(1);
  doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(14).fillColor("#0F172A").text("1. Executive Summary");
  doc.moveDown(0.4);
  const summary = data.project_summary || data.summary || "No executive summary provided.";
  doc.fontSize(10).fillColor("#334155").text(summary, { lineGap: 3 });
  doc.moveDown(1);
}
