import PDFDocument from "pdfkit";
import { resolve } from "node:path";
import { REPORTS_DIR, ensureArtifactDirs, generateArtifactId } from "../../config/artifact.config.js";
import { attachPageNumbers, waitForStream } from "./pdf.stream.js";
import { renderCover } from "./pdf.cover.js";
import { renderMetrics } from "./pdf.metrics.js";
import { renderBlockersAndRisks } from "./pdf.risks.js";
import { renderPlanAndActions } from "./pdf.tasks.js";

export async function generatePdf(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid project data for PDF generation");
  }
  await ensureArtifactDirs();
  const artifactId = generateArtifactId("report");
  const filePath = resolve(REPORTS_DIR, `${artifactId}.pdf`);

  const doc = new PDFDocument({ autoFirstPage: true, bufferPages: true, margin: 50 });
  const streamPromise = waitForStream(doc, filePath);

  renderCover(doc, data, artifactId);
  renderMetrics(doc, data);
  renderBlockersAndRisks(doc, data);
  renderPlanAndActions(doc, data);

  const pageCount = doc.bufferedPageRange().count;
  attachPageNumbers(doc);
  doc.end();

  const fileSize = await streamPromise;
  return {
    tool: "pdf_generator",
    status: "SUCCESS",
    artifactId,
    path: filePath,
    fileSize,
    pageCount,
    metadata: {
      generatedAt: new Date().toISOString(),
      project: data.project_name || data.project || "TaskOS"
    }
  };
}
