import { generatePdf } from "./pdf_generator/pdf.service.js";
import { generateDashboard } from "./dashboard_generator/dashboard.service.js";

export const TOOLS = {
  pdf_generator: {
    name: "pdf_generator",
    version: "1.0.0",
    description: "Generates multi-page PDF execution report with metrics, risks and tasks",
    execute: generatePdf
  },
  dashboard_generator: {
    name: "dashboard_generator",
    version: "1.0.0",
    description: "Generates interactive HTML dashboard with SVG charts and project data JSON",
    execute: generateDashboard
  }
};

export function listTools() {
  return Object.values(TOOLS).map(t => ({
    name: t.name,
    version: t.version,
    description: t.description
  }));
}

export function getTool(name) {
  const tool = TOOLS[name];
  if (!tool) throw new Error(`Unknown or unsupported tool: ${name}`);
  return tool;
}
