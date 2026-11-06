import { getStatus, getCatalogTools, runDiscovery } from "../services/mcp.service.js";

export function getTaskosStatus(req, res) {
  res.json({ success: true, data: getStatus() });
}

export function getTaskosTools(req, res) {
  const tools = getCatalogTools();
  res.json({ success: true, count: tools.length, data: tools });
}

export async function discoverTaskos(req, res, next) {
  try {
    const result = await runDiscovery();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
