import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { DASHBOARDS_DIR, ensureArtifactDirs, generateArtifactId } from "../../config/artifact.config.js";
import { buildDashboardHtml } from "./dashboard.template.js";

export async function generateDashboard(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid project data for dashboard generation");
  }
  await ensureArtifactDirs();
  const artifactId = generateArtifactId("dash");
  const dirPath = resolve(DASHBOARDS_DIR, artifactId);
  await mkdir(dirPath, { recursive: true });

  const htmlPath = resolve(dirPath, "index.html");
  const jsonPath = resolve(dirPath, "data.json");

  const htmlContent = buildDashboardHtml(data, artifactId);
  const jsonContent = JSON.stringify(data, null, 2);

  await Promise.all([
    writeFile(htmlPath, htmlContent, "utf8"),
    writeFile(jsonPath, jsonContent, "utf8")
  ]);

  return {
    tool: "dashboard_generator",
    status: "SUCCESS",
    artifactId,
    paths: {
      directory: dirPath,
      html: htmlPath,
      json: jsonPath
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      project: data.project_name || data.project || "TaskOS"
    }
  };
}
