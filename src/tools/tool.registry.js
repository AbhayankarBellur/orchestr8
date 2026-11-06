import { generatePdf } from "./pdf_generator/pdf.service.js";
import { generateDashboard } from "./dashboard_generator/dashboard.service.js";
import { PDF_INPUT_SCHEMA, DASHBOARD_INPUT_SCHEMA } from "./internal.schemas.js";

export const TOOLS = {
  pdf_generator: {
    name: "pdf_generator",
    version: "1.0.0",
    description: "Generates multi-page PDF execution report with metrics, risks and tasks",
    inputSchema: PDF_INPUT_SCHEMA,
    execute: generatePdf
  },
  dashboard_generator: {
    name: "dashboard_generator",
    version: "1.0.0",
    description: "Generates interactive HTML dashboard with SVG charts and project data JSON",
    inputSchema: DASHBOARD_INPUT_SCHEMA,
    execute: generateDashboard
  }
};

export function listTools() {
  return Object.values(TOOLS).map(t => ({
    name: t.name,
    version: t.version,
    description: t.description,
    inputSchema: t.inputSchema
  }));
}

export function getTool(name) {
  const tool = TOOLS[name];
  if (!tool) throw new Error(`Unknown or unsupported tool: ${name}`);
  return tool;
}
