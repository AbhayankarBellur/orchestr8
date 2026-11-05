import { getTool, listTools } from "../tools/tool.registry.js";

export function getTools(req, res) {
  res.json({ success: true, data: listTools() });
}

export async function createPdfReport(req, res, next) {
  try {
    const input = req.body;
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return res.status(400).json({ success: false, error: "Project data object required" });
    }
    const tool = getTool("pdf_generator");
    const result = await tool.execute(input);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function createDashboard(req, res, next) {
  try {
    const input = req.body;
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return res.status(400).json({ success: false, error: "Project data object required" });
    }
    const tool = getTool("dashboard_generator");
    const result = await tool.execute(input);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}
